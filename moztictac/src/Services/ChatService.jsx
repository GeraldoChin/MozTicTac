// ─────────────────────────────────────────────
// MOZTICTAC — SERVIÇO DE CHAT (REST + Socket.io)
// ─────────────────────────────────────────────
import { io } from "socket.io-client";

const BASE_URL   = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const API_PREFIX = "/api/v1";

// ── Instância Socket.io (singleton) ──────────
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(BASE_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function connectSocket(token) {
  const s = getSocket();
  if (token) s.auth = { token };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

// ── Helper fetch com auth ─────────────────────
async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    ...opts,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? err.mensagem ?? `Erro ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────
// API REST
// ─────────────────────────────────────────────

/**
 * Iniciar ou obter conversa com um destinatário.
 * Backend devolve: { sucesso, dados: conversa }
 * A conversa pode não ter outroParticipante — é enriquecida aqui.
 */
export async function iniciarConversa(destinatarioId, infoVendedor = {}) {
  const data = await apiFetch(`${API_PREFIX}/chat/iniciar/${destinatarioId}`, { method: "POST" });
  const conv = data.dados ?? data.data;

  // Garantir que outroParticipante existe (o backend pode não devolvê-lo na criação)
  if (!conv.outroParticipante) {
    conv.outroParticipante = {
      id:           destinatarioId,
      nomeCompleto: infoVendedor.nome ?? infoVendedor.nomeCompleto ?? "Vendedor",
      fotoPerfil:   infoVendedor.fotoPerfil ?? null,
    };
  }

  return conv;
}

/**
 * Listar todas as conversas do utilizador autenticado.
 * Backend devolve: { sucesso, dados: conversa[] }
 */
export async function listarConversas() {
  const data = await apiFetch(`${API_PREFIX}/chat`);
  return data.dados ?? data.data ?? [];
}

/**
 * Obter mensagens paginadas de uma conversa.
 * Backend devolve: { sucesso, dados: { total, pagina, mensagens } }
 */
export async function obterMensagens(conversaId, pagina = 1) {
  const data = await apiFetch(`${API_PREFIX}/chat/${conversaId}/mensagens?pagina=${pagina}`);
  return data.dados ?? data.data ?? { total: 0, pagina: 1, mensagens: [] };
}

// ─────────────────────────────────────────────
// Socket.io — Eventos emitidos pelo cliente
// ─────────────────────────────────────────────

export function entrarConversa(conversaId) {
  getSocket().emit("entrar_conversa", { conversaId });
}

export function sairConversa(conversaId) {
  getSocket().emit("sair_conversa", { conversaId });
}

export function enviarMensagem({ conversaId, conteudo }) {
  getSocket().emit("enviar_mensagem", { conversaId, conteudo });
}

export function marcarLidas(conversaId) {
  getSocket().emit("marcar_lidas", { conversaId });
}

// ─────────────────────────────────────────────
// Socket.io — Eventos escutados pelo cliente
// ─────────────────────────────────────────────

export function onNovaMensagem(cb) {
  getSocket().on("nova_mensagem", cb);
  return () => getSocket().off("nova_mensagem", cb);
}

export function onMensagensLidas(cb) {
  getSocket().on("mensagens_lidas", cb);
  return () => getSocket().off("mensagens_lidas", cb);
}

export function onPresenca(cb) {
  getSocket().on("presenca", cb);
  return () => getSocket().off("presenca", cb);
}

export function onErroSocket(cb) {
  getSocket().on("erro", cb);
  return () => getSocket().off("erro", cb);
}