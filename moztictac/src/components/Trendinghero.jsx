import { useState, useRef, useEffect } from "react";

const TRENDS = [
  {
    id: 1,
    tag: "Em Alta",
    hashtag: "#Abiti da crociera",
    badge: "Aumento 45%",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80",
  },
  {
    id: 2,
    tag: "Pico",
    hashtag: "#stileibiza",
    badge: "Aumento 122%",
    img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&q=80",
  },
  {
    id: 3,
    tag: "Pico",
    hashtag: "#Vibrações de Verão",
    badge: "Aumento 7%",
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=80",
  },
  {
    id: 4,
    tag: "Pico",
    hashtag: "#Onda de Calor Vermelha",
    badge: "Aumento 63%",
    img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=80",
  },
  {
    id: 5,
    tag: "Popular",
    hashtag: "#lookdefestival",
    badge: "Aumento 7%",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80",
    hot: true,
  },
  {
    id: 6,
    tag: "Pico",
    hashtag: "#Elegante Azul Navy",
    badge: "Aumento 63%",
    img: "https://images.unsplash.com/photo-1570976447640-ac859083963f?w=500&q=80",
  },
  {
    id: 7,
    tag: "Em Alta",
    hashtag: "#Roupa Capulana",
    badge: "Aumento 38%",
    img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&q=80",
  },
  {
    id: 8,
    tag: "Pico",
    hashtag: "#Casaco Pelinho",
    badge: "Aumento 55%",
    img: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500&q=80",
  },
  {
    id: 9,
    tag: "Pico",
    hashtag: "#Dopamina Arco-Íris",
    badge: "Aumento 29%",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80",
  },
];

const CARD_W = 200;
const CARD_W_HOVER = 232;
const CARD_H = 320;
const GAP = 3;
const SPEED = 0.55;

export default function TopTendencias() {
  const [hoveredId, setHoveredId] = useState(null);
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const rafRef = useRef(null);

  // Duplicate for seamless infinite scroll
  const items = [...TRENDS, ...TRENDS, ...TRENDS];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const loopWidth = TRENDS.length * (CARD_W + GAP);

    // Start mid-way so we can scroll both directions
    track.scrollLeft = loopWidth;

    const tick = () => {
      if (!pausedRef.current) {
        track.scrollLeft += SPEED;
        if (track.scrollLeft >= loopWidth * 2) track.scrollLeft -= loopWidth;
        if (track.scrollLeft <= 0) track.scrollLeft += loopWidth;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const manualScroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * (CARD_W + GAP) * 3, behavior: "smooth" });
  };

  return (
    <div className="bg-white select-none border-b border-gray-100 max-w-7xl mx-auto">
      <style>{`
        .tt-track::-webkit-scrollbar { display: none; }
        @keyframes pulse-hot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse-hot { animation: pulse-hot 1.8s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        <span className="text-[15px] font-black text-gray-900 tracking-tight">
          Top Tendências
        </span>
        <span className="text-sm text-gray-400 italic hidden sm:block">
          Moda acessível a todos
        </span>
        <a
          href="/produtos"
          className="ml-auto text-sm font-semibold text-green-600 hover:text-green-700 transition-colors whitespace-nowrap"
        >
          Ver todos os →
        </a>
      </div>

      {/* Slider */}
      <div
        className="relative"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
        />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
         /> 

        {/* Prev */}
        <button
          onClick={() => manualScroll(-1)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-green-500 hover:text-green-600 hover:scale-110 transition-all duration-150 flex items-center justify-center text-lg font-bold text-gray-600 shadow-sm"
        >
          ‹
        </button>

        {/* Next */}
        <button
          onClick={() => manualScroll(1)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-green-500 hover:text-green-600 hover:scale-110 transition-all duration-150 flex items-center justify-center text-lg font-bold text-gray-600 shadow-sm"
        >
          ›
        </button>

        {/* Track */}
        <div
          ref={trackRef}
          className="tt-track flex overflow-x-auto py-3 px-4"
          style={{ scrollbarWidth: "none", gap: GAP }}
        >
          {items.map((item, idx) => {
            const isHovered = hoveredId === `${item.id}-${idx}`;

            return (
              <div
                key={`${item.id}-${idx}`}
                onMouseEnter={() => setHoveredId(`${item.id}-${idx}`)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative flex-shrink-0 overflow-hidden cursor-pointer  transition-all duration-300 ease-in-out"
                style={{ width: isHovered ? CARD_W_HOVER : CARD_W, height: CARD_H }}
              >
                {/* Image */}
                <img
                  src={item.img}
                  alt={item.hashtag}
                  className="w-full h-full object-cover object-top block transition-transform duration-500 ease-in-out"
                  style={{ transform: isHovered ? "scale(1.07)" : "scale(1)" }}
                  draggable={false}
                />

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0  transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.0) 20%, rgba(0,0,0,0.75) 100%)",
                    opacity: isHovered ? 1 : 0.82,
                  }}
                />

                {/* Green tint on hover */}
                {isHovered && (
                  <div
                    className="absolute inset-0  pointer-events-none"
                    style={{ background: "rgba(0,160,70,0.08)" }}
                  />
                )}

                {/* POPULAR badge */}
                {item.hot && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase pulse-hot">
                    POPULAR
                  </div>
                )}

                {/* Tag top-left */}
                {!item.hot && (
                  <div
                    className={`absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wide uppercase ${
                      item.tag === "Em Alta" ? "bg-green-500" : "bg-green-700"
                    }`}
                  >
                    {item.tag}
                  </div>
                )}

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-2">
                  <div className="inline-flex items-center gap-1 bg-green-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 backdrop-blur-sm">
                    <span>↑</span>
                    {item.badge}
                  </div>

                  <p className="text-white font-extrabold text-[13px] leading-snug m-0 drop-shadow">
                    {item.hashtag}
                  </p>

                  {isHovered && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        Ver produtos →
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}