import { useState, useEffect, useRef, useCallback } from "react";
import { SectionHeader } from "./SectionHeader";
import { ProductCard } from "./ProductCard";

const FEATURED = [
  {
    name: "Vestido Chitenge Tradicional",
    price: 1850,
    originalPrice: 2400,
    rating: 4.8,
    reviews: 124,
    city: "Maputo",
    img: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&q=80",
    badge: "Destaque",
  },
  {
    name: "Samsung Galaxy A55 5G",
    price: 28900,
    originalPrice: 32000,
    rating: 4.6,
    reviews: 89,
    city: "Beira",
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    badge: "Novo",
  },
  {
    name: "Cesto Artesanal de Sisal",
    price: 650,
    originalPrice: 900,
    rating: 4.9,
    reviews: 210,
    city: "Nampula",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    badge: "Destaque",
  },
  {
    name: "Ténis Nike Air Max 270",
    price: 8500,
    originalPrice: 11000,
    rating: 4.7,
    reviews: 56,
    city: "Maputo",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    badge: "Destaque",
  },
  {
    name: "Auscultadores Sony WH-1000XM5",
    price: 19500,
    originalPrice: 24000,
    rating: 4.9,
    reviews: 178,
    city: "Maputo",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    badge: "Novo",
  },
  {
    name: "Conjunto de Cabelo Brasileiro",
    price: 4200,
    originalPrice: 5500,
    rating: 4.5,
    reviews: 93,
    city: "Matola",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    badge: "Destaque",
  },
  {
    name: "Castanha de Caju Premium 1kg",
    price: 3200,
    originalPrice: 4000,
    rating: 4.8,
    reviews: 302,
    city: "Nacala",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    badge: "Destaque",
  },
  {
    name: "Anel de Ouro 18K Artesanal",
    price: 12800,
    originalPrice: 15000,
    rating: 4.7,
    reviews: 44,
    city: "Maputo",
    img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80",
    badge: "Novo",
  },
];

const VISIBLE      = 4;
const GAP          = 16;   // px — equivalente a gap-4
const AUTO_DELAY   = 3200; // ms entre avanços automáticos

export function FeaturedSection({ onAddToCart }) {
  const [index, setIndex]   = useState(0);
  const [paused, setPaused] = useState(false);
  const maxIndex = FEATURED.length - VISIBLE;
  const timerRef = useRef(null);

  // ── auto-scroll ──────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, AUTO_DELAY);
  }, [maxIndex]);

  useEffect(() => {
    if (!paused) startTimer();
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [paused, startTimer]);

  // ── navigation ───────────────────────────────────────────────
  const go = (dir) => {
    setIndex((i) => {
      if (dir === "prev") return i <= 0 ? maxIndex : i - 1;
      return i >= maxIndex ? 0 : i + 1;
    });
    // restart timer after manual nav so it doesn't jump too soon
    if (!paused) startTimer();
  };

  // ── progress bar width (0–100%) ──────────────────────────────
  const progress = ((index / maxIndex) * 100).toFixed(1);

  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1450px] mx-auto px-4">

        {/* ── Header ── */}
        <SectionHeader title="Produtos em Destaque">
          <div className="flex items-center gap-3">

            {/* Pause / Play pill */}
            <button
              onClick={() => setPaused((p) => !p)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-green-600 transition-colors duration-200 cursor-pointer border-none bg-transparent px-0"
            >
              {paused ? (
                /* Play icon */
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z"/>
                </svg>
              ) : (
                /* Pause icon */
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              )}
              {paused ? "Retomar" : "Pausar"}
            </button>

            <span className="w-px h-4 bg-gray-200" />

            {/* Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => go("prev")}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-600 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button
                onClick={() => go("next")}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-600 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

          </div>
        </SectionHeader>

        {/* ── Progress bar ── */}
        <div className="w-full h-[3px] bg-gray-100 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── Slider ── */}
        <div
          className="overflow-hidden rounded-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              gap: `${GAP}px`,
              transform: `translateX(calc(-${index} * (100% / ${VISIBLE} + ${GAP / VISIBLE}px)))`,
            }}
          >
            {FEATURED.map((p, i) => (
              <div
                key={i}
                className="flex-shrink-0 transition-opacity duration-300"
                style={{
                  width: `calc((100% - ${(VISIBLE - 1) * GAP}px) / ${VISIBLE})`,
                  opacity: i >= index && i < index + VISIBLE ? 1 : 0.35,
                }}
              >
                <ProductCard p={p} onAddToCart={onAddToCart} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Dots ── */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); if (!paused) startTimer(); }}
              className={[
                "rounded-full border-none cursor-pointer transition-all duration-300",
                i === index
                  ? "bg-green-500 w-6 h-1.5"
                  : "bg-gray-200 hover:bg-gray-300 w-1.5 h-1.5",
              ].join(" ")}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

// Alias para compatibilidade com App.jsx
export { FeaturedSection as DealsSection };