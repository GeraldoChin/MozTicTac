import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "./SectionHeader";
import { ProductCard } from "./ProductCard";

const GREEN = "#1db954";

/* ── Dados de exemplo contextualizados ─────────────────────────── */
export const ALL_PRODUCTS = [
  { id: 1,  name: "Relógio Premium Swiss Style",     price: 4200,  originalPrice: 5800,  rating: 4.8, reviews: 124, city: "Maputo",  province: "Maputo",  category: "Acessórios",   img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",  badge: "Anúncio", isNew: true,  hasDelivery: true,  hasAffiliate: true,  affiliatePct: 10, type: "produto" },
  { id: 2,  name: "Perfume Importado Chanel Nº5",    price: 1850,  originalPrice: 2400,  rating: 4.6, reviews: 86,  city: "Beira",   province: "Sofala",  category: "Acessórios",   img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80",  badge: "Anúncio", isNew: false, hasDelivery: true,  hasAffiliate: true,  affiliatePct: 15, type: "produto" },
  { id: 3,  name: "Ténis Nike Air Max 2024",         price: 3200,  originalPrice: 4500,  rating: 4.7, reviews: 54,  city: "Nampula", province: "Nampula", category: "Sapatos",      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",  badge: null,      isNew: true,  hasDelivery: true,  hasAffiliate: false, affiliatePct: 0,  type: "produto" },
  { id: 4,  name: "Capulana Bordada Artesanal",      price: 450,   originalPrice: 650,   rating: 4.9, reviews: 201, city: "Maputo",  province: "Maputo",  category: "Roupa",        img: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&q=80",  badge: null,      isNew: false, hasDelivery: false, hasAffiliate: true,  affiliatePct: 12, type: "produto" },
  { id: 5,  name: "Samsung Galaxy A55 5G",           price: 8900,  originalPrice: 11000, rating: 4.5, reviews: 38,  city: "Matola",  province: "Maputo",  category: "Celulares",    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",  badge: "Anúncio", isNew: true,  hasDelivery: true,  hasAffiliate: true,  affiliatePct: 8,  type: "produto" },
  { id: 6,  name: "Serviço de Cabeleireiro",         price: 850,   originalPrice: null,  rating: 4.8, reviews: 312, city: "Maputo",  province: "Maputo",  category: "Serviços",     img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",  badge: "Serviço", isNew: false, hasDelivery: false, hasAffiliate: false, affiliatePct: 0,  type: "servico" },
  { id: 7,  name: "Auscultadores Sony XM5",          price: 6200,  originalPrice: 8500,  rating: 4.9, reviews: 178, city: "Maputo",  province: "Maputo",  category: "Electrónicos", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",  badge: null,      isNew: true,  hasDelivery: true,  hasAffiliate: true,  affiliatePct: 10, type: "produto" },
  { id: 8,  name: "Mochila Impermeável 30L",         price: 1200,  originalPrice: 1600,  rating: 4.4, reviews: 67,  city: "Beira",   province: "Sofala",  category: "Acessórios",   img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",  badge: null,      isNew: false, hasDelivery: true,  hasAffiliate: false, affiliatePct: 0,  type: "produto" },
  { id: 9,  name: "Caju Torrado Embalado 1kg",       price: 3200,  originalPrice: 4000,  rating: 4.8, reviews: 302, city: "Nacala",  province: "Nampula", category: "Alimentos",    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",  badge: null,      isNew: false, hasDelivery: true,  hasAffiliate: true,  affiliatePct: 20, type: "produto" },
  { id: 10, name: "Sofá 3 Lugares Verde",            price: 28000, originalPrice: 35000, rating: 4.3, reviews: 19,  city: "Maputo",  province: "Maputo",  category: "Outros",       img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",  badge: "Usado",   isNew: false, hasDelivery: false, hasAffiliate: false, affiliatePct: 0,  type: "produto" },
  { id: 11, name: "Vestido Chitenge Tradicional",    price: 1850,  originalPrice: 2400,  rating: 4.8, reviews: 124, city: "Maputo",  province: "Maputo",  category: "Roupa",        img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4832?w=400&q=80",  badge: null,      isNew: true,  hasDelivery: true,  hasAffiliate: true,  affiliatePct: 12, type: "produto" },
  { id: 12, name: "Anel de Ouro 18K Artesanal",     price: 12800, originalPrice: 15000, rating: 4.7, reviews: 44,  city: "Maputo",  province: "Maputo",  category: "Acessórios",   img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80",  badge: null,      isNew: true,  hasDelivery: false, hasAffiliate: false, affiliatePct: 0,  type: "produto" },
];

const PROVINCES = ["Todas", "Maputo", "Sofala", "Nampula", "Gaza", "Inhambane", "Manica", "Tete", "Zambézia", "Cabo Delgado", "Niassa"];

const TABS = ["Todos", "Novos", "Mais Vendidos", "Melhor Avaliados"];

/* ── ProductCard com navegação ──────────────────────────────────── */
function ProductCardInterno({ p, onAddToCart }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/produto/${p.id}`)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={p.img}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {p.badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: p.badge === "Anúncio" ? "#e3f0ff" : p.badge === "Serviço" ? "#e6f9f0" : "#f3f4f6",
              color:      p.badge === "Anúncio" ? "#3b82f6" : p.badge === "Serviço" ? "#00b96b" : "#6b7280",
            }}>
            {p.badge}
          </span>
        )}
        {p.isNew && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">
            Novo
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] text-gray-400 font-medium mb-0.5">{p.category}</p>
        <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-2">{p.name}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-xs font-semibold text-gray-700">{p.rating}</span>
          <span className="text-xs text-gray-400">({p.reviews})</span>
        </div>

        {/* Preço */}
        <div className="flex items-end justify-between gap-1">
          <div>
            <p className="text-base font-black text-gray-900">
              {p.price.toLocaleString("pt-MZ")}
              <span className="text-[10px] font-normal text-gray-400 ml-1">MZN</span>
            </p>
            {p.originalPrice && (
              <p className="text-[11px] text-gray-400 line-through">
                {p.originalPrice.toLocaleString("pt-MZ")} MZN
              </p>
            )}
          </div>

          {/* Entrega */}
          {p.hasDelivery && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-green-50 text-green-600">
              Entrega
            </span>
          )}
        </div>

        {/* Localização */}
        <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {p.city}, {p.province}
        </p>

        {/* Botão adicionar ao carrinho */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Evita navegar ao clicar no botão
            onAddToCart && onAddToCart(p);
          }}
          className="mt-3 w-full py-2 text-xs font-bold rounded-xl text-white border-none cursor-pointer transition-colors"
          style={{ background: GREEN }}
          onMouseEnter={e => (e.currentTarget.style.background = "#17a349")}
          onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}

/* ── Componente principal ──────────────────────────────────────── */
export function FashionProducts({ onAddToCart }) {
  const [activeTab, setActiveTab]           = useState("Todos");
  const [province, setProvince]             = useState("Todas");
  const [priceMin, setPriceMin]             = useState("");
  const [priceMax, setPriceMax]             = useState("");
  const [estado, setEstado]                 = useState("todos");
  const [tipo, setTipo]                     = useState("todos");
  const [withDelivery, setWithDelivery]     = useState(false);
  const [withAffiliate, setWithAffiliate]   = useState(false);
  const [filtersOpen, setFiltersOpen]       = useState(true);

  const filtered = useMemo(() => {
    let list = [...ALL_PRODUCTS];

    if (activeTab === "Novos")            list = list.filter((p) => p.isNew);
    if (activeTab === "Mais Vendidos")    list = list.sort((a, b) => b.reviews - a.reviews);
    if (activeTab === "Melhor Avaliados") list = list.sort((a, b) => b.rating - a.rating);

    if (province !== "Todas") list = list.filter((p) => p.province === province);

    if (priceMin !== "") list = list.filter((p) => p.price >= Number(priceMin));
    if (priceMax !== "") list = list.filter((p) => p.price <= Number(priceMax));

    if (estado === "novo")  list = list.filter((p) => p.isNew);
    if (estado === "usado") list = list.filter((p) => !p.isNew);

    if (tipo === "produto")  list = list.filter((p) => p.type === "produto");
    if (tipo === "servico")  list = list.filter((p) => p.type === "servico");

    if (withDelivery)  list = list.filter((p) => p.hasDelivery);
    if (withAffiliate) list = list.filter((p) => p.hasAffiliate);

    return list;
  }, [activeTab, province, priceMin, priceMax, estado, tipo, withDelivery, withAffiliate]);

  const clearFilters = () => {
    setProvince("Todas");
    setPriceMin("");
    setPriceMax("");
    setEstado("todos");
    setTipo("todos");
    setWithDelivery(false);
    setWithAffiliate(false);
  };

  const hasActiveFilters =
    province !== "Todas" || priceMin || priceMax ||
    estado !== "todos" || tipo !== "todos" ||
    withDelivery || withAffiliate;

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Tabs header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Manrope, sans-serif" }}>
              Todos os Produtos
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border-none transition-all duration-200",
                    activeTab === tab
                      ? "text-white shadow-sm"
                      : "text-gray-500 bg-transparent hover:text-gray-700",
                  ].join(" ")}
                  style={activeTab === tab ? { background: GREEN } : {}}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={[
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer",
                filtersOpen
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-gray-200 text-gray-500 bg-white hover:border-gray-300",
              ].join(" ")}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filtros
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Body: filters + grid ── */}
        <div className="flex gap-5 items-start">

          {/* ══ Sidebar filtros ══ */}
          {filtersOpen && (
            <aside className="w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-4">

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-800" style={{ fontFamily: "Manrope, sans-serif" }}>Filtros</span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] text-green-600 font-semibold cursor-pointer border-none bg-transparent hover:underline"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <hr className="border-gray-100 mb-4" />

              {/* Província */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Província
                </label>
                <div className="relative">
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 appearance-none cursor-pointer focus:outline-none focus:border-green-400 transition-colors"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>

              {/* Preço */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Preço (MZN)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400 transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Estado
                </label>
                <div className="flex flex-col gap-2">
                  {[["todos", "Todos"], ["novo", "Novo"], ["usado", "Usado"]].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer group">
                      <div
                        onClick={() => setEstado(val)}
                        className={[
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 cursor-pointer",
                          estado === val ? "border-green-500" : "border-gray-300 group-hover:border-gray-400",
                        ].join(" ")}
                      >
                        {estado === val && (
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        )}
                      </div>
                      <span
                        className={[
                          "text-sm transition-colors",
                          estado === val ? "text-gray-800 font-medium" : "text-gray-500",
                        ].join(" ")}
                        onClick={() => setEstado(val)}
                      >
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tipo */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Tipo
                </label>
                <div className="flex flex-col gap-2">
                  {[["todos", "Todos"], ["produto", "Produto físico"], ["servico", "Serviço"]].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer group">
                      <div
                        onClick={() => setTipo(val)}
                        className={[
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 cursor-pointer",
                          tipo === val ? "border-green-500" : "border-gray-300 group-hover:border-gray-400",
                        ].join(" ")}
                      >
                        {tipo === val && (
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        )}
                      </div>
                      <span
                        className={[
                          "text-sm transition-colors",
                          tipo === val ? "text-gray-800 font-medium" : "text-gray-500",
                        ].join(" ")}
                        onClick={() => setTipo(val)}
                      >
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-600">Com entrega</span>
                  <div
                    onClick={() => setWithDelivery((v) => !v)}
                    className={[
                      "w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer flex-shrink-0",
                      withDelivery ? "bg-green-500" : "bg-gray-200",
                    ].join(" ")}
                  >
                    <div className={[
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                      withDelivery ? "translate-x-4" : "translate-x-0.5",
                    ].join(" ")} />
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-600">Aceita afiliados</span>
                  <div
                    onClick={() => setWithAffiliate((v) => !v)}
                    className={[
                      "w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer flex-shrink-0",
                      withAffiliate ? "bg-green-500" : "bg-gray-200",
                    ].join(" ")}
                  >
                    <div className={[
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                      withAffiliate ? "translate-x-4" : "translate-x-0.5",
                    ].join(" ")} />
                  </div>
                </label>
              </div>

            </aside>
          )}

          {/* ══ Grid de produtos ══ */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <p className="text-gray-500 font-medium text-sm">Nenhum produto encontrado</p>
                <p className="text-gray-400 text-xs mt-1">Tente ajustar os filtros</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer border-none text-white transition-all"
                  style={{ background: GREEN }}
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className={[
                "grid gap-4",
                filtersOpen ? "grid-cols-4" : "grid-cols-5",
              ].join(" ")}>
                {filtered.map((p) => (
                  <ProductCardInterno key={p.id} p={p} onAddToCart={onAddToCart} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

export { FashionProducts as DealsSection };