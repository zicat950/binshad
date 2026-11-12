import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import "./CertificateGallery.css";

/* cards per second the gallery drifts right → left on its own */
const AUTO_SPEED = 0.22;
/* how long auto-motion waits after the visitor interacts (ms) */
const IDLE_DELAY = 1600;

const wrapIndex = (i, n) => ((i % n) + n) % n;

const CertificateGallery = forwardRef(function CertificateGallery({ items, onOpen }, ref) {
  const N = items.length;

  const stageRef = useRef(null);
  const camRef = useRef(null);
  const cardRefs = useRef([]);
  const dimRefs = useRef([]);
  const frameRefs = useRef([]);
  const ratios = useRef([]); // natural width / height of every loaded certificate
  const barRef = useRef(null);

  /* all per-frame state lives in a ref so React never re-renders at 60fps */
  const st = useRef({
    pos: -7, // starts shifted right so cards sweep in from the right
    target: 0,
    enter: 0,
    playing: true,
    dragging: false,
    visible: true,
    idleUntil: 0,
    mx: 0,
    my: 0,
    tmx: 0,
    tmy: 0,
    active: -1,
    vis: [],
    layout: null,
    drag: null,
  });

  const [playing, setPlaying] = useState(true);
  const [active, setActive] = useState(0);
  /* only images near the active card get a src → keeps 36+ hi‑res files light */
  const [allowed, setAllowed] = useState(() => new Set());

  const allowAround = useCallback(
    (center) => {
      const range = window.innerWidth < 700 ? 6 : 9;
      setAllowed((prev) => {
        const next = new Set(prev);
        for (let d = -range; d <= range; d++) next.add(wrapIndex(center + d, N));
        return next.size === prev.size ? prev : next;
      });
    },
    [N]
  );

  const touch = () => {
    st.current.idleUntil = performance.now() + IDLE_DELAY;
  };

  /* ---------- imperative API used by the page ---------- */
  useImperativeHandle(
    ref,
    () => ({
      /* scroll-driven movement: positive = right → left */
      nudge(cards) {
        st.current.target += cards;
        touch();
      },
      goTo(index) {
        const s = st.current;
        const cur = Math.round(s.target);
        let diff = wrapIndex(index - cur, N);
        if (diff > N / 2) diff -= N;
        s.target = cur + diff;
        touch();
      },
      enter(instant) {
        const s = st.current;
        if (instant) {
          s.enter = 1;
          s.pos = s.target = 0;
          return;
        }
        gsap.to(s, { enter: 1, duration: 2.6, ease: "power3.out" });
        gsap.to(s, { pos: 0, duration: 3.2, ease: "power3.out" });
      },
    }),
    [N]
  );

  /* every frame hugs its certificate: A4 portrait, landscape, square or any free size */
  const sizeFrame = useCallback((i) => {
    const L = st.current.layout;
    const frame = frameRefs.current[i];
    const r = ratios.current[i];
    if (!L || !frame || !r) return;
    const pad = L.mobile ? 6 : 9;
    const aw = L.cw - pad * 2;
    const ah = L.ch - pad * 2;
    let w = aw;
    let h = w / r;
    if (h > ah) {
      h = ah;
      w = h * r;
    }
    frame.style.width = `${Math.round(w + pad * 2)}px`;
    frame.style.height = `${Math.round(h + pad * 2)}px`;
    frame.style.padding = `${pad}px`;
  }, []);

  /* ---------- layout (separate desktop / tablet / mobile geometry) ---------- */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return; // no certificates found → nothing to lay out
    const calc = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const mobile = W < 700;
      const tablet = !mobile && W < 1100;

      let cw = mobile ? Math.min(W * 0.64, 300) : tablet ? W * 0.3 : Math.min(Math.max(W * 0.22, 220), 360);
      let ch = cw * (mobile ? 0.95 : 0.88);
      const maxH = H * 0.84;
      if (ch > maxH) {
        const k = maxH / ch;
        ch = maxH;
        cw *= k;
      }
      const step = mobile ? 20 : tablet ? 14 : 12;
      const R = (cw * 1.12) / (2 * Math.sin((step * Math.PI) / 360));
      const persp = mobile ? 720 : 1000;

      stage.style.setProperty("--cw", `${cw}px`);
      stage.style.setProperty("--ch", `${ch}px`);
      stage.style.perspective = `${persp}px`;
      st.current.layout = { cw, ch, step, R, maxA: mobile ? 52 : 62, mobile, W };
      st.current.vis = [];
      ratios.current.forEach((_, i) => sizeFrame(i));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [sizeFrame]);

  /* ---------- render loop ---------- */
  useEffect(() => {
    if (!N) return;
    if (!stageRef.current) return;
    allowAround(0);

    const io = new IntersectionObserver(([e]) => (st.current.visible = e.isIntersecting), { threshold: 0 });
    io.observe(stageRef.current);

    const tick = (time, deltaMs) => {
      const s = st.current;
      const L = s.layout;
      if (!s.visible || !L) return;
      const dt = Math.min(deltaMs / 1000, 0.05);
      const now = performance.now();

      if (s.playing && !s.dragging && now > s.idleUntil && s.enter > 0.95) s.target += AUTO_SPEED * dt;
      s.pos += (s.target - s.pos) * (1 - Math.exp(-dt * (s.dragging ? 14 : 4.5)));

      /* camera: gentle sway + mouse parallax */
      s.mx += (s.tmx - s.mx) * 0.06;
      s.my += (s.tmy - s.my) * 0.06;
      const t = time;
      camRef.current.style.transform = `translate3d(0,${(Math.sin(t * 0.5) * 4).toFixed(2)}px,0) rotateX(${(
        5 - s.my * 3
      ).toFixed(2)}deg) rotateY(${(s.mx * 5 + Math.sin(t * 0.33) * 1.3).toFixed(2)}deg)`;

      const e = s.enter;
      const maxA = Math.max(L.step * 1.5, Math.min(L.maxA, (N * L.step) / 2 - L.step * 0.6));

      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        let rel = i - s.pos;
        rel = ((((rel + N / 2) % N) + N) % N) - N / 2; // → [-N/2, N/2)
        const a = rel * L.step;
        const abs = Math.abs(a);

        if (abs > maxA || e <= 0.001) {
          if (s.vis[i] !== false) {
            el.style.visibility = "hidden";
            s.vis[i] = false;
          }
          continue;
        }
        if (s.vis[i] !== true) {
          el.style.visibility = "visible";
          s.vis[i] = true;
        }

        const rad = (a * Math.PI) / 180;
        const x = L.R * Math.sin(rad);
        const bump = Math.max(0, 1 - abs / L.step) * (L.mobile ? 30 : 60); // centre card floats forward
        const z = L.R * (Math.cos(rad) - 1) + bump;
        const fade = Math.min(1, (maxA - abs) / (L.step * 2.2));

        el.style.opacity = (fade * Math.min(1, e * 1.4)).toFixed(3);
        el.style.transform = `translate3d(${x.toFixed(1)}px,${((1 - e) * 160).toFixed(1)}px,${(
          z -
          (1 - e) * 900
        ).toFixed(1)}px) rotateY(${(a + (1 - e) * 24).toFixed(2)}deg)`;
        dimRefs.current[i].style.opacity = Math.min(0.62, abs / (L.step * 4.5)).toFixed(3);
      }

      /* active card + progress */
      const idx = wrapIndex(Math.round(s.pos), N);
      if (idx !== s.active) {
        cardRefs.current[s.active]?.classList.remove("is-active");
        cardRefs.current[idx]?.classList.add("is-active");
        s.active = idx;
        setActive(idx);
        allowAround(idx);
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${(wrapIndex(s.pos, N) / N).toFixed(4)})`;
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [N, allowAround]);

  /* ---------- trackpad / horizontal wheel ---------- */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const L = st.current.layout;
        st.current.target += e.deltaX / (L.cw * 1.4);
        touch();
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: true });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);

  /* ---------- mouse drag / touch swipe ---------- */
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = st.current;
    const card = e.target.closest("[data-idx]");
    s.drag = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTarget: s.target,
      lastX: e.clientX,
      lastT: performance.now(),
      vel: 0,
      moved: 0,
      idx: card ? Number(card.dataset.idx) : null,
    };
  };
  const onPointerMove = (e) => {
    const s = st.current;
    const L = s.layout;
    if (e.pointerType === "mouse") {
      const r = stageRef.current.getBoundingClientRect();
      s.tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      s.tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    const d = s.drag;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx), Math.abs(e.clientY - d.startY));
    if (d.moved > 8 && !s.dragging) {
      s.dragging = true;
      stageRef.current.setPointerCapture(e.pointerId);
      stageRef.current.classList.add("is-dragging");
    }
    if (s.dragging) {
      const pitch = L.cw * 1.1;
      s.target = d.startTarget - dx / pitch;
      const now = performance.now();
      const dtp = Math.max(now - d.lastT, 1);
      d.vel = (-(e.clientX - d.lastX) / pitch / dtp) * 1000;
      d.lastX = e.clientX;
      d.lastT = now;
    }
  };
  const endDrag = (e) => {
    const s = st.current;
    const d = s.drag;
    if (!d || d.id !== e.pointerId) return;
    if (s.dragging) {
      s.target += Math.max(-4, Math.min(4, d.vel)) * 0.28; // soft inertia
      stageRef.current.classList.remove("is-dragging");
    } else if (d.idx != null && e.type === "pointerup") {
      onOpen(d.idx);
    }
    s.dragging = false;
    s.drag = null;
    touch();
  };
  const onPointerLeave = () => {
    st.current.tmx = 0;
    st.current.tmy = 0;
  };

  const step = (dir) => {
    const s = st.current;
    s.target = Math.round(s.target) + dir;
    touch();
  };
  const togglePlay = () => {
    const next = !st.current.playing;
    st.current.playing = next;
    setPlaying(next);
  };

  if (!N) {
    return (
      <div className="cg-empty">
        <p>No certificates found.</p>
        <span>
          Add .jpg, .jpeg, .png or .webp images to <b>src/assets/certificates/</b> and they will appear here
          automatically. If the folder already has images, check that the path in Certificates.jsx
          (../assets/certificates/) matches where this file lives.
        </span>
      </div>
    );
  }

  return (
    <div className="cg-root">
      <div
        className="cg-stage"
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={onPointerLeave}
      >
        <div className="cg-floor" aria-hidden="true" />
        <div className="cg-camera" ref={camRef}>
          {items.map((it, i) => (
            <div
              key={it.path}
              className="cg-card"
              data-idx={i}
              ref={(el) => (cardRefs.current[i] = el)}
              role="button"
              tabIndex={0}
              aria-label={`View ${it.title}`}
              onFocus={() => {
                if (st.current.dragging) return;
                const cur = Math.round(st.current.target);
                let diff = wrapIndex(i - cur, N);
                if (diff > N / 2) diff -= N;
                st.current.target = cur + diff;
                touch();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(i);
                }
              }}
            >
              <div className="cg-frame" ref={(el) => (frameRefs.current[i] = el)}>
                <div className="cg-skel" />
                <div className="cg-matte">
                  {allowed.has(i) && (
                    <img
                      className="cg-img"
                      src={it.src}
                      alt={it.title}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      onLoad={(e) => {
                        const im = e.currentTarget;
                        ratios.current[i] = im.naturalWidth / im.naturalHeight || 1.41;
                        sizeFrame(i);
                        im.parentElement.parentElement.classList.add("is-ready");
                      }}
                    />
                  )}
                </div>
                <div className="cg-dim" ref={(el) => (dimRefs.current[i] = el)} />
                <span className="cg-sheen" />
                <span className="cg-view">VIEW CERTIFICATE</span>
                <span className="cg-no">{String(i + 1).padStart(2, "0")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cg-controls">
        <button className="cg-btn" onClick={() => step(-1)} aria-label="Previous certificate">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button className="cg-btn cg-play" onClick={togglePlay} aria-label={playing ? "Pause movement" : "Play movement"}>
          {playing ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14M16 5v14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5l11 7-11 7z" className="fill" />
            </svg>
          )}
        </button>
        <button className="cg-btn" onClick={() => step(1)} aria-label="Next certificate">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button className="cg-open" onClick={() => onOpen(active)} aria-label="View current certificate">
          VIEW CERTIFICATE
        </button>
        <div className="cg-progress">
          <span className="cg-count">
            {String(active + 1).padStart(2, "0")} <i>/</i> {String(N).padStart(2, "0")}
          </span>
          <div className="cg-bar">
            <span ref={barRef} />
          </div>
        </div>
      </div>
      <p className="cg-hint">Drag, swipe or scroll to explore · tap a certificate to view it</p>
    </div>
  );
});

export default CertificateGallery;