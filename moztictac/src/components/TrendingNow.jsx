import { useState, useEffect, useCallback } from "react";

const GREEN      = "#00b96b";
const GREEN_DARK = "#009a5a";
const GREEN_LIGHT= "#e6f9f0";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

// ── Normaliza igual ao TrendingPage ──────────────────────────────
function normalizarProduto(p) {
  return {
    id:       p.id,
    name:     p.nome      ?? p.name      ?? "Produto",
    price:    Number(p.preco ?? p.price ?? 0),
    orig:     p.precoOriginal ?? p.originalPrice ?? null,
    rating:   Number(p.mediaAvaliacoes ?? p.rating ?? 0),
    reviews:  p.totalAvaliacoes ?? p.reviews ?? 0,
    city:     p.vendedor?.cidade ?? p.city ?? "",
    cat:      p.categoria?.nome ?? p.category ?? "",
    img:      p.imagens?.[0]    ?? p.img ?? "",
    isNew:    p.estadoItem === "NOVO" || p.isNew || false,
    delivery: p.entregaDisponivel ?? p.delivery ?? false,
    vendas:   p.totalVendas ?? 0,
    desconto: p.desconto ?? (p.precoOriginal && p.preco
      ? Math.round((1 - p.preco / p.precoOriginal) * 100)
      : 0),
  };
}

// ── UI helpers ────────────────────────────────────────────────────
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

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 overflow-hidden  animate-pulse">
      <div className="bg-gray-200" style={{ aspectRatio: "1" }} />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
      </div>
    </div>
  );
}

function TrendingCard({ p }) {

  return (
    <div
      onClick={() => window.location.href = `/produto/${p.id}`}
      className="bg-white border border-gray-100 overflow-hidden  group cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative"
    >
      <div className="overflow-hidden relative" style={{ aspectRatio: "1/1" }}>
        {p.img ? (
          <img
            src={p.img}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Badge novo */}
        {p.isNew && (
          <span className="absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-full"
            style={{ background: GREEN_LIGHT, color: "#15803d" }}>
            Novo
          </span>
        )}

        {/* Badge desconto */}
        {p.desconto >= 10 && (
          <span className="absolute bottom-2 left-2 text-[9px] font-black px-1.5 py-0.5 text-white"
            style={{ background: "#ef4444" }}>
            -{p.desconto}%
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-3">
        <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          {p.cat}
        </p>
        <p className="text-[12px] sm:text-[13px] font-semibold text-gray-800 mt-0.5 truncate">
          {p.name}
        </p>

        {p.rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Stars rating={p.rating} />
            <span className="text-[10px] font-bold text-gray-700">{p.rating.toFixed(1)}</span>
            {p.reviews > 0 && (
              <span className="text-[9px] text-gray-400">({p.reviews})</span>
            )}
          </div>
        )}

        <div className="mt-1.5">
          {p.orig && p.orig !== p.price && (
            <p className="text-[9px] text-gray-400 line-through">
              {p.orig.toLocaleString("pt-MZ")} MZN
            </p>
          )}
          <p className="text-[12px] sm:text-[13px] font-bold text-gray-900">
            {p.price.toLocaleString("pt-MZ")}
            <span className="text-[9px] font-normal text-gray-400 ml-1">MZN</span>
          </p>
        </div>

        {p.vendas > 0 && (
          <p className="text-[9px] text-gray-400 mt-1">{p.vendas} vendidos</p>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
export function TrendingNow({ limit = 4 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Usa exactamente o mesmo endpoint do TrendingPage
      const res  = await fetch(`${BASE_URL}/publico/trending?sort=trending&pagina=1&limite=${limit}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.mensagem ?? json.message ?? "Erro");

      // TrendingPage lê json.data.produtos
      const lista = json.data?.produtos ?? json.data ?? [];
      setProducts(lista.slice(0, limit).map(normalizarProduto));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchTrending(); }, [fetchTrending]);

  return (
    <section className="py-8 sm:py-10 bg-gray-50 border-t border-gray-100">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-gray-900"> Em Alta Agora</h2>
          <a href="/trending"
            className="text-xs sm:text-sm font-semibold whitespace-nowrap"
            style={{ color: GREEN, textDecoration: "none" }}>
            Ver Todos →
          </a>
        </div>

        {error && !loading && (
          <div className="flex flex-col items-center py-10 gap-2">
            <p className="text-sm font-bold text-gray-500">Não foi possível carregar os produtos</p>
            <button onClick={fetchTrending}
              className="px-5 py-2 rounded-full text-xs font-black text-white border-none cursor-pointer mt-1"
              style={{ background: GREEN }}>
              Tentar novamente
            </button>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {loading
              ? Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p, i) => (
                  <TrendingCard key={p.id ?? i} p={p} />
                ))
            }
          </div>
        )}

      </div>
    </section>
  );
}