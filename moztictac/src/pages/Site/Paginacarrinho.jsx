import { useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Lock,
  ChevronRight,
  Tag,
  Truck,
  CheckCircle,
} from "lucide-react";
import { Header } from "../../components/Header";

const VERDE = "#00b96b";
const VERDE_ESCURO = "#009a5a";

// ─── dados simulados ──────────────────────────────────────────────────────────
const itensIniciais = [
  {
    id: 1,
    nome: "Relógio Premium Swiss Made",
    vendedor: "João Machava",
    localidade: "Maputo",
    preco: 4200,
    quantidade: 1,
    estado: "Novo",
    entrega: true,
    img: null,
  },
  {
    id: 2,
    nome: "Perfume Importado 100ml",
    vendedor: "Loja Aroma",
    localidade: "Beira",
    preco: 1850,
    quantidade: 1,
    estado: "Novo",
    entrega: false,
    img: null,
  },
  {
    id: 3,
    nome: "Tênis Nike Air Max 2024",
    vendedor: "SportsMoz",
    localidade: "Nampula",
    preco: 3200,
    quantidade: 1,
    estado: "Novo",
    entrega: true,
    img: null,
  },
];

const METODOS_PAGAMENTO = [
  { id: "mpesa", rotulo: "M-Pesa", cor: "#00b96b" },
  { id: "emola", rotulo: "E-Mola", cor: "#ef4444" },
  { id: "mkesh", rotulo: "mKesh", cor: "#f59e0b" },
  { id: "visa", rotulo: "Visa/Banco", cor: "#3b82f6" },
];

const TAXA_PLATAFORMA = 0.05; // 5%

// ─── helpers ──────────────────────────────────────────────────────────────────
function BotaoVerde({
  children,
  onClick,
  variante = "solid",
  fullWidth = false,
}) {
  const base = `${fullWidth ? "w-full" : ""} flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-colors`;
  if (variante === "outline") {
    return (
      <button
        onClick={onClick}
        className={base}
        style={{
          border: `2px solid ${VERDE}`,
          color: VERDE,
          background: "white",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = VERDE;
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.color = VERDE;
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={base}
      style={{ background: VERDE, color: "white" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = VERDE_ESCURO)}
      onMouseLeave={(e) => (e.currentTarget.style.background = VERDE)}
    >
      {children}
    </button>
  );
}

function ImagemProduto() {
  return (
    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
      <ShoppingCart size={24} className="text-gray-300" />
    </div>
  );
}

// ─── componente item do carrinho ──────────────────────────────────────────────
function ItemCarrinho({ item, aoMudarQtd, aoRemover }) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
      <ImagemProduto />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {item.nome}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.vendedor} · {item.localidade}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#e6f9f0", color: VERDE }}
              >
                {item.estado}
              </span>
              {item.entrega && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
                  <Truck size={11} style={{ color: VERDE }} />
                  Entrega disponível
                </span>
              )}
            </div>
          </div>

          {/* remover */}
          <button
            onClick={() => aoRemover(item.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors shrink-0 border-none bg-transparent"
          >
            <Trash2 size={15} className="text-gray-400 hover:text-red-400" />
          </button>
        </div>

        {/* preço + quantidade */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-base font-black text-gray-900">
            {(item.preco * item.quantidade).toLocaleString("pt-MZ")}
            <span className="text-xs font-normal text-gray-400 ml-1">MZN</span>
          </p>

          <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => aoMudarQtd(item.id, item.quantidade - 1)}
              className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors border-none bg-white"
            >
              <Minus size={13} className="text-gray-600" />
            </button>
            <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
              {item.quantidade}
            </span>
            <button
              onClick={() => aoMudarQtd(item.id, item.quantidade + 1)}
              className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors border-none bg-white"
            >
              <Plus size={13} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── resumo do pedido ─────────────────────────────────────────────────────────
function ResumoPedido({ itens, metodoPagamento, aoMudarMetodo, aoFinalizar }) {
  const subtotal = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const taxa = Math.round(subtotal * TAXA_PLATAFORMA);
  const total = subtotal + taxa;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm sticky top-4">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Resumo do Pedido
      </h2>

      {/* linhas */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Subtotal ({itens.reduce((a, i) => a + i.quantidade, 0)}{" "}
            {itens.reduce((a, i) => a + i.quantidade, 0) === 1
              ? "item"
              : "itens"}
            )
          </span>
          <span className="font-medium text-gray-900">
            {subtotal.toLocaleString("pt-MZ")} MZN
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Taxa plataforma (5%)</span>
          <span className="font-medium text-red-500">
            {taxa.toLocaleString("pt-MZ")} MZN
          </span>
        </div>
        <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-bold text-gray-900">
          <span>Total</span>
          <span>{total.toLocaleString("pt-MZ")} MZN</span>
        </div>
      </div>

      {/* método de pagamento */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Método de Pagamento
        </p>
        <div className="space-y-2">
          {METODOS_PAGAMENTO.map((m) => (
            <button
              key={m.id}
              onClick={() => aoMudarMetodo(m.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-colors text-sm font-medium"
              style={{
                borderColor: metodoPagamento === m.id ? VERDE : "#e5e7eb",
                background: metodoPagamento === m.id ? "#f0fdf7" : "white",
                color: "#374151",
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: m.cor }}
                />
                {m.rotulo}
              </div>
              {metodoPagamento === m.id && (
                <CheckCircle size={15} style={{ color: VERDE }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* botão finalizar */}
      <BotaoVerde onClick={aoFinalizar} fullWidth>
        <Lock size={15} />
        Pagar com Segurança
      </BotaoVerde>

      {/* aviso escrow */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-3">
        <Lock size={11} />
        Venda Segura · Pagamento em Escrow
      </p>
    </div>
  );
}

// ─── estado vazio ─────────────────────────────────────────────────────────────
function CarrinhoVazio({ aoVoltar }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <ShoppingCart size={36} className="text-gray-300" />
      </div>
      <p className="text-lg font-bold text-gray-900 mb-1">
        O teu carrinho está vazio
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Adiciona produtos para continuar a compra.
      </p>
      <BotaoVerde onClick={aoVoltar}>Continuar a comprar</BotaoVerde>
    </div>
  );
}

// ─── página principal ─────────────────────────────────────────────────────────
export default function PaginaCarrinho() {
  const [itens, setItens] = useState(itensIniciais);
  const [metodoPagamento, setMetodo] = useState("mpesa");
  const [pesquisa, setPesquisa] = useState("");
  const [finalizado, setFinalizado] = useState(false);

  function aoMudarQtd(id, novaQtd) {
    if (novaQtd < 1) return aoRemover(id);
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantidade: novaQtd } : i)),
    );
  }

  function aoRemover(id) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  function aoFinalizar() {
    if (itens.length === 0) return;
    setFinalizado(true);
  }

  // ── confirmação de pagamento ──
  if (finalizado) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
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
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ background: "#e6f9f0" }}
          >
            <CheckCircle size={40} style={{ color: VERDE }} />
          </div>
          <p className="text-2xl font-black text-gray-900 mb-2">
            Pedido realizado!
          </p>
          <p className="text-sm text-gray-500 mb-1">
            O teu pagamento foi enviado com segurança.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            O valor ficará retido até confirmares a recepção.
          </p>
          <BotaoVerde
            onClick={() => {
              setFinalizado(false);
              setItens(itensIniciais);
            }}
          >
            Continuar a comprar
          </BotaoVerde>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <Header
        utilizadorAutenticado
        contagemCarrinho={itens.reduce((a, i) => a + i.quantidade, 0)}
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
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <button className="hover:text-green-600 cursor-pointer transition-colors">
            Início
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-semibold text-gray-900">O meu Carrinho</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* voltar */}
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 cursor-pointer transition-colors mb-5 border-none bg-transparent">
          <ArrowLeft size={15} />
          Continuar a comprar
        </button>

        {itens.length === 0 ? (
          <CarrinhoVazio aoVoltar={() => setItens(itensIniciais)} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* lista de itens */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-gray-900">
                  O meu Carrinho
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    ({itens.reduce((a, i) => a + i.quantidade, 0)}{" "}
                    {itens.reduce((a, i) => a + i.quantidade, 0) === 1
                      ? "item"
                      : "itens"}
                    )
                  </span>
                </h1>
                <button
                  onClick={() => setItens([])}
                  className="text-xs text-red-400 hover:text-red-600 cursor-pointer transition-colors border-none bg-transparent font-medium"
                >
                  Limpar tudo
                </button>
              </div>

              {/* aviso escrow */}
              <div
                className="flex items-start gap-2 p-3 rounded-xl text-xs text-gray-600"
                style={{ background: "#f0fdf7", border: `1px solid #bbf7d0` }}
              >
                <Lock
                  size={13}
                  style={{ color: VERDE }}
                  className="shrink-0 mt-0.5"
                />
                <p>
                  O pagamento fica <b>retido em escrow</b> e só é libertado ao
                  vendedor depois de confirmares a recepção.
                </p>
              </div>

              {/* itens */}
              {itens.map((item) => (
                <ItemCarrinho
                  key={item.id}
                  item={item}
                  aoMudarQtd={aoMudarQtd}
                  aoRemover={aoRemover}
                />
              ))}

              {/* cupão */}
              <div className="flex gap-2 p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2">
                  <Tag size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Código de desconto..."
                    className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                </div>
                <button
                  className="px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-colors border-none"
                  style={{ background: VERDE, color: "white" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = VERDE_ESCURO)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = VERDE)
                  }
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* resumo */}
            <div className="w-full lg:w-96 shrink-0">
              <ResumoPedido
                itens={itens}
                metodoPagamento={metodoPagamento}
                aoMudarMetodo={setMetodo}
                aoFinalizar={aoFinalizar}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
