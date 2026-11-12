import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./CertificateModal.css";

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const STEP = 1.5;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* A4 landscape, A4 portrait, square, panoramic … every certificate shape is fitted
   completely inside the viewer — nothing is ever cropped or stretched. */
export default function CertificateModal({ items, index, onClose, onIndex }) {
  const N = items.length;
  const item = items[index];

  const [closing, setClosing] = useState(false);
  const [natural, setNatural] = useState(null); // { w, h } of the loaded image
  const [box, setBox] = useState({ w: 0, h: 0 }); // available stage size
  const [zoom, setZoom] = useState(1); // for the % label only

  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const closeRef = useRef(null);
  const g = useRef({ s: 1, x: 0, y: 0, pts: new Map(), d0: 0, s0: 1, panX: 0, panY: 0, sx: 0, sy: 0, moved: 0, lastTap: 0 });
  const fitRef = useRef({ w: 0, h: 0 });

  /* ---------- fit the whole certificate inside the stage ---------- */
  const fit = (() => {
    if (!natural || !box.w || !box.h) return { w: 0, h: 0 };
    const pad = box.w < 700 ? 8 : 24;
    const k = Math.min((box.w - pad * 2) / natural.w, (box.h - pad * 2) / natural.h, 3);
    return { w: Math.round(natural.w * k), h: Math.round(natural.h * k) };
  })();
  fitRef.current = fit;

  useEffect(() => {
    const el = stageRef.current;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  /* ---------- transform helpers ---------- */
  const apply = useCallback((animate = false) => {
    const el = imgRef.current;
    if (!el) return;
    const { s, x, y } = g.current;
    el.style.transition = animate ? "transform 0.35s cubic-bezier(0.16,1,0.3,1)" : "none";
    el.style.transform = `translate3d(${x}px,${y}px,0) scale(${s})`;
    setZoom((prev) => (Math.abs(prev - s) > 0.005 ? s : prev));
  }, []);

  const clampPan = useCallback(() => {
    const st = stageRef.current;
    if (!st) return;
    const { s } = g.current;
    const maxX = Math.max(0, (fitRef.current.w * s - st.clientWidth) / 2 + 24);
    const maxY = Math.max(0, (fitRef.current.h * s - st.clientHeight) / 2 + 24);
    g.current.x = clamp(g.current.x, -maxX, maxX);
    g.current.y = clamp(g.current.y, -maxY, maxY);
  }, []);

  const reset = useCallback(
    (animate = false) => {
      Object.assign(g.current, { s: 1, x: 0, y: 0 });
      apply(animate);
    },
    [apply]
  );

  /* zoom around the stage centre (buttons / keys) or a point (double-tap) */
  const zoomTo = useCallback(
    (next, cx, cy, animate = true) => {
      const st = stageRef.current;
      const r = st.getBoundingClientRect();
      const px = (cx ?? r.left + r.width / 2) - (r.left + r.width / 2);
      const py = (cy ?? r.top + r.height / 2) - (r.top + r.height / 2);
      const s0 = g.current.s;
      const s1 = clamp(next, MIN_SCALE, MAX_SCALE);
      g.current.x = px - ((px - g.current.x) / s0) * s1;
      g.current.y = py - ((py - g.current.y) / s0) * s1;
      g.current.s = s1;
      if (s1 <= 1.001) g.current.x = g.current.y = 0;
      clampPan();
      apply(animate);
    },
    [apply, clampPan]
  );

  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onClose(index), 260);
  }, [closing, onClose, index]);

  const go = useCallback((dir) => onIndex((index + dir + N) % N), [index, N, onIndex]);

  /* ---------- new certificate: reset + preload neighbours ---------- */
  useEffect(() => {
    setNatural(null);
    reset(false);
    [-1, 1].forEach((d) => {
      const im = new Image();
      im.src = items[(index + d + N) % N].src;
    });
  }, [index, items, N, reset]);

  /* keep the zoom valid when the window is resized */
  useEffect(() => {
    clampPan();
    apply(false);
  }, [box, natural, clampPan, apply]);

  /* ---------- keyboard / scroll lock / focus ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "+" || e.key === "=") zoomTo(g.current.s * STEP);
      else if (e.key === "-" || e.key === "_") zoomTo(g.current.s / STEP);
      else if (e.key === "0") reset(true);
    };
    window.addEventListener("keydown", onKey);
    const html = document.documentElement.style.overflow;
    const body = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = html;
      document.body.style.overflow = body;
    };
  }, [close, go, zoomTo, reset]);

  /* ---------- wheel: NEVER zooms by itself.
     Ctrl/⌘ + wheel (also trackpad pinch) zooms; plain wheel pans when already zoomed. ---------- */
  useEffect(() => {
    const el = stageRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomTo(g.current.s * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY, false);
      } else if (g.current.s > 1.01) {
        g.current.x -= e.deltaX;
        g.current.y -= e.deltaY;
        clampPan();
        apply(false);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomTo, clampPan, apply]);

  /* ---------- pointer: pinch, pan, swipe, double-tap ---------- */
  const onDown = (e) => {
    const s = g.current;
    stageRef.current.setPointerCapture(e.pointerId);
    s.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    s.moved = 0;
    if (s.pts.size === 2) {
      const [a, b] = [...s.pts.values()];
      s.d0 = Math.hypot(a.x - b.x, a.y - b.y);
      s.s0 = s.s;
    } else {
      s.sx = e.clientX;
      s.sy = e.clientY;
      s.panX = s.x;
      s.panY = s.y;
    }
  };
  const onMove = (e) => {
    const s = g.current;
    if (!s.pts.has(e.pointerId)) return;
    s.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (s.pts.size === 2) {
      const [a, b] = [...s.pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      s.s = clamp(s.s0 * (d / s.d0), MIN_SCALE, MAX_SCALE);
      if (s.s <= 1.001) s.x = s.y = 0;
      clampPan();
      apply(false);
      s.moved = 99;
    } else if (s.pts.size === 1) {
      const dx = e.clientX - s.sx;
      const dy = e.clientY - s.sy;
      s.moved = Math.max(s.moved, Math.hypot(dx, dy));
      if (s.s > 1.02) {
        s.x = s.panX + dx;
        s.y = s.panY + dy;
        clampPan();
        apply(false);
      }
    }
  };
  const onUp = (e) => {
    const s = g.current;
    if (!s.pts.has(e.pointerId)) return;
    const wasSingle = s.pts.size === 1;
    s.pts.delete(e.pointerId);
    if (s.pts.size === 1) {
      const [p] = [...s.pts.values()];
      s.sx = p.x;
      s.sy = p.y;
      s.panX = s.x;
      s.panY = s.y;
    }
    if (!wasSingle) return;

    const dx = e.clientX - s.sx;
    const dy = e.clientY - s.sy;

    if (s.s <= 1.02) {
      reset(true);
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        go(dx < 0 ? 1 : -1); // swipe to change certificate
        return;
      }
    }
    if (s.moved < 8) {
      const now = performance.now();
      if (now - s.lastTap < 320) {
        if (s.s > 1.02) reset(true);
        else zoomTo(2.5, e.clientX, e.clientY);
        s.lastTap = 0;
      } else s.lastTap = now;
    }
  };

  if (!item) return null;
  const zoomed = zoom > 1.02;

  return createPortal(
    <div
      className={`cm-overlay ${closing ? "is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="cm-glow" aria-hidden="true" />

      {/* ---------- top bar ---------- */}
      <header className="cm-top">
        <div className="cm-meta">
          <span className="cm-title">{item.title}</span>
          <span className="cm-count">
            {String(index + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </span>
        </div>
        <div className="cm-actions">
          <a className="cm-pill cm-open" href={item.src} target="_blank" rel="noreferrer" aria-label="Open original in a new tab">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
            <span>ORIGINAL</span>
          </a>
          <button ref={closeRef} className="cm-round" onClick={close} aria-label="Close viewer">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </header>

      {/* ---------- stage ---------- */}
      <div
        className={`cm-stage ${zoomed ? "is-zoomed" : ""}`}
        ref={stageRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {!natural && <div className="cm-loader" aria-hidden="true" />}
        <img
          key={item.src}
          ref={imgRef}
          className={`cm-img ${natural ? "is-ready" : ""}`}
          src={item.src}
          alt={item.title}
          draggable="false"
          style={natural ? { width: fit.w, height: fit.h } : undefined}
          onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        />

        <button className="cm-side cm-prev" onClick={() => go(-1)} aria-label="Previous certificate">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button className="cm-side cm-next" onClick={() => go(1)} aria-label="Next certificate">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ---------- bottom bar: navigation + zoom ---------- */}
      <footer className="cm-bar">
        <button className="cm-round cm-bar-nav" onClick={() => go(-1)} aria-label="Previous certificate">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="cm-zoom" role="group" aria-label="Zoom">
          <button onClick={() => zoomTo(g.current.s / STEP)} disabled={zoom <= 1.001} aria-label="Zoom out">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14" />
            </svg>
          </button>
          <button className="cm-zoom-val" onClick={() => reset(true)} aria-label="Fit to screen">
            {zoomed ? `${Math.round(zoom * 100)}%` : "FIT"}
          </button>
          <button onClick={() => zoomTo(g.current.s * STEP)} disabled={zoom >= MAX_SCALE - 0.001} aria-label="Zoom in">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <button className="cm-round cm-bar-nav" onClick={() => go(1)} aria-label="Next certificate">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </footer>
      <p className="cm-tip">Whole certificate shown · pinch or Ctrl + scroll to zoom · double-tap to zoom · ← → to change</p>
    </div>,
    document.body
  );
}