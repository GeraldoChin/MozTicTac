import { useState, useEffect, useRef, useCallback } from "react";

const GREEN = "#00b96b";
const GREEN_DARK = "#009a5a";

const HERO_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=85",
    eyebrow: "🔥 Semana de Ofertas",
    title: "Calçados com até",
    highlight: "75% OFF",
    sub: "Os melhores ténis e sapatos com descontos reais. Só esta semana.",
    cta: "Ver Ofertas",
    badge: "Calçados",
    accent: "#ef4444",
  },
  {
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=85",
    eyebrow: "⌚ Nova Colecção",
    title: "Relógios Premium",
    highlight: "desde 4 200 MZN",
    sub: "Estilo suíço a preço acessível. Entrega disponível em todo o país.",
    cta: "Comprar Agora",
    badge: "Acessórios",
    accent: "#3b82f6",
  },
  {
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=85",
    eyebrow: "🎧 Tech em Promoção",
    title: "Electrónicos top",
    highlight: "até 60% OFF",
    sub: "Sony, Samsung e mais. Preços que nunca viste em Moçambique.",
    cta: "Ver Electrónicos",
    badge: "Tech",
    accent: "#a855f7",
  },
];

const STYLES = `
  @keyframes kenburns {
    0%   { transform: scale(1.08) translate(0%, 0%); }
    100% { transform: scale(1.18) translate(-2%, -1%); }
  }
  @keyframes fadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes fadeUp {
    0%   { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes progressBar {
    0%   { width: 0%; }
    100% { width: 100%; }
  }

  .hero-eyebrow { animation: fadeUp 0.5s cubic-bezier(.22,.68,0,1.2) 0.05s both; }
  .hero-title   { animation: fadeUp 0.5s cubic-bezier(.22,.68,0,1.2) 0.16s both; }
  .hero-high    { animation: fadeUp 0.5s cubic-bezier(.22,.68,0,1.2) 0.28s both; }
  .hero-sub     { animation: fadeUp 0.5s cubic-bezier(.22,.68,0,1.2) 0.40s both; }
  .hero-btns    { animation: fadeUp 0.5s cubic-bezier(.22,.68,0,1.2) 0.52s both; }

  .img-enter    { animation: fadeIn 0.75s ease both; }
  .img-kenburns { animation: kenburns 7s ease-out both; }
  .hero-progress { animation: progressBar 5.5s linear both; }

  .hero-overlay {
    background: linear-gradient(
      105deg,
      rgba(0,0,0,0.82) 0%,
      rgba(0,0,0,0.52) 40%,
      rgba(0,0,0,0.12) 70%,
      rgba(0,0,0,0.00) 100%
    );
  }
`;

function injectStyles() {
  if (document.getElementById("__hero-styles__")) return;
  const el = document.createElement("style");
  el.id = "__hero-styles__";
  el.textContent = STYLES;
  document.head.appendChild(el);
}

export default function HeroSlider({ onFilterChange }) {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const currentRef = useRef(0);
  const lockRef    = useRef(false);
  const timerRef   = useRef(null);

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => { currentRef.current = current; }, [current]);

  const goTo = useCallback((idx) => {
    if (lockRef.current) return;
    if (idx === currentRef.current) return;
    lockRef.current = true;
    setCurrent(idx);
    setAnimKey(k => k + 1);
    setTimeout(() => { lockRef.current = false; }, 750);
  }, []);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const next = (currentRef.current + 1) % HERO_SLIDES.length;
      goTo(next);
    }, 5500);
  }, [goTo]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const handleManual = (idx) => {
    goTo(idx);
    startTimer();
  };

  const slide = HERO_SLIDES[current];

  return (
    <div style={{
      position: "relative", height: 500, overflow: "hidden",
      background: "#080808", fontFamily: "Manrope, sans-serif",
    }}>

      {/* IMAGEM: fade + Ken Burns */}
      <div
        key={`img-${current}-${animKey}`}
        className="img-enter"
        style={{ position: "absolute", inset: 0, zIndex: 2 }}
      >
        <div className="img-kenburns" style={{ position: "absolute", inset: 0 }}>
          <img
            src={slide.img} alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
      </div>

      {/* BARRA DE PROGRESSO */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 2, background: "rgba(255,255,255,0.08)", zIndex: 20,
      }}>
        <div
          key={`prog-${current}-${animKey}`}
          className="hero-progress"
          style={{ height: "100%", background: GREEN }}
        />
      </div>

      {/* CONTEÚDO */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", flexDirection: "column", justifyContent: "center",
        maxWidth: 1200, width: "100%",
        left: "50%", transform: "translateX(-50%)",
        padding: "0 32px",
      }}>
        <div key={`txt-${current}-${animKey}`} style={{ maxWidth: 560 }}>

          <div className="hero-eyebrow" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.12em", padding: "4px 12px", borderRadius: 100,
              color: "#fff", background: slide.accent,
            }}>
              {slide.badge}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.62)" }}>
              {slide.eyebrow}
            </span>
          </div>

          <h1 className="hero-title" style={{
            fontSize: 52, fontWeight: 900, color: "#fff",
            lineHeight: 1, letterSpacing: "-2.5px", margin: 0,
          }}>
            {slide.title}
          </h1>

          <h2 className="hero-high" style={{
            fontSize: 64, fontWeight: 900, lineHeight: 1.05,
            letterSpacing: "-3px", margin: "4px 0 20px",
            color: slide.accent,
            textShadow: `0 0 80px ${slide.accent}44`,
          }}>
            {slide.highlight}
          </h2>

          <p className="hero-sub" style={{
            fontSize: 15, lineHeight: 1.65, marginBottom: 32,
            color: "rgba(255,255,255,0.65)", maxWidth: 430,
          }}>
            {slide.sub}
          </p>

          <div className="hero-btns" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => onFilterChange?.(slide.badge)}
              style={{
                padding: "13px 28px", borderRadius: 100, fontSize: 13,
                fontWeight: 800, color: "#fff", background: GREEN,
                border: "none", cursor: "pointer", letterSpacing: "0.02em",
                transition: "background .15s, transform .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = GREEN_DARK; e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = GREEN; e.currentTarget.style.transform = "scale(1)"; }}
            >
              {slide.cta} →
            </button>
            <button
              style={{
                padding: "13px 28px", borderRadius: 100, fontSize: 13,
                fontWeight: 800, color: "#fff", cursor: "pointer",
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                letterSpacing: "0.02em", transition: "background .15s, transform .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.16)"; e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              Ver Todas as Promoções
            </button>
          </div>
        </div>
      </div>

      {/* DOTS VERTICAIS + CONTADOR */}
      <div style={{
        position: "absolute", right: 32, bottom: 32, zIndex: 20,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.08em", writingMode: "vertical-lr",
          transform: "rotate(180deg)", marginBottom: 4,
        }}>
          {String(current + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {HERO_SLIDES.map((_, i) => {
            const active = i === current;
            return (
              <button
                key={i}
                onClick={() => handleManual(i)}
                style={{
                  width: 4, height: active ? 32 : 8,
                  borderRadius: 100, border: "none", cursor: "pointer", padding: 0,
                  background: active ? GREEN : "rgba(255,255,255,0.28)",
                  transition: "height .4s cubic-bezier(.22,.68,0,1.2), background .25s",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ARROWS */}
      {[
        { dir: "prev", d: "M15 18l-6-6 6-6", side: { left: 16 } },
        { dir: "next", d: "M9 18l6-6-6-6",   side: { right: 16 } },
      ].map(({ dir, d, side }) => (
        <button
          key={dir}
          onClick={() => {
            const next = dir === "prev"
              ? (currentRef.current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
              : (currentRef.current + 1) % HERO_SLIDES.length;
            handleManual(next);
          }}
          style={{
            position: "absolute", top: "50%", transform: "translateY(-50%)",
            ...side, zIndex: 20,
            width: 44, height: 44, borderRadius: "50%", border: "none",
            background: "rgba(255,255,255,0.07)",
            outline: "1px solid rgba(255,255,255,0.14)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .18s, outline-color .18s, transform .18s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.16)";
            e.currentTarget.style.outlineColor = "rgba(255,255,255,0.32)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.outlineColor = "rgba(255,255,255,0.14)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
          </svg>
        </button>
      ))}

      {/* THUMBNAILS */}
      <div style={{
        position: "absolute", left: 32, bottom: 24, zIndex: 20,
        display: "flex", gap: 8,
      }}>
        {HERO_SLIDES.map((s, i) => {
          const active = i === current;
          return (
            <button
              key={i}
              onClick={() => handleManual(i)}
              style={{
                width: active ? 76 : 52, height: active ? 50 : 36,
                borderRadius: 8, overflow: "hidden", padding: 0, cursor: "pointer",
                border: `2px solid ${active ? GREEN : "rgba(255,255,255,0.18)"}`,
                opacity: active ? 1 : 0.5,
                transition: "all .38s cubic-bezier(.22,.68,0,1.2)",
                flexShrink: 0,
              }}
            >
              <img
                src={s.img} alt={s.badge}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}