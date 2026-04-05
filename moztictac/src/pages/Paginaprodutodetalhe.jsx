import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Truck, Package,
  Heart, Share2, ShoppingCart, MessageCircle,
  ChevronRight, CheckCircle, Copy, Minus, Plus,
  Shield, BarChart2, Tag, Store, ThumbsUp,
} from "lucide-react";
import { Cabecalho } from "../components/Cabecalho";
import { ALL_PRODUCTS } from "../components/FashionProducts";

const VERDE        = "#00b96b";
const VERDE_ESCURO = "#009a5a";

// ─── dados simulados do vendedor (reutilizados para todos os produtos) ────────
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

// ─── helpers ──────────────────────────────────────────────────────────────────
function BotaoVerde({ children, onClick, variante = "solid", fullWidth = false, tamanho = "md" }) {
  const pad  = tamanho === "sm" ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm";
  const base = `${fullWidth ? "w-full" : ""} ${pad} flex items-center justify-center gap-2 font-semibold rounded-xl cursor-pointer transition-colors border-none`;
  if (variante === "outline") {
    return (
      <button onClick={onClick} className={base}
        style={{ border: `2px solid ${VERDE}`, color: VERDE, background: "white" }}
        onMouseEnter={e => { e.currentTarget.style.background = VERDE; e.currentTarget.style.color = "white"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = VERDE; }}>
        {children}
      </button>
    );
  }
  if (variante === "laranja") {
    return (
      <button onClick={onClick} className={base}
        style={{ background: "#f97316", color: "white" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#ea6c0a")}
        onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}>
        {children}
      </button>
    );
  }
  if (variante === "azul") {
    return (
      <button onClick={onClick} className={base}
        style={{ background: "#3b82f6", color: "white" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#2563eb")}
        onMouseLeave={e => (e.currentTarget.style.background = "#3b82f6")}>
        {children}
      </button>
    );
  }
  return (
    <button onClick={onClick} className={base}
      style={{ background: VERDE, color: "white" }}
      onMouseEnter={e => (e.currentTarget.style.background = VERDE_ESCURO)}
      onMouseLeave={e => (e.currentTarget.style.background = VERDE)}>
      {children}
    </button>
  );
}

function Estrelas({ nota, tamanho = 14 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={tamanho}
          fill={i <= Math.round(nota) ? "#f59e0b" : "none"}
          stroke={i <= Math.round(nota) ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </span>
  );
}

function Badge({ texto, cor = "verde" }) {
  const cores = {
    verde:   { bg: "#e6f9f0", text: VERDE     },
    azul:    { bg: "#e3f0ff", text: "#3b82f6" },
    laranja: { bg: "#fff7ed", text: "#f97316" },
    cinza:   { bg: "#f3f4f6", text: "#6b7280" },
  };
  const c = cores[cor] || cores.cinza;
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.text }}>
      {texto}
    </span>
  );
}

// ─── galeria de imagens ───────────────────────────────────────────────────────
function Galeria({ img, nome }) {
  const [activa, setActiva] = useState(0);

  // Gera 3 variações da mesma imagem como thumbnails
  const imagens = [img, img, img];

  return (
    <div className="space-y-3">
      {/* imagem principal */}
      <div className="w-full aspect-square rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
        {img ? (
          <img src={img} alt={nome} className="w-full h-full object-cover" />
        ) : (
          <Package size={72} className="text-gray-300" />
        )}
      </div>

      {/* thumbnails */}
      <div className="flex gap-2">
        {imagens.map((src, i) => (
          <button key={i} onClick={() => setActiva(i)}
            className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer transition-all border-2 overflow-hidden"
            style={{ borderColor: activa === i ? VERDE : "transparent" }}>
            {src ? (
              <img src={src} alt="" className="w-full h-full object-cover" />
            ) : (
              <Package size={24} className="text-gray-300" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── painel de informações do vendedor ───────────────────────────────────────
function CartaoVendedor({ vendedor, aoContactar }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
          style={{ background: VERDE }}>
          {vendedor.iniciais}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{vendedor.nome}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin size={11} className="text-gray-400" />
            <span className="text-xs text-gray-500">{vendedor.cidade}</span>
            <span className="text-gray-300">·</span>
            <Estrelas nota={vendedor.avaliacao} tamanho={11} />
            <span className="text-xs text-gray-500">{vendedor.avaliacao} ({vendedor.totalAvaliacoes})</span>
          </div>
        </div>
      </div>
      <BotaoVerde variante="outline" tamanho="sm" onClick={aoContactar}>
        <MessageCircle size={13} />
        Contactar
      </BotaoVerde>
    </div>
  );
}

// ─── secção de avaliações ─────────────────────────────────────────────────────
function Avaliacoes({ avaliacoes, media, total }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-black text-gray-900">{media}</p>
          <Estrelas nota={media} />
          <p className="text-xs text-gray-400 mt-1">{total} avaliações</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map(n => {
            const pct = n === 5 ? 78 : n === 4 ? 15 : n === 3 ? 5 : n === 2 ? 1 : 1;
            return (
              <div key={n} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-2">{n}</span>
                <Star size={10} fill="#f59e0b" stroke="#f59e0b" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#f59e0b" }} />
                </div>
                <span className="text-xs text-gray-400 w-6">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {avaliacoes.map(a => (
          <div key={a.id} className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600">
                  {a.autor[0]}
                </div>
                <p className="text-sm font-semibold text-gray-900">{a.autor}</p>
              </div>
              <div className="flex items-center gap-2">
                <Estrelas nota={a.nota} tamanho={12} />
                <span className="text-xs text-gray-400">{a.data}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{a.comentario}</p>
            <button className="flex items-center gap-1 text-xs text-gray-400 mt-2 cursor-pointer hover:text-gray-600 transition-colors border-none bg-transparent">
              <ThumbsUp size={11} /> Útil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── página principal ─────────────────────────────────────────────────────────
export default function PaginaProdutoDetalhe() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  // Busca o produto pelo id da URL
  const produtoRaw = ALL_PRODUCTS.find((p) => p.id === Number(id));

  // Se o produto não existir, mostra mensagem
  if (!produtoRaw) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-gray-700">Produto não encontrado</p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white border-none cursor-pointer"
          style={{ background: VERDE }}
        >
          <ArrowLeft size={15} />
          Voltar à loja
        </button>
      </div>
    );
  }

  // Mapeia os campos do produto do card para o formato da página de detalhe
  const produto = {
    id:                   produtoRaw.id,
    nome:                 produtoRaw.name,
    descricao:            `${produtoRaw.name} — produto de alta qualidade disponível em ${produtoRaw.city}, ${produtoRaw.province}. Categoria: ${produtoRaw.category}. Estado: ${produtoRaw.isNew ? "Novo" : "Usado"}.`,
    categoria:            produtoRaw.category,
    estado:               produtoRaw.isNew ? "Novo" : "Usado",
    preco:                produtoRaw.price,
    precoOriginal:        produtoRaw.originalPrice,
    taxaPlataforma:       0.05,
    avaliacaoMedia:       produtoRaw.rating,
    totalAvaliacoes:      produtoRaw.reviews,
    totalVendas:          Math.floor(produtoRaw.reviews * 0.3),
    stockDisponivel:      12,
    entregaDisponivel:    produtoRaw.hasDelivery,
    atacadoDisponivel:    produtoRaw.price > 1000,
    atacadoMinimo:        5,
    atacadoPreco:         Math.round(produtoRaw.price * 0.9),
    aceitaAfiliados:      produtoRaw.hasAffiliate,
    percentagemAfiliado:  produtoRaw.affiliatePct,
    formasPagamento:      ["M-Pesa", "E-Mola", "mKesh", "Visa"],
    destaque:             produtoRaw.badge === "Anúncio",
    img:                  produtoRaw.img,
    vendedor:             vendedorPadrao,
    avaliacoes:           avaliacoesPadrao,
  };

  const [quantidade, setQuantidade]     = useState(1);
  const [noWishlist, setNoWishlist]     = useState(false);
  const [linkAfiliado, setLinkAfiliado] = useState(null);
  const [copiado, setCopiado]           = useState(false);
  const [pesquisa, setPesquisa]         = useState("");
  const [adicionado, setAdicionado]     = useState(false);

  const taxaPlataforma = Math.round(produto.preco * produto.taxaPlataforma);
  const vendedorRecebe = produto.preco - taxaPlataforma;

  function aoGerarAfiliado() {
    setLinkAfiliado(`moztictac.mz/p/${produto.id}?ref=ANA82KP9XBTU`);
  }

  function aoCopiar() {
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function aoAdicionarCarrinho() {
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* header */}
      <Cabecalho
        utilizadorAutenticado
        valorPesquisa={pesquisa}
        aoMudarPesquisa={setPesquisa}
        aoClicarPesquisa={() => {}}
        aoClicarConta={() => {}}
        aoClicarCarteira={() => {}}
        aoClicarCarrinho={() => {}}
        aoClicarWishlist={() => {}}
        aoClicarNotificacoes={() => {}}
        aoClicarChat={() => {}}
      />

      {/* breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <button
            onClick={() => navigate("/")}
            className="hover:text-green-600 cursor-pointer transition-colors border-none bg-transparent"
          >
            Início
          </button>
          <ChevronRight size={13} className="text-gray-400" />
          <button className="hover:text-green-600 cursor-pointer transition-colors border-none bg-transparent">
            {produto.categoria}
          </button>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="font-semibold text-gray-900 truncate max-w-xs">{produto.nome}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* voltar */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 cursor-pointer transition-colors mb-5 border-none bg-transparent"
        >
          <ArrowLeft size={15} />
          Voltar à loja
        </button>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── coluna esquerda: galeria ── */}
          <div className="lg:w-[420px] shrink-0">
            <Galeria img={produto.img} nome={produto.nome} />
          </div>

          {/* ── coluna direita: detalhe ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* badges */}
            <div className="flex flex-wrap gap-2">
              <Badge texto={produto.categoria} cor="cinza" />
              <Badge texto={produto.estado} cor="verde" />
              {produto.destaque       && <Badge texto="Anúncio Destaque" cor="azul"    />}
              {produto.aceitaAfiliados && <Badge texto="Aceita Afiliados" cor="laranja" />}
            </div>

            {/* nome */}
            <h1 className="text-2xl font-black text-gray-900 leading-tight">{produto.nome}</h1>

            {/* avaliação */}
            <div className="flex items-center gap-2">
              <Estrelas nota={produto.avaliacaoMedia} />
              <span className="text-sm font-semibold text-gray-700">{produto.avaliacaoMedia}</span>
              <span className="text-sm text-gray-400">
                ({produto.totalAvaliacoes} avaliações · {produto.totalVendas} vendidos)
              </span>
            </div>

            {/* vendedor */}
            <CartaoVendedor vendedor={produto.vendedor} aoContactar={() => {}} />

            {/* preço */}
            <div>
              <p className="text-4xl font-black text-gray-900">
                {produto.preco.toLocaleString("pt-MZ")}
                <span className="text-lg font-normal text-gray-400 ml-2">MZN</span>
              </p>
              {produto.precoOriginal && (
                <p className="text-sm text-gray-400 line-through mt-0.5">
                  {produto.precoOriginal.toLocaleString("pt-MZ")} MZN
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Preço inclui taxa de 5% da plataforma · Vendedor recebe{" "}
                <span className="font-semibold" style={{ color: VERDE }}>
                  {vendedorRecebe.toLocaleString("pt-MZ")} MZN
                </span>
              </p>
            </div>

            {/* atacado */}
            {produto.atacadoDisponivel && (
              <div className="flex items-start gap-2 p-3 rounded-xl border"
                style={{ background: "#fff7ed", borderColor: "#fed7aa" }}>
                <Tag size={15} style={{ color: "#f97316" }} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold" style={{ color: "#f97316" }}>Preço de Atacado disponível</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Mínimo <b>{produto.atacadoMinimo} unidades</b> →{" "}
                    <span className="font-bold" style={{ color: "#f97316" }}>
                      {produto.atacadoPreco.toLocaleString("pt-MZ")} MZN
                    </span>{" "}
                    por unidade
                  </p>
                </div>
              </div>
            )}

            {/* formas de pagamento */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pagamentos aceites por este vendedor</p>
              <div className="flex flex-wrap gap-2">
                {produto.formasPagamento.map(p => (
                  <span key={p} className="text-xs font-semibold px-3 py-1 rounded-full border border-gray-200 text-gray-600 bg-white">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* quantidade + entrega */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-700 mr-2">Quantidade</span>
                <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center cursor-pointer hover:bg-gray-50 border-none bg-white">
                    <Minus size={13} className="text-gray-600" />
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-sm font-bold border-x border-gray-200">
                    {quantidade}
                  </span>
                  <button onClick={() => setQuantidade(q => Math.min(produto.stockDisponivel, q + 1))}
                    className="w-9 h-9 flex items-center justify-center cursor-pointer hover:bg-gray-50 border-none bg-white">
                    <Plus size={13} className="text-gray-600" />
                  </button>
                </div>
                <span className="text-xs text-gray-400 ml-2">{produto.stockDisponivel} disponíveis</span>
              </div>

              {produto.entregaDisponivel && (
                <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: VERDE }}>
                  <Truck size={15} />
                  Entrega disponível
                </span>
              )}
            </div>

            {/* botões de acção */}
            <div className="flex flex-wrap gap-3">
              <BotaoVerde onClick={aoAdicionarCarrinho}>
                {adicionado ? <CheckCircle size={16} /> : <ShoppingCart size={16} />}
                {adicionado ? "Adicionado!" : "Adicionar ao Carrinho"}
              </BotaoVerde>

              <BotaoVerde variante="azul">
                <MessageCircle size={15} />
                Contactar
              </BotaoVerde>

              {produto.aceitaAfiliados && (
                <BotaoVerde variante="laranja" onClick={aoGerarAfiliado}>
                  <Share2 size={15} />
                  Afiliar
                </BotaoVerde>
              )}

              <button
                onClick={() => setNoWishlist(w => !w)}
                className="w-11 h-11 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-colors"
                style={{
                  borderColor: noWishlist ? "#ef4444" : "#e5e7eb",
                  background:  noWishlist ? "#fef2f2" : "white",
                }}>
                <Heart size={18} fill={noWishlist ? "#ef4444" : "none"} stroke={noWishlist ? "#ef4444" : "#9ca3af"} />
              </button>
            </div>

            {/* link de afiliado gerado */}
            {linkAfiliado && (
              <div className="p-4 rounded-xl border" style={{ background: "#fff7ed", borderColor: "#fed7aa" }}>
                <p className="text-sm font-bold mb-2" style={{ color: "#f97316" }}>Link de Afiliado gerado</p>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-orange-100">
                  <p className="text-xs text-gray-500 font-mono flex-1 truncate">{linkAfiliado}</p>
                  <button onClick={aoCopiar}
                    className="flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0 border-none bg-transparent"
                    style={{ color: "#f97316" }}>
                    <Copy size={12} />
                    {copiado ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Ganhas <b>{produto.percentagemAfiliado}%</b> por cada venda gerada com este link.
                </p>
              </div>
            )}

            {/* segurança */}
            <div className="flex items-start gap-2 p-3 rounded-xl"
              style={{ background: "#f0fdf7", border: `1px solid #bbf7d0` }}>
              <Shield size={15} style={{ color: VERDE }} className="shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                <b className="text-gray-800">Compra protegida por escrow.</b> O teu dinheiro fica retido e só é libertado ao vendedor depois de confirmares a recepção.
              </p>
            </div>

          </div>
        </div>

        {/* ── secção inferior: descrição + avaliações ── */}
        <div className="mt-10 flex flex-col lg:flex-row gap-8">

          {/* descrição */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={16} style={{ color: VERDE }} />
              Descrição do Produto
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-sm text-gray-600 leading-relaxed">{produto.descricao}</p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                {[
                  { label: "Categoria",  valor: produto.categoria               },
                  { label: "Estado",     valor: produto.estado                  },
                  { label: "Stock",      valor: `${produto.stockDisponivel} un.` },
                  { label: "Vendidos",   valor: `${produto.totalVendas} un.`    },
                  { label: "Entrega",    valor: produto.entregaDisponivel ? "Sim" : "Não" },
                  { label: "Afiliados",  valor: produto.aceitaAfiliados ? `Sim (${produto.percentagemAfiliado}%)` : "Não" },
                ].map(({ label, valor }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
                    <span className="text-xs font-bold text-gray-800">{valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* avaliações */}
          <div className="lg:w-[420px] shrink-0">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Star size={16} style={{ color: "#f59e0b" }} />
              Avaliações dos Compradores
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <Avaliacoes
                avaliacoes={produto.avaliacoes}
                media={produto.avaliacaoMedia}
                total={produto.totalAvaliacoes}
              />
            </div>
          </div>

        </div>

        {/* info vendedor no fundo */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Store size={16} style={{ color: VERDE }} />
            Sobre o Vendedor
          </h2>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black"
                style={{ background: VERDE }}>
                {produto.vendedor.iniciais}
              </div>
              <div>
                <p className="font-bold text-gray-900">{produto.vendedor.nome}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {produto.vendedor.cidade} · Membro desde {produto.vendedor.membro}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Estrelas nota={produto.vendedor.avaliacao} tamanho={12} />
                  <span className="text-xs text-gray-500">
                    {produto.vendedor.avaliacao} ({produto.vendedor.totalAvaliacoes})
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              {[
                { Icone: BarChart2,   valor: produto.vendedor.totalVendas,     label: "Vendas"     },
                { Icone: CheckCircle, valor: produto.vendedor.totalAvaliacoes,  label: "Avaliações" },
              ].map(({ Icone, valor, label }) => (
                <div key={label} className="text-center">
                  <Icone size={18} style={{ color: VERDE }} className="mx-auto mb-1" />
                  <p className="text-base font-black text-gray-900">{valor}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
            <div className="ml-auto">
              <BotaoVerde variante="outline" tamanho="sm">
                <MessageCircle size={13} />
                Contactar Vendedor
              </BotaoVerde>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}