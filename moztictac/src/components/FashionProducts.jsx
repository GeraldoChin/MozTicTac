// src/components/FashionProducts.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { adicionarAoCarrinho } from "../utils/carrinho";

// ── API BASE ──────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function req(caminho) {
  const res = await fetch(`${BASE_URL}${caminho}`);
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.message || dados.mensagem || `Erro ${res.status}`);
  return dados;
}

// ── API autenticada (para desejos) ───────────────────────────────
async function reqAuth(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${caminho}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opcoes,
  });
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.message || dados.mensagem || `Erro ${res.status}`);
  return dados;
}

const apiPublico = {
  produtos: (tab = "novos", pagina = 1, limite = 20, categoriaId, busca) => {
    const params = new URLSearchParams({ tab, pagina, limite });
    if (categoriaId) params.set("categoriaId", categoriaId);
    if (busca)       params.set("busca", busca);
    return req(`/publico/produtos?${params.toString()}`);
  },
  categorias: () => req("/publico/categorias"),
};

// ── API desejos ───────────────────────────────────────────────────
const apiDesejos = {
  adicionar: (produtoId) =>
    reqAuth(`/desejos/${produtoId}`, { method: "POST" }),
  remover: (produtoId) =>
    reqAuth(`/desejos/${produtoId}`, { method: "DELETE" }),
};

// ── Mapeamento de tab UI → param backend ─────────────────────────
const TAB_MAP = {
  "Todos":            "novos",
  "Novos":            "novos",
  "Mais Vendidos":    "melhores",
  "Melhor Avaliados": "topRated",
  "Promoções":        "deals",
};

const TABS = ["Todos", "Novos", "Mais Vendidos", "Melhor Avaliados", "Promoções"];

const PROVINCES = [
  "Todas", "Maputo", "Matola", "Sofala", "Nampula",
  "Gaza", "Inhambane", "Manica", "Tete", "Zambézia",
  "Cabo Delgado", "Niassa",
];

const GREEN = "#1db954";

// ── Helpers ───────────────────────────────────────────────────────
function fmtPreco(n) {
  return Number(n || 0).toLocaleString("pt-MZ");
}

// ── Spinner ───────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
    </div>
  );
}

// ── Paginação ─────────────────────────────────────────────────────
function Paginacao({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPaginas, 7) }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onChange(pagina - 1)}
        disabled={pagina <= 1}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-green-400 cursor-pointer bg-white text-sm"
      >
        ‹
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border cursor-pointer transition-all
            ${p === pagina ? "text-white border-transparent" : "border-gray-200 text-gray-500 bg-white hover:border-green-400"}`}
          style={p === pagina ? { background: GREEN, borderColor: GREEN } : {}}>
          {p}
        </button>
      ))}
      {totalPaginas > 7 && pagina < totalPaginas - 3 && (
        <>
          <span className="text-gray-400 text-xs">…</span>
          <button onClick={() => onChange(totalPaginas)}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 bg-white hover:border-green-400 cursor-pointer">
            {totalPaginas}
          </button>
        </>
      )}
      <button
        onClick={() => onChange(pagina + 1)}
        disabled={pagina >= totalPaginas}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-green-400 cursor-pointer bg-white text-sm"
      >
        ›
      </button>
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────────────
function ProductCardInterno({ p }) {
  const navigate = useNavigate();

  // ── Estado wishlist ──
  const [noDesejo, setNoDesejo]   = useState(false);
  const [salvando, setSalvando]   = useState(false);
  const [erroDesejo, setErroDesejo] = useState(null);

  // ── Estado "adicionado ao carrinho" ──
  const [adicionado, setAdicionado] = useState(false);

  async function toggleDesejo(e) {
    e.stopPropagation();
    if (salvando) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setSalvando(true);
    setErroDesejo(null);
    try {
      if (noDesejo) {
        await apiDesejos.remover(p.id);
        setNoDesejo(false);
      } else {
        await apiDesejos.adicionar(p.id);
        setNoDesejo(true);
      }
    } catch (err) {
      console.error("Erro wishlist:", err.message);
      setErroDesejo(err.message);
      setTimeout(() => setErroDesejo(null), 3000);
    } finally {
      setSalvando(false);
    }
  }

  // ── CORRIGIDO: usa utilitário de carrinho ──
  function handleAddToCart(e) {
    e.stopPropagation();
    adicionarAoCarrinho({
      id:           p.id,
      nome:         p.nome      ?? p.name      ?? "Produto",
      preco:        Number(p.preco ?? p.price ?? 0),
      imagem:       p.imagens?.[0] ?? p.img   ?? null,
      quantidade:   1,
      vendedorId:   p.vendedor?.id   ?? null,
      vendedorNome: p.vendedor?.nome ?? p.vendedor?.nomeCompleto ?? "",
      localidade:   p.vendedor?.cidade ?? p.city ?? "",
      estado:       p.estadoItem === "NOVO" || p.isNew ? "Novo" : "Usado",
      entrega:      p.entregaDisponivel ?? p.hasDelivery  ?? false,
      afiliado:     p.aceitaAfiliados  ?? p.hasAffiliate ?? false,
      atacado:      false,
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  }

  // Normalizar campos
  const nome            = p.nome      ?? p.name ?? "Produto";
  const preco           = Number(p.preco ?? p.price ?? 0);
  const precoOriginal   = p.originalPrice ?? null;
  const avaliacao       = Number(p.mediaAvaliacoes ?? p.rating ?? 0);
  const totalAvaliacoes = p.totalAvaliacoes ?? p.reviews ?? 0;
  const cidade          = p.vendedor?.cidade ?? p.city ?? "";
  const imagem          = p.imagens?.[0] ?? p.img ?? "";
  const categoria       = p.categoria?.nome ?? p.category ?? "";
  const temEntrega      = p.entregaDisponivel ?? p.hasDelivery ?? false;
  const temAfiliado     = p.aceitaAfiliados ?? p.hasAffiliate ?? false;
  const pctAfiliado     = Number(p.percentualAfiliado ?? p.affiliatePct ?? 0);
  const isNovo          = p.estadoItem === "NOVO" || p.isNew || false;
  const tipo            = (p.tipo ?? p.type ?? "produto").toLowerCase();
  const destaque        = p.destaque ?? false;

  const badge = destaque ? "Anúncio"
    : tipo === "servico" ? "Serviço"
    : p.badge ?? null;

  return (
    <div
      onClick={() => navigate(`/produto/${p.id}`)}
      className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group "
    >
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {imagem ? (
          <img
            src={imagem}
            alt={nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Overlay com acções */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3 gap-2">

          {/* ── CORRIGIDO: Adicionar ao carrinho ── */}
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded shadow-sm transition-all duration-150"
            style={{
              background: adicionado ? "#16a34a" : "white",
              color:      adicionado ? "white"   : "#1f2937",
            }}
          >
            {adicionado ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Adicionado!
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                </svg>
                Adicionar
              </>
            )}
          </button>

          {/* ── Botão Wishlist ── */}
          <button
            onClick={toggleDesejo}
            disabled={salvando}
            title={noDesejo ? "Remover dos desejos" : "Guardar nos desejos"}
            className="w-6 h-6 rounded bg-white flex items-center justify-center shadow-sm hover:bg-red-50 transition-all duration-150 disabled:opacity-50"
          >
            {salvando ? (
              <div className="w-3 h-3 border border-gray-300 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <svg
                width="14" height="14"
                viewBox="0 0 24 24"
                fill={noDesejo ? "#ef4444" : "none"}
                stroke={noDesejo ? "#ef4444" : "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            )}
          </button>

          {/* Ver produto */}
          <button
            onClick={e => { e.stopPropagation(); navigate(`/produto/${p.id}`); }}
            className="w-6 h-6 rounded bg-white flex items-center justify-center shadow-sm hover:bg-green-50 hover:text-green-600 text-gray-600 transition-all duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        {/* Badges */}
        {badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: badge === "Anúncio" ? "#e3f0ff" : badge === "Serviço" ? "#e6f9f0" : "#f3f4f6",
              color:      badge === "Anúncio" ? "#3b82f6" : badge === "Serviço" ? "#00b96b" : "#6b7280",
            }}>
            {badge}
          </span>
        )}
        {isNovo && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">
            Novo
          </span>
        )}
        {temAfiliado && pctAfiliado > 0 && (
          <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            +{pctAfiliado}% afiliado
          </span>
        )}

        {/* Indicador wishlist sempre visível quando guardado */}
        {noDesejo && !erroDesejo && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </div>
        )}

        {/* Erro temporário */}
        {erroDesejo && (
          <div className="absolute bottom-2 left-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded text-center">
            {erroDesejo}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] text-gray-400 font-medium mb-0.5">{categoria}</p>
        <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-2">{nome}</p>

        {avaliacao > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-xs font-semibold text-gray-700">{avaliacao.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({totalAvaliacoes})</span>
          </div>
        )}

        <div className="flex items-end justify-between gap-1">
          <div>
            <p className="text-base font-black text-gray-900">
              {fmtPreco(preco)}
              <span className="text-[10px] font-normal text-gray-400 ml-1">MZN</span>
            </p>
            {precoOriginal && (
              <p className="text-[11px] text-gray-400 line-through">
                {fmtPreco(precoOriginal)} MZN
              </p>
            )}
          </div>
          {temEntrega && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-green-50 text-green-600 rounded">
              Entrega
            </span>
          )}
        </div>

        {cidade && (
          <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {cidade}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────
export function FashionProducts() {
  const [produtos, setProdutos]           = useState([]);
  const [categorias, setCategorias]       = useState([]);
  const [total, setTotal]                 = useState(0);
  const [totalPaginas, setTotalPaginas]   = useState(1);
  const [carregando, setCarregando]       = useState(true);
  const [erro, setErro]                   = useState(null);

  const [activeTab, setActiveTab]         = useState("Todos");
  const [pagina, setPagina]               = useState(1);
  const [categoriaId, setCategoriaId]     = useState("");
  const [busca, setBusca]                 = useState("");
  const [buscaInput, setBuscaInput]       = useState("");

  const [province, setProvince]           = useState("Todas");
  const [priceMin, setPriceMin]           = useState("");
  const [priceMax, setPriceMax]           = useState("");
  const [estado, setEstado]               = useState("todos");
  const [tipo, setTipo]                   = useState("todos");
  const [withDelivery, setWithDelivery]   = useState(false);
  const [withAffiliate, setWithAffiliate] = useState(false);
  const [filtersOpen, setFiltersOpen]     = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setBusca(buscaInput); setPagina(1); }, 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  useEffect(() => {
    apiPublico.categorias()
      .then(res => setCategorias(res.success ? res.data : res.dados ?? []))
      .catch(() => setCategorias([]));
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const tabParam = TAB_MAP[activeTab] ?? "novos";
      const res = await apiPublico.produtos(tabParam, pagina, 20, categoriaId || undefined, busca || undefined);
      const d = res.success ? res.data : res.dados ?? {};
      setProdutos(d.produtos ?? []);
      setTotal(d.total ?? 0);
      setTotalPaginas(d.totalPaginas ?? (Math.ceil((d.total ?? 0) / 20) || 1));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [activeTab, pagina, categoriaId, busca]);

  useEffect(() => { carregar(); }, [carregar]);

  const filtered = useMemo(() => {
    let list = [...produtos];
    if (province !== "Todas")
      list = list.filter(p => (p.vendedor?.provincia ?? p.province ?? "") === province);
    if (priceMin !== "")
      list = list.filter(p => Number(p.preco ?? p.price ?? 0) >= Number(priceMin));
    if (priceMax !== "")
      list = list.filter(p => Number(p.preco ?? p.price ?? 0) <= Number(priceMax));
    if (estado === "novo")
      list = list.filter(p => p.estadoItem === "NOVO" || p.isNew);
    if (estado === "usado")
      list = list.filter(p => p.estadoItem === "USADO" || (!p.isNew && p.estadoItem !== "NOVO"));
    if (tipo === "produto")
      list = list.filter(p => (p.tipo ?? p.type ?? "produto").toLowerCase() !== "servico");
    if (tipo === "servico")
      list = list.filter(p => (p.tipo ?? p.type ?? "").toLowerCase() === "servico");
    if (withDelivery)
      list = list.filter(p => p.entregaDisponivel ?? p.hasDelivery);
    if (withAffiliate)
      list = list.filter(p => p.aceitaAfiliados ?? p.hasAffiliate);
    return list;
  }, [produtos, province, priceMin, priceMax, estado, tipo, withDelivery, withAffiliate]);

  function mudarTab(tab) { setActiveTab(tab); setPagina(1); }
  function mudarCategoria(id) { setCategoriaId(id); setPagina(1); }

  function clearFilters() {
    setProvince("Todas"); setPriceMin(""); setPriceMax("");
    setEstado("todos"); setTipo("todos");
    setWithDelivery(false); setWithAffiliate(false);
  }

  const hasActiveFilters =
    province !== "Todas" || priceMin || priceMax ||
    estado !== "todos" || tipo !== "todos" ||
    withDelivery || withAffiliate;

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-[1450px] mx-auto px-4">

        {/* ── Cabeçalho ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Manrope, sans-serif" }}>
              Todos os Produtos
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {carregando ? "A carregar..." : `${total} resultado${total !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white border border-gray-200  p-1 gap-0.5">
              {TABS.map(tab => (
                <button key={tab} onClick={() => mudarTab(tab)}
                  className={[
                    "px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border-none transition-all duration-200",
                    activeTab === tab ? "text-white shadow-sm" : "text-gray-500 bg-transparent hover:text-gray-700",
                  ].join(" ")}
                  style={activeTab === tab ? { background: GREEN } : {}}>
                  {tab}
                </button>
              ))}
            </div>

            <button onClick={() => setFiltersOpen(v => !v)}
              className={[
                "flex items-center gap-1.5 px-3.5 py-2  border text-xs font-semibold transition-all duration-200 cursor-pointer",
                filtersOpen
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-gray-200 text-gray-500 bg-white hover:border-gray-300",
              ].join(" ")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filtros
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-0.5" />}
            </button>
          </div>
        </div>

        {/* ── Barra de pesquisa + categorias ── */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={buscaInput}
              onChange={e => setBuscaInput(e.target.value)}
              placeholder="Pesquisar produtos..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200  text-sm focus:outline-none focus:border-green-400 bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => mudarCategoria("")}
              className={`px-3 py-1.5  border text-xs font-semibold cursor-pointer transition-all
                ${!categoriaId ? "text-white border-transparent" : "border-gray-200 text-gray-500 bg-white hover:border-green-400"}`}
              style={!categoriaId ? { background: GREEN } : {}}>
              Todas
            </button>
            {categorias.map(c => (
              <button key={c.id} onClick={() => mudarCategoria(c.id)}
                className={`px-3 py-1.5  border text-xs font-semibold cursor-pointer transition-all
                  ${categoriaId === c.id ? "text-white border-transparent" : "border-gray-200 text-gray-500 bg-white hover:border-green-400"}`}
                style={categoriaId === c.id ? { background: GREEN } : {}}>
                {c.icone && <span className="mr-1">{c.icone}</span>}
                {c.nome}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body: sidebar + grid ── */}
        <div className="flex gap-5 items-start">

          {/* ══ Sidebar filtros ══ */}
          {filtersOpen && (
            <aside className="w-56 flex-shrink-0 bg-white border border-gray-100 shadow-sm p-5 sticky top-4 ">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-800" style={{ fontFamily: "Manrope, sans-serif" }}>Filtros</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="text-[11px] text-green-600 font-semibold cursor-pointer border-none bg-transparent hover:underline">
                    Limpar
                  </button>
                )}
              </div>
              <hr className="border-gray-100 mb-4" />

              {/* Província */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Província</label>
                <div className="relative">
                  <select value={province} onChange={e => setProvince(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 appearance-none cursor-pointer focus:outline-none focus:border-green-400 transition-colors">
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>

              {/* Preço */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preço (MZN)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Mín" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400 transition-colors" />
                  <input type="number" placeholder="Máx" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400 transition-colors" />
                </div>
              </div>

              {/* Estado */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estado</label>
                <div className="flex flex-col gap-2">
                  {[["todos", "Todos"], ["novo", "Novo"], ["usado", "Usado"]].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer group" onClick={() => setEstado(val)}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 cursor-pointer ${estado === val ? "border-green-500" : "border-gray-300 group-hover:border-gray-400"}`}>
                        {estado === val && <div className="w-2 h-2 rounded-full bg-green-500" />}
                      </div>
                      <span className={`text-sm transition-colors ${estado === val ? "text-gray-800 font-medium" : "text-gray-500"}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tipo */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo</label>
                <div className="flex flex-col gap-2">
                  {[["todos", "Todos"], ["produto", "Produto físico"], ["servico", "Serviço"]].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer group" onClick={() => setTipo(val)}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 cursor-pointer ${tipo === val ? "border-green-500" : "border-gray-300 group-hover:border-gray-400"}`}>
                        {tipo === val && <div className="w-2 h-2 rounded-full bg-green-500" />}
                      </div>
                      <span className={`text-sm transition-colors ${tipo === val ? "text-gray-800 font-medium" : "text-gray-500"}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3">
                {[
                  { label: "Com entrega",      val: withDelivery,  set: setWithDelivery  },
                  { label: "Aceita afiliados", val: withAffiliate, set: setWithAffiliate },
                ].map(item => (
                  <label key={item.label} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <div onClick={() => item.set(v => !v)}
                      className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer flex-shrink-0 ${item.val ? "bg-green-500" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${item.val ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                  </label>
                ))}
              </div>
            </aside>
          )}

          {/* ══ Grid de produtos ══ */}
          <div className="flex-1 min-w-0">
            {erro ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <p className="text-red-500 text-sm font-medium">Erro ao carregar produtos</p>
                <p className="text-gray-400 text-xs">{erro}</p>
                <button onClick={carregar}
                  className="text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer border-none text-white"
                  style={{ background: GREEN }}>
                  Tentar novamente
                </button>
              </div>
            ) : carregando ? (
              <Spinner />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <p className="text-gray-500 font-medium text-sm">Nenhum produto encontrado</p>
                <p className="text-gray-400 text-xs mt-1">
                  {hasActiveFilters ? "Tente ajustar os filtros" : "Tente outra pesquisa"}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="mt-4 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer border-none text-white"
                    style={{ background: GREEN }}>
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${filtersOpen ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"}`}>
                  {filtered.map(p => (
                    <ProductCardInterno key={p.id} p={p} />
                  ))}
                </div>

                <Paginacao
                  pagina={pagina}
                  totalPaginas={totalPaginas}
                  onChange={p => { setPagina(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Alias para retrocompatibilidade
export { FashionProducts as DealsSection };

// Exportar ALL_PRODUCTS vazio para não quebrar imports existentes
export const ALL_PRODUCTS = [];