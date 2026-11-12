import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CertificateGallery from "./Certificategallery";
import CertificateModal from "./Certificatemodal";
import "./Certificates.css";

/* ------------------------------------------------------------------
   PROJECT-SPECIFIC IMPORT — adjust this path to your existing navbar
   ------------------------------------------------------------------ */
import Navbar from "./Navbar";

gsap.registerPlugin(ScrollTrigger);

/* ==================================================================
   AUTO-LOAD EVERY CERTIFICATE FROM  src/assets/certificates/
   - no manual imports, no hard-coded count
   - add / remove files and the gallery + counter update by themselves
   (Vite 5+. On Vite 3/4 replace  query: "?url", import: "default"
    with  as: "url")
   ================================================================== */
const modules = import.meta.glob("./assets/certificates/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", {
  eager: true,
  query: "?url",
  import: "default",
});

if (import.meta.env?.DEV && Object.keys(modules).length === 0) {
  console.warn(
    "[Certificates] No images matched ../assets/certificates/*.{jpg,jpeg,png,webp}. " +
      "Check the folder name and that this file is inside src/ (e.g. src/pages/Certificates.jsx)."
  );
}

const CERTIFICATES = Object.entries(modules)
  .map(([path, src]) => ({ path, src, file: path.split("/").pop() }))
  .sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: "base" }))
  .map((c, i) => ({ ...c, id: i, title: `Certificate ${String(i + 1).padStart(2, "0")}` }));

/* how many cards the gallery travels during one full pinned scroll */
const SCROLL_TRAVEL = 12;

/* ==================================================================
   PARTICLES
   ================================================================== */
function Particles({ count = 40 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, raf;
    const size = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.3 + 0.06,
      a: Math.random() * 0.55 + 0.2,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.shadowColor = "#A855F7";
      ctx.shadowBlur = 10;
      for (const d of dots) {
        d.y -= d.vy;
        if (d.y < -8) {
          d.y = h + 8;
          d.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(168,85,247,${d.a})`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const vis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", vis);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [count]);
  return <canvas ref={ref} className="ct-particles" aria-hidden="true" />;
}

/* ==================================================================
   PAGE
   ================================================================== */
export default function Certificates() {
  const root = useRef(null);
  const galleryRef = useRef(null);
  const countRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);

  const total = CERTIFICATES.length;

  const openCert = useCallback((i) => setOpenIndex(i), []);
  const closeCert = useCallback((lastIndex) => {
    setOpenIndex(null);
    galleryRef.current?.goTo(lastIndex); // recentre gallery on the last viewed certificate
  }, []);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 700;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      window.scrollTo(0, 0);

      /* ---------- counter ---------- */
      const runCounter = () => {
        const o = { v: 0 };
        gsap.to(o, {
          v: total,
          duration: 2.2,
          ease: "power3.out",
          onUpdate: () => {
            if (countRef.current) countRef.current.textContent = Math.round(o.v);
          },
        });
        gsap.fromTo(q(".ct-stat > *"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out" });
      };

      /* ---------- start the page (after intro) ---------- */
      const startPage = () => {
        galleryRef.current?.enter(reduced);
        if (reduced) {
          if (countRef.current) countRef.current.textContent = total;
          gsap.set(q(".ct-stat > *"), { autoAlpha: 1, y: 0 });
        } else runCounter();
        gsap.fromTo(q(".ct-gallery-bgword"), { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 2.2, ease: "power3.out" });
      };

      gsap.set(q(".ct-stat > *"), { autoAlpha: 0 });

      /* page opens directly — no intro */
      startPage();

      /* ---------- pinned gallery: vertical scroll drives right → left ---------- */
      let last = 0;
      ScrollTrigger.create({
        trigger: ".ct-gallery-section",
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * (mobile ? 2.4 : 2.8))}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => (last = self.progress),
        onUpdate: (self) => {
          const d = self.progress - last;
          last = self.progress;
          galleryRef.current?.nudge(d * SCROLL_TRAVEL);
        },
      });

      /* ---------- final section ---------- */
      q(".ct-final .ct-line > span").forEach((el, i) => {
        gsap.fromTo(
          el,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.2,
            delay: i * 0.12,
            ease: "power4.out",
            scrollTrigger: { trigger: ".ct-final", start: "top 65%", once: true },
          }
        );
      });
      gsap.fromTo(
        q(".ct-final-sub"),
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".ct-final", start: "top 50%", once: true } }
      );
      gsap.to(q(".ct-streak"), {
        yPercent: -30,
        ease: "none",
        scrollTrigger: { trigger: ".ct-final", start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to(q(".ct-final-bgword"), {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: ".ct-final", start: "top bottom", end: "bottom top", scrub: true },
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [total]);

  return (
    <div className="ct-root" ref={root}>
      {/* Existing navbar — unchanged */}
      <Navbar />

      <main>
        {/* ============ 3D GALLERY (pinned) ============ */}
        <section className="ct-gallery-section" id="certificates">
          <div className="ct-gallery-bgword" aria-hidden="true">
            CERTIFICATES
          </div>
          <Particles count={window.innerWidth < 700 ? 16 : 40} />

          <div className="ct-head">
            <div className="ct-stat">
              <div className="ct-num">
                <span ref={countRef}>0</span>
              </div>
              <div className="ct-stat-text">
                <b>TOTAL CERTIFICATES</b>
                <span>PROFESSIONAL ACHIEVEMENTS</span>
              </div>
            </div>
          </div>

          <CertificateGallery ref={galleryRef} items={CERTIFICATES} onOpen={openCert} />
        </section>

        {/* ============ FINAL ============ */}
        <section className="ct-final">
          <div className="ct-final-bgword" aria-hidden="true">
            STORY
          </div>
          <div className="ct-streaks" aria-hidden="true">
            <span className="ct-streak s1" />
            <span className="ct-streak s2" />
            <span className="ct-streak s3" />
          </div>
          <Particles count={window.innerWidth < 700 ? 14 : 36} />
          <div className="ct-final-inner">
            <h2 className="ct-final-title">
              <span className="ct-line">
                <span>EVERY CERTIFICATE</span>
              </span>
              <span className="ct-line">
                <span>TELLS A STORY.</span>
              </span>
            </h2>
            <p className="ct-final-sub">
              Every achievement represents dedication, continuous learning and the journey towards excellence.
            </p>
          </div>
        </section>
      </main>

      {openIndex !== null && (
        <CertificateModal items={CERTIFICATES} index={openIndex} onClose={closeCert} onIndex={setOpenIndex} />
      )}
    </div>
  );
}