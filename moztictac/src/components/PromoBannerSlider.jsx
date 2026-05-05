/**
 * PromoBannersSlider
 *
 * Props:
 *  - onFilterChange(cat)  — quando usado DENTRO da PromoBannersPage, recebe a função de filtro
 *  - navigateTo(path)     — quando usado FORA da PromoBannersPage, recebe a função de navegação
 *                           (ex: React Router → useNavigate, ou Next.js → useRouter().push)
 *                           Se não for passado mas onFilterChange também não for, usa window.location
 *
 * Uso dentro da PromoBannersPage:
 *   <PromoBannersSlider onFilterChange={handleFilterChange} />
 *
 * Uso noutra página (React Router):
 *   import { useNavigate } from "react-router-dom";
 *   const navigate = useNavigate();
 *   <PromoBannersSlider navigateTo={(path) => navigate(path)} />
 *
 * Uso noutra página (Next.js):
 *   import { useRouter } from "next/navigation";
 *   const router = useRouter();
 *   <PromoBannersSlider navigateTo={(path) => router.push(path)} />
 */

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Rota da PromoBannersPage — ajusta conforme o teu router ─── */
const PROMO_PAGE_PATH = "/promocoes"; // ex: "/deals", "/home", etc.

const VISIBLE = 3;
const AUTO_INTERVAL = 4000;
const TRANSITION_MS = 600;

/* ─── Dados sincronizados com PromoBannersPage ──────────────────── */
export const PROMO_BANNERS = [
  {
    cat: "Calçados",
    emoji: "👟",
    title: "Calçados",
    sub: "Até 75% desconto",
    color: "#b91c1c",
    img: "img/img.jpg",
  },
  {
    cat: "Acessórios",
    emoji: "⌚",
    title: "Relógios",
    sub: "Mín. 45% desconto",
    color: "#1d4ed8",
    img: "img/img1.jpg",
  },
  {
    cat: "Roupa",
    emoji: "👗",
    title: "Moda",
    sub: "Colecção exclusiva",
    color: "#7c3aed",
    img: "img/img2.jpg",
  },
  {
    cat: "Tech",
    emoji: "🎧",
    title: "Tech",
    sub: "Marcas internacionais",
    color: "#0369a1",
    img: "img/img3.jpg",
  },
  {
    cat: "Alimentos",
    emoji: "🥗",
    title: "Alimentos",
    sub: "Produtos frescos",
    color: "#15803d",
    img: "img/img4.jpg",
  },
  {
    cat: "Beleza",
    emoji: "💄",
    title: "Beleza",
    sub: "Importados a preço bom",
    color: "#be185d",
    img: "img/img5.jpg",
  },
];

/* ─── Keyframes (injectados uma vez) ───────────────────────────── */
const STYLES = `
  .pbs-img-wrap { position:absolute; inset:0; width:100%; height:100%; }
  .pbs-img-wrap img {
    position:absolute; inset:0; width:100%; height:100%;
    object-fit:cover; filter:brightness(0.58);
  }
  .pbs-card:hover .pbs-img-static { transform:scale(1.05); transition:transform 0.5s ease; }

  .img-exit-fwd  { animation: imgExitFwd  var(--dur) ease forwards; }
  .img-exit-back { animation: imgExitBack var(--dur) ease forwards; }
  .img-enter-fwd { animation: imgEnterFwd var(--dur) ease forwards; }
  .img-enter-back{ animation: imgEnterBack var(--dur) ease forwards; }

  @keyframes imgExitFwd   { from{opacity:1;transform:scale(1) translateX(0)}    to{opacity:0;transform:scale(.94) translateX(-8%)} }
  @keyframes imgExitBack  { from{opacity:1;transform:scale(1) translateX(0)}    to{opacity:0;transform:scale(.94) translateX(8%)}  }
  @keyframes imgEnterFwd  { from{opacity:0;transform:scale(1.06) translateX(8%)} to{opacity:1;transform:scale(1) translateX(0)}    }
  @keyframes imgEnterBack { from{opacity:0;transform:scale(1.06) translateX(-8%)} to{opacity:1;transform:scale(1) translateX(0)}   }

  .pbs-content { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; padding:0 20px; z-index:4; }
  .pbs-content.pbs-content-in { animation: pbsContentIn 0.4s ease 0.08s both; }
  @keyframes pbsContentIn { from{opacity:0;transform:translateY(9px)} to{opacity:1;transform:translateY(0)} }

  .pbs-ring { position:absolute; inset:0; border-radius:12px; pointer-events:none; opacity:0; transition:opacity .2s; z-index:5; }
  .pbs-card:hover .pbs-ring { opacity:1; }
  .pbs-cta  { display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:700; color:rgba(255,255,255,.8); transition:color .2s; }
  .pbs-card:hover .pbs-cta { color:#fff; }

  /* ── FIX: wrapper que garante largura máxima e padding lateral ── */
  .pbs-outer {
    width: 100%;
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
    box-sizing: border-box;
  }

  /* ── FIX: grid com colunas fluídas, sem mínimo fixo ── */
  .pbs-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 900px) {
    .pbs-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 580px) {
    .pbs-grid { grid-template-columns: 1fr; }
  }
`;

/* ─── BannerCard ─────────────────────────────────────────────────── */
function BannerCard({ banner, prevImg, isChanging, direction, onClick }) {
  const exitCls  = direction >= 0 ? "img-exit-fwd"   : "img-exit-back";
  const enterCls = direction >= 0 ? "img-enter-fwd"  : "img-enter-back";
  const crossfade = isChanging && prevImg && prevImg !== banner.img;

  return (
    <div
      className="pbs-card relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group"
      style={{ height: 190, "--dur": `${TRANSITION_MS}ms` }}
      onClick={onClick}
    >
      {/* Image crossfade */}
      <div className="pbs-img-wrap">
        {crossfade && (
          <img key={`prev-${prevImg}`} src={prevImg} alt="" className={exitCls} style={{ zIndex: 1 }} />
        )}
        <img
          key={`curr-${banner.img}`}
          src={banner.img}
          alt={banner.title}
          className={crossfade ? enterCls : "pbs-img-static"}
          style={{ zIndex: 2 }}
        />
      </div>

      {/* Gradient */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right,rgba(0,0,0,0.72) 0%,transparent 100%)", zIndex: 3 }} />

      {/* Colour bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: banner.color, zIndex: 4, transition: "background .4s" }} />

      {/* Text */}
      <div className={`pbs-content${isChanging ? " pbs-content-in" : ""}`}>
        <span className="text-2xl mb-1">{banner.emoji}</span>
        <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
          {banner.cat}
        </p>
        <h3 className="text-lg font-black text-white m-0">{banner.title}</h3>
        <p className="text-xs mt-0.5 mb-3" style={{ color: "rgba(255,255,255,0.78)" }}>{banner.sub}</p>
        <span className="pbs-cta">
          Filtrar produtos
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>

      {/* Hover ring */}
      <div className="pbs-ring" style={{ border: `2px solid ${banner.color}` }} />
    </div>
  );
}

/* ─── PromoBannersSlider ─────────────────────────────────────────── */
export default function PromoBannersSlider({ onFilterChange, navigateTo }) {
  const [startIdx, setStartIdx]     = useState(0);
  const [prevSlice, setPrevSlice]   = useState(null);
  const [direction, setDirection]   = useState(1);
  const [isChanging, setIsChanging] = useState(false);

  const timerRef    = useRef(null);
  const busyRef     = useRef(false);
  const idxRef      = useRef(0);

  const maxIdx = PROMO_BANNERS.length - VISIBLE;

  /* Clique num card: filtra se estiver na mesma página, navega se não */
  const handleCardClick = useCallback((cat) => {
    if (onFilterChange) {
      onFilterChange(cat);
      setTimeout(() => {
        document.getElementById("deals-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } else {
      const target = `${PROMO_PAGE_PATH}?cat=${encodeURIComponent(cat)}`;
      if (navigateTo) {
        navigateTo(target);
      } else {
        window.location.href = target;
      }
    }
  }, [onFilterChange, navigateTo]);

  /* Transição */
  const goTo = useCallback((nextIdx, dir) => {
    if (busyRef.current) return;
    busyRef.current = true;

    const currentImgs = PROMO_BANNERS.slice(idxRef.current, idxRef.current + VISIBLE).map((b) => b.img);
    setPrevSlice(currentImgs);
    setDirection(dir);
    setStartIdx(nextIdx);
    idxRef.current = nextIdx;
    setIsChanging(true);

    setTimeout(() => {
      setIsChanging(false);
      setPrevSlice(null);
      busyRef.current = false;
    }, TRANSITION_MS + 50);
  }, []);

  const navigate = (dir) => {
    const next = idxRef.current + dir;
    if (next < 0 || next > maxIdx) return;
    goTo(next, dir);
    scheduleAuto();
  };

  const handleDot = (i) => {
    goTo(i, i > idxRef.current ? 1 : -1);
    scheduleAuto();
  };

  /* Auto-advance */
  const scheduleAuto = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const cur  = idxRef.current;
      const next = cur < maxIdx ? cur + 1 : 0;
      goTo(next, next > cur ? 1 : -1);
    }, AUTO_INTERVAL);
  }, [goTo, maxIdx]);

  useEffect(() => {
    scheduleAuto();
    return () => clearInterval(timerRef.current);
  }, [scheduleAuto]);

  /* Ler ?cat= da URL ao montar */
  useEffect(() => {
    if (!onFilterChange) return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    if (cat) onFilterChange(decodeURIComponent(cat));
  }, []);

  const visibleBanners = PROMO_BANNERS.slice(startIdx, startIdx + VISIBLE);
  const canPrev = startIdx > 0;
  const canNext = startIdx < maxIdx;

  return (
    <>
      <style>{STYLES}</style>

      {/* ── pbs-outer: limita largura e centra, igual ao max-w-7xl da PromoBannersPage ── */}
      <div className="pbs-outer">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-gray-900">Categorias em Destaque</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {onFilterChange
                ? "Clica numa categoria para filtrar os produtos abaixo"
                : "Clica numa categoria para ver as ofertas"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev */}
            <button
              onClick={() => navigate(-1)}
              disabled={!canPrev}
              className="w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer transition-all"
              style={{ background: "#fff", borderColor: "#e5e7eb", opacity: canPrev ? 1 : 0.35 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Next */}
            <button
              onClick={() => navigate(1)}
              disabled={!canNext}
              className="w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer transition-all"
              style={{
                background: canNext ? "#22c55e" : "#f9fafb",
                borderColor: canNext ? "#22c55e" : "#e5e7eb",
                opacity: canNext ? 1 : 0.35,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={canNext ? "#fff" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Cards — grid fluído sem mínimo fixo ── */}
        <div className="pbs-grid">
          {visibleBanners.map((banner, i) => (
            <BannerCard
              key={banner.cat}
              banner={banner}
              prevImg={prevSlice ? prevSlice[i] : null}
              isChanging={isChanging}
              direction={direction}
              onClick={() => handleCardClick(banner.cat)}
            />
          ))}
        </div>

        {/* ── Dots ── */}
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleDot(i)}
              className="border-none cursor-pointer rounded-full transition-all duration-300"
              style={{
                width: i === startIdx ? 22 : 6,
                height: 6,
                background: i === startIdx ? "#22c55e" : "#d1d5db",
                padding: 0,
              }}
            />
          ))}
        </div>

      </div>
    </>
  );
}