// ─────────────────────────────────────────────
// MOZTICTAC — TrendingPage conectada ao backend
// Endpoints usados:
//   GET /api/v1/publico/produtos?tab=...&pagina=...&categoriaId=...&busca=...
//   GET /api/v1/publico/categorias
//   GET /api/v1/promocoes/ativas   (produtos promovidos / trending pago)
//   POST /api/v1/desejos/:id       (autenticado)
//   DELETE /api/v1/desejos/:id     (autenticado)
// ─────────────────────────────────────────────
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Header }       from "../../components/Header";
import TopTendencias2   from "../../components/Trendhero2";
import { ChevronRight } from "lucide-react";

// ── Config ────────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

const GREEN      = "#00b96b";
const GREEN_DARK = "#009a5a";
const GREEN_LIGHT= "#e6f9f0";

// ── Fetch helpers ─────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const res   = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensagem ?? data.message ?? `Erro ${res.status}`);
  return data;
}

// Mapeamento tab UI → param backend (publicoControlador.listarProdutosPublicos)
// Antes — usava /publico/produtos
const TAB_SORT_MAP = {
  "Todos":            "trending",
  "Mais Visitados":   "cliques",
  "Mais Vendidos":    "vendas",
  "Melhor Avaliados": "rating",
  "Novos":            "novos",
};

const TABS = ["Todos", "Mais Visitados", "Mais Vendidos", "Melhor Avaliados", "Novos"];
// ── Normalizar produto vindo do backend ───────────────────────────
function normalizarProduto(p) {
  return {
    id:       p.id,
    name:     p.nome      ?? p.name      ?? "Produto",
    price:    Number(p.preco ?? p.price ?? 0),
    orig:     p.precoOriginal ?? p.originalPrice ?? null,
    rating:   Number(p.mediaAvaliacoes ?? p.rating ?? 0),
    reviews:  p.totalAvaliacoes ?? p.reviews ?? 0,
    city:     p.vendedor?.cidade ?? p.city ?? "",
    province: p.vendedor?.provincia ?? p.province ?? "",
    cat:      p.categoria?.nome ?? p.category ?? "",
    catId:    p.categoria?.id   ?? p.categoriaId ?? "",
    img:      p.imagens?.[0]    ?? p.img ?? "",
    badge:    p.destaque ? "Anúncio" : (p.tipo ?? "").toLowerCase() === "servico" ? "Serviço" : null,
    isNew:    p.estadoItem === "NOVO" || p.isNew || false,
    delivery: p.entregaDisponivel ?? p.delivery ?? false,
    affiliate:p.aceitaAfiliados  ?? p.affiliate ?? false,
    affPct:   Number(p.percentualAfiliado ?? p.affPct ?? 0),
    type:     (p.tipo ?? "produto").toLowerCase() === "servico" ? "servico" : "produto",
    vendas:   p.totalVendas ?? 0,
  };
}

// ── Hooks de dados ────────────────────────────────────────────────

// Categorias — GET /publico/categorias
function useCategorias() {
  const [cats, setCats] = useState([{ id: "", nome: "Todos" }]);
  useEffect(() => {
    apiFetch("/publico/categorias")
      .then(r => {
        const lista = r.success ? r.data : r.dados ?? [];
        setCats([{ id: "", nome: "Todos" }, ...lista]);
      })
      .catch(() => {});
  }, []);
  return cats;
}

// Produtos — GET /publico/produtos
function useProdutos({ tab, pagina, categoriaId, busca, sort }) {
  const [produtos,     setProdutos]     = useState([]);
  const [total,        setTotal]        = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [erro,         setErro]         = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      // sort do select sobrepõe o sort da tab
      const sortParam = sort || TAB_SORT_MAP[tab] || "trending";
      const params = new URLSearchParams({
        sort:   sortParam,
        pagina: String(pagina),
        limite: "20",
      });
      if (categoriaId) params.set("categoriaId", categoriaId);
      if (busca)       params.set("busca", busca);

      const res = await apiFetch(`/publico/trending?${params}`);
      const d   = res.success ? res.data : res.dados ?? {};

      setProdutos((d.produtos ?? []).map(normalizarProduto));
      setTotal(d.total ?? 0);
      setTotalPaginas(d.totalPaginas ?? 1);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab, pagina, categoriaId, busca, sort]);

  useEffect(() => { carregar(); }, [carregar]);
  return { produtos, total, totalPaginas, loading, erro, recarregar: carregar };
}
// ── Componentes visuais ───────────────────────────────────────────
function Stars({ rating, size = 11 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
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

function BadgePill({ label }) {
  const styles = {
    Anúncio: { bg: "#dbeafe", color: "#1d4ed8" },
    Serviço: { bg: "#f3e8ff", color: "#7c3aed" },
    Usado:   { bg: "#f3f4f6", color: "#4b5563" },
  };
  const s = styles[label] || { bg: "#f3f4f6", color: "#4b5563" };
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: s.bg, color: s.color }}>
      {label}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────────────
function ProductCard({ p, onAddToCart, wishlist, onToggleWish }) {
  const [adicionado, setAdicionado] = useState(false);
  const disc   = p.orig ? Math.round((1 - p.price / p.orig) * 100) : null;
  const wished = wishlist.has(p.id);

  function handleAddCart(e) {
    e.stopPropagation();
    onAddToCart?.(p);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  }

  return (
    <div
      onClick={() => window.location.href = `/produto/${p.id}`}
      className="bg-white border border-gray-100 overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 relative rounded-xl"
    >
      {/* Imagem */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1" }}>
        {p.img ? (
          <img src={p.img} alt={p.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {p.badge && <BadgePill label={p.badge} />}
          {p.isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: GREEN_LIGHT, color: "#15803d" }}>
              Novo
            </span>
          )}
          {disc && disc >= 15 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase bg-amber-50 text-amber-600">
              -{disc}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); onToggleWish(p.id); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border-none cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24"
            fill={wished ? "#ef4444" : "none"}
            stroke={wished ? "#ef4444" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Add to cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddCart}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-[11px] font-bold border-none cursor-pointer transition-colors"
            style={{ background: adicionado ? "#16a34a" : GREEN }}
          >
            {adicionado ? "✓ Adicionado!" : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Adicionar ao Carrinho
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{p.cat}</p>
        <p className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1.5 min-h-[34px]">{p.name}</p>

        {p.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <Stars rating={p.rating} />
            <span className="text-[11px] font-bold text-gray-800">{p.rating.toFixed(1)}</span>
            <span className="text-[10px] text-gray-400">({p.reviews})</span>
          </div>
        )}

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

        {p.city && (
          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1.5">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {p.city}{p.province ? `, ${p.province}` : ""}
          </p>
        )}

        {p.affiliate && p.affPct > 0 && (
          <p className="text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-full inline-block bg-blue-50 text-blue-600">
            +{p.affPct}% afiliado
          </p>
        )}
      </div>
    </div>
  );
}

// ── Paginação ─────────────────────────────────────────────────────
function Paginacao({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onChange(pagina - 1)} disabled={pagina <= 1}
        className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-bold cursor-pointer bg-white text-gray-500 disabled:opacity-40 hover:border-green-400">
        ‹
      </button>
      {pages.map(pg => (
        <button key={pg} onClick={() => onChange(pg)}
          className="w-8 h-8 rounded-lg border text-xs font-bold cursor-pointer"
          style={pg === pagina
            ? { background: GREEN, color: "#fff", border: `1px solid ${GREEN}` }
            : { background: "#fff", color: "#4b5563", border: "1px solid #e5e7eb" }}>
          {pg}
        </button>
      ))}
      {totalPaginas > 5 && pagina < totalPaginas - 2 && (
        <>
          <span className="text-gray-400 text-xs">…</span>
          <button onClick={() => onChange(totalPaginas)}
            className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-bold cursor-pointer bg-white text-gray-500 hover:border-green-400">
            {totalPaginas}
          </button>
        </>
      )}
      <button onClick={() => onChange(pagina + 1)} disabled={pagina >= totalPaginas}
        className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-bold cursor-pointer bg-white text-gray-500 disabled:opacity-40 hover:border-green-400">
        ›
      </button>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────
export default function TrendingPage({ onAddToCart }) {
  const [activeTab,   setActiveTab]   = useState("Todos");
  const [activeCatId, setActiveCatId] = useState("");   // ID da categoria (uuid)
  const [sort,        setSort]        = useState("");
  const [pagina,      setPagina]      = useState(1);
  const [busca,       setBusca]       = useState("");
  const [buscaInput,  setBuscaInput]  = useState("");
  const [wishlist,    setWishlist]    = useState(new Set());
  const [wishLoading, setWishLoading] = useState(new Set());

  const categorias = useCategorias();

  // Debounce busca
  useEffect(() => {
    const t = setTimeout(() => { setBusca(buscaInput); setPagina(1); }, 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  const { produtos, total, totalPaginas, loading, erro, recarregar } = useProdutos({
    tab: activeTab, pagina, categoriaId: activeCatId, busca, sort,
  });

  function mudarTab(tab) { setActiveTab(tab); setPagina(1); }
  function mudarCat(id)  { setActiveCatId(id); setPagina(1); }

  // Toggle wishlist — POST/DELETE /desejos/:id
  async function toggleWish(id) {
    if (wishLoading.has(id)) return;
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }

    setWishLoading(prev => new Set(prev).add(id));
    const jaEsta = wishlist.has(id);
    try {
      await apiFetch(`/desejos/${id}`, { method: jaEsta ? "DELETE" : "POST" });
      setWishlist(prev => {
        const next = new Set(prev);
        jaEsta ? next.delete(id) : next.add(id);
        return next;
      });
    } catch (e) {
      console.error("Wishlist:", e.message);
    } finally {
      setWishLoading(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb", fontFamily: "Manrope, sans-serif" }}>
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <a href="/" className="hover:text-green-600 cursor-pointer transition-colors">Início</a>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Tendências</span>
        </div>
      </div>

      {/* Hero carrossel (TopTendencias2 já usa /promocoes/ativas internamente) */}
      <TopTendencias2 />

      {/* Barra de categorias — vem do backend via useCategorias */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto"
          style={{ height: 52, scrollbarWidth: "none" }}>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => mudarCat(cat.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border-none cursor-pointer transition-all flex-shrink-0"
              style={activeCatId === cat.id
                ? { background: GREEN, color: "#fff" }
                : { background: "#f3f4f6", color: "#4b5563" }}
            >
              {cat.icone && <span className="mr-1">{cat.icone}</span>}
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-7">

        {/* Banners promo */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { bg: "linear-gradient(135deg,#1a1a2e,#2d1b4e)", label: "Óculos escuros", title: "45–80% de desconto",    sub: "Apenas esta semana"  },
            { bg: "linear-gradient(135deg,#b91c1c,#ef4444)", label: "Calçados",        title: "Até 75% de desconto",   sub: "Mais de 200 modelos" },
            { bg: "linear-gradient(135deg,#14532d,#16a34a)", label: "Acessórios",      title: "Mínimo 45% de desconto",sub: "Selecção premium"    },
          ].map(b => (
            <div key={b.label}
              className="rounded-2xl p-5 cursor-pointer transition-transform hover:-translate-y-0.5"
              style={{ background: b.bg }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>{b.label}</p>
              <p className="text-base font-black text-white leading-tight mb-1">{b.title}</p>
              <p className="text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>{b.sub}</p>
              <p className="text-[11px] font-bold text-white underline cursor-pointer">Comprar agora ›</p>
            </div>
          ))}
        </div>

        {/* Faixa afiliados */}
        <div className="flex items-center gap-4 rounded-2xl p-4 mb-7"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fef3c7)", border: "1px solid #fed7aa" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#f97316" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-black" style={{ color: "#92400e" }}>Programa de Afiliados MozTicTac</p>
            <p className="text-[11px]" style={{ color: "#b45309" }}>Partilha produtos e ganha até 20% de comissão em cada venda.</p>
          </div>
          <a href="/conta?tab=afiliados"
            className="px-4 py-2 rounded-full text-[11px] font-black text-white border-none cursor-pointer flex-shrink-0"
            style={{ background: "#f97316" }}>
            Juntar-me →
          </a>
        </div>

        {/* Header da secção + filtros */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-black text-gray-900">Em Alta Agora 🔥</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? "A carregar..." : `${total} produto${total !== 1 ? "s" : ""} em tendência`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Barra de pesquisa */}
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={buscaInput}
                onChange={e => setBuscaInput(e.target.value)}
                placeholder="Pesquisar..."
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 bg-white"
              />
            </div>

            {/* Tabs */}
            <div className="flex bg-white border border-gray-200 p-1 gap-0.5 rounded-xl">
              {TABS.map(tab => (
                <button key={tab} onClick={() => mudarTab(tab)}
                  className="px-3.5 py-1.5 text-[11px] font-bold rounded-lg border-none cursor-pointer transition-all"
                  style={activeTab === tab
                    ? { background: GREEN, color: "#fff" }
                    : { background: "transparent", color: "#6b7280" }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Ordenar */}
            <select value={sort} onChange={e => { setSort(e.target.value); setPagina(1); }}
              className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 px-3 py-2 cursor-pointer outline-none rounded-lg">
              <option value="">Ordenar</option>
              <option value="price-asc">Preço ↑</option>
              <option value="price-desc">Preço ↓</option>
              <option value="rating">Avaliação</option>
            </select>

            {/* Botão recarregar */}
            <button onClick={recarregar} disabled={loading}
              className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:border-green-400 cursor-pointer disabled:opacity-50">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={loading ? "animate-spin" : ""}>
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Grid de produtos */}
        {loading ? (
          <Spinner />
        ) : erro ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <p className="text-red-500 font-bold text-sm">⚠️ {erro}</p>
            <button onClick={recarregar}
              className="px-5 py-2 rounded-full text-sm font-bold text-white border-none cursor-pointer"
              style={{ background: GREEN }}>
              Tentar novamente
            </button>
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-600">Nenhum produto encontrado</p>
            <p className="text-xs text-gray-400 mt-1">Tente outra categoria ou pesquisa</p>
            <button
              onClick={() => { setActiveCatId(""); setActiveTab("Todos"); setBuscaInput(""); setSort(""); setPagina(1); }}
              className="mt-4 px-5 py-2 rounded-full text-sm font-bold text-white border-none cursor-pointer"
              style={{ background: GREEN }}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {produtos.map(p => (
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

        <Paginacao
          pagina={pagina}
          totalPaginas={totalPaginas}
          onChange={pg => { setPagina(pg); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      </div>
    </div>
  );
}