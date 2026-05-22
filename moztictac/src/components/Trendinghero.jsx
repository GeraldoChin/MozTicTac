// src/components/TopTendencias.jsx
import { useState, useRef, useEffect, useCallback } from "react";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

const CAT_FALLBACK = {
  "Roupa":       "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80",
  "Moda":        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80",
  "Celulares":   "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
  "Telemóveis":  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
  "Beleza":      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80",
  "Cabelos":     "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80",
  "Sapatos":     "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
  "Calçado":     "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
  "Electrónico": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80",
  "Acessórios":  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
  "Alimentos":   "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80",
  "Serviços":    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&q=80",
};
const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&q=80";

function getImagem(item) {
  const imgs = item.produto?.imagens ?? [];
  if (imgs.length > 0) return imgs[0];
  const catNome = item.produto?.categoria?.nome ?? "";
  for (const [chave, url] of Object.entries(CAT_FALLBACK)) {
    if (catNome.toLowerCase().includes(chave.toLowerCase())) return url;
  }
  return DEFAULT_FALLBACK;
}

const PLANO_META = {
  premium:  { label: "PREMIUM",  pulse: true,  badgeBg: "#f97316" },
  standard: { label: "EM ALTA",  pulse: false, badgeBg: "#16a34a" },
  basico:   { label: "DESTAQUE", pulse: false, badgeBg: "#3b82f6" },
};

const getCardDims = () => {
  if (typeof window === "undefined") return { w: 180, wh: 210, h: 300 };
  if (window.innerWidth < 640)  return { w: 140, wh: 160, h: 240 };
  if (window.innerWidth < 1024) return { w: 170, wh: 200, h: 280 };
  return { w: 200, wh: 232, h: 320 };
};

const GAP   = 3;
const SPEED = 0.55;

function SkeletonCard({ dims }) {
  return (
    <div
      className="flex-shrink-0 overflow-hidden bg-gray-100 animate-pulse"
      style={{ width: dims.w, height: dims.h }}
    />
  );
}

export default function TopTendencias() {
  const [items, setItems]           = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState(null);
  const [hoveredId, setHoveredId]   = useState(null);
  const [dims, setDims]             = useState(getCardDims);

  const trackRef   = useRef(null);
  const pausedRef  = useRef(false);
  const rafRef     = useRef(null);
  const posicaoRef = useRef(0); // ← posição controlada por ref, não estado

  const buscar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res  = await fetch(`${BASE_URL}/promocoes/ativas`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `Erro ${res.status}`);
      setItems(json.data ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { buscar(); }, [buscar]);

  useEffect(() => {
    const onResize = () => setDims(getCardDims());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Auto-scroll corrigido ─────────────────────────────────────
  useEffect(() => {
    if (items.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    cancelAnimationFrame(rafRef.current);

    const loopWidth = items.length * (dims.w + GAP);

    // Inicializa no meio (segundo bloco)
    posicaoRef.current = loopWidth;
    track.scrollLeft   = loopWidth;

    const tick = () => {
      if (!pausedRef.current) {
        posicaoRef.current += SPEED;

        // Quando chega ao fim do segundo bloco, volta ao início do segundo bloco
        if (posicaoRef.current >= loopWidth * 2) {
          posicaoRef.current = loopWidth;
        }

        track.scrollLeft = posicaoRef.current;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [items, dims]);

  // Manual scroll — actualiza também a posicaoRef para não quebrar o loop
  const manualScroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const loopWidth = items.length * (dims.w + GAP);
    const delta = dir * (dims.w + GAP) * 3;
    posicaoRef.current += delta;

    // Mantém dentro dos limites do loop
    if (posicaoRef.current >= loopWidth * 2) posicaoRef.current = loopWidth;
    if (posicaoRef.current < loopWidth)      posicaoRef.current = loopWidth;

    track.scrollLeft = posicaoRef.current;
  };

  const loop = items.length > 0 ? [...items, ...items, ...items] : [];

  const ChevronLeft  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>;
  const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>;

  if (!carregando && !erro && items.length === 0) return null;

  return (
    <div className="bg-white select-none border-b border-gray-100 max-w-[1450px] mx-auto">
      <style>{`
        .tt-track::-webkit-scrollbar { display: none; }
        @keyframes pulse-hot { 0%,100%{opacity:1} 50%{opacity:.35} }
        .pulse-hot { animation: pulse-hot 1.8s ease-in-out infinite; }
      `}</style>

      {/* Cabeçalho */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-gray-100">
        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
        <span className="text-sm sm:text-[15px] font-black text-gray-900 tracking-tight">
          Top Tendências
        </span>
        <span className="text-xs sm:text-sm text-gray-400 italic hidden sm:block">
          {carregando
            ? "A carregar..."
            : erro
            ? "Não foi possível carregar"
            : `${items.length} produto${items.length !== 1 ? "s" : ""} em destaque`}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {erro && (
            <button
              onClick={buscar}
              className="text-xs text-red-400 hover:text-red-600 border border-red-200 rounded-lg px-2 py-1 bg-transparent cursor-pointer"
            >
              ↻ Tentar
            </button>
          )}
          <button onClick={() => manualScroll(-1)} disabled={carregando || items.length === 0}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-40 bg-transparent cursor-pointer" aria-label="Anterior">
            <ChevronLeft />
          </button>
          <button onClick={() => manualScroll(1)} disabled={carregando || items.length === 0}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-40 bg-transparent cursor-pointer" aria-label="Próximo">
            <ChevronRight />
          </button>
          <a href="/produtos" className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-green-600 hover:text-green-700 transition-colors whitespace-nowrap ml-1">
            Ver todos →
          </a>
        </div>
      </div>

      {/* Slider */}
      <div
        className="relative"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        <div
          ref={trackRef}
          className="tt-track flex overflow-x-auto py-3 px-4"
          style={{ scrollbarWidth: "none", gap: GAP }}
        >
          {carregando && Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} dims={dims} />
          ))}

          {!carregando && erro && items.length === 0 && (
            <div className="flex items-center justify-center w-full py-8 px-4 text-center">
              <div>
                <p className="text-sm text-gray-400 mb-2">Não foi possível carregar os destaques</p>
                <button onClick={buscar}
                  className="text-xs text-green-600 border border-green-200 rounded-lg px-3 py-1.5 bg-transparent cursor-pointer hover:bg-green-50">
                  ↻ Tentar novamente
                </button>
              </div>
            </div>
          )}

          {!carregando && loop.map((item, idx) => {
            const key           = `${item.promocaoId}-${idx}`;
            const isHovered     = hoveredId === key;
            const produto       = item.produto;
            const imagem        = getImagem(item);
            const meta          = PLANO_META[item.planoId] ?? PLANO_META.basico;
            const diasRestantes = item.diasRestantes ?? 0;

            return (
              <div
                key={key}
                onMouseEnter={() => setHoveredId(key)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => { window.location.href = `/produtos/${produto.id}`; }}
                className="relative flex-shrink-0 overflow-hidden cursor-pointer transition-all duration-300 ease-in-out"
                style={{ width: isHovered ? dims.wh : dims.w, height: dims.h }}
              >
                <img
                  src={imagem}
                  alt={produto.nome}
                  className="w-full h-full object-cover object-top block transition-transform duration-500 ease-in-out"
                  style={{ transform: isHovered ? "scale(1.07)" : "scale(1)" }}
                  draggable={false}
                  onError={e => { e.currentTarget.src = DEFAULT_FALLBACK; }}
                />

                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.78) 100%)",
                    opacity: isHovered ? 1 : 0.84,
                  }}
                />

                {isHovered && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "rgba(0,160,70,0.07)" }} />
                )}

                <div
                  className={`absolute top-2 right-2 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase ${meta.pulse ? "pulse-hot" : ""}`}
                  style={{ background: meta.badgeBg }}
                >
                  {meta.label}
                </div>

                {diasRestantes > 0 && diasRestantes <= 3 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {diasRestantes}d restante{diasRestantes !== 1 ? "s" : ""}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-2">
                  <div className="inline-flex items-center gap-1 bg-green-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 backdrop-blur-sm">
                    🔥 {produto.vendas > 0 ? `${produto.vendas} vendas` : "Novidade"}
                  </div>
                  <p className="text-white font-extrabold text-[12px] sm:text-[13px] leading-snug m-0 drop-shadow line-clamp-2">
                    {produto.nome}
                  </p>
                  <p className="text-green-300 text-[11px] font-bold mt-0.5 drop-shadow">
                    {Number(produto.preco).toLocaleString("pt-MZ")} MZN
                  </p>
                  {produto.categoria && (
                    <p className="text-white/60 text-[10px] mt-0.5">{produto.categoria.nome}</p>
                  )}
                  {isHovered && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        Ver produto →
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sm:hidden flex justify-center pb-3">
        <a href="/produtos" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
          Ver todos →
        </a>
      </div>
    </div>
  );
}