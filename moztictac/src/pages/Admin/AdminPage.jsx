import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import PageAfiliados from "./PageAfiliados";
import PageProdutos from "./PageProdutos";
import PageUtilizadores from "./PageUtilizadores";
import PagePedidos from "./PagePedidos";
import PageFinanceiro from "./PageFinanceiro";
import PageSaques from "./PageSaques";

// ─── API ──────────────────────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function requisitar(caminho) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${caminho}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.mensagem || dados.message || `Erro ${res.status}`);
  return dados;
}

const apiDashboard = {
  kpis:            () => requisitar("/admin/dashboard/kpis"),
  receitaMensal:   () => requisitar("/admin/dashboard/receita-mensal"),
  atividadeRecente:() => requisitar("/admin/dashboard/atividade-recente"),
  notificacoes:    () => requisitar("/admin/notificacoes?pagina=1"),
};

// ─── Search context (partilhado com sub-páginas) ──────────────────────────────
export const SearchContext = createContext({ query: "", setQuery: () => {} });

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  green:      "#16a34a",
  greenLight: "#22c55e",
  greenDim:   "#dcfce7",
  greenMuted: "rgba(22,163,74,0.12)",
  sidebar:    "#0f172a",
  sidebarHov: "#1e293b",
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
};

// ─── Nav structure ─────────────────────────────────────────────────────────────
const NAV = [
  {
    group: "Principal",
    items: [{ id: "dashboard", label: "Dashboard", icon: "grid" }],
  },
  {
    group: "Gestão",
    items: [
      { id: "usuarios",  label: "Utilizadores",        icon: "users" },
      { id: "produtos",  label: "Produtos & Serviços", icon: "package" },
      { id: "pedidos",   label: "Pedidos",             icon: "shopping-bag" },
      { id: "afiliados", label: "Afiliados",           icon: "link" },
    ],
  },
  {
    group: "Financeiro",
    items: [
      { id: "financeiro",  label: "Financeiro",       icon: "dollar" },
      { id: "saques",      label: "Saques (Cashout)", icon: "arrow-up-circle" },
      { id: "relatorios",  label: "Relatórios",       icon: "bar-chart" },
    ],
  },
  {
    group: "Sistema",
    items: [
      { id: "configuracoes", label: "Configurações",          icon: "settings" },
      { id: "seguranca",     label: "Segurança & Auditoria",  icon: "shield" },
      { id: "fraude",        label: "Deteção de Fraude",      icon: "alert-triangle" },
      { id: "permissoes",    label: "Permissões",             icon: "lock" },
    ],
  },
];

const PAGE_LABELS = {
  dashboard: "Dashboard", usuarios: "Utilizadores", produtos: "Produtos & Serviços",
  pedidos: "Pedidos", afiliados: "Afiliados", financeiro: "Financeiro",
  saques: "Saques", relatorios: "Relatórios", configuracoes: "Configurações",
  seguranca: "Segurança & Auditoria", fraude: "Deteção de Fraude", permissoes: "Permissões",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width: size, height: size, stroke: color, fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0, display: "block" };
  const icons = {
    "grid":            <svg style={s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    "users":           <svg style={s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    "package":         <svg style={s} viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    "shopping-bag":    <svg style={s} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    "link":            <svg style={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    "dollar":          <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    "arrow-up-circle": <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>,
    "bar-chart":       <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    "settings":        <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    "shield":          <svg style={s} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "alert-triangle":  <svg style={s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    "lock":            <svg style={s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    "trending-up":     <svg style={s} viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    "bell":            <svg style={s} viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    "search":          <svg style={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    "check":           <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    "x":               <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    "eye":             <svg style={s} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    "download":        <svg style={s} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    "more-vertical":   <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
    "user":            <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    "activity":        <svg style={s} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    "zap":             <svg style={s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    "credit-card":     <svg style={s} viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    "menu":            <svg style={s} viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    "chevron-right":   <svg style={s} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
    "refresh":         <svg style={s} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.96"/></svg>,
  };
  return icons[name] || null;
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function Badge({ label, type = "default" }) {
  const map = {
    success: { bg: C.greenDim, color: C.green },
    warning: { bg: C.amberDim, color: C.amber },
    danger:  { bg: C.redDim,   color: C.red },
    info:    { bg: C.blueDim,  color: C.blue },
    default: { bg: "#f1f5f9",  color: C.textSub },
  };
  const s = map[type] || map.default;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: s.bg, color: s.color, display: "inline-block", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function Btn({ label, icon, onClick, variant = "primary", size = "md", loading = false, disabled = false }) {
  const styles = {
    primary:   { bg: C.green,        color: "#fff",    border: "none" },
    secondary: { bg: "transparent",  color: C.textSub, border: `1.5px solid ${C.border}` },
    danger:    { bg: C.red,          color: "#fff",    border: "none" },
    ghost:     { bg: C.greenMuted,   color: C.green,   border: "none" },
  };
  const pad = size === "sm" ? "6px 12px" : "9px 18px";
  const fs  = size === "sm" ? 12 : 13;
  const s   = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: pad, fontSize: fs, fontWeight: 700,
        background: s.bg, color: s.color,
        border: s.border || "none",
        borderRadius: 8, cursor: disabled || loading ? "default" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "opacity 0.15s", whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {loading
        ? <span style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
        : icon && <Icon name={icon} size={13} color={s.color} />
      }
      {label}
    </button>
  );
}

function StatCard({ label, value, sub, icon, color = C.green, trend, loading = false }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={18} color={color} />
        </div>
        {trend !== undefined && trend !== "" && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: String(trend).startsWith("-") ? C.redDim : C.greenDim, color: String(trend).startsWith("-") ? C.red : C.green }}>
            {String(trend).startsWith("-") ? "" : "+"}{trend}
          </span>
        )}
      </div>
      <div>
        {loading
          ? <div style={{ height: 28, width: 80, borderRadius: 6, background: "#f1f5f9", animation: "pulse 1.5s ease-in-out infinite" }} />
          : <p style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
        }
        <p style={{ fontSize: 12, color: C.textSub, marginTop: 4, fontWeight: 500 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: C.textMute, marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

function Table({ cols, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
            {cols.map((c, i) => (
              <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.textMute }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "12px 14px", color: j === 0 ? C.text : C.textSub, fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Toggle({ label, active = false }) {
  const [on, setOn] = useState(active);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 13, color: C.textSub, fontWeight: 500 }}>{label}</span>
      <div onClick={() => setOn(!on)} style={{ width: 38, height: 22, borderRadius: 99, cursor: "pointer", background: on ? C.green : C.border, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left 0.2s" }} />
      </div>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ h = 16, w = "100%", r = 6 }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: "#f1f5f9", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBar({ data = [], color = C.green }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.receita || 0), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 56 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: "100%", height: `${((d.receita || 0) / max) * 100}%`, background: i === data.length - 1 ? color : color + "55", borderRadius: "3px 3px 0 0", minHeight: 3, transition: "height 0.4s ease" }} />
          <span style={{ fontSize: 9, color: C.textMute, transform: "rotate(-45deg)", transformOrigin: "center", whiteSpace: "nowrap" }}>{d.mes}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Actividade icon helper ───────────────────────────────────────────────────
function atividadeIcon(tipo) {
  if (tipo === "pedido")  return { icon: "shopping-bag", color: C.blue,  bg: C.blueDim };
  if (tipo === "saque")   return { icon: "arrow-up-circle", color: C.amber, bg: C.amberDim };
  if (tipo === "registo") return { icon: "users", color: C.green, bg: C.greenDim };
  return { icon: "activity", color: C.textSub, bg: "#f1f5f9" };
}

function estadoBadgeAtividade(estado) {
  if (!estado) return null;
  const map = {
    PAGO: "success", ENVIADO: "info", ENTREGUE: "success",
    CANCELADO: "danger", EM_DISPUTA: "danger",
    SOLICITADO: "warning", APROVADO: "success", REJEITADO: "danger",
    novo: "success",
  };
  return <Badge label={estado} type={map[estado] || "default"} />;
}

function fmtMZN(v) {
  return Number(v || 0).toLocaleString("pt-MZ", { style: "currency", currency: "MZN", maximumFractionDigits: 0 });
}
function fmtNum(v) {
  if (v === undefined || v === null) return "—";
  if (typeof v === "string" && v.includes("%")) return v;
  const n = Number(v);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "k";
  return n.toLocaleString("pt-MZ");
}
function fmtData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }) + " · " +
         new Date(iso).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short" });
}

// ─── PAGE: Dashboard ──────────────────────────────────────────────────────────
function PageDashboard() {
  const [kpis,      setKpis]      = useState([]);
  const [receita,   setReceita]   = useState([]);
  const [atividade, setAtividade] = useState([]);
  const [loadKpi,   setLoadKpi]   = useState(true);
  const [loadRec,   setLoadRec]   = useState(true);
  const [loadAtiv,  setLoadAtiv]  = useState(true);
  const [erro,      setErro]      = useState(null);
  const [ultima,    setUltima]    = useState(null);

  const carregar = useCallback(async () => {
    setLoadKpi(true); setLoadRec(true); setLoadAtiv(true); setErro(null);
    try {
      const [rKpi, rRec, rAtiv] = await Promise.all([
        apiDashboard.kpis(),
        apiDashboard.receitaMensal(),
        apiDashboard.atividadeRecente(),
      ]);
      setKpis(rKpi.data?.kpis || []);
      setReceita(rRec.data || []);
      setAtividade(rAtiv.data || []);
      setUltima(new Date());
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoadKpi(false); setLoadRec(false); setLoadAtiv(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // KPI icon map
  const kpiIcons = ["users","dollar","shopping-bag","trending-up","package","link","credit-card","activity","bar-chart"];
  const kpiColors = [C.blue, C.green, C.blue, C.green, C.green, C.amber, C.amber, C.blue, C.green];

  return (
    <div>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Dashboard Geral</h2>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>
            Visão geral da plataforma em tempo real
            {ultima && <span style={{ marginLeft: 8, color: C.textMute, fontSize: 11 }}>· Actualizado às {ultima.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Exportar" icon="download" variant="secondary" size="sm" />
          <Btn label="Atualizar" icon="refresh" size="sm" onClick={carregar} loading={loadKpi} />
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div style={{ background: C.redDim, border: `1px solid #fecaca`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: C.red, display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="alert-triangle" size={15} color={C.red} />
          {erro} — <button onClick={carregar} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontSize: 12, fontFamily: "inherit" }}>Tentar novamente</button>
        </div>
      )}

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {loadKpi
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <Skeleton h={40} w={40} r={10} />
                <div style={{ marginTop: 16 }}><Skeleton h={28} w={80} /><Skeleton h={12} w={120} /></div>
              </div>
            ))
          : kpis.map((k, i) => (
              <StatCard
                key={i}
                label={k.label}
                value={typeof k.valor === "number" ? fmtNum(k.valor) : k.valor}
                icon={kpiIcons[i] || "activity"}
                color={kpiColors[i] || C.green}
                trend={k.tendencia}
              />
            ))
        }
      </div>

      {/* Gráfico receita + actividade */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16, marginBottom: 24 }}>

        {/* Receita mensal */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>📈 Receita Mensal (MZN)</h3>
            <Icon name="bar-chart" size={15} color={C.textMute} />
          </div>
          {loadRec
            ? <Skeleton h={80} />
            : receita.length > 0
              ? (
                <>
                  <MiniBar data={receita} color={C.green} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                    <span style={{ fontSize: 11, color: C.textMute }}>Jan — Dez {new Date().getFullYear()}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>
                      Total: {fmtMZN(receita.reduce((s, r) => s + (r.receita || 0), 0))}
                    </span>
                  </div>
                </>
              )
              : <p style={{ fontSize: 13, color: C.textMute, textAlign: "center", padding: "20px 0" }}>Sem dados de receita</p>
          }
        </div>

        {/* Pedidos por estado */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📦 Pedidos por Estado</h3>
          {loadKpi
            ? <Skeleton h={80} />
            : (() => {
                const ped = kpis[0] ? {} : null;
                const mapaEstados = {
                  PAGO:              { label: "Pago",            color: C.green },
                  ENVIADO:           { label: "Enviado",         color: C.blue },
                  ENTREGUE:          { label: "Entregue",        color: "#10b981" },
                  CANCELADO:         { label: "Cancelado",       color: C.red },
                  EM_DISPUTA:        { label: "Em Disputa",      color: C.amber },
                  AGUARDANDO_PAGAMENTO: { label: "Aguardando",   color: C.textMute },
                  REEMBOLSADO:       { label: "Reembolsado",     color: "#8b5cf6" },
                };
                // pedidosPorEstado fica nos kpis[0] — fetch separado se necessário
                return (
                  <p style={{ fontSize: 13, color: C.textMute }}>
                    Os dados de pedidos por estado são carregados do endpoint <code style={{ fontSize: 11, background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>/admin/dashboard/kpis</code> → campo <code style={{ fontSize: 11, background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>pedidosPorEstado</code>.
                  </p>
                );
              })()
          }
        </div>
      </div>

      {/* Actividade recente */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>⚡ Actividade Recente (últimas 24h)</h3>
          <span style={{ fontSize: 11, color: C.textMute }}>{atividade.length} eventos</span>
        </div>
        {loadAtiv
          ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={44} />)}</div>
          : atividade.length === 0
            ? <p style={{ fontSize: 13, color: C.textMute, textAlign: "center", padding: "24px 0" }}>Sem actividade recente.</p>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {atividade.map((a, i) => {
                  const { icon, color, bg } = atividadeIcon(a.tipo);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < atividade.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name={icon} size={16} color={color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.titulo}</p>
                        <p style={{ fontSize: 11, color: C.textMute, marginTop: 1 }}>{fmtData(a.data)}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        {a.valor !== null && a.valor !== undefined && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{fmtMZN(a.valor)}</span>
                        )}
                        {estadoBadgeAtividade(a.estado)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
        }
      </div>
    </div>
  );
}

// ─── PAGE: Relatórios ─────────────────────────────────────────────────────────
function PageRelatorios() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Relatórios Avançados</h2>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Gerar e exportar relatórios financeiros, de vendas e afiliados</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {[
          { title: "Relatório Financeiro",   desc: "GMV, receita líquida, lucro/prejuízo, fluxo de caixa, ticket médio", icon: "dollar",          color: C.green },
          { title: "Relatório de Vendas",    desc: "Vendas por categoria, por vendedor, por região e tendências",         icon: "bar-chart",       color: C.blue },
          { title: "Relatório de Afiliados", desc: "Comissões geradas, top afiliados, desempenho por nível",             icon: "link",            color: C.amber },
          { title: "Relatório Fiscal",       desc: "Dados para AT — IVA, IRPS, retenção na fonte, conformidade legal",   icon: "shield",          color: C.red },
          { title: "Relatório de Pedidos",   desc: "Status de pedidos, disputas, devoluções e cancelamentos",            icon: "shopping-bag",    color: C.blue },
          { title: "Relatório de Fraude",    desc: "Contas suspeitas, tráfego inválido, bloqueios e ações tomadas",      icon: "alert-triangle",  color: C.red },
        ].map((r, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: r.color + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon name={r.icon} size={18} color={r.color} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{r.title}</h3>
            <p style={{ fontSize: 12, color: C.textSub, lineHeight: 1.6, marginBottom: 16 }}>{r.desc}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <select style={{ flex: 1, padding: "6px 8px", fontSize: 12, border: `1.5px solid ${C.border}`, borderRadius: 7, color: C.text, background: C.bg, fontFamily: "inherit" }}>
                <option>Diário</option><option>Mensal</option><option>Anual</option>
              </select>
              <Btn label="PDF"   icon="download" size="sm" variant="secondary" />
              <Btn label="Excel" icon="download" size="sm" variant="ghost" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE: Configurações ──────────────────────────────────────────────────────
function PageConfiguracoes() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Configurações do Sistema</h2>
        <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Regras gerais da plataforma, limites e comportamento global</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>⚙️ Regras Gerais</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Toggle label="Ativar programa de afiliados"          active={true} />
            <Toggle label="Aprovação manual de produtos"          active={true} />
            <Toggle label="Cashback automático para compradores"  active={false} />
            <Toggle label="Modo manutenção"                       active={false} />
            <Toggle label="Registo de novos vendedores"           active={true} />
            <Toggle label="Pagamentos M-Pesa ativos"              active={true} />
            <Toggle label="Pagamentos E-Mola ativos"              active={true} />
            <Toggle label="Pagamentos mKesh ativos"               active={true} />
          </div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>🔢 Limites do Sistema</h3>
          {[
            { label: "Valor mínimo de saque (MZN)",               value: "500" },
            { label: "Valor máximo sem aprovação (MZN)",          value: "5 000" },
            { label: "Tempo liberação saldo vendedor (dias)",     value: "3" },
            { label: "Tempo liberação comissão afiliado (dias)",  value: "7" },
            { label: "Máx. produtos por vendedor",               value: "200" },
            { label: "Comissão afiliado mínima (%)",             value: "5" },
            { label: "Comissão afiliado máxima (%)",             value: "30" },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMute, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 3 }}>{f.label}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input defaultValue={f.value} style={{ flex: 1, padding: "7px 10px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 7, fontFamily: "inherit", color: C.text, background: C.bg }} />
                <Btn label="OK" size="sm" variant="ghost" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: Segurança ──────────────────────────────────────────────────────────
function PageSeguranca() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Segurança & Auditoria</h2>
        <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Logs completos, alertas e rastreamento de todas as ações críticas</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Alertas Hoje"     value="8"   icon="alert-triangle" color={C.red} />
        <StatCard label="Ações Admin"      value="142" icon="activity"       color={C.blue} />
        <StatCard label="Logins Suspeitos" value="3"   icon="lock"           color={C.amber} />
        <StatCard label="IPs Bloqueados"   value="19"  icon="shield"         color={C.red} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📋 Log de Auditoria</h3>
          <Table
            cols={["Admin", "Ação", "Módulo", "IP", "Data/Hora"]}
            rows={[
              ["super_admin", "Bloqueou utilizador spam99",   "Utilizadores", "196.2.x.x", "18 Abr 14:55"],
              ["super_admin", "Alterou taxa de saque 2%",     "Financeiro",   "196.2.x.x", "18 Abr 14:20"],
              ["mod_finance", "Aprovou saque TXN-00819",      "Saques",       "41.85.x.x", "18 Abr 13:40"],
              ["super_admin", "Rejeitou produto #3812",       "Produtos",     "196.2.x.x", "18 Abr 12:10"],
              ["mod_content", "Desativou produto suspeito",   "Produtos",     "41.85.x.x", "17 Abr 18:00"],
            ]}
          />
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>🔐 Segurança</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Toggle label="OTP por email em ações financeiras"      active={true} />
            <Toggle label="2FA para todos os admins"                active={true} />
            <Toggle label="Logs imutáveis (auditoria)"              active={true} />
            <Toggle label="Alertas de IP suspeito"                  active={true} />
            <Toggle label="Bloqueio automático após 5 tentativas"   active={true} />
          </div>
          <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>🚨 Alertas Ativos</h3>
            {[
              { msg: "IP 41.120.x.x tentou 8 logins — bloqueado",       type: "danger" },
              { msg: "Saque incomum de 28 000 MZN detectado",            type: "danger" },
              { msg: "3 contas com mesmo IP registadas hoje",            type: "warning" },
              { msg: "Pico de tráfego afiliado detectado (spam_afilX)",  type: "warning" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                <Icon name="alert-triangle" size={14} color={a.type === "danger" ? C.red : C.amber} />
                <span style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: Fraude ─────────────────────────────────────────────────────────────
function PageFraude() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Deteção de Fraude</h2>
        <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Identificar e agir contra múltiplas contas, compras falsas e afiliados suspeitos</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Casos Ativos"     value="12"      icon="alert-triangle" color={C.red} />
        <StatCard label="Contas Banidas"   value="48"      icon="x"             color={C.red} />
        <StatCard label="Ganhos Removidos" value="84k MZN" icon="dollar"        color={C.amber} />
        <StatCard label="IPs Blocklist"    value="19"      icon="shield"        color={C.blue} />
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>🚨 Casos Detetados</h3>
        <Table
          cols={["Conta","Tipo de fraude","Evidência","Valor em risco","Estado","Ações"]}
          rows={[
            ["spam_afilX",  "Auto-afiliação",    "489 conversões/48h, 1 IP",  "28 000 MZN", <Badge label="Em análise" type="warning" />, <Btn label="Banir" icon="x" size="sm" variant="danger" />],
            ["user_multi1", "Múltiplas contas",  "3 contas no mesmo IP",      "4 200 MZN",  <Badge label="Bloqueado"  type="danger" />,  <Btn label="Banir definitivo" size="sm" variant="secondary" />],
            ["compra_fake", "Auto-compra",        "Comprou próprios produtos","12 000 MZN", <Badge label="Em análise" type="warning" />, <Btn label="Estornar" size="sm" variant="secondary" />],
          ]}
        />
        <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>🛡️ Regras Anti-fraude</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Toggle label="Detetar múltiplas contas por IP"       active={true} />
            <Toggle label="Bloquear auto-referência de afiliados" active={true} />
            <Toggle label="Scoring de risco por transação"        active={true} />
            <Toggle label="Bloquear conta após padrão suspeito"   active={true} />
            <Toggle label="Congelar saldo em caso suspeito"       active={true} />
            <Toggle label="Alertas de fraude por email ao admin"  active={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: Permissões ─────────────────────────────────────────────────────────
function PagePermissoes() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Controlo de Permissões</h2>
        <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Definir acessos por nível de administrador</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          { role: "Super Admin", badge: "danger", desc: "Acesso total — todas as funcionalidades, sem restrições.", perms: ["Dashboard","Utilizadores","Produtos","Pedidos","Afiliados","Financeiro","Saques","Relatórios","Configurações","Segurança","Fraude","Permissões"] },
          { role: "Admin Financeiro", badge: "warning", desc: "Foco em finanças — sem acesso a configurações críticas.", perms: ["Dashboard","Pedidos","Financeiro","Saques","Relatórios","Fraude (leitura)"] },
          { role: "Moderador", badge: "info", desc: "Moderação de conteúdo — produtos, utilizadores e pedidos.", perms: ["Dashboard","Utilizadores (leitura)","Produtos","Pedidos","Fraude (leitura)"] },
        ].map((r, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{r.role}</h3>
              <Badge label={i === 0 ? "Total" : i === 1 ? "Restrito" : "Básico"} type={r.badge} />
            </div>
            <p style={{ fontSize: 12, color: C.textSub, marginBottom: 16, lineHeight: 1.5 }}>{r.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {r.perms.map((p, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text }}>
                  <Icon name="check" size={13} color={C.green} />
                  {p}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <Btn label="Editar permissões" icon="settings" size="sm" variant="secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE map (função para evitar instâncias estáticas) ───────────────────────
function renderPage(id, searchQuery) {
  // Páginas que recebem searchQuery via context
  switch (id) {
    case "dashboard":     return <PageDashboard />;
    case "usuarios":      return <PageUtilizadores />;
    case "produtos":      return <PageProdutos />;
    case "pedidos":       return <PagePedidos />;
    case "afiliados":     return <PageAfiliados />;
    case "financeiro":    return <PageFinanceiro />;
    case "saques":        return <PageSaques />;
    case "relatorios":    return <PageRelatorios />;
    case "configuracoes": return <PageConfiguracoes />;
    case "seguranca":     return <PageSeguranca />;
    case "fraude":        return <PageFraude />;
    case "permissoes":    return <PagePermissoes />;
    default: return (
      <div style={{ textAlign: "center", padding: "80px 0", color: C.textMute }}>
        <Icon name="alert-triangle" size={32} color={C.textMute} />
        <p style={{ marginTop: 12, fontSize: 14 }}>Página "{id}" não encontrada.</p>
      </div>
    );
  }
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [active,        setActive]        = useState("dashboard");
  const [sidebarOpen,   setSidebarOpen]   = useState(true);   // desktop default open
  const [mobileSidebar, setMobileSidebar] = useState(false);  // mobile overlay
  const [searchQuery,   setSearchQuery]   = useState("");
  const [notifCount,    setNotifCount]    = useState(0);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifs,        setNotifs]        = useState([]);
  const notifRef = useRef(null);

  // Fechar notif ao clicar fora
  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Carregar contagem de notificações
  useEffect(() => {
    apiDashboard.notificacoes()
      .then(r => {
        const lista = r.dados?.notificacoes || r.data?.notificacoes || [];
        const naoLidas = r.dados?.naoLidas  || r.data?.naoLidas    || 0;
        setNotifs(lista.slice(0, 6));
        setNotifCount(naoLidas);
      })
      .catch(() => {});
  }, []);

  // Navegar e fechar sidebar mobile
  function navegar(id) {
    setActive(id);
    setMobileSidebar(false);
    setSearchQuery("");
  }

  const SIDEBAR_W = sidebarOpen ? 240 : 64;

  return (
    <SearchContext.Provider value={{ query: searchQuery, setQuery: setSearchQuery }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif", background: C.bg }}>

        {/* ══ MOBILE OVERLAY ══ */}
        {mobileSidebar && (
          <div
            onClick={() => setMobileSidebar(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "none" }}
            className="mobile-overlay"
          />
        )}

        {/* ══ SIDEBAR ══ */}
        <aside style={{
          width: SIDEBAR_W, flexShrink: 0,
          background: C.sidebar,
          display: "flex", flexDirection: "column",
          overflowY: "auto", overflowX: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          transition: "width 0.2s ease",
          zIndex: 10,
        }}>
          {/* Logo + collapse toggle */}
          <div style={{ padding: sidebarOpen ? "18px 16px 14px" : "18px 12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="zap" size={16} color="#fff" />
              </div>
              {sidebarOpen && (
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>MozTicTac</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Painel Admin</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 4, display: "flex", borderRadius: 6, flexShrink: 0 }}
              title={sidebarOpen ? "Colapsar menu" : "Expandir menu"}
            >
              <Icon name="chevron-right" size={15} color="rgba(255,255,255,0.35)" />
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: sidebarOpen ? "12px 10px" : "12px 8px" }}>
            {NAV.map((group, gi) => (
              <div key={gi} style={{ marginBottom: 20 }}>
                {sidebarOpen && (
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", padding: "0 10px", marginBottom: 6 }}>
                    {group.group}
                  </p>
                )}
                {group.items.map(item => {
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navegar(item.id)}
                      title={!sidebarOpen ? item.label : undefined}
                      style={{
                        width: "100%",
                        display: "flex", alignItems: "center",
                        gap: sidebarOpen ? 10 : 0,
                        justifyContent: sidebarOpen ? "flex-start" : "center",
                        padding: sidebarOpen ? "8px 10px" : "10px",
                        borderRadius: 8, border: "none",
                        background: isActive ? C.green : "transparent",
                        color: isActive ? "#fff" : "rgba(255,255,255,0.50)",
                        fontSize: 13, fontWeight: isActive ? 700 : 500,
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s", marginBottom: 2,
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = C.sidebarHov; e.currentTarget.style.color = "#fff"; } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.50)"; } }}
                    >
                      <Icon name={item.icon} size={15} color={isActive ? "#fff" : "rgba(255,255,255,0.50)"} />
                      {sidebarOpen && item.label}
                    </button>
                  );
                })}
                {!sidebarOpen && gi < NAV.length - 1 && (
                  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
                )}
              </div>
            ))}
          </nav>

          {/* Admin info */}
          <div style={{ padding: sidebarOpen ? "14px 16px" : "14px 8px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarOpen ? "flex-start" : "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.green + "33", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="user" size={15} color={C.green} />
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Super Admin</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.30)" }}>admin@mztictac.mz</p>
              </div>
            )}
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Topbar */}
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 24px",
            background: C.card, borderBottom: `1px solid ${C.border}`,
            position: "sticky", top: 0, zIndex: 50, gap: 12,
          }}>
            {/* Mobile menu btn */}
            <button
              onClick={() => setMobileSidebar(o => !o)}
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4, color: C.textSub }}
              className="mobile-menu-btn"
            >
              <Icon name="menu" size={20} color={C.textSub} />
            </button>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12, color: C.textMute }}>Painel</span>
              <Icon name="chevron-right" size={12} color={C.textMute} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {PAGE_LABELS[active] || active}
              </span>
            </div>

            {/* Search global */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", width: 260, flexShrink: 0 }}>
              <span style={{ position: "absolute", left: 10, pointerEvents: "none" }}>
                <Icon name="search" size={14} color={C.textMute} />
              </span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Filtrar ${PAGE_LABELS[active] || ""}...`}
                style={{
                  paddingLeft: 32, paddingRight: searchQuery ? 32 : 12,
                  paddingTop: 7, paddingBottom: 7,
                  fontSize: 13, color: C.text,
                  background: C.bg, border: `1.5px solid ${C.border}`,
                  borderRadius: 8, outline: "none", width: "100%",
                  fontFamily: "inherit", transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: 8, background: "none", border: "none", cursor: "pointer", display: "flex", color: C.textMute, padding: 2 }}
                >
                  <Icon name="x" size={13} color={C.textMute} />
                </button>
              )}
            </div>

            {/* Notificações */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon name="bell" size={18} color={C.textSub} />
                {notifCount > 0 && (
                  <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: C.red, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>

              {/* Dropdown notificações */}
              {notifOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  width: 320, background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  zIndex: 200, overflow: "hidden",
                  animation: "fadeIn 0.15s ease",
                }}>
                  <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Notificações</span>
                    {notifCount > 0 && <Badge label={`${notifCount} novas`} type="danger" />}
                  </div>
                  {notifs.length === 0
                    ? <p style={{ fontSize: 13, color: C.textMute, textAlign: "center", padding: "24px 16px" }}>Sem notificações</p>
                    : notifs.map((n, i) => (
                      <div key={i} style={{ padding: "12px 16px", borderBottom: i < notifs.length - 1 ? `1px solid ${C.border}` : "none", background: !n.lida ? C.greenDim + "44" : "transparent" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{n.titulo}</p>
                        <p style={{ fontSize: 11, color: C.textSub, marginTop: 2, lineHeight: 1.4 }}>{n.mensagem}</p>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* Admin badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8, borderLeft: `1px solid ${C.border}` }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="user" size={14} color="#fff" />
              </div>
              <div style={{ display: "none" }} className="admin-label">
                <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Super Admin</p>
                <p style={{ fontSize: 10, color: C.textMute }}>Nível máximo</p>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div style={{ flex: 1, padding: "28px 28px 48px", minHeight: 0 }}>
            {renderPage(active, searchQuery)}
          </div>
        </main>
      </div>
    </SearchContext.Provider>
  );
}