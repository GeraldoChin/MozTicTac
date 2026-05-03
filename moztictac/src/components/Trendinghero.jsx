import { useState, useRef, useEffect } from "react";

const TRENDS = [
  { id: 1, tag: "Em Alta",  hashtag: "#Abiti da crociera",   badge: "Aumento 45%",  img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80" },
  { id: 2, tag: "Pico",     hashtag: "#stileibiza",           badge: "Aumento 122%", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&q=80" },
  { id: 3, tag: "Pico",     hashtag: "#Vibrações de Verão",   badge: "Aumento 7%",   img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=80" },
  { id: 4, tag: "Pico",     hashtag: "#Onda de Calor Vermelha", badge: "Aumento 63%", img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=80" },
  { id: 5, tag: "Popular",  hashtag: "#lookdefestival",        badge: "Aumento 7%",   img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80", hot: true },
  { id: 6, tag: "Pico",     hashtag: "#Elegante Azul Navy",    badge: "Aumento 63%",  img: "https://images.unsplash.com/photo-1570976447640-ac859083963f?w=500&q=80" },
  { id: 7, tag: "Em Alta",  hashtag: "#Roupa Capulana",        badge: "Aumento 38%",  img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&q=80" },
  { id: 8, tag: "Pico",     hashtag: "#Casaco Pelinho",        badge: "Aumento 55%",  img: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500&q=80" },
  { id: 9, tag: "Pico",     hashtag: "#Dopamina Arco-Íris",    badge: "Aumento 29%",  img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80" },
];

/* Dimensões responsivas — calculadas em runtime */
const getCardDims = () => {
  if (typeof window === "undefined") return { w: 180, wh: 210, h: 300 };
  if (window.innerWidth < 640)  return { w: 140, wh: 160, h: 240 }; // mobile
  if (window.innerWidth < 1024) return { w: 170, wh: 200, h: 280 }; // tablet
  return { w: 200, wh: 232, h: 320 };                                // desktop
};

const GAP   = 3;
const SPEED = 0.55;

export default function TopTendencias() {
  const [hoveredId, setHoveredId] = useState(null);
  const [dims, setDims]           = useState(getCardDims);

  const trackRef  = useRef(null);
  const pausedRef = useRef(false);
  const rafRef    = useRef(null);

  /* Actualiza dimensões ao redimensionar */
  useEffect(() => {
    const onResize = () => setDims(getCardDims());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Infinite scroll automático */
  const items = [...TRENDS, ...TRENDS, ...TRENDS];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const loopWidth = TRENDS.length * (dims.w + GAP);
    track.scrollLeft = loopWidth;

    const tick = () => {
      if (!pausedRef.current) {
        track.scrollLeft += SPEED;
        if (track.scrollLeft >= loopWidth * 2) track.scrollLeft -= loopWidth;
        if (track.scrollLeft <= 0)             track.scrollLeft += loopWidth;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dims]);

  const manualScroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * (dims.w + GAP) * 3, behavior: "smooth" });
  };

  /* Ícones SVG limpos para os botões */
  const ChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  );
  const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  );

  return (
    <div className="bg-white select-none border-b border-gray-100 max-w-[1450px] mx-auto">
      <style>{`
        .tt-track::-webkit-scrollbar { display: none; }
        @keyframes pulse-hot { 0%,100%{opacity:1} 50%{opacity:.4} }
        .pulse-hot { animation: pulse-hot 1.8s ease-in-out infinite; }
      `}</style>

      {/* ── Cabeçalho ── */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-gray-100">
        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        <span className="text-sm sm:text-[15px] font-black text-gray-900 tracking-tight">
          Top Tendências
        </span>
        <span className="text-xs sm:text-sm text-gray-400 italic hidden sm:block">
          Moda acessível a todos
        </span>

        {/* Botões nav — no header, alinhados à direita */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => manualScroll(-1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all duration-150"
            aria-label="Anterior"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => manualScroll(1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all duration-150"
            aria-label="Próximo"
          >
            <ChevronRight />
          </button>
          <a
            href="/produtos"
            className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-green-600 hover:text-green-700 transition-colors whitespace-nowrap ml-1"
          >
            Ver todos →
          </a>
        </div>
      </div>

      {/* ── Slider ── */}
      <div
        className="relative"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="tt-track flex overflow-x-auto py-3 px-4"
          style={{ scrollbarWidth: "none", gap: GAP }}
        >
          {items.map((item, idx) => {
            const key       = `${item.id}-${idx}`;
            const isHovered = hoveredId === key;

            return (
              <div
                key={key}
                onMouseEnter={() => setHoveredId(key)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative flex-shrink-0 overflow-hidden cursor-pointer transition-all duration-300 ease-in-out"
                style={{ width: isHovered ? dims.wh : dims.w, height: dims.h }}
              >
                {/* Imagem */}
                <img
                  src={item.img}
                  alt={item.hashtag}
                  className="w-full h-full object-cover object-top block transition-transform duration-500 ease-in-out"
                  style={{ transform: isHovered ? "scale(1.07)" : "scale(1)" }}
                  draggable={false}
                />

                {/* Gradiente */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.75) 100%)",
                    opacity: isHovered ? 1 : 0.82,
                  }}
                />

                {/* Verde sutil no hover */}
                {isHovered && (
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,160,70,0.08)" }} />
                )}

                {/* Badge POPULAR */}
                {item.hot && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase pulse-hot">
                    POPULAR
                  </div>
                )}

                {/* Tag top-left */}
                {!item.hot && (
                  <div className={`absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wide uppercase ${item.tag === "Em Alta" ? "bg-green-500" : "bg-green-700"}`}>
                    {item.tag}
                  </div>
                )}

                {/* Conteúdo inferior */}
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-2">
                  <div className="inline-flex items-center gap-1 bg-green-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 backdrop-blur-sm">
                    <span>↑</span>
                    {item.badge}
                  </div>
                  <p className="text-white font-extrabold text-[12px] sm:text-[13px] leading-snug m-0 drop-shadow">
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

      {/* Ver todos — mobile only, abaixo do slider */}
      <div className="sm:hidden flex justify-center pb-3">
        <a href="/produtos" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
          Ver todos →
        </a>
      </div>
    </div>
  );
}