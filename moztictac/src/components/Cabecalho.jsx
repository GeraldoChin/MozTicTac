import {
  Search,
  User,
  Wallet,
  Heart,
  MessageCircle,
  Bell,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";

const VERDE = "#00b96b";
const VERDE_ESCURO = "#009a5a";

const CATEGORIAS = [
  "Roupa",
  "Celulares",
  "Cabelos",
  "Sapatos",
  "Electrónicos",
  "Acessórios",
  "Alimentos",
  "Serviços",
  "Outros",
];

/**
 * Cabecalho — logo, barra de pesquisa e acções do utilizador.
 *
 * Props:
 *   contagemCarrinho      {number}
 *   contagemWishlist      {number}
 *   contagemNotificacoes  {number}
 *   contagemMensagens     {number}
 *   valorPesquisa         {string}
 *   aoMudarPesquisa       {fn}
 *   aoClicarPesquisa      {fn}
 *   aoClicarCarrinho      {fn}
 *   aoClicarWishlist      {fn}
 *   aoClicarNotificacoes  {fn}
 *   aoClicarChat          {fn}
 *   aoClicarConta         {fn}
 *   aoClicarCarteira      {fn}
 *   utilizadorAutenticado {boolean}
 */
export function Cabecalho({
  contagemCarrinho = 0,
  contagemWishlist = 0,
  contagemNotificacoes = 0,
  contagemMensagens = 0,
  valorPesquisa = "",
  aoMudarPesquisa,
  aoClicarPesquisa,
  aoClicarCarrinho,
  aoClicarWishlist,
  aoClicarNotificacoes,
  aoClicarChat,
  aoClicarConta,
  aoClicarCarteira,
  utilizadorAutenticado = false,
}) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm p-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        {/* Logo */}
        <div
          className="text-[22px] font-black text-gray-900 tracking-tight shrink-0 cursor-pointer select-none"
          onClick={() => (window.location.href = "/")}
        >
          MozTicTac<span style={{ color: VERDE }}>.</span>
        </div>

        {/* Barra de pesquisa */}
        <div className="flex flex-1 max-w-2xl border border-gray-300 rounded-lg overflow-hidden focus-within:border-green-500 transition-colors">
          <input
            type="text"
            placeholder="Pesquisar produtos, serviços, categorias, SKU..."
            value={valorPesquisa}
            onChange={(e) => aoMudarPesquisa?.(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && aoClicarPesquisa?.()}
            className="flex-1 px-3 py-2 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
          <div className="flex items-center border-l border-gray-300 bg-white pr-1">
            <select className="px-2 text-xs text-gray-600 bg-transparent outline-none cursor-pointer h-full">
              <option>Todas as Categorias</option>
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="text-gray-400 pointer-events-none"
            />
          </div>
          <button
            onClick={aoClicarPesquisa}
            className="px-4 text-white border-none cursor-pointer transition-colors flex items-center"
            style={{ background: VERDE }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = VERDE_ESCURO)
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = VERDE)}
            aria-label="Pesquisar"
          >
            <Search size={16} />
          </button>
        </div>

        {/* Acções */}
        <div className="flex items-center gap-1 ml-auto">
          <BotaoAccao
            Icone={User}
            rotulo="Conta"
            aoClicar={aoClicarConta}
            ariaLabel="Minha Conta"
          />

          {utilizadorAutenticado && (
            <BotaoAccao
              Icone={Wallet}
              rotulo="Carteira"
              aoClicar={aoClicarCarteira}
              ariaLabel="Carteira Digital"
            />
          )}

          <BotaoAccao
            Icone={Heart}
            rotulo="Desejos"
            aoClicar={aoClicarWishlist}
            ariaLabel="Lista de Desejos"
            contagem={contagemWishlist}
            corBadge={VERDE}
          />
          <BotaoAccao
            Icone={MessageCircle}
            rotulo="Chat"
            aoClicar={aoClicarChat}
            ariaLabel="Mensagens"
            contagem={contagemMensagens}
            corBadge={VERDE}
          />
          <BotaoAccao
            Icone={Bell}
            rotulo="Avisos"
            aoClicar={aoClicarNotificacoes}
            ariaLabel="Notificações"
            contagem={contagemNotificacoes}
            corBadge="#e53e3e"
          />
          <BotaoAccao
            Icone={ShoppingCart}
            rotulo="Carrinho"
            aoClicar={aoClicarCarrinho}
            ariaLabel="Carrinho"
            contagem={contagemCarrinho}
            corBadge={VERDE}
          />
        </div>
      </div>
    </header>
  );
}

// ─── helper interno ────────────────────────────────────────────────────────────
function BotaoAccao({
  Icone,
  rotulo,
  aoClicar,
  ariaLabel,
  contagem = 0,
  corBadge,
}) {
  return (
    <button
      onClick={aoClicar}
      className="relative flex flex-col items-center text-xs text-gray-600 hover:text-green-600 transition gap-0.5 bg-transparent border-none cursor-pointer px-2 py-1 rounded"
      aria-label={ariaLabel}
    >
      <Icone size={20} />
      <span className="hidden sm:inline">{rotulo}</span>
      {contagem > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[16px] h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white px-0.5"
          style={{ background: corBadge }}
        >
          {contagem > 99 ? "99+" : contagem}
        </span>
      )}
    </button>
  );
}
