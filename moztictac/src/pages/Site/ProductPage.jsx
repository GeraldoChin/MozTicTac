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
import { CategoryBar } from "../../components/CategoryBar";
import PromoBannersSlider from "../../components/PromoBannerSlider";
import Rodape from "../../components/Rodape";
import { FashionProducts } from "../../components/FashionProducts";
import Relampago from "../../components/Relampago";
import  { Heroproduct } from "../../components/Heroproduct";
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

// /* ─── HERO CAROUSEL ────────────────────────────────────────────── */
// function Hero() {
//   const [idx, setIdx] = useState(0);
//   const s = HERO_SLIDES[idx];

//   useEffect(() => {
//     const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
//     return () => clearInterval(t);
//   }, []);

//   return (
//     <div className={`relative overflow-hidden bg-gradient-to-r ${s.bg} transition-all duration-700`} style={{ minHeight: 400 }}>
//       {/* bg image */}
//       <div className="absolute inset-0">
//         <img src={s.img} alt="" className="w-full h-full object-cover opacity-20 transition-all duration-700" />
//         <div className={`absolute inset-0 bg-gradient-to-r ${s.bg} opacity-80`} />
//       </div>

//       {/* content */}
//       <div className="relative max-w-7xl mx-auto px-6 py-16 flex items-center justify-between gap-8">
//         <div className="max-w-xl">
//           <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-4"
//             style={{ background: "rgba(255,255,255,.15)", color: "#fff", backdropFilter: "blur(8px)" }}>
//             <Sparkles size={11} /> {s.tag}
//           </span>
//           <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-2"
//             style={{ fontFamily: "'Syne',sans-serif" }}>
//             {s.title}
//           </h1>
//           <p className="text-lg font-medium mb-2" style={{ color: s.accent }}>{s.subtitle}</p>
//           <p className="text-sm text-white/70 mb-8 leading-relaxed max-w-md">{s.desc}</p>
//           <div className="flex items-center gap-3">
//             <button className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 border-none cursor-pointer"
//               style={{ background: s.accent }}>
//               {s.cta} <ArrowRight size={15} />
//             </button>
//             <button className="px-6 py-3 rounded-2xl text-sm font-bold border-2 border-white/30 text-white cursor-pointer transition-all hover:bg-white/10 bg-transparent">
//               Ver tudo
//             </button>
//           </div>
//         </div>

//         {/* hero image card */}
//         <div className="hidden lg:block relative">
//           <div className="w-72 h-72 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20">
//             <img src={s.img} alt="" className="w-full h-full object-cover" />
//           </div>
//           {/* floating badge */}
//           <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GL }}>
//               <TrendingUp size={16} style={{ color: G }} />
//             </div>
//             <div>
//               <p className="text-xs text-gray-400">Vendas hoje</p>
//               <p className="text-sm font-black text-gray-900">+1.240</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* dots */}
//       <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
//         {HERO_SLIDES.map((_, i) => (
//           <button key={i} onClick={() => setIdx(i)}
//             className="rounded-full transition-all border-none cursor-pointer"
//             style={{ width: i === idx ? 24 : 8, height: 8, background: i === idx ? "#fff" : "rgba(255,255,255,.4)" }} />
//         ))}
//       </div>

//       {/* arrows */}
//       <button onClick={() => setIdx(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
//         className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white border-none cursor-pointer hover:bg-white/30 transition-all backdrop-blur-sm">
//         <ChevronLeft size={18} />
//       </button>
//       <button onClick={() => setIdx(i => (i + 1) % HERO_SLIDES.length)}
//         className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white border-none cursor-pointer hover:bg-white/30 transition-all backdrop-blur-sm">
//         <ChevronRight size={18} />
//       </button>
//     </div>
//   );
// }

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


/* ─── APP ──────────────────────────────────────────────────────── */
export default function ShopPage() {
  const [activeCat, setActiveCat] = useState("Todos");
  const [activeFilter, setActiveFilter] = useState("Todos"); // ← adiciona esta linha

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
      <Heroproduct />
      <TrustBar />
      <CategoryBar/>
      <PromoBannersSlider />
      {/* <FeaturedRow /> */}
      <Relampago activeFilter={activeFilter} onFilterChange={setActiveFilter} />  {/* ← props */}
      <FashionProducts />
      <Rodape />
    </div>
  );
}