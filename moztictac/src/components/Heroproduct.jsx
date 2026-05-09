import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, TrendingUp, ShoppingBag, Star } from "lucide-react";

const G  = "#00b96b";
const GD = "#009a5a";
const GL = "#e6f9f0";

const HERO_SLIDES = [
  {
    title: "Moda Moçambicana",
    subtitle: "Autêntica & Artesanal",
    desc: "Capulanas, Chitenges e muito mais — directamente dos melhores artesãos do país.",
    cta: "Explorar Roupa",
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4832?w=900&q=80",
    tag: "Novo",
    accent: G,
    stat: { label: "Artesãos locais", value: "+340" },
  },
  {
    title: "Tecnologia Premium",
    subtitle: "Entrega em Todo o País",
    desc: "Os melhores celulares, auscultadores e electrónicos com garantia e suporte local.",
    cta: "Ver Electrónicos",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80",
    tag: "Destaque",
    accent: "#3b82f6",
    stat: { label: "Produtos tech", value: "+120" },
  },
  {
    title: "Ofertas Relâmpago",
    subtitle: "Até 40% de Desconto",
    desc: "Promoções por tempo limitado nos melhores produtos. Não percas esta oportunidade!",
    cta: "Ver Promoções",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80",
    tag: "🔥 Hot",
    accent: "#f97316",
    stat: { label: "Vendas hoje", value: "+1.240" },
  },
];

export function Heroproduct() {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const s = HERO_SLIDES[idx];

  useEffect(() => {
    const t = setInterval(() => goTo((idx + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [idx]);

  function goTo(next) {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setIdx(next); setAnimating(false); }, 400);
  }

  return (
    <div className="relative w-full overflow-hidden bg-gray-950" style={{ minHeight: 320 }}>

      {/* ── Background image ── */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: animating ? 0 : 1 }}>
        <img
          src={s.img}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "brightness(.38)" }}
        />
        {/* subtle gradient overlay left → right */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,.82) 40%, rgba(0,0,0,.18))" }} />
      </div>

      {/* ── Content ── */}
      <div
        className="relative max-w-7xl mx-auto px-6 flex items-center justify-between gap-12"
        style={{ minHeight: 320 }}>

        {/* Left — text */}
        <div
          className="max-w-lg py-16 transition-all duration-320"
          style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(12px)" : "translateY(0)" }}>

          {/* Tag pill */}
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full mb-5 uppercase tracking-widest"
            style={{ background: s.accent + "22", color: s.accent, border: `1px solid ${s.accent}44` }}>
            <Sparkles size={10} /> {s.tag}
          </span>

          {/* Title */}
          <h1
            className="text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-3"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-1px" }}>
            {s.title}
          </h1>

          {/* Subtitle */}
          <p
            className="text-xl font-bold mb-4"
            style={{ color: s.accent, fontFamily: "'Syne', sans-serif" }}>
            {s.subtitle}
          </p>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,.6)", maxWidth: 420 }}>
            {s.desc}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-6 py-3 text-sm font-black text-white rounded-xl transition-all hover:scale-105 border-none cursor-pointer"
              style={{ background: s.accent, fontFamily: "'Syne', sans-serif" }}>
              <ShoppingBag size={14} />
              {s.cta}
              <ArrowRight size={14} />
            </button>
            <button
              className="px-6 py-3 text-sm font-bold rounded-xl cursor-pointer transition-all bg-transparent"
              style={{ border: "1.5px solid rgba(255,255,255,.25)", color: "rgba(255,255,255,.8)", fontFamily: "'Syne', sans-serif" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              Ver tudo
            </button>
          </div>

          {/* Trust pills */}
          <div className="flex items-center gap-3 mt-8">
            {["Entrega rápida", "Pagamento seguro", "Devoluções grátis"].map(label => (
              <span key={label}
                className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.55)" }}>
                <span style={{ color: G }}>✓</span> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — image card + floating stat */}
        <div
          className="hidden lg:flex flex-col items-end gap-4 py-16 transition-all duration-400"
          style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(12px)" : "translateY(0)" }}>

          {/* Main image card */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ width: 300, height: 340, border: "1.5px solid rgba(255,255,255,.12)" }}>
            <img src={s.img} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 60%)" }} />

            {/* bottom label inside card */}
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm font-black" style={{ fontFamily: "'Syne', sans-serif" }}>{s.title}</p>
              <p className="text-[11px] mt-0.5" style={{ color: s.accent }}>{s.subtitle}</p>
            </div>
          </div>

          {/* Floating stat card */}
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl"
            style={{ background: "rgba(255,255,255,.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.12)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: GL }}>
              <TrendingUp size={16} style={{ color: G }} />
            </div>
            <div>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,.5)" }}>{s.stat.label}</p>
              <p className="text-sm font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{s.stat.value}</p>
            </div>
          </div>

          {/* Stars review pill */}
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background: "rgba(255,255,255,.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.12)" }}>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#f59e0b" stroke="#f59e0b" />)}
            </div>
            <span className="text-[11px] font-bold text-white">4.9</span>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,.4)" }}>· 2.4k avaliações</span>
          </div>
        </div>
      </div>

      {/* ── Slide counter + dots ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <span className="text-[10px] font-bold tabular-nums" style={{ color: "rgba(255,255,255,.35)" }}>
          {String(idx + 1).padStart(2,"0")} / {String(HERO_SLIDES.length).padStart(2,"0")}
        </span>
        <div className="flex gap-1.5">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="rounded-full border-none cursor-pointer transition-all duration-300"
              style={{
                width:  i === idx ? 28 : 6,
                height: 6,
                background: i === idx ? s.accent : "rgba(255,255,255,.3)"
              }} />
          ))}
        </div>
      </div>

      {/* ── Arrow buttons ── */}
      <button onClick={() => goTo((idx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all"
        style={{ background: "rgba(255,255,255,.08)", color: "#fff", border: "1px solid rgba(255,255,255,.12)" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.16)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.08)"}>
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => goTo((idx + 1) % HERO_SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all"
        style={{ background: "rgba(255,255,255,.08)", color: "#fff", border: "1px solid rgba(255,255,255,.12)" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.16)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.08)"}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}