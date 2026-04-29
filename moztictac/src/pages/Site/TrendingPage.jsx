import { useState, useMemo } from "react";
import { Header } from "../../components/Header";
import TopTendencias2 from "../../components/Trendhero2";
import { VERDE } from "../../components/contaConstantes";
import { MENUS } from "../../components/SidebarConta"; // só os dados, sem renderizar o sidebar
import { ChevronRight } from "lucide-react";


const GREEN = "#00b96b";
const GREEN_DARK = "#009a5a";
const GREEN_LIGHT = "#e6f9f0";

export const ALL_PRODUCTS = [
  { id: 1,  name: "Relógio Premium Swiss Style",    price: 4200,  orig: 5800,  rating: 4.8, reviews: 124, city: "Maputo",  province: "Maputo",  cat: "Acessórios",   img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", badge: "Anúncio", isNew: true,  delivery: true,  affiliate: true,  affPct: 10, type: "produto" },
  { id: 2,  name: "Perfume Importado Chanel Nº5",   price: 1850,  orig: 2400,  rating: 4.6, reviews: 86,  city: "Beira",   province: "Sofala",  cat: "Acessórios",   img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80", badge: "Anúncio", isNew: false, delivery: true,  affiliate: true,  affPct: 15, type: "produto" },
  { id: 3,  name: "Ténis Nike Air Max 2024",         price: 3200,  orig: 4500,  rating: 4.7, reviews: 54,  city: "Nampula", province: "Nampula", cat: "Sapatos",      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", badge: null,      isNew: true,  delivery: true,  affiliate: false, affPct: 0,  type: "produto" },
  { id: 4,  name: "Capulana Bordada Artesanal",      price: 450,   orig: 650,   rating: 4.9, reviews: 201, city: "Maputo",  province: "Maputo",  cat: "Roupa",        img: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&q=80", badge: null,      isNew: false, delivery: false, affiliate: true,  affPct: 12, type: "produto" },
  { id: 5,  name: "Samsung Galaxy A55 5G",           price: 8900,  orig: 11000, rating: 4.5, reviews: 38,  city: "Matola",  province: "Maputo",  cat: "Celulares",    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", badge: "Anúncio", isNew: true,  delivery: true,  affiliate: true,  affPct: 8,  type: "produto" },
  { id: 6,  name: "Serviço de Cabeleireiro",         price: 850,   orig: null,  rating: 4.8, reviews: 312, city: "Maputo",  province: "Maputo",  cat: "Serviços",     img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80", badge: "Serviço", isNew: false, delivery: false, affiliate: false, affPct: 0,  type: "servico" },
  { id: 7,  name: "Auscultadores Sony XM5",          price: 6200,  orig: 8500,  rating: 4.9, reviews: 178, city: "Maputo",  province: "Maputo",  cat: "Electrónicos", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", badge: null,      isNew: true,  delivery: true,  affiliate: true,  affPct: 10, type: "produto" },
  { id: 8,  name: "Mochila Impermeável 30L",         price: 1200,  orig: 1600,  rating: 4.4, reviews: 67,  city: "Beira",   province: "Sofala",  cat: "Acessórios",   img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", badge: null,      isNew: false, delivery: true,  affiliate: false, affPct: 0,  type: "produto" },
  { id: 9,  name: "Caju Torrado Embalado 1kg",       price: 3200,  orig: 4000,  rating: 4.8, reviews: 302, city: "Nacala",  province: "Nampula", cat: "Alimentos",    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80", badge: null,      isNew: false, delivery: true,  affiliate: true,  affPct: 20, type: "produto" },
  { id: 10, name: "Sofá 3 Lugares Verde",            price: 28000, orig: 35000, rating: 4.3, reviews: 19,  city: "Maputo",  province: "Maputo",  cat: "Outros",       img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", badge: "Usado",   isNew: false, delivery: false, affiliate: false, affPct: 0,  type: "produto" },
  { id: 11, name: "Vestido Chitenge Tradicional",    price: 1850,  orig: 2400,  rating: 4.8, reviews: 124, city: "Maputo",  province: "Maputo",  cat: "Roupa",        img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4832?w=400&q=80", badge: null,      isNew: true,  delivery: true,  affiliate: true,  affPct: 12, type: "produto" },
  { id: 12, name: "Anel de Ouro 18K Artesanal",      price: 12800, orig: 15000, rating: 4.7, reviews: 44,  city: "Maputo",  province: "Maputo",  cat: "Acessórios",   img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80", badge: null,      isNew: true,  delivery: false, affiliate: false, affPct: 0,  type: "produto" },
];

const TABS = ["Todos", "Novos", "Mais Vendidos", "Melhor Avaliados"];
const CATS = ["Todos", "Roupa", "Sapatos", "Acessórios", "Celulares", "Electrónicos", "Cabelos", "Alimentos", "Serviços", "Outros"];

/* ── Stars ── */
function Stars({ rating, size = 11 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}
            stroke={i <= Math.round(rating) ? "#f59e0b" : "#d1d5db"}
            strokeWidth="1"
          />
        </svg>
      ))}
    </span>
  );
}

/* ── Badge ── */
function Badge({ label }) {
  const styles = {
    Anúncio: { bg: "#dbeafe", color: "#1d4ed8" },
    Serviço:  { bg: "#f3e8ff", color: "#7c3aed" },
    Usado:    { bg: "#f3f4f6", color: "#4b5563" },
  };
  const s = styles[label] || { bg: "#f3f4f6", color: "#4b5563" };
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: s.bg, color: s.color }}
    >
      {label}
    </span>
  );
}

/* ── Cart icon ── */
function CartIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

/* ── Heart icon ── */
function HeartIcon({ filled = false }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* ── Pin icon ── */
function PinIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/* ── Product Card ── */
function ProductCard({ p, onAddToCart, wishlist, onToggleWish }) {
  const disc = p.orig ? Math.round((1 - p.price / p.orig) * 100) : null;
  const wished = wishlist.has(p.id);

  return (
    <div className="bg-white border border-gray-100  overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 relative">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1" }}>
        <img
          src={p.img}
          alt={p.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {p.badge && <Badge label={p.badge} />}
          {p.isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: GREEN_LIGHT, color: "#15803d" }}>
              Novo
            </span>
          )}
          {disc && disc >= 20 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide bg-amber-50 text-amber-600">
              -{disc}%
            </span>
          )}
        </div>

        {/* Wishlist btn top-right */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWish(p.id); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm border-none cursor-pointer"
        >
          <HeartIcon filled={wished} />
        </button>

        {/* Add to cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(p); }}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-[11px] font-bold border-none cursor-pointer transition-colors duration-150"
            style={{ background: GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
          >
            <CartIcon size={11} /> Adicionar ao Carrinho
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-[10px] font-600 text-gray-400 uppercase tracking-wide mb-0.5">{p.cat}</p>
        <p className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1.5 min-h-[34px]">{p.name}</p>

        <div className="flex items-center gap-1.5 mb-2">
          <Stars rating={p.rating} />
          <span className="text-[11px] font-bold text-gray-800">{p.rating}</span>
          <span className="text-[10px] text-gray-400">({p.reviews})</span>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            {p.orig && (
              <p className="text-[10px] text-gray-400 line-through">
                {p.orig.toLocaleString("pt-MZ")} MZN
              </p>
            )}
            <p className="text-base font-black text-gray-900">
              {p.price.toLocaleString("pt-MZ")}
              <span className="text-[10px] font-normal text-gray-400 ml-1">MZN</span>
            </p>
          </div>
          {p.delivery && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: GREEN_LIGHT, color: "#15803d" }}>
              Entrega
            </span>
          )}
        </div>

        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1.5">
          <PinIcon /> {p.city}, {p.province}
        </p>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function TrendingPage({ onAddToCart }) {
  const [activeTab, setActiveTab] = useState("Todos");
  const [activeCat, setActiveCat] = useState("Todos");
  const [sort, setSort]           = useState("");
  const [wishlist, setWishlist]   = useState(new Set());

  const toggleWish = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const products = useMemo(() => {
    let list = [...ALL_PRODUCTS];

    if (activeCat !== "Todos") list = list.filter((p) => p.cat === activeCat);
    if (activeTab === "Novos")            list = list.filter((p) => p.isNew);
    if (activeTab === "Mais Vendidos")    list = [...list].sort((a, b) => b.reviews - a.reviews);
    if (activeTab === "Melhor Avaliados") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "price-asc")  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating")     list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [activeTab, activeCat, sort]);

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb", fontFamily: "Manrope, sans-serif" }}>

<Header/>
   <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <button className="hover:text-green-600 cursor-pointer transition-colors">
            Início
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Minha Conta</span>
          <ChevronRight size={14} className="text-gray-400" />
          {/* <span style={{ color: VERDE, fontWeight: 600 }}>
            {MENUS.find((m) => m.id === activo)?.rotulo}
          </span> */}
        </div>
      </div>
      {/* ── HERO ── */}
<TopTendencias2/>

      {/* ── CATEGORIES STRIP ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto scrollbar-none" style={{ height: 52, scrollbarWidth: "none" }}>
          {CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border-none cursor-pointer transition-all duration-150 flex-shrink-0"
              style={activeCat === cat
                ? { background: GREEN, color: "#fff" }
                : { background: "#f3f4f6", color: "#4b5563" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="max-w-7xl mx-auto px-4 py-7">

        {/* Promo banners */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { bg: "linear-gradient(135deg,#1a1a2e,#2d1b4e)", label: "Óculos escuros", title: "45–80% de desconto", sub: "Apenas esta semana" },
            { bg: "linear-gradient(135deg,#b91c1c,#ef4444)", label: "Calçados",        title: "Até 75% de desconto", sub: "Mais de 200 modelos" },
            { bg: "linear-gradient(135deg,#14532d,#16a34a)", label: "Acessórios",      title: "Mínimo 45% de desconto", sub: "Selecção premium" },
          ].map((b) => (
            <div key={b.label} className="rounded-2xl p-5 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: b.bg }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>{b.label}</p>
              <p className="text-base font-black text-white leading-tight mb-1">{b.title}</p>
              <p className="text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>{b.sub}</p>
              <p className="text-[11px] font-bold text-white underline cursor-pointer">Comprar agora ›</p>
            </div>
          ))}
        </div>

        {/* Affiliate strip */}
        <div className="flex items-center gap-4 rounded-2xl p-4 mb-7"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fef3c7)", border: "1px solid #fed7aa" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#f97316" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-black" style={{ color: "#92400e" }}>Programa de Afiliados MozTicTac</p>
            <p className="text-[11px]" style={{ color: "#b45309" }}>Partilha produtos e ganha até 20% de comissão em cada venda. Já são +3 200 afiliados activos.</p>
          </div>
          <button className="px-4 py-2 rounded-full text-[11px] font-black text-white border-none cursor-pointer flex-shrink-0"
            style={{ background: "#f97316" }}>
            Juntar-me →
          </button>
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black text-gray-900">Em Alta Agora 🔥</h2>
            <p className="text-xs text-gray-400 mt-0.5">{products.length} produto{products.length !== 1 ? "s" : ""} em tendência</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex bg-white border border-gray-200  p-1 gap-0.5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3.5 py-1.5 text-[11px] font-bold rounded-lg border-none cursor-pointer transition-all duration-150"
                  style={activeTab === tab
                    ? { background: GREEN, color: "#fff" }
                    : { background: "transparent", color: "#6b7280" }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200  px-3 py-2 cursor-pointer outline-none"
            >
              <option value="">Ordenar</option>
              <option value="price-asc">Preço ↑</option>
              <option value="price-desc">Preço ↓</option>
              <option value="rating">Avaliação</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-600">Nenhum produto encontrado</p>
            <p className="text-xs text-gray-400 mt-1">Tente outra categoria</p>
            <button className="mt-4 px-5 py-2 rounded-full text-sm font-bold text-white border-none cursor-pointer"
              style={{ background: GREEN }}
              onClick={() => { setActiveCat("Todos"); setActiveTab("Todos"); setSort(""); }}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                onAddToCart={onAddToCart}
                wishlist={wishlist}
                onToggleWish={toggleWish}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {["‹", "1", "2", "3", "›"].map((pg, i) => (
            <button key={i}
              className="w-8 h-8 rounded-lg border text-xs font-bold cursor-pointer transition-all duration-150 flex items-center justify-center"
              style={pg === "1"
                ? { background: GREEN, color: "#fff", border: `1px solid ${GREEN}` }
                : { background: "#fff", color: "#4b5563", border: "1px solid #e5e7eb" }}>
              {pg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}