import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Heart, ShoppingCart, Bell, MessageCircle,
  Wallet, Search, Store, Share2, History, Lock,
  LogOut, ShoppingBag, ChevronRight, Menu, X,
} from "lucide-react";

const VERDE        = "#00b96b";
const VERDE_ESCURO = "#007a47";
const VERDE_DIM    = "#f0fdf4";

const CATEGORIAS = [
  { label: "Roupa" }, { label: "Celulares" }, { label: "Cabelos" },
  { label: "Sapatos" }, { label: "Electrónicos" }, { label: "Acessórios" },
  { label: "Alimentos" }, { label: "Serviços" }, { label: "Outros" },
];

const utilizadorMock = {
  nome: "João Matos", email: "joao@gmail.com",
  avatar: "JM", nivel: "Ouro", nivelIcon: "🥇",
  saldo: "4 200 MZN", vendas: 312, avaliacao: 4.9,
};

const MENUS_DROPDOWN = [
  {
    grupo: "Conta",
    itens: [
      { id: "perfil",   Icone: User,       rotulo: "Meu Perfil",       cor: "#3b82f6" },
      { id: "carteira", Icone: Wallet,      rotulo: "Carteira Digital",  cor: VERDE, badge: "4.2k MZN" },
    ],
  },
  {
    grupo: "Actividade",
    itens: [
      { id: "compras",   Icone: ShoppingBag, rotulo: "Minhas Compras", cor: "#f59e0b", badge: "3" },
      { id: "vendas",    Icone: Store,        rotulo: "Minhas Vendas",  cor: "#8b5cf6" },
      { id: "afiliados", Icone: Share2,       rotulo: "Afiliados",      cor: "#ec4899" },
      { id: "historico", Icone: History,      rotulo: "Histórico",      cor: "#64748b" },
    ],
  },
  {
    grupo: "Sistema",
    itens: [
      { id: "notificacoes", Icone: Bell, rotulo: "Notificações", cor: "#f59e0b", badge: "5" },
      { id: "seguranca",    Icone: Lock, rotulo: "Segurança",    cor: "#ef4444" },
    ],
  },
];

/* ── Dropdown conta (desktop) ── */
function DropdownConta({ visivel, utilizador, aoSelecionar, aoSair, onMouseEnter, onMouseLeave }) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute", top: "calc(100% + 8px)", right: -8,
        width: 220, borderRadius: 12, background: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)",
        zIndex: 999,
        opacity: visivel ? 1 : 0,
        transform: visivel ? "translateY(0)" : "translateY(-6px)",
        pointerEvents: visivel ? "all" : "none",
        transition: "opacity 0.15s ease, transform 0.15s ease",
        overflow: "hidden",
        fontFamily: "Manrope, sans-serif",
      }}
    >
      {/* Nome */}
      <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid #f3f4f6" }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#111827", margin: 0 }}>
          {utilizador.nome}
        </p>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
          {utilizador.email}
        </p>
      </div>

      {/* Grupos de itens */}
      {MENUS_DROPDOWN.map((grupo, gi) => (
        <div key={grupo.grupo}>
          <p style={{
            padding: "8px 16px 2px",
            fontSize: 9, fontWeight: 800, color: "#9ca3af",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {grupo.grupo}
          </p>
          {grupo.itens.map(({ id, Icone: Ic, rotulo, cor, badge }) => (
            <button
              key={id}
              onClick={() => aoSelecionar(id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "8px 16px", background: "transparent", border: "none",
                cursor: "pointer", textAlign: "left", transition: "background .1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Ic size={14} color="#6b7280" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: "#374151", fontWeight: 500 }}>
                {rotulo}
              </span>
              {badge && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: "1px 7px", borderRadius: 99,
                  background: `${VERDE}15`, color: VERDE,
                }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
          {gi < MENUS_DROPDOWN.length - 1 && (
            <div style={{ height: 1, background: "#f3f4f6", margin: "4px 0" }} />
          )}
        </div>
      ))}

      {/* Logout */}
      <div style={{ borderTop: "1px solid #f3f4f6", padding: "4px 0 4px" }}>
        <button
          onClick={aoSair}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "8px 16px", background: "transparent", border: "none",
            cursor: "pointer", textAlign: "left", transition: "background .1s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fff1f1"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <LogOut size={14} color="#ef4444" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>
            Sair da Conta
          </span>
        </button>
      </div>
    </div>
  );
}

/* ── BotaoAccao ── */
function BotaoAccao({ icone, rotulo, aoClicar, contagem = 0, corBadge }) {
  return (
    <button
      onClick={aoClicar}
      className="relative flex flex-col items-center text-xs text-gray-600 hover:text-green-600 transition gap-0.5 bg-transparent border-none cursor-pointer px-1.5 sm:px-2 py-1 rounded"
    >
      {icone}
      <span className="hidden lg:inline text-[10px]">{rotulo}</span>
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

/* ── Drawer mobile ── */
function DrawerMobile({ open, onClose, utilizador, aoSelecionar, aoSair, aoClicarPesquisa, valorPesquisa, aoMudarPesquisa }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-all duration-300 md:hidden"
        style={{
          background: "rgba(0,0,0,0.45)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          backdropFilter: open ? "blur(2px)" : "none",
        }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 md:hidden flex flex-col"
        style={{
          width: "min(320px, 90vw)",
          background: "#fff",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.15)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Header drawer */}
        <div
          className="flex items-center justify-between px-4 py-4 shrink-0"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${VERDE}, ${VERDE_ESCURO})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 900,
            }}>
              {utilizador.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{utilizador.nome}</p>
              <p className="text-[10px] text-gray-400">{utilizador.nivel} {utilizador.nivelIcon}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Pesquisa mobile */}
        <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-green-400 transition-colors">
            <input
              type="text"
              placeholder="Pesquisar..."
              value={valorPesquisa}
              onChange={(e) => aoMudarPesquisa?.(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { aoClicarPesquisa?.(); onClose(); } }}
              className="flex-1 px-3 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            />
            <button
              onClick={() => { aoClicarPesquisa?.(); onClose(); }}
              className="px-3 flex items-center justify-center text-white"
              style={{ background: VERDE }}
            >
              <Search size={15} />
            </button>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Saldo",     valor: "4.2k",                    cor: VERDE },
              { label: "Vendas",    valor: utilizador.vendas,          cor: "#3b82f6" },
              { label: "Avaliação", valor: `${utilizador.avaliacao}★`, cor: "#f59e0b" },
            ].map(({ label, valor, cor }) => (
              <div key={label} className="text-center py-2 rounded-xl" style={{ background: "#f8fafc" }}>
                <p className="text-sm font-black" style={{ color: cor }}>{valor}</p>
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menus */}
        <div className="flex-1 overflow-y-auto py-2">
          {MENUS_DROPDOWN.map((grupo, gi) => (
            <div key={grupo.grupo}>
              <p className="px-4 pt-3 pb-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                {grupo.grupo}
              </p>
              {grupo.itens.map(({ id, Icone: Ic, rotulo, cor, badge }) => (
                <button
                  key={id}
                  onClick={() => { aoSelecionar(id); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cor + "15" }}>
                    <Ic size={14} style={{ color: cor }} />
                  </div>
                  <span className="flex-1 text-left">{rotulo}</span>
                  {badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${VERDE}15`, color: VERDE }}>
                      {badge}
                    </span>
                  )}
                  <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
                </button>
              ))}
              {gi < MENUS_DROPDOWN.length - 1 && (
                <div className="mx-4 mt-2" style={{ height: "1px", background: "#f1f5f9" }} />
              )}
            </div>
          ))}
        </div>

        {/* Sair */}
        <div className="shrink-0 p-4" style={{ borderTop: "1px solid #fee2e2", background: "#fffbfb" }}>
          <button
            onClick={() => { aoSair(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 flex-shrink-0">
              <LogOut size={14} color="#ef4444" />
            </div>
            Sair da Conta
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Header ── */
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
  utilizadorAutenticado = false,
  utilizador = utilizadorMock,
  aoNavegar,
}) {
  const navigate = useNavigate();
  const [contaAberta, setContaAberta]   = useState(false);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [pesquisaMobile, setPesquisaMobile] = useState(false);
  const timerRef = useRef(null);

  /* ── Helpers hover com delay para não fechar ao mover mouse ── */
  const abrirConta  = () => { clearTimeout(timerRef.current); setContaAberta(true); };
  const fecharConta = () => { timerRef.current = setTimeout(() => setContaAberta(false), 300); };

  /* ── Navegar para secção da conta ── */
  const aoSelecionar = (id) => {
    setContaAberta(false);
    clearTimeout(timerRef.current);
    if (aoNavegar) {
      aoNavegar(id);
    } else {
      navigate("/minha-conta", { state: { seccao: id } });
    }
  };

  /* ── Logout ── */
  const aoSair = () => {
    setContaAberta(false);
    clearTimeout(timerRef.current);
    navigate("/");
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1450px] mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4 h-14 sm:h-16">

            {/* LOGO */}
            <Link to="/" className="text-lg sm:text-[22px] font-black text-gray-900 tracking-tight shrink-0 select-none no-underline">
              MozTicTac<span style={{ color: VERDE }}>.</span>
            </Link>

            {/* PESQUISA — desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl border border-gray-200 rounded-xl overflow-hidden focus-within:border-green-400 focus-within:shadow-sm transition-all">
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={valorPesquisa}
                onChange={(e) => aoMudarPesquisa?.(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && aoClicarPesquisa?.()}
                className="flex-1 px-4 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400"
              />
              <select className="border-l border-gray-200 px-2 text-xs text-gray-500 bg-gray-50 outline-none cursor-pointer hidden lg:block">
                <option>Todas as Categorias</option>
                {CATEGORIAS.map((c) => <option key={c.label}>{c.label}</option>)}
              </select>
              <button
                onClick={aoClicarPesquisa}
                className="px-4 text-white flex items-center justify-center transition-all"
                style={{ background: VERDE }}
                onMouseEnter={e => e.currentTarget.style.background = VERDE_ESCURO}
                onMouseLeave={e => e.currentTarget.style.background = VERDE}
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* PESQUISA — ícone mobile */}
            <button
              onClick={() => setPesquisaMobile(v => !v)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50 transition border-none bg-transparent cursor-pointer"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            {/* AÇÕES — desktop */}
            <div className="hidden md:flex items-center gap-0.5 ml-auto">

              {/* Conta + Dropdown */}
              <div
                style={{ position: "relative" }}
                onMouseEnter={abrirConta}
                onMouseLeave={fecharConta}
              >
                <button
                  onClick={() => aoSelecionar("perfil")}
                  className="relative flex flex-col items-center text-xs gap-0.5 px-2 py-1 rounded-lg cursor-pointer border-none transition-all duration-200"
                  style={{
                    color:      contaAberta ? VERDE : "#4b5563",
                    background: contaAberta ? VERDE_DIM : "transparent",
                  }}
                >
                  <User
                    size={20}
                    strokeWidth={1.5}
                    style={{ color: contaAberta ? VERDE : "currentColor", transition: "color 0.15s" }}
                  />
                  <span className="hidden lg:inline font-semibold" style={{ fontSize: 10 }}>Conta</span>
                </button>

                <DropdownConta
                  visivel={contaAberta}
                  utilizador={utilizador}
                  aoSelecionar={aoSelecionar}
                  aoSair={aoSair}
                  onMouseEnter={abrirConta}
                  onMouseLeave={fecharConta}
                />
              </div>

              {utilizadorAutenticado && (
                <BotaoAccao
                  icone={<Wallet size={20} strokeWidth={1.5} />}
                  rotulo="Carteira"
                  aoClicar={() => aoSelecionar("carteira")}
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
                aoClicar={() => aoSelecionar("notificacoes")}
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

            {/* AÇÕES — mobile (carrinho + menu) */}
            <div className="md:hidden flex items-center gap-1 ml-auto">
              <BotaoAccao
                icone={<ShoppingCart size={20} strokeWidth={1.5} />}
                rotulo=""
                aoClicar={() => navigate("/carrinho")}
                contagem={contagemCarrinho}
                corBadge={VERDE}
              />
              <button
                onClick={() => setDrawerAberto(true)}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-600 hover:text-green-600 hover:bg-green-50 transition border-none bg-transparent cursor-pointer relative"
              >
                <Menu size={20} />
                {(contagemNotificacoes + contagemMensagens) > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
                )}
              </button>
            </div>

          </div>

          {/* PESQUISA expandida — mobile */}
          <div
            className="md:hidden overflow-hidden transition-all duration-300"
            style={{ maxHeight: pesquisaMobile ? "60px" : "0px", opacity: pesquisaMobile ? 1 : 0 }}
          >
            <div className="pb-3">
              <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-green-400 transition-colors">
                <input
                  type="text"
                  placeholder="Pesquisar produtos..."
                  value={valorPesquisa}
                  onChange={(e) => aoMudarPesquisa?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      aoClicarPesquisa?.();
                      setPesquisaMobile(false);
                    }
                  }}
                  className="flex-1 px-3 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400"
                  autoFocus={pesquisaMobile}
                />
                <button
                  onClick={() => { aoClicarPesquisa?.(); setPesquisaMobile(false); }}
                  className="px-3 flex items-center text-white"
                  style={{ background: VERDE }}
                >
                  <Search size={15} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Drawer mobile */}
      <DrawerMobile
        open={drawerAberto}
        onClose={() => setDrawerAberto(false)}
        utilizador={utilizador}
        aoSelecionar={aoSelecionar}
        aoSair={aoSair}
        valorPesquisa={valorPesquisa}
        aoMudarPesquisa={aoMudarPesquisa}
        aoClicarPesquisa={aoClicarPesquisa}
      />

      <style>{`
        @keyframes ping-once {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </>
  );
}