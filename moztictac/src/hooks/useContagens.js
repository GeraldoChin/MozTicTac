// src/hooks/useContagens.js
// Hook global que qualquer página pode usar para obter as contagens do header
import { useState, useEffect } from "react";
import { lerCarrinho } from "../utils/carrinho";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function req(caminho) {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const res = await fetch(`${BASE_URL}${caminho}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useContagens() {
  const [contagemCarrinho,      setContagemCarrinho]      = useState(0);
  const [contagemWishlist,      setContagemWishlist]      = useState(0);
  const [contagemNotificacoes,  setContagemNotificacoes]  = useState(0);
  const [contagemMensagens,     setContagemMensagens]     = useState(0);

  useEffect(() => {
    // ── Carrinho — lê do localStorage (não precisa de API) ──
    function actualizarCarrinho() {
      const itens = lerCarrinho();
      const total = itens.reduce((acc, i) => acc + (i.quantidade ?? 1), 0);
      setContagemCarrinho(total);
    }
    actualizarCarrinho();

    // Actualiza quando outro tab/componente mudar o carrinho
    window.addEventListener("storage",           actualizarCarrinho);
    window.addEventListener("carrinho-atualizado", actualizarCarrinho);

    // ── Desejos, notificações e mensagens — vêm da API ──
    async function carregarRemoto() {
      const [resDesejos, resNotif, resMsgs] = await Promise.all([
        req("/desejos"),
        req("/usuarios/notificacoes"),
        req("/chat/conversas"),
      ]);

      // Desejos
      if (resDesejos) {
        const lista = resDesejos.data ?? resDesejos.dados ?? [];
        setContagemWishlist(Array.isArray(lista) ? lista.length : 0);
      }

      // Notificações não lidas
      if (resNotif) {
        const d = resNotif.dados ?? resNotif.data ?? {};
        setContagemNotificacoes(d.naoLidas ?? 0);
      }

      // Mensagens não lidas
      if (resMsgs) {
        const lista = resMsgs.dados ?? resMsgs.data ?? [];
        const total = Array.isArray(lista)
          ? lista.reduce((acc, c) => acc + (c.naoLidas ?? 0), 0)
          : 0;
        setContagemMensagens(total);
      }
    }

    const token = localStorage.getItem("token");
    if (token) carregarRemoto();

    return () => {
      window.removeEventListener("storage",            actualizarCarrinho);
      window.removeEventListener("carrinho-atualizado", actualizarCarrinho);
    };
  }, []);

  return {
    contagemCarrinho,
    contagemWishlist,
    contagemNotificacoes,
    contagemMensagens,
  };
}