import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ALL_PRODUCTS } from "../../components/FashionProducts";

const G = "#00b96b";
const GL = "#e6f9f0";

/* ── Ícones ── */
const Ico = ({ d, size = 14, stroke = "currentColor", sw = 2, fill = "none", extra = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={extra}>
    <path d={d} />
  </svg>
);
const IcoSend    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IcoSearch  = () => <Ico d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />;
const IcoClose   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoBack    = () => <Ico d="M15 18l-6-6 6-6" size={18} sw={2.5} />;
const IcoCheck   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoDblChk  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round"><polyline points="17 1 12 7 7 13"/><polyline points="22 6 12 17 8 13"/></svg>;
const IcoTruck   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcoShield  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoImg     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IcoMore    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const IcoPin     = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoStar    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

/* ── Status ── */
const STATUS = {
  novo:       { label: "Novo pedido",       color: "#d97706", bg: "#fffbeb" },
  pagamento:  { label: "Aguarda pagamento", color: "#2563eb", bg: "#eff6ff" },
  confirmado: { label: "Pago & confirmado", color: "#059669", bg: "#ecfdf5" },
  enviado:    { label: "Enviado",            color: "#7c3aed", bg: "#f5f3ff" },
  concluido:  { label: "Concluído",          color: "#6b7280", bg: "#f9fafb" },
};

const TRANSITIONS = {
  confirmar_pagamento: "confirmado",
  marcar_enviado:      "enviado",
  marcar_concluido:    "concluido",
  recusar:             "concluido",
};
const AUTO_MSG = {
  confirmar_pagamento: "✅ Pagamento confirmado! Vou preparar o envio em breve.",
  marcar_enviado:      "📦 Produto enviado! Acompanha pela transportadora.",
  marcar_concluido:    "🎉 Venda concluída! Obrigado pela compra.",
  recusar:             "Lamentamos, mas este pedido não pôde ser processado.",
};

/* ── Dados ── */
const CONVS_INIT = [
  {
    id: 1, name: "Ana Paula Silva", av: "AP", avColor: "#7c3aed",
    online: true, status: "novo",
    product: ALL_PRODUCTS?.[0],
    lastMsg: "Ainda tem em stock? Posso pagar hoje 🙏", lastTime: "14:32", unread: 2,
    msgs: [
      { id: 1, from: "them", text: "Olá! Vi o seu anúncio. Ainda está disponível?", time: "14:10", read: true },
      { id: 2, from: "me",   text: "Bom dia! Sim, ainda está disponível.", time: "14:15", read: true },
      { id: 3, from: "them", text: "Pode fazer algum desconto? Estou muito interessada", time: "14:20", read: true },
      { id: 4, from: "me",   text: "Para pagamento imediato posso ajustar 😊", time: "14:25", read: true },
      { id: 5, from: "them", text: "Ainda tem em stock? Posso pagar hoje 🙏", time: "14:32", read: false },
    ],
  },
  {
    id: 2, name: "Carlos Nhantumbo", av: "CN", avColor: "#d97706",
    online: false, status: "confirmado",
    product: ALL_PRODUCTS?.[4],
    lastMsg: "Ok, vou passar amanhã buscar.", lastTime: "Ontem", unread: 0,
    msgs: [
      { id: 1, from: "them", text: "Boa tarde! O produto ainda tem garantia?", time: "Ontem 10:00", read: true },
      { id: 2, from: "me",   text: "Sim! Garantia de 1 ano. Caixa original.", time: "Ontem 10:05", read: true },
      { id: 3, from: "them", text: "Ok, vou passar amanhã buscar.", time: "Ontem 10:20", read: true },
    ],
  },
  {
    id: 3, name: "Fátima Machava", av: "FM", avColor: "#db2777",
    online: true, status: "pagamento",
    product: ALL_PRODUCTS?.[3],
    lastMsg: "Aceita M-Pesa? O meu número é 84...", lastTime: "12:48", unread: 1,
    msgs: [
      { id: 1, from: "them", text: "Boa tarde! Ainda está disponível? 😊", time: "12:30", read: true },
      { id: 2, from: "me",   text: "Olá! Sim. Entrega disponível para Maputo.", time: "12:35", read: true },
      { id: 3, from: "them", text: "Aceita M-Pesa? O meu número é 84...", time: "12:48", read: false },
    ],
  },
  {
    id: 4, name: "José Tembe", av: "JT", avColor: "#0891b2",
    online: false, status: "enviado",
    product: ALL_PRODUCTS?.[6],
    lastMsg: "Você: Enviado! Obrigado 🎉", lastTime: "Seg", unread: 0,
    msgs: [
      { id: 1, from: "them", text: "O produto é original?", time: "Seg 09:00", read: true },
      { id: 2, from: "me",   text: "100% original. Tenho nota fiscal.", time: "Seg 09:10", read: true },
      { id: 3, from: "them", text: "Feito! Confirmo o pagamento.", time: "Seg 09:20", read: true },
      { id: 4, from: "me",   text: "Enviado! Obrigado 🎉", time: "Seg 09:30", read: true },
    ],
  },
  {
    id: 5, name: "Lurdes Cossa", av: "LC", avColor: "#059669",
    online: true, status: "novo",
    product: ALL_PRODUCTS?.[10],
    lastMsg: "Tem no tamanho M? Preciso urgente", lastTime: "11:05", unread: 3,
    msgs: [
      { id: 1, from: "them", text: "Olá! Que tamanhos tem disponíveis?", time: "10:50", read: true },
      { id: 2, from: "me",   text: "Temos S, M, L e XL.", time: "10:55", read: true },
      { id: 3, from: "them", text: "Tem no tamanho M? Preciso urgente", time: "11:05", read: false },
    ],
  },
  {
    id: 6, name: "Mário Bila", av: "MB", avColor: "#ea580c",
    online: false, status: "concluido",
    product: ALL_PRODUCTS?.[8],
    lastMsg: "Combinado para sábado.", lastTime: "Dom", unread: 0,
    msgs: [
      { id: 1, from: "them", text: "Como é feita a entrega?", time: "Dom 15:00", read: true },
      { id: 2, from: "me",   text: "Enviamos por transportadora. Chega em 2-3 dias.", time: "Dom 15:10", read: true },
      { id: 3, from: "them", text: "Combinado para sábado.", time: "Dom 15:15", read: true },
    ],
  },
];

/* ── Avatar ── */
function Av({ txt, color, size = 36, online = false }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ background: color }}>
        {txt}
      </div>
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />}
    </div>
  );
}

/* ── Status Badge ── */
function SBadge({ s }) {
  const c = STATUS[s] ?? STATUS.novo;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: c.color, background: c.bg }}>
      {c.label}
    </span>
  );
}

/* ── Bolha ── */
function Bubble({ msg, isMe }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[72%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isMe ? "text-white" : "bg-white text-gray-800 border border-gray-100"}`}
        style={{
          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isMe ? G : undefined,
        }}
      >
        <p style={{ wordBreak: "break-word" }}>{msg.text}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
          <span className={`text-[10px] ${isMe ? "text-white/60" : "text-gray-400"}`}>{msg.time}</span>
          {isMe && (msg.read ? <IcoDblChk /> : <span className="text-white/50"><IcoCheck /></span>)}
        </div>
      </div>
    </div>
  );
}

/* ── Acções rápidas ── */
function Actions({ status, onAction }) {
  const map = {
    novo:       [
      { key: "confirmar_pagamento", label: "Confirmar pagamento", icon: <IcoShield />, bg: G },
      { key: "recusar",             label: "Recusar",              icon: <IcoClose />,  bg: "#ef4444" },
    ],
    pagamento:  [{ key: "confirmar_pagamento", label: "Confirmar pagamento", icon: <IcoShield />, bg: G }],
    confirmado: [{ key: "marcar_enviado",      label: "Marcar como enviado", icon: <IcoTruck />,  bg: "#7c3aed" }],
    enviado:    [{ key: "marcar_concluido",    label: "Concluir venda",      icon: <IcoCheck />,  bg: G }],
    concluido:  [],
  };
  const list = map[status] ?? [];
  if (!list.length) return null;
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
      {list.map(a => (
        <button key={a.key} onClick={() => onAction(a.key)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white border-none cursor-pointer transition-all active:scale-95 hover:opacity-90"
          style={{ background: a.bg }}>
          {a.icon}{a.label}
        </button>
      ))}
    </div>
  );
}

/* ══ COMPONENTE PRINCIPAL ══ */
export default function ChatVendedor() {
  const navigate = useNavigate();
  const [convs,       setConvs]       = useState(CONVS_INIT);
  const [activeId,    setActiveId]    = useState(null);
  const [inputText,   setInputText]   = useState("");
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("todos");
  const [showInfo,    setShowInfo]    = useState(false);
  const [mobileView,  setMobileView]  = useState("list");

  const endRef   = useRef(null);
  const inputRef = useRef(null);
  const active   = convs.find(c => c.id === activeId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, active?.msgs?.length]);

  useEffect(() => {
    if (!activeId) return;
    setConvs(prev => prev.map(c =>
      c.id === activeId ? { ...c, unread: 0, msgs: c.msgs.map(m => ({ ...m, read: true })) } : c
    ));
  }, [activeId]);

  const filtered = convs.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) ||
               c.product?.name?.toLowerCase().includes(search.toLowerCase());
    const fs = filter === "todos" || c.status === filter;
    return ms && fs;
  });

  const totalUnread   = convs.reduce((a, c) => a + c.unread, 0);
  const byStatus      = s => convs.filter(c => c.status === s).length;

  function open(id) { setActiveId(id); setMobileView("chat"); setShowInfo(false); }

  function send() {
    const text = inputText.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" });
    setConvs(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, msgs: [...c.msgs, { id: Date.now(), from: "me", text, time: now, read: false }], lastMsg: `Você: ${text}`, lastTime: now }
        : c
    ));
    setInputText("");
    inputRef.current?.focus();
  }

  function handleAction(key) {
    const ns   = TRANSITIONS[key]; if (!ns) return;
    const now  = new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" });
    const text = AUTO_MSG[key];
    setConvs(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, status: ns, msgs: [...c.msgs, { id: Date.now(), from: "me", text, time: now, read: false }], lastMsg: `Você: ${text}`, lastTime: now }
        : c
    ));
  }

  const FILTERS = [
    { key: "todos",      label: "Todos" },
    { key: "novo",       label: "Novos" },
    { key: "pagamento",  label: "Pagamento" },
    { key: "confirmado", label: "Pagos" },
    { key: "enviado",    label: "Enviados" },
    { key: "concluido",  label: "Concluídos" },
  ];

  return (
    <div
      className="flex overflow-hidden bg-white"
      style={{ height: "72vh", minHeight: 500, borderRadius: 14, border: "1px solid #e5e7eb" }}
    >
      {/* ══ SIDEBAR ══ */}
      <aside
        className={`flex-col bg-white border-r border-gray-100 flex-shrink-0 ${mobileView === "list" ? "flex w-full" : "hidden"} sm:flex sm:w-[280px]`}
      >
        {/* Topo sidebar */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-black text-gray-900">Mensagens</span>
            {totalUnread > 0 && (
              <span className="text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full" style={{ background: G }}>
                {totalUnread}
              </span>
            )}
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Novos",    s: "novo",       color: "#d97706" },
              { label: "Pagos",    s: "confirmado", color: G },
              { label: "Enviados", s: "enviado",    color: "#7c3aed" },
            ].map(x => (
              <button key={x.s}
                onClick={() => setFilter(p => p === x.s ? "todos" : x.s)}
                className="flex flex-col items-center py-2 border cursor-pointer transition-all"
                style={{
                  background:  filter === x.s ? x.color + "15" : "#f9fafb",
                  borderColor: filter === x.s ? x.color : "#f3f4f6",
                }}>
                <span className="text-xl font-black leading-none" style={{ color: x.color }}>{byStatus(x.s)}</span>
                <span className="text-[9px] font-semibold text-gray-500 mt-0.5">{x.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-2.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IcoSearch /></span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar clientes..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400 outline-none focus:border-green-400 transition-colors"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border-none cursor-pointer transition-all"
                style={{ background: filter === f.key ? G : "#f3f4f6", color: filter === f.key ? "#fff" : "#6b7280" }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista conversas */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <p className="text-xs font-medium">Nenhum resultado</p>
            </div>
          ) : filtered.map(c => (
            <button key={c.id} onClick={() => open(c.id)}
              className="w-full flex items-start gap-3 px-4 py-3 border-none cursor-pointer transition-all text-left border-l-[3px]"
              style={{
                background:  activeId === c.id ? "#f0fdf4" : "transparent",
                borderLeftColor: activeId === c.id ? G : "transparent",
              }}
              onMouseEnter={e => { if (activeId !== c.id) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (activeId !== c.id) e.currentTarget.style.background = "transparent"; }}
            >
              <Av txt={c.av} color={c.avColor} online={c.online} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-gray-900 truncate">{c.name}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{c.lastTime}</span>
                </div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <p className="text-[11px] text-gray-500 truncate flex-1">{c.lastMsg}</p>
                  {c.unread > 0 && (
                    <span className="flex-shrink-0 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: G }}>
                      {c.unread}
                    </span>
                  )}
                </div>
                <SBadge s={c.status} />
                {c.product && (
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5 truncate">
                    <IcoPin /> {c.product.name}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ══ ÁREA CHAT ══ */}
      {!active ? (
        <div className="flex-1 hidden sm:flex flex-col items-center justify-center bg-gray-50 gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: GL }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-500">Selecciona uma conversa</p>
          <p className="text-xs text-gray-400">Gere os teus pedidos e clientes aqui</p>
        </div>
      ) : (
        <div className={`flex-1 flex-col overflow-hidden ${mobileView === "chat" ? "flex" : "hidden sm:flex"}`}
          style={{ background: "#f8fafc" }}>

          {/* Header chat */}
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <button onClick={() => setMobileView("list")}
              className="sm:hidden text-gray-500 cursor-pointer border-none bg-transparent flex-shrink-0">
              <IcoBack />
            </button>
            <Av txt={active.av} color={active.avColor} size={40} online={active.online} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-gray-900 leading-tight">{active.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-semibold ${active.online ? "text-emerald-500" : "text-gray-400"}`}>
                  {active.online ? "● Online agora" : "● Offline"}
                </span>
                <SBadge s={active.status} />
              </div>
            </div>
            <button onClick={() => setShowInfo(v => !v)}
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none transition-colors ${showInfo ? "text-green-600" : "text-gray-400 hover:text-gray-700"}`}
              style={{ background: showInfo ? GL : "transparent" }}>
              <IcoMore />
            </button>
          </div>

          {/* Produto pinado */}
          {active.product && (
            <div onClick={() => navigate?.(`/produto/${active.product.id}`)}
              className="flex items-center gap-3 bg-white border-b border-gray-100 px-4 py-2.5 cursor-pointer flex-shrink-0 hover:bg-gray-50 transition-colors">
              <img src={active.product.img} alt={active.product.name}
                className="w-10 h-10 object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{active.product.name}</p>
                <p className="text-xs font-black" style={{ color: G }}>
                  {active.product.price?.toLocaleString("pt-MZ")} MZN
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 flex-shrink-0" style={{ background: GL, color: G }}>
                Ver →
              </span>
            </div>
          )}

          {/* Acções */}
          <Actions status={active.status} onAction={handleAction} />

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-4 py-4"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>
            <div className="flex justify-center mb-4">
              <span className="text-[10px] font-semibold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                Hoje
              </span>
            </div>
            {active.msgs.map((msg, i) => {
              const isMe = msg.from === "me";
              const showAv = !isMe && (i === 0 || active.msgs[i - 1]?.from === "me");
              return (
                <div key={msg.id} className={`flex items-end gap-2 mb-1 ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <div className="w-6 flex-shrink-0 mb-1">
                      {showAv && <Av txt={active.av} color={active.avColor} size={24} />}
                    </div>
                  )}
                  <Bubble msg={msg} isMe={isMe} />
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
            <div className="flex items-end gap-2">
              <button className="text-gray-400 hover:text-green-500 cursor-pointer border-none bg-transparent transition-colors pb-1 flex-shrink-0">
                <IcoImg />
              </button>
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-green-400 transition-colors">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Responder ao cliente..."
                  className="w-full resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                  style={{ lineHeight: 1.5, maxHeight: 96, overflowY: "auto" }}
                />
              </div>
              <button
                onClick={send}
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 cursor-pointer border-none transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: inputText.trim() ? G : "#9ca3af" }}>
                <IcoSend />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PAINEL INFO ══ */}
      {active && showInfo && (
        <aside className="w-56 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-y-auto"
          style={{ scrollbarWidth: "none" }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-extrabold text-gray-900">Detalhe</span>
            <button onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-gray-700 cursor-pointer border-none bg-transparent">
              <IcoClose />
            </button>
          </div>

          <div className="flex flex-col items-center py-5 px-4 border-b border-gray-100">
            <Av txt={active.av} color={active.avColor} size={48} online={active.online} />
            <p className="mt-3 text-sm font-extrabold text-gray-900 text-center leading-tight">{active.name}</p>
            <div className="flex gap-0.5 mt-1.5">
              {[...Array(5)].map((_, i) => <IcoStar key={i} />)}
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">Comprador verificado</span>
            <div className="mt-2"><SBadge s={active.status} /></div>
          </div>

          {active.product && (
            <div className="p-4 border-b border-gray-100">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">Produto</p>
              <div onClick={() => navigate?.(`/produto/${active.product.id}`)}
                className="flex gap-2.5 cursor-pointer group">
                <img src={active.product.img} alt={active.product.name}
                  className="w-12 h-12 object-cover flex-shrink-0 group-hover:opacity-80 transition-opacity" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {active.product.name}
                  </p>
                  <p className="text-xs font-extrabold mt-1" style={{ color: G }}>
                    {active.product.price?.toLocaleString("pt-MZ")} MZN
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 flex flex-col gap-1.5">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Acções</p>
            {[
              { label: "Ver perfil do comprador", e: "👤" },
              { label: "Bloquear contacto",        e: "🚫" },
              { label: "Reportar conversa",         e: "⚠️" },
            ].map(a => (
              <button key={a.label}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 cursor-pointer border-none text-left transition-colors">
                <span style={{ fontSize: 13 }}>{a.e}</span>{a.label}
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}