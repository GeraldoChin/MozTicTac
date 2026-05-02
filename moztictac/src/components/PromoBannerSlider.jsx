import { useState, useEffect, useRef } from "react";

const GREEN = "#22c55e";
const VISIBLE = 3;
const AUTO_INTERVAL = 3500;

const PROMO_BANNERS = [
  {
    cat: "Electrónica",
    emoji: "💻",
    title: "Tech & Gadgets",
    sub: "Os melhores preços em tech",
    color: "#3b82f6",
    img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
  },
  {
    cat: "Moda",
    emoji: "👗",
    title: "Estilo & Moda",
    sub: "Tendências da temporada",
    color: "#ec4899",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
  },
  {
    cat: "Casa",
    emoji: "🏠",
    title: "Casa & Jardim",
    sub: "Decora o teu espaço",
    color: "#f59e0b",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
  },
  {
    cat: "Desporto",
    emoji: "⚽",
    title: "Sport & Fitness",
    sub: "Equipamento profissional",
    color: "#22c55e",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
  },
  {
    cat: "Alimentação",
    emoji: "🥗",
    title: "Food & Gourmet",
    sub: "Sabores únicos perto de ti",
    color: "#ef4444",
    img: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80",
  },
  {
    cat: "Beleza",
    emoji: "💄",
    title: "Beauty & Care",
    sub: "Cuida de ti todos os dias",
    color: "#a855f7",
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
  },
];

// CSS keyframes injected once
const STYLES = `
@keyframes bannerFadeIn {
  from { opacity: 0; transform: scale(1.04); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes bannerContentIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.banner-entering img {
  animation: bannerFadeIn 0.5s ease forwards;
}
.banner-entering .banner-content {
  animation: bannerContentIn 0.4s ease 0.1s both;
}
`;

function BannerCard({ banner, entering, onFilterChange }) {
  return (
    <div
      className={`banner-card${entering ? " banner-entering" : ""}`}
      onClick={() => onFilterChange(banner.cat)}
      style={{
        position: "relative",
        overflow: "hidden",
        height: 190,
        borderRadius: 12,
        cursor: "pointer",
        transition: "transform 0.3s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {/* Image */}
      <img
        src={banner.img}
        alt={banner.title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.58)",
          display: "block",
          transition: "transform 0.5s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, transparent 100%)",
        }}
      />

      {/* Accent bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: banner.color,
        }}
      />

      {/* Content */}
      <div
        className="banner-content"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 20px",
        }}
      >
        <span style={{ fontSize: 22, marginBottom: 4 }}>{banner.emoji}</span>
        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.55)",
            margin: "0 0 2px",
          }}
        >
          {banner.cat}
        </p>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: 0 }}>
          {banner.title}
        </h3>
        <p style={{ fontSize: 12, margin: "4px 0 12px", color: "rgba(255,255,255,0.78)" }}>
          {banner.sub}
        </p>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Filtrar produtos
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>

      {/* Hover ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `2px solid ${banner.color}`,
          borderRadius: 12,
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.2s",
        }}
        className="banner-ring"
      />
    </div>
  );
}

export default function PromoBannersSlider({ onFilterChange = (cat) => console.log("Filter:", cat) }) {
  const [startIdx, setStartIdx] = useState(0);
  const [entering, setEntering] = useState(false);
  const timerRef = useRef(null);
  const maxIdx = PROMO_BANNERS.length - VISIBLE;

  const canPrev = startIdx > 0;
  const canNext = startIdx < maxIdx;

  // Animate cards into view
  const goTo = (idx) => {
    setStartIdx(idx);
    setEntering(true);
    setTimeout(() => setEntering(false), 600);
  };

  const navigate = (dir) => {
    const next = startIdx + dir;
    if (next < 0 || next > maxIdx) return;
    goTo(next);
    resetAuto();
  };

  // Auto-advance
  const resetAuto = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStartIdx((prev) => {
        const next = prev < maxIdx ? prev + 1 : 0;
        setEntering(true);
        setTimeout(() => setEntering(false), 600);
        return next;
      });
    }, AUTO_INTERVAL);
  };

  useEffect(() => {
    resetAuto();
    return () => clearInterval(timerRef.current);
  }, []);

  const visibleBanners = PROMO_BANNERS.slice(startIdx, startIdx + VISIBLE);

  return (
    <>
      {/* Inject keyframe styles once */}
      <style>{STYLES}</style>

      <div style={{ fontFamily: "sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#111827" }}>
              Categorias em Destaque
            </h2>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>
              Clica numa categoria para filtrar os produtos abaixo
            </p>
          </div>

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => navigate(-1)}
              disabled={!canPrev}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canPrev ? "pointer" : "default",
                opacity: canPrev ? 1 : 0.3,
                padding: 0,
                transition: "all 0.2s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={() => navigate(1)}
              disabled={!canNext}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: `1px solid ${canNext ? GREEN : "#e5e7eb"}`,
                background: canNext ? GREEN : "#f9fafb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canNext ? "pointer" : "default",
                opacity: canNext ? 1 : 0.3,
                padding: 0,
                transition: "all 0.2s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={canNext ? "#fff" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {visibleBanners.map((banner) => (
            <BannerCard
              key={banner.cat}
              banner={banner}
              entering={entering}
              onFilterChange={onFilterChange}
            />
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); resetAuto(); }}
              style={{
                width: i === startIdx ? 22 : 6,
                height: 6,
                borderRadius: 3,
                border: "none",
                background: i === startIdx ? GREEN : "#d1d5db",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}