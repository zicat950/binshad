import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./trading.css";

/* ─────────────────────────────────────────────────────────────
   IMAGES  →  src/assets/trading/
   Keep these imports matching your real files.
   To add a photo: 1) put the file in the folder,
                   2) add one import line below,
                   3) add its name to the list under it.
   Every file imported here MUST exist, otherwise Vite shows an
   "Failed to resolve import" error (remove the line if you don't have it).
   ───────────────────────────────────────────────────────────── */

/* hero portrait  →  src/assets/trading/hero/ */
import heroPortrait from "./assets/trading/binshad2.png";

/* P&L screenshots  →  src/assets/trading/pnl/ */
import pnl01 from "./assets/trading/p&l1.png";
import pnl02 from "./assets/trading/p&l2.png";
import pnl03 from "./assets/trading/p&l3.png";
import pnl04 from "./assets/trading/p&l4.png";
// import pnl05 from "./assets/trading/pnl/pnl-05.png";
// import pnl06 from "./assets/trading/pnl/pnl-06.png";

/* chart screenshots  →  src/assets/trading/charts/ */
import chart01 from "./assets/trading/chart1.png";
import chart02 from "./assets/trading/chart2.png";
import chart03 from "./assets/trading/chart3.png";
// import chart04 from "./assets/trading/chart4.png";   // ← add your 4th chart, then uncomment this + its entry in CHARTS
// import chart05 from "./assets/trading/charts/chart-05.png";
// import chart06 from "./assets/trading/charts/chart-06.png";

/* student feedback  →  src/assets/trading/feedback/ */
import feedback01 from "./assets/trading/feedback1.png";
import feedback02 from "./assets/trading/feedback2.png";
import feedback03 from "./assets/trading/feedback3.png";
import feedback04 from "./assets/trading/feedback4.png";
import feedback05 from "./assets/trading/feedback5.png";
import feedback06 from "./assets/trading/feedback6.png";

gsap.registerPlugin(ScrollTrigger);

/* the lists – add the new import name here (file name without extension in quotes) */
const img = (src, name) => ({ src, name });
const PNL = [
  img(pnl01, "pnl-01"), img(pnl02, "pnl-02"), img(pnl03, "pnl-03"), img(pnl04, "pnl-04"),
];
const CHARTS = [
  img(chart01, "chart-01"), img(chart02, "chart-02"), img(chart03, "chart-03"),
  // img(chart04, "chart-04"),
];
const FEEDBACK = [
  img(feedback01, "feedback-01"), img(feedback02, "feedback-02"), img(feedback03, "feedback-03"),
  img(feedback04, "feedback-04"), img(feedback05, "feedback-05"), img(feedback06, "feedback-06"), 
];
const HERO_PORTRAIT = heroPortrait;

/* ─────────────────────────────────────────────────────────────
   P&L CARD DETAILS  (edit these with your real figures)
   key = the image name used in PNL above.
     result : "profit" or "loss"   (colours the card)
     pl     : headline profit / loss value
     amount : trade amount
     pct    : percentage return
   Anything left empty shows "—".
   ───────────────────────────────────────────────────────────── */
const PNL_META = {
  "pnl-01": { result: "profit", pl: "", amount: "", pct: "" },
  "pnl-02": { result: "profit", pl: "", amount: "", pct: "" },
  "pnl-03": { result: "profit", pl: "", amount: "", pct: "" },
  "pnl-04": { result: "profit", pl: "", amount: "", pct: "" },
};

/* ─────────────────────────────────────────────────────────────
   CATEGORIES (optional)
   A file goes into a category if its NAME contains the keyword,
   e.g. liquidity-02.png → "Liquidity Zones".
   You can also force a category for any file in the OVERRIDE maps.
   Files that match nothing still show under "All".
   ───────────────────────────────────────────────────────────── */
const PNL_CATS = [
  { id: "pnl", label: "Trading P&L", match: /pnl|p&l|profit/i },
  { id: "history", label: "Historical Performance", match: /histor/i },
  { id: "account", label: "Account Performance", match: /account|acc-/i },
  { id: "execution", label: "Trade Execution", match: /exec/i },
];
const PNL_OVERRIDE = {
  // "screenshot-5": "history",
};
const CHART_CATS = [
  { id: "structure", label: "Market Structure", match: /struct/i },
  { id: "liquidity", label: "Liquidity Zones", match: /liquid/i },
  { id: "entry", label: "Entry & Exit Analysis", match: /entry|exit/i },
  { id: "execution", label: "Trade Execution", match: /exec/i },
  { id: "strategy", label: "Strategy Examples", match: /strateg|example/i },
];
const CHART_OVERRIDE = {
  // "chart-01": "structure",
  // "chart-02": "liquidity",
};
const withCats = (list, cats, override) =>
  list.map((it) => {
    const id = override[it.name] || cats.find((c) => c.match.test(it.name))?.id || null;
    return { ...it, cat: id, catLabel: cats.find((c) => c.id === id)?.label || "" };
  });
const PNL_ITEMS = withCats(PNL, PNL_CATS, PNL_OVERRIDE);
const CHART_ITEMS = withCats(CHARTS, CHART_CATS, CHART_OVERRIDE);

/* where the closing buttons scroll to (section ids on your homepage) */
const BACK_TARGET = "#home";
const JOURNEY_TARGET = "#story";

/* ───────────── content ───────────── */
const DIFF = [
  { n: "01", t: "Proprietary methodology", d: "GRS is our internally developed trading framework. Its complete methodology is not publicly available through conventional trading websites, software libraries, or YouTube tutorials." },
  { n: "02", t: "Refined mentor strategies", d: "One of the biggest attractions of our programme is the refined strategies developed and improved by our mentors through years of practical trading experience." },
  { n: "03", t: "Liquidity-based market understanding", d: "Learn to understand liquidity behaviour, market structure, potential price movements, and strategic trade opportunities." },
  { n: "04", t: "Practical market application", d: "Move beyond theoretical concepts through structured chart analysis, real-market examples, and practical trading sessions." },
  { n: "05", t: "A structured trading approach", d: "Focus on precision, risk management, disciplined execution, and consistency rather than random entries or indicator dependency." },
];
const CHECKS = [
  "Understanding the GRS trading framework.",
  "Identifying liquidity zones and market opportunities.",
  "Analysing price behaviour and market structure.",
  "Developing entry, stop-loss, and target plans.",
  "Practical chart analysis and trade execution.",
  "Risk management and trading discipline.",
];

/* ───────────── helpers ───────────── */
const reduce = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n) => String(n).padStart(2, "0");

function jump(sel, fallbackPath) {
  const el = document.querySelector(sel);
  if (el) el.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
  else if (fallbackPath) window.location.assign(fallbackPath);
}
let rfT;
const refreshST = () => { clearTimeout(rfT); rfT = setTimeout(() => ScrollTrigger.refresh(), 250); };

/* splits text → words → characters (for staggered reveals) */
function Split({ text }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="tr-tword" aria-hidden="true">
            {[...w].map((c, j) => <span className="tr-tchar" key={j}>{c}</span>)}
          </span>
        </Fragment>
      ))}
    </>
  );
}
/* multi-line heading: each line is its own block */
function Heading({ lines, as: Tag = "h2", className = "" }) {
  return (
    <Tag className={`tr-head ${className}`} aria-label={lines.join(" ")}>
      {lines.map((l, i) => <span className="tr-line" key={i}><Split text={l} /></span>)}
    </Tag>
  );
}

/* decorative candlesticks – generated, NOT real data */
function makeCandles(n, seed) {
  let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  let p = 200;
  const raw = [];
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = o + (r() - 0.45) * 36 + Math.sin(i / 7) * 7;
    raw.push({ o, c, hi: Math.max(o, c) + r() * 16, lo: Math.min(o, c) - r() * 16 });
    p = c;
  }
  const min = Math.min(...raw.map((k) => k.lo));
  const max = Math.max(...raw.map((k) => k.hi));
  const y = (v) => 370 - ((v - min) / (max - min)) * 330;
  const step = 1000 / n;
  return raw.map((k, i) => ({
    x: i * step + step / 2, w: step * 0.5, up: k.c >= k.o,
    hi: y(k.hi), lo: y(k.lo), top: y(Math.max(k.o, k.c)), h: Math.max(2, Math.abs(y(k.o) - y(k.c))),
  }));
}
function Candles({ n = 56, seed = 7, lines = [90, 190, 290] }) {
  const cs = makeCandles(n, seed);
  return (
    <svg className="tr-candles" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
      {[80, 160, 240, 320].map((y) => <line key={y} x1="0" x2="1000" y1={y} y2={y} className="tr-gridline" />)}
      {cs.map((c, i) => (
        <g className={`tr-candle ${c.up ? "is-up" : "is-down"}`} key={i}>
          <line x1={c.x} x2={c.x} y1={c.hi} y2={c.lo} className="tr-wick" />
          <rect x={c.x - c.w / 2} y={c.top} width={c.w} height={c.h} className="tr-body" />
        </g>
      ))}
      {lines.map((y, i) => <line key={i} x1="0" x2="1000" y1={y} y2={y} className="tr-liq" />)}
    </svg>
  );
}

function Empty({ folder }) {
  return <div className="tr-empty">Add images to <code>src/assets/trading/{folder}/</code> and they will appear here automatically.</div>;
}

/* image with failure fallback + ScrollTrigger refresh once loaded */
function Img({ src, alt, className = "", eager = false }) {
  const [bad, setBad] = useState(false);
  if (bad) return <div className="tr-imgfail">Image unavailable</div>;
  return <img className={className} src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" draggable="false" onLoad={refreshST} onError={() => setBad(true)} />;
}

/* ───────────── FULL-SCREEN VIEWER (zoom + navigation) ───────────── */
function Viewer({ list, index, onIndex, onClose }) {
  const [z, setZ] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const wrap = useRef(null);
  const img = useRef(null);
  const ptrs = useRef(new Map());
  const drag = useRef(null);
  const pinch = useRef(null);
  const item = list[index];

  const setZoom = useCallback((v) => {
    const nz = Math.min(4, Math.max(1, v));
    setZ(nz);
    if (nz === 1) setPos({ x: 0, y: 0 });
  }, []);
  const go = useCallback((d) => onIndex((index + d + list.length) % list.length), [index, list.length, onIndex]);

  useEffect(() => {
    if (!reduce()) gsap.fromTo(wrap.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  }, []);
  useEffect(() => {
    setZ(1); setPos({ x: 0, y: 0 });
    if (!reduce() && img.current) gsap.fromTo(img.current, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out" });
  }, [index]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "+" || e.key === "=") setZoom(z + 0.5);
      if (e.key === "-") setZoom(z - 0.5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, setZoom, z]);

  const dist = () => { const [a, b] = [...ptrs.current.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const down = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.current.size === 2) { pinch.current = { d: dist(), z }; drag.current = null; }
    else drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false, onImg: e.target === img.current };
  };
  const move = (e) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.current.size === 2 && pinch.current) { setZoom(pinch.current.z * (dist() / pinch.current.d)); return; }
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) d.moved = true;
    if (z > 1) setPos({ x: d.ox + dx, y: d.oy + dy });
  };
  const up = (e) => {
    const d = drag.current;
    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size < 2) pinch.current = null;
    if (!d || e.type === "pointercancel") { drag.current = null; return; }
    drag.current = null;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (z === 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
    else if (!d.moved) { if (d.onImg) setZoom(z > 1 ? 1 : 2.4); else if (z === 1) onClose(); }
  };

  return createPortal(
    <div className="tr-viewer" ref={wrap} role="dialog" aria-modal="true" aria-label="Image viewer">
      <div className="tr-v-bar">
        <span className="tr-v-count">{pad(index + 1)} / {pad(list.length)}</span>
        <div className="tr-v-tools">
          <button onClick={() => setZoom(z - 0.6)} aria-label="Zoom out">−</button>
          <button onClick={() => setZoom(z + 0.6)} aria-label="Zoom in">+</button>
          <button onClick={onClose} aria-label="Close viewer">✕</button>
        </div>
      </div>
      <div className={`tr-v-stage${z > 1 ? " is-zoomed" : ""}`}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onWheel={(e) => setZoom(z - e.deltaY * 0.0025)}>
        <div className="tr-v-zoom" style={{ transform: `translate3d(${pos.x}px,${pos.y}px,0) scale(${z})` }}>
          <img ref={img} src={item.src} alt={item.name} draggable="false" />
        </div>
      </div>
      {list.length > 1 && (
        <>
          <button className="tr-v-nav tr-v-prev" onClick={() => go(-1)} aria-label="Previous image">‹</button>
          <button className="tr-v-nav tr-v-next" onClick={() => go(1)} aria-label="Next image">›</button>
        </>
      )}
      <p className="tr-v-cap">{item.catLabel ? `${item.catLabel} · ` : ""}{item.name}</p>
    </div>,
    document.body
  );
}

/* ───────────── category chips ───────────── */
function Chips({ cats, items, value, onChange }) {
  const used = cats.filter((c) => items.some((i) => i.cat === c.id));
  if (!used.length) return null;
  return (
    <div className="tr-chips tr-fade" role="tablist">
      <button className={`tr-chip${value === "all" ? " is-on" : ""}`} onClick={() => onChange("all")}>All <em>{items.length}</em></button>
      {used.map((c) => (
        <button key={c.id} className={`tr-chip${value === c.id ? " is-on" : ""}`} onClick={() => onChange(c.id)}>
          {c.label} <em>{items.filter((i) => i.cat === c.id).length}</em>
        </button>
      ))}
    </div>
  );
}

/* ───────────── 1. HERO ───────────── */
function TradingHero() {
  return (
    <section className="tr-sec tr-hero" id="tr-hero">
      <div className="tr-hero-bg" aria-hidden="true"><Candles n={64} seed={11} lines={[110, 200, 285]} /></div>
      <div className="tr-glow" aria-hidden="true" />
      <div className="tr-sweep" aria-hidden="true" />

      <span className="tr-float tr-float--a" aria-hidden="true">Liquidity zone</span>
      <span className="tr-float tr-float--b" aria-hidden="true">Market structure</span>
      <span className="tr-float tr-float--c" aria-hidden="true">Entry · Stop-loss · Target</span>

      <div className="tr-hero-in">
        <div className="tr-hero-text">
          <p className="tr-kicker tr-hero-fade">Trading · Since 2020</p>
          <Heading as="h1" className="tr-hero-title" lines={["THE ART OF", "UNDERSTANDING", "THE MARKETS."]} />
          <p className="tr-hero-sub tr-hero-fade">From market observation to developing my own proprietary trading methodology.</p>
          <p className="tr-hero-desc tr-hero-fade">
            My journey in trading started in 2020. Through years of market observation, practical execution, strategy development, and continuous learning, I developed my own approach to understanding financial markets.
            <br /><br />
            In 2023, I developed the GRS Liquidity Trading Strategy, a proprietary trading methodology refined through practical market experience.
          </p>
          <div className="tr-btns tr-hero-fade">
            <button className="tr-btn tr-btn--solid" onClick={() => jump("#tr-strategy")}>Explore my strategy</button>
            <button className="tr-btn" onClick={() => jump("#tr-pnl")}>View trading performance</button>
          </div>
        </div>
        <div className="tr-hero-portrait">
          <img src={HERO_PORTRAIT} alt="Portrait" decoding="async" loading="eager" />
        </div>
      </div>
    </section>
  );
}

/* ───────────── 2. P&L GALLERY  (compact dashboard) ───────────── */
function TradingPnL({ open }) {
  const [cat, setCat] = useState("all");
  const list = cat === "all" ? PNL_ITEMS : PNL_ITEMS.filter((i) => i.cat === cat);
  useEffect(() => { refreshST(); }, [cat]);
  return (
    <section className="tr-sec tr-pnl" id="tr-pnl">
      <div className="tr-inner">
        <Heading lines={["THE NUMBERS", "BEHIND THE JOURNEY."]} />
        <p className="tr-sub tr-fade">Real market experience. Documented trading performance.</p>
        <Chips cats={PNL_CATS} items={PNL_ITEMS} value={cat} onChange={setCat} />
        {PNL_ITEMS.length === 0 ? <Empty folder="pnl" /> : (
          <div className="tr-pgrid">
            {list.map((it, i) => {
              const m = PNL_META[it.name] || {};
              const loss = m.result === "loss";
              return (
                <button key={it.name} className={`tr-pcard tr-rv ${loss ? "is-loss" : "is-profit"}`} onClick={() => open(list, i)} aria-label={`Open ${it.name}`}>
                  <span className="tr-pcard-img">
                    <Img src={it.src} alt={it.name} />
                    <span className="tr-shot-zoom" aria-hidden="true">+</span>
                  </span>
                  <span className="tr-pcard-body">
                    <span className="tr-pcard-top">
                      <span className="tr-pcard-tag">{pad(i + 1)}{it.catLabel ? ` · ${it.catLabel}` : ""}</span>
                      <span className="tr-pcard-badge">{loss ? "Loss" : "Profit"}</span>
                    </span>
                    <span className="tr-pcard-pl">{m.pl || "—"}</span>
                    <span className="tr-pcard-rows">
                      <span className="tr-pcard-row"><span>Trade amount</span><b>{m.amount || "—"}</b></span>
                      <span className="tr-pcard-row"><span>Percentage</span><b>{m.pct || "—"}</b></span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────── 3. GRS STRATEGY ───────────── */
function Stat({ kind, to, from, prefix = "", suffix = "", text, label, note }) {
  const el = useRef(null);
  const box = useRef(null);
  const final = kind === "count" ? `${prefix}${to}${suffix}` : kind === "range" ? `${from}–${to}` : text;

  useEffect(() => {
    if (reduce()) return;
    const o = { v: kind === "range" ? from : 0 };
    let tween;
    const st = ScrollTrigger.create({
      trigger: box.current, start: "top 88%", once: true,
      onEnter: () => {
        if (kind === "text") {
          tween = gsap.from(box.current.querySelectorAll(".tr-tchar"), { yPercent: 115, autoAlpha: 0, duration: 0.9, stagger: 0.05, ease: "power3.out" });
          return;
        }
        const paint = () => {
          const v = Math.round(o.v);
          el.current.textContent = kind === "count" ? `${prefix}${v}${suffix}` : `${from}–${v}`;
        };
        paint();
        tween = gsap.to(o, { v: to, duration: 2, ease: "power3.out", onUpdate: paint });
      },
    });
    return () => { st.kill(); tween?.kill(); };
  }, [kind, from, to, prefix, suffix]);

  return (
    <div className="tr-stat tr-fade" ref={box}>
      <p className={`tr-stat-val${kind === "text" ? " tr-stat-val--sm" : ""}`} ref={el} aria-label={final}>
        {kind === "text" ? <Split text={text} /> : final}
      </p>
      <h4 className="tr-stat-label">{label}</h4>
      <p className="tr-stat-note">{note}</p>
    </div>
  );
}

function GRSStrategy() {
  const [active, setActive] = useState(0);
  return (
    <section className="tr-sec tr-grs" id="tr-strategy">
      <div className="tr-grs-bg" aria-hidden="true"><Candles n={48} seed={23} lines={[120, 230]} /></div>
      <div className="tr-bigtext" aria-hidden="true">GRS</div>
      <div className="tr-glow tr-glow--grs" aria-hidden="true" />

      <div className="tr-inner">
        <div className="tr-grs-intro">
          <div className="tr-sweep" aria-hidden="true" />
          <p className="tr-label tr-fade">Developed in 2023 | Nearly 3 years of strategy evolution</p>
          <Heading className="tr-grs-title" lines={["INTRODUCING", "GRS LIQUIDITY", "TRADING STRATEGY."]} />
          <p className="tr-sub tr-sub--lg tr-fade">A Proprietary Trading Model. Built Through Experience. Refined Through the Markets.</p>
          <div className="tr-grs-copy tr-fade">
            <h3>GRS Liquidity Trading Strategy</h3>
            <p>GRS Liquidity Trading Strategy is a proprietary trading methodology developed in 2023 through extensive market observation, practical execution, testing, and continuous refinement.</p>
            <p>Unlike commonly circulated trading concepts, GRS is a structured strategy built around understanding market liquidity, identifying high-probability trading opportunities, and executing with a disciplined approach.</p>
          </div>
        </div>

        <h3 className="tr-h3 tr-fade">The performance journey</h3>
        <div className="tr-stats">
          <Stat kind="count" to={70} suffix="%+" label="Historical Win Rate" note="Reported winning rate across our trading experience." />
          <Stat kind="count" to={3} prefix="₹" suffix=" CRORE+" label="Capital Managed" note="Trading capital managed using this strategic approach." />
          <Stat kind="range" from={2023} to={2026} label="Strategy Evolution" note="Nearly three years of development, application, and refinement." />
          <Stat kind="text" text="CONTINUOUS" label="Refinement" note="Evolved through practical market experience and mentor-led improvements." />
        </div>
        <p className="tr-reported tr-fade">Reported historical information. Not independently verified and not a guarantee of results.</p>

        <h3 className="tr-h3 tr-fade">What makes GRS different?</h3>
        <div className="tr-diff tr-fade">
          {DIFF.map((d, i) => (
            <button key={d.n} className={`tr-diff-item${active === i ? " is-on" : ""}`}
              onClick={() => setActive(i)} onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setActive(i)}
              aria-expanded={active === i}>
              <span className="tr-diff-n">{d.n}</span>
              <span className="tr-diff-t">{d.t}</span>
              <span className="tr-diff-d"><span>{d.d}</span></span>
            </button>
          ))}
        </div>

        <h3 className="tr-h3 tr-fade">What you will experience</h3>
        <ul className="tr-checks">
          {CHECKS.map((c) => (
            <li key={c}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" /><path d="M6.5 12.5l3.8 3.8 7.2-8" /></svg>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* final statement */}
      <div className="tr-final">
        <div className="tr-sweep" aria-hidden="true" />
        <div className="tr-final-in">
          <Heading className="tr-final-a" lines={["NOT JUST ANOTHER", "TRADING STRATEGY."]} />
          <Heading className="tr-final-b" lines={["A SYSTEM DEVELOPED", "THROUGH EXPERIENCE."]} />
          <p className="tr-final-3 tr-fade">Learn the methodology.<br />Understand the liquidity.<br />Master the execution.</p>
          <p className="tr-brand tr-fade">Zonex Eduhub Training Platform Pvt. Ltd.</p>
          <p className="tr-brand-sub tr-fade">Professional Trading Education | Practical Market Learning | Mentor-Guided Training</p>
        </div>
        <p className="tr-disclaimer tr-fade">
          <b>Disclaimer:</b> Historical trading performance is not indicative of future results. The stated win rate and capital figures are based on reported historical experience and should not be interpreted as guaranteed returns. Trading involves substantial financial risk.
        </p>
      </div>
    </section>
  );
}

/* ───────────── 4. CHARTS  (2 × 2 dashboard grid) ───────────── */
function TradingCharts({ open }) {
  const [cat, setCat] = useState("all");
  const list = cat === "all" ? CHART_ITEMS : CHART_ITEMS.filter((i) => i.cat === cat);
  useEffect(() => { refreshST(); }, [cat]);
  return (
    <section className="tr-sec tr-charts" id="tr-charts">
      <div className="tr-glow tr-glow--charts" aria-hidden="true" />
      <div className="tr-inner">
        <Heading lines={["BEHIND EVERY TRADE,", "THERE IS A STRATEGY."]} />
        <p className="tr-sub tr-fade">Understanding market structure through real chart analysis.</p>
        <Chips cats={CHART_CATS} items={CHART_ITEMS} value={cat} onChange={setCat} />
        {CHART_ITEMS.length === 0 ? <Empty folder="charts" /> : (
          <div className="tr-cgrid">
            {list.map((it, i) => (
              <figure className="tr-ccard" key={it.name}>
                <figcaption className="tr-ccard-meta">
                  <span className="tr-ccard-num" aria-hidden="true">{pad(i + 1)}</span>
                  <span className="tr-ccard-cat">{it.catLabel || "Chart analysis"}</span>
                </figcaption>
                <button className="tr-ccard-frame tr-rv" onClick={() => open(list, i)} aria-label={`Open chart ${pad(i + 1)}`}>
                  <Img src={it.src} alt={it.catLabel || `Chart ${pad(i + 1)}`} />
                  <span className="tr-shot-zoom" aria-hidden="true">+</span>
                </button>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────── 5. FEEDBACK  (cinematic infinite right-to-left gallery) ─────────────
   • the image list is repeated COPIES times inside one track
   • the track is moved leftwards by a GSAP ticker; once it has travelled
     exactly one set-width, x is wrapped back by that width (invisible, because
     every set is identical) → seamless endless loop
   • hover pauses (mouse only) · drag / swipe works with mouse, touch and pen
   • arrows nudge the gallery by one image                                     */
const FB_COPIES = 4;
const FB_SPEED = 64; // px per second

function StudentFeedback({ open }) {
  const stage = useRef(null);
  const track = useRef(null);
  const dragged = useRef(false);
  const [dragging, setDragging] = useState(false);
  const s = useRef({ x: 0, setW: 0, speed: 1, hover: false, drag: false, visible: true, tween: null, p: null });
  const n = FEEDBACK.length;
  const items = n
    ? Array.from({ length: n * FB_COPIES }, (_, k) => ({ ...FEEDBACK[k % n], i: k % n, dup: k >= n }))
    : [];

  useEffect(() => {
    if (!n) return;
    const st = s.current;
    const tr = track.current;
    const wrap = () => {
      if (st.setW > 0) {
        st.x = st.x % st.setW;
        if (st.x > 0) st.x -= st.setW;
      }
    };
    const paint = () => { tr.style.transform = `translate3d(${st.x.toFixed(2)}px,0,0)`; };
    const measure = () => {
      const k = tr.children;
      if (k.length > n) st.setW = k[n].offsetLeft - k[0].offsetLeft;
      wrap(); paint();
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(stage.current);
    const io = new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; });
    io.observe(stage.current);

    const tick = (_t, dt) => {
      const d = Math.min(dt, 50) / 1000;
      const run = !reduce() && st.visible && !st.hover && !st.drag && !st.tween;
      st.speed += ((run ? 1 : 0) - st.speed) * Math.min(1, d * 5); /* eased pause / resume */
      if (!st.drag) st.x -= FB_SPEED * st.speed * d;
      wrap(); paint();
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); ro.disconnect(); io.disconnect(); st.tween?.kill(); st.tween = null; };
  }, [n]);

  const down = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const st = s.current;
    st.tween?.kill(); st.tween = null;
    dragged.current = false;
    st.p = { id: e.pointerId, sx: e.clientX, lx: e.clientX };
  };
  const move = (e) => {
    const st = s.current;
    const p = st.p;
    if (!p || p.id !== e.pointerId) return;
    if (!st.drag) {
      if (Math.abs(e.clientX - p.sx) > 6) {
        st.drag = true; dragged.current = true; p.lx = e.clientX;
        setDragging(true);
        stage.current.setPointerCapture?.(e.pointerId);
      }
      return;
    }
    st.x += e.clientX - p.lx;
    p.lx = e.clientX;
  };
  const end = (e) => {
    const st = s.current;
    if (st.p && st.p.id === e.pointerId) {
      st.p = null;
      if (st.drag) { st.drag = false; setDragging(false); }
    }
  };
  const enter = (e) => { if (e.pointerType === "mouse") s.current.hover = true; };
  const leave = (e) => { if (e.pointerType === "mouse") s.current.hover = false; };

  const nudge = (dir) => {
    const st = s.current;
    const w = track.current?.children[0]?.offsetWidth || 400;
    st.tween?.kill();
    st.tween = gsap.to(st, {
      x: `+=${dir * w}`, duration: 0.9, ease: "power3.inOut",
      onComplete: () => { st.tween = null; },
    });
  };

  return (
    <section className="tr-sec tr-fb" id="tr-feedback">
      <div className="tr-glow tr-glow--fb" aria-hidden="true" />
      <div className="tr-inner">
        <Heading lines={["REAL LEARNING.", "REAL EXPERIENCES."]} />
        <p className="tr-sub tr-fade">Experiences shared by students who have learned through our trading education programme.</p>
      </div>
      {n === 0 ? <div className="tr-inner"><Empty folder="feedback" /></div> : (
        <>
          <div
            className={`tr-fb-stage${dragging ? " is-drag" : ""}`}
            ref={stage}
            aria-label="Student feedback gallery"
            onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
            onPointerEnter={enter} onPointerLeave={leave}
          >
            <div className="tr-fb-track" ref={track}>
              {items.map((it, k) => (
                <button
                  key={k}
                  className={`tr-fb-item${it.i % 2 ? " is-low" : ""}`}
                  tabIndex={it.dup ? -1 : 0}
                  aria-hidden={it.dup ? "true" : undefined}
                  aria-label={it.dup ? undefined : `Open feedback ${it.i + 1}`}
                  onClick={() => { if (dragged.current) { dragged.current = false; return; } open(FEEDBACK, it.i); }}
                >
                  <span className="tr-fb-frame">
                    <Img className="tr-fb-img" src={it.src} alt={it.dup ? "" : `Student feedback ${it.i + 1}`} eager />
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="tr-fb-ctrl">
            <span className="tr-fb-hint">Swipe · tap to zoom</span>
            <div>
              <button className="tr-arrow" onClick={() => nudge(1)} aria-label="Previous">‹</button>
              <button className="tr-arrow" onClick={() => nudge(-1)} aria-label="Next">›</button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/* ───────────── 6. CLOSING ───────────── */
function Closing() {
  return (
    <section className="tr-sec tr-close" id="tr-closing">
      <div className="tr-close-bg" aria-hidden="true"><Candles n={52} seed={5} lines={[100, 210, 300]} /></div>
      <div className="tr-glow tr-glow--close" aria-hidden="true" />
      <div className="tr-sweep" aria-hidden="true" />
      <div className="tr-inner tr-close-in">
        <Heading as="h2" className="tr-close-title" lines={["UNDERSTAND", "THE MARKET.", "MASTER", "YOUR EXECUTION."]} />
        <p className="tr-close-p tr-fade">Trading is not about predicting every movement. It is about understanding opportunities, managing risk, and executing with discipline.</p>
        <p className="tr-brand tr-fade">Zonex Eduhub Training Platform Pvt. Ltd.</p>
        <div className="tr-btns tr-fade">
          <button className="tr-btn" onClick={() => jump(BACK_TARGET, "/")}>Back to portfolio</button>
          <button className="tr-btn tr-btn--solid" onClick={() => jump(JOURNEY_TARGET, "/#story")}>Explore my journey</button>
        </div>
      </div>
    </section>
  );
}

/* ───────────── MAIN ───────────── */
export default function Trading() {
  const root = useRef(null);
  const [viewer, setViewer] = useState(null); // { list, index }
  const open = useCallback((list, index) => setViewer({ list, index }), []);

  useLayoutEffect(() => {
    if (reduce()) return;
    const el = root.current;
    const ctx = gsap.context(() => {
      const hero = el.querySelector(".tr-hero");

      /* hero intro */
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".tr-hero .tr-candle", { scaleY: 0, autoAlpha: 0, duration: 0.8, stagger: 0.014 }, 0)
        .from(".tr-hero .tr-liq", { scaleX: 0, transformOrigin: "0% 50%", duration: 1.6, stagger: 0.2 }, 0.3)
        .from(".tr-hero-title .tr-tchar", { yPercent: 115, autoAlpha: 0, duration: 1, stagger: 0.025 }, 0.5)
        .from(".tr-hero-portrait", { autoAlpha: 0, scale: 0.88, y: 40, duration: 1.6 }, 0.9)
        .from(".tr-hero-fade", { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, 1.2)
        .from(".tr-float", { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.15 }, 1.6);

      /* hero parallax */
      gsap.to(".tr-hero-portrait", { yPercent: -7, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".tr-hero-bg", { yPercent: 12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });

      /* section headings */
      gsap.utils.toArray(".tr-head:not(.tr-hero-title)").forEach((h) => {
        gsap.from(h.querySelectorAll(".tr-tchar"), {
          yPercent: 115, autoAlpha: 0, duration: 0.9, stagger: 0.02, ease: "power3.out",
          scrollTrigger: { trigger: h, start: "top 88%", once: true },
        });
      });
      /* generic fade-ups */
      gsap.utils.toArray(".tr-fade").forEach((n) => {
        gsap.from(n, { y: 30, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: n, start: "top 92%", once: true } });
      });
      /* image clipping-mask reveals */
      gsap.utils.toArray(".tr-rv").forEach((n) => {
        gsap.fromTo(n, { clipPath: "inset(0 0 100% 0)" }, {
          clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "power4.inOut",
          scrollTrigger: { trigger: n, start: "top 92%", once: true },
          onComplete: () => gsap.set(n, { clearProps: "clipPath" }),
        });
      });
      /* purple light sweeps */
      gsap.utils.toArray(".tr-sweep").forEach((n) => {
        gsap.fromTo(n, { xPercent: -120, autoAlpha: 1 }, {
          xPercent: 120, duration: 1.9, ease: "power2.inOut",
          scrollTrigger: { trigger: n.parentElement, start: "top 70%", once: true },
          onComplete: () => gsap.set(n, { autoAlpha: 0 }),
        });
      });
      /* (chart parallax removed – charts now sit in a fixed 2 × 2 grid) */

      /* candles in other sections */
      ["tr-grs", "tr-close"].forEach((cls) => {
        const sec = el.querySelector(`.${cls}`);
        gsap.from(sec.querySelectorAll(".tr-candle"), { scaleY: 0, autoAlpha: 0, duration: 0.8, stagger: 0.014, ease: "power3.out", scrollTrigger: { trigger: sec, start: "top 75%", once: true } });
        gsap.from(sec.querySelectorAll(".tr-liq"), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.6, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: sec, start: "top 75%", once: true } });
      });
      /* checklist */
      gsap.from(".tr-checks li", { x: -34, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".tr-checks", start: "top 85%", once: true } });
      gsap.from(".tr-checks path", { strokeDashoffset: 30, duration: 0.8, stagger: 0.12, delay: 0.3, ease: "power2.out", scrollTrigger: { trigger: ".tr-checks", start: "top 85%", once: true } });
      /* feedback gallery – gentle fade-in of the whole moving stage */
      if (el.querySelector(".tr-fb-stage")) {
        gsap.from(".tr-fb-stage", { autoAlpha: 0, y: 40, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".tr-fb-stage", start: "top 90%", once: true } });
      }
    }, root);

    window.addEventListener("load", refreshST);
    const t = setTimeout(() => ScrollTrigger.refresh(), 700);
    return () => { clearTimeout(t); window.removeEventListener("load", refreshST); ctx.revert(); };
  }, []);

  return (
    <div className="tr-root" id="trading" ref={root}>
      <TradingHero />
      <TradingPnL open={open} />
      <GRSStrategy />
      <TradingCharts open={open} />
      <StudentFeedback open={open} />
      <Closing />
      {viewer && <Viewer list={viewer.list} index={viewer.index} onIndex={(i) => setViewer((v) => ({ ...v, index: i }))} onClose={() => setViewer(null)} />}
    </div>
  );
}