import { useState, useRef } from "react";

const TRENDS = [
  {
    id: 1,
    tag: "Em Alta",
    hashtag: "#Abiti da crociera",
    badge: "Aumento del 45%",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
  },
  {
    id: 2,
    tag: "Pico",
    hashtag: "#stileibiza",
    badge: "Aumento del 122%",
    img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80",
  },
  {
    id: 3,
    tag: "Pico",
    hashtag: "#Vibrazioni da vacanza",
    badge: "Aumento del 7%",
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80",
  },
  {
    id: 4,
    tag: "Pico",
    hashtag: "#Ondata di ca-lore rossa",
    badge: "Aumento del 63%",
    img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
  },
  {
    id: 5,
    tag: "Popular",
    hashtag: "#lookdafestival",
    badge: "Aumento del 7%",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
    hot: true,
  },
  {
    id: 6,
    tag: "Pico",
    hashtag: "#Elegante blu navy",
    badge: "Aumento del 63%",
    img: "https://images.unsplash.com/photo-1570976447640-ac859083963f?w=400&q=80",
  },
  {
    id: 7,
    tag: "Em Alta",
    hashtag: "#Glam stico",
    badge: "Aumento del 38%",
    img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80",
  },
  {
    id: 8,
    tag: "Pico",
    hashtag: "#Casaco Pelinho",
    badge: "Aumento del 55%",
    img: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80",
  },
  {
    id: 9,
    tag: "Pico",
    hashtag: "#Dopamina Arco Íris",
    badge: "Aumento del 29%",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80",
  },
];

export default function TopTendencias() {
  const [hoveredId, setHoveredId] = useState(null);
  const trackRef = useRef(null);

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  return (
    <div className="bg-gray-950 pb-4 select-none max-w-7xl mx-auto px-4">
      <style>{`
        .tt-track::-webkit-scrollbar { display: none; }
        @keyframes hotPulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
        .pulse-hot { animation: hotPulse 1.8s ease-in-out infinite; }
      `}</style>

      {/* ── Header ── */}
      <div className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-center gap-3">
        <span className="text-[17px] font-black text-white tracking-tight flex items-center gap-0.5">
          <span className="text-green-400">T</span>op
          <span className="text-green-400 ml-0.5">T</span>endências
        </span>
        <span className="text-sm text-gray-500 italic hidden sm:block">
          Moda acessível a todos
        </span>
        <div className="ml-auto opacity-20">
          <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
            <path
              d="M0 14 Q10 4 20 14 Q30 24 40 14 Q50 4 60 14 Q70 24 80 14"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <a href="#" className="text-sm font-semibold text-green-400 hover:text-green-300 transition-colors whitespace-nowrap ml-4">
          Ver todos →
        </a>
      </div>

      {/* ── Slider ── */}
      <div className="relative">
        {/* Prev */}
        <button
          onClick={() => scroll(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-green-500 border border-white/20 backdrop-blur-sm transition-all duration-150 flex items-center justify-center text-xl font-bold text-white shadow-lg"
        >
          ‹
        </button>

        {/* Next */}
        <button
          onClick={() => scroll(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-green-500 border border-white/20 backdrop-blur-sm transition-all duration-150 flex items-center justify-center text-xl font-bold text-white shadow-lg"
        >
          ›
        </button>

        {/* Track */}
        <div
          ref={trackRef}
          className="tt-track flex overflow-x-auto gap-0.5"
          style={{ scrollbarWidth: "none" }}
        >
          {TRENDS.map((item) => {
            const isHovered = hoveredId === item.id;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative flex-shrink-0 overflow-hidden cursor-pointer transition-all duration-300 ease-in-out"
                style={{
                  width: isHovered ? 220 : 190,
                  height: 360,
                }}
              >
                {/* Image */}
                <img
                  src={item.img}
                  alt={item.hashtag}
                  className="w-full h-full object-cover block transition-transform duration-500 ease-in-out"
                  style={{ transform: isHovered ? "scale(1.08)" : "scale(1)" }}
                  draggable={false}
                />

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.78) 100%)",
                    opacity: isHovered ? 1 : 0.85,
                  }}
                />

                {/* Green tint on hover */}
                {isHovered && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "rgba(0,180,80,0.07)" }}
                  />
                )}

                {/* POPULAR badge */}
                {item.hot && (
                  <div className="absolute top-2.5 right-2.5 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase pulse-hot">
                    POPULAR
                  </div>
                )}

                {/* Tag badge */}
                {!item.hot && (
                  <div
                    className={`absolute top-2.5 left-2.5 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-wide uppercase ${
                      item.tag === "Em Alta" ? "bg-green-500" : "bg-green-700"
                    }`}
                  >
                    {item.tag}
                  </div>
                )}

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3.5 pt-2">
                  <div className="inline-flex items-center gap-1 bg-green-600/85 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5">
                    <span className="text-[9px]">↑</span>
                    {item.badge}
                  </div>
                  <p
                    className="text-white font-extrabold leading-tight m-0 drop-shadow-md"
                    style={{ fontSize: 14 }}
                  >
                    {item.hashtag}
                  </p>

                  {/* Hover CTA */}
                  {isHovered && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-500 hover:bg-green-400 text-white text-[10px] font-bold px-3 py-1 rounded-full transition-colors">
                        Ver produtos →
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover shine */}
                {isHovered && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}