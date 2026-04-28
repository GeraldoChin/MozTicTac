import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ALL_PRODUCTS } from "../../components/FashionProducts";

const GREEN       = "#00b96b";
const GREEN_DARK  = "#009a5a";
const GREEN_LIGHT = "#e6f9f0";

/* ── Ícones ─────────────────────────────────────────────────────── */
const IconSend = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);
const IconMore = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);
const IconImage = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IconSmile = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const IconPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconCheck2 = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconCheckDouble = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 12 7 7 13"/><polyline points="22 6 12 17 8 13"/>
  </svg>
);
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconStar = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconBubble = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

/* ── Conversas iniciais ─────────────────────────────────────────── */
const CONVERSATIONS_INIT = [
  {
    id: 1, name: "Ana Paula Silva", avatar: "AP", avatarColor: "#8b5cf6",
    product: ALL_PRODUCTS[0], online: true,
    lastMsg: "Ainda tem em stock? Posso pagar hoje mesmo 🙏", lastTime: "14:32", unread: 2,
    messages: [
      { id: 1, from: "them", text: "Olá! Vi o seu anúncio do Relógio Premium Swiss Style. Ainda está disponível?", time: "14:10", read: true },
      { id: 2, from: "me",   text: "Bom dia! Sim, ainda está disponível. Está em perfeito estado.", time: "14:15", read: true },
      { id: 3, from: "them", text: "Que bom! Pode fazer algum desconto? Estou muito interessada", time: "14:20", read: true },
      { id: 4, from: "me",   text: "Para pagamento imediato posso fazer um pequeno ajuste sim 😊", time: "14:25", read: true },
      { id: 5, from: "them", text: "Ainda tem em stock? Posso pagar hoje mesmo 🙏", time: "14:32", read: false },
    ],
  },
  {
    id: 2, name: "Carlos Nhantumbo", avatar: "CN", avatarColor: "#f59e0b",
    product: ALL_PRODUCTS[4], online: false,
    lastMsg: "Ok, vou passar amanhã buscar.", lastTime: "Ontem", unread: 0,
    messages: [
      { id: 1, from: "them", text: "Boa tarde! O Samsung Galaxy A55 ainda tem garantia?", time: "Ontem 10:00", read: true },
      { id: 2, from: "me",   text: "Sim! Tem garantia de 1 ano da Samsung. Caixa original com todos os acessórios.", time: "Ontem 10:05", read: true },
      { id: 3, from: "them", text: "Perfeito. Posso ir buscar em Maputo?", time: "Ontem 10:10", read: true },
      { id: 4, from: "me",   text: "Claro, estou disponível a partir das 8h. Fica na Av. Julius Nyerere.", time: "Ontem 10:15", read: true },
      { id: 5, from: "them", text: "Ok, vou passar amanhã buscar.", time: "Ontem 10:20", read: true },
    ],
  },
  {
    id: 3, name: "Fátima Machava", avatar: "FM", avatarColor: "#ec4899",
    product: ALL_PRODUCTS[3], online: true,
    lastMsg: "Aceita M-Pesa? O meu número é 84...", lastTime: "12:48", unread: 1,
    messages: [
      { id: 1, from: "them", text: "Boa tarde! A Capulana ainda está disponível? Vi que tem entrega 😊", time: "12:30", read: true },
      { id: 2, from: "me",   text: "Olá Fátima! Sim, está disponível. Entrega disponível para Maputo cidade.", time: "12:35", read: true },
      { id: 3, from: "them", text: "Aceita M-Pesa? O meu número é 84...", time: "12:48", read: false },
    ],
  },
  {
    id: 4, name: "José Tembe", avatar: "JT", avatarColor: "#06b6d4",
    product: ALL_PRODUCTS[6], online: false,
    lastMsg: "Você: Enviado! Obrigado pela compra 🎉", lastTime: "Seg", unread: 0,
    messages: [
      { id: 1, from: "them", text: "Os Auscultadores Sony XM5 são originais?", time: "Seg 09:00", read: true },
      { id: 2, from: "me",   text: "100% originais. Comprei na loja oficial. Tenho nota fiscal.", time: "Seg 09:10", read: true },
      { id: 3, from: "them", text: "Feito! Vou comprar. Confirmo o pagamento agora.", time: "Seg 09:20", read: true },
      { id: 4, from: "me",   text: "Enviado! Obrigado pela compra 🎉", time: "Seg 09:30", read: true },
    ],
  },
  {
    id: 5, name: "Lurdes Cossa", avatar: "LC", avatarColor: "#10b981",
    product: ALL_PRODUCTS[10], online: true,
    lastMsg: "Tem no tamanho M? Preciso urgente", lastTime: "11:05", unread: 3,
    messages: [
      { id: 1, from: "them", text: "Olá! Gostei muito do Vestido Chitenge. Que tamanhos tem disponíveis?", time: "10:50", read: true },
      { id: 2, from: "me",   text: "Temos S, M, L e XL. Todas as cores do padrão tradicional.", time: "10:55", read: true },
      { id: 3, from: "them", text: "Tem no tamanho M? Preciso urgente", time: "11:05", read: false },
    ],
  },
  {
    id: 6, name: "Mário Bila", avatar: "MB", avatarColor: "#f97316",
    product: ALL_PRODUCTS[8], online: false,
    lastMsg: "Boa, combinado então para sábado.", lastTime: "Dom", unread: 0,
    messages: [
      { id: 1, from: "them", text: "O Caju Torrado vem de Nacala? Como é feita a entrega?", time: "Dom 15:00", read: true },
      { id: 2, from: "me",   text: "Sim! Enviamos por transportadora. Chega em 2-3 dias úteis em Maputo.", time: "Dom 15:10", read: true },
      { id: 3, from: "them", text: "Boa, combinado então para sábado.", time: "Dom 15:15", read: true },
    ],
  },
];

/* ── Sub-componentes ────────────────────────────────────────────── */
function Avatar({ initials, color, size = "md", online = false }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white`} style={{ background: color }}>
        {initials}
      </div>
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />}
    </div>
  );
}

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1.5`}>
      <div
        className={`max-w-[75%] sm:max-w-xs lg:max-w-sm px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMe ? "rounded-br-sm text-white" : "rounded-bl-sm bg-white border border-gray-100 text-gray-800"
        }`}
        style={isMe ? { background: GREEN } : {}}>
        <p>{msg.text}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
          <span className={`text-[10px] ${isMe ? "text-green-100" : "text-gray-400"}`}>{msg.time}</span>
          {isMe && (msg.read ? <IconCheckDouble /> : <span className="text-green-200"><IconCheck2 /></span>)}
        </div>
      </div>
    </div>
  );
}

function ProductSnippet({ product, onClick }) {
  if (!product) return null;
  return (
    <div onClick={onClick}
      className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 cursor-pointer hover:border-green-200 hover:shadow-sm transition-all duration-150 mx-3 sm:mx-4 mt-3 mb-1 flex-shrink-0">
      <img src={product.img} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 line-clamp-1">{product.name}</p>
        <p className="text-xs text-gray-400">{product.category}</p>
        <p className="text-sm font-black" style={{ color: GREEN }}>{product.price.toLocaleString("pt-MZ")} MZN</p>
      </div>
      <span className="text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0" style={{ background: GREEN_LIGHT, color: GREEN }}>
        Ver →
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════════ */
export function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState(CONVERSATIONS_INIT);
  const [activeId, setActiveId]           = useState(null);
  const [inputText, setInputText]         = useState("");
  const [searchQuery, setSearchQuery]     = useState("");
  const [showInfo, setShowInfo]           = useState(false);
  const [mobileView, setMobileView]       = useState("list"); // "list" | "chat"

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const active = conversations.find(c => c.id === activeId);

  /* ── receber productId ao chegar do ProductPage ── */
  useEffect(() => {
    const productId = location.state?.productId;

    if (!productId) {
      setActiveId(CONVERSATIONS_INIT[0].id);
      return;
    }

    const existing = CONVERSATIONS_INIT.find(c => c.product?.id === productId);
    if (existing) {
      setActiveId(existing.id);
      setMobileView("chat");
      return;
    }

    const prod = ALL_PRODUCTS.find(p => p.id === productId);
    if (!prod) { setActiveId(CONVERSATIONS_INIT[0].id); return; }

    const now     = new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" });
    const initMsg = `Olá! Tenho interesse no produto "${prod.name}". Ainda está disponível?`;
    const newConv = {
      id: Date.now(),
      name: `Vendedor — ${prod.name.split(" ").slice(0, 2).join(" ")}`,
      avatar: "VD",
      avatarColor: GREEN,
      product: prod,
      online: true,
      lastMsg: initMsg,
      lastTime: now,
      unread: 0,
      messages: [{ id: 1, from: "me", text: initMsg, time: now, read: false }],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveId(newConv.id);
    setMobileView("chat");
  }, []); // eslint-disable-line

  /* scroll ao fundo */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, active?.messages?.length]);

  /* marcar lido */
  useEffect(() => {
    if (!activeId) return;
    setConversations(prev =>
      prev.map(c => c.id === activeId
        ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) }
        : c)
    );
  }, [activeId]);

  const filteredConvs = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

  function openConv(id) { setActiveId(id); setMobileView("chat"); setShowInfo(false); }

  function sendMessage() {
    const text = inputText.trim();
    if (!text) return;
    const now    = new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" });
    const newMsg = { id: Date.now(), from: "me", text, time: now, read: false };
    setConversations(prev =>
      prev.map(c => c.id === activeId
        ? { ...c, messages: [...c.messages, newMsg], lastMsg: `Você: ${text}`, lastTime: now }
        : c)
    );
    setInputText("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function renderMessages() {
    if (!active) return null;
    return active.messages.map((msg, i) => {
      const isMe       = msg.from === "me";
      const showAvatar = !isMe && (i === 0 || active.messages[i - 1]?.from === "me");
      return (
        <div key={msg.id}>
          {i === 0 && (
            <div className="flex justify-center mb-4">
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Hoje</span>
            </div>
          )}
          <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} mb-1`}>
            {!isMe && (
              <div className="w-6 flex-shrink-0">
                {showAvatar && <Avatar initials={active.avatar} color={active.avatarColor} size="sm" />}
              </div>
            )}
            <MessageBubble msg={msg} isMe={isMe} />
          </div>
        </div>
      );
    });
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden" style={{ fontFamily: "Manrope, sans-serif" }}>

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => mobileView === "chat" && window.innerWidth < 640 ? setMobileView("list") : navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer border-none bg-transparent font-medium text-sm">
          <IconChevronLeft />
          <span className="hidden sm:inline">Voltar</span>
        </button>
        <div className="flex-1" />
        <h1 className="text-base font-black text-gray-900">
          Mensagens
          {totalUnread > 0 && (
            <span className="ml-2 text-xs font-bold text-white px-1.5 py-0.5 rounded-full" style={{ background: GREEN }}>
              {totalUnread}
            </span>
          )}
        </h1>
        <div className="flex-1" />
      </div>

      {/* ── Corpo ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══ Sidebar conversas ══ */}
        <aside className={[
          "bg-white border-r border-gray-100 flex-col flex-shrink-0",
          /* mobile: lista visível só quando mobileView=list */
          mobileView === "list" ? "flex w-full" : "hidden",
          /* sm+: sempre visível, largura fixa */
          "sm:flex sm:w-72 md:w-80",
        ].join(" ")}>

          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
              <input type="text" placeholder="Pesquisar conversas..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent">
                  <IconClose />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <p className="text-gray-400 text-sm font-medium">Nenhuma conversa encontrada</p>
              </div>
            ) : filteredConvs.map(conv => (
              <button key={conv.id} onClick={() => openConv(conv.id)}
                className={[
                  "w-full flex items-center gap-3 px-4 py-3.5 text-left border-none cursor-pointer transition-all duration-150 border-l-4",
                  activeId === conv.id
                    ? "bg-green-50 border-l-green-500"
                    : "bg-transparent border-l-transparent hover:bg-gray-50",
                ].join(" ")}>
                <Avatar initials={conv.avatar} color={conv.avatarColor} size="md" online={conv.online} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-bold truncate ${activeId === conv.id ? "text-gray-900" : "text-gray-800"}`}>
                      {conv.name}
                    </span>
                    <span className={`text-[11px] flex-shrink-0 ml-2 ${conv.unread > 0 ? "font-bold text-gray-600" : "text-gray-400"}`}>
                      {conv.lastTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500 truncate flex-1">{conv.lastMsg}</p>
                    {conv.unread > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: GREEN }}>
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  {conv.product && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate flex items-center gap-1">
                      <IconPin />{conv.product.name}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* ══ Área de chat ══ */}
        {!active ? (
          /* estado vazio — só visível em desktop */
          <div className="flex-1 hidden sm:flex flex-col items-center justify-center bg-gray-50 gap-3">
            <IconBubble />
            <p className="text-sm font-semibold text-gray-400">Selecciona uma conversa</p>
            <p className="text-xs text-gray-300">As tuas mensagens aparecem aqui</p>
          </div>
        ) : (
          <div className={[
            "flex-1 flex-col overflow-hidden",
            mobileView === "chat" ? "flex" : "hidden sm:flex",
          ].join(" ")}>

            {/* Header do chat */}
            <div className="bg-white border-b border-gray-100 px-3 sm:px-5 py-3.5 flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Voltar — mobile only */}
              <button onClick={() => setMobileView("list")}
                className="sm:hidden w-8 h-8 flex items-center justify-center text-gray-500 cursor-pointer border-none bg-transparent flex-shrink-0">
                <IconChevronLeft />
              </button>

              <Avatar initials={active.avatar} color={active.avatarColor} size="md" online={active.online} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{active.name}</p>
                <p className="text-xs">
                  {active.online
                    ? <span className="text-green-500 font-semibold">● Online agora</span>
                    : <span className="text-gray-400">Visto há pouco</span>}
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 cursor-pointer border-none bg-transparent transition-colors">
                  <IconPhone />
                </button>
                <button onClick={() => setShowInfo(v => !v)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none transition-colors ${showInfo ? "bg-green-50 text-green-600" : "text-gray-400 hover:text-gray-700 bg-transparent"}`}>
                  <IconMore />
                </button>
              </div>
            </div>

            {/* Produto */}
            <ProductSnippet product={active.product} onClick={() => navigate(`/produto/${active.product.id}`)} />

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-3">
              {renderMessages()}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-3 sm:px-4 py-3 flex-shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex gap-1 pb-1">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 cursor-pointer border-none bg-transparent transition-colors">
                    <IconImage />
                  </button>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 cursor-pointer border-none bg-transparent transition-colors hidden sm:flex">
                    <IconSmile />
                  </button>
                </div>
                <div className="flex-1">
                  <textarea ref={inputRef} rows={1} value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escreva uma mensagem..."
                    className="w-full resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors max-h-28 overflow-y-auto"
                    style={{ lineHeight: "1.5" }} />
                </div>
                <button onClick={sendMessage} disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 cursor-pointer border-none transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: inputText.trim() ? GREEN : "#d1d5db" }}>
                  <IconSend />
                </button>
              </div>
              <p className="text-[10px] text-gray-300 text-center mt-1.5 hidden sm:block">
                Enter para enviar · Shift+Enter para nova linha
              </p>
            </div>
          </div>
        )}

        {/* ══ Painel info ══ */}
        {active && showInfo && (
          <aside className="w-64 sm:w-72 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-y-auto">
            <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">Informações</span>
              <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer border-none bg-transparent">
                <IconClose />
              </button>
            </div>
            <div className="flex flex-col items-center py-6 px-4 border-b border-gray-50">
              <Avatar initials={active.avatar} color={active.avatarColor} size="lg" online={active.online} />
              <p className="mt-3 text-base font-black text-gray-900 text-center">{active.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <IconPin /> {active.product?.city}, {active.product?.province}
              </p>
              <div className="flex items-center gap-0.5 mt-1">
                <IconStar /><IconStar /><IconStar /><IconStar /><IconStar />
                <span className="text-xs text-gray-500 ml-1">Verificado</span>
              </div>
            </div>
            {active.product && (
              <div className="p-4 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Produto em discussão</p>
                <div onClick={() => navigate(`/produto/${active.product.id}`)} className="flex gap-3 cursor-pointer group">
                  <img src={active.product.img} alt={active.product.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover flex-shrink-0 group-hover:opacity-90 transition-opacity" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-green-600 transition-colors">{active.product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{active.product.category}</p>
                    <p className="text-sm font-black mt-1" style={{ color: GREEN }}>{active.product.price.toLocaleString("pt-MZ")} MZN</p>
                  </div>
                </div>
              </div>
            )}
            <div className="p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Acções</p>
              <div className="flex flex-col gap-2">
                {[{ label: "Ver perfil do vendedor", icon: "👤" }, { label: "Bloquear contacto", icon: "🚫" }, { label: "Reportar conversa", icon: "⚠️" }]
                  .map(a => (
                    <button key={a.label}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 cursor-pointer border-none text-left transition-colors">
                      <span>{a.icon}</span>{a.label}
                    </button>
                  ))}
              </div>
            </div>
          </aside>
        )}

      </div>
    </div>
  );
}

export default ChatPage;