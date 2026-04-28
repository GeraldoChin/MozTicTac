import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Truck, Package,
  Heart, Share2, ShoppingCart, MessageCircle,
  ChevronRight, CheckCircle, Copy, Minus, Plus,
  Shield, Tag, Store, ThumbsUp, BadgeCheck,
} from "lucide-react";
import { Cabecalho } from "../../components/Cabecalho";
import { ALL_PRODUCTS } from "../../components/FashionProducts";

const VERDE        = "#00b96b";
const VERDE_ESCURO = "#009a5a";
const VERDE_LIGHT  = "#e6f9f0";

const vendedorPadrao = {
  nome: "João Machava",
  iniciais: "JM",
  cidade: "Maputo",
  avaliacao: 4.8,
  totalAvaliacoes: 89,
  totalVendas: 214,
  membro: "Jan 2023",
};

const avaliacoesPadrao = [
  { id: 1, autor: "Maria S.",  nota: 5, comentario: "Produto excelente, chegou rápido e bem embalado.",      data: "01/04/2026" },
  { id: 2, autor: "Carlos M.", nota: 5, comentario: "Qualidade muito boa, recomendo a todos.",               data: "28/03/2026" },
  { id: 3, autor: "Fátima A.", nota: 4, comentario: "Bonito mas a pulseira podia ser um pouco mais grossa.", data: "20/03/2026" },
];

function Btn({ children, onClick, variant = "solid", size = "md", fullWidth = false }) {
  const pad  = size === "sm" ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm";
  const w    = fullWidth ? "w-full" : "";
  const base = `${w} ${pad} flex items-center justify-center gap-2 font-semibold rounded-xl cursor-pointer transition-all border-none`;
  const styles = {
    solid:   { bg: VERDE,     hover: VERDE_ESCURO, color: "#fff" },
    outline: { bg: "white",   hover: VERDE_LIGHT,  color: VERDE,    border: `1.5px solid ${VERDE}` },
    orange:  { bg: "#f97316", hover: "#ea6c0a",    color: "#fff" },
    ghost:   { bg: "#f3f4f6", hover: "#e5e7eb",    color: "#374151" },
  };
  const s = styles[variant] || styles.solid;
  return (
    <button onClick={onClick} className={base}
      style={{ background: s.bg, color: s.color, border: s.border || "none" }}
      onMouseEnter={e => { e.currentTarget.style.background = s.hover; }}
      onMouseLeave={e => { e.currentTarget.style.background = s.bg; }}>
      {children}
    </button>
  );
}

function Stars({ rating, size = 13 }) {
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

function Gallery({ img, name }) {
  const [active, setActive] = useState(0);
  const thumbs = [img, img, img];
  return (
    <div className="space-y-3 lg:sticky lg:top-4">
      <div className="w-full aspect-square rounded-2xl bg-gray-100 overflow-hidden">
        {img
          ? <img src={img} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={72} className="text-gray-300" /></div>}
      </div>
      <div className="flex gap-2">
        {thumbs.map((src, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0"
            style={{ borderColor: active === i ? VERDE : "transparent" }}>
            {src ? <img src={src} alt="" className="w-full h-full object-cover" />
                 : <Package size={22} className="text-gray-300" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function Reviews({ reviews, avg, total }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-xl">
        <div className="text-center shrink-0">
          <p className="text-4xl font-black text-gray-900 leading-none">{avg}</p>
          <Stars rating={avg} size={13} />
          <p className="text-xs text-gray-400 mt-1">{total} avaliações</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(n => {
            const pct = n === 5 ? 78 : n === 4 ? 15 : n === 3 ? 5 : n === 2 ? 1 : 1;
            return (
              <div key={n} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-2">{n}</span>
                <Star size={9} fill="#f59e0b" stroke="#f59e0b" />
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#f59e0b" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="p-4 rounded-xl border border-gray-100">
            <div className="flex items-start sm:items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500 flex-shrink-0">
                  {r.autor[0]}
                </div>
                <span className="text-sm font-semibold text-gray-900">{r.autor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stars rating={r.nota} size={11} />
                <span className="text-xs text-gray-400">{r.data}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{r.comentario}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PaginaProdutoDetalhe() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const raw = ALL_PRODUCTS.find(p => p.id === Number(id));

  if (!raw) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <p className="text-lg font-bold text-gray-700">Produto não encontrado</p>
      <Btn onClick={() => navigate("/")}><ArrowLeft size={14} /> Voltar à loja</Btn>
    </div>
  );

  const p = {
    id:              raw.id,
    nome:            raw.name,
    categoria:       raw.category,
    estado:          raw.isNew ? "Novo" : "Usado",
    preco:           raw.price,
    precoOriginal:   raw.originalPrice,
    desconto:        raw.originalPrice ? Math.round((1 - raw.price / raw.originalPrice) * 100) : null,
    media:           raw.rating,
    totalAvaliacoes: raw.reviews,
    totalVendidos:   Math.floor(raw.reviews * 0.3),
    stock:           12,
    comEntrega:      raw.hasDelivery,
    afiliado:        raw.hasAffiliate,
    afiliadoPct:     raw.affiliatePct,
    pagamentos:      ["M-Pesa", "E-Mola", "mKesh", "Visa"],
    img:             raw.img,
    vendedor:        vendedorPadrao,
    avaliacoes:      avaliacoesPadrao,
  };

  const [qty, setQty]               = useState(1);
  const [wishlist, setWishlist]     = useState(false);
  const [link, setLink]             = useState(null);
  const [copiado, setCopiado]       = useState(false);
  const [adicionado, setAdicionado] = useState(false);
  const [pesquisa, setPesquisa]     = useState("");

  function gerarLink() { setLink(`moztictac.mz/p/${p.id}?ref=ANA82KP9XBTU`); }
  function copiar()    { setCopiado(true); setTimeout(() => setCopiado(false), 2000); }
  function addCart()   { setAdicionado(true); setTimeout(() => setAdicionado(false), 2000); }

  /* navegar para chat com produto */
  function contactarVendedor() {
    navigate("/chat", { state: { productId: p.id } });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Cabecalho
        utilizadorAutenticado
        valorPesquisa={pesquisa}
        aoMudarPesquisa={setPesquisa}
        aoClicarPesquisa={() => {}} aoClicarConta={() => {}} aoClicarCarteira={() => {}}
        aoClicarCarrinho={() => {}} aoClicarWishlist={() => {}} aoClicarNotificacoes={() => {}}
        aoClicarChat={() => navigate("/chat")}
      />

      {/* breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center gap-1 text-xs text-gray-400 flex-wrap">
          <button onClick={() => navigate("/")} className="hover:text-green-600 transition-colors border-none bg-transparent cursor-pointer">Início</button>
          <ChevronRight size={11} />
          <button className="hover:text-green-600 transition-colors border-none bg-transparent cursor-pointer">{p.categoria}</button>
          <ChevronRight size={11} />
          <span className="text-gray-700 font-medium truncate max-w-[150px] sm:max-w-[200px]">{p.nome}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">

        {/* voltar */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors border-none bg-transparent cursor-pointer">
          <ArrowLeft size={14} /> Voltar
        </button>

        {/* ── grid principal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* galeria */}
          <Gallery img={p.img} name={p.nome} />

          {/* info principal */}
          <div className="space-y-4 sm:space-y-5">

            {/* categoria + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{p.categoria}</span>
              <span className="text-gray-200">·</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: VERDE_LIGHT, color: VERDE }}>{p.estado}</span>
              {p.comEntrega && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  <Truck size={10} /> Entrega
                </span>
              )}
            </div>

            {/* nome */}
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">{p.nome}</h1>

            {/* rating */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Stars rating={p.media} size={14} />
              <span className="text-sm font-bold text-gray-800">{p.media}</span>
              <span className="text-sm text-gray-400">({p.totalAvaliacoes})</span>
              <span className="text-gray-200 hidden sm:inline">·</span>
              <span className="text-sm text-gray-400 hidden sm:inline">{p.totalVendidos} vendidos</span>
            </div>

            {/* preço */}
            <div className="py-3 sm:py-4 border-y border-gray-100">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">
                  {p.preco.toLocaleString("pt-MZ")} <span className="text-base font-normal text-gray-400">MZN</span>
                </span>
                {p.precoOriginal && (
                  <span className="text-sm text-gray-400 line-through mb-0.5">
                    {p.precoOriginal.toLocaleString("pt-MZ")} MZN
                  </span>
                )}
                {p.desconto && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                    -{p.desconto}%
                  </span>
                )}
              </div>
            </div>

            {/* vendedor compacto */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ background: VERDE }}>
                  {p.vendedor.iniciais}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1 truncate">
                    {p.vendedor.nome}
                    <BadgeCheck size={13} style={{ color: VERDE }} />
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                    <MapPin size={10} /> {p.vendedor.cidade} · {p.vendedor.totalVendas} vendas
                  </p>
                </div>
              </div>
              <Btn variant="outline" size="sm" onClick={contactarVendedor}>
                <MessageCircle size={13} />
                <span className="hidden sm:inline">Contactar</span>
              </Btn>
            </div>

            {/* quantidade + métodos de pagamento */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">Quantidade</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 cursor-pointer border-none bg-white">
                    <Minus size={12} className="text-gray-600" />
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-sm font-bold border-x border-gray-200">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(p.stock, q + 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 cursor-pointer border-none bg-white">
                    <Plus size={12} className="text-gray-600" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">{p.stock} em stock</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {p.pagamentos.map(pg => (
                  <span key={pg} className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 bg-white">
                    {pg}
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs principais */}
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <button onClick={addCart}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm cursor-pointer border-none transition-all active:scale-95"
                style={{ background: adicionado ? "#16a34a" : VERDE }}>
                {adicionado ? <><CheckCircle size={15} /> Adicionado!</> : <><ShoppingCart size={15} /> Adicionar ao Carrinho</>}
              </button>

              {p.afiliado && (
                <button onClick={gerarLink}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white text-sm cursor-pointer border-none transition-all active:scale-95"
                  style={{ background: "#f97316" }}>
                  <Share2 size={14} />
                  <span className="hidden sm:inline">Afiliar</span> ({p.afiliadoPct}%)
                </button>
              )}

              <button onClick={() => setWishlist(w => !w)}
                className="w-11 h-11 flex items-center justify-center rounded-xl border-2 transition-colors cursor-pointer flex-shrink-0"
                style={{ borderColor: wishlist ? "#ef4444" : "#e5e7eb", background: wishlist ? "#fef2f2" : "white" }}>
                <Heart size={17} fill={wishlist ? "#ef4444" : "none"} stroke={wishlist ? "#ef4444" : "#9ca3af"} />
              </button>
            </div>

            {/* Botão contactar vendedor standalone (mobile destacado) */}
            <button onClick={contactarVendedor}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer border-none transition-all active:scale-95 sm:hidden"
              style={{ background: VERDE_LIGHT, color: VERDE }}>
              <MessageCircle size={15} /> Contactar Vendedor
            </button>

            {/* link afiliado */}
            {link && (
              <div className="p-3 rounded-xl border border-orange-100 bg-orange-50">
                <p className="text-xs font-bold text-orange-500 mb-2">Link de Afiliado</p>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-orange-100">
                  <span className="text-xs font-mono text-gray-500 flex-1 truncate">{link}</span>
                  <button onClick={copiar} className="text-xs font-semibold text-orange-500 flex items-center gap-1 border-none bg-transparent cursor-pointer shrink-0">
                    <Copy size={11} /> {copiado ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
            )}

            {/* escrow */}
            <div className="flex items-start sm:items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-100">
              <Shield size={14} style={{ color: VERDE }} className="shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs text-gray-600">
                <b className="text-gray-800">Compra protegida por escrow</b> — o dinheiro só é libertado ao vendedor após confirmares a recepção.
              </p>
            </div>
          </div>
        </div>

        {/* ── secção inferior ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* detalhes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Detalhes do Produto</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Categoria",  p.categoria],
                ["Estado",     p.estado],
                ["Stock",      `${p.stock} un.`],
                ["Vendidos",   `${p.totalVendidos} un.`],
                ["Entrega",    p.comEntrega ? "Disponível" : "Não disponível"],
                ["Afiliados",  p.afiliado ? `Sim · ${p.afiliadoPct}%` : "Não"],
              ].map(([label, valor]) => (
                <div key={label} className="flex flex-col p-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase mb-1">{label}</span>
                  <span className="text-xs font-bold text-gray-800">{valor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* avaliações */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Avaliações</h2>
            <Reviews reviews={p.avaliacoes} avg={p.media} total={p.totalAvaliacoes} />
          </div>
        </div>

        {/* ── vendedor rodapé ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-base shrink-0"
                style={{ background: VERDE }}>
                {p.vendedor.iniciais}
              </div>
              <div>
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  {p.vendedor.nome} <BadgeCheck size={14} style={{ color: VERDE }} />
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  <MapPin size={10} className="inline mr-0.5" />
                  {p.vendedor.cidade} · Membro desde {p.vendedor.membro}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Stars rating={p.vendedor.avaliacao} size={11} />
                  <span className="text-xs text-gray-500">{p.vendedor.avaliacao} ({p.vendedor.totalAvaliacoes})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-8">
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">{p.vendedor.totalVendas}</p>
                <p className="text-xs text-gray-400">Vendas</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">{p.vendedor.totalAvaliacoes}</p>
                <p className="text-xs text-gray-400">Avaliações</p>
              </div>
              <Btn variant="outline" size="sm" onClick={contactarVendedor}>
                <MessageCircle size={13} /> Contactar
              </Btn>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}