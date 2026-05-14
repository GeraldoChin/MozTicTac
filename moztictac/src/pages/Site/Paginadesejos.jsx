import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, Trash2, ShoppingCart, ChevronRight, Star, Truck,
  Package, ArrowLeft, BadgeCheck, Search, X, CheckCircle,
} from "lucide-react";
import { Header } from "../../components/Header";

// ─── API BASE ─────────────────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function req(caminho, opcoes = {}) {
  // Buscar o token onde ele estiver guardado na tua app
  const token = localStorage.getItem("token"); // ou "accessToken", depende do teu auth

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

// ─── API corrigida — rotas apontam para /desejos ──────────────────────────────
const api = {
  listar:  ()        => req("/desejos"),
  remover: (produtoId) => req(`/desejos/${produtoId}`, { method: "DELETE" }),
  limpar:  ()        => req("/desejos", { method: "DELETE" }),
  addCart: (produtoId, qty = 1) =>
    req("/utilizador/carrinho", {
      method: "POST",
      body: JSON.stringify({ produtoId, quantidade: qty }),
    }),
};

// ─── Normalizar item da wishlist ──────────────────────────────────────────────
// Backend devolve: { id, produtoId, produto: { ... } }
function normalizar(raw) {
  // Suporta tanto { id, produtoId, produto: {...} } como fallback { produto: {...} } ou o próprio produto
  const p = raw.produto ?? raw;
  const preco         = Number(p.preco ?? p.price ?? 0);
  const precoOriginal = p.precoOriginal ?? p.originalPrice ?? null;
  return {
    id:             raw.id ?? p.id,             // id do registo wishlist (para DELETE)
    produtoId:      raw.produtoId ?? p.id,       // id do produto (para carrinho/navegação)
    nome:           p.nome ?? p.name ?? "Produto",
    categoria:      p.categoria?.nome ?? p.category ?? "",
    preco,
    precoOriginal,
    rating:         Number(p.mediaAvaliacoes ?? p.rating ?? 0),
    reviews:        p.totalAvaliacoes ?? p.reviews ?? 0,
    comEntrega:     p.entregaDisponivel ?? p.hasDelivery ?? false,
    isNovo:         p.estadoItem === "NOVO" || p.isNew || false,
    badge:          p.destaque ? "Destaque" : (p.badge ?? null),
    img:            p.imagens?.[0] ?? p.img ?? "",
    vendedor: {
      nome:       p.vendedor?.nome ?? p.vendedor?.name ?? "Vendedor",
      iniciais:   (p.vendedor?.nome ?? p.vendedor?.name ?? "VV")
                    .split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase(),
      verificado: p.vendedor?.verificado ?? false,
    },
  };
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const VERDE       = "#00b96b";
const VERDE_ESC   = "#009a5a";
const VERDE_LIGHT = "#e6f9f0";

// ─── Componentes auxiliares ───────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center items-center py-32">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
    </div>
  );
}

function Btn({ children, onClick, variant = "solid", size = "md", fullWidth = false, disabled = false }) {
  const pad  = size === "sm" ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm";
  const w    = fullWidth ? "w-full" : "";
  const base = `${w} ${pad} flex items-center justify-center gap-2 font-semibold cursor-pointer transition-all border-none disabled:opacity-50`;
  const map = {
    solid:   { bg: VERDE,      hover: VERDE_ESC,   color: "#fff"                                    },
    outline: { bg: "white",    hover: VERDE_LIGHT,  color: VERDE,   border: `1.5px solid ${VERDE}`  },
    ghost:   { bg: "#f3f4f6",  hover: "#e5e7eb",   color: "#374151"                                 },
    danger:  { bg: "#fef2f2",  hover: "#fee2e2",   color: "#ef4444", border: "1.5px solid #fecaca"  },
  };
  const s = map[variant] || map.solid;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={base}
      style={{ background: s.bg, color: s.color, border: s.border || "none" }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = s.hover; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = s.bg;   }}
    >
      {children}
    </button>
  );
}

function Stars({ rating, size = 11 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
          stroke={i <= Math.round(rating) ? "#f59e0b" : "#d1d5db"} />
      ))}
    </span>
  );
}

function Pct({ original, preco }) {
  if (!original) return null;
  const d = Math.round((1 - preco / original) * 100);
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">
      -{d}%
    </span>
  );
}

// ─── Card de produto ──────────────────────────────────────────────────────────
function WishlistCard({ produto, onRemove, onAddCart, removendo }) {
  const navigate = useNavigate();
  const [adicionado, setAdicionado] = useState(false);

  async function addCart(e) {
    e.stopPropagation();
    setAdicionado(true);
    await onAddCart(produto.produtoId);
    setTimeout(() => setAdicionado(false), 2000);
  }

  return (
    <div
      onClick={() => navigate(`/produto/${produto.produtoId}`)}
      className="bg-white border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {produto.img ? (
          <img src={produto.img} alt={produto.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-gray-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {produto.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: produto.badge === "Destaque" ? "#3b82f6" : VERDE }}>
              {produto.badge}
            </span>
          )}
          {produto.isNovo && !produto.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: VERDE }}>
              Novo
            </span>
          )}
        </div>

        {/* Remover — usa produtoId para o DELETE /desejos/:produtoId */}
        <button
          onClick={e => { e.stopPropagation(); onRemove(produto.produtoId, produto.nome); }}
          disabled={removendo}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center cursor-pointer border-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:opacity-50"
          title="Remover dos desejos"
        >
          <Heart size={14} fill="#ef4444" stroke="#ef4444" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5 space-y-2.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{produto.categoria}</p>
        <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{produto.nome}</p>

        <div className="flex items-center gap-1.5">
          <Stars rating={produto.rating} />
          <span className="text-xs font-semibold text-gray-700">{produto.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({produto.reviews})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0"
            style={{ background: VERDE }}>
            {produto.vendedor.iniciais}
          </div>
          <span className="text-xs text-gray-500">{produto.vendedor.nome}</span>
          {produto.vendedor.verificado && <BadgeCheck size={11} style={{ color: VERDE }} />}
        </div>

        <div className="flex items-end gap-1.5 pt-0.5">
          <span className="text-base font-black text-gray-900">
            {produto.preco.toLocaleString("pt-MZ")}
            <span className="text-xs font-normal text-gray-400 ml-1">MZN</span>
          </span>
          {produto.precoOriginal && (
            <span className="text-xs text-gray-400 line-through mb-0.5">
              {produto.precoOriginal.toLocaleString("pt-MZ")}
            </span>
          )}
          <Pct original={produto.precoOriginal} preco={produto.preco} />
        </div>

        {produto.comEntrega && (
          <div className="flex items-center gap-1" style={{ color: VERDE }}>
            <Truck size={11} />
            <span className="text-[10px] font-semibold">Entrega disponível</span>
          </div>
        )}

        {/* Adicionar ao carrinho */}
        <div className="pt-1" onClick={e => e.stopPropagation()}>
          <Btn variant="solid" size="sm" fullWidth onClick={addCart}>
            {adicionado ? <><CheckCircle size={13} /> Adicionado!</> : <><ShoppingCart size={13} /> Adicionar</>}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Estado vazio ─────────────────────────────────────────────────────────────
function ListaVazia({ onExplorar }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: VERDE_LIGHT }}>
        <Heart size={32} style={{ color: VERDE }} />
      </div>
      <h2 className="text-xl font-black text-gray-900 mb-2">A sua lista está vazia</h2>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        Guarda os produtos que te interessam para os encontrar facilmente mais tarde.
      </p>
      <Btn onClick={onExplorar}><Package size={15} /> Explorar Produtos</Btn>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PaginaDesejos() {
  const navigate = useNavigate();

  const [items, setItems]           = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState(null);
  const [removendo, setRemovendo]   = useState(null); // produtoId do item em remoção
  const [pesquisa, setPesquisa]     = useState("");
  const [filtro, setFiltro]         = useState("Todos");
  const [toast, setToast]           = useState(null);

  // ── Carregar wishlist ──
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await api.listar();
      // Backend devolve { success: true, data: [ { id, produtoId, produto: {...} }, ... ] }
      const lista = res.success ? (res.data ?? res.dados) : (res.dados ?? res.data ?? []);
      setItems(Array.isArray(lista) ? lista.map(normalizar) : []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Remover item — passa produtoId ao backend ──
  async function remover(produtoId, nome) {
    setRemovendo(produtoId);
    try {
      await api.remover(produtoId);
      setItems(prev => prev.filter(p => p.produtoId !== produtoId));
      mostrarToast(`"${(nome ?? "Produto").slice(0, 28)}..." removido dos desejos`, "info");
    } catch {
      mostrarToast("Erro ao remover. Tenta novamente.", "erro");
    } finally {
      setRemovendo(null);
    }
  }

  // ── Limpar tudo ──
  async function limparTudo() {
    try {
      await api.limpar();
      setItems([]);
      mostrarToast("Lista de desejos limpa.", "info");
    } catch {
      // fallback: limpar localmente se o endpoint não existir ainda
      setItems([]);
      mostrarToast("Lista limpa.", "info");
    }
  }

  // ── Adicionar ao carrinho — passa produtoId directamente ──
  async function addCarrinho(produtoId) {
    try {
      await api.addCart(produtoId);
      mostrarToast("Produto adicionado ao carrinho!", "success");
    } catch {
      mostrarToast("Erro ao adicionar ao carrinho.", "erro");
    }
  }

  // ── Adicionar todos ao carrinho ──
  async function addTodos() {
    try {
      await Promise.all(items.map(p => api.addCart(p.produtoId)));
      mostrarToast("Todos os produtos adicionados ao carrinho!", "success");
    } catch {
      mostrarToast("Alguns produtos não puderam ser adicionados.", "erro");
    }
  }

  function mostrarToast(msg, tipo) {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Filtros locais ──
  const categorias = ["Todos", ...Array.from(new Set(items.map(p => p.categoria).filter(Boolean)))];

  const filtrados = items.filter(p => {
    const matchCat = filtro === "Todos" || p.categoria === filtro;
    const matchQ   = p.nome.toLowerCase().includes(pesquisa.toLowerCase());
    return matchCat && matchQ;
  });

  const totalPoupado = items.reduce((acc, p) =>
    acc + (p.precoOriginal ? p.precoOriginal - p.preco : 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        utilizadorAutenticado
        valorPesquisa=""
        aoMudarPesquisa={() => {}}
        aoClicarPesquisa={() => {}}
        aoClicarConta={() => {}}
        aoClicarCarteira={() => {}}
        aoClicarCarrinho={() => {}}
        aoClicarWishlist={() => {}}
        aoClicarNotificacoes={() => {}}
        aoClicarChat={() => {}}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center gap-1 text-xs text-gray-400">
          <button onClick={() => navigate("/")}
            className="hover:text-green-600 transition-colors border-none bg-transparent cursor-pointer">
            Início
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-700 font-medium">Lista de Desejos</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Voltar */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors border-none bg-transparent cursor-pointer">
          <ArrowLeft size={14} /> Voltar
        </button>

        {/* Cabeçalho */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Heart size={22} fill={VERDE} stroke={VERDE} />
              Lista de Desejos
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {carregando ? "A carregar..." : `${items.length} ${items.length === 1 ? "produto guardado" : "produtos guardados"}`}
              {!carregando && totalPoupado > 0 && (
                <span> · Poupança potencial:{" "}
                  <span className="font-semibold" style={{ color: VERDE }}>
                    {totalPoupado.toLocaleString("pt-MZ")} MZN
                  </span>
                </span>
              )}
            </p>
          </div>

          {!carregando && items.length > 0 && (
            <div className="flex gap-2">
              <Btn variant="ghost" size="sm" onClick={addTodos}>
                <ShoppingCart size={13} /> Adicionar todos
              </Btn>
              <Btn variant="danger" size="sm" onClick={limparTudo}>
                <Trash2 size={13} /> Limpar lista
              </Btn>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        {carregando ? (
          <Spinner />
        ) : erro ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <p className="text-red-500 text-sm font-medium">Erro ao carregar lista de desejos</p>
            <p className="text-gray-400 text-xs">{erro}</p>
            <Btn onClick={carregar}>Tentar novamente</Btn>
          </div>
        ) : items.length === 0 ? (
          <ListaVazia onExplorar={() => navigate("/")} />
        ) : (
          <>
            {/* Sumário */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Itens guardados",  valor: items.length },
                { label: "Com entrega",      valor: items.filter(p => p.comEntrega).length },
                { label: "Em desconto",      valor: items.filter(p => p.precoOriginal).length },
                { label: "Valor total",      valor: `${items.reduce((a, p) => a + p.preco, 0).toLocaleString("pt-MZ")} MZN` },
              ].map(({ label, valor }) => (
                <div key={label} className="bg-white border border-gray-100 p-3.5 text-center rounded-xl">
                  <p className="text-base font-black text-gray-900">{valor}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Filtros + pesquisa */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={pesquisa}
                  onChange={e => setPesquisa(e.target.value)}
                  placeholder="Pesquisar nos desejos..."
                  className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 bg-white outline-none focus:border-green-400 transition-colors rounded-xl"
                />
                {pesquisa && (
                  <button onClick={() => setPesquisa("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {categorias.map(cat => (
                  <button key={cat} onClick={() => setFiltro(cat)}
                    className="text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer border-none"
                    style={{
                      background: filtro === cat ? VERDE : "white",
                      color:      filtro === cat ? "white" : "#6b7280",
                      border:     filtro === cat ? "none" : "1px solid #e5e7eb",
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {filtrados.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtrados.map(p => (
                  <WishlistCard
                    key={p.produtoId}
                    produto={p}
                    onRemove={remover}
                    onAddCart={addCarrinho}
                    removendo={removendo === p.produtoId}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center text-gray-400">
                <Search size={32} className="mb-3 text-gray-200" />
                <p className="text-sm font-semibold text-gray-500">
                  Nenhum resultado para "{pesquisa}"
                </p>
                <p className="text-xs mt-1">Tenta outro termo ou limpa o filtro.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold z-50 transition-all"
          style={{
            background: toast.tipo === "success" ? VERDE : toast.tipo === "erro" ? "#ef4444" : "#1f2937",
            color: "white",
            minWidth: 240,
          }}
        >
          {toast.tipo === "success" ? <CheckCircle size={15} /> : <Heart size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}