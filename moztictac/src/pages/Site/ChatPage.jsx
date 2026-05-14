// ─────────────────────────────────────────────
// MOZTICTAC — ChatPage (Comprador)
// ─────────────────────────────────────────────
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "../../components/Header";
import {
  connectSocket,
  disconnectSocket,
  entrarConversa,
  sairConversa,
  enviarMensagem as emitirMensagem,
  marcarLidas,
  onNovaMensagem,
  onMensagensLidas,
  onPresenca,
  onErroSocket,
  iniciarConversa,
  listarConversas,
  obterMensagens,
} from "../../services/chatService";

const GREEN       = "#00b96b";
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
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatarHora(dataISO) {
  if (!dataISO) return "";
  return new Date(dataISO).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" });
}

function formatarData(dataISO) {
  if (!dataISO) return "";
  const d = new Date(dataISO);
  const hoje = new Date();
  const ontem = new Date(); ontem.setDate(hoje.getDate() - 1);
  if (d.toDateString() === hoje.toDateString()) return "Hoje";
  if (d.toDateString() === ontem.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short" });
}

// FIX: aceita tanto remetenteId como outros campos possíveis
function normalizarMensagem(m, meuId) {
  return {
    id:      m.id,
    from:    m.remetenteId === meuId ? "me" : "them",
    text:    m.conteudo,
    time:    formatarHora(m.criadoEm),
    read:    m.lida,
    dataISO: m.criadoEm,
  };
}

// FIX: suporta nomeCompleto (backend) e nome (fallback)
function normalizarConversa(c, meuId) {
  const outroPart = c.outroParticipante ?? {};
  const nomeCompleto = outroPart.nomeCompleto ?? outroPart.nome ?? "Desconhecido";
  const nomes     = nomeCompleto.split(" ");
  const initials  = nomes.length >= 2
    ? nomes[0][0] + nomes[nomes.length - 1][0]
    : nomeCompleto.slice(0, 2);
  const ultimaMsg = c.mensagens?.[0];

  return {
    id:          c.id,
    name:        nomeCompleto,
    avatar:      initials.toUpperCase(),
    avatarColor: stringParaCor(outroPart.id ?? ""),
    fotoPerfil:  outroPart.fotoPerfil ?? null,
    online:      false,
    lastMsg:     ultimaMsg?.conteudo ?? "",
    lastTime:    formatarData(ultimaMsg?.criadoEm ?? c.ultimaMensagemEm),
    unread:      c.naoLidas ?? 0,
    outroId:     outroPart.id,
    messages:    [],
  };
}

function stringParaCor(str) {
  const cores = ["#8b5cf6","#f59e0b","#ec4899","#06b6d4","#10b981","#f97316","#6366f1","#14b8a6"];
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return cores[Math.abs(h) % cores.length];
}

/* ── Sub-componentes ─────────────────────────────────────────────── */
function Avatar({ initials, color, fotoPerfil, size = "md", online = false }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className="relative flex-shrink-0">
      {fotoPerfil
        ? <img src={fotoPerfil} alt={initials} className={`${sizes[size]} rounded-full object-cover`} />
        : <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white`} style={{ background: color }}>{initials}</div>
      }
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
        style={isMe ? { background: GREEN } : {}}
      >
        <p style={{ wordBreak: "break-word" }}>{msg.text}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
          <span className={`text-[10px] ${isMe ? "text-green-100" : "text-gray-400"}`}>{msg.time}</span>
          {isMe && (msg.read ? <IconCheckDouble /> : <span className="text-green-200"><IconCheck2 /></span>)}
        </div>
      </div>
    </div>
  );
}

function ErroToast({ msg, onDismiss }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
      {msg}
      <button onClick={onDismiss} className="border-none bg-transparent text-white cursor-pointer"><IconClose /></button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL — COMPRADOR
══════════════════════════════════════════════════════════════════ */
export function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // FIX: garantir que meuId existe — sem ele nenhuma mensagem aparece como "minha"
  const meuId = localStorage.getItem("usuarioId") ?? localStorage.getItem("userId") ?? "";

  const [conversas,      setConversas]      = useState([]);
  const [activeId,       setActiveId]       = useState(null);
  const [inputText,      setInputText]      = useState("");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [showInfo,       setShowInfo]       = useState(false);
  const [mobileView,     setMobileView]     = useState("list");
  const [carregando,     setCarregando]     = useState(true);
  const [carregandoMsgs, setCarregandoMsgs] = useState(false);
  const [erro,           setErro]           = useState(null);
  const [enviando,       setEnviando]       = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const activeIdRef    = useRef(activeId);

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  const active = conversas.find(c => c.id === activeId) ?? null;

  // ── 1. Carregar conversas ─────────────────────────────────────
  const carregarConversas = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await listarConversas();
      setConversas(dados.map(c => normalizarConversa(c, meuId)));
    } catch (e) {
      console.error("Erro ao carregar conversas:", e.message);
      setErro("Não foi possível carregar as conversas. Tenta novamente.");
    } finally {
      setCarregando(false);
    }
  }, [meuId]);

  useEffect(() => { carregarConversas(); }, [carregarConversas]);

  // ── 2. Socket ─────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    connectSocket(token);

    const offMsg = onNovaMensagem((msg) => {
      const normalizada = normalizarMensagem(msg, meuId);
      setConversas(prev => prev.map(c => {
        if (c.id !== msg.conversaId) return c;
        const jáExiste = c.messages.some(m => m.id === normalizada.id);
        if (jáExiste) return c;
        const isActiva = activeIdRef.current === msg.conversaId;
        return {
          ...c,
          messages: [...c.messages, normalizada],
          lastMsg:  msg.conteudo,
          lastTime: formatarData(msg.criadoEm),
          unread:   isActiva ? 0 : (c.unread + (normalizada.from === "them" ? 1 : 0)),
        };
      }));
      if (activeIdRef.current === msg.conversaId && msg.remetenteId !== meuId) {
        marcarLidas(msg.conversaId);
      }
    });

    const offLidas = onMensagensLidas(({ conversaId }) => {
      setConversas(prev => prev.map(c =>
        c.id === conversaId
          ? { ...c, messages: c.messages.map(m => m.from === "me" ? { ...m, read: true } : m) }
          : c
      ));
    });

    const offPresenca = onPresenca(({ utilizadorId, online }) => {
      setConversas(prev => prev.map(c =>
        c.outroId === utilizadorId ? { ...c, online } : c
      ));
    });

    const offErro = onErroSocket(({ mensagem }) => setErro(mensagem));

    return () => {
      offMsg(); offLidas(); offPresenca(); offErro();
      disconnectSocket();
    };
  }, [meuId]);

  // ── 3. Abrir conversa via router state (produto → chat) ───────
  useEffect(() => {
    if (carregando) return;

    const vendedorId   = location.state?.vendedorId;
    const vendedorNome = location.state?.vendedorNome;
    const vendedorFoto = location.state?.vendedorFoto;

    if (vendedorId) {
      // FIX: passar info do vendedor para enriquecer outroParticipante
      iniciarConversa(vendedorId, { nome: vendedorNome, fotoPerfil: vendedorFoto })
        .then(conv => {
          const normalizada = normalizarConversa({ ...conv, naoLidas: 0 }, meuId);
          setConversas(prev => {
            const existe = prev.find(c => c.id === normalizada.id);
            return existe ? prev.map(c => c.id === normalizada.id ? normalizada : c) : [normalizada, ...prev];
          });
          abrirConversa(normalizada.id);
        })
        .catch((e) => {
          console.error("Erro ao iniciar conversa:", e.message);
          setErro("Não foi possível iniciar a conversa.");
        });
      return;
    }

    // Sem intenção de produto → abrir primeira conversa disponível
    if (conversas[0]) abrirConversa(conversas[0].id);
  // eslint-disable-next-line
  }, [carregando]);

  // ── 4. Carregar mensagens ao abrir conversa ───────────────────
  async function abrirConversa(id) {
    setActiveId(id);
    setMobileView("chat");
    setShowInfo(false);

    if (activeIdRef.current && activeIdRef.current !== id) {
      sairConversa(activeIdRef.current);
    }
    entrarConversa(id);

    setConversas(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    marcarLidas(id);

    const convActual = conversas.find(c => c.id === id);
    if (convActual?.messages?.length > 0) return;

    try {
      setCarregandoMsgs(true);
      const dados = await obterMensagens(id);
      // FIX: dados já é { total, pagina, mensagens } — não precisa de .dados
      const msgs = (dados.mensagens ?? []).map(m => normalizarMensagem(m, meuId));
      setConversas(prev => prev.map(c => c.id === id ? { ...c, messages: msgs } : c));
    } catch (e) {
      console.error("Erro ao carregar mensagens:", e.message);
      setErro("Não foi possível carregar as mensagens.");
    } finally {
      setCarregandoMsgs(false);
    }
  }

  // ── 5. Scroll para o fim ──────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, active?.messages?.length]);

  // ── 6. Enviar mensagem ────────────────────────────────────────
  function enviar() {
    const text = inputText.trim();
    if (!text || !activeId || enviando) return;

    const agora  = new Date().toISOString();
    const tmpMsg = { id: `tmp-${Date.now()}`, from: "me", text, time: formatarHora(agora), read: false, dataISO: agora };

    setConversas(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, tmpMsg], lastMsg: `Você: ${text}`, lastTime: "Agora" }
        : c
    ));
    setInputText("");
    inputRef.current?.focus();
    emitirMensagem({ conversaId: activeId, conteudo: text });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
  }

  const filteredConvs = conversas.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalUnread = conversas.reduce((acc, c) => acc + c.unread, 0);

  function renderMensagens() {
    if (!active) return null;
    let ultimaData = null;
    return active.messages.map((msg, i) => {
      const isMe       = msg.from === "me";
      const dataLabel  = formatarData(msg.dataISO);
      const mostrarData = dataLabel && dataLabel !== ultimaData;
      if (mostrarData) ultimaData = dataLabel;
      const showAvatar = !isMe && (i === 0 || active.messages[i - 1]?.from === "me");

      return (
        <div key={msg.id}>
          {mostrarData && (
            <div className="flex justify-center my-4">
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{dataLabel}</span>
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
      <Header />
      <ErroToast msg={erro} onDismiss={() => setErro(null)} />

      {/* Top bar */}
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
        <button onClick={carregarConversas} className="text-gray-400 hover:text-green-600 border-none bg-transparent cursor-pointer transition-colors">
          <IconRefresh />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ══ Sidebar ══ */}
        <aside className={[
          "bg-white border-r border-gray-100 flex-col flex-shrink-0",
          mobileView === "list" ? "flex w-full" : "hidden",
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
            {carregando ? (
              <div className="flex flex-col gap-3 p-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-2 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <p className="text-gray-400 text-sm font-medium">Nenhuma conversa encontrada</p>
              </div>
            ) : filteredConvs.map(conv => (
              <button key={conv.id} onClick={() => abrirConversa(conv.id)}
                className={[
                  "w-full flex items-center gap-3 px-4 py-3.5 text-left border-none cursor-pointer transition-all duration-150 border-l-4",
                  activeId === conv.id
                    ? "bg-green-50 border-l-green-500"
                    : "bg-transparent border-l-transparent hover:bg-gray-50",
                ].join(" ")}>
                <Avatar initials={conv.avatar} color={conv.avatarColor} fotoPerfil={conv.fotoPerfil} size="md" online={conv.online} />
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
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* ══ Área de chat ══ */}
        {!active ? (
          <div className="flex-1 hidden sm:flex flex-col items-center justify-center bg-gray-50 gap-3">
            <IconBubble />
            <p className="text-sm font-semibold text-gray-400">Selecciona uma conversa</p>
            <p className="text-xs text-gray-300">As tuas mensagens aparecem aqui</p>
          </div>
        ) : (
          <div className={["flex-1 flex-col overflow-hidden", mobileView === "chat" ? "flex" : "hidden sm:flex"].join(" ")}>

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-3 sm:px-5 py-3.5 flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button onClick={() => setMobileView("list")}
                className="sm:hidden w-8 h-8 flex items-center justify-center text-gray-500 cursor-pointer border-none bg-transparent flex-shrink-0">
                <IconChevronLeft />
              </button>
              <Avatar initials={active.avatar} color={active.avatarColor} fotoPerfil={active.fotoPerfil} size="md" online={active.online} />
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

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-3" style={{ background: "#f8fafc" }}>
              {carregandoMsgs ? (
                <div className="flex flex-col gap-3 py-4">
                  {[1,2,3].map(i => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} animate-pulse`}>
                      <div className={`h-10 rounded-2xl bg-gray-200 ${i % 2 === 0 ? "w-40" : "w-52"}`} />
                    </div>
                  ))}
                </div>
              ) : active.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2">
                  <IconBubble />
                  <p className="text-sm font-medium">Nenhuma mensagem ainda</p>
                  <p className="text-xs">Envia a primeira mensagem!</p>
                </div>
              ) : (
                renderMensagens()
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-3 sm:px-4 py-3 flex-shrink-0">
              <div className="flex items-end gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 cursor-pointer border-none bg-transparent transition-colors pb-1">
                  <IconImage />
                </button>
                <div className="flex-1">
                  <textarea ref={inputRef} rows={1} value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escreva uma mensagem..."
                    className="w-full resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors max-h-28 overflow-y-auto"
                    style={{ lineHeight: "1.5" }} />
                </div>
                <button onClick={enviar} disabled={!inputText.trim() || enviando}
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
              <Avatar initials={active.avatar} color={active.avatarColor} fotoPerfil={active.fotoPerfil} size="lg" online={active.online} />
              <p className="mt-3 text-base font-black text-gray-900 text-center">{active.name}</p>
              <div className="flex items-center gap-0.5 mt-1">
                <IconStar /><IconStar /><IconStar /><IconStar /><IconStar />
                <span className="text-xs text-gray-500 ml-1">Verificado</span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Acções</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Ver perfil do vendedor", icon: "👤" },
                  { label: "Bloquear contacto",      icon: "🚫" },
                  { label: "Reportar conversa",       icon: "⚠️" },
                ].map(a => (
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