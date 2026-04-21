import { useState } from "react";
import PageAfiliados from "./PageAfiliados";
import PageProdutos from "./PageProdutos";
import PageUtilizadores from "./PageUtilizadores";
import PagePedidos from "./PagePedidos";
import PageFinanceiro from "./PageFinanceiro";
import PageSaques from "./PageSaques";

// ─── Design tokens — dark sidebar + white content, green accent ───────────────
const C = {
  green:      "#16a34a",
  greenLight: "#22c55e",
  greenDim:   "#dcfce7",
  greenMuted: "rgba(22,163,74,0.12)",
  sidebar:    "#0f172a",
  sidebarHov: "#1e293b",
  sidebarAct: "#16a34a",
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
    items: [
      { id: "dashboard",    label: "Dashboard",          icon: "grid" },
    ],
  },
  {
    group: "Gestão",
    items: [
      { id: "usuarios",     label: "Utilizadores",        icon: "users" },
      { id: "produtos",     label: "Produtos & Serviços", icon: "package" },
      { id: "pedidos",      label: "Pedidos",             icon: "shopping-bag" },
      { id: "afiliados",    label: "Afiliados",           icon: "link" },
    ],
  },
  {
    group: "Financeiro",
    items: [
      { id: "financeiro",   label: "Financeiro",          icon: "dollar" },
      { id: "saques",       label: "Saques (Cashout)",    icon: "arrow-up-circle" },
      { id: "relatorios",   label: "Relatórios",          icon: "bar-chart" },
    ],
  },
  {
    group: "Sistema",
    items: [
      { id: "configuracoes",label: "Configurações",       icon: "settings" },
      { id: "seguranca",    label: "Segurança & Auditoria", icon: "shield" },
      { id: "fraude",       label: "Deteção de Fraude",   icon: "alert-triangle" },
      { id: "permissoes",   label: "Permissões",          icon: "lock" },
    ],
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width: size, height: size, stroke: color, fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 };
  const icons = {
    "grid":             <svg style={s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    "users":            <svg style={s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    "package":          <svg style={s} viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    "shopping-bag":     <svg style={s} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    "link":             <svg style={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    "dollar":           <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    "arrow-up-circle":  <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>,
    "bar-chart":        <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    "settings":         <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    "shield":           <svg style={s} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "alert-triangle":   <svg style={s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    "lock":             <svg style={s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    "chevron-right":    <svg style={s} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
    "trending-up":      <svg style={s} viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    "bell":             <svg style={s} viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    "search":           <svg style={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    "check":            <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    "x":                <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    "eye":              <svg style={s} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    "download":         <svg style={s} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    "more-vertical":    <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
    "user":             <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    "activity":         <svg style={s} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    "zap":              <svg style={s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    "credit-card":      <svg style={s} viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    "toggle-right":     <svg style={s} viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/></svg>,
  };
  return icons[name] || null;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color = C.green, trend }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={icon} size={18} color={color} />
        </div>
        {trend && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 8px",
            borderRadius: 99,
            background: trend > 0 ? C.greenDim : C.redDim,
            color: trend > 0 ? C.green : C.red,
          }}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: C.textSub, marginTop: 4, fontWeight: 500 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: C.textMute, marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, type = "default" }) {
  const map = {
    success:  { bg: C.greenDim,  color: C.green },
    warning:  { bg: C.amberDim,  color: C.amber },
    danger:   { bg: C.redDim,    color: C.red },
    info:     { bg: C.blueDim,   color: C.blue },
    default:  { bg: "#f1f5f9",   color: C.textSub },
  };
  const s = map[type] || map.default;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 9px",
      borderRadius: 99, background: s.bg, color: s.color,
      display: "inline-block", whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
function Table({ cols, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
            {cols.map((c, i) => (
              <th key={i} style={{
                padding: "10px 14px", textAlign: "left",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", color: C.textMute,
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              borderBottom: `1px solid ${C.border}`,
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "12px 14px", color: j === 0 ? C.text : C.textSub, fontWeight: j === 0 ? 600 : 400 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Btn ──────────────────────────────────────────────────────────────────────
function Btn({ label, icon, onClick, variant = "primary", size = "md" }) {
  const styles = {
    primary:   { bg: C.green,     color: "#fff",     border: "none" },
    secondary: { bg: "transparent", color: C.textSub, border: `1.5px solid ${C.border}` },
    danger:    { bg: C.red,       color: "#fff",     border: "none" },
    ghost:     { bg: C.greenMuted, color: C.green,   border: "none" },
  };
  const pad = size === "sm" ? "6px 12px" : "9px 18px";
  const fs  = size === "sm" ? 12 : 13;
  const s   = styles[variant];
  return (
    <button
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: pad, fontSize: fs, fontWeight: 700,
        background: s.bg, color: s.color,
        border: s.border || "none",
        borderRadius: 8, cursor: "pointer",
        transition: "opacity 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {icon && <Icon name={icon} size={13} color={s.color} />}
      {label}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({ placeholder, icon }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {icon && (
        <span style={{ position: "absolute", left: 10, pointerEvents: "none" }}>
          <Icon name={icon} size={14} color={C.textMute} />
        </span>
      )}
      <input
        placeholder={placeholder}
        style={{
          padding: icon ? "8px 12px 8px 32px" : "8px 12px",
          fontSize: 13, color: C.text,
          background: C.bg, border: `1.5px solid ${C.border}`,
          borderRadius: 8, outline: "none", width: "100%",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ label, active = false }) {
  const [on, setOn] = useState(active);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 13, color: C.textSub, fontWeight: 500 }}>{label}</span>
      <div
        onClick={() => setOn(!on)}
        style={{
          width: 38, height: 22, borderRadius: 99, cursor: "pointer",
          background: on ? C.green : C.border,
          position: "relative", transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 3,
          left: on ? 19 : 3,
          width: 16, height: 16, borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          transition: "left 0.2s",
        }} />
      </div>
    </div>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBar({ data, color = C.green }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${(v / max) * 100}%`,
          background: i === data.length - 1 ? color : color + "55",
          borderRadius: "3px 3px 0 0",
          minHeight: 3,
        }} />
      ))}
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

function PageDashboard() {
  return (
    <div>
      <SectionHeader
        title="Dashboard Geral"
        sub="Visão geral da plataforma em tempo real"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Exportar" icon="download" variant="secondary" size="sm" />
            <Btn label="Atualizar" icon="activity" size="sm" />
          </div>
        }
      />

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total de Utilizadores" value="12 480" icon="users"         color={C.blue}  trend={8.2} />
        <StatCard label="Vendedores Ativos"      value="1 340"  icon="shopping-bag"  color={C.green} trend={5.1} />
        <StatCard label="Afiliados"              value="892"    icon="link"          color={C.amber} trend={12.4} />
        <StatCard label="Receita Total (MZN)"    value="2.4M"   icon="dollar"        color={C.green} trend={18.7} />
        <StatCard label="Pedidos Hoje"           value="314"    icon="package"       color={C.blue}  trend={3.2} />
        <StatCard label="Comissões Pagas"        value="148k"   icon="credit-card"   color={C.amber} trend={-1.4} />
        <StatCard label="Taxa de Conversão"      value="3.8%"   icon="trending-up"   color={C.green} trend={0.6} />
        <StatCard label="Ticket Médio (MZN)"     value="4 200"  icon="activity"      color={C.blue}  trend={2.1} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Produtos mais vendidos */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>🔥 Produtos mais vendidos</h3>
          {[
            { name: "Ténis Nike Air Max 2024", sales: 214, pct: 88 },
            { name: "Conjunto Capulana Bordada", sales: 189, pct: 78 },
            { name: "Perfume Importado Chanel", sales: 156, pct: 64 },
            { name: "Auscultadores Sony WH", sales: 134, pct: 55 },
            { name: "Castanha de Caju 1kg", sales: 120, pct: 49 },
          ].map((p, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: C.textMute }}>{p.sales} vendas</span>
              </div>
              <div style={{ height: 4, background: C.border, borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${p.pct}%`, background: C.green, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top Afiliados */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>⭐ Top Afiliados</h3>
          <Table
            cols={["Afiliado", "Vendas", "Comissão", "Nível"]}
            rows={[
              ["João Matos",    "312", "18 400 MZN", <Badge label="Ouro"   type="warning" />],
              ["Ana Lopes",     "278", "15 200 MZN", <Badge label="Ouro"   type="warning" />],
              ["Carlos Nhaca",  "201", "11 800 MZN", <Badge label="Prata"  type="info" />],
              ["Fátima Dique",  "164", "9 100 MZN",  <Badge label="Prata"  type="info" />],
              ["Pedro Mabunda", "98",  "5 400 MZN",  <Badge label="Bronze" type="default" />],
            ]}
          />
        </div>
      </div>

      {/* Atividade recente */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📋 Atividade Recente</h3>
        <Table
          cols={["Ação", "Utilizador", "Módulo", "Hora", "Estado"]}
          rows={[
            ["Novo produto submetido",    "vendedor@mztictac.mz", "Produtos",    "14:32", <Badge label="Pendente"  type="warning" />],
            ["Saque solicitado",          "afil@mztictac.mz",    "Financeiro",  "14:18", <Badge label="Pendente"  type="warning" />],
            ["Conta bloqueada",           "spam@test.com",        "Segurança",   "13:55", <Badge label="Ação tomada" type="danger" />],
            ["Pedido #4821 concluído",    "comprador@gmail.com",  "Pedidos",     "13:40", <Badge label="Concluído" type="success" />],
            ["Novo afiliado registado",   "novo@mztictac.mz",    "Afiliados",   "13:12", <Badge label="Ativo"     type="success" />],
          ]}
        />
      </div>
    </div>
  );
}

// function PageUtilizadores() {
//   return (
//     <div>
//       <SectionHeader
//         title="Gestão de Utilizadores"
//         sub="Ver, filtrar e gerir todos os utilizadores da plataforma"
//         action={<Btn label="Exportar Excel" icon="download" variant="secondary" size="sm" />}
//       />
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
//         <StatCard label="Total"     value="12 480" icon="users"        color={C.blue} />
//         <StatCard label="Compradores" value="9 840" icon="shopping-bag" color={C.green} />
//         <StatCard label="Vendedores"  value="1 340" icon="package"      color={C.amber} />
//         <StatCard label="Afiliados"   value="892"   icon="link"         color={C.blue} />
//       </div>

//       <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
//         <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
//           <div style={{ flex: 1, minWidth: 200 }}><Input placeholder="Pesquisar por nome ou email..." icon="search" /></div>
//           <select style={{ padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.text, background: C.bg, fontFamily: "inherit" }}>
//             <option>Todos os tipos</option><option>Comprador</option><option>Vendedor</option><option>Afiliado</option>
//           </select>
//           <select style={{ padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.text, background: C.bg, fontFamily: "inherit" }}>
//             <option>Todos os estados</option><option>Ativo</option><option>Bloqueado</option><option>Pendente</option>
//           </select>
//         </div>
//         <Table
//           cols={["Utilizador", "Email", "Tipo", "Registo", "Estado", "Ações"]}
//           rows={[
//             ["João Matos",    "joao@gmail.com",    <Badge label="Afiliado Ouro" type="warning" />, "12 Jan 2025", <Badge label="Ativo"     type="success" />, <div style={{display:"flex",gap:6}}><Btn label="Ver"      icon="eye"   size="sm" variant="ghost" /><Btn label="Bloquear" icon="x" size="sm" variant="secondary" /></div>],
//             ["Ana Lopes",     "ana@gmail.com",     <Badge label="Vendedora"     type="info" />,    "08 Fev 2025", <Badge label="Ativo"     type="success" />, <div style={{display:"flex",gap:6}}><Btn label="Ver"      icon="eye"   size="sm" variant="ghost" /><Btn label="Bloquear" icon="x" size="sm" variant="secondary" /></div>],
//             ["Carlos Nhaca",  "carlos@hotmail.com",<Badge label="Comprador"     type="default" />, "20 Mar 2025", <Badge label="Ativo"     type="success" />, <div style={{display:"flex",gap:6}}><Btn label="Ver"      icon="eye"   size="sm" variant="ghost" /><Btn label="Bloquear" icon="x" size="sm" variant="secondary" /></div>],
//             ["spam_user99",   "spam99@test.com",   <Badge label="Comprador"     type="default" />, "01 Abr 2025", <Badge label="Bloqueado" type="danger" />,  <div style={{display:"flex",gap:6}}><Btn label="Ver"      icon="eye"   size="sm" variant="ghost" /><Btn label="Ativar"   icon="check" size="sm" variant="ghost" /></div>],
//             ["Fátima Dique",  "fatima@gmail.com",  <Badge label="Afiliada Prata" type="info" />,  "15 Mar 2025", <Badge label="Ativo"     type="success" />, <div style={{display:"flex",gap:6}}><Btn label="Ver"      icon="eye"   size="sm" variant="ghost" /><Btn label="Bloquear" icon="x" size="sm" variant="secondary" /></div>],
//           ]}
//         />
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 12, color: C.textMute }}>
//           <span>Mostrando 5 de 12 480 utilizadores</span>
//           <div style={{ display: "flex", gap: 6 }}>
//             {[1,2,3,"...",420].map((p,i) => (
//               <button key={i} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${p===1?C.green:C.border}`, background: p===1?C.green:"transparent", color: p===1?"#fff":C.textSub, fontSize: 12, cursor: "pointer" }}>{p}</button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function PagePedidos() {
//   return (
//     <div>
//       <SectionHeader title="Gestão de Pedidos" sub="Acompanhar e intervir em todos os pedidos da plataforma" />
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
//         <StatCard label="Total"      value="8 420" icon="shopping-bag" color={C.blue} />
//         <StatCard label="Pendentes"  value="314"   icon="bell"         color={C.amber} />
//         <StatCard label="Em trânsito" value="892"  icon="activity"     color={C.blue} />
//         <StatCard label="Concluídos" value="7 100" icon="check"        color={C.green} />
//         <StatCard label="Cancelados" value="114"   icon="x"            color={C.red} />
//       </div>
//       <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
//         <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
//           <div style={{ flex: 1 }}><Input placeholder="Pesquisar pedido #..." icon="search" /></div>
//           <select style={{ padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.text, background: C.bg, fontFamily: "inherit" }}>
//             <option>Todos os estados</option><option>Pendente</option><option>Pago</option><option>Enviado</option><option>Concluído</option><option>Cancelado</option>
//           </select>
//         </div>
//         <Table
//           cols={["Pedido #", "Comprador", "Vendedor", "Total (MZN)", "Data", "Estado", "Ações"]}
//           rows={[
//             ["#4821", "João M.",   "Ana L.",    "3 400", "18 Abr", <Badge label="Concluído"  type="success" />, <Btn label="Ver detalhes" icon="eye" size="sm" variant="ghost" />],
//             ["#4820", "Carlos N.", "Fátima D.", "1 900", "18 Abr", <Badge label="Enviado"    type="info" />,    <Btn label="Ver detalhes" icon="eye" size="sm" variant="ghost" />],
//             ["#4819", "Maria S.",  "Pedro M.",  "4 200", "17 Abr", <Badge label="Pago"       type="info" />,    <Btn label="Ver detalhes" icon="eye" size="sm" variant="ghost" />],
//             ["#4818", "André F.",  "Ana L.",    "800",   "17 Abr", <Badge label="Disputa"    type="danger" />,  <div style={{display:"flex",gap:6}}><Btn label="Intervir" icon="shield" size="sm" variant="ghost" /><Btn label="Cancelar" icon="x" size="sm" variant="secondary" /></div>],
//             ["#4817", "Luísa T.",  "João M.",   "2 100", "16 Abr", <Badge label="Cancelado"  type="danger" />,  <Btn label="Ver detalhes" icon="eye" size="sm" variant="ghost" />],
//           ]}
//         />
//       </div>
//     </div>
//   );
// }





function PageRelatorios() {
  return (
    <div>
      <SectionHeader title="Relatórios Avançados" sub="Gerar e exportar relatórios financeiros, de vendas e afiliados" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {[
          { title: "Relatório Financeiro",  desc: "GMV, receita líquida, lucro/prejuízo, fluxo de caixa, ticket médio", icon: "dollar",    color: C.green },
          { title: "Relatório de Vendas",   desc: "Vendas por categoria, por vendedor, por região e tendências", icon: "bar-chart", color: C.blue },
          { title: "Relatório de Afiliados",desc: "Comissões geradas, top afiliados, desempenho por nível",     icon: "link",      color: C.amber },
          { title: "Relatório Fiscal",      desc: "Dados para AT — IVA, IRPS, retenção na fonte, conformidade legal", icon: "shield",    color: C.red },
          { title: "Relatório de Pedidos",  desc: "Status de pedidos, disputas, devoluções e cancelamentos",    icon: "shopping-bag", color: C.blue },
          { title: "Relatório de Fraude",   desc: "Contas suspeitas, tráfego inválido, bloqueios e ações tomadas", icon: "alert-triangle", color: C.red },
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

function PageConfiguracoes() {
  return (
    <div>
      <SectionHeader title="Configurações do Sistema" sub="Regras gerais da plataforma, limites e comportamento global" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>⚙️ Regras Gerais</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Toggle label="Ativar programa de afiliados"       active={true} />
            <Toggle label="Aprovação manual de produtos"       active={true} />
            <Toggle label="Cashback automático para compradores" active={false} />
            <Toggle label="Modo manutenção"                    active={false} />
            <Toggle label="Registo de novos vendedores"        active={true} />
            <Toggle label="Pagamentos M-Pesa ativos"           active={true} />
            <Toggle label="Pagamentos E-Mola ativos"           active={true} />
            <Toggle label="Pagamentos mKesh ativos"            active={true} />
          </div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>🔢 Limites do Sistema</h3>
          {[
            { label: "Valor mínimo de saque (MZN)",              value: "500" },
            { label: "Valor máximo de saque sem aprovação (MZN)", value: "5 000" },
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

function PageSeguranca() {
  return (
    <div>
      <SectionHeader title="Segurança & Auditoria" sub="Logs completos, alertas e rastreamento de todas as ações críticas" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Alertas Hoje"     value="8"    icon="alert-triangle" color={C.red} />
        <StatCard label="Ações Admin"      value="142"  icon="activity"       color={C.blue} />
        <StatCard label="Logins Suspeitos" value="3"    icon="lock"           color={C.amber} />
        <StatCard label="IPs Bloqueados"   value="19"   icon="shield"         color={C.red} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📋 Log de Auditoria</h3>
          <Table
            cols={["Admin", "Ação", "Módulo", "IP", "Data/Hora"]}
            rows={[
              ["super_admin", "Bloqueou utilizador spam99",      "Utilizadores", "196.2.x.x", "18 Abr 14:55"],
              ["super_admin", "Alterou taxa de saque para 2%",   "Financeiro",   "196.2.x.x", "18 Abr 14:20"],
              ["mod_finance", "Aprovou saque TXN-00819",         "Saques",       "41.85.x.x", "18 Abr 13:40"],
              ["super_admin", "Rejeitou produto #3812",          "Produtos",     "196.2.x.x", "18 Abr 12:10"],
              ["mod_content", "Desativou produto suspeito XYZ",  "Produtos",     "41.85.x.x", "17 Abr 18:00"],
            ]}
          />
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>🔐 Segurança do Sistema</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Toggle label="OTP por email em ações financeiras" active={true} />
            <Toggle label="2FA para todos os admins"           active={true} />
            <Toggle label="Logs imutáveis (auditoria)"         active={true} />
            <Toggle label="Alertas de IP suspeito"             active={true} />
            <Toggle label="Bloqueio automático após 5 tentativas" active={true} />
          </div>
          <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>🚨 Alertas Ativos</h3>
            {[
              { msg: "IP 41.120.x.x tentou 8 logins — bloqueado",     type: "danger" },
              { msg: "Saque incomum de 28 000 MZN detectado",         type: "danger" },
              { msg: "3 contas com mesmo IP registadas hoje",         type: "warning" },
              { msg: "Pico de tráfego afiliado detectado (spam_afilX)", type: "warning" },
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

function PageFraude() {
  return (
    <div>
      <SectionHeader title="Deteção de Fraude" sub="Identificar e agir contra múltiplas contas, compras falsas e afiliados suspeitos" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Casos Ativos"       value="12"  icon="alert-triangle" color={C.red} />
        <StatCard label="Contas Banidas"     value="48"  icon="x"              color={C.red} />
        <StatCard label="Ganhos Removidos"   value="84k MZN" icon="dollar"     color={C.amber} />
        <StatCard label="IPs na Blocklist"   value="19"  icon="shield"         color={C.blue} />
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>🚨 Casos de Fraude Detetados</h3>
        <Table
          cols={["Conta", "Tipo de fraude", "Evidência", "Valor em risco", "Estado", "Ações"]}
          rows={[
            ["spam_afilX",   "Auto-afiliação + tráfego inválido", "489 conversões em 48h, 1 IP",  "28 000 MZN", <Badge label="Em análise" type="warning" />, <div style={{display:"flex",gap:6}}><Btn label="Banir" icon="x" size="sm" variant="danger" /><Btn label="Remover ganhos" size="sm" variant="secondary" /></div>],
            ["user_multi1",  "Múltiplas contas",                  "3 contas no mesmo IP/dispositivo","4 200 MZN", <Badge label="Bloqueado"  type="danger" />,  <Btn label="Banir definitivo" size="sm" variant="secondary" />],
            ["compra_fake9", "Compras falsas (auto-compra)",       "Comprou próprios produtos",    "12 000 MZN", <Badge label="Em análise" type="warning" />, <div style={{display:"flex",gap:6}}><Btn label="Banir" icon="x" size="sm" variant="danger" /><Btn label="Estornar" size="sm" variant="secondary" /></div>],
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

function PagePermissoes() {
  return (
    <div>
      <SectionHeader title="Controlo de Permissões" sub="Definir acessos por nível de administrador" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          {
            role: "Super Admin", color: C.red, badge: "danger",
            desc: "Acesso total — todas as funcionalidades, sem restrições.",
            perms: ["Dashboard","Utilizadores","Produtos","Pedidos","Afiliados","Financeiro","Saques","Relatórios","Configurações","Segurança","Fraude","Permissões"],
          },
          {
            role: "Admin Financeiro", color: C.amber, badge: "warning",
            desc: "Foco em finanças — sem acesso a configurações críticas do sistema.",
            perms: ["Dashboard","Pedidos","Financeiro","Saques","Relatórios","Fraude (leitura)"],
          },
          {
            role: "Moderador", color: C.blue, badge: "info",
            desc: "Moderação de conteúdo — produtos, utilizadores e pedidos.",
            perms: ["Dashboard","Utilizadores (leitura)","Produtos","Pedidos","Fraude (leitura)"],
          },
        ].map((r, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{r.role}</h3>
              <Badge label={r.role === "Super Admin" ? "Total" : r.role === "Admin Financeiro" ? "Restrito" : "Básico"} type={r.badge} />
            </div>
            <p style={{ fontSize: 12, color: C.textSub, marginBottom: 16, lineHeight: 1.5 }}>{r.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {r.perms.map((p, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text }}>
                  <Icon name="check" size={13} color={r.color} />
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

// ─── PAGE MAP ─────────────────────────────────────────────────────────────────
const PAGES = {
  dashboard:     <PageDashboard />,
  usuarios:      <PageUtilizadores />,
  produtos:      <PageProdutos />,
  pedidos:       <PagePedidos />,
  afiliados:     <PageAfiliados />,
  financeiro:    <PageFinanceiro />,
  saques:        <PageSaques />,
  relatorios:    <PageRelatorios />,
  configuracoes: <PageConfiguracoes />,
  seguranca:     <PageSeguranca />,
  fraude:        <PageFraude />,
  permissoes:    <PagePermissoes />,
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [active, setActive] = useState("dashboard");

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      background: C.bg,
    }}>
      {/* ══ SIDEBAR ══ */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: C.sidebar,
        display: "flex", flexDirection: "column",
        overflowY: "auto",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}>
        {/* Logo */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="zap" size={16} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>MozTicTac</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Painel Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {NAV.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", padding: "0 10px", marginBottom: 6 }}>
                {group.group}
              </p>
              {group.items.map(item => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 8, border: "none",
                      background: isActive ? C.green : "transparent",
                      color: isActive ? "#fff" : "rgba(255,255,255,0.50)",
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s",
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.sidebarHov; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.50)"; } }}
                  >
                    <Icon name={item.icon} size={15} color={isActive ? "#fff" : "rgba(255,255,255,0.50)"} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Admin info */}
        <div style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.green + "33", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="user" size={15} color={C.green} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Super Admin</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.30)" }}>admin@mztictac.mz</p>
          </div>
          <Icon name="more-vertical" size={14} color="rgba(255,255,255,0.30)" />
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 28px",
          background: C.card, borderBottom: `1px solid ${C.border}`,
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ width: 220 }}>
            <Input placeholder="Pesquisar no painel..." icon="search" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Alertas */}
            <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex" }}>
              <Icon name="bell" size={18} color={C.textSub} />
              <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: C.red, border: "2px solid #fff" }} />
            </button>
            <div style={{ width: 1, height: 20, background: C.border }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="user" size={14} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Super Admin</p>
                <p style={{ fontSize: 10, color: C.textMute }}>Nível máximo</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: "28px 28px 40px" }}>
          {PAGES[active]}
        </div>
      </main>
    </div>
  );
}