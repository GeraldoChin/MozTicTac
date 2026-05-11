import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "../../components/Header";
import { useCart } from "../../hooks/useCart";
import PromoBannersSlider from "../../components/PromoBannerSlider";
import HeroSlider from "../../components/HeroSlider";
import Relampago from "../../components/Relampago";
import { Newsletter2 } from "../../components/Newsletter2";
import Rodape from "../../components/Rodape";
const GREEN = "#00b96b";
const GREEN_DARK = "#009a5a";
const GREEN_LIGHT = "#e6f9f0";

/* ─── DATA ─────────────────────────────────────────────────────── */
const HERO_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=85",
    eyebrow: "🔥 Semana de Ofertas",
    title: "Calçados com até",
    highlight: "75% OFF",
    sub: "Os melhores ténis e sapatos com descontos reais. Só esta semana.",
    cta: "Ver Ofertas",
    badge: "Calçados",
    accent: "#b91c1c",
  },
  {
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=85",
    eyebrow: "⌚ Nova Colecção",
    title: "Relógios Premium",
    highlight: "desde 4 200 MZN",
    sub: "Estilo suíço a preço acessível. Entrega disponível em todo o país.",
    cta: "Comprar Agora",
    badge: "Acessórios",
    accent: "#1d4ed8",
  },
  {
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=85",
    eyebrow: "🎧 Tech em Promoção",
    title: "Electrónicos top",
    highlight: "até 60% OFF",
    sub: "Sony, Samsung e mais. Preços que nunca viste em Moçambique.",
    cta: "Ver Electrónicos",
    badge: "Tech",
    accent: "#7c3aed",
  },
];

const PROMO_BANNERS = [
  { img: "",  title: "Calçados",   sub: "Até 75% desconto",       cat: "Calçados",   color: "#b91c1c", emoji: "👟" },
  { img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", title: "Relógios",  sub: "Mín. 45% desconto",      cat: "Acessórios", color: "#1d4ed8", emoji: "⌚" },
  { img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4832?w=600&q=80", title: "Moda",      sub: "Colecção exclusiva",     cat: "Roupa",      color: "#7c3aed", emoji: "👗" },
  { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", title: "Tech",      sub: "Marcas internacionais",  cat: "Tech",       color: "#0369a1", emoji: "🎧" },
  { img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80", title: "Alimentos", sub: "Produtos frescos",       cat: "Alimentos",  color: "#15803d", emoji: "🥗" },
  { img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80", title: "Beleza",    sub: "Importados a preço bom", cat: "Beleza",     color: "#be185d", emoji: "💄" },
];

const ALL_DEALS = [
  { id:1,  name:"Ténis Nike Air Max 2024",       price:3200,  orig:4500,  cat:"Calçados",   city:"Nampula", delivery:true,  rating:4.7, reviews:54,  isNew:true,  img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"  },
  { id:2,  name:"Relógio Swiss Style Premium",   price:4200,  orig:5800,  cat:"Acessórios", city:"Maputo",  delivery:true,  rating:4.8, reviews:124, isNew:false, img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" },
  { id:3,  name:"Capulana Bordada Artesanal",    price:450,   orig:650,   cat:"Roupa",      city:"Maputo",  delivery:false, rating:4.9, reviews:201, isNew:true,  img:"https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&q=80" },
  { id:4,  name:"Auscultadores Sony XM5",        price:6200,  orig:8500,  cat:"Tech",       city:"Maputo",  delivery:true,  rating:4.9, reviews:178, isNew:true,  img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
  { id:5,  name:"Perfume Chanel Nº5 Importado",  price:1850,  orig:2400,  cat:"Beleza",     city:"Beira",   delivery:true,  rating:4.6, reviews:86,  isNew:false, img:"https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80" },
  { id:6,  name:"Samsung Galaxy A55 5G",         price:8900,  orig:11000, cat:"Tech",       city:"Matola",  delivery:true,  rating:4.5, reviews:38,  isNew:true,  img:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80" },
  { id:7,  name:"Mochila Impermeável 30L",       price:1200,  orig:1600,  cat:"Acessórios", city:"Beira",   delivery:true,  rating:4.4, reviews:67,  isNew:false, img:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"  },
  { id:8,  name:"Caju Torrado Embalado 1kg",     price:3200,  orig:4000,  cat:"Alimentos",  city:"Nacala",  delivery:true,  rating:4.8, reviews:302, isNew:false, img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
  { id:9,  name:"Vestido Chitenge Tradicional",  price:1850,  orig:2400,  cat:"Roupa",      city:"Maputo",  delivery:true,  rating:4.8, reviews:124, isNew:true,  img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4832?w=400&q=80" },
  { id:10, name:"Anel de Ouro 18K Artesanal",    price:12800, orig:15000, cat:"Acessórios", city:"Maputo",  delivery:false, rating:4.7, reviews:44,  isNew:true,  img:"https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80" },
  { id:11, name:"Kit Skincare Premium",          price:1950,  orig:2800,  cat:"Beleza",     city:"Maputo",  delivery:true,  rating:4.5, reviews:37,  isNew:true,  img:"https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80" },
  { id:12, name:"Sofá 3 Lugares Moderno",        price:28000, orig:35000, cat:"Outros",     city:"Maputo",  delivery:false, rating:4.3, reviews:19,  isNew:false, img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" },
];

const CATS = ["Todos","Calçados","Acessórios","Roupa","Tech","Beleza","Alimentos","Outros"];

/* ─── HELPERS ───────────────────────────────────────────────────── */
function Stars({ rating, size = 10 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}
            stroke={i <= Math.round(rating) ? "#f59e0b" : "#d1d5db"} strokeWidth="1" />
        </svg>
      ))}
    </span>
  );
}

/* ─── COUNTDOWN ─────────────────────────────────────────────────── */
function Countdown() {
  const [secs, setSecs] = useState(5 * 3600 + 42 * 60 + 17);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-1">
      {[h, m, s].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-9 h-9  text-sm font-black text-white"
            style={{ background: "#111827", fontFamily: "monospace" }}>{v}</span>
          {i < 2 && <span className="text-gray-400 font-bold text-sm">:</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── DEAL CARD ─────────────────────────────────────────────────── */
function DealCard({ d, wished, onWish }) {
  const disc = Math.round((1 - d.price / d.orig) * 100);
  return (
    <div className="bg-white border border-gray-100 overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-xl hover:-translate-y-1.5">
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1" }}>
        <img src={d.img} alt={d.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5  text-[11px] font-black text-white"
          style={{ background: "#ef4444" }}>-{disc}%</div>
        {d.isNew && (
          <div className="absolute top-2.5 left-14 px-2 py-0.5  text-[11px] font-black"
            style={{ background: GREEN_LIGHT, color: "#15803d" }}>Novo</div>
        )}
        <button onClick={e => { e.stopPropagation(); onWish(d.id); }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
          <svg width="13" height="13" viewBox="0 0 24 24"
            fill={wished ? "#ef4444" : "none"} stroke={wished ? "#ef4444" : "#9ca3af"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <button onClick={e => e.stopPropagation()}
            className="w-full py-2 rounded-xl text-white text-[11px] font-black border-none cursor-pointer flex items-center justify-center gap-1.5"
            style={{ background: GREEN }}
            onMouseEnter={e => e.currentTarget.style.background = GREEN_DARK}
            onMouseLeave={e => e.currentTarget.style.background = GREEN}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{d.cat}</p>
        <p className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 mb-2 min-h-[34px]">{d.name}</p>
        <div className="flex items-center gap-1.5 mb-2">
          <Stars rating={d.rating} />
          <span className="text-[11px] font-bold text-gray-700">{d.rating}</span>
          <span className="text-[10px] text-gray-400">({d.reviews})</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 line-through">{d.orig.toLocaleString("pt-MZ")} MZN</p>
            <p className="text-base font-black text-gray-900">
              {d.price.toLocaleString("pt-MZ")}
              <span className="text-[10px] font-normal text-gray-400 ml-1">MZN</span>
            </p>
          </div>
          {d.delivery && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: GREEN_LIGHT, color: "#15803d" }}>Entrega</span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1.5">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {d.city}
        </p>
      </div>
    </div>
  );
}

/* ─── DEALS SECTION ─────────────────────────────────────────────── */
function DealsSection({ activeFilter, onFilterChange }) {
  const [tab, setTab] = useState("Todos");
  const [sort, setSort] = useState("");
  const [wishlist, setWishlist] = useState(new Set());
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const prevFilter = useRef(activeFilter);
  if (prevFilter.current !== activeFilter) { prevFilter.current = activeFilter; setPage(1); }

  const toggleWish = id => setWishlist(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filtered = (() => {
    let list = [...ALL_DEALS];
    if (activeFilter !== "Todos") list = list.filter(d => d.cat === activeFilter);
    if (tab === "Novos")          list = list.filter(d => d.isNew);
    if (tab === "Mais Vendidos")  list = [...list].sort((a,b) => b.reviews - a.reviews);
    if (tab === "Melhor Avaliados") list = [...list].sort((a,b) => b.rating - a.rating);
    if (sort === "price-asc")   list = [...list].sort((a,b) => a.price - b.price);
    if (sort === "price-desc")  list = [...list].sort((a,b) => b.price - a.price);
    if (sort === "discount")    list = [...list].sort((a,b) => (1 - b.price/b.orig) - (1 - a.price/a.orig));
    return list;
  })();

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div id="deals-section">
      {/* Section title + countdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-5">
          <div>
            <h2 className="text-xl font-black text-gray-900">⚡ Flash Deals</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} oferta{filtered.length !== 1 ? "s" : ""} disponíveis</p>
          </div>
          <Countdown />
        </div>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
          className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 cursor-pointer outline-none"
          style={{ fontFamily: "Manrope, sans-serif" }}>
          <option value="">Ordenar por</option>
          <option value="price-asc">Preço ↑</option>
          <option value="price-desc">Preço ↓</option>
          <option value="discount">Maior desconto</option>
        </select>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATS.map(cat => (
          <button key={cat} onClick={() => { onFilterChange(cat); setPage(1); }}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-bold border-none cursor-pointer transition-all duration-150"
            style={activeFilter === cat
              ? { background: GREEN, color: "#fff" }
              : { background: "#f3f4f6", color: "#4b5563" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 mb-5 w-fit">
        {["Todos","Novos","Mais Vendidos","Melhor Avaliados"].map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }}
            className="px-3.5 py-1.5 text-[11px] font-bold  border-none cursor-pointer transition-all duration-150"
            style={tab === t ? { background: GREEN, color: "#fff" } : { background: "transparent", color: "#6b7280" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Active filter chip */}
      {activeFilter !== "Todos" && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Filtrado por:</span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: GREEN_LIGHT, color: GREEN }}>
            {activeFilter}
            <button onClick={() => { onFilterChange("Todos"); setPage(1); }}
              className="border-none bg-transparent cursor-pointer font-black text-base leading-none"
              style={{ color: GREEN }}>×</button>
          </span>
        </div>
      )}

      {/* Grid */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-600">Nenhuma oferta encontrada</p>
          <p className="text-xs text-gray-400 mt-1">Tenta outra categoria ou remove os filtros</p>
          <button onClick={() => { onFilterChange("Todos"); setTab("Todos"); setPage(1); }}
            className="mt-4 px-5 py-2 rounded-full text-xs font-black text-white border-none cursor-pointer"
            style={{ background: GREEN }}>
            Ver todas as ofertas
          </button>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {paginated.map(d => (
            <DealCard key={d.id} d={d} wished={wishlist.has(d.id)} onWish={toggleWish} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
            className="w-8 h-8  border text-xs font-bold cursor-pointer flex items-center justify-center transition-all"
            style={{ background:"#fff", color:"#4b5563", borderColor:"#e5e7eb", opacity: page===1 ? 0.4 : 1 }}>‹</button>
          {Array.from({ length: totalPages }).map((_,i) => (
            <button key={i} onClick={() => setPage(i+1)}
              className="w-8 h-8  border text-xs font-bold cursor-pointer flex items-center justify-center transition-all"
              style={page===i+1 ? { background:GREEN, color:"#fff", borderColor:GREEN } : { background:"#fff", color:"#4b5563", borderColor:"#e5e7eb" }}>
              {i+1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
            className="w-8 h-8  border text-xs font-bold cursor-pointer flex items-center justify-center transition-all"
            style={{ background:"#fff", color:"#4b5563", borderColor:"#e5e7eb", opacity: page===totalPages ? 0.4 : 1 }}>›</button>
        </div>
      )}
    </div>
  );
}

/* ─── NEWSLETTER ────────────────────────────────────────────────── */
function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!email.trim()) return;
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 3000);
  };

  const perks = [
    { icon: "⚡", title: "Alertas Flash", desc: "Primeiro a saber das promoções" },
    { icon: "🎁", title: "Ofertas Exclusivas", desc: "Descontos só para subscritores" },
    { icon: "📦", title: "Novidades", desc: "Produtos novos antes de todos" },
  ];

  return (
    <div className="rounded-3xl overflow-hidden relative" style={{ background: "linear-gradient(135deg,#0a1f12 0%,#0f2b1a 50%,#1a3d24 100%)" }}>
      {/* Decorative blobs */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,#00b96b22 0%,transparent 70%)" }} />
      <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,#00b96b11 0%,transparent 70%)" }} />

      <div className="relative grid lg:grid-cols-2 gap-0">
        {/* Left — perks */}
        <div className="p-10 lg:p-12 border-r border-white/5">
          <p className="text-[11px] font-black tracking-widest uppercase mb-3" style={{ color: "#00b96b" }}>
            🇲🇿 Comunidade MozTicTac
          </p>
          <h2 className="text-2xl font-black text-white mb-2" style={{ letterSpacing: "-0.5px" }}>
            Faz parte dos<br />
            <span style={{ color: "#00b96b" }}>+12 000 compradores</span>
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            Junta-te à maior comunidade de compras de Moçambique.
          </p>
          <div className="space-y-4">
            {perks.map(p => (
              <div key={p.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: "rgba(0,185,107,0.12)" }}>
                  {p.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="p-10 lg:p-12 flex flex-col justify-center">
          <p className="text-sm font-bold text-white mb-1">Nunca percas uma oferta</p>
          <p className="text-xs text-gray-500 mb-6">Recebe alertas de preço no teu email ou WhatsApp.</p>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-2xl"
                style={{ background: "rgba(0,185,107,0.15)" }}>✓</div>
              <p className="text-sm font-bold text-white">Subscrito com sucesso!</p>
              <p className="text-xs text-gray-500 mt-1">Bem-vindo à comunidade 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="email"
                placeholder="O teu email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border border-white/10 transition-all"
                style={{ background: "rgba(255,255,255,0.07)", fontFamily: "Manrope, sans-serif" }}
              />
              <button onClick={submit}
                className="w-full py-3 rounded-xl text-sm font-black text-white border-none cursor-pointer transition-all"
                style={{ background: "#00b96b" }}
                onMouseEnter={e => e.currentTarget.style.background = "#009a5a"}
                onMouseLeave={e => e.currentTarget.style.background = "#00b96b"}>
                Activar Alertas Grátis →
              </button>
              <p className="text-[10px] text-gray-600 text-center">
                Sem spam · Cancela quando quiseres · 100% grátis
              </p>
            </div>
          )}

          {/* Social proof */}
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#e11d48","#7c3aed","#0369a1","#15803d"].map((c,i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-black text-white"
                  style={{ borderColor: "#0a1f12", background: c }}>
                  {["AM","JM","BN","CL"][i]}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500">
              <span className="text-white font-bold">247 pessoas</span> subscreveram esta semana
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
/* ─── PAGE ROOT ─────────────────────────────────────────────────── */
export default function PromoBannersPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
   const [activo, setActivo] = useState("perfil");
  const { cartCount, wishCount, addToCart, addToWish } = useCart();
  const [searchVal, setSearchVal] = useState("");

  const handleFilterChange = useCallback((cat) => {
    setActiveFilter(cat);
    setTimeout(() => {
      document.getElementById("deals-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb", fontFamily: "Manrope, sans-serif" }}>

      {/* HEADER */}
        <Header
        cartCount={cartCount}
        wishCount={wishCount}
        searchVal={searchVal}
        onSearchChange={setSearchVal}
        onAddToCart={addToCart}
        onAddToWish={addToWish}
      />

      {/* HERO SLIDER */}
      <HeroSlider onFilterChange={handleFilterChange} />

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">

        {/* Promo Banners */}
        <PromoBannersSlider onFilterChange={handleFilterChange} />

        {/* Deals */}
<Relampago activeFilter={activeFilter} onFilterChange={handleFilterChange} />
        {/* Newsletter */}
   
      </div>
       <Newsletter2 />
           <Rodape />
    </div>
  );
}