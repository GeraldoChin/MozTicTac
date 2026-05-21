import { useState, useEffect, useRef, useCallback } from "react";

const GREEN       = "#00b96b";
const GREEN_DARK  = "#009a5a";
const GREEN_LIGHT = "#e6f9f0";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

const CATS = ["Todos","Calçados","Acessórios","Roupa","Tech","Beleza","Alimentos","Outros"];
const SORT_OPTS = [
  { value: "desconto",   label: "Maior desconto" },
  { value: "preco-asc",  label: "Preço ↑" },
  { value: "preco-desc", label: "Preço ↓" },
  { value: "avaliacao",  label: "Melhor avaliação" },
];

// ── Stars ─────────────────────────────────────────────────────────
function Stars({ rating, size = 10 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
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

// ── Countdown sincronizado com fimEm real ─────────────────────────
function Countdown({ fimEm, segRestantesInicial }) {
  const [secs, setSecs] = useState(() => {
    if (fimEm) {
      return Math.max(0, Math.floor((new Date(fimEm).getTime() - Date.now()) / 1000));
    }
    return segRestantesInicial ?? 0;
  });

  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  if (secs <= 0) {
    return (
      <span className="text-xs font-bold text-red-500 px-2 py-1 bg-red-50 rounded-lg">
        Expirado
      </span>
    );
  }

  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-1">
      {[h, m, s].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span
            className="inline-flex items-center justify-center w-9 h-9 text-sm font-black text-white"
            style={{ background: "#111827", fontFamily: "monospace" }}
          >{v}</span>
          {i < 2 && <span className="text-gray-400 font-bold text-sm">:</span>}
        </span>
      ))}
    </div>
  );
}

// ── Barra de stock ────────────────────────────────────────────────
function StockBar({ percentVendido, quantidadeLimite, quantidadeVendida }) {
  if (quantidadeLimite == null) return null;
  const restante = quantidadeLimite - quantidadeVendida;
  const pct = Math.min(100, percentVendido ?? 0);
  const urgente = pct >= 70;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-bold" style={{ color: urgente ? "#ef4444" : "#6b7280" }}>
          {urgente ? "🔥 Quase esgotado!" : `${restante} restantes`}
        </span>
        <span className="text-[9px] text-gray-400">{pct}% vendido</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: urgente
              ? "linear-gradient(90deg,#f97316,#ef4444)"
              : "linear-gradient(90deg,#00b96b,#009a5a)",
          }}
        />
      </div>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-200" style={{ aspectRatio: "1" }} />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
      </div>
    </div>
  );
}

// ── Deal Card ─────────────────────────────────────────────────────
function DealCard({ d, wished, onWish, onAddCart }) {
  const { desconto, esgotado } = d;

  return (
    <div className={`bg-white border border-gray-100 overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-xl hover:-translate-y-1.5 ${esgotado ? "opacity-60" : ""}`}>
      {/* Imagem */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1" }}>
        <img
          src={d.imagens?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"}
          alt={d.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
          loading="lazy"
        />

        {/* Badge desconto */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-black text-white"
          style={{ background: "#ef4444" }}>
          -{desconto}%
        </div>

        {/* Badge esgotado */}
        {esgotado && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white font-black text-sm tracking-widest uppercase">Esgotado</span>
          </div>
        )}

        {/* Botão wishlist */}
        <button
          onClick={e => { e.stopPropagation(); onWish(d.id); }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg width="13" height="13" viewBox="0 0 24 24"
            fill={wished ? "#ef4444" : "none"}
            stroke={wished ? "#ef4444" : "#9ca3af"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Botão add cart (hover) */}
        {!esgotado && (
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <button
              onClick={e => { e.stopPropagation(); onAddCart(d); }}
              className="w-full py-2 rounded-xl text-white text-[11px] font-black border-none cursor-pointer flex items-center justify-center gap-1.5"
              style={{ background: GREEN }}
              onMouseEnter={e => e.currentTarget.style.background = GREEN_DARK}
              onMouseLeave={e => e.currentTarget.style.background = GREEN}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Adicionar ao Carrinho
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
          {d.categoria?.nome || d.tipo}
        </p>
        <p className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 mb-2 min-h-[34px]">
          {d.nome}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <Stars rating={d.rating} />
          <span className="text-[11px] font-bold text-gray-700">{d.rating?.toFixed(1)}</span>
          <span className="text-[10px] text-gray-400">({d.reviews})</span>
        </div>

        {/* Preços */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 line-through">
              {d.precoOriginal?.toLocaleString("pt-MZ")} MZN
            </p>
            <p className="text-base font-black text-gray-900">
              {d.preco?.toLocaleString("pt-MZ")}
              <span className="text-[10px] font-normal text-gray-400 ml-1">MZN</span>
            </p>
          </div>
          {d.entregaDisponivel && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: GREEN_LIGHT, color: "#15803d" }}>Entrega</span>
          )}
        </div>

        {/* Localidade */}
        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {d.vendedor?.cidade || "—"}
        </p>

        {/* Barra de stock */}
        <StockBar
          percentVendido={d.percentVendido}
          quantidadeLimite={d.quantidadeLimite}
          quantidadeVendida={d.quantidadeVendida}
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════
export default function Relampago({ activeFilter, onFilterChange }) {
  const [deals, setDeals]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [sort, setSort]         = useState("desconto");
  const [busca, setBusca]       = useState("");
  const [wishlist, setWishlist] = useState(new Set());
  const [page, setPage]         = useState(1);
  const [tab, setTab]           = useState("Todos");

  // Countdown global — usa o fimEm do primeiro deal (todos partilham o mesmo batch)
  const fimEmGlobal = deals.find(d => d.fimEm)?.fimEm ?? null;

  const PER_PAGE = 8;

  // ── Fetch ────────────────────────────────────────────────────
const fetchDeals = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const params = new URLSearchParams({ sort });
    if (busca.trim()) params.set("busca", busca.trim());

  // Corrigir para:
const res = await fetch(`${BASE_URL}/publico/relampago?${params.toString()}`);
    const json = await res.json();

    if (!json.success) throw new Error(json.message || "Erro ao carregar ofertas");

    setDeals(json.data || []);
    setPage(1);
  } catch (e) {
    setError(e.message);
    setDeals([]);
  } finally {
    setLoading(false);
  }
}, [sort, busca]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  // Refetch a cada 60s para manter countdown sincronizado
  useEffect(() => {
    const t = setInterval(fetchDeals, 60_000);
    return () => clearInterval(t);
  }, [fetchDeals]);

  // ── Filtros locais (tab) ──────────────────────────────────────
  const filtered = (() => {
    let list = [...deals];
    if (tab === "Novos")           list = list.filter(d => d.estadoItem === "NOVO");
    if (tab === "Mais Vendidos")   list = [...list].sort((a, b) => b.totalVendas - a.totalVendas);
    if (tab === "Melhor Avaliados") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  })();

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Wishlist ──────────────────────────────────────────────────
  const toggleWish = id => setWishlist(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // ── Add to cart (hook no teu carrinho) ───────────────────────
  const handleAddCart = deal => {
    // Emitir evento ou chamar contexto do carrinho existente no projeto
    window.dispatchEvent(new CustomEvent("moztictac:addCart", { detail: {
      produtoId:      deal.produtoId,
      nome:           deal.nome,
      preco:          deal.preco,
      precoOriginal:  deal.precoOriginal,
      imagem:         deal.imagens?.[0],
      vendaRelampago: true,
    }}));
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">⚡ Flash Deals</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? "A carregar..." : `${filtered.length} oferta${filtered.length !== 1 ? "s" : ""} disponíveis`}
              </p>
            </div>
            {/* Countdown sincronizado com API */}
            {fimEmGlobal && (
              <Countdown fimEm={fimEmGlobal} segRestantesInicial={deals[0]?.segRestantes} />
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Busca */}
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar..."
                value={busca}
                onChange={e => { setBusca(e.target.value); setPage(1); }}
                className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 pl-7 outline-none w-36 focus:border-green-400 transition-colors"
                style={{ fontFamily: "Manrope, sans-serif" }}
              />
              <svg className="absolute left-2 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>

            {/* Ordenação */}
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
              className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 cursor-pointer outline-none"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Refresh manual */}
            <button
              onClick={fetchDeals}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-green-400 transition-colors disabled:opacity-50"
              title="Atualizar ofertas"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={loading ? "animate-spin" : ""}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Categorias ── */}
        <div className="flex gap-2 flex-wrap mb-4">
          {CATS.map(cat => (
            <button
              key={cat}
              onClick={() => { onFilterChange(cat); setPage(1); }}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold border-none cursor-pointer transition-all duration-150"
              style={activeFilter === cat
                ? { background: GREEN, color: "#fff" }
                : { background: "#f3f4f6", color: "#4b5563" }}
            >{cat}</button>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 mb-5 w-fit">
          {["Todos","Novos","Mais Vendidos","Melhor Avaliados"].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className="px-3.5 py-1.5 text-[11px] font-bold border-none cursor-pointer transition-all duration-150"
              style={tab === t ? { background: GREEN, color: "#fff" } : { background: "transparent", color: "#6b7280" }}
            >{t}</button>
          ))}
        </div>

        {/* ── Filtro activo ── */}
        {activeFilter !== "Todos" && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500">Filtrado por:</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: GREEN_LIGHT, color: GREEN }}>
              {activeFilter}
              <button
                onClick={() => { onFilterChange("Todos"); setPage(1); }}
                className="border-none bg-transparent cursor-pointer font-black text-base leading-none"
                style={{ color: GREEN }}>×</button>
            </span>
          </div>
        )}

        {/* ── Erro ── */}
        {error && !loading && (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-600">Erro ao carregar ofertas</p>
            <p className="text-xs text-gray-400">{error}</p>
            <button onClick={fetchDeals} className="mt-2 px-5 py-2 rounded-full text-xs font-black text-white border-none cursor-pointer" style={{ background: GREEN }}>
              Tentar novamente
            </button>
          </div>
        )}

        {/* ── Grid ── */}
        {!error && (
          <>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-600">Nenhuma oferta relâmpago activa</p>
                <p className="text-xs text-gray-400 mt-1">Volta em breve ou remove os filtros</p>
                <button
                  onClick={() => { onFilterChange("Todos"); setTab("Todos"); setBusca(""); setPage(1); }}
                  className="mt-4 px-5 py-2 rounded-full text-xs font-black text-white border-none cursor-pointer"
                  style={{ background: GREEN }}
                >Ver todas as ofertas</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginated.map(d => (
                  <DealCard
                    key={d.id}
                    d={d}
                    wished={wishlist.has(d.id)}
                    onWish={toggleWish}
                    onAddCart={handleAddCart}
                  />
                ))}
              </div>
            )}

            {/* ── Paginação ── */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 border text-xs font-bold cursor-pointer flex items-center justify-center transition-all"
                  style={{ background: "#fff", color: "#4b5563", borderColor: "#e5e7eb", opacity: page === 1 ? 0.4 : 1 }}
                >‹</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className="w-8 h-8 border text-xs font-bold cursor-pointer flex items-center justify-center transition-all"
                    style={page === i + 1
                      ? { background: GREEN, color: "#fff", borderColor: GREEN }
                      : { background: "#fff", color: "#4b5563", borderColor: "#e5e7eb" }}
                  >{i + 1}</button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 border text-xs font-bold cursor-pointer flex items-center justify-center transition-all"
                  style={{ background: "#fff", color: "#4b5563", borderColor: "#e5e7eb", opacity: page === totalPages ? 0.4 : 1 }}
                >›</button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}