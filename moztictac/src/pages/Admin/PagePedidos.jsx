// ─────────────────────────────────────────────
// MOZTICTAC — PagePedidos (Admin) — Conectado à API real
// Endpoints usados:
//   GET  /admin/pedidos                      → listarTodosPedidos
//   GET  /admin/dashboard/kpis               → obterKpis (para totais)
//   PUT  /admin/pedidos/:id/estado           → alterarEstadoPedido
//   POST /pedidos/:id/disputa/resolver       → resolverDisputa (via adminControlador)
//   GET  /admin/logs                         → obterLogs (para log de disputas)
// ─────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function api(caminho, opcoes = {}) {
  const token =
    localStorage.getItem("token") || localStorage.getItem("adminToken");
  const resp = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });
  const dados = await resp.json();
  if (!resp.ok)
    throw new Error(dados.mensagem || dados.message || `Erro ${resp.status}`);
  return dados;
}

// ── API calls ─────────────────────────────────────────────────────
const apiPedidos = {
  listar: (pagina = 1, estado, busca, dataInicio, dataFim) => {
    const p = new URLSearchParams({ pagina });
    if (estado && estado !== "todos") p.set("estado", estado);
    if (busca) p.set("busca", busca);
    if (dataInicio) p.set("dataInicio", dataInicio);
    if (dataFim) p.set("dataFim", dataFim);
    return api(`/admin/pedidos?${p}`);
  },
  kpis: () => api("/admin/dashboard/kpis"),
  alterarEstado: (id, estado) =>
    api(`/admin/pedidos/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    }),
  resolverDisputa: (pedidoId, decisao, reembolsarComprador, valorReembolso) =>
    api(`/admin/disputas/${pedidoId}/resolver`, {
      method: "POST",
      body: JSON.stringify({ decisao, reembolsarComprador, valorReembolso }),
    }),
  logs: (pagina = 1, acao) => {
    const p = new URLSearchParams({ pagina });
    if (acao) p.set("acao", acao);
    return api(`/admin/logs?${p}`);
  },
};

// ── Mapeadores ────────────────────────────────────────────────────
const ESTADO_BACKEND_MAP = {
  AGUARDANDO_PAGAMENTO: "pendente",
  PAGO:                 "pago",
  EM_PROCESSAMENTO:     "processamento",
  ENVIADO:              "enviado",
  ENTREGUE:             "concluido",
  CANCELADO:            "cancelado",
  REEMBOLSADO:          "reembolso",
  EM_DISPUTA:           "disputa",
};

const ESTADO_FRONTEND_TO_BACKEND = {
  pendente:      "AGUARDANDO_PAGAMENTO",
  pago:          "PAGO",
  processamento: "EM_PROCESSAMENTO",
  enviado:       "ENVIADO",
  concluido:     "ENTREGUE",
  cancelado:     "CANCELADO",
  reembolso:     "REEMBOLSADO",
  disputa:       "EM_DISPUTA",
};

function mapPedido(p) {
  const estadoNorm =
    ESTADO_BACKEND_MAP[p.estado] ??
    (p.estado ?? "").toLowerCase().replace(/_/g, "");
  return {
    id:               p.id,
    idCurto:          "#" + (p.id?.substring(0, 6)?.toUpperCase() ?? "??????"),
    comprador:        p.comprador?.nomeCompleto ?? "—",
    compradorEmail:   p.comprador?.email ?? "",
    compradorCidade:  p.comprador?.cidade ?? "",
    vendedor:         p.vendedor?.nomeCompleto ?? "—",
    vendedorEmail:    p.vendedor?.email ?? "",
    produto:          p.produto ?? p.itens?.[0]?.nome ?? "Produto",
    total:            Number(p.total ?? 0),
    taxaPlataforma:   Number(p.taxaPlataforma ?? 0),
    metodo:           p.metodoPagamento ?? "—",
    provincia:        p.comprador?.cidade ?? "—",
    estado:           estadoNorm,
    estadoOriginal:   p.estado,
    afiliado:         p.afiliado ?? null,
    emDisputa:        !!p.emDisputa,
    disputaId:        p.disputaId ?? null,
    data:             p.data
      ? new Date(p.data).toLocaleDateString("pt-MZ", { day: "numeric", month: "short", year: "numeric" })
      : "—",
    dataRaw:          p.data ?? null,
    fraude:           false, // campo não existe ainda no backend; placeholder
    historico:        [], // carregado no detalhe sob demanda
  };
}

// ── Paleta ────────────────────────────────────────────────────────
const C = {
  green:      "#16a34a",
  greenDim:   "#dcfce7",
  greenMuted: "rgba(22,163,74,0.12)",
  bg:         "#f8fafc",
  card:       "#ffffff",
  border:     "#e2e8f0",
  text:       "#0f172a",
  textSub:    "#64748b",
  textMute:   "#94a3b8",
  red:        "#ef4444",
  redDim:     "#fef2f2",
  amber:      "#f59e0b",
  amberDim:   "#fffbeb",
  blue:       "#3b82f6",
  blueDim:    "#eff6ff",
  purple:     "#8b5cf6",
  purpleDim:  "#f5f3ff",
};

const ESTADOS = {
  pendente:      { label: "Pendente",      type: "warning", cor: C.amber  },
  pago:          { label: "Pago",          type: "info",    cor: C.blue   },
  processamento: { label: "Processamento", type: "info",    cor: C.blue   },
  enviado:       { label: "Enviado",       type: "info",    cor: C.blue   },
  concluido:     { label: "Concluído",     type: "success", cor: C.green  },
  cancelado:     { label: "Cancelado",     type: "danger",  cor: C.red    },
  disputa:       { label: "Disputa",       type: "danger",  cor: C.red    },
  reembolso:     { label: "Reembolso",     type: "purple",  cor: C.purple },
};

// ── Ícones ────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }) {
  const s = {
    width: size, height: size, stroke: color, fill: "none",
    strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0,
  };
  const icons = {
    "shopping-bag":   <svg style={s} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    "bell":           <svg style={s} viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    "check":          <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    "x":              <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    "eye":            <svg style={s} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    "search":         <svg style={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    "download":       <svg style={s} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    "shield":         <svg style={s} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "bar-chart":      <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    "settings":       <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    "alert-triangle": <svg style={s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    "trending-up":    <svg style={s} viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    "dollar":         <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    "refresh":        <svg style={s} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.96"/></svg>,
    "truck":          <svg style={s} viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    "credit-card":    <svg style={s} viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    "user":           <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    "map-pin":        <svg style={s} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    "clock":          <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    "link":           <svg style={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    "info":           <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    "rotate-ccw":     <svg style={s} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.96"/></svg>,
    "zap":            <svg style={s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    "chevron-left":   <svg style={s} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
    "chevron-right":  <svg style={s} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  };
  return icons[name] ?? null;
}

// ── Componentes base ──────────────────────────────────────────────
function Badge({ label, type = "default" }) {
  const map = {
    success: { bg: C.greenDim,  color: C.green  },
    warning: { bg: C.amberDim,  color: C.amber  },
    danger:  { bg: C.redDim,    color: C.red    },
    info:    { bg: C.blueDim,   color: C.blue   },
    purple:  { bg: C.purpleDim, color: C.purple },
    default: { bg: "#f1f5f9",   color: C.textSub },
  };
  const s = map[type] ?? map.default;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: s.bg, color: s.color, display: "inline-block", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, icon, color = C.green, trend, loading }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={17} color={color} />
        </div>
        {trend !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: trend >= 0 ? C.greenDim : C.redDim, color: trend >= 0 ? C.green : C.red }}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div>
        {loading
          ? <div style={{ height: 24, width: 60, borderRadius: 6, background: "#e2e8f0", animation: "pulse 1.5s ease-in-out infinite" }} />
          : <p style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>}
        <p style={{ fontSize: 12, color: C.textSub, marginTop: 3, fontWeight: 500 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: C.textMute, marginTop: 1 }}>{sub}</p>}
      </div>
    </div>
  );
}

function Btn({ label, icon, onClick, variant = "primary", size = "md", disabled = false, loading = false }) {
  const styles = {
    primary:   { bg: C.green,       color: "#fff",    border: "none" },
    secondary: { bg: "transparent", color: C.textSub, border: `1.5px solid ${C.border}` },
    danger:    { bg: C.red,         color: "#fff",    border: "none" },
    ghost:     { bg: C.greenMuted,  color: C.green,   border: "none" },
    amber:     { bg: C.amberDim,    color: C.amber,   border: "none" },
    blue:      { bg: C.blueDim,     color: C.blue,    border: "none" },
  };
  const pad = size === "sm" ? "6px 12px" : "9px 18px";
  const fs  = size === "sm" ? 12 : 13;
  const s   = styles[variant] ?? styles.primary;
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: pad, fontSize: fs, fontWeight: 700, background: (disabled || loading) ? "#f1f5f9" : s.bg, color: (disabled || loading) ? C.textMute : s.color, border: s.border || "none", borderRadius: 8, cursor: (disabled || loading) ? "not-allowed" : "pointer", opacity: (disabled || loading) ? 0.65 : 1, whiteSpace: "nowrap", fontFamily: "inherit", transition: "opacity 0.15s" }}>
      {loading
        ? <div style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        : icon && <Icon name={icon} size={13} color={(disabled || loading) ? C.textMute : s.color} />}
      {label}
    </button>
  );
}

function Spinner({ size = 24 }) {
  return <div style={{ width: size, height: size, border: "3px solid #e2e8f0", borderTopColor: C.green, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}

function Toast({ msg, tipo = "info" }) {
  if (!msg) return null;
  const bg = tipo === "erro" ? C.red : tipo === "sucesso" ? C.green : C.text;
  return (
    <div style={{ position: "fixed", top: 20, right: 20, background: bg, color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 300, maxWidth: 380, animation: "fadeIn 0.2s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
      {msg}
    </div>
  );
}

function Modal({ open, onClose, children, width = 560 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: C.card, borderRadius: 18, width: "100%", maxWidth: width, boxShadow: "0 24px 80px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Paginacao({ pagina, totalPaginas, total, onChange }) {
  if (totalPaginas <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 12, color: C.textMute }}>Página {pagina} de {totalPaginas} · {total} registos</span>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={() => onChange(pagina - 1)} disabled={pagina <= 1}
          style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", cursor: pagina <= 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: pagina <= 1 ? 0.4 : 1 }}>
          <Icon name="chevron-left" size={14} color={C.textSub} />
        </button>
        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
          let pg = i + 1;
          if (totalPaginas > 5) {
            if (pagina <= 3) pg = i + 1;
            else if (pagina >= totalPaginas - 2) pg = totalPaginas - 4 + i;
            else pg = pagina - 2 + i;
          }
          return (
            <button key={pg} onClick={() => onChange(pg)}
              style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${pg === pagina ? C.green : C.border}`, background: pg === pagina ? C.green : "transparent", color: pg === pagina ? "#fff" : C.textSub, fontSize: 12, fontWeight: pg === pagina ? 700 : 400, cursor: "pointer" }}>
              {pg}
            </button>
          );
        })}
        <button onClick={() => onChange(pagina + 1)} disabled={pagina >= totalPaginas}
          style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", cursor: pagina >= totalPaginas ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: pagina >= totalPaginas ? 0.4 : 1 }}>
          <Icon name="chevron-right" size={14} color={C.textSub} />
        </button>
      </div>
    </div>
  );
}

// ── HOOK: carregar pedidos com filtros ────────────────────────────
function usePedidos(filtroEstado, busca, pagina) {
  const [pedidos, setPedidos]           = useState([]);
  const [total, setTotal]               = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando]     = useState(true);
  const [erro, setErro]                 = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const estadoBackend =
        filtroEstado && filtroEstado !== "todos"
          ? ESTADO_FRONTEND_TO_BACKEND[filtroEstado] ?? filtroEstado.toUpperCase()
          : undefined;
      const res = await apiPedidos.listar(pagina, estadoBackend, busca || undefined);
      const d   = res.success ? res.data : res.sucesso ? res.dados : {};
      setPedidos((d.pedidos ?? []).map(mapPedido));
      setTotal(d.total ?? 0);
     setTotalPaginas(
  d.totalPaginas ?? (Math.ceil((d.total ?? 0) / 20) || 1)
);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [filtroEstado, busca, pagina]);

  useEffect(() => { carregar(); }, [carregar]);

  return { pedidos, setPedidos, total, totalPaginas, carregando, erro, recarregar: carregar };
}

// ── 1. VISÃO GERAL ────────────────────────────────────────────────
function SubVisaoGeral({ kpis, kpisCarregando, onSelectTab, onSelectPedido }) {
  const [pedidosRecentes, setPedidosRecentes] = useState([]);
  const [carregandoRecentes, setCarregandoRecentes] = useState(true);

  useEffect(() => {
    apiPedidos.listar(1, undefined, undefined)
      .then(res => {
        const d = res.success ? res.data : res.sucesso ? res.dados : {};
        setPedidosRecentes((d.pedidos ?? []).slice(0, 5).map(mapPedido));
      })
      .catch(() => {})
      .finally(() => setCarregandoRecentes(false));
  }, []);

  const estMap = kpis?.pedidosHoje ?? {};
  const disputasCount  = estMap["EM_DISPUTA"]  ?? 0;
  const reembolsoCount = estMap["REEMBOLSADO"] ?? 0;
  const canceladoCount = estMap["CANCELADO"]   ?? 0;
  const concluidoCount = estMap["ENTREGUE"]    ?? 0;
  const pagoCount      = estMap["PAGO"]        ?? 0;
  const enviadoCount   = estMap["ENVIADO"]     ?? 0;

  const totalEstados = Object.values(estMap).reduce((s, v) => s + v, 0);

  const distribuicao = [
    { label: "Concluídos",  val: concluidoCount, cor: C.green,  type: "success" },
    { label: "Pagos",       val: pagoCount,      cor: C.blue,   type: "info"    },
    { label: "Enviados",    val: enviadoCount,   cor: C.blue,   type: "info"    },
    { label: "Cancelados",  val: canceladoCount, cor: C.red,    type: "danger"  },
    { label: "Disputas",    val: disputasCount,  cor: C.red,    type: "danger"  },
    { label: "Reembolsos",  val: reembolsoCount, cor: C.purple, type: "purple"  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPIs principais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <StatCard label="Pedidos Hoje"    value={kpis?.financeiro?.pedidosHoje ?? 0}                                              icon="shopping-bag"   color={C.blue}   loading={kpisCarregando} />
        <StatCard label="Receita Hoje"    value={`${((kpis?.financeiro?.receitaHoje ?? 0) / 1000).toFixed(1)}k MZN`}             icon="dollar"         color={C.green}  loading={kpisCarregando} />
        <StatCard label="Concluídos"      value={concluidoCount}                                                                  icon="check"          color={C.green}  loading={kpisCarregando} />
        <StatCard label="Em Disputa"      value={kpis?.alertas?.disputasAbertas ?? 0}                                             icon="alert-triangle" color={C.red}    loading={kpisCarregando} />
        <StatCard label="Saques Análise"  value={kpis?.alertas?.saquesEmAnalise ?? 0}                                            icon="rotate-ccw"     color={C.purple} loading={kpisCarregando} />
      </div>

      {/* Distribuição + alertas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📊 Distribuição por Estado (hoje)</h3>
          {kpisCarregando
            ? <div style={{ display: "flex", justifyContent: "center", padding: 24 }}><Spinner size={24} /></div>
            : distribuicao.map(({ label, val, cor, type }, i) => {
                const pct = totalEstados > 0 ? Math.round((val / totalEstados) * 100) : 0;
                return (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Badge label={label} type={type} />
                        <span style={{ fontSize: 12, color: C.textMute }}>({val})</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: cor }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: C.border, borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: cor, borderRadius: 99, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>📋 Pedidos Recentes</h3>
          <p style={{ fontSize: 12, color: C.textMute, marginBottom: 14 }}>Últimas 5 transacções registadas</p>
          {carregandoRecentes
            ? <div style={{ display: "flex", justifyContent: "center", padding: 24 }}><Spinner size={20} /></div>
            : pedidosRecentes.map((p, i) => {
                const est = ESTADOS[p.estado] ?? {};
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < pedidosRecentes.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}
                    onClick={() => onSelectPedido(p)}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: (est.cor || C.blue) + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="shopping-bag" size={15} color={est.cor || C.blue} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.idCurto} — {p.produto}</p>
                      <p style={{ fontSize: 11, color: C.textMute }}>{p.comprador} → {p.vendedor} · {p.data}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{p.total.toLocaleString("pt-MZ")} MZN</p>
                      <Badge label={est.label || p.estado} type={est.type || "default"} />
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Alerta de disputas */}
      {(kpis?.alertas?.disputasAbertas ?? 0) > 0 && (
        <div style={{ background: C.redDim, border: `1.5px solid ${C.red}30`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="alert-triangle" size={16} color={C.red} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.red }}>
              {kpis.alertas.disputasAbertas} disputa(s) a requerer atenção imediata
            </h3>
          </div>
          <Btn label="Ver todas as disputas" icon="shield" variant="danger" size="sm" onClick={() => onSelectTab("disputas")} />
        </div>
      )}
    </div>
  );
}

// ── 2. LISTA DE PEDIDOS ───────────────────────────────────────────
function SubListaPedidos({ onSelectPedido, showToast }) {
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [buscaInput, setBuscaInput]     = useState("");
  const [busca, setBusca]               = useState("");
  const [pagina, setPagina]             = useState(1);
  const [acaoId, setAcaoId]             = useState(null);

  // Debounce da busca
  useEffect(() => {
    const t = setTimeout(() => { setBusca(buscaInput); setPagina(1); }, 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  const { pedidos, setPedidos, total, totalPaginas, carregando, erro, recarregar } =
    usePedidos(filtroEstado, busca, pagina);

  function mudarFiltro(v) { setFiltroEstado(v); setPagina(1); }

  async function handleCancelar(p) {
    if (!window.confirm(`Cancelar pedido ${p.idCurto}?`)) return;
    setAcaoId(p.id);
    try {
      await apiPedidos.alterarEstado(p.id, "CANCELADO");
      setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, estado: "cancelado" } : x));
      showToast(`Pedido ${p.idCurto} cancelado.`, "sucesso");
    } catch (e) {
      showToast(`Erro: ${e.message}`, "erro");
    } finally {
      setAcaoId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filtros */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
            <Icon name="search" size={14} color={C.textMute} />
          </span>
          <input value={buscaInput} onChange={e => setBuscaInput(e.target.value)}
            placeholder="Pesquisar comprador, vendedor ou produto..."
            style={{ width: "100%", padding: "8px 12px 8px 32px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={filtroEstado} onChange={e => mudarFiltro(e.target.value)}
          style={{ padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.text, background: C.bg, fontFamily: "inherit", cursor: "pointer" }}>
          {[["todos","Todos os estados"],["pendente","Pendente"],["pago","Pago"],["enviado","Enviado"],["concluido","Concluído"],["cancelado","Cancelado"],["disputa","Disputa"],["reembolso","Reembolso"]].map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <Btn label="Actualizar" icon="refresh" variant="secondary" size="sm" onClick={recarregar} />
      </div>

      {/* Tabela */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {carregando ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><Spinner /></div>
        ) : erro ? (
          <div style={{ padding: 32, textAlign: "center", color: C.red, fontSize: 13 }}>
            {erro} — <button onClick={recarregar} style={{ color: C.blue, background: "none", border: "none", cursor: "pointer" }}>Tentar novamente</button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${C.border}`, background: C.bg }}>
                  {["Pedido","Produto","Comprador","Vendedor","Método","Total (MZN)","Data","Estado","Ações"].map((c, i) => (
                    <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: C.textMute, whiteSpace: "nowrap" }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: 48, textAlign: "center", color: C.textMute }}>Nenhum pedido encontrado.</td></tr>
                )}
                {pedidos.map(p => {
                  const est    = ESTADOS[p.estado] ?? {};
                  const emAcao = acaoId === p.id;
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bg}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontWeight: 800, color: C.blue, fontFamily: "monospace", fontSize: 12 }}>{p.idCurto}</span>
                        {p.emDisputa && <span style={{ marginLeft: 6, fontSize: 10, background: C.redDim, color: C.red, fontWeight: 700, padding: "2px 6px", borderRadius: 99 }}>DISPUTA</span>}
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: C.text, maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.produto}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <p style={{ fontWeight: 600, color: C.text }}>{p.comprador}</p>
                        <p style={{ fontSize: 11, color: C.textMute }}>{p.compradorEmail}</p>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <p style={{ fontWeight: 600, color: C.text }}>{p.vendedor}</p>
                        <p style={{ fontSize: 11, color: C.textMute }}>{p.vendedorEmail}</p>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub }}>{p.metodo}</span>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: C.green, fontFamily: "monospace" }}>{p.total.toLocaleString("pt-MZ")}</td>
                      <td style={{ padding: "12px 14px", color: C.textSub, whiteSpace: "nowrap", fontSize: 12 }}>{p.data}</td>
                      <td style={{ padding: "12px 14px" }}><Badge label={est.label || p.estado} type={est.type || "default"} /></td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <Btn label="Ver" icon="eye" size="sm" variant="ghost" onClick={() => onSelectPedido(p)} />
                          {p.estado === "disputa" && (
                            <Btn label="Intervir" icon="shield" size="sm" variant="danger" loading={emAcao} onClick={() => onSelectPedido(p)} />
                          )}
                          {p.estado === "pendente" && (
                            <Btn label="Cancelar" icon="x" size="sm" variant="secondary" loading={emAcao} onClick={() => handleCancelar(p)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!carregando && !erro && (
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textMute, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Total: {total} pedidos</span>
            <Paginacao pagina={pagina} totalPaginas={totalPaginas} total={total} onChange={setPagina} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. DETALHE DO PEDIDO ──────────────────────────────────────────
function SubDetalhePedido({ pedido, onVoltar, showToast, recarregarLista }) {
  const [modalIntervir,  setModalIntervir]  = useState(false);
  const [modalReembolso, setModalReembolso] = useState(false);
  const [notaIntervencao, setNotaIntervencao] = useState("");
  const [acaoId, setAcaoId]               = useState(null);
  const est = ESTADOS[pedido.estado] ?? {};

  async function handleCancelar() {
    if (!window.confirm("Cancelar este pedido?")) return;
    setAcaoId(pedido.id);
    try {
      await apiPedidos.alterarEstado(pedido.id, "CANCELADO");
      showToast(`Pedido ${pedido.idCurto} cancelado.`, "sucesso");
      recarregarLista();
      onVoltar();
    } catch (e) {
      showToast(`Erro: ${e.message}`, "erro");
    } finally {
      setAcaoId(null);
    }
  }

  async function handleIntervir(favorComprador) {
    if (!notaIntervencao.trim()) { alert("Nota de intervenção obrigatória."); return; }
    setAcaoId(pedido.id);
    try {
      await apiPedidos.resolverDisputa(
        pedido.id,
        notaIntervencao,
        favorComprador,
        favorComprador ? pedido.total : undefined
      );
      const novoEstado = favorComprador ? "REEMBOLSADO" : "ENTREGUE";
      await apiPedidos.alterarEstado(pedido.id, novoEstado);
      showToast(`Disputa resolvida a favor do ${favorComprador ? "comprador" : "vendedor"}.`, "sucesso");
      setModalIntervir(false);
      recarregarLista();
      onVoltar();
    } catch (e) {
      showToast(`Erro: ${e.message}`, "erro");
    } finally {
      setAcaoId(null);
    }
  }

  async function handleReembolso() {
    setAcaoId(pedido.id);
    try {
      await apiPedidos.alterarEstado(pedido.id, "REEMBOLSADO");
      showToast(`Reembolso iniciado para ${pedido.idCurto}.`, "sucesso");
      setModalReembolso(false);
      recarregarLista();
      onVoltar();
    } catch (e) {
      showToast(`Erro: ${e.message}`, "erro");
    } finally {
      setAcaoId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={onVoltar}
          style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: C.textSub, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
          ← Voltar
        </button>
        <div style={{ width: 1, height: 24, background: C.border }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: (est.cor || C.blue) + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="shopping-bag" size={18} color={est.cor || C.blue} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Pedido {pedido.idCurto}</p>
            <p style={{ fontSize: 12, color: C.textMute }}>{pedido.produto} · {pedido.data}</p>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Badge label={est.label || pedido.estado} type={est.type || "default"} />
          {pedido.estado === "disputa" && (
            <Btn label="Intervir na Disputa" icon="shield" variant="danger" loading={!!acaoId} onClick={() => setModalIntervir(true)} />
          )}
          {["pago", "enviado", "processamento"].includes(pedido.estado) && (
            <Btn label="Forçar Reembolso" icon="rotate-ccw" variant="amber" loading={!!acaoId} onClick={() => setModalReembolso(true)} />
          )}
          {pedido.estado === "pendente" && (
            <Btn label="Cancelar pedido" icon="x" variant="secondary" loading={!!acaoId} onClick={handleCancelar} />
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Valor Total"      value={`${pedido.total.toLocaleString("pt-MZ")} MZN`}          icon="dollar"      color={C.green} />
        <StatCard label="Taxa Plataforma"  value={`${pedido.taxaPlataforma.toLocaleString("pt-MZ")} MZN`} icon="bar-chart"   color={C.blue} />
        <StatCard label="Método"           value={pedido.metodo}                                            icon="credit-card" color={C.blue} />
        <StatCard label="Afiliado"         value={pedido.afiliado || "Nenhum"}                             icon="link"        color={pedido.afiliado ? C.amber : C.textMute} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Detalhes */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📦 Detalhes do Pedido</h3>
          {[
            ["ID completo",   pedido.id],
            ["Produto",       pedido.produto],
            ["Data",          pedido.data],
            ["Método",        pedido.metodo],
            ["Localização",   pedido.provincia || "—"],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 12, color: C.textMute, fontWeight: 500 }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text, maxWidth: 220, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
            </div>
          ))}

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "COMPRADOR", nome: pedido.comprador, email: pedido.compradorEmail },
              { label: "VENDEDOR",  nome: pedido.vendedor,  email: pedido.vendedorEmail  },
            ].map(({ label, nome, email }, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 10, padding: 12, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 10, color: C.textMute, fontWeight: 700, marginBottom: 5 }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{nome}</p>
                <p style={{ fontSize: 11, color: C.textMute }}>{email}</p>
              </div>
            ))}
          </div>

          {pedido.afiliado && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: C.amberDim, borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.amber }}>🔗 Afiliado: {pedido.afiliado} — comissão pendente</p>
            </div>
          )}
        </div>

        {/* Info de estado */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📋 Estado Actual</h3>

          {/* Barra de progresso do escrow */}
          {(() => {
            const steps = [
              { label: "Criado",    estados: ["pendente"] },
              { label: "Pago",      estados: ["pago", "processamento"] },
              { label: "Enviado",   estados: ["enviado"] },
              { label: "Entregue",  estados: ["concluido"] },
            ];
            const idx = steps.findIndex(s => s.estados.includes(pedido.estado));
            const atual = idx === -1 ? 0 : idx;
            return (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  {steps.map((s, i) => {
                    const done = i <= atual && !["cancelado","reembolso","disputa"].includes(pedido.estado);
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? C.green : C.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon name="check" size={13} color={done ? "#fff" : C.textMute} />
                          </div>
                          <span style={{ fontSize: 10, color: done ? C.green : C.textMute, fontWeight: done ? 700 : 400, whiteSpace: "nowrap" }}>{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                          <div style={{ flex: 1, height: 2, background: i < atual && done ? C.green : C.border, margin: "0 4px", marginBottom: 16 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {pedido.estado === "disputa" && (
            <div style={{ padding: "12px 14px", background: C.redDim, borderRadius: 10, border: `1.5px solid ${C.red}30`, marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 4 }}>⚠️ Disputa Ativa</p>
              <p style={{ fontSize: 12, color: C.textSub }}>O comprador reportou um problema. Intervenha para mediar.</p>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <Btn label="Resolver" icon="shield" size="sm" variant="danger" onClick={() => setModalIntervir(true)} />
              </div>
            </div>
          )}

          {pedido.estado === "cancelado" && (
            <div style={{ padding: "12px 14px", background: C.redDim, borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.red }}>Pedido cancelado</p>
            </div>
          )}

          {pedido.estado === "reembolso" && (
            <div style={{ padding: "12px 14px", background: C.purpleDim, borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.purple }}>Reembolso em processo</p>
              <p style={{ fontSize: 12, color: C.textSub, marginTop: 3 }}>{pedido.total.toLocaleString("pt-MZ")} MZN a devolver via {pedido.metodo}</p>
            </div>
          )}

          {pedido.estado === "concluido" && (
            <div style={{ padding: "12px 14px", background: C.greenDim, borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.green }}>✅ Pedido concluído com sucesso</p>
              <p style={{ fontSize: 12, color: C.textSub, marginTop: 3 }}>Pagamento libertado ao vendedor.</p>
            </div>
          )}

          {/* Resumo financeiro */}
          <div style={{ marginTop: 16, padding: "12px 14px", background: C.bg, borderRadius: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", marginBottom: 10 }}>Resumo financeiro</p>
            {[
              { label: "Total pago pelo comprador", val: `${pedido.total.toLocaleString("pt-MZ")} MZN`, color: C.text },
              { label: "Taxa plataforma",           val: `${pedido.taxaPlataforma.toLocaleString("pt-MZ")} MZN`, color: C.red },
              { label: "Valor ao vendedor",         val: `${(pedido.total - pedido.taxaPlataforma).toLocaleString("pt-MZ")} MZN`, color: C.green },
            ].map(({ label, val, color }, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 12, color: C.textSub }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Intervir */}
      <Modal open={modalIntervir} onClose={() => setModalIntervir(false)} width={460}>
        <div style={{ padding: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.redDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="shield" size={20} color={C.red} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Intervir na Disputa</h3>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}>
            Pedido <strong>{pedido.idCurto}</strong> — {pedido.produto} · <strong>{pedido.total.toLocaleString("pt-MZ")} MZN</strong>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { titulo: "✅ Favor comprador", desc: `Iniciar reembolso de ${pedido.total.toLocaleString("pt-MZ")} MZN`, bg: C.blueDim, color: C.blue, onClick: () => handleIntervir(true) },
              { titulo: "✅ Favor vendedor",  desc: "Concluir pedido e libertar pagamento",                              bg: C.greenDim,color: C.green,onClick: () => handleIntervir(false) },
            ].map(({ titulo, desc, bg, color, onClick }, i) => (
              <button key={i} onClick={onClick}
                style={{ padding: 14, background: bg, border: `1.5px solid ${color}30`, borderRadius: 10, cursor: "pointer", textAlign: "left" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color }}>{titulo}</p>
                <p style={{ fontSize: 11, color: C.textMute, marginTop: 3 }}>{desc}</p>
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nota de intervenção *</label>
            <textarea value={notaIntervencao} onChange={e => setNotaIntervencao(e.target.value)} rows={3}
              placeholder="Descreve o motivo da intervenção..."
              style={{ width: "100%", padding: "10px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ padding: "10px 12px", background: C.amberDim, borderRadius: 8, fontSize: 12, color: C.amber, fontWeight: 500, marginBottom: 16 }}>
            ⚠️ Ação registada no log de auditoria. Ambas as partes serão notificadas.
          </div>
          <Btn label="Cancelar" variant="secondary" onClick={() => setModalIntervir(false)} />
        </div>
      </Modal>

      {/* Modal Reembolso */}
      <Modal open={modalReembolso} onClose={() => setModalReembolso(false)} width={400}>
        <div style={{ padding: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.amberDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="rotate-ccw" size={20} color={C.amber} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>Forçar Reembolso</h3>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 16 }}>
            O valor de <strong>{pedido.total.toLocaleString("pt-MZ")} MZN</strong> será devolvido ao comprador via <strong>{pedido.metodo}</strong>.
          </p>
          <div style={{ padding: "10px 12px", background: C.redDim, borderRadius: 8, fontSize: 12, color: C.red, fontWeight: 500, marginBottom: 20 }}>
            ⚠️ O vendedor será notificado. Esta ação altera o estado do pedido para REEMBOLSADO.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Cancelar" variant="secondary" onClick={() => setModalReembolso(false)} />
            <Btn label="Confirmar reembolso" variant="danger" loading={!!acaoId} onClick={handleReembolso} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── 4. DISPUTAS ───────────────────────────────────────────────────
function SubDisputas({ showToast }) {
  const [pagina, setPagina]   = useState(1);
  const [acaoId, setAcaoId]   = useState(null);
  const [logs, setLogs]       = useState([]);
  const [logsCarregando, setLogsCarregando] = useState(true);

  const { pedidos, setPedidos, total, totalPaginas, carregando, erro, recarregar } =
    usePedidos("disputa", "", pagina);

  const { pedidos: reembolsos, carregando: carregandoReemb } =
    usePedidos("reembolso", "", 1);

  // Logs de auditoria (disputas)
  useEffect(() => {
    apiPedidos.logs(1, "DISPUTA_RESOLVIDA")
      .then(res => {
        const d = res.success ? res.data : res.sucesso ? res.dados : {};
        setLogs(d.logs ?? []);
      })
      .catch(() => {})
      .finally(() => setLogsCarregando(false));
  }, []);

  async function handleResolver(p, favorComprador) {
    setAcaoId(p.id);
    try {
      await apiPedidos.resolverDisputa(
        p.id,
        `Resolvido pelo admin a favor do ${favorComprador ? "comprador" : "vendedor"}`,
        favorComprador,
        favorComprador ? p.total : undefined
      );
      const novoEstado = favorComprador ? "REEMBOLSADO" : "ENTREGUE";
      await apiPedidos.alterarEstado(p.id, novoEstado);
      setPedidos(prev => prev.filter(x => x.id !== p.id));
      showToast(`Disputa ${p.idCurto} resolvida.`, "sucesso");
    } catch (e) {
      showToast(`Erro: ${e.message}`, "erro");
    } finally {
      setAcaoId(null);
    }
  }

  async function handleProcessarReembolso(p) {
    setAcaoId(p.id);
    try {
      await apiPedidos.alterarEstado(p.id, "CANCELADO");
      showToast(`Reembolso de ${p.idCurto} processado.`, "sucesso");
      recarregar();
    } catch (e) {
      showToast(`Erro: ${e.message}`, "erro");
    } finally {
      setAcaoId(null);
    }
  }

  const valorEmDisputa = pedidos.reduce((s, p) => s + p.total, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Disputas Ativas"    value={carregando ? "…" : total}                         icon="alert-triangle" color={C.red}    />
        <StatCard label="Reembolsos Pend."   value={carregandoReemb ? "…" : reembolsos.length}        icon="rotate-ccw"     color={C.purple} />
        <StatCard label="Valor em Disputa"   value={`${valorEmDisputa.toLocaleString("pt-MZ")} MZN`}  icon="dollar"         color={C.amber}  />
        <StatCard label="Logs de auditoria"  value={logsCarregando ? "…" : logs.length}               icon="shield"         color={C.blue}   />
      </div>

      {!carregando && pedidos.length === 0 && reembolsos.length === 0 ? (
        <div style={{ background: C.greenDim, border: `1.5px solid ${C.green}30`, borderRadius: 14, padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.green }}>Sem disputas ou reembolsos pendentes</p>
        </div>
      ) : (
        <>
          {/* Disputas */}
          {(carregando || pedidos.length > 0) && (
            <div style={{ background: C.card, border: `1.5px solid ${C.red}30`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", background: C.redDim, borderBottom: `1px solid ${C.red}20`, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="alert-triangle" size={15} color={C.red} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.red }}>Disputas Abertas ({total})</h3>
              </div>
              {carregando ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><Spinner /></div>
              ) : erro ? (
                <div style={{ padding: 24, textAlign: "center", color: C.red }}>{erro}</div>
              ) : (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                        {["Pedido","Produto","Comprador","Vendedor","Valor","Ações"].map((c, i) => (
                          <th key={i} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: C.textMute }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map(p => (
                        <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "12px 14px", fontWeight: 800, color: C.blue, fontFamily: "monospace" }}>{p.idCurto}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: C.text }}>{p.produto}</td>
                          <td style={{ padding: "12px 14px", color: C.textSub }}>{p.comprador}</td>
                          <td style={{ padding: "12px 14px", color: C.textSub }}>{p.vendedor}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: C.red, fontFamily: "monospace" }}>{p.total.toLocaleString("pt-MZ")} MZN</td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <Btn label="✓ Comprador" size="sm" variant="blue"      loading={acaoId === p.id} onClick={() => handleResolver(p, true)}  />
                              <Btn label="✓ Vendedor"  size="sm" variant="ghost"     loading={acaoId === p.id} onClick={() => handleResolver(p, false)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Paginacao pagina={pagina} totalPaginas={totalPaginas} total={total} onChange={setPagina} />
                </>
              )}
            </div>
          )}

          {/* Reembolsos */}
          {reembolsos.length > 0 && (
            <div style={{ background: C.card, border: `1.5px solid ${C.purple}30`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", background: C.purpleDim, borderBottom: `1px solid ${C.purple}20`, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="rotate-ccw" size={15} color={C.purple} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.purple }}>Reembolsos Pendentes ({reembolsos.length})</h3>
              </div>
              {reembolsos.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: i < reembolsos.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontWeight: 800, color: C.blue, fontFamily: "monospace", fontSize: 12 }}>{p.idCurto}</span>
                  <span style={{ flex: 1, fontWeight: 600, color: C.text }}>{p.produto}</span>
                  <span style={{ color: C.textSub, fontSize: 12 }}>{p.comprador}</span>
                  <span style={{ fontWeight: 700, color: C.purple, fontFamily: "monospace" }}>{p.total.toLocaleString("pt-MZ")} MZN</span>
                  <Btn label="Processar" icon="check" size="sm" variant="ghost" loading={acaoId === p.id} onClick={() => handleProcessarReembolso(p)} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Log de auditoria */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>📋 Log de Ações em Disputas</h3>
        {logsCarregando ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 24 }}><Spinner size={20} /></div>
        ) : logs.length === 0 ? (
          <p style={{ fontSize: 13, color: C.textMute, textAlign: "center", padding: "16px 0" }}>Nenhum log de disputa registado.</p>
        ) : (
          logs.slice(0, 8).map((l, i) => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < logs.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <Badge label={l.acao?.replace(/_/g, " ") ?? "—"} type="info" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{l.acao?.replace(/_/g, " ")}</p>
                <p style={{ fontSize: 11, color: C.textMute }}>Por: {l.usuario?.nomeCompleto ?? "sistema"} · {l.entidadeId?.substring(0, 8)}</p>
              </div>
              <span style={{ fontSize: 11, color: C.textMute, whiteSpace: "nowrap" }}>
                {l.criadoEm ? new Date(l.criadoEm).toLocaleString("pt-MZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── 5. CONFIGURAÇÕES ──────────────────────────────────────────────
function SubConfiguracoes({ showToast }) {
  const [vals,    setVals]    = useState({ prazoEnvio: "3", prazoEntrega: "7", prazoDisputa: "14", autoConfirmar: "48" });
  const [toggles, setToggles] = useState({ autoConfirm: true, notifComprador: true, notifVendedor: true, bloquearFraude: true, revisaoManual: false, disputaAuto: false });

  function ToggleRow({ label, k }) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 13, color: C.textSub, fontWeight: 500 }}>{label}</span>
        <div onClick={() => setToggles(p => ({ ...p, [k]: !p[k] }))}
          style={{ width: 38, height: 22, borderRadius: 99, cursor: "pointer", background: toggles[k] ? C.green : C.border, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 3, left: toggles[k] ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left 0.2s" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>⚙️ Prazos Operacionais</h3>
          {[
            { label: "Prazo máximo envio (dias)",                k: "prazoEnvio" },
            { label: "Prazo máximo entrega (dias)",              k: "prazoEntrega" },
            { label: "Janela de disputa (dias após entrega)",    k: "prazoDisputa" },
            { label: "Auto-confirmação entrega (horas)",         k: "autoConfirmar" },
          ].map(({ label, k }, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMute, display: "block", marginBottom: 5 }}>{label}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={vals[k]} onChange={e => setVals(p => ({ ...p, [k]: e.target.value }))} type="number" min="1"
                  style={{ flex: 1, padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none" }} />
                <Btn label="Guardar" size="sm" variant="ghost" onClick={() => showToast(`Prazo "${label}" guardado.`, "sucesso")} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>🔔 Automações & Notificações</h3>
          <p style={{ fontSize: 12, color: C.textMute, marginBottom: 16 }}>Comportamento automático da plataforma</p>
          <ToggleRow label="Auto-confirmação de entrega"          k="autoConfirm" />
          <ToggleRow label="Notificar comprador em cada estado"   k="notifComprador" />
          <ToggleRow label="Notificar vendedor em cada estado"    k="notifVendedor" />
          <ToggleRow label="Bloquear pedidos com risco de fraude" k="bloquearFraude" />
          <ToggleRow label="Revisão manual > 5 000 MZN"          k="revisaoManual" />
          <ToggleRow label="Resolução automática de disputas"     k="disputaAuto" />
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Icon name="zap" size={16} color={C.purple} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>💡 Sugestões do Sistema</h3>
          <Badge label="Automático" type="purple" />
        </div>
        {[
          { msg: "Existem pedidos com estado 'PAGO' há mais de 48h sem envio. Notifica os vendedores.", icon: "truck",          cor: C.amber },
          { msg: "Taxa de cancelamento ligeiramente elevada. Verifica os vendedores com mais cancelamentos.", icon: "trending-up", cor: C.blue  },
          { msg: "Disputas abertas requerem intervenção manual. Consulta a tab Disputas.",                 icon: "alert-triangle",cor: C.red   },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.cor + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={s.icon} size={14} color={s.cor} />
            </div>
            <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, flex: 1 }}>{s.msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────
const SUBTABS = [
  { id: "visao",    label: "Visão Geral", icon: "bar-chart"      },
  { id: "lista",    label: "Pedidos",     icon: "shopping-bag"   },
  { id: "disputas", label: "Disputas",    icon: "alert-triangle", badge: true },
  { id: "config",   label: "Configurações", icon: "settings"     },
];

export default function PagePedidos() {
  const [subtab, setSubtab]           = useState("visao");
  const [pedidoDetalhe, setPedidoDetalhe] = useState(null);

  const [kpis, setKpis]               = useState(null);
  const [kpisCarregando, setKpisCarregando] = useState(true);

  const [toast,     setToast]     = useState(null);
  const [toastTipo, setToastTipo] = useState("info");
  const toastTimer = useRef(null);

  // Contador de disputas para o badge
  const [disputasCount, setDisputasCount] = useState(0);

  function showToast(msg, tipo = "sucesso") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg); setToastTipo(tipo);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  // KPIs do dashboard
  useEffect(() => {
    setKpisCarregando(true);
    apiPedidos.kpis()
      .then(res => {
        const d = res.success ? res.data : res.sucesso ? res.dados : {};
        setKpis(d);
        setDisputasCount(d.alertas?.disputasAbertas ?? 0);
      })
      .catch(() => {})
      .finally(() => setKpisCarregando(false));
  }, []);

  function handleSelectPedido(p) {
    setPedidoDetalhe(p);
    setSubtab("detalhe");
  }

  function handleVoltar() {
    setPedidoDetalhe(null);
    setSubtab("lista");
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
      `}</style>

      <Toast msg={toast} tipo={toastTipo} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Gestão de Pedidos</h2>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>
            Acompanhar e intervir em todos os pedidos da plataforma.
            {disputasCount > 0 && (
              <span style={{ color: C.red, fontWeight: 700 }}> {disputasCount} disputa(s) aberta(s).</span>
            )}
          </p>
        </div>
        <Btn label="Actualizar" icon="refresh" variant="secondary" size="sm"
          onClick={() => {
            setKpisCarregando(true);
            apiPedidos.kpis()
              .then(res => { const d = res.success ? res.data : {}; setKpis(d); setDisputasCount(d.alertas?.disputasAbertas ?? 0); })
              .catch(() => {})
              .finally(() => setKpisCarregando(false));
          }}
        />
      </div>

      {/* Tabs (ocultas no detalhe) */}
      {subtab !== "detalhe" && (
        <div style={{ display: "flex", gap: 2, background: "#f1f5f9", padding: 4, borderRadius: 12, marginBottom: 22, width: "fit-content" }}>
          {SUBTABS.map(t => {
            const isActive = subtab === t.id;
            return (
              <button key={t.id} onClick={() => setSubtab(t.id)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "none", background: isActive ? C.card : "transparent", color: isActive ? C.text : C.textSub, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s", boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none", fontFamily: "inherit", position: "relative" }}>
                <Icon name={t.icon} size={14} color={isActive ? C.text : C.textSub} />
                {t.label}
                {t.badge && disputasCount > 0 && (
                  <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: C.red, color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {disputasCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Conteúdo */}
      {subtab === "visao" && (
        <SubVisaoGeral
          kpis={kpis}
          kpisCarregando={kpisCarregando}
          onSelectTab={setSubtab}
          onSelectPedido={handleSelectPedido}
        />
      )}
      {subtab === "lista" && (
        <SubListaPedidos
          onSelectPedido={handleSelectPedido}
          showToast={showToast}
        />
      )}
      {subtab === "disputas" && (
        <SubDisputas showToast={showToast} />
      )}
      {subtab === "config" && (
        <SubConfiguracoes showToast={showToast} />
      )}
      {subtab === "detalhe" && pedidoDetalhe && (
        <SubDetalhePedido
          pedido={pedidoDetalhe}
          onVoltar={handleVoltar}
          showToast={showToast}
          recarregarLista={() => setSubtab("lista")}
        />
      )}
    </div>
  );
}