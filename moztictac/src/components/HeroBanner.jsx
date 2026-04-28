import { useEffect, useRef, useState, useCallback } from "react";

const SLIDES = [
  {
    id: 0,
    tag:        "Marketplace · Compra & Venda",
    headline:   ["O mercado que", "Moçambique", "merecia."],
    accentLine: 1,
    body:       "Compra e vende produtos físicos, digitais e serviços — tudo numa conta única, com pagamento em Meticais.",
    cta:        "Explorar Produtos",
    ctaSecond:  "Começar a Vender",
    stat1: { val: "10",   label: "Províncias" },
    stat2: { val: "+50k", label: "Produtos" },
    stat3: { val: "MZN",  label: "Pagamento local" },
    chip:  { icon: "bag",    text: "Escrow Protegido",       sub: "Pagamento seguro garantido" },
    image: "/img/img7.jpg",
    pos:   "center 30%",
  },
  {
    id: 1,
    tag:        "Afiliados · Programa de Comissões",
    headline:   ["Ganha dinheiro", "sem ter", "stock."],
    accentLine: 2,
    body:       "Partilha links, gera vendas e recebe comissões automáticas. Sem produto, sem entrega — só marketing.",
    cta:        "Ver Produtos Afiliáveis",
    ctaSecond:  "Como Funciona",
    stat1: { val: "Até 30%", label: "Comissão" },
    stat2: { val: "3 Níveis", label: "Bronze · Prata · Ouro" },
    stat3: { val: "Auto",    label: "Pagamento automático" },
    chip:  { icon: "link",   text: "Link Rastreável",        sub: "Cliques e conversões em tempo real" },
    image: "/img/img19.jpg",
    pos:   "center 20%",
  },
  {
    id: 2,
    tag:        "Pagamentos · Carteira Digital",
    headline:   ["Paga e recebe", "com M-Pesa,", "mKesh e E-Mola."],
    accentLine: 1,
    body:       "Carteira integrada com todos os métodos de pagamento locais. Depósitos, levantamentos e transferências em segundos.",
    cta:        "Criar Conta Grátis",
    ctaSecond:  "Ver Métodos",
    stat1: { val: "3",    label: "Métodos de pagamento" },
    stat2: { val: "100%", label: "Transações seguras" },
    stat3: { val: "24h",  label: "Suporte disponível" },
    chip:  { icon: "shield", text: "Carteira Segura",       sub: "Fundos protegidos com escrow" },
    image: "/img/img5.jpg",
    pos:   "center 25%",
  },
  {
    id: 3,
    tag:        "Serviços · Ofereça o teu talento",
    headline:   ["O teu serviço,", "agora numa", "plataforma."],
    accentLine: 2,
    body:       "Publica serviços profissionais — reparações, aulas, design, consultoria — e recebe pagamentos de forma organizada.",
    cta:        "Publicar Serviço",
    ctaSecond:  "Ver Serviços",
    stat1: { val: "0%",    label: "Custo inicial" },
    stat2: { val: "Escrow",label: "Pagamento garantido" },
    stat3: { val: "Local", label: "Em todo Moçambique" },
    chip:  { icon: "star",  text: "Avaliações Verificadas", sub: "Sistema de reputação real" },
    image: "/img/img4.jpg",
    pos:   "center 20%",
  },
];

const ACCENT = "#16a34a";

// Paleta grafite premium
const G = {
  900: "#18181b",   // texto principal
  700: "#3f3f46",   // texto secundário
  400: "#a1a1aa",   // texto muted
  100: "#f4f4f5",   // superfícies claras
  overlay: "rgba(24,24,27,0.52)",   // overlay base grafite
};

function ChipIcon({ type }) {
  const s = { width: 15, height: 15, stroke: "#fff", fill: "none", strokeWidth: 2.1, strokeLinecap: "round" };
  if (type === "bag")    return <svg style={s} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
  if (type === "link")   return <svg style={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
  if (type === "shield") return <svg style={s} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  if (type === "star")   return <svg style={s} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  return null;
}

export function HeroBanner({ onShopNow }) {
  const [current, setCurrent] = useState(0);
  const [phase,   setPhase]   = useState("idle");
  const [mounted, setMounted] = useState(false);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef(null);
  const DURATION = 6000;

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const goTo = useCallback((idx) => {
    if (phase !== "idle" || idx === current) return;
    setPhase("exit");
    setTimeout(() => {
      setCurrent(idx);
      setPhase("enter");
      setTimeout(() => setPhase("idle"), 700);
    }, 420);
  }, [current, phase]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, DURATION);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, next]);

  const slide   = SLIDES[current];
  const visible = phase !== "exit" && mounted;

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        width: "100%",
        height: "88svh",
        minHeight: 500,
        maxHeight: 700,
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: G[900],
      }}
    >
      {/* ══ IMAGENS ══ */}
      {SLIDES.map((s, i) => (
        <img
          key={s.id}
          src={s.image}
          alt={s.tag}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: s.pos,
            // Dessaturação parcial — imagem fica mais "editorial", menos colorida
            filter: "brightness(0.70) saturate(0.72) contrast(1.04)",
            opacity:   i === current ? 1 : 0,
            transform: i === current
              ? (phase === "exit" ? "scale(1.045)" : "scale(1.0)")
              : "scale(1.045)",
            transition: i === current
              ? "opacity 0.65s ease, transform 7s ease"
              : "opacity 0.5s ease",
            zIndex: i === current ? 1 : 0,
          }}
        />
      ))}

      {/* ══ OVERLAY GRAFITE ══
           Camada grafite neutra que unifica a imagem e o conteúdo.
           Denso à esquerda (onde está o texto), mais fino à direita.
           A dessaturação + este overlay dão o look "premium cinza". */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: `
          linear-gradient(
            105deg,
            rgba(24,24,27,0.88) 0%,
            rgba(24,24,27,0.72) 30%,
            rgba(24,24,27,0.38) 58%,
            rgba(24,24,27,0.10) 80%,
            rgba(24,24,27,0.00) 100%
          )
        `,
      }} />

      {/* Vinheta perimetral subtil — profundidade extra */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        boxShadow: "inset 0 0 120px rgba(24,24,27,0.45)",
      }} />

      {/* Gradiente inferior — merge limpo com o branco do site */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 90, zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(to top, rgba(24,24,27,0.55) 0%, transparent 100%)",
      }} />

      {/* ══ CONTEÚDO ══ */}
      <div style={{
        position: "relative", zIndex: 10,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 72px",
        maxWidth: 620,
      }}>

        {/* Contador */}
        <div style={{
          position: "absolute", top: 28, left: 72,
          fontSize: 11, fontWeight: 600, letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.28)",
        }}>
          {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </div>

        {/* Dots nav vertical */}
        <div style={{
          position: "absolute", left: 32, top: "50%",
          transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: 3, height: i === current ? 38 : 14,
              borderRadius: 99, border: "none", cursor: "pointer", padding: 0,
              background: i === current ? ACCENT : "rgba(255,255,255,0.22)",
              transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
            }} />
          ))}
        </div>

        {/* Tag */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
          opacity:    visible ? 1 : 0,
          transform:  visible ? "translateY(0)" : "translateY(18px)",
          transition: visible
            ? "opacity 0.55s ease 0.06s, transform 0.55s ease 0.06s"
            : "opacity 0.28s ease, transform 0.28s ease",
        }}>
          {/* Pill tag com fundo grafite translúcido */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px 4px 8px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 99,
            backdropFilter: "blur(8px)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: ACCENT,
              boxShadow: `0 0 0 3px rgba(22,163,74,0.25)`,
              animation: "pls 2s ease-in-out infinite",
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.80)",
            }}>
              {slide.tag}
            </span>
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(38px, 5vw, 66px)",
          fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.03em",
          color: "#ffffff",
          marginBottom: 18,
          opacity:    visible ? 1 : 0,
          transform:  visible ? "translateY(0)" : "translateY(26px)",
          transition: visible
            ? "opacity 0.6s ease 0.14s, transform 0.6s ease 0.14s"
            : "opacity 0.28s ease, transform 0.28s ease",
        }}>
          {slide.headline.map((line, i) => (
            <span key={i} style={{
              display: "block",
              // Linha de accent: cor verde vibrante sobre o grafite escuro
              color: i === slide.accentLine ? ACCENT : "#ffffff",
            }}>
              {line}
            </span>
          ))}
        </h1>

        {/* Body */}
        <p style={{
          fontSize: "clamp(13px, 1.05vw, 15px)", lineHeight: 1.8,
          color: "rgba(228,228,231,0.70)",
          maxWidth: 380, marginBottom: 30,
          opacity:    visible ? 1 : 0,
          transform:  visible ? "translateY(0)" : "translateY(18px)",
          transition: visible
            ? "opacity 0.6s ease 0.22s, transform 0.6s ease 0.22s"
            : "opacity 0.28s ease, transform 0.28s ease",
        }}>
          {slide.body}
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          marginBottom: 38,
          opacity:    visible ? 1 : 0,
          transform:  visible ? "translateY(0)" : "translateY(14px)",
          transition: visible
            ? "opacity 0.6s ease 0.30s, transform 0.6s ease 0.30s"
            : "opacity 0.28s ease, transform 0.28s ease",
        }}>
          <button
            onClick={onShopNow}
            onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none";             e.currentTarget.style.transform = "translateY(0)"; }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px",
              background: ACCENT, color: "#fff",
              fontSize: 14, fontWeight: 700,
              borderRadius: 10, border: "none", cursor: "pointer",
              boxShadow: "0 4px 22px rgba(22,163,74,0.38)",
              transition: "all 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            {slide.cta}
          </button>

          <button
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "12px 22px",
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 14, fontWeight: 600,
              borderRadius: 10,
              border: "1.5px solid rgba(255,255,255,0.16)",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {slide.ctaSecond}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex",
          borderTop: "1px solid rgba(255,255,255,0.10)",
          paddingTop: 22,
          opacity:    visible ? 1 : 0,
          transition: visible ? "opacity 0.6s ease 0.40s" : "opacity 0.25s ease",
        }}>
          {[slide.stat1, slide.stat2, slide.stat3].map((s, i) => (
            <div key={i} style={{
              flex: 1,
              paddingLeft:  i > 0 ? 22 : 0,
              paddingRight: i < 2 ? 22 : 0,
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.10)" : "none",
            }}>
              <p style={{ fontSize: "clamp(15px,1.8vw,21px)", fontWeight: 800, letterSpacing: "-0.02em", color: "#ffffff", lineHeight: 1, marginBottom: 5 }}>
                {s.val}
              </p>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(161,161,170,0.65)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CHIP ══ */}
      <div style={{
        position: "absolute", bottom: 28, right: 32, zIndex: 10,
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px",
        background: "rgba(24,24,27,0.72)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 14,
        backdropFilter: "blur(18px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.30)",
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(10px)",
        transition: visible
          ? "opacity 0.6s ease 0.50s, transform 0.6s ease 0.50s"
          : "opacity 0.25s ease, transform 0.25s ease",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: ACCENT,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: "0 2px 12px rgba(22,163,74,0.35)",
        }}>
          <ChipIcon type={slide.chip.icon} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#f4f4f5", lineHeight: 1.2 }}>{slide.chip.text}</p>
          <p style={{ fontSize: 10, color: "rgba(161,161,170,0.75)", marginTop: 2 }}>{slide.chip.sub}</p>
        </div>
      </div>

      {/* ══ Setas ══ */}
      <div style={{
        position: "absolute", bottom: 28, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 8, zIndex: 10,
      }}>
        {[
          { fn: prev, pts: "18 12 12 6 6 12" },
          { fn: next, pts: "6 12 12 18 18 12" },
        ].map(({ fn, pts }, i) => (
          <button key={i} onClick={fn}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.14)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" strokeLinecap="round">
              <polyline points={pts}/>
            </svg>
          </button>
        ))}
      </div>

      {/* ══ Barra progresso ══ */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 3, background: "rgba(255,255,255,0.08)", zIndex: 20,
      }}>
        <div key={`${current}-bar`} style={{
          height: "100%", background: ACCENT,
          animation: paused ? "none" : `progress-bar ${DURATION}ms linear forwards`,
        }} />
      </div>

      {/* Dots mobile */}
      <div className="hero-m-dots" style={{
        position: "absolute", bottom: 18, left: "50%",
        transform: "translateX(-50%)",
        display: "none", gap: 6, zIndex: 20,
      }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === current ? 20 : 6, height: 6,
            borderRadius: 99, border: "none", cursor: "pointer", padding: 0,
            background: i === current ? ACCENT : "rgba(255,255,255,0.28)",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pls {
          0%,100% { box-shadow: 0 0 0 3px rgba(22,163,74,0.20); }
          50%      { box-shadow: 0 0 0 7px rgba(22,163,74,0.06); }
        }
        @keyframes progress-bar { from { width: 0% } to { width: 100% } }
        @media (max-width: 768px) {
          .hero-m-dots { display: flex !important; }
        }
      `}</style>
    </section>
  );
}