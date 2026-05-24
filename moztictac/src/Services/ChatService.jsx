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
    // FIX: token passado na criação para evitar ligação sem autenticação
    const token = localStorage.getItem("token");
    socket = io(BASE_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token },
    });

    // Re-autenticar automaticamente se o token mudar
    socket.on("connect_error", (err) => {
      if (err.message === "Token inválido" || err.message === "Token não fornecido") {
        const newToken = localStorage.getItem("token");
        if (newToken) {
          socket.auth = { token: newToken };
          setTimeout(() => socket.connect(), 1000);
        }
      }
    });

    // Entrar nas salas sempre que (re)conectar
    socket.on("connect", () => {
      socket.emit("entrar-conversas");
    });
  }
  return socket;
}

export function connectSocket(token) {
  const s = getSocket();

  // Actualizar token se fornecido
  if (token) s.auth = { token };

  if (s.connected) {
    // Já conectado — garantir que está nas salas
    s.emit("entrar-conversas");
  } else {
    s.connect();
    // O evento "connect" no getSocket já trata do entrar-conversas
  }
  return s;
}

export function disconnectSocket() {
  // Não desconectar — singleton global; só no logout
}

export function forceDisconnectSocket() {
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

export async function iniciarConversa(destinatarioId, infoVendedor = {}) {
  const data = await apiFetch(`${API_PREFIX}/chat/iniciar/${destinatarioId}`, { method: "POST" });
  const conv = data.dados ?? data.data;

  if (!conv.outroParticipante) {
    conv.outroParticipante = {
      id:           destinatarioId,
      nomeCompleto: infoVendedor.nome ?? infoVendedor.nomeCompleto ?? "Vendedor",
      fotoPerfil:   infoVendedor.fotoPerfil ?? null,
    };
  }

  return conv;
}

export async function listarConversas() {
  const data = await apiFetch(`${API_PREFIX}/chat`);
  return data.dados ?? data.data ?? [];
}

export async function obterMensagens(conversaId, pagina = 1) {
  const data = await apiFetch(`${API_PREFIX}/chat/${conversaId}/mensagens?pagina=${pagina}`);
  return data.dados ?? data.data ?? { total: 0, pagina: 1, mensagens: [] };
}

// ─────────────────────────────────────────────
// Socket.io — Eventos emitidos pelo cliente
// ─────────────────────────────────────────────

export function entrarConversa(conversaId) {
  // As salas são geridas automaticamente via "entrar-conversas" no connect
  // Mas emitimos novamente para garantir que esta conversa específica está activa
  const s = getSocket();
  if (s.connected) {
    s.emit("entrar-conversas");
  }
}

export function sairConversa(conversaId) {
  // O backend não tem este evento
}

// FIX: garantir que o socket está conectado antes de enviar
export function enviarMensagem({ conversaId, conteudo }) {
  const s = getSocket();

  if (!s.connected) {
    // Socket desconectado — reconectar e enviar após ligação
    const token = localStorage.getItem("token");
    if (token) s.auth = { token };
    s.connect();
    s.once("connect", () => {
      s.emit("entrar-conversas");
      s.emit("chat:mensagem", { conversaId, conteudo });
    });
  } else {
    s.emit("chat:mensagem", { conversaId, conteudo });
  }
}

export function marcarLidas(conversaId) {
  const s = getSocket();
  if (s.connected) {
    s.emit("chat:lida", { conversaId });
  }
}

// ─────────────────────────────────────────────
// Socket.io — Eventos escutados pelo cliente
// ─────────────────────────────────────────────

export function onNovaMensagem(cb) {
  getSocket().on("chat:mensagem", cb);
  return () => getSocket().off("chat:mensagem", cb);
}

export function onMensagensLidas(cb) {
  getSocket().on("chat:lida", cb);
  return () => getSocket().off("chat:lida", cb);
}

export function onPresenca(cb) {
  getSocket().on("presenca", cb);
  return () => getSocket().off("presenca", cb);
}

export function onErroSocket(cb) {
  getSocket().on("erro", cb);
  return () => getSocket().off("erro", cb);
}