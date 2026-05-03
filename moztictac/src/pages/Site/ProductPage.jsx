import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search, Bell, ShoppingCart, Heart, MapPin, Truck,
  Star, SlidersHorizontal, X, ChevronDown, ChevronRight,
  ChevronLeft, ArrowRight, Shield, Zap, Package,
  BadgeCheck, Tag, TrendingUp, Flame, Sparkles,
  Eye, Share2, MessageCircle, Store,
} from "lucide-react";
import { Header } from "../../components/Header";
import { Navbar } from "../../components/Navbar";
/* ─── TOKENS ───────────────────────────────────────────────────── */
const G  = "#00b96b";
const GD = "#009a5a";
const GL = "#e6f9f0";

/* ─── DATA ─────────────────────────────────────────────────────── */
const ALL_PRODUCTS = [
  { id:1,  name:"Relógio Premium Swiss Style",   price:4200,  originalPrice:5800,  rating:4.8, reviews:124, city:"Maputo",  province:"Maputo",  category:"Acessórios",   img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",  badge:"Anúncio", isNew:true,  hasDelivery:true,  hasAffiliate:true,  affiliatePct:10, type:"produto", featured:true  },
  { id:2,  name:"Perfume Importado Chanel Nº5",  price:1850,  originalPrice:2400,  rating:4.6, reviews:86,  city:"Beira",   province:"Sofala",  category:"Acessórios",   img:"https://images.unsplash.com/photo-1541643600914-78b084683702?w=500&q=80",  badge:"Anúncio", isNew:false, hasDelivery:true,  hasAffiliate:true,  affiliatePct:15, type:"produto", featured:false },
  { id:3,  name:"Ténis Nike Air Max 2024",       price:3200,  originalPrice:4500,  rating:4.7, reviews:54,  city:"Nampula", province:"Nampula", category:"Sapatos",      img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",  badge:null,      isNew:true,  hasDelivery:true,  hasAffiliate:false, affiliatePct:0,  type:"produto", featured:true  },
  { id:4,  name:"Capulana Bordada Artesanal",    price:450,   originalPrice:650,   rating:4.9, reviews:201, city:"Maputo",  province:"Maputo",  category:"Roupa",        img:"https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=500&q=80",  badge:null,      isNew:false, hasDelivery:false, hasAffiliate:true,  affiliatePct:12, type:"produto", featured:false },
  { id:5,  name:"Samsung Galaxy A55 5G",         price:8900,  originalPrice:11000, rating:4.5, reviews:38,  city:"Matola",  province:"Maputo",  category:"Celulares",    img:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",  badge:"Anúncio", isNew:true,  hasDelivery:true,  hasAffiliate:true,  affiliatePct:8,  type:"produto", featured:true  },
  { id:6,  name:"Serviço de Cabeleireiro",       price:850,   originalPrice:null,  rating:4.8, reviews:312, city:"Maputo",  province:"Maputo",  category:"Serviços",     img:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80",  badge:"Serviço", isNew:false, hasDelivery:false, hasAffiliate:false, affiliatePct:0,  type:"servico", featured:false },
  { id:7,  name:"Auscultadores Sony XM5",        price:6200,  originalPrice:8500,  rating:4.9, reviews:178, city:"Maputo",  province:"Maputo",  category:"Electrónicos", img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",  badge:null,      isNew:true,  hasDelivery:true,  hasAffiliate:true,  affiliatePct:10, type:"produto", featured:true  },
  { id:8,  name:"Mochila Impermeável 30L",       price:1200,  originalPrice:1600,  rating:4.4, reviews:67,  city:"Beira",   province:"Sofala",  category:"Acessórios",   img:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",  badge:null,      isNew:false, hasDelivery:true,  hasAffiliate:false, affiliatePct:0,  type:"produto", featured:false },
  { id:9,  name:"Caju Torrado Embalado 1kg",     price:3200,  originalPrice:4000,  rating:4.8, reviews:302, city:"Nacala",  province:"Nampula", category:"Alimentos",    img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",  badge:null,      isNew:false, hasDelivery:true,  hasAffiliate:true,  affiliatePct:20, type:"produto", featured:false },
  { id:10, name:"Sofá 3 Lugares Verde",          price:28000, originalPrice:35000, rating:4.3, reviews:19,  city:"Maputo",  province:"Maputo",  category:"Outros",       img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",  badge:"Usado",   isNew:false, hasDelivery:false, hasAffiliate:false, affiliatePct:0,  type:"produto", featured:false },
  { id:11, name:"Vestido Chitenge Tradicional",  price:1850,  originalPrice:2400,  rating:4.8, reviews:124, city:"Maputo",  province:"Maputo",  category:"Roupa",        img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4832?w=500&q=80",  badge:null,      isNew:true,  hasDelivery:true,  hasAffiliate:true,  affiliatePct:12, type:"produto", featured:true  },
  { id:12, name:"Anel de Ouro 18K Artesanal",   price:12800, originalPrice:15000, rating:4.7, reviews:44,  city:"Maputo",  province:"Maputo",  category:"Acessórios",   img:"https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=500&q=80",  badge:null,      isNew:true,  hasDelivery:false, hasAffiliate:false, affiliatePct:0,  type:"produto", featured:false },
];

const HERO_SLIDES = [
  {
    title: "Moda Moçambicana",
    subtitle: "Autêntica & Artesanal",
    desc: "Capulanas, Chitenges e muito mais — directamente dos melhores artesãos do país.",
    cta: "Explorar Roupa",
    bg: "from-emerald-900 via-emerald-800 to-green-700",
    accent: "#00b96b",
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4832?w=700&q=80",
    tag: "Novo",
  },
  {
    title: "Tecnologia Premium",
    subtitle: "Entrega em Todo o País",
    desc: "Os melhores celulares, auscultadores e electrónicos com garantia e suporte local.",
    cta: "Ver Electrónicos",
    bg: "from-gray-900 via-gray-800 to-slate-700",
    accent: "#3b82f6",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80",
    tag: "Destaque",
  },
  {
    title: "Ofertas Relâmpago",
    subtitle: "Até 40% de Desconto",
    desc: "Promoções por tempo limitado nos melhores produtos. Não percas esta oportunidade!",
    cta: "Ver Promoções",
    bg: "from-orange-900 via-red-800 to-orange-700",
    accent: "#f97316",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80",
    tag: "🔥 Hot",
  },
];

const CATEGORIES = [
  { name:"Roupa",        img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4832?w=200&q=80", count:48  },
  { name:"Sapatos",      img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80",    count:31  },
  { name:"Celulares",    img:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80", count:19  },
  { name:"Electrónicos", img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80", count:27  },
  { name:"Acessórios",   img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80", count:63  },
  { name:"Alimentos",    img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80", count:14  },
  { name:"Serviços",     img:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80", count:22  },
  { name:"Outros",       img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80",    count:11  },
];

const PROVINCES = ["Todas","Maputo","Sofala","Nampula","Gaza","Inhambane","Manica","Tete","Zambézia","Cabo Delgado","Niassa"];
const TABS = ["Todos","Novos","Mais Vendidos","Melhor Avaliados"];

const fmt = n => n.toLocaleString("pt-MZ");

/* ─── STARS ────────────────────────────────────────────────────── */
function Stars({ rating, size = 11 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
          stroke={i <= Math.round(rating) ? "#f59e0b" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

/* ─── PRODUCT CARD ─────────────────────────────────────────────── */
function ProductCard({ p, size = "normal" }) {
  const [wish, setWish]   = useState(false);
  const [added, setAdded] = useState(false);
  const disc = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
  const isLarge = size === "large";

  function handleAdd(e) {
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className={`bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-250 hover:-translate-y-1 hover:shadow-xl hover:border-transparent ${isLarge ? "" : ""}`}
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
      <div className={`relative overflow-hidden bg-gray-100 ${isLarge ? "aspect-[4/3]" : "aspect-square"}`}>
        <img src={p.img} alt={p.name}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.07]" />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3 gap-2">
          <button onClick={handleAdd}
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md transition-all"
            style={{ background: added ? G : "#fff", color: added ? "#fff" : "#111" }}>
            <ShoppingCart size={11} />
            {added ? "✓ Adicionado" : "Adicionar"}
          </button>
          <button onClick={e => { e.stopPropagation(); setWish(w => !w); }}
            className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-md">
            <Heart size={12} fill={wish ? "#ef4444" : "none"} stroke={wish ? "#ef4444" : "#555"} />
          </button>
          <button className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-md">
            <Eye size={12} className="text-gray-500" />
          </button>
        </div>

        {/* Badges */}
        {p.badge && (
          <span className="absolute top-2 left-2 text-[9.5px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: p.badge === "Anúncio" ? "#dbeafe" : p.badge === "Serviço" ? GL : "#f3f4f6",
              color:      p.badge === "Anúncio" ? "#3b82f6" : p.badge === "Serviço" ? G  : "#6b7280",
            }}>
            {p.badge}
          </span>
        )}
        {p.isNew && (
          <span className="absolute top-2 right-2 text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">Novo</span>
        )}
        {disc && (
          <span className="absolute bottom-2 left-2 text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">-{disc}%</span>
        )}
      </div>

      <div className="p-3">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{p.category}</p>
        <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>{p.name}</p>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Stars rating={p.rating} />
          <span className="text-[11px] font-bold text-gray-800">{p.rating}</span>
          <span className="text-[11px] text-gray-400">({p.reviews})</span>
        </div>
        <div className="flex items-end justify-between gap-1">
          <div>
            <span className="text-[15px] font-black text-gray-900" style={{ fontFamily: "'Syne',sans-serif" }}>
              {fmt(p.price)}<span className="text-[10px] font-normal text-gray-400 ml-1">MZN</span>
            </span>
            {p.originalPrice && (
              <p className="text-[10.5px] text-gray-400 line-through">{fmt(p.originalPrice)} MZN</p>
            )}
          </div>
          {p.hasDelivery && (
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
              style={{ background: GL, color: G }}>
              <Truck size={9} /> Entrega
            </span>
          )}
        </div>
        <p className="text-[10.5px] text-gray-400 mt-2 flex items-center gap-1">
          <MapPin size={9} />{p.city}, {p.province}
        </p>
      </div>
    </div>
  );
}

/* ─── HERO CAROUSEL ────────────────────────────────────────────── */
function Hero() {
  const [idx, setIdx] = useState(0);
  const s = HERO_SLIDES[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${s.bg} transition-all duration-700`} style={{ minHeight: 400 }}>
      {/* bg image */}
      <div className="absolute inset-0">
        <img src={s.img} alt="" className="w-full h-full object-cover opacity-20 transition-all duration-700" />
        <div className={`absolute inset-0 bg-gradient-to-r ${s.bg} opacity-80`} />
      </div>

      {/* content */}
      <div className="relative max-w-7xl mx-auto px-6 py-16 flex items-center justify-between gap-8">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(255,255,255,.15)", color: "#fff", backdropFilter: "blur(8px)" }}>
            <Sparkles size={11} /> {s.tag}
          </span>
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-2"
            style={{ fontFamily: "'Syne',sans-serif" }}>
            {s.title}
          </h1>
          <p className="text-lg font-medium mb-2" style={{ color: s.accent }}>{s.subtitle}</p>
          <p className="text-sm text-white/70 mb-8 leading-relaxed max-w-md">{s.desc}</p>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 border-none cursor-pointer"
              style={{ background: s.accent }}>
              {s.cta} <ArrowRight size={15} />
            </button>
            <button className="px-6 py-3 rounded-2xl text-sm font-bold border-2 border-white/30 text-white cursor-pointer transition-all hover:bg-white/10 bg-transparent">
              Ver tudo
            </button>
          </div>
        </div>

        {/* hero image card */}
        <div className="hidden lg:block relative">
          <div className="w-72 h-72 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20">
            <img src={s.img} alt="" className="w-full h-full object-cover" />
          </div>
          {/* floating badge */}
          <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GL }}>
              <TrendingUp size={16} style={{ color: G }} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Vendas hoje</p>
              <p className="text-sm font-black text-gray-900">+1.240</p>
            </div>
          </div>
        </div>
      </div>

      {/* dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="rounded-full transition-all border-none cursor-pointer"
            style={{ width: i === idx ? 24 : 8, height: 8, background: i === idx ? "#fff" : "rgba(255,255,255,.4)" }} />
        ))}
      </div>

      {/* arrows */}
      <button onClick={() => setIdx(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white border-none cursor-pointer hover:bg-white/30 transition-all backdrop-blur-sm">
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => setIdx(i => (i + 1) % HERO_SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white border-none cursor-pointer hover:bg-white/30 transition-all backdrop-blur-sm">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ─── TRUST BAR ────────────────────────────────────────────────── */
function TrustBar() {
  const items = [
    { icon: Shield,  label: "Compra Protegida",       sub: "Escrow garantido"       },
    { icon: Truck,   label: "Entrega em Todo País",    sub: "Rastreio em tempo real" },
    { icon: Zap,     label: "Pagamento Fácil",         sub: "M-Pesa, E-Mola, Visa"  },
    { icon: Package, label: "Devoluções Simples",      sub: "7 dias sem perguntas"  },
  ];
  return (
    <div className="bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: GL }}>
              <Icon size={17} style={{ color: G }} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">{label}</p>
              <p className="text-[10.5px] text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CATEGORIES ───────────────────────────────────────────────── */
function CategoryGrid({ onSelectCat }) {
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Syne',sans-serif" }}>
            Categorias
          </h2>
          <button className="text-sm font-semibold flex items-center gap-1 border-none bg-transparent cursor-pointer hover:underline" style={{ color: G }}>
            Ver todas <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(c => (
            <button key={c.name} onClick={() => onSelectCat(c.name)}
              className="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-none">
              <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-sm group-hover:-translate-y-1 transition-transform duration-200">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-800" style={{ fontFamily: "'Syne',sans-serif" }}>{c.name}</p>
                <p className="text-[10px] text-gray-400">{c.count} items</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── BANNER STRIP ─────────────────────────────────────────────── */
function BannerStrip() {
  const banners = [
    { title:"Óculos & Acessórios", sub:"Mínimo 45% desconto", cta:"Compre agora", bg:"from-slate-800 to-slate-700", img:"https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=400&q=80" },
    { title:"Calçados & Sapatos",  sub:"Até 75% de desconto",  cta:"Compre agora", bg:"from-red-900 to-red-700",    img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
    { title:"Acessórios Premium",  sub:"Mínimo 45% desconto",  cta:"Compre agora", bg:"from-gray-800 to-gray-600",  img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" },
  ];
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-3 gap-4">
      {banners.map(b => (
        <div key={b.title} className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${b.bg} cursor-pointer group`} style={{ minHeight: 140 }}>
          <img src={b.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
          <div className="relative p-5">
            <p className="text-[11px] font-semibold text-white/60 mb-1">{b.sub}</p>
            <h3 className="text-base font-black text-white mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>{b.title}</h3>
            <span className="text-xs font-bold text-white flex items-center gap-1 hover:gap-2 transition-all">
              {b.cta} <ChevronRight size={13} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── SECTION HEADER ───────────────────────────────────────────── */
function SectionHead({ icon: Icon, title, sub, cta }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: GL }}>
          <Icon size={16} style={{ color: G }} />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: "'Syne',sans-serif" }}>{title}</h2>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </div>
      {cta && (
        <button className="text-sm font-semibold flex items-center gap-1 border-none bg-transparent cursor-pointer" style={{ color: G }}>
          {cta} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

/* ─── FEATURED ROW (horizontal scroll) ────────────────────────── */
function FeaturedRow() {
  const featured = ALL_PRODUCTS.filter(p => p.featured);
  const ref = useRef(null);

  const scroll = dir => {
    if (ref.current) ref.current.scrollLeft += dir * 260;
  };

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-5">
          <SectionHead icon={Sparkles} title="Em Destaque" sub="Seleccionados para si" />
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors bg-white">
              <ChevronLeft size={15} className="text-gray-500" />
            </button>
            <button onClick={() => scroll(1)} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors bg-white">
              <ChevronRight size={15} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div ref={ref} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}>
          {featured.map(p => (
            <div key={p.id} className="flex-shrink-0 w-52">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── DEALS / HOT ──────────────────────────────────────────────── */
function HotDeals() {
  const deals = ALL_PRODUCTS.filter(p => p.originalPrice).slice(0, 4);
  const [time, setTime] = useState({ h: 5, m: 47, s: 23 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) h = 0;
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = n => String(n).padStart(2, "0");

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#fef2f2" }}>
              <Flame size={16} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: "'Syne',sans-serif" }}>Ofertas Relâmpago</h2>
              <p className="text-xs text-gray-400">Termina em</p>
            </div>
            {/* countdown */}
            <div className="flex items-center gap-1 ml-2">
              {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="bg-gray-900 text-white text-xs font-black px-2 py-1 rounded-lg tabular-nums">{v}</span>
                  {i < 2 && <span className="text-gray-500 font-bold text-xs">:</span>}
                </span>
              ))}
            </div>
          </div>
          <button className="text-sm font-semibold flex items-center gap-1 border-none bg-transparent cursor-pointer" style={{ color: G }}>
            Ver todas <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {deals.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── SIDEBAR ──────────────────────────────────────────────────── */
function Sidebar({ filters, setFilters, onClear }) {
  return (
    <aside className="w-52 flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-5 sticky top-20 self-start shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-black text-gray-900" style={{ fontFamily: "'Syne',sans-serif" }}>Filtros</span>
        <button onClick={onClear} className="text-[11px] font-semibold border-none bg-transparent cursor-pointer hover:underline" style={{ color: G }}>
          Limpar
        </button>
      </div>
      <hr className="border-gray-100 mb-4" />

      {/* Província */}
      <div className="mb-5">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Província</label>
        <div className="relative">
          <select value={filters.province} onChange={e => setFilters(f => ({ ...f, province: e.target.value }))}
            className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 appearance-none outline-none cursor-pointer focus:border-green-400">
            {PROVINCES.map(p => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Preço */}
      <div className="mb-5">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Preço (MZN)</label>
        <div className="flex gap-1.5">
          {[["priceMin","Mín"],["priceMax","Máx"]].map(([k, ph]) => (
            <input key={k} type="number" placeholder={ph} value={filters[k]}
              onChange={e => setFilters(f => ({ ...f, [k]: e.target.value }))}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 outline-none focus:border-green-400" />
          ))}
        </div>
      </div>

      {/* Estado */}
      <div className="mb-5">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Estado</label>
        {[["todos","Todos"],["novo","Novo"],["usado","Usado"]].map(([v, l]) => (
          <div key={v} className="flex items-center gap-2 cursor-pointer mb-2" onClick={() => setFilters(f => ({ ...f, estado: v }))}>
            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
              style={{ borderColor: filters.estado === v ? G : "#d1d5db" }}>
              {filters.estado === v && <div className="w-2 h-2 rounded-full" style={{ background: G }} />}
            </div>
            <span className={`text-sm ${filters.estado === v ? "text-gray-800 font-medium" : "text-gray-500"}`}>{l}</span>
          </div>
        ))}
      </div>

      {/* Tipo */}
      <div className="mb-5">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Tipo</label>
        {[["todos","Todos"],["produto","Produto físico"],["servico","Serviço"]].map(([v, l]) => (
          <div key={v} className="flex items-center gap-2 cursor-pointer mb-2" onClick={() => setFilters(f => ({ ...f, tipo: v }))}>
            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
              style={{ borderColor: filters.tipo === v ? G : "#d1d5db" }}>
              {filters.tipo === v && <div className="w-2 h-2 rounded-full" style={{ background: G }} />}
            </div>
            <span className={`text-sm ${filters.tipo === v ? "text-gray-800 font-medium" : "text-gray-500"}`}>{l}</span>
          </div>
        ))}
      </div>

      {/* Toggles */}
      {[["delivery","Com entrega"],["affiliate","Aceita afiliados"]].map(([k, label]) => (
        <div key={k} className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, [k]: !f[k] }))}>
          <span className="text-sm text-gray-600">{label}</span>
          <div className="w-9 h-5 rounded-full relative flex-shrink-0 transition-colors" style={{ background: filters[k] ? G : "#e5e7eb" }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{ transform: filters[k] ? "translateX(18px)" : "translateX(2px)" }} />
          </div>
        </div>
      ))}
    </aside>
  );
}

/* ─── MAIN PRODUCT GRID ────────────────────────────────────────── */
function ProductGrid() {
  const [tab, setTab]           = useState("Todos");
  const [search, setSearch]     = useState("");
  const [showSidebar, setShow]  = useState(true);
  const [filters, setFilters]   = useState({
    province:"Todas", priceMin:"", priceMax:"", estado:"todos", tipo:"todos", delivery:false, affiliate:false,
  });

  function clearFilters() {
    setFilters({ province:"Todas", priceMin:"", priceMax:"", estado:"todos", tipo:"todos", delivery:false, affiliate:false });
  }

  const hasFilters = filters.province !== "Todas" || filters.priceMin || filters.priceMax ||
    filters.estado !== "todos" || filters.tipo !== "todos" || filters.delivery || filters.affiliate;

  const products = useMemo(() => {
    let list = [...ALL_PRODUCTS];
    if (tab === "Novos")            list = list.filter(p => p.isNew);
    if (tab === "Mais Vendidos")    list = [...list].sort((a,b) => b.reviews - a.reviews);
    if (tab === "Melhor Avaliados") list = [...list].sort((a,b) => b.rating  - a.rating);

    const q = search.toLowerCase().trim();
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    if (filters.province !== "Todas") list = list.filter(p => p.province === filters.province);
    if (filters.priceMin) list = list.filter(p => p.price >= +filters.priceMin);
    if (filters.priceMax) list = list.filter(p => p.price <= +filters.priceMax);
    if (filters.estado === "novo")  list = list.filter(p => p.isNew);
    if (filters.estado === "usado") list = list.filter(p => !p.isNew);
    if (filters.tipo === "produto") list = list.filter(p => p.type === "produto");
    if (filters.tipo === "servico") list = list.filter(p => p.type === "servico");
    if (filters.delivery)  list = list.filter(p => p.hasDelivery);
    if (filters.affiliate) list = list.filter(p => p.hasAffiliate);
    return list;
  }, [tab, search, filters]);

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* toolbar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: GL }}>
              <Store size={16} style={{ color: G }} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: "'Syne',sans-serif" }}>Todos os Produtos</h2>
              <p className="text-xs text-gray-400">{products.length} resultado{products.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* search mini */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar…"
                className="pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none w-40 focus:border-green-400 transition-colors" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 border-none bg-transparent cursor-pointer"><X size={11} /></button>}
            </div>

            {/* tabs */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border-none transition-all"
                  style={tab === t ? { background: G, color: "#fff" } : { background: "transparent", color: "#6b7280" }}>
                  {t}
                </button>
              ))}
            </div>

            {/* filter toggle */}
            <button onClick={() => setShow(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer"
              style={showSidebar ? { borderColor: G, color: G, background: GL } : { borderColor: "#e5e7eb", color: "#6b7280", background: "#fff" }}>
              <SlidersHorizontal size={13} />
              Filtros
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full" style={{ background: G }} />}
            </button>
          </div>
        </div>

        <div className="flex gap-5 items-start">
          {showSidebar && <Sidebar filters={filters} setFilters={setFilters} onClear={clearFilters} />}

          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Nenhum produto encontrado</p>
                <p className="text-xs text-gray-400 mt-1">Ajuste os filtros ou pesquise outra coisa</p>
                <button onClick={clearFilters}
                  className="mt-4 text-sm font-bold px-5 py-2.5 rounded-xl text-white border-none cursor-pointer hover:opacity-90"
                  style={{ background: G }}>
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${showSidebar ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"}`}>
                {products.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ───────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="text-xl font-black mb-3" style={{ fontFamily: "'Syne',sans-serif", color: G }}>
              Moz<span className="text-white">TicTac</span>
            </div>
            <p className="text-xs leading-relaxed">O marketplace de confiança de Moçambique. Compra, vende e conecta.</p>
          </div>
          {[
            { title:"Comprar",   links:["Todos os Produtos","Promoções","Novidades","Mais Vendidos"] },
            { title:"Vender",    links:["Criar Loja","Afiliados","Publicar Anúncio","Painel Vendedor"] },
            { title:"Suporte",   links:["Central de Ajuda","Política de Devoluções","Contacto","Segurança"] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-xs font-black uppercase tracking-wider text-white mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(l => <li key={l}><a href="#" className="text-xs hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs">© 2026 MozTicTac. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2 flex-wrap">
            {["M-Pesa","E-Mola","mKesh","Visa","Mastercard"].map(p => (
              <span key={p} className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-700 text-gray-400">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── APP ──────────────────────────────────────────────────────── */
export default function ShopPage() {
  const [activeCat, setActiveCat] = useState("Todos");

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        html { scrollbar-width: none; }
      `}</style>

  


      {/* ── SECTIONS ── */}
      <Header />
      <Navbar/>
      <Hero />
      <TrustBar />
      <CategoryGrid onSelectCat={setActiveCat} />
      <BannerStrip />
      <FeaturedRow />
      <HotDeals />
      <ProductGrid />
      <Footer />
    </div>
  );
}