import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const GREEN = "#1db954";

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

/* ── Card ── */
function ProductCardInterno({ p, onAddToCart }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/produto/${p.id}`)}
      className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group "
    >
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "4/5" }}>
        <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3 gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(p); }}
            className="flex items-center gap-1.5 bg-white text-gray-800 text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:bg-green-500 hover:text-white transition-all duration-150"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Adicionar
          </button>
          <button onClick={(e) => e.stopPropagation()} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 text-gray-600 transition-all duration-150">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>

        {p.badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: p.badge === "Anúncio" ? "#e3f0ff" : p.badge === "Serviço" ? "#e6f9f0" : "#f3f4f6", color: p.badge === "Anúncio" ? "#3b82f6" : p.badge === "Serviço" ? "#00b96b" : "#6b7280" }}>
            {p.badge}
          </span>
        )}
        {p.isNew && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">Novo</span>
        )}
      </div>

      <div className="p-3">
        <p className="text-[10px] text-gray-400 font-medium mb-0.5 uppercase tracking-wide">{p.category}</p>
        <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 mb-2">{p.name}</p>
        <div className="flex items-end justify-between gap-1">
          <p className="text-sm font-black text-gray-900">
            {p.price.toLocaleString("pt-MZ")}
            <span className="text-[10px] font-normal text-gray-400 ml-1">MZN</span>
          </p>
          {p.hasDelivery && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-600">Entrega</span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {p.city}, {p.province}
        </p>
      </div>
    </div>
  );
}

/* ── Toggle ── */
function Toggle({ value, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
      <div
        onClick={() => onChange(!value)}
        className="w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer flex-shrink-0"
        style={{ background: value ? GREEN : "#e5e7eb" }}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
    </label>
  );
}

/* ── Radio group ── */
function RadioGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map(([val, label]) => (
        <label key={val} onClick={() => onChange(val)} className="flex items-center gap-2.5 cursor-pointer group">
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${value === val ? "border-green-500" : "border-gray-200 group-hover:border-gray-300"}`}>
            {value === val && <div className="w-2 h-2 rounded-full" style={{ background: GREEN }} />}
          </div>
          <span className={`text-sm transition-colors ${value === val ? "text-gray-900 font-medium" : "text-gray-500"}`}>{label}</span>
        </label>
      ))}
    </div>
  );
}

/* ── Sidebar de filtros ── */
function FilterSidebar({ province, setProvince, priceMin, setPriceMin, priceMax, setPriceMax, estado, setEstado, tipo, setTipo, withDelivery, setWithDelivery, withAffiliate, setWithAffiliate, hasActiveFilters, clearFilters }) {
  return (
    <aside className="w-52 flex-shrink-0 bg-white border border-gray-100  shadow-sm overflow-hidden sticky top-4 self-start">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          <span className="text-sm font-bold text-gray-800">Filtros</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GREEN }} />
          )}
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-[11px] font-semibold cursor-pointer border-none bg-transparent transition-colors" style={{ color: GREEN }}>
            Limpar
          </button>
        )}
      </div>

      <div className="p-4 space-y-5">

        {/* Província */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Província</p>
          <div className="relative">
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 appearance-none cursor-pointer focus:outline-none transition-colors"
              style={{ focusBorderColor: GREEN }}
            >
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>

        <div className="border-t border-gray-50" />

        {/* Preço */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Preço (MZN)</p>
          <div className="flex gap-2">
            <input
              type="number" placeholder="Mín" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2 focus:outline-none transition-colors"
            />
            <input
              type="number" placeholder="Máx" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="border-t border-gray-50" />

        {/* Estado */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Estado</p>
          <RadioGroup
            options={[["todos", "Todos"], ["novo", "Novo"], ["usado", "Usado"]]}
            value={estado} onChange={setEstado}
          />
        </div>

        <div className="border-t border-gray-50" />

        {/* Tipo */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Tipo</p>
          <RadioGroup
            options={[["todos", "Todos"], ["produto", "Produto físico"], ["servico", "Serviço"]]}
            value={tipo} onChange={setTipo}
          />
        </div>

        <div className="border-t border-gray-50" />

        {/* Toggles */}
        <div className="space-y-3">
          <Toggle value={withDelivery} onChange={setWithDelivery} label="Com entrega" />
          <Toggle value={withAffiliate} onChange={setWithAffiliate} label="Aceita afiliados" />
        </div>

      </div>
    </aside>
  );
}

/* ── Componente principal ── */
export function FashionProducts({ onAddToCart }) {
  const [activeTab, setActiveTab]         = useState("Todos");
  const [province, setProvince]           = useState("Todas");
  const [priceMin, setPriceMin]           = useState("");
  const [priceMax, setPriceMax]           = useState("");
  const [estado, setEstado]               = useState("todos");
  const [tipo, setTipo]                   = useState("todos");
  const [withDelivery, setWithDelivery]   = useState(false);
  const [withAffiliate, setWithAffiliate] = useState(false);
  const [filtersOpen, setFiltersOpen]     = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...ALL_PRODUCTS];
    if (activeTab === "Novos")            list = list.filter((p) => p.isNew);
    if (activeTab === "Mais Vendidos")    list = list.sort((a, b) => b.reviews - a.reviews);
    if (activeTab === "Melhor Avaliados") list = list.sort((a, b) => b.rating - a.rating);
    if (province !== "Todas")            list = list.filter((p) => p.province === province);
    if (priceMin !== "")                 list = list.filter((p) => p.price >= Number(priceMin));
    if (priceMax !== "")                 list = list.filter((p) => p.price <= Number(priceMax));
    if (estado === "novo")               list = list.filter((p) => p.isNew);
    if (estado === "usado")              list = list.filter((p) => !p.isNew);
    if (tipo === "produto")              list = list.filter((p) => p.type === "produto");
    if (tipo === "servico")              list = list.filter((p) => p.type === "servico");
    if (withDelivery)                    list = list.filter((p) => p.hasDelivery);
    if (withAffiliate)                   list = list.filter((p) => p.hasAffiliate);
    return list;
  }, [activeTab, province, priceMin, priceMax, estado, tipo, withDelivery, withAffiliate]);

  const clearFilters = () => {
    setProvince("Todas"); setPriceMin(""); setPriceMax("");
    setEstado("todos"); setTipo("todos");
    setWithDelivery(false); setWithAffiliate(false);
  };

  const hasActiveFilters =
    province !== "Todas" || priceMin || priceMax ||
    estado !== "todos" || tipo !== "todos" ||
    withDelivery || withAffiliate;

  const filterProps = { province, setProvince, priceMin, setPriceMin, priceMax, setPriceMax, estado, setEstado, tipo, setTipo, withDelivery, setWithDelivery, withAffiliate, setWithAffiliate, hasActiveFilters, clearFilters };

  return (
    <section className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-[1450px] mx-auto px-3 sm:px-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Todos os Produtos</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tabs — scroll horizontal em mobile */}
            <div className="flex bg-white border border-gray-100  p-1 gap-0.5 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border-none transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  style={{ background: activeTab === tab ? GREEN : "transparent", color: activeTab === tab ? "white" : "#6b7280" }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Botão filtros — desktop */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2  border text-xs font-semibold transition-all duration-200 cursor-pointer"
              style={{
                borderColor: filtersOpen ? GREEN : "#e5e7eb",
                color: filtersOpen ? GREEN : "#6b7280",
                background: filtersOpen ? "#f0fdf4" : "white",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filtros
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GREEN }} />}
            </button>

            {/* Botão filtros — mobile */}
            <button
              onClick={() => setMobileFilters(true)}
              className="sm:hidden flex items-center gap-1.5 px-3.5 py-2  border text-xs font-semibold cursor-pointer"
              style={{ borderColor: hasActiveFilters ? GREEN : "#e5e7eb", color: hasActiveFilters ? GREEN : "#6b7280", background: hasActiveFilters ? "#f0fdf4" : "white" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filtros {hasActiveFilters && `(activos)`}
            </button>
          </div>
        </div>

        {/* ── Drawer mobile ── */}
        {mobileFilters && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="font-bold text-gray-900">Filtros</span>
                <button onClick={() => setMobileFilters(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-none cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-5">
                <FilterSidebar {...filterProps} />
                <button
                  onClick={() => setMobileFilters(false)}
                  className="w-full mt-4 py-3  text-sm font-bold text-white border-none cursor-pointer"
                  style={{ background: GREEN }}
                >
                  Ver {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex gap-5 items-start">

          {/* Sidebar — só desktop */}
          {filtersOpen && (
            <div className="hidden sm:block">
              <FilterSidebar {...filterProps} />
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
                <p className="text-gray-600 font-semibold text-sm">Nenhum produto encontrado</p>
                <p className="text-gray-400 text-xs mt-1 mb-4">Tente ajustar os filtros</p>
                <button onClick={clearFilters} className="text-sm font-semibold px-5 py-2  cursor-pointer border-none text-white" style={{ background: GREEN }}>
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className={`grid gap-3 sm:gap-4 grid-cols-2 ${filtersOpen ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-5"}`}>
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