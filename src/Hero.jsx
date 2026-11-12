import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import person from "./assets/binshad.png"; // src/assets/person.png  (use a TRANSPARENT cut-out PNG)
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------ CONTENT ------------------------------ */
const CONTENT = {
  nameLines: ["BINSHAD"], // <- change to your name
  role: "TRADER / INVESTOR / ENTREPRENEUR",
  channel: "FXBK | BINSHAD",
  description: "Specializing in Finance, Business consulting.",
  topLeft: ["TRADER", "INVESTOR"],
  topRight: "AVAILABLE FOR COLLABORATIONS",
  stats: [
    { value: 6.5, decimals: 1, suffix: "+", label: "Years Experience" },
    { value: 1000, decimals: 0, suffix: "+", label: "Total Students" },
    { value: 2, decimals: 0, suffix: "CR+", label: "Fund manage" },
  ],
};

const LETTERS = "PORTFOLIO".split("");

const StarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0c.7 6.3 5.7 11.3 12 12-6.3.7-11.3 5.7-12 12-.7-6.3-5.7-11.3-12-12C6.3 11.3 11.3 6.3 12 0z" />
  </svg>
);

export default function Hero() {
  const root = useRef(null);

  // deterministic floating dots + 4-point stars
  const floaters = useMemo(() => {
    const rnd = (i, n) => {
      const x = Math.sin(i * 999 + n * 77) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 30 }, (_, i) => ({
      star: i % 5 === 0,
      left: rnd(i, 1) * 100,
      top: rnd(i, 2) * 100,
      size: i % 5 === 0 ? 8 + rnd(i, 3) * 10 : 1.5 + rnd(i, 3) * 2.5,
      o: 0.25 + rnd(i, 4) * 0.55,
    }));
  }, []);

  // trim transparent padding around person.png so the cut-out always sits on the bottom edge
  const [src, setSrc] = useState(person);
  useEffect(() => {
    let url;
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth, h = img.naturalHeight;
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        if (x.getImageData(0, 0, 1, 1).data[3] > 250)
          console.warn("[Hero] person.png has an opaque background. Use a transparent cut-out so the photo overlaps PORTFOLIO.");
        const d = x.getImageData(0, 0, w, h).data;
        let t = h, b = 0, l = w, r = 0;
        for (let py = 0; py < h; py += 2)
          for (let px = 0; px < w; px += 2)
            if (d[(py * w + px) * 4 + 3] > 12) {
              if (py < t) t = py; if (py > b) b = py;
              if (px < l) l = px; if (px > r) r = px;
            }
        if (b <= t || r <= l) return;
        const cw = r - l + 2, ch = b - t + 2;
        if (cw > w * 0.985 && ch > h * 0.985) return; // already tight
        const o = document.createElement("canvas");
        o.width = cw; o.height = ch;
        o.getContext("2d").drawImage(c, l, t, cw, ch, 0, 0, cw, ch);
        o.toBlob((blob) => { if (blob) { url = URL.createObjectURL(blob); setSrc(url); } }, "image/png");
      } catch { /* ignore */ }
    };
    img.src = person;
    return () => { if (url) URL.revokeObjectURL(url); };
  }, []);

  useLayoutEffect(() => {
    const el = root.current;
    const q = gsap.utils.selector(el);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const counters = q(".pfh-stat__count").map((n) => ({
        n, to: parseFloat(n.dataset.value), d: parseInt(n.dataset.decimals, 10), obj: { v: 0 },
      }));

      /* ------------------------ final (static) state ------------------------ */
      if (reduce) {
        counters.forEach(({ n, to, d }) => (n.textContent = to.toFixed(d)));
        gsap.set(q(".pfh__sil, .pfh__burst, .pfh__rays"), { opacity: 0 });
        return;
      }

      /* --------------------------- initial states --------------------------- */
      gsap.set(q(".pfh-pf-letter"), { opacity: 0, x: -90 });
      gsap.set(q(".pfh__burst"), { opacity: 0, scale: 0.2 });
      gsap.set(q(".pfh__rays"), { opacity: 0, scale: 0.6, rotate: -20 });
      gsap.set(q(".pfh__stack"), { yPercent: 10 });
      gsap.set(q(".pfh__sil"), { opacity: 0 });
      gsap.set(q(".pfh__photo"), { clipPath: "inset(100% -40% -2% -40%)" });
      gsap.set(q(".pfh-sig-text"), { strokeDasharray: 900, strokeDashoffset: 900, fillOpacity: 0 });
      gsap.set(q(".pfh-mask-in"), { yPercent: 118 });
      gsap.set(q(".pfh-fade-in"), { opacity: 0, y: 16 });
      gsap.set(q(".pfh-info-reveal"), { clipPath: "inset(0 100% 0 0)", opacity: 0 });
      gsap.set(q(".pfh__star"), { scale: 0, rotate: -180, opacity: 0 });
      gsap.set(q(".pfh-stat"), { opacity: 0, x: 40, scale: 0.96 });
      gsap.set(q(".pfh-stat__line"), { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(q(".pfh__floater"), { opacity: 0 });

      /* ------------------- ~9s intro timeline (art directed) ------------------- */
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // 0 – 1.5s : PORTFOLIO letters emerge from darkness with horizontal movement
      tl.to(q(".pfh-pf-letter"), { opacity: 1, x: 0, duration: 1.15, stagger: 0.13, ease: "power3.out" }, 0.15);
      // purple light streak running through the letters (metallic reflection)
      tl.fromTo(q(".pfh-pf-face"), { "--sx": "170%" }, { "--sx": "-70%", duration: 1.5, stagger: 0.1, ease: "power2.inOut" }, 0.5);

      // 1.5 – 2.5s : purple light burst behind center-right, silhouette appears
      tl.to(q(".pfh__burst"), { opacity: 1, scale: 1.25, duration: 1.2, ease: "power3.out" }, 1.5);
      tl.to(q(".pfh__rays"), { opacity: 0.55, scale: 1.1, rotate: 0, duration: 1.8, ease: "power2.out" }, 1.5);
      tl.to(q(".pfh__stack"), { yPercent: 0, duration: 2.0, ease: "expo.out" }, 1.7);
      tl.to(q(".pfh__sil"), { opacity: 1, duration: 0.9, ease: "power2.out" }, 1.7);

      // 2.5 – 3.5s : real photo is revealed from the silhouette (mask wipe), glow settles
      tl.to(q(".pfh__photo"), { clipPath: "inset(-40% -40% -2% -40%)", duration: 1.2, ease: "power3.inOut" }, 2.5);
      tl.to(q(".pfh__sil"), { opacity: 0.32, duration: 1.6, ease: "power2.inOut" }, 3.1);
      tl.to(q(".pfh__burst"), { opacity: 0.28, scale: 1.05, duration: 2, ease: "power2.inOut" }, 3.1);
      tl.to(q(".pfh__rays"), { opacity: 0.12, duration: 2, ease: "power2.inOut" }, 3.1);

      // 3.5 – 5s : "Hello, I'm" draws itself, name reveals line by line
      tl.to(q(".pfh-sig-text"), { strokeDashoffset: 0, duration: 1.4, ease: "power1.inOut" }, 3.5);
      tl.to(q(".pfh-sig-text"), { fillOpacity: 1, duration: 0.5, ease: "power1.out" }, 4.6);
      tl.to(q(".pfh-name-line .pfh-mask-in"), { yPercent: 0, duration: 1.0, stagger: 0.16 }, 3.9);

      // 5 – 7s : information, staggered fade + slide + subtle scale
      tl.to(q(".pfh-role .pfh-mask-in"), { yPercent: 0, duration: 0.9 }, 5.0);
      tl.to(q(".pfh-intro-fade"), { opacity: 1, y: 0, duration: 0.9, stagger: 0.15 }, 5.2);
      tl.to(q(".pfh-info-reveal"), { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 1.0, stagger: 0.14, ease: "power3.inOut" }, 5.4);
      tl.to(q(".pfh__star"), { scale: 1, rotate: 0, opacity: 1, duration: 1.1, ease: "back.out(1.5)" }, 5.7);
      tl.to(q(".pfh-stat"), { opacity: 1, x: 0, scale: 1, duration: 0.9, stagger: 0.17 }, 5.8);
      tl.to(q(".pfh-stat__line"), { scaleX: 1, duration: 0.9, stagger: 0.17, ease: "power3.inOut" }, 6.0);
      counters.forEach(({ n, to, d, obj }, i) => {
        tl.to(obj, { v: to, duration: 1.6, ease: "power2.out", onUpdate: () => (n.textContent = obj.v.toFixed(d)) }, 5.9 + i * 0.17);
      });
      tl.to(q(".pfh__floater"), { opacity: (i, t) => parseFloat(t.dataset.o), duration: 1.5, stagger: 0.04 }, 4.5);

      // 7 – 9s : cinematic perspective warp, PORTFOLIO moves toward the camera (photo stays put)
      tl.to(q(".pfh__title"), { scale: 1.3, rotationX: 9, rotationY: -7, yPercent: -3, duration: 1.9, ease: "power3.inOut" }, 7.1);
      tl.to(q(".pfh__title-par"), { opacity: 0.9, duration: 1.9, ease: "power2.inOut" }, 7.1);
      tl.to(q(".pfh__burst"), { opacity: 0.12, duration: 1.9 }, 7.1);

      /* ----------------------------- ambient loops ----------------------------- */
      q(".pfh__floater").forEach((p, i) => {
        gsap.to(p, { y: "random(-45, 45)", x: "random(-25, 25)", rotate: p.dataset.star ? 90 : 0,
          duration: "random(4, 8)", ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.05 });
      });
      gsap.to(q(".pfh__star"), { scale: 1.2, duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 7 });

      /* ------------- parallax: mouse (x) + ScrollTrigger scrub (y / scale) ------------- */
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (min-width: 901px)", () => {
        const tx = gsap.quickTo(q(".pfh__title-par"), "x", { duration: 1.4, ease: "power3.out" });
        const px = gsap.quickTo(q(".pfh__portrait-par"), "x", { duration: 1.1, ease: "power3.out" });
        const onMove = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          tx(nx * -28);
          px(nx * 18);
        };
        el.addEventListener("mousemove", onMove);
        return () => el.removeEventListener("mousemove", onMove);
      });

      const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      gsap.to(q(".pfh__title-scroll"), { yPercent: -10, scale: 1.12, ease: "none", scrollTrigger: st });
      gsap.to(q(".pfh__portrait-scroll"), { yPercent: 6, ease: "none", scrollTrigger: st });
      gsap.to(q(".pfh__intro, .pfh__stats"), {
        y: -50, opacity: 0.15, ease: "none",
        scrollTrigger: { trigger: el, start: "55% top", end: "bottom top", scrub: true },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="pfh" ref={root} id="home">
      <div className="pfh__vignette" aria-hidden="true" />
      <div className="pfh__floaters" aria-hidden="true">
        {floaters.map((p, i) => (
          <span
            key={i}
            className={`pfh__floater ${p.star ? "pfh-is-star" : ""}`}
            data-o={p.o}
            data-star={p.star ? "1" : undefined}
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          >
            {p.star && <StarIcon />}
          </span>
        ))}
      </div>

      {/* top row */}
      <div className="pfh__info pfh__info--left">
        <span className="pfh-info-reveal pfh-info-purple">{CONTENT.topLeft[0]}</span>
        <span className="pfh-info-reveal">{CONTENT.topLeft[1]}</span>
      </div>
      <div className="pfh__info pfh__info--right">
        <span className="pfh-info-reveal">{CONTENT.topRight}</span>
        <StarIcon className="pfh__star" />
      </div>

      {/* giant PORTFOLIO + light burst + portrait */}
      <div className="pfh__stage">
        <div className="pfh__burst" aria-hidden="true" />
        <div className="pfh__rays" aria-hidden="true" />

        <div className="pfh__title-scroll">
          <div className="pfh__title-par">
            <h1 className="pfh__title" aria-label="Portfolio">
              <span className="pfh-pf-row" aria-hidden="true">
                {LETTERS.map((ch, i) => (
                  <Fragment key={i}>
                    <span className="pfh-pf-letter" data-char={ch}>
                      <span className="pfh-pf-face">{ch}</span>
                    </span>
                    {i === 3 && <span className="pfh-pf-break" />}
                  </Fragment>
                ))}
              </span>
            </h1>
          </div>
        </div>

        <div className="pfh__portrait">
          <div className="pfh__portrait-scroll">
            <div className="pfh__portrait-par">
              <div className="pfh__stack">
                {/* glowing back-lit silhouette (same image, blacked out) */}
                <img className="pfh__sil" src={src} alt="" aria-hidden="true" draggable="false" />
                {/* the real photograph, unmodified */}
                <img className="pfh__photo" src={src} alt="Portrait" draggable="false" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* introduction (left) */}
      <div className="pfh__intro">
        <svg className="pfh-sig" viewBox="0 0 330 96" role="img" aria-label="Hello, I'm">
          <text className="pfh-sig-text" x="6" y="70">Hello, I&apos;m</text>
        </svg>
        <h2 className="pfh-name" aria-label={CONTENT.nameLines.join(" ")}>
          {CONTENT.nameLines.map((l) => (
            <span className="pfh-name-line" key={l}><span className="pfh-mask-in">{l}</span></span>
          ))}
        </h2>
        <p className="pfh-role"><span className="pfh-mask-in">{CONTENT.role}</span></p>
        <p className="pfh-channel pfh-fade-in pfh-intro-fade">{CONTENT.channel}</p>
        <p className="pfh-desc pfh-fade-in pfh-intro-fade">{CONTENT.description}</p>
      </div>

      {/* statistics (right) */}
      <ul className="pfh__stats">
        {CONTENT.stats.map((s) => (
          <li className="pfh-stat" key={s.label}>
            <div className="pfh-stat__row">
              <span className="pfh-stat__num">
                <span className="pfh-stat__count" data-value={s.value} data-decimals={s.decimals}>0</span>
                <span className="pfh-stat__suffix">{s.suffix}</span>
              </span>
              <span className="pfh-stat__label">{s.label}</span>
            </div>
            <span className="pfh-stat__line" />
          </li>
        ))}
      </ul>
    </section>
  );
}