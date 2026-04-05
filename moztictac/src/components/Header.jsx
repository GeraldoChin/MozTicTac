import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Heart,
  ShoppingCart,
  Bell,
  MessageCircle,
  Wallet,
  Search
} from "lucide-react";

const VERDE = "#00b96b";

const CATEGORIAS = [
  { label: "Roupa" },
  { label: "Celulares" },
  { label: "Cabelos" },
  { label: "Sapatos" },
  { label: "Electrónicos" },
  { label: "Acessórios" },
  { label: "Alimentos" },
  { label: "Serviços" },
  { label: "Outros" },
];

export function Header({
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
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">

        {/* LOGO (com Link) */}
        <Link
          to="/"
          className="text-[22px] font-black text-gray-900 tracking-tight shrink-0 cursor-pointer select-none"
        >
          MozTicTac<span style={{ color: VERDE }}>.</span>
        </Link>

        {/* PESQUISA */}
        <div className="flex flex-1 max-w-2xl border border-gray-300 rounded overflow-hidden focus-within:border-green-500 transition-colors">
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={valorPesquisa}
            onChange={(e) => aoMudarPesquisa?.(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && aoClicarPesquisa?.()}
            className="flex-1 px-3 py-2 text-sm outline-none text-gray-700 placeholder-gray-400"
          />

          <select className="border-l border-gray-300 px-2 text-xs text-gray-600 bg-white outline-none cursor-pointer">
            <option>Todas as Categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c.label}>{c.label}</option>
            ))}
          </select>

          <button
            onClick={aoClicarPesquisa}
            className="px-4 text-white flex items-center justify-center"
            style={{ background: VERDE }}
          >
            <Search size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* AÇÕES */}
        <div className="flex items-center gap-1 ml-auto">

          <BotaoAccao
            icone={<User size={20} strokeWidth={1.5} />}
            rotulo="Conta"
            aoClicar={() => navigate("/minha-conta")}
          />

          {utilizadorAutenticado && (
            <BotaoAccao
              icone={<Wallet size={20} strokeWidth={1.5} />}
              rotulo="Carteira"
              aoClicar={() => navigate("/carteira")}
            />
          )}

          <BotaoAccao
            icone={<Heart size={20} strokeWidth={1.5} />}
            rotulo="Desejos"
            aoClicar={() => navigate("/desejos")}
            contagem={contagemWishlist}
            corBadge={VERDE}
          />

          <BotaoAccao
            icone={<MessageCircle size={20} strokeWidth={1.5} />}
            rotulo="Chat"
            aoClicar={() => navigate("/chat")}
            contagem={contagemMensagens}
            corBadge={VERDE}
          />

          <BotaoAccao
            icone={<Bell size={20} strokeWidth={1.5} />}
            rotulo="Avisos"
            aoClicar={() => navigate("/notificacoes")}
            contagem={contagemNotificacoes}
            corBadge="#e53e3e"
          />

          <BotaoAccao
            icone={<ShoppingCart size={20} strokeWidth={1.5} />}
            rotulo="Carrinho"
            aoClicar={() => navigate("/carrinho")}
            contagem={contagemCarrinho}
            corBadge={VERDE}
          />

        </div>

      </div>
    </header>
  );
}

/* BOTÃO REUTILIZÁVEL */
function BotaoAccao({
  icone,
  rotulo,
  aoClicar,
  contagem = 0,
  corBadge
}) {
  return (
    <button
      onClick={aoClicar}
      className="relative flex flex-col items-center text-xs text-gray-600 hover:text-green-600 transition gap-0.5 bg-transparent border-none cursor-pointer px-2 py-1 rounded"
    >
      {icone}

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