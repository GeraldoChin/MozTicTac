Useanunciosdestaque// ─────────────────────────────────────────────────────────────────
// MOZTICTAC — Hook: useAnunciosDestaque
// Estado global de anúncios pagos em memória (sem Redux/Context extra)
// Usado por: SecaoVendas (ModalPromocao) + TopTendencias
//
// Backend real: GET /publico/destaques  → publicoControlador.listarDestaques
// Quando um produto é promovido via POST /promocoes/contratar, o backend
// cria um AnuncioDestaque com inicioEm/fimEm — o endpoint /publico/destaques
// já os devolve. Este hook faz polling a cada 30s e também aceita
// actualizações locais imediatas (para UX responsivo sem esperar o servidor).
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

// ── Store singleton (partilhado entre instâncias do hook) ─────────
let _destaques    = [];           // lista actual
let _listeners    = new Set();    // callbacks registados
let _lastFetch    = 0;
let _polling      = null;

function notificar() {
  _listeners.forEach(fn => fn([..._destaques]));
}

function adicionarDestaque(produto, plano) {
  // Adiciona localmente para UX imediata
  const jaExiste = _destaques.some(d => d.id === produto.id);
  if (!jaExiste) {
    _destaques = [
      {
        id:               produto.id,
        nome:             produto.nome,
        preco:            produto.preco,
        imagens:          produto.imagens ?? [],
        // campos que TopTendencias usa
        tag:              "Anúncio",
        hashtag:          `#${produto.nome}`,
        badge:            plano?.nome ?? "Em destaque",
        cat:              produto.catNome?.toLowerCase() ?? "destaque",
        img:              produto.imagens?.[0] ?? null,
        hot:              plano?.id === "premium",
        // metadados
        _local: true,
        _expiraEm: Date.now() + (plano?.duracaoDias ?? 7) * 86400000,
      },
      ..._destaques,
    ];
    notificar();
  }
}

async function fetchDestaques() {
  try {
    const res  = await fetch(`${BASE_URL}/publico/destaques`);
    const data = await res.json();
    const lista = (data.success ? data.data : data.dados) ?? [];

    // Mesclar: manter entradas locais recentes que o servidor ainda não tem
    const idsServidor = new Set(lista.map(d => d.id));
    const locaisAtivos = _destaques.filter(
      d => d._local && !idsServidor.has(d.id) && d._expiraEm > Date.now()
    );

    _destaques = [
      ...locaisAtivos,
      ...lista.map(d => ({
        id:      d.id,
        nome:    d.nome,
        preco:   d.preco,
        imagens: d.imagens ?? [],
        tag:     "Anúncio",
        hashtag: `#${d.nome}`,
        badge:   "Em destaque",
        cat:     d.categoria?.nome?.toLowerCase() ?? "destaque",
        img:     d.imagens?.[0] ?? null,
        hot:     false,
      })),
    ];
    _lastFetch = Date.now();
    notificar();
  } catch (_) {
    // silencioso — mantém dados anteriores
  }
}

function iniciarPolling() {
  if (_polling) return;
  fetchDestaques();
  _polling = setInterval(fetchDestaques, 30_000); // a cada 30s
}

// ── Hook público ──────────────────────────────────────────────────
export function useAnunciosDestaque() {
  const [destaques, setDestaques] = useState([..._destaques]);

  useEffect(() => {
    _listeners.add(setDestaques);
    iniciarPolling();
    // Forçar fetch se dados têm mais de 60s
    if (Date.now() - _lastFetch > 60_000) fetchDestaques();
    return () => _listeners.delete(setDestaques);
  }, []);

  const promoverProduto = useCallback((produto, plano) => {
    adicionarDestaque(produto, plano);
  }, []);

  return { destaques, promoverProduto };
}

// Export directo para usar fora de componentes React (ex: callback do modal)
export { adicionarDestaque };