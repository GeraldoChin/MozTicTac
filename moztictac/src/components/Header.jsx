import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Heart, ShoppingCart, Bell, MessageCircle,
  Wallet, Search, Store, Share2, History, Lock,
  LogOut, ShoppingBag, ChevronRight, Star, TrendingUp,
} from "lucide-react";

const VERDE       = "#00b96b";
const VERDE_ESCURO = "#007a47";
const VERDE_DIM   = "#f0fdf4";

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

// ─── id = chave do SECCOES em MinhaConta ─────────────────────────────────────
const MENUS_DROPDOWN = [
  {
    grupo: "Conta",
    itens: [
      { id: "perfil",   Icone: User,       rotulo: "Meu Perfil",      cor: "#3b82f6" },
      { id: "carteira", Icone: Wallet,      rotulo: "Carteira Digital", cor: VERDE, badge: "4.2k MZN" },
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

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function DropdownConta({ visivel, utilizador, aoSelecionar, aoSair }) {
  return (
    <>
      {/* Triângulo */}
      <div style={{
        position: "absolute", top: "calc(100% + 4px)", left: "50%",
        transform: "translateX(-50%)", width: 0, height: 0,
        borderLeft: "7px solid transparent", borderRight: "7px solid transparent",
        borderBottom: "7px solid #fff",
        filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.06))",
        opacity: visivel ? 1 : 0, transition: "opacity 0.18s ease",
        pointerEvents: "none", zIndex: 1000,
      }} />

      {/* Painel */}
      <div style={{
        position: "absolute", top: "calc(100% + 10px)", right: -8, width: 300,
        borderRadius: 18, background: "#fff",
        boxShadow: "0 24px 64px rgba(0,0,0,0.13), 0 4px 16px rgba(0,185,107,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
        zIndex: 999,
        opacity: visivel ? 1 : 0,
        transform: visivel ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.96)",
        pointerEvents: visivel ? "all" : "none",
        transition: "opacity 0.22s cubic-bezier(.4,0,.2,1), transform 0.22s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
      }}>

        {/* Cabeçalho dark */}
        <div style={{
          background: "linear-gradient(140deg, #0d1f16 0%, #112b1e 60%, #0f2318 100%)",
          padding: "20px 18px 16px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, opacity: 0.07,
            backgroundImage: "radial-gradient(circle, #00b96b 1px, transparent 1px)",
            backgroundSize: "18px 18px", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: -30, right: -20, width: 120, height: 120,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${VERDE}40 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          {/* Avatar + info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, position: "relative" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: `linear-gradient(135deg, ${VERDE} 0%, ${VERDE_ESCURO} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 900, color: "#fff",
                boxShadow: `0 4px 16px ${VERDE}60`,
                border: "2px solid rgba(255,255,255,0.15)",
              }}>
                {utilizador.avatar}
              </div>
              <span style={{
                position: "absolute", bottom: -1, right: -1,
                width: 11, height: 11, borderRadius: "50%",
                background: "#22c55e", border: "2.5px solid #0d1f16",
                boxShadow: "0 0 6px #22c55e80",
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 800, letterSpacing: "-0.3px", marginBottom: 1 }}>
                {utilizador.nome}
              </p>
              <p style={{ color: "#64748b", fontSize: 11, marginBottom: 6 }}>{utilizador.email}</p>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 99,
                background: "rgba(0,185,107,0.18)", color: "#4ade80",
                border: "1px solid rgba(0,185,107,0.3)", letterSpacing: "0.04em",
              }}>
                {utilizador.nivelIcon} {utilizador.nivel}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, position: "relative" }}>
            {[
              { label: "Saldo",     valor: utilizador.saldo,          Icone: Wallet,     cor: "#4ade80" },
              { label: "Vendas",    valor: utilizador.vendas,          Icone: TrendingUp, cor: "#60a5fa" },
              { label: "Avaliação", valor: `${utilizador.avaliacao}★`, Icone: Star,       cor: "#fbbf24" },
            ].map(({ label, valor, Icone: Ic, cor }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "8px 10px",
                border: "1px solid rgba(255,255,255,0.08)", textAlign: "center",
              }}>
                <Ic size={11} color={cor} style={{ marginBottom: 3 }} />
                <p style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{valor}</p>
                <p style={{ fontSize: 9, color: "#475569", marginTop: 2, fontWeight: 600, letterSpacing: "0.04em" }}>
                  {label.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Menus agrupados */}
        <div style={{ padding: "6px 0", maxHeight: 300, overflowY: "auto" }}>
          {MENUS_DROPDOWN.map((grupo, gi) => (
            <div key={grupo.grupo}>
              <div style={{
                padding: "9px 16px 3px",
                borderTop: gi > 0 ? "1px solid #f1f5f9" : "none",
                marginTop: gi > 0 ? 3 : 0,
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, color: "#cbd5e1",
                  letterSpacing: "0.9px", textTransform: "uppercase",
                }}>
                  {grupo.grupo}
                </span>
              </div>

              {grupo.itens.map(({ id, Icone: Ic, rotulo, cor, badge }) => (
                <button
                  key={id}
                  onClick={() => aoSelecionar(id)}  
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: 10, padding: "7px 16px",
                    background: "transparent", border: "none",
                    cursor: "pointer", textAlign: "left", transition: "background 0.12s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = VERDE_DIM;
                    const ico = e.currentTarget.querySelector(".ico-bg");
                    if (ico) { ico.style.background = cor + "22"; ico.style.color = cor; }
                    const lbl = e.currentTarget.querySelector(".item-lbl");
                    if (lbl) lbl.style.color = "#111827";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent";
                    const ico = e.currentTarget.querySelector(".ico-bg");
                    if (ico) { ico.style.background = "#f8fafc"; ico.style.color = "#94a3b8"; }
                    const lbl = e.currentTarget.querySelector(".item-lbl");
                    if (lbl) lbl.style.color = "#475569";
                  }}
                >
                  <div className="ico-bg" style={{
                    width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#f8fafc", color: "#94a3b8", transition: "all 0.12s",
                  }}>
                    <Ic size={13} />
                  </div>

                  <span className="item-lbl" style={{
                    flex: 1, fontSize: 13, fontWeight: 600,
                    color: "#475569", transition: "color 0.12s",
                  }}>
                    {rotulo}
                  </span>

                  {badge && (
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
                      background: `${VERDE}15`, color: VERDE, border: `1px solid ${VERDE}25`,
                    }}>
                      {badge}
                    </span>
                  )}

                  <ChevronRight size={12} style={{ color: "#e2e8f0", flexShrink: 0 }} />
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Sair */}
        <div style={{ borderTop: "1px solid #fef2f2", padding: "6px 0 4px", background: "#fffbfb" }}>
          <button
            onClick={aoSair}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: 10, padding: "9px 16px",
              background: "transparent", border: "none",
              cursor: "pointer", textAlign: "left",
              transition: "background 0.12s", color: "#ef4444",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff1f1"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#fee2e2",
            }}>
              <LogOut size={13} color="#ef4444" />
            </div>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>Sair da Conta</span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── BotaoAccao ───────────────────────────────────────────────────────────────
function BotaoAccao({ icone, rotulo, aoClicar, contagem = 0, corBadge }) {
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

// ─── Header ───────────────────────────────────────────────────────────────────
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
  utilizador = utilizadorMock,
  // ↓ chamado com o id da secção ("perfil", "carteira", etc.)
  // se não for passado, navega para /minha-conta
  aoNavegar,
}) {
  const navigate = useNavigate();
  const [contaAberta, setContaAberta] = useState(false);
  const timerRef = useRef(null);

  const abrirConta  = () => { clearTimeout(timerRef.current); setContaAberta(true); };
  const fecharConta = () => { timerRef.current = setTimeout(() => setContaAberta(false), 200); };

  // Ao clicar num item do dropdown:
  // — se estamos em /minha-conta, chama aoNavegar(id) sem mudar de rota
  // — caso contrário vai para /minha-conta e passa o id via state
  const aoSelecionar = (id) => {
    setContaAberta(false);

    if (aoNavegar) {
      // Já estamos na página — apenas troca a secção
      aoNavegar(id);
    } else {
      // Vai para a página e sinaliza qual secção abrir
      navigate("/minha-conta", { state: { seccao: id } });
    }
  };

  const aoSair = () => { setContaAberta(false); navigate("/"); };

  return (
    <header className="bg-white border-b border-gray-200 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">

        {/* LOGO */}
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
            {CATEGORIAS.map((c) => <option key={c.label}>{c.label}</option>)}
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

          {/* Conta + dropdown */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={abrirConta}
            onMouseLeave={fecharConta}
          >
            <button
              onClick={() => aoSelecionar("perfil")}
              className="relative flex flex-col items-center text-xs gap-0.5 px-2 py-1 rounded cursor-pointer border-none transition-all duration-200"
              style={{
                color: contaAberta ? VERDE : "#4b5563",
                background: contaAberta ? VERDE_DIM : "transparent",
              }}
            >
              <div style={{ position: "relative" }}>
                <User size={20} strokeWidth={1.5}
                  style={{ transition: "color 0.15s", color: contaAberta ? VERDE : "currentColor" }}
                />
                {contaAberta && (
                  <span style={{
                    position: "absolute", inset: -3, borderRadius: "50%",
                    border: `1.5px solid ${VERDE}`,
                    animation: "ping-once 0.3s ease forwards", opacity: 0,
                  }} />
                )}
              </div>
              <span className="hidden sm:inline font-semibold" style={{ fontSize: 11 }}>Conta</span>
            </button>

            <DropdownConta
              visivel={contaAberta}
              utilizador={utilizador}
              aoSelecionar={aoSelecionar}
              aoSair={aoSair}
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
      </div>

      <style>{`
        @keyframes ping-once {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </header>
  );
}