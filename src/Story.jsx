import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./story.css";

/* ─────────────────────────────────────────────────────────────
   IMAGES  →  src/assets/        (portrait, same as your other pages)
              src/assets/story/  (all story photographs)
   Keep these imports matching your real files.
   Every file below MUST exist, otherwise Vite will show an
   "Failed to resolve import" error. Rename imports or files to match.
   ───────────────────────────────────────────────────────────── */
import portraitImg from "./assets/binshad3.png"; // ← change to your portrait cutout

import img2018 from "./assets/story/tution.png";
import img2019 from "./assets/story/graduation.png";
import img2020A2 from "./assets/story/first.png";
import img2020Trading from "./assets/story/first-trade.png";
import img2020Digi from "./assets/story/digimob.png";
import img2021 from "./assets/story/bizpole.png";
import img2022Monte from "./assets/story/monte.png";
import img2022Law from "./assets/story/lawbiz.png";
import img2023Strategy from "./assets/story/strategy.png";
import img2023Zonex from "./assets/story/zonex.png";
import img2024Europe from "./assets/story/europe.png";
import img2026Zicat from "./assets/story/zicat.png";
import imgPresent from "./assets/story/last.png";

/* Where the final button scrolls to (id of a section on your homepage).
   Change to "#home" or "#about" if you prefer. */
const EXPLORE_TARGET = "#contact";

/* ─────────────────────────────────────────────────────────────
   STORY DATA  (edit text here, nothing else needs to change)
   bg      = giant background typography
   second  = optional large line under the title
   chart   = true → animated trading-chart background
   cinema  = true → extra cinematic treatment (letterbox bars)
   range   = chapter 11 only: counts 2024 → 2026
   ───────────────────────────────────────────────────────────── */
const CHAPTERS = [
  {
    id: "teaching", year: "2018", bg: "2018", label: "Where it all began.",
    title: "The first step", img: img2018,
    story: "Started teaching Economics tuition to Plus Two students.",
  },
  {
    id: "cma", year: "2019", bg: "2019", title: "Building knowledge", img: img2019,
    story: "Started pursuing CMA in Kerala, continuing my professional education through the challenging COVID period.",
  },
  {
    id: "a2", year: "2020", bg: "2020", title: "My first business", img: img2020A2,
    business: "A2 Consultancy", location: "Malappuram, Kerala",
    story: "Started my own tax consultancy company in Malappuram, Kerala, offering tax consultancy and financial services.",
    achievement: "A successful business that is still operating today.",
  },
  {
    id: "trading", year: "2020", bg: "2020", title: "Entering the markets", img: img2020Trading, chart: true,
    story: "Started my journey in trading.",
  },
  {
    id: "digimob", year: "2020", bg: "2020", title: "Another business begins", img: img2020Digi,
    business: "Digi Mob", location: "Malappuram, Kerala",
    story: "Started a mobile shop in Malappuram, Kerala.",
    achievement: "A successful business that continues to operate today.",
  },
  {
    id: "bizpole", year: "2021", bg: "2021", title: "Expanding my network", img: img2021,
    business: "Bizpole",
    story: "Started an association with Bizpole, a business consultancy company.",
    achievement: "A successful professional association that continues today.",
  },
  {
    id: "monte", year: "2022", bg: "₹1.5 CR", second: "Monte Alban", title: "Thinking bigger", img: img2022Monte, cinema: true,
    business: "Monte Alban Chocolate Company",
    story: "Started Monte Alban Chocolate Company with a total investment of ₹1.5 crore.",
  },
  {
    id: "lawbiz", year: "2022", bg: "2022", title: "Strategic collaboration", img: img2022Law,
    business: "Law Biz Associates",
    story: "Started a collaboration with Law Biz Associates.",
  },
  {
    id: "strategy", year: "2023", bg: "2023", title: "Developing my own edge", img: img2023Strategy, chart: true,
    story: "Developed my own trading strategy.",
  },
  {
    id: "zonex", year: "2023", bg: "ZONEX", title: "Sharing my knowledge", img: img2023Zonex,
    business: "Zonex Trading Institute", location: "Kochi, Kerala",
    story: "Started my own trading institute, Zonex, in Kerala.",
    achievement: "A successful institute that is still running today.",
  },
  {
    id: "europe", year: "2024–2026", bg: "EUROPE", range: [2024, 2026], title: "A European chapter", img: img2024Europe, cinema: true,
    story: "In 2024, travelled to Europe to build my professional career. In 2026, completed this chapter and returned.",
  },
  {
    id: "zicat", year: "2026", bg: "ZICAT", title: "Building my own brand", img: img2026Zicat,
    business: "ZICAT", location: "Kochi, Kerala",
    story: "Started ZICAT, my own advertising and digital marketing company in Kochi, Kerala.",
  },
  {
    id: "present", year: "Present", bg: "₹3 CRORE", second: "The journey continues.", title: "The next level", img: imgPresent, chart: true, finale: true,
    story: "Currently managing ₹3 crore in funds.",
  },
];

const N = CHAPTERS.length;
const pad = (n) => String(n).padStart(2, "0");
const reduce = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────────── small helpers ───────────── */

/* splits text into words → characters so GSAP can stagger them */
function Split({ text }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="st-tword" aria-hidden="true">
            {[...w].map((c, j) => (
              <span className="st-tchar" key={j}>{c}</span>
            ))}
          </span>
        </Fragment>
      ))}
    </>
  );
}

/* light-weight canvas particles (paused when off-screen or tab hidden) */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    if (reduce()) return;
    const c = ref.current;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const count = window.innerWidth < 700 ? 26 : 55;
    const ps = Array.from({ length: count }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.6 + 0.4, s: Math.random() * 0.00006 + 0.00002, a: Math.random() * 0.5 + 0.15,
    }));
    let w = 0, h = 0, raf = 0, last = performance.now();
    const size = () => {
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t) => {
      const dt = t - last; last = t;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.s * dt;
        if (p.y < 0) { p.y = 1; p.x = Math.random(); }
        ctx.beginPath();
        ctx.fillStyle = `rgba(168,85,247,${p.a})`;
        ctx.arc(p.x * w, p.y * h, p.r, 0, 6.283);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    let on = true;
    const vis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && on) { last = performance.now(); raf = requestAnimationFrame(draw); }
    };
    /* only animate while the story section is on screen */
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; vis(); });
    io.observe(c);
    size();
    window.addEventListener("resize", size);
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);
  return <canvas ref={ref} className="st-particles" aria-hidden="true" />;
}

/* animated trading-chart background (draws once, no infinite loop) */
function ChartBg() {
  const pts = Array.from({ length: 48 }, (_, i) => {
    const y = 250 - i * 3.4 + Math.sin(i * 0.9) * 28 + Math.sin(i * 0.31) * 40 + Math.cos(i * 1.7) * 12;
    return [i * (1000 / 47), Math.max(30, Math.min(370, y))];
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const pts2 = pts.map(([x, y]) => [x, y + 36 + Math.sin(x / 70) * 10]);
  const line2 = pts2.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg className="st-chart" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
      {[80, 160, 240, 320].map((y) => <line key={y} x1="0" x2="1000" y1={y} y2={y} className="st-grid" />)}
      <path d={`${line} L1000 400 L0 400 Z`} className="st-area" />
      <path d={line2} className="st-line st-line--b" pathLength="1" />
      <path d={line} className="st-line" pathLength="1" />
    </svg>
  );
}

/* ───────────── INTRO ───────────── */
function StoryIntro({ onStart, play }) {
  const root = useRef(null);
  const tl = useRef(null);
  const [failed, setFailed] = useState(false);

  /* the opening animation waits (paused) until the section scrolls into view */
  useEffect(() => { if (play && tl.current) tl.current.play(); }, [play]);

  useLayoutEffect(() => {
    if (reduce()) return;
    const ctx = gsap.context(() => {
      tl.current = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
        .from(".st-in-light", { autoAlpha: 0, scale: 0.6, duration: 2.2 }, 0.5)
        .from(".st-in-title .st-tchar", { yPercent: 115, autoAlpha: 0, duration: 1.2, stagger: 0.05 }, 1.2)
        .from(".st-in-portrait", { autoAlpha: 0, scale: 0.82, y: 40, duration: 1.8, ease: "power4.out" }, 2)
        .from(".st-in-sub", { autoAlpha: 0, y: 20, duration: 1 }, 3)
        .from(".st-in-btn", { autoAlpha: 0, y: 20, duration: 0.9 }, 3.4);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="st-intro" ref={root} aria-label="Story introduction">
      <div className="st-in-light" aria-hidden="true" />
      <h2 className="st-in-title" aria-label="My journey">
        <span className="st-in-line"><Split text="MY" /></span>
        <span className="st-in-line"><Split text="JOURNEY" /></span>
      </h2>
      {!failed && (
        <div className="st-in-portrait">
          <img src={portraitImg} alt="Portrait" decoding="async" onError={() => setFailed(true)} />
        </div>
      )}
      <div className="st-in-copy">
        <p className="st-in-sub">From zero to building businesses.</p>
        <button className="st-btn st-btn--solid st-in-btn" onClick={onStart}>Start the journey</button>
      </div>
    </div>
  );
}

/* ───────────── CHAPTER ───────────── */
function Chapter({ data, num, onExplore }) {
  const root = useRef(null);
  const [failed, setFailed] = useState(false);
  const fit = Math.min(1, 4.2 / data.bg.length);

  useLayoutEffect(() => {
    if (reduce()) return;
    const el = root.current;
    const cleanups = [];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3, defaults: { ease: "power3.out" } });
      tl.from(".st-bgyear", { scale: 1.35, autoAlpha: 0, duration: 1.5 }, 0)
        .fromTo(".st-photo-mask", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "power4.inOut" }, 0.1)
        .fromTo(".st-photo-img", { scale: 1.35, filter: "blur(18px)" }, { scale: 1, filter: "blur(0px)", duration: 1.7 }, 0.1)
        .from(".st-chnum", { y: 16, autoAlpha: 0, duration: 0.6 }, 0.35)
        .from(".st-tchar", { yPercent: 115, autoAlpha: 0, duration: 0.8, stagger: 0.025 }, 0.45)
        .from(".st-reveal", { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0.9);

      if (data.cinema) {
        tl.fromTo(".st-bar", { scaleY: 7 }, { scaleY: 1, duration: 1.6, ease: "power4.inOut" }, 0);
      }
      if (data.chart) {
        tl.from(".st-line", { strokeDashoffset: 1, duration: 3, ease: "power2.inOut", stagger: 0.25 }, 0.4)
          .from(".st-area", { autoAlpha: 0, duration: 2 }, 1.2);
      }
      if (data.range) {
        /* dramatic 2024 → 2026 jump */
        const o = { v: data.range[0] };
        const span = el.querySelector(".st-range-end");
        tl.to(o, {
          v: data.range[1], duration: 1.8, ease: "power3.inOut",
          onUpdate: () => { span.textContent = Math.round(o.v); },
        }, 1.4)
          .fromTo(".st-range", { textShadow: "0 0 0 rgba(168,85,247,0)" },
            { textShadow: "0 0 40px rgba(168,85,247,.95)", duration: 0.5, yoyo: true, repeat: 1 }, 3.0);
      }

      /* subtle mouse parallax (desktop only) */
      if (window.matchMedia("(pointer: fine)").matches) {
        const bg = el.querySelector(".st-bgyear");
        const ph = el.querySelector(".st-photo-img");
        const bx = gsap.quickTo(bg, "x", { duration: 1.4, ease: "power3" });
        const by = gsap.quickTo(bg, "y", { duration: 1.4, ease: "power3" });
        const px = gsap.quickTo(ph, "xPercent", { duration: 1.2, ease: "power3" });
        const py = gsap.quickTo(ph, "yPercent", { duration: 1.2, ease: "power3" });
        const move = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          bx(nx * -50); by(ny * -30); px(nx * 2.2); py(ny * 2.2);
        };
        window.addEventListener("mousemove", move);
        cleanups.push(() => window.removeEventListener("mousemove", move));
      }
    }, root);

    return () => { cleanups.forEach((fn) => fn()); ctx.revert(); };
  }, [data.id]);

  return (
    <section className={`st-ch${data.cinema ? " st-ch--cinema" : ""}`} ref={root} aria-label={`Chapter ${num}: ${data.title}`}>
      <div className="st-ch-glow" aria-hidden="true" />
      {data.chart && <ChartBg />}

      <div className="st-bgwrap" aria-hidden="true">
        <div className="st-bgyear" style={{ "--fit": fit }}>{data.bg}</div>
      </div>

      {data.cinema && (<><div className="st-bar st-bar--top" aria-hidden="true" /><div className="st-bar st-bar--bot" aria-hidden="true" /></>)}

      <div className="st-ch-inner">
        <div className="st-ch-photo">
          <div className="st-photo-mask">
            <div className="st-photo-ph" aria-hidden="true"><span>{num}</span></div>
            {!failed && (
              <img className="st-photo-img" src={data.img} alt={data.title} loading="lazy" decoding="async" onError={() => setFailed(true)} />
            )}
            <div className="st-photo-tint" aria-hidden="true" />
          </div>
        </div>

        <div className="st-ch-text">
          <p className="st-chnum">Chapter {num}<i /> {data.year}</p>
          <h2 className="st-ch-title" aria-label={data.title}><Split text={data.title.toUpperCase()} /></h2>
          {data.second && (
            data.range
              ? null
              : <p className="st-ch-second st-reveal">{data.second}</p>
          )}
          {data.range && (
            <p className="st-ch-second st-range st-reveal">{data.range[0]} — <span className="st-range-end">{data.range[0]}</span></p>
          )}
          {data.label && <p className="st-ch-label st-reveal">{data.label}</p>}
          {data.business && (
            <p className="st-ch-biz st-reveal">
              {data.business}{data.location ? <span>{data.location}</span> : null}
            </p>
          )}
          <p className="st-ch-desc st-reveal">{data.story}</p>
          {data.achievement && <p className="st-ch-ach st-reveal">{data.achievement}</p>}

          {data.finale && (
            <div className="st-finale st-reveal">
              <p className="st-finale-msg">This is not the end.<br />It’s just the beginning.</p>
              <button className="st-btn st-btn--solid" onClick={onExplore}>Explore what’s next</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────────── NAVIGATION ───────────── */
function StoryNavigation({ index, go }) {
  const pct = ((index + 1) / N) * 100;
  return (
    <>
      {/* desktop: vertical indicator on the right */}
      <nav className="st-nav" aria-label="Chapters">
        <div className="st-nav-count"><b>{pad(index + 1)}</b><span>/ {pad(N)}</span></div>
        <div className="st-nav-ticks">
          <span className="st-nav-line"><span style={{ transform: `scaleY(${pct / 100})` }} /></span>
          {CHAPTERS.map((c, i) => (
            <button key={c.id} className={`st-tick${i === index ? " st-is-on" : ""}${i < index ? " st-is-done" : ""}`}
              onClick={() => go(i)} aria-label={`Go to chapter ${i + 1}: ${c.title}`} aria-current={i === index}>
              <em>{pad(i + 1)}</em><i />
            </button>
          ))}
        </div>
      </nav>

      {/* mobile: compact progress bar on top */}
      <div className="st-mprog" aria-hidden="true">
        <span className="st-mprog-bar"><span style={{ transform: `scaleX(${pct / 100})` }} /></span>
        <span className="st-mprog-num">{pad(index + 1)} / {pad(N)}</span>
      </div>
    </>
  );
}

/* ───────────── MAIN ───────────── */
/* Inline section: place <Story /> in App.jsx right after your certificate
   section. It scrolls with the page like every other section. */
export default function Story() {
  const [index, setIndex] = useState(-1); // -1 = intro
  const [seen, setSeen] = useState(false);
  const root = useRef(null);
  const idx = useRef(-1);
  const inView = useRef(false);
  const lock = useRef(false);
  const sweep = useRef(null);
  const tlRef = useRef(null);

  const go = useCallback((t) => {
    if (lock.current || t === idx.current || t < -1 || t >= N) return;
    const dir = t > idx.current ? 1 : -1;
    const commit = () => { idx.current = t; setIndex(t); };
    if (reduce()) { commit(); return; }

    lock.current = true;
    const el = sweep.current;
    tlRef.current = gsap.timeline({
      onComplete: () => { lock.current = false; gsap.set(el, { autoAlpha: 0 }); },
    })
      .set(el, { autoAlpha: 1, scaleX: dir, xPercent: -105 * dir })
      .to(el, { xPercent: 0, duration: 0.55, ease: "power3.in" })
      .add(commit)
      .to(el, { xPercent: 105 * dir, duration: 0.8, ease: "power3.out" }, "+=0.08");
  }, []);

  const next = useCallback(() => go(idx.current + 1), [go]);
  const prev = useCallback(() => go(idx.current - 1), [go]);
  const explore = useCallback(() => {
    const el = document.querySelector(EXPLORE_TARGET);
    if (el) el.scrollIntoView({ behavior: reduce() ? "auto" : "smooth" });
    else window.location.hash = EXPLORE_TARGET;
  }, []);

  /* know when the section is on screen */
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.intersectionRatio > 0.5;
      if (e.intersectionRatio > 0.35) setSeen(true);
    }, { threshold: [0, 0.35, 0.5, 1] });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  /* ← → keys (only while the story is on screen, so page scrolling is never blocked) */
  useEffect(() => {
    const onKey = (e) => {
      if (idx.current < 0 || !inView.current) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  /* horizontal swipe on touch screens (vertical swipes keep scrolling the page) */
  useEffect(() => {
    const el = root.current;
    let sx = 0, sy = 0;
    const ts = (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const te = (e) => {
      if (idx.current < 0) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
    };
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchend", te, { passive: true });
    return () => { el.removeEventListener("touchstart", ts); el.removeEventListener("touchend", te); };
  }, [next, prev]);

  /* preload the next chapter photo + cleanup */
  useEffect(() => {
    const n = CHAPTERS[index + 1];
    if (n) { const im = new Image(); im.src = n.img; }
  }, [index]);
  useEffect(() => () => tlRef.current?.kill(), []);

  const inChapter = index >= 0;
  const isLast = index === N - 1;

  return (
    <section className="story" id="story" ref={root} aria-label="My story – the journey from zero to today">
      <Particles />

      <div className="st-stage">
        {!inChapter && <StoryIntro key="st-intro" play={seen} onStart={() => go(0)} />}
        {inChapter && <Chapter key={CHAPTERS[index].id} data={CHAPTERS[index]} num={pad(index + 1)} onExplore={explore} />}
      </div>

      <div className="st-sweep" ref={sweep} aria-hidden="true" />

      {inChapter && (
        <>
          <StoryNavigation index={index} go={go} />
          <div className={`st-controls${isLast ? " st-controls--end" : ""}`}>
            <button className="st-btn" onClick={prev} aria-label="Previous chapter">
              {index === 0 ? "Intro" : "Previous chapter"}
            </button>
            {!isLast && <button className="st-btn st-btn--solid" onClick={next}>Next chapter</button>}
          </div>
        </>
      )}
    </section>
  );
}