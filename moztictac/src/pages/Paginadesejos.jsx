import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, Trash2, ShoppingCart, Share2, ChevronRight,
  Star, Truck, Package, ArrowLeft, BadgeCheck,
  SlidersHorizontal, Search, X, CheckCircle,
} from "lucide-react";
import { Header } from "../components/Header";

// ─── design tokens (idênticos à página de detalhe) ────────────────────────────
const VERDE       = "#00b96b";
const VERDE_ESC   = "#009a5a";
const VERDE_LIGHT = "#e6f9f0";

// ─── dados simulados ──────────────────────────────────────────────────────────
const WISHLIST_INICIAL = [
  {
    id: 1,
    nome: "Ténis Nike Air Max 2024",
    categoria: "Sapatos",
    preco: 3200,
    precoOriginal: 4500,
    rating: 4.7,
    reviews: 54,
    comEntrega: true,
    isNovo: true,
    vendedor: { nome: "SportZone MZ", iniciais: "SZ", verificado: true },
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    badge: "Destaque",
  },
  {
    id: 2,
    nome: "Perfume Importado Chanel Nº5",
    categoria: "Acessórios",
    preco: 1850,
    precoOriginal: 2400,
    rating: 4.6,
    reviews: 86,
    comEntrega: true,
    isNovo: false,
    vendedor: { nome: "Luxury Imports", iniciais: "LI", verificado: true },
    img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80",
    badge: null,
  },
  {
    id: 3,
    nome: "Auscultadores Sony WH-1000XM5",
    categoria: "Electrónicos",
    preco: 19500,
    precoOriginal: null,
    rating: 4.9,
    reviews: 178,
    comEntrega: true,
    isNovo: true,
    vendedor: { nome: "TechStore MZ", iniciais: "TS", verificado: false },
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    badge: "Novo",
  },
  {
    id: 4,
    nome: "Capulana Bordada Artesanal",
    categoria: "Roupa",
    preco: 450,
    precoOriginal: 650,
    rating: 4.9,
    reviews: 201,
    comEntrega: false,
    isNovo: false,
    vendedor: { nome: "Arte Moçambique", iniciais: "AM", verificado: true },
    img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80",
    badge: null,
  },
  {
    id: 5,
    nome: "Conjunto de Cabelo Brasileiro",
    categoria: "Cabelos",
    preco: 4200,
    precoOriginal: null,
    rating: 4.5,
    reviews: 93,
    comEntrega: true,
    isNovo: true,
    vendedor: { nome: "Beauty MZ", iniciais: "BM", verificado: false },
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    badge: null,
  },
  {
    id: 6,
    nome: "Relógio Premium Estilo Suíço",
    categoria: "Acessórios",
    preco: 4200,
    precoOriginal: 5800,
    rating: 4.8,
    reviews: 124,
    comEntrega: true,
    isNovo: false,
    vendedor: { nome: "TimeZone MZ", iniciais: "TZ", verificado: true },
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    badge: "Destaque",
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "solid", size = "md", fullWidth = false }) {
  const pad  = size === "sm" ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm";
  const w    = fullWidth ? "w-full" : "";
  const base = `${w} ${pad} flex items-center justify-center gap-2 font-semibold  cursor-pointer transition-all border-none`;

  const map = {
    solid:   { bg: VERDE,     hover: VERDE_ESC,  color: "#fff" },
    outline: { bg: "white",   hover: VERDE_LIGHT, color: VERDE,   border: `1.5px solid ${VERDE}` },
    ghost:   { bg: "#f3f4f6", hover: "#e5e7eb",  color: "#374151" },
    danger:  { bg: "#fef2f2", hover: "#fee2e2",  color: "#ef4444", border: "1.5px solid #fecaca" },
  };
  const s = map[variant] || map.solid;

  return (
    <button onClick={onClick} className={base}
      style={{ background: s.bg, color: s.color, border: s.border || "none" }}
      onMouseEnter={e => { e.currentTarget.style.background = s.hover; }}
      onMouseLeave={e => { e.currentTarget.style.background = s.bg; }}>
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
          stroke={i <= Math.round(rating) ? "#f59e0b" : "#d1d5db"}
        />
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

// ─── card de produto na wishlist ──────────────────────────────────────────────
function WishlistCard({ produto, onRemove, onAddCart }) {
  const [adicionado, setAdicionado] = useState(false);

  function addCart(e) {
    e.stopPropagation();
    setAdicionado(true);
    onAddCart(produto.id);
    setTimeout(() => setAdicionado(false), 2000);
  }

  return (
    <div className="bg-white  border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow duration-200">

      {/* imagem */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {produto.img
          ? <img src={produto.img} alt={produto.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={48} className="text-gray-200" /></div>
        }

        {/* badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {produto.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: produto.badge === "Destaque" ? "#3b82f6" : VERDE }}>
              {produto.badge}
            </span>
          )}
          {produto.isNovo && !produto.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: VERDE }}>
              Novo
            </span>
          )}
        </div>

        {/* remover */}
        <button onClick={e => { e.stopPropagation(); onRemove(produto.id); }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center cursor-pointer border-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
          title="Remover dos desejos">
          <Heart size={14} fill="#ef4444" stroke="#ef4444" />
        </button>
      </div>

      {/* info */}
      <div className="p-3.5 space-y-2.5">

        {/* categoria */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{produto.categoria}</p>

        {/* nome */}
        <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{produto.nome}</p>

        {/* rating */}
        <div className="flex items-center gap-1.5">
          <Stars rating={produto.rating} />
          <span className="text-xs font-semibold text-gray-700">{produto.rating}</span>
          <span className="text-xs text-gray-400">({produto.reviews})</span>
        </div>

        {/* vendedor */}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0"
            style={{ background: VERDE }}>
            {produto.vendedor.iniciais}
          </div>
          <span className="text-xs text-gray-500">{produto.vendedor.nome}</span>
          {produto.vendedor.verificado && <BadgeCheck size={11} style={{ color: VERDE }} />}
        </div>

        {/* preço */}
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

        {/* entrega */}
        {produto.comEntrega && (
          <div className="flex items-center gap-1" style={{ color: VERDE }}>
            <Truck size={11} />
            <span className="text-[10px] font-semibold">Entrega disponível</span>
          </div>
        )}

        {/* acções */}
        <div className="flex gap-2 pt-1">
          {/* <Btn variant="solid" size="sm" fullWidth onClick={addCart}>
            {adicionado ? <CheckCircle size={13} /> : <ShoppingCart size={13} />}
            {adicionado ? "Adicionado!" : "Adicionar"}
          </Btn> */}
          {/* <button onClick={e => { e.stopPropagation(); onRemove(produto.id); }}
            className="w-9 h-9 flex items-center justify-center  border border-gray-200 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors bg-white"
            title="Remover">
            <Trash2 size={13} className="text-gray-400 hover:text-red-400" />
          </button> */}
        </div>
      </div>
    </div>
  );
}

// ─── estado vazio ─────────────────────────────────────────────────────────────
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
      <Btn onClick={onExplorar}>
        <Package size={15} /> Explorar Produtos
      </Btn>
    </div>
  );
}

// ─── página principal ─────────────────────────────────────────────────────────
export default function PaginaDesejos() {
  const navigate = useNavigate();

  const [items, setItems]       = useState(WISHLIST_INICIAL);
  const [pesquisa, setPesquisa] = useState("");
  const [filtro, setFiltro]     = useState("Todos");
  const [toast, setToast]       = useState(null);

  const categorias = ["Todos", ...Array.from(new Set(WISHLIST_INICIAL.map(p => p.categoria)))];

  function remover(id) {
    const nome = items.find(p => p.id === id)?.nome;
    setItems(prev => prev.filter(p => p.id !== id));
    mostrarToast(`"${nome?.slice(0, 28)}..." removido dos desejos`, "info");
  }

  function addCarrinho(id) {
    mostrarToast("Produto adicionado ao carrinho!", "success");
  }

  function limparTudo() {
    setItems([]);
    mostrarToast("Lista de desejos limpa.", "info");
  }

  function mostrarToast(msg, tipo) {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  }

  const filtrados = items.filter(p => {
    const matchCat = filtro === "Todos" || p.categoria === filtro;
    const matchQ   = p.nome.toLowerCase().includes(pesquisa.toLowerCase());
    return matchCat && matchQ;
  });

  const totalPoupado = items.reduce((acc, p) => acc + (p.precoOriginal ? p.precoOriginal - p.preco : 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">

      <Header
        utilizadorAutenticado
        valorPesquisa=""
        aoMudarPesquisa={() => {}} aoClicarPesquisa={() => {}} aoClicarConta={() => {}}
        aoClicarCarteira={() => {}} aoClicarCarrinho={() => {}} aoClicarWishlist={() => {}}
        aoClicarNotificacoes={() => {}} aoClicarChat={() => {}}
      />

      {/* breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center gap-1 text-xs text-gray-400">
          <button onClick={() => navigate("/")} className="hover:text-green-600 transition-colors border-none bg-transparent cursor-pointer">Início</button>
          <ChevronRight size={11} />
          <span className="text-gray-700 font-medium">Lista de Desejos</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* voltar */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors border-none bg-transparent cursor-pointer">
          <ArrowLeft size={14} /> Voltar
        </button>

        {/* cabeçalho da página */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Heart size={22} fill={VERDE} stroke={VERDE} />
              Lista de Desejos
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {items.length} {items.length === 1 ? "produto guardado" : "produtos guardados"}
              {totalPoupado > 0 && (
                <span> · Poupança potencial:{" "}
                  <span className="font-semibold" style={{ color: VERDE }}>
                    {totalPoupado.toLocaleString("pt-MZ")} MZN
                  </span>
                </span>
              )}
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex gap-2">
              <Btn variant="ghost" size="sm" onClick={() => {
                items.forEach(p => addCarrinho(p.id));
                mostrarToast("Todos os produtos adicionados ao carrinho!", "success");
              }}>
                <ShoppingCart size={13} /> Adicionar todos
              </Btn>
              <Btn variant="danger" size="sm" onClick={limparTudo}>
                <Trash2 size={13} /> Limpar lista
              </Btn>
            </div>
          )}
        </div>

        {/* sumário rápido (só com itens) */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Itens guardados", valor: items.length },
              { label: "Com entrega",     valor: items.filter(p => p.comEntrega).length },
              { label: "Em desconto",     valor: items.filter(p => p.precoOriginal).length },
              { label: "Valor total",     valor: `${items.reduce((a, p) => a + p.preco, 0).toLocaleString("pt-MZ")} MZN` },
            ].map(({ label, valor }) => (
              <div key={label} className="bg-white  border border-gray-100 p-3.5 text-center">
                <p className="text-base font-black text-gray-900">{valor}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <>
            {/* filtros + pesquisa */}
            <div className="flex flex-wrap items-center gap-3">

              {/* pesquisa */}
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={pesquisa}
                  onChange={e => setPesquisa(e.target.value)}
                  placeholder="Pesquisar nos desejos..."
                  className="w-full pl-9 pr-9 py-2.5 text-sm  border border-gray-200 bg-white outline-none focus:border-green-400 transition-colors"
                />
                {pesquisa && (
                  <button onClick={() => setPesquisa("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* tabs de categoria */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {categorias.map(cat => (
                  <button key={cat} onClick={() => setFiltro(cat)}
                    className="text-xs font-semibold px-3 py-2  transition-all cursor-pointer border-none"
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

            {/* grid de produtos */}
            {filtrados.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtrados.map(p => (
                  <WishlistCard key={p.id} produto={p} onRemove={remover} onAddCart={addCarrinho} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center text-gray-400">
                <Search size={32} className="mb-3 text-gray-200" />
                <p className="text-sm font-semibold text-gray-500">Nenhum resultado para "{pesquisa}"</p>
                <p className="text-xs mt-1">Tenta outro termo ou limpa o filtro.</p>
              </div>
            )}
          </>
        )}

        {/* estado vazio */}
        {items.length === 0 && (
          <ListaVazia onExplorar={() => navigate("/")} />
        )}

      </div>

      {/* toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-3  shadow-lg text-sm font-semibold z-50 transition-all"
          style={{
            background: toast.tipo === "success" ? VERDE : "#1f2937",
            color: "white",
            minWidth: 240,
          }}>
          {toast.tipo === "success" ? <CheckCircle size={15} /> : <Heart size={15} />}
          {toast.msg}
        </div>
      )}

    </div>
  );
}