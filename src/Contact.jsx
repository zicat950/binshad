import { useEffect, useRef, useState } from "react";
import portrait from "./assets/binshad4.png";
import { buildWhatsAppUrl, contactData } from "./Contactdata";
import "./Contact.css";

/* ---------------- Icons ---------------- */
const sp = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
};
const ICONS = {
  instagram: (
    <svg {...sp}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  ),
  facebook: (
    <svg {...sp}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  linkedin: (
    <svg {...sp}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  whatsapp: (
    <svg {...sp}>
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
      <path d="M9.2 8.6c.2 2.4 2.6 5.4 5.9 6l1.1-1.3-1.9-.9-.9.8c-1-.4-1.9-1.3-2.3-2.3l.8-.9-.9-1.9z" />
    </svg>
  ),
};

/* ---------------- Letter-by-letter reveal ---------------- */
function Line({ text, start = 0, mod = "" }) {
  return (
    <span className={`ct-line ${mod}`} aria-hidden="true">
      {Array.from(text).map((ch, i) => (
        <span className="ct-char" key={i} style={{ "--i": start + i }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/* ---------------- Soft floating particles ---------------- */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return undefined;
    const ctx = c.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, dots = [];

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(18, Math.min(46, Math.floor((w * h) / 30000)));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.4 + 0.4,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const p = dots[i];
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = "rgba(168,85,247,.7)";
        ctx.fill();
        for (let j = i + 1; j < dots.length; j++) {
          const q = dots[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.strokeStyle = `rgba(114,0,255,${(1 - d / 120) * 0.25})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };

    setup();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", setup);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setup);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return <canvas ref={ref} className="ct-particles" aria-hidden="true" />;
}

/* ---------------- Social link ---------------- */
function Social({ item, delay }) {
  const on = Boolean(item.url);
  return (
    <li className="ct-rise" style={{ "--d": `${delay}s` }}>
      <a
        className={`ct-social${on ? "" : " is-pending"}`}
        href={on ? item.url : undefined}
        target={on ? "_blank" : undefined}
        rel={on ? "noopener noreferrer" : undefined}
        aria-disabled={!on}
        title={on ? item.label : "Add this URL in contactData.js"}
        onClick={(e) => !on && e.preventDefault()}
      >
        <span className="ct-social__icon">{ICONS[item.id]}</span>
        <span className="ct-social__text">
          <b>{item.label}</b>
          <small>{item.tagline}</small>
        </span>
        <span className="ct-social__cta">
          {item.cta} <i aria-hidden="true">↗</i>
        </span>
      </a>
    </li>
  );
}

/* ---------------- Page ---------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contact() {
  const rootRef = useRef(null);
  const raf = useRef(0);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // mouse-following light + subtle parallax (CSS variables only)
  const onMove = (e) => {
    if (raf.current) return;
    const { clientX: x, clientY: y } = e;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${x - r.left}px`);
      el.style.setProperty("--my", `${y - r.top}px`);
      el.style.setProperty("--nx", ((x / window.innerWidth) * 2 - 1).toFixed(3));
      el.style.setProperty("--ny", ((y / window.innerHeight) * 2 - 1).toFixed(3));
    });
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
    if (status) setStatus("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email.";
    if (form.message.trim().length < 5) next.message = "Write a short message.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const text = [
      "Hello! I visited your portfolio and would like to connect with you.",
      "",
      `*Name:* ${form.name.trim()}`,
      `*Email:* ${form.email.trim()}`,
      "",
      "*Message:*",
      form.message.trim(),
    ].join("\n");
    window.open(buildWhatsAppUrl(text), "_blank", "noopener,noreferrer");
    setStatus("Opening WhatsApp…");
    setForm({ name: "", email: "", message: "" });
  };

  const { whatsapp, location, socials, year } = contactData;

  return (
    <main
      ref={rootRef}
      id="contact"
      className={`ct-page${ready ? " is-ready" : ""}`}
      onPointerMove={onMove}
    >
      <div className="ct-bg" aria-hidden="true">
        <span className="ct-bg__glow ct-bg__glow--a" />
        <span className="ct-bg__glow ct-bg__glow--b" />
        <span className="ct-bg__cursor" />
      </div>
      <Particles />

      <div className="ct-grid">
        {/* LEFT — introduction */}
        <section className="ct-intro" aria-labelledby="ct-title">
          <h1 id="ct-title" className="ct-title" aria-label="Let's make something happen.">
            <Line text="LET'S" start={0} />
            <Line text="MAKE" start={6} />
            <Line text="SOMETHING" start={11} mod="ct-line--accent" />
            <Line text="HAPPEN." start={21} mod="ct-line--outline" />
          </h1>

          <p className="ct-lede ct-rise" style={{ "--d": "1.1s" }}>
            Have an opportunity, business idea, or collaboration in mind?{" "}
            <em>Let&apos;s connect and create something meaningful.</em>
          </p>

          <div className="ct-where ct-rise" style={{ "--d": "1.25s" }}>
            <span className="ct-where__dot" aria-hidden="true" />
            <span>
              <strong>{location.availability}</strong>
              <small>{location.place}</small>
            </span>
          </div>

          <div className="ct-msg ct-rise" style={{ "--d": "1.4s" }}>
            <button
              type="button"
              className="ct-msg__toggle"
              aria-expanded={open}
              aria-controls="ct-msg-panel"
              onClick={() => setOpen((o) => !o)}
            >
              <span>HAVE SOMETHING TO SAY?</span>
              <span className="ct-msg__plus" aria-hidden="true" />
            </button>
            <div id="ct-msg-panel" className={`ct-msg__panel${open ? " is-open" : ""}`}>
              <form className="ct-msg__form" onSubmit={onSubmit} noValidate>
                <label className="ct-field">
                  <span>Your Name</span>
                  <input
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={onChange}
                    tabIndex={open ? 0 : -1}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <em role="alert">{errors.name}</em>}
                </label>
                <label className="ct-field">
                  <span>Your Email</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={onChange}
                    tabIndex={open ? 0 : -1}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <em role="alert">{errors.email}</em>}
                </label>
                <label className="ct-field">
                  <span>Your Message</span>
                  <textarea
                    name="message"
                    rows={2}
                    value={form.message}
                    onChange={onChange}
                    tabIndex={open ? 0 : -1}
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message && <em role="alert">{errors.message}</em>}
                </label>
                <div className="ct-msg__actions">
                  <button type="submit" className="ct-send" tabIndex={open ? 0 : -1}>
                    SEND MESSAGE ↗
                  </button>
                  <span className="ct-msg__status" role="status">
                    {status}
                  </span>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* CENTER — portrait */}
        <section className="ct-stage" aria-label="Portrait">
          <div className="ct-stage__inner">
            <span className="ct-ring ct-ring--1" aria-hidden="true" />
            <span className="ct-ring ct-ring--2" aria-hidden="true" />
            <span className="ct-ring ct-ring--3" aria-hidden="true">
              <i />
            </span>
            <div className="ct-portrait">
              <div className="ct-portrait__mask">
                <img src={portrait} alt="Portrait" draggable="false" />
                <span className="ct-portrait__rim" aria-hidden="true" />
                <span className="ct-portrait__light" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT — connections */}
        <section className="ct-connect" aria-label="Direct connections">
          <ul className="ct-socials">
            {socials.map((s, i) => (
              <Social key={s.id} item={s} delay={0.9 + i * 0.1} />
            ))}
            <li className="ct-rise" style={{ "--d": "1.2s" }}>
              <a
                className="ct-social ct-social--wa"
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="ct-social__icon">{ICONS.whatsapp}</span>
                <span className="ct-social__text">
                  <b>WHATSAPP</b>
                  <small>Let&apos;s talk directly.</small>
                </span>
                <span className="ct-social__cta">
                  MESSAGE ME <i aria-hidden="true">↗</i>
                </span>
              </a>
            </li>
          </ul>

          <a
            className="ct-cta ct-rise"
            style={{ "--d": "1.4s" }}
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="ct-cta__wa" aria-hidden="true">
              {ICONS.whatsapp}
            </span>
            <span className="ct-cta__label">START A CONVERSATION ↗</span>
            <span className="ct-cta__shine" aria-hidden="true" />
          </a>
          <p className="ct-number ct-rise" style={{ "--d": "1.5s" }}>
            {whatsapp.display}
          </p>
        </section>
      </div>

      {/* BOTTOM BAR */}
      <footer className="ct-bar">
        <span className="ct-bar__run" aria-hidden="true" />
        <span>© {year} ALL RIGHTS RESERVED.</span>
        <span className="ct-bar__mid">{location.place}</span>
        <nav className="ct-bar__links" aria-label="Social links">
          {socials.map((s, i) => (
            <span key={s.id}>
              <a
                href={s.url || undefined}
                target={s.url ? "_blank" : undefined}
                rel={s.url ? "noopener noreferrer" : undefined}
                aria-disabled={!s.url}
                onClick={(e) => !s.url && e.preventDefault()}
              >
                {s.label}
              </a>
              {i < socials.length - 1 ? " / " : ""}
            </span>
          ))}
        </nav>
      </footer>
    </main>
  );
}