import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./About.css";

/* ------------------------------------------------------------------
   PROJECT-SPECIFIC IMPORTS — adjust these paths to your real files
   (same style as: import x from "./assets/your-file.png")
   ------------------------------------------------------------------ */
import Navbar from "./Navbar"; // your existing navbar (unchanged)
import binshadPhoto from "./assets/binshad2.png"; // Binshad's real photograph
import zonexLogo from "./assets/zonex-logo.png";
import zicatLogo from "./assets/zicat-logo.png";
import digimobLogo from "./assets/digi-logo.png";
import lawbizLogo from "./assets/lawbiz-logo.png";
import taxeraLogo from "./assets/taxera-logo.png";

gsap.registerPlugin(ScrollTrigger);

/* ==================================================================
   PARTICLES  (lightweight canvas, fewer particles on weak devices)
   ================================================================== */
function Particles({ count = 60 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w, h, raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vy: Math.random() * 0.35 + 0.08,
      vx: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.6 + 0.2,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.y -= d.vy;
        d.x += d.vx;
        if (d.y < -10) {
          d.y = h + 10;
          d.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(168,85,247,${d.a})`;
        ctx.shadowColor = "#A855F7";
        ctx.shadowBlur = 12;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVis);
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [count]);

  return <canvas ref={ref} className="ab-particles" aria-hidden="true" />;
}

/* ==================================================================
   TRIMMED LOGO
   Your logo PNGs contain empty transparent space around the artwork,
   which made the logo look small and pushed it to the bottom of the box.
   This crops that empty space away (in the browser) so the logo itself
   fills the box exactly. Proportions are never changed.
   ================================================================== */
const trimCache = {};
function trimImage(src) {
  if (trimCache[src]) return trimCache[src];
  trimCache[src] = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const cx = c.getContext("2d", { willReadFrequently: true });
        cx.drawImage(img, 0, 0);
        const d = cx.getImageData(0, 0, w, h).data;
        let t = h, l = w, r = -1, b = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (d[(y * w + x) * 4 + 3] > 16) {
              if (x < l) l = x;
              if (x > r) r = x;
              if (y < t) t = y;
              if (y > b) b = y;
            }
          }
        }
        if (r < 0 || (l === 0 && t === 0 && r === w - 1 && b === h - 1)) return resolve(src);
        const cw = r - l + 1;
        const ch = b - t + 1;
        const o = document.createElement("canvas");
        o.width = cw;
        o.height = ch;
        o.getContext("2d").drawImage(c, l, t, cw, ch, 0, 0, cw, ch);
        resolve(o.toDataURL("image/png"));
      } catch (err) {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
  return trimCache[src];
}

function Logo({ src, alt, className }) {
  const [out, setOut] = useState(null);
  useEffect(() => {
    let live = true;
    trimImage(src).then((s) => {
      if (!live) return;
      setOut(s);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      live = false;
    };
  }, [src]);
  return <img className={`${className} ${out ? "ready" : ""}`} src={out || src} alt={alt} draggable="false" />;
}

/* ==================================================================
   DATA
   ------------------------------------------------------------------
   !! EDIT THE `year` VALUES BELOW to your real establishment years.
   The timeline sorts itself by year automatically.
   ================================================================== */
const COMPANIES = [
  {
    no: "01",
    name: "TAXERA",
    word: "COMPLY",
    year: "2020", // <-- EDIT
    category: "Taxation & Financial Services",
    desc: "TAXERA focuses on taxation and financial compliance services, helping individuals and businesses manage their tax-related responsibilities and financial documentation.",
    logo: taxeraLogo,
  },
  {
    no: "02",
    name: "DIGIMOB",
    word: "MOBILE",
    year: "2021", // <-- EDIT
    category: "Mobile Shop & Technology Retail",
    desc: "DIGIMOB is a mobile retail business focused on smartphones, mobile accessories and technology products, bringing customers convenient access to modern mobile solutions.",
    logo: digimobLogo,
  },
  {
    no: "03",
    name: "LAWBIZ ASSOCIATES",
    word: "ADVISE",
    year: "2022", // <-- EDIT
    category: "Business Consultancy",
    desc: "LAWBIZ ASSOCIATES provides business consultancy and professional advisory support to help entrepreneurs and businesses navigate challenges, improve operations and make informed business decisions.",
    logo: lawbizLogo,
  },
  {
    no: "04",
    name: "ZONEX",
    word: "TRADE",
    year: "2023", // <-- EDIT
    category: "Trading Institute",
    desc: "ZONEX is a trading education institute focused on helping individuals understand financial markets, develop trading knowledge and build disciplined trading strategies.",
    logo: zonexLogo,
  },
  {
    no: "05",
    name: "ZICAT",
    word: "ADVERTISE",
    year: "2026", // <-- EDIT
    category: "Advertising & Digital Marketing Agency",
    desc: "ZICAT is a creative advertising and digital marketing agency offering branding, digital marketing, creative campaigns, social media management and business growth solutions.",
    logo: zicatLogo,
  },
];

/* timeline = same companies, ordered by establishment year */
const TIMELINE = [...COMPANIES].sort((a, b) => Number(a.year) - Number(b.year));

/* ==================================================================
   MAIN COMPONENT
   ================================================================== */
export default function About() {
  const root = useRef(null);

  /* ---- all GSAP animation ---- */
  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lite =
      window.innerWidth < 900 ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      reduced;
    root.current.classList.toggle("is-lite", lite);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      window.scrollTo(0, 0);

      /* hidden initial states for main section */
      gsap.set(q(".hero-line > span"), { yPercent: 115 });
      gsap.set(q(".hero-fade"), { autoAlpha: 0, x: -40 });
      gsap.set(q(".photo-mask"), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(q(".photo-img"), { scale: 1.25 });
      gsap.set(q(".photo-chrome"), { autoAlpha: 0 });

      /* text reveal from left, plays immediately */
      gsap
        .timeline({ defaults: { ease: "power4.out" }, delay: 0.2 })
        .to(q(".hero-line > span"), { yPercent: 0, duration: 1.3, stagger: 0.12 })
        .to(q(".hero-fade"), { autoAlpha: 1, x: 0, duration: 1, stagger: 0.14 }, "-=0.9");

      /* photo reveal from bottom, plays when the photo is on screen (works on mobile too) */
      gsap
        .timeline({
          defaults: { ease: "power4.out" },
          scrollTrigger: { trigger: ".ab-photo", start: "top 88%", once: true },
          delay: 0.2,
        })
        .to(q(".photo-mask"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" }, 0)
        .to(q(".photo-img"), { scale: 1.05, duration: 2, ease: "power3.out" }, 0)
        .to(q(".photo-chrome"), { autoAlpha: 1, duration: 1.2 }, 0.9)
        .fromTo(q(".photo-sweep"), { xPercent: -130 }, { xPercent: 130, duration: 1.6, ease: "power2.inOut" }, 0.9);

      /* ============ MAIN SECTION: parallax + scroll typography ============ */
      gsap.to(q(".photo-img"), {
        yPercent: -9,
        ease: "none",
        scrollTrigger: { trigger: ".ab-main", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q(".ab-main-bgword"), {
        xPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: ".ab-main", start: "top top", end: "bottom top", scrub: true },
      });

      /* ============ section headings (scroll-triggered lines) ============ */
      q(".sc-heading").forEach((h) => {
        gsap.fromTo(
          h.querySelectorAll(".sc-line > span"),
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.2,
            stagger: 0.12,
            ease: "power4.out",
            scrollTrigger: { trigger: h, start: "top 82%", once: true },
          }
        );
      });
      q(".sc-fade").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }
        );
      });

      /* ============ VENTURES (pinned on desktop, stacked on mobile) ============ */
      const panels = q(".vent-panel");
      const dots = q(".vent-dot");
      const bgWords = q(".vent-bgword");
      const setActive = (idx) => {
        panels.forEach((p, i) => p.classList.toggle("active", i === idx));
        dots.forEach((d, i) => d.classList.toggle("on", i === idx));
        bgWords.forEach((w, i) => w.classList.toggle("on", i === idx));
      };

      const mm = gsap.matchMedia();

      mm.add("(min-width: 900px)", () => {
        const n = panels.length;
        gsap.set(panels, { autoAlpha: 0 });
        gsap.set(panels[0], { autoAlpha: 1 });
        setActive(0);

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: ".vent-stage",
            start: "top top",
            end: () => `+=${n * 90}%`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            onUpdate: () => {
              const idx = Math.max(0, Math.min(n - 1, Math.floor((tl.time() + 0.7) / 3)));
              if (!panels[idx].classList.contains("active")) setActive(idx);
            },
          },
        });

        for (let i = 1; i < n; i++) {
          tl.to(panels[i - 1], { autoAlpha: 0, yPercent: -10, scale: 0.94, rotateX: 10, duration: 1 }, i * 3 - 1)
            .fromTo(
              panels[i],
              { autoAlpha: 0, yPercent: 10, scale: 1.06, rotateX: -10 },
              { autoAlpha: 1, yPercent: 0, scale: 1, rotateX: 0, duration: 1 },
              i * 3 - 0.7
            );
        }
        tl.to({}, { duration: 1.8 }, (n - 1) * 3 + 0.3);

        return () => {
          gsap.set(panels, { clearProps: "all" });
        };
      });

      mm.add("(max-width: 899px)", () => {
        gsap.set(panels, { autoAlpha: 1 });
        panels.forEach((p, i) => {
          ScrollTrigger.create({
            trigger: p,
            start: "top 65%",
            end: "bottom 35%",
            onToggle: (self) => {
              if (self.isActive) setActive(i);
            },
          });
          gsap.fromTo(
            p.querySelectorAll(".vp-copy > *, .vp-visual"),
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: { trigger: p, start: "top 80%", once: true },
            }
          );
        });
      });

      /* ============ COMPANY TIMELINE (replaces the old graph) ============ */
      gsap.fromTo(
        q(".tl-line-fill"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ".tl-list", start: "top 70%", end: "bottom 65%", scrub: 1 },
        }
      );
      q(".tl-item").forEach((item) => {
        const side = item.classList.contains("tl-right") ? 60 : -60;
        gsap
          .timeline({ scrollTrigger: { trigger: item, start: "top 82%", once: true } })
          .fromTo(
            item.querySelector(".tl-year > span"),
            { yPercent: 115 },
            { yPercent: 0, duration: 1.2, ease: "power4.out" },
            0
          )
          .fromTo(
            item.querySelector(".tl-node"),
            { scale: 0, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.7, ease: "back.out(2.2)" },
            0.15
          )
          .fromTo(
            item.querySelector(".tl-card"),
            { autoAlpha: 0, x: side },
            { autoAlpha: 1, x: 0, duration: 1.1, ease: "power3.out" },
            0.25
          );
      });

      gsap.to(q(".vision-bgword"), {
        xPercent: -22,
        ease: "none",
        scrollTrigger: { trigger: ".ab-vision", start: "top bottom", end: "bottom top", scrub: true },
      });

      /* ============ FINAL ============ */
      gsap.to(q(".final-bgword"), {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: ".ab-final", start: "top bottom", end: "bottom top", scrub: true },
      });

      return () => mm.revert();
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 600);

    return () => {
      window.removeEventListener("load", refresh);
      clearTimeout(t);
      ctx.revert();
    };
  }, []);

  /* ---- 3D tilt on photo (desktop) ---- */
  const onTilt = (e) => {
    if (root.current.classList.contains("is-lite")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(e.currentTarget.querySelector(".photo-3d"), {
      rotateY: px * 12,
      rotateX: -py * 10,
      duration: 0.8,
      ease: "power3.out",
    });
  };
  const resetTilt = (e) =>
    gsap.to(e.currentTarget.querySelector(".photo-3d"), { rotateY: 0, rotateX: 0, duration: 1, ease: "power3.out" });

  const goVentures = (e) => {
    e.preventDefault();
    document.querySelector("#ventures")?.scrollIntoView({ behavior: "smooth" });
  };

  const Lines = ({ lines, className = "" }) =>
    lines.map((t, i) => (
      <span className={`${className} sc-line hero-line`} key={i}>
        <span>{t}</span>
      </span>
    ));

  return (
    <div className="ab-root" ref={root}>
      {/* Existing navbar — unchanged */}
      <Navbar />

      <main>
        {/* ============ MAIN ABOUT ============ */}
        <section className="ab-main" id="about">
          <div className="ab-main-bgword" aria-hidden="true">
            BINSHAD
          </div>
          <div className="ab-main-glow" aria-hidden="true" />
          <Particles count={window.innerWidth < 900 ? 18 : 45} />

          <div className="ab-main-inner">
            <div className="ab-main-copy">
              <h2 className="ab-title">
                <Lines lines={["MORE THAN", "A BUSINESSMAN."]} />
              </h2>
              <p className="ab-roles hero-fade">An Entrepreneur. A Trader. An Investor. A Visionary.</p>
              <div className="ab-desc">
                <p className="hero-fade">
                  Binshad is a businessman, trader and entrepreneur with a passion for building businesses, exploring
                  opportunities and creating meaningful ventures across different industries.
                </p>
                <p className="hero-fade">
                  With interests spanning trading, digital advertising, technology, business consulting and taxation,
                  he brings multiple business ventures together under one entrepreneurial vision.
                </p>
              </div>
            </div>

            <div className="ab-photo ab-tilt" onPointerMove={onTilt} onPointerLeave={resetTilt}>
              <div className="photo-3d">
                <div className="photo-chrome rim" />
                <div className="photo-mask">
                  <img className="photo-img" src={binshadPhoto} alt="Binshad" draggable="false" />
                  <div className="photo-tint" />
                  <div className="photo-sweep" />
                </div>
                <div className="photo-chrome orb orb1" />
                <div className="photo-chrome orb orb2" />
                <div className="photo-chrome orb orb3" />
              </div>
            </div>
          </div>
        </section>

        {/* ============ FIVE VENTURES ============ */}
        <section className="ab-ventures" id="ventures">
          <header className="vent-head">
            <h2 className="sc-heading vent-title">
              <span className="sc-line">
                <span>FIVE VENTURES.</span>
              </span>
              <span className="sc-line">
                <span>ONE VISION.</span>
              </span>
            </h2>
            <p className="sc-fade vent-sub">
              Building businesses across industries through innovation, strategy and entrepreneurship.
            </p>
          </header>

          <div className="vent-stage">
            <div className="vent-bg" aria-hidden="true">
              {COMPANIES.map((c, i) => (
                <span key={c.name} className={`vent-bgword ${i === 0 ? "on" : ""}`}>
                  {c.word}
                </span>
              ))}
            </div>

            <div className="vent-dots" aria-hidden="true">
              {COMPANIES.map((c, i) => (
                <span key={c.name} className={`vent-dot ${i === 0 ? "on" : ""}`}>
                  <b>{c.no}</b>
                </span>
              ))}
            </div>

            {COMPANIES.map(({ no, name, category, desc, logo }) => (
              <article className="vent-panel" key={name}>
                <div className="vp-copy">
                  <span className="vp-no">{no}</span>
                  <div className="vp-logo">
                    <img src={logo} alt={`${name} logo`} loading="lazy" draggable="false" />
                  </div>
                  <h3 className="vp-name">{name}</h3>
                  <p className="vp-cat">{category}</p>
                  <p className="vp-desc">{desc}</p>
                </div>
                <div className="vp-visual">
                  {/* CHANGE 1: box now shows ONLY the company logo */}
                  <div className="vp-card">
                    <Logo className="vp-card-logo" src={logo} alt={`${name} logo`} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ============ VISION + COMPANY TIMELINE ============ */}
        <section className="ab-vision">
          <div className="vision-bgword" aria-hidden="true">
            BEYOND LIMITS
          </div>
          <div className="vis-wrap">
            <h2 className="sc-heading vision-title">
              <span className="sc-line">
                <span>BUILDING BEYOND</span>
              </span>
              <span className="sc-line">
                <span>LIMITS.</span>
              </span>
            </h2>
            <p className="sc-fade vision-desc">
              From financial markets to digital creativity, technology and business consultancy, Binshad's
              entrepreneurial journey reflects a continuous drive to explore opportunities and build businesses
              across different industries.
            </p>

            {/* CHANGE 2: establishment timeline (replaces the old graph) */}
            <ol className="tl-list">
              <span className="tl-line" aria-hidden="true">
                <span className="tl-line-fill" />
              </span>
              {TIMELINE.map((c, i) => (
                <li className={`tl-item ${i % 2 === 0 ? "tl-left" : "tl-right"}`} key={c.name}>
                  <div className="tl-year">
                    <span>{c.year}</span>
                  </div>
                  <span className="tl-node" aria-hidden="true" />
                  <div className="tl-card">
                    <div className="tl-logo">
                      <Logo className="tl-logo-img" src={c.logo} alt={`${c.name} logo`} />
                    </div>
                    <h3 className="tl-name">{c.name}</h3>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ FINAL ============ */}
        <section className="ab-final">
          <div className="final-bgword" aria-hidden="true">
            VISION
          </div>
          <Particles count={window.innerWidth < 900 ? 16 : 40} />
          <div className="final-inner">
            <h2 className="sc-heading final-title">
              {["ONE VISION.", "MULTIPLE VENTURES.", "ENDLESS POSSIBILITIES."].map((t) => (
                <span className="sc-line" key={t}>
                  <span>{t}</span>
                </span>
              ))}
            </h2>
            <p className="sc-fade final-sub">
              Explore the businesses and ideas behind Binshad's entrepreneurial journey.
            </p>
            <a href="#ventures" className="sc-fade ab-btn" onClick={goVentures}>
              <span className="btn-border" />
              <span className="btn-label">EXPLORE MY VENTURES</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}