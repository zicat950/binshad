import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

const LINKS = [
  { label: "HOME", href: "#home" },
  { label: "ABOUT", href: "#about" },
  { label: "CERTIFICATIONS", href: "#certificates" },
  { label: "STORY", href: "#story" },
  { label: "TRADES", href: "#trading " },
   { label: "CONTACTS", href: "#contact" },

];

export default function Navbar({ logo = "BINSHAD.K" }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".nav__logo, .nav__links li, .nav__toggle",
        { y: -22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: "power3.out", delay: 0.4 });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`nav ${solid ? "nav--solid" : ""}`} ref={ref}>
      <a href="#home" className="nav__logo" onClick={() => setOpen(false)}>
        {logo}<span className="nav__dot" />
      </a>

      <ul className="nav__links">
        {LINKS.map((l) => (
          <li key={l.label}><a href={l.href}>{l.label}</a></li>
        ))}
      </ul>

      <button className="nav__toggle" aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? <X size={26} /> : <Menu size={26} />}
      </button>

      <div className={`nav__menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <ul>
          {LINKS.map((l, i) => (
            <li key={l.label} style={{ transitionDelay: open ? `${0.08 + i * 0.06}s` : "0s" }}>
              <a href={l.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>{l.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}