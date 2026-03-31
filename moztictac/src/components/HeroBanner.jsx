import { useEffect, useRef, useState } from "react";

const GREEN = "#1db954";
const BLUE = "#2563eb";
const ORANGE = "#f97316";
const CREAM = "#fafaf7";

/**
 * HeroBanner — full-width hero section with layered visual depth and elegant CTAs.
 *
 * Props:
 *   onShopNow {function} — called when "Shop Now" is clicked
 */
export function HeroBanner({ onShopNow }) {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef(null);

  useEffect(() => {
    // Staggered entrance animation
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const parallaxX = (mousePos.x - 0.5) * 18;
  const parallaxY = (mousePos.y - 0.5) * 10;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .moz-hero {
          font-family: 'DM Sans', sans-serif;
          background: ${CREAM};
          overflow: hidden;
          position: relative;
          width: 100vw;
          height: 100vh;
          max-width: 100%;
          box-sizing: border-box;
        }

        /* Subtle noise texture overlay */
        .moz-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 10;
        }

        .moz-hero-image-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .moz-hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          transform: scale(1.08);
          transition: transform 0.1s ease-out;
          filter: saturate(0.9);
        }

        /* Elegant gradient overlay — light on right, immersive on left */
        .moz-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            rgba(250,250,247,0.10) 0%,
            rgba(250,250,247,0.45) 30%,
            rgba(250,250,247,0.88) 58%,
            rgba(250,250,247,0.97) 75%,
            ${CREAM} 100%
          );
        }

        /* Decorative green accent stripe */
        .moz-hero-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(to bottom, ${GREEN}, ${BLUE});
          border-radius: 0 2px 2px 0;
        }

        /* Floating badge */
        .moz-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(29,185,84,0.10);
          border: 1px solid rgba(29,185,84,0.25);
          border-radius: 100px;
          padding: 5px 14px 5px 8px;
          margin-bottom: clamp(10px, 1.5vh, 20px);
          backdrop-filter: blur(8px);
        }

        .moz-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${GREEN};
          box-shadow: 0 0 0 3px rgba(29,185,84,0.2);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 3px rgba(29,185,84,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(29,185,84,0.08); }
        }

        .moz-badge-text {
          font-size: 11.5px;
          font-weight: 500;
          color: #166534;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* Hero heading */
        .moz-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-style: italic;
          font-weight: 300;
          font-size: 15px;
          color: ${GREEN};
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: clamp(6px, 1vh, 10px);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s;
        }

        .moz-heading {
          font-family: 'Manrope', sans-serif;
          font-weight: 900;
          font-size: clamp(28px, 4.5vw, 58px);
          line-height: 0.95;
          color: #0f1a10;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
        }

        .moz-heading-accent {
          color: ${GREEN};
          position: relative;
          display: inline-block;
        }

        /* Underline decorative line */
        .moz-heading-accent::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 2px;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, ${GREEN}, ${BLUE});
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.6s ease 0.75s;
        }

        .moz-hero.is-mounted .moz-heading-accent::after {
          transform: scaleX(1);
        }

        .moz-subheading {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: clamp(15px, 2vw, 22px);
          color: #374151;
          letter-spacing: -0.01em;
          margin-bottom: 6px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
        }

        .moz-description {
          font-size: clamp(12px, 1.1vw, 14px);
          font-weight: 400;
          color: #6b7280;
          line-height: 1.6;
          max-width: 360px;
          margin-bottom: clamp(16px, 2.5vh, 28px);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s;
        }

        /* Mounted state — reveal elements */
        .moz-hero.is-mounted .moz-eyebrow,
        .moz-hero.is-mounted .moz-heading,
        .moz-hero.is-mounted .moz-subheading,
        .moz-hero.is-mounted .moz-description,
        .moz-hero.is-mounted .moz-actions,
        .moz-hero.is-mounted .moz-stats {
          opacity: 1;
          transform: translateY(0);
        }

        /* CTA Buttons */
        .moz-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: clamp(16px, 3vh, 36px);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
        }

        .moz-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: ${GREEN};
          color: #fff;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.01em;
          padding: 13px 28px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(29,185,84,0.30), 0 1px 3px rgba(29,185,84,0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .moz-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .moz-btn-primary:hover {
          background: #17a348;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(29,185,84,0.38), 0 2px 6px rgba(29,185,84,0.20);
        }

        .moz-btn-primary:active {
          transform: translateY(0);
        }

        .moz-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #374151;
          font-family: 'Manrope', sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 22px;
          border-radius: 12px;
          border: 1.5px solid #d1d5db;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.2s;
        }

        .moz-btn-ghost:hover {
          border-color: ${GREEN};
          color: ${GREEN};
          background: rgba(29,185,84,0.04);
          transform: translateY(-1px);
        }

        /* Stats row */
        .moz-stats {
          display: flex;
          gap: 28px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s ease 0.65s, transform 0.6s ease 0.65s;
        }

        .moz-stat-item {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .moz-stat-value {
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 20px;
          color: #111827;
          line-height: 1;
        }

        .moz-stat-label {
          font-size: 11px;
          font-weight: 500;
          color: #9ca3af;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .moz-stat-divider {
          width: 1px;
          background: #e5e7eb;
          align-self: stretch;
          margin: 2px 0;
        }

        /* Floating pill tag on image */
        .moz-float-pill {
          position: absolute;
          bottom: 40px;
          left: 38%;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 100px;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s;
          z-index: 5;
          white-space: nowrap;
        }

        .moz-hero.is-mounted .moz-float-pill {
          opacity: 1;
          transform: translateY(0);
        }

        .moz-float-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${GREEN}, ${BLUE});
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }

        .moz-float-label {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #111827;
        }

        .moz-float-sub {
          font-size: 11px;
          color: #6b7280;
          font-weight: 400;
        }

        /* Decorative geometric blob */
        .moz-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.07;
          z-index: 1;
        }

        .moz-blob-1 {
          width: 320px;
          height: 320px;
          background: ${GREEN};
          top: -80px;
          right: 12%;
          filter: blur(60px);
        }

        .moz-blob-2 {
          width: 200px;
          height: 200px;
          background: ${BLUE};
          bottom: -40px;
          right: 30%;
          filter: blur(50px);
        }

        /* Sale tag */
        .moz-sale-tag {
          position: absolute;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, ${ORANGE}, #ef4444);
          color: #fff;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 100px;
          box-shadow: 0 4px 16px rgba(249,115,22,0.35);
          z-index: 6;
          opacity: 0;
          transition: opacity 0.5s ease 0.9s;
        }

        .moz-hero.is-mounted .moz-sale-tag {
          opacity: 1;
        }

        @media (max-width: 640px) {
          .moz-float-pill { display: none; }
          .moz-stats { gap: 16px; }
          .moz-stat-value { font-size: 17px; }
          .moz-hero-overlay {
            background: linear-gradient(
              180deg,
              rgba(250,250,247,0.15) 0%,
              rgba(250,250,247,0.92) 45%,
              ${CREAM} 100%
            );
          }
        }
      `}</style>

      <section
        className={`moz-hero${mounted ? " is-mounted" : ""}`}
        ref={containerRef}
        onMouseMove={handleMouseMove}
      >
        {/* Ambient color blobs */}
        <div className="moz-blob moz-blob-1" />
        <div className="moz-blob moz-blob-2" />

        {/* Background image with parallax */}
        <div className="moz-hero-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85"
            alt="MozTicTac Collections"
            className="moz-hero-image"
            style={{
              transform: `scale(1.08) translate(${parallaxX * -0.4}px, ${parallaxY * -0.3}px)`,
            }}
          />
        </div>

        {/* Gradient overlay */}
        <div className="moz-hero-overlay" />

        {/* Left accent stripe */}
        <div className="moz-hero-accent" />

        {/* Sale tag pill (floats over image) */}
        <div className="moz-sale-tag">✦ Summer Sale — Até 65% Off</div>

        {/* Main content */}
        <div
          style={{
            position: "relative",
            zIndex: 5,
            maxWidth: 1280,
            margin: "0 auto",
            padding: "clamp(28px, 5vh, 52px) 48px clamp(28px, 5vh, 52px) 52px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "right" }}>
            {/* Live badge */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
              <div className="moz-badge">
                <span className="moz-badge-dot" />
                <span className="moz-badge-text">Marketplace Moçambicano</span>
              </div>
            </div>

            {/* Eyebrow */}
            <p className="moz-eyebrow">Colecções de Verão</p>

            {/* Main heading */}
            <h1 className="moz-heading">
              COMPRA.{" "}
              <span className="moz-heading-accent">VENDE.</span>
              {" "}CRESCE.
            </h1>

            {/* Subheading */}
            <p className="moz-subheading">Tudo numa única plataforma</p>

            {/* Description */}
            <p className="moz-description">
              Produtos físicos, serviços e programa de afiliados — com pagamento via
              M-Pesa, E-Mola e mKesh, em Meticais.
            </p>

            {/* CTAs */}
            <div className="moz-actions" style={{ justifyContent: "flex-end" }}>
              <button className="moz-btn-primary" onClick={onShopNow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Comprar Agora
              </button>
              <button className="moz-btn-ghost">
                Saber Mais
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="moz-stats" style={{ justifyContent: "flex-end" }}>
              <div className="moz-stat-item" style={{ textAlign: "right" }}>
                <span className="moz-stat-value">10 Prov.</span>
                <span className="moz-stat-label">Cobertura Nacional</span>
              </div>
              <div className="moz-stat-divider" />
              <div className="moz-stat-item" style={{ textAlign: "right" }}>
                <span className="moz-stat-value">3-em-1</span>
                <span className="moz-stat-label">Papéis Dinâmicos</span>
              </div>
              <div className="moz-stat-divider" />
              <div className="moz-stat-item" style={{ textAlign: "right" }}>
                <span className="moz-stat-value">100% MZN</span>
                <span className="moz-stat-label">Pagamento Local</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating social proof pill */}
        <div className="moz-float-pill">
          <div className="moz-float-icon">🛍️</div>
          <div>
            <div className="moz-float-label">Venda Segura</div>
            <div className="moz-float-sub">Pagamento em escrow protegido</div>
          </div>
        </div>
      </section>
    </>
  );
}