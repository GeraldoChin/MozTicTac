// src/components/Heroproduct.jsx
// Actualizado para buscar slides da API com fallback automático
import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, TrendingUp, ShoppingBag, Star } from "lucide-react";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

const G  = "#00b96b";
const GL = "#e6f9f0";

// Slides de fallback local (caso API falhe)
const SLIDES_FALLBACK = [
  { id:"f1", titulo:"Moda Moçambicana", subtitulo:"Autêntica & Artesanal", descricao:"Capulanas, Chitenges e muito mais — directamente dos melhores artesãos do país.", ctaTexto:"Explorar Roupa", ctaUrl:"/tendencias", imagemUrl:"https://images.unsplash.com/photo-1594938298603-c8148c4b4832?w=900&q=80", tag:"Novo", accentColor:G, statLabel:"Artesãos locais", statValor:"+340" },
  { id:"f2", titulo:"Tecnologia Premium", subtitulo:"Entrega em Todo o País", descricao:"Os melhores celulares, auscultadores e electrónicos com garantia e suporte local.", ctaTexto:"Ver Electrónicos", ctaUrl:"/tendencias", imagemUrl:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80", tag:"Destaque", accentColor:"#3b82f6", statLabel:"Produtos tech", statValor:"+120" },
  { id:"f3", titulo:"Ofertas Relâmpago", subtitulo:"Até 40% de Desconto", descricao:"Promoções por tempo limitado nos melhores produtos. Não percas esta oportunidade!", ctaTexto:"Ver Promoções", ctaUrl:"/tendencias", imagemUrl:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80", tag:"🔥 Hot", accentColor:"#f97316", statLabel:"Vendas hoje", statValor:"+1.240" },
];

export function Heroproduct() {
  const [slides,    setSlides]    = useState(SLIDES_FALLBACK);
  const [idx,       setIdx]       = useState(0);
  const [animating, setAnimating] = useState(false);
  const [carregado, setCarregado] = useState(false);

  // Buscar slides da API
  useEffect(() => {
    fetch(`${BASE_URL}/hero`)
      .then(r => r.json())
      .then(d => {
        const lista = d?.data;
        if (Array.isArray(lista) && lista.length > 0) {
          setSlides(lista);
          setIdx(0);
        }
      })
      .catch(() => {})
      .finally(() => setCarregado(true));
  }, []);

  // Auto-avanço
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => goTo((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  function goTo(nextOrFn) {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setIdx(prev => typeof nextOrFn === "function" ? nextOrFn(prev) : nextOrFn);
      setAnimating(false);
    }, 350);
  }

  const s = slides[idx] || SLIDES_FALLBACK[0];

  return (
    <div className="relative w-full overflow-hidden bg-gray-950" style={{ minHeight:320 }}>

      {/* Background */}
      <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity:animating?0:1 }}>
        <img src={s.imagemUrl} alt="" className="w-full h-full object-cover" style={{ filter:"brightness(.38)" }} />
        <div className="absolute inset-0" style={{ background:"linear-gradient(to right,rgba(0,0,0,.82) 40%,rgba(0,0,0,.18))" }} />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 flex items-center justify-between gap-12" style={{ minHeight:320 }}>

        {/* Left */}
        <div className="max-w-lg py-16 transition-all duration-300" style={{ opacity:animating?0:1, transform:animating?"translateY(12px)":"translateY(0)" }}>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full mb-5 uppercase tracking-widest"
            style={{ background:s.accentColor+"22", color:s.accentColor, border:`1px solid ${s.accentColor}44` }}>
            <Sparkles size={10}/> {s.tag}
          </span>

          <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-3" style={{ letterSpacing:"-1px" }}>
            {s.titulo}
          </h1>

          <p className="text-xl font-bold mb-4" style={{ color:s.accentColor }}>
            {s.subtitulo}
          </p>

          {s.descricao && (
            <p className="text-sm leading-relaxed mb-8" style={{ color:"rgba(255,255,255,.6)", maxWidth:420 }}>
              {s.descricao}
            </p>
          )}

          <div className="flex items-center gap-3">
            <a href={s.ctaUrl}
              className="flex items-center gap-2 px-6 py-3 text-sm font-black text-white rounded-xl transition-all hover:scale-105 no-underline"
              style={{ background:s.accentColor }}>
              <ShoppingBag size={14}/> {s.ctaTexto} <ArrowRight size={14}/>
            </a>
            <a href="/tendencias"
              className="px-6 py-3 text-sm font-bold rounded-xl no-underline transition-all"
              style={{ border:"1.5px solid rgba(255,255,255,.25)", color:"rgba(255,255,255,.8)" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              Ver tudo
            </a>
          </div>

          <div className="flex items-center gap-3 mt-8">
            {["Entrega rápida","Pagamento seguro","Devoluções grátis"].map(l=>(
              <span key={l} className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.55)" }}>
                <span style={{ color:G }}>✓</span> {l}
              </span>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="hidden lg:flex flex-col items-end gap-4 py-16 transition-all duration-300"
          style={{ opacity:animating?0:1, transform:animating?"translateY(12px)":"translateY(0)" }}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ width:300, height:340, border:"1.5px solid rgba(255,255,255,.12)" }}>
            <img src={s.imagemUrl} alt="" className="w-full h-full object-cover"/>
            <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 60%)" }}/>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm font-black">{s.titulo}</p>
              <p className="text-[11px] mt-0.5" style={{ color:s.accentColor }}>{s.subtitulo}</p>
            </div>
          </div>

          {s.statLabel && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl"
              style={{ background:"rgba(255,255,255,.06)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,.12)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:GL }}>
                <TrendingUp size={16} style={{ color:G }}/>
              </div>
              <div>
                <p className="text-[10px]" style={{ color:"rgba(255,255,255,.5)" }}>{s.statLabel}</p>
                <p className="text-sm font-black text-white">{s.statValor}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background:"rgba(255,255,255,.06)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,.12)" }}>
            <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} size={11} fill="#f59e0b" stroke="#f59e0b"/>)}</div>
            <span className="text-[11px] font-bold text-white">4.9</span>
            <span className="text-[10px]" style={{ color:"rgba(255,255,255,.4)" }}>· 2.4k avaliações</span>
          </div>
        </div>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <span className="text-[10px] font-bold tabular-nums" style={{ color:"rgba(255,255,255,.35)" }}>
            {String(idx+1).padStart(2,"0")} / {String(slides.length).padStart(2,"0")}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_,i)=>(
              <button key={i} onClick={()=>goTo(i)} className="rounded-full border-none cursor-pointer transition-all duration-300"
                style={{ width:i===idx?28:6, height:6, background:i===idx?s.accentColor:"rgba(255,255,255,.3)" }}/>
            ))}
          </div>
        </div>
      )}

      {/* Arrows */}
      {slides.length > 1 && (<>
        <button onClick={()=>goTo(idx===0?slides.length-1:idx-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all"
          style={{ background:"rgba(255,255,255,.08)", color:"#fff", border:"1px solid rgba(255,255,255,.12)" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.16)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}>
          <ChevronLeft size={18}/>
        </button>
        <button onClick={()=>goTo((idx+1)%slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all"
          style={{ background:"rgba(255,255,255,.08)", color:"#fff", border:"1px solid rgba(255,255,255,.12)" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.16)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}>
          <ChevronRight size={18}/>
        </button>
      </>)}
    </div>
  );
}