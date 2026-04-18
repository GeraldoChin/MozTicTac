import { useState } from "react";

// ─── Design tokens (mesmos do admin existente) ────────────────────────────────
const C = {
  green:      "#16a34a",
  greenLight: "#22c55e",
  greenDim:   "#dcfce7",
  greenMuted: "rgba(22,163,74,0.12)",
  sidebar:    "#0f172a",
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

const NIVEIS = {
  bronze: { label: "Bronze", cor: "#CD7F32", bg: "#FFF3E8", icon: "🥉" },
  prata:  { label: "Prata",  cor: "#A8A9AD", bg: "#F4F4F6", icon: "🥈" },
  ouro:   { label: "Ouro",   cor: "#FFD700", bg: "#FFFBEA", icon: "🥇" },
};

// ─── Dados mock ───────────────────────────────────────────────────────────────
const AFILIADOS_MOCK = [
  {
    id: "AF001", nome: "João Matos",    email: "joao@gmail.com",    nivel: "ouro",
    vendas: 312, comissaoTotal: 18400, comissaoPendente: 2400, cliques: 4820,
    conversao: 6.47, ganhoMes: 4200, estado: "ativo", risco: 8,
    registoEm: "12 Jan 2025", ultimaAtiv: "Hoje 14:32", metodo: "M-Pesa",
    comissaoCustom: null, links: 8, fraudes: 0,
    historico: [
      { mes: "Jan", ganho: 2800 }, { mes: "Fev", ganho: 3200 }, { mes: "Mar", ganho: 3800 },
      { mes: "Abr", ganho: 4200 },
    ],
  },
  {
    id: "AF002", nome: "Ana Lopes",     email: "ana@gmail.com",     nivel: "ouro",
    vendas: 278, comissaoTotal: 15200, comissaoPendente: 1800, cliques: 4100,
    conversao: 6.78, ganhoMes: 3600, estado: "ativo", risco: 12,
    registoEm: "08 Fev 2025", ultimaAtiv: "Hoje 11:10", metodo: "E-Mola",
    comissaoCustom: null, links: 6, fraudes: 0,
    historico: [
      { mes: "Jan", ganho: 2200 }, { mes: "Fev", ganho: 2800 }, { mes: "Mar", ganho: 3400 },
      { mes: "Abr", ganho: 3600 },
    ],
  },
  {
    id: "AF003", nome: "Carlos Nhaca",  email: "carlos@hotmail.com",nivel: "prata",
    vendas: 201, comissaoTotal: 11800, comissaoPendente: 900,  cliques: 3200,
    conversao: 6.28, ganhoMes: 2800, estado: "ativo", risco: 18,
    registoEm: "20 Mar 2025", ultimaAtiv: "Ontem 18:45", metodo: "M-Pesa",
    comissaoCustom: null, links: 4, fraudes: 0,
    historico: [
      { mes: "Jan", ganho: 1800 }, { mes: "Fev", ganho: 2200 }, { mes: "Mar", ganho: 2600 },
      { mes: "Abr", ganho: 2800 },
    ],
  },
  {
    id: "AF004", nome: "Fátima Dique",  email: "fatima@gmail.com",  nivel: "prata",
    vendas: 164, comissaoTotal: 9100,  comissaoPendente: 700,  cliques: 2800,
    conversao: 5.86, ganhoMes: 2100, estado: "ativo", risco: 22,
    registoEm: "15 Mar 2025", ultimaAtiv: "Hoje 09:20", metodo: "Banco",
    comissaoCustom: 15, links: 3, fraudes: 0,
    historico: [
      { mes: "Jan", ganho: 1200 }, { mes: "Fev", ganho: 1600 }, { mes: "Mar", ganho: 1900 },
      { mes: "Abr", ganho: 2100 },
    ],
  },
  {
    id: "AF005", nome: "Pedro Mabunda", email: "pedro@gmail.com",   nivel: "bronze",
    vendas: 98,  comissaoTotal: 5400,  comissaoPendente: 400,  cliques: 1980,
    conversao: 4.95, ganhoMes: 1100, estado: "ativo", risco: 31,
    registoEm: "02 Abr 2025", ultimaAtiv: "Hoje 16:00", metodo: "M-Pesa",
    comissaoCustom: null, links: 2, fraudes: 0,
    historico: [
      { mes: "Jan", ganho: 0 }, { mes: "Fev", ganho: 800 }, { mes: "Mar", ganho: 980 },
      { mes: "Abr", ganho: 1100 },
    ],
  },
  {
    id: "AF006", nome: "spam_afilX",    email: "spam@fake.mz",      nivel: "bronze",
    vendas: 489, comissaoTotal: 28000, comissaoPendente: 28000, cliques: 489,
    conversao: 100.0, ganhoMes: 28000, estado: "suspeito", risco: 98,
    registoEm: "10 Abr 2025", ultimaAtiv: "17 Abr 02:14", metodo: "M-Pesa",
    comissaoCustom: null, links: 1, fraudes: 3,
    historico: [
      { mes: "Jan", ganho: 0 }, { mes: "Fev", ganho: 0 }, { mes: "Mar", ganho: 0 },
      { mes: "Abr", ganho: 28000 },
    ],
  },
  {
    id: "AF007", nome: "Luísa Tembe",   email: "luisa@gmail.com",   nivel: "bronze",
    vendas: 42,  comissaoTotal: 2100,  comissaoPendente: 500,  cliques: 920,
    conversao: 4.57, ganhoMes: 600, estado: "pendente", risco: 15,
    registoEm: "15 Abr 2025", ultimaAtiv: "16 Abr 10:00", metodo: "E-Mola",
    comissaoCustom: null, links: 1, fraudes: 0,
    historico: [
      { mes: "Jan", ganho: 0 }, { mes: "Fev", ganho: 0 }, { mes: "Mar", ganho: 800 },
      { mes: "Abr", ganho: 600 },
    ],
  },
];

const PEDIDOS_APROVACAO = [
  { id: "AP001", nome: "Amina Cossa",   email: "amina@gmail.com",   registoEm: "17 Abr 2025", metodo: "M-Pesa", vendedor: false },
  { id: "AP002", nome: "Rogério Sitoe", email: "rogerio@gmail.com", registoEm: "16 Abr 2025", metodo: "E-Mola", vendedor: true },
];

// ─── Reutilizáveis (copiados do admin) ───────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width: size, height: size, stroke: color, fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 };
  const icons = {
    "link":           <svg style={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    "dollar":         <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    "users":          <svg style={s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    "alert-triangle": <svg style={s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    "trending-up":    <svg style={s} viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    "check":          <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    "x":              <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    "eye":            <svg style={s} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    "download":       <svg style={s} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    "settings":       <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    "shield":         <svg style={s} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "bar-chart":      <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    "search":         <svg style={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    "user":           <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    "toggle-right":   <svg style={s} viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/></svg>,
    "chevron-right":  <svg style={s} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
    "activity":       <svg style={s} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    "zap":            <svg style={s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    "clock":          <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    "ban":            <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
    "gift":           <svg style={s} viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
    "edit":           <svg style={s} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    "trash":          <svg style={s} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    "lock":           <svg style={s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    "unlock":         <svg style={s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>,
    "percent":        <svg style={s} viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    "info":           <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  };
  return icons[name] || null;
}

function Badge({ label, type = "default" }) {
  const map = {
    success:  { bg: C.greenDim, color: C.green },
    warning:  { bg: C.amberDim, color: C.amber },
    danger:   { bg: C.redDim,   color: C.red },
    info:     { bg: C.blueDim,  color: C.blue },
    purple:   { bg: C.purpleDim,color: C.purple },
    default:  { bg: "#f1f5f9",  color: C.textSub },
  };
  const s = map[type] || map.default;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: s.bg, color: s.color, display: "inline-block", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, icon, color = C.green, trend }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={17} color={color} />
        </div>
        {trend !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: trend > 0 ? C.greenDim : C.redDim, color: trend > 0 ? C.green : C.red }}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: C.textSub, marginTop: 3, fontWeight: 500 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: C.textMute, marginTop: 1 }}>{sub}</p>}
      </div>
    </div>
  );
}

function Btn({ label, icon, onClick, variant = "primary", size = "md", disabled = false }) {
  const styles = {
    primary:   { bg: C.green,      color: "#fff",     border: "none" },
    secondary: { bg: "transparent",color: C.textSub,  border: `1.5px solid ${C.border}` },
    danger:    { bg: C.red,        color: "#fff",      border: "none" },
    ghost:     { bg: C.greenMuted, color: C.green,    border: "none" },
    amber:     { bg: C.amberDim,   color: C.amber,    border: "none" },
  };
  const pad = size === "sm" ? "6px 12px" : "9px 18px";
  const fs  = size === "sm" ? 12 : 13;
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: pad, fontSize: fs, fontWeight: 700, background: disabled ? "#f1f5f9" : s.bg, color: disabled ? C.textMute : s.color, border: s.border || "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, transition: "opacity 0.15s", whiteSpace: "nowrap", fontFamily: "inherit" }}>
      {icon && <Icon name={icon} size={13} color={disabled ? C.textMute : s.color} />}
      {label}
    </button>
  );
}

function Toggle({ label, active = false, onChange }) {
  const [on, setOn] = useState(active);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 13, color: C.textSub, fontWeight: 500 }}>{label}</span>
      <div onClick={() => { setOn(!on); onChange && onChange(!on); }}
        style={{ width: 38, height: 22, borderRadius: 99, cursor: "pointer", background: on ? C.green : C.border, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left 0.2s" }} />
      </div>
    </div>
  );
}

// ─── Mini sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color = C.green, height = 32 }) {
  const max = Math.max(...data.map(d => d.ganho), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.mes}: ${d.ganho.toLocaleString("pt-MZ")} MZN`}
          style={{ flex: 1, height: `${Math.max(4, (d.ganho / max) * 100)}%`, background: i === data.length - 1 ? color : color + "55", borderRadius: "2px 2px 0 0", transition: "height 0.3s" }} />
      ))}
    </div>
  );
}

// ─── Risk Score badge ────────────────────────────────────────────────────────
function RiskScore({ score }) {
  const color = score >= 70 ? C.red : score >= 40 ? C.amber : C.green;
  const label = score >= 70 ? "Alto" : score >= 40 ? "Médio" : "Baixo";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 48, height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{label} ({score})</span>
    </div>
  );
}

// ─── Modal genérico ───────────────────────────────────────────────────────────
function Modal({ open, onClose, children, width = 520 }) {
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

// ─── SUBPÁGINAS ───────────────────────────────────────────────────────────────

// ── 1. VISÃO GERAL ────────────────────────────────────────────────────────────
function SubVisaoGeral({ afiliados, onSelectAfiliado }) {
  const ativos    = afiliados.filter(a => a.estado === "ativo").length;
  const suspeitos = afiliados.filter(a => a.estado === "suspeito").length;
  const pendentes = afiliados.filter(a => a.estado === "pendente").length;
  const totalComissoes = afiliados.reduce((s, a) => s + a.comissaoTotal, 0);
  const totalPendente  = afiliados.reduce((s, a) => s + a.comissaoPendente, 0);

  const porNivel = {
    ouro:   afiliados.filter(a => a.nivel === "ouro"),
    prata:  afiliados.filter(a => a.nivel === "prata"),
    bronze: afiliados.filter(a => a.nivel === "bronze"),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <StatCard label="Total Afiliados"       value={afiliados.length} icon="users"           color={C.blue}   trend={12.4} />
        <StatCard label="Ativos"                value={ativos}           icon="check"           color={C.green}  />
        <StatCard label="Suspeitos / Fraude"    value={suspeitos}        icon="alert-triangle"  color={C.red}    />
        <StatCard label="Comissões Pagas (MZN)" value={`${(totalComissoes/1000).toFixed(0)}k`} icon="dollar" color={C.amber} trend={8.1} />
        <StatCard label="Pendente (MZN)"        value={`${(totalPendente/1000).toFixed(0)}k`}  icon="clock"  color={C.purple} />
      </div>

      {/* Distribuição por nível */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📊 Distribuição por Nível</h3>
          {Object.entries(porNivel).map(([nivel, lista]) => {
            const info = NIVEIS[nivel];
            const pct = Math.round((lista.length / afiliados.length) * 100);
            const totalGanho = lista.reduce((s, a) => s + a.comissaoTotal, 0);
            return (
              <div key={nivel} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{info.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{info.label}</span>
                    <span style={{ fontSize: 11, color: C.textMute }}>({lista.length} afiliados)</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: info.cor }}>{totalGanho.toLocaleString("pt-MZ")} MZN</span>
                </div>
                <div style={{ height: 6, background: C.border, borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: info.cor, borderRadius: 99, transition: "width 0.4s" }} />
                </div>
                <p style={{ fontSize: 11, color: C.textMute, marginTop: 3 }}>{pct}% do total de afiliados</p>
              </div>
            );
          })}
        </div>

        {/* Top 5 afiliados */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>⭐ Top Afiliados — Mês Atual</h3>
          {[...afiliados].sort((a, b) => b.ganhoMes - a.ganhoMes).slice(0, 5).map((a, i) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}
              onClick={() => onSelectAfiliado(a)}>
              <span style={{ fontSize: 18, fontWeight: 900, color: C.textMute, width: 20, textAlign: "center" }}>{i + 1}</span>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: NIVEIS[a.nivel].cor + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 14 }}>{NIVEIS[a.nivel].icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.nome}</p>
                <p style={{ fontSize: 11, color: C.textMute }}>{a.vendas} vendas · {a.conversao}% conv.</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{a.ganhoMes.toLocaleString("pt-MZ")} MZN</p>
                <Sparkline data={a.historico} height={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas de risco */}
      {afiliados.some(a => a.risco >= 70 || a.estado === "suspeito") && (
        <div style={{ background: C.redDim, border: `1.5px solid ${C.red}30`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="alert-triangle" size={16} color={C.red} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.red }}>🚨 Afiliados a Requerer Atenção Imediata</h3>
          </div>
          {afiliados.filter(a => a.risco >= 50 || a.estado === "suspeito").map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.red}15` }}>
              <Badge label={a.estado === "suspeito" ? "FRAUDE" : "RISCO ALTO"} type="danger" />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>{a.nome}</span>
              <span style={{ fontSize: 12, color: C.textSub }}>{a.comissaoPendente.toLocaleString("pt-MZ")} MZN em risco</span>
              <Btn label="Investigar" icon="eye" size="sm" variant="danger" onClick={() => onSelectAfiliado(a)} />
            </div>
          ))}
        </div>
      )}

      {/* Pedidos de adesão */}
      {PEDIDOS_APROVACAO.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Icon name="clock" size={15} color={C.amber} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Pedidos de Adesão Pendentes</h3>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: C.amberDim, color: C.amber }}>{PEDIDOS_APROVACAO.length}</span>
          </div>
          {PEDIDOS_APROVACAO.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.blueDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="user" size={15} color={C.blue} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.nome}</p>
                <p style={{ fontSize: 11, color: C.textMute }}>{p.email} · Registo {p.registoEm} · {p.metodo}</p>
                {p.vendedor && <Badge label="Já é vendedor" type="info" />}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn label="Aprovar" icon="check" size="sm" variant="ghost" />
                <Btn label="Rejeitar" icon="x" size="sm" variant="secondary" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 2. LISTA DE AFILIADOS ─────────────────────────────────────────────────────
function SubListaAfiliados({ afiliados, setAfiliados, onSelectAfiliado }) {
  const [busca, setBusca] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenar, setOrdenar] = useState("comissao");
  const [modalComissao, setModalComissao] = useState(null);
  const [novaComissao, setNovaComissao] = useState("");
  const [confirmBan, setConfirmBan] = useState(null);

  let lista = afiliados.filter(a => {
    const ok1 = filtroNivel === "todos" || a.nivel === filtroNivel;
    const ok2 = filtroEstado === "todos" || a.estado === filtroEstado;
    const ok3 = a.nome.toLowerCase().includes(busca.toLowerCase()) || a.email.toLowerCase().includes(busca.toLowerCase());
    return ok1 && ok2 && ok3;
  });
  if (ordenar === "comissao")  lista = [...lista].sort((a, b) => b.comissaoTotal - a.comissaoTotal);
  else if (ordenar === "vendas")    lista = [...lista].sort((a, b) => b.vendas - a.vendas);
  else if (ordenar === "risco")     lista = [...lista].sort((a, b) => b.risco - a.risco);
  else if (ordenar === "conversao") lista = [...lista].sort((a, b) => b.conversao - a.conversao);

  const estadoCores = { ativo: "success", suspeito: "danger", pendente: "warning", bloqueado: "danger" };

  const banirAfiliado = (id) => {
    setAfiliados(prev => prev.map(a => a.id === id ? { ...a, estado: "bloqueado", comissaoPendente: 0 } : a));
    setConfirmBan(null);
  };

  const aplicarComissaoCustom = () => {
    if (!modalComissao || !novaComissao) return;
    setAfiliados(prev => prev.map(a => a.id === modalComissao.id ? { ...a, comissaoCustom: parseFloat(novaComissao) } : a));
    setModalComissao(null);
    setNovaComissao("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filtros */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon name="search" size={14} color={C.textMute} /></span>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar por nome ou email..."
            style={{ width: "100%", padding: "8px 12px 8px 32px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" }} />
        </div>
        {[
          { label: "Nível", value: filtroNivel, setValue: setFiltroNivel, options: [["todos","Todos os níveis"],["ouro","Ouro"],["prata","Prata"],["bronze","Bronze"]] },
          { label: "Estado", value: filtroEstado, setValue: setFiltroEstado, options: [["todos","Todos os estados"],["ativo","Ativo"],["suspeito","Suspeito"],["pendente","Pendente"],["bloqueado","Bloqueado"]] },
          { label: "Ordenar", value: ordenar, setValue: setOrdenar, options: [["comissao","Maior comissão"],["vendas","Mais vendas"],["conversao","Maior conversão"],["risco","Risco (maior)"],] },
        ].map(({ value, setValue, options }, i) => (
          <select key={i} value={value} onChange={e => setValue(e.target.value)}
            style={{ padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.text, background: C.bg, fontFamily: "inherit", cursor: "pointer" }}>
            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <Btn label="Exportar" icon="download" variant="secondary" size="sm" />
      </div>

      {/* Tabela */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${C.border}`, background: C.bg }}>
                {["Afiliado","Nível","Vendas","Taxa Conv.","Comissão Total","Comissão Custom","Pendente","Score Risco","Estado","Ações"].map((c, i) => (
                  <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: C.textMute, whiteSpace: "nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: NIVEIS[a.nivel].cor + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                        {NIVEIS[a.nivel].icon}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{a.nome}</p>
                        <p style={{ fontSize: 11, color: C.textMute }}>{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Badge label={NIVEIS[a.nivel].label} type={a.nivel === "ouro" ? "warning" : a.nivel === "prata" ? "info" : "default"} />
                  </td>
                  <td style={{ padding: "12px 14px", color: C.text, fontWeight: 600 }}>{a.vendas}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontWeight: 700, color: a.conversao > 90 ? C.red : C.text }}>{a.conversao}%</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: C.green }}>{a.comissaoTotal.toLocaleString("pt-MZ")} MZN</td>
                  <td style={{ padding: "12px 14px" }}>
                    {a.comissaoCustom
                      ? <span style={{ fontWeight: 700, color: C.purple }}>{a.comissaoCustom}% <span style={{ fontSize: 10, color: C.textMute }}>(custom)</span></span>
                      : <span style={{ color: C.textMute, fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: a.comissaoPendente > 5000 ? C.amber : C.textSub }}>{a.comissaoPendente.toLocaleString("pt-MZ")} MZN</td>
                  <td style={{ padding: "12px 14px" }}><RiskScore score={a.risco} /></td>
                  <td style={{ padding: "12px 14px" }}><Badge label={a.estado.charAt(0).toUpperCase() + a.estado.slice(1)} type={estadoCores[a.estado] || "default"} /></td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "nowrap" }}>
                      <Btn label="Detalhes" icon="eye"     size="sm" variant="ghost"     onClick={() => onSelectAfiliado(a)} />
                      <Btn label="Comissão" icon="percent" size="sm" variant="secondary" onClick={() => { setModalComissao(a); setNovaComissao(a.comissaoCustom || ""); }} />
                      {a.estado !== "bloqueado"
                        ? <Btn label="Banir" icon="ban" size="sm" variant="danger" onClick={() => setConfirmBan(a)} />
                        : <Btn label="Desbloquear" icon="unlock" size="sm" variant="secondary" onClick={() => setAfiliados(prev => prev.map(x => x.id === a.id ? { ...x, estado: "ativo" } : x))} />
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textMute, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Mostrando {lista.length} de {afiliados.length} afiliados</span>
          <Badge label={`${afiliados.filter(a=>a.estado==="suspeito").length} suspeito(s)`} type="danger" />
        </div>
      </div>

      {/* Modal comissão custom */}
      <Modal open={!!modalComissao} onClose={() => setModalComissao(null)} width={400}>
        <div style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Comissão Personalizada</h3>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}>Definir taxa especial para <strong>{modalComissao?.nome}</strong></p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nova taxa (%)</label>
            <input type="number" min="1" max="50" value={novaComissao} onChange={e => setNovaComissao(e.target.value)}
              placeholder="Ex: 15"
              style={{ width: "100%", padding: "10px 12px", fontSize: 15, fontWeight: 700, border: `2px solid ${C.green}`, borderRadius: 8, fontFamily: "inherit", color: C.text, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ padding: "10px 12px", background: C.amberDim, borderRadius: 8, fontSize: 12, color: C.amber, fontWeight: 500, marginBottom: 20 }}>
            ⚠️ Esta taxa substitui as regras de nível para este afiliado. Requer registo no log de auditoria.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Cancelar"  size="sm" variant="secondary" onClick={() => setModalComissao(null)} />
            <Btn label="Aplicar taxa" size="sm" variant="primary"  onClick={aplicarComissaoCustom} disabled={!novaComissao} />
          </div>
        </div>
      </Modal>

      {/* Modal banir */}
      <Modal open={!!confirmBan} onClose={() => setConfirmBan(null)} width={400}>
        <div style={{ padding: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: C.redDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="ban" size={22} color={C.red} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>Banir afiliado?</h3>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 4 }}>
            <strong>{confirmBan?.nome}</strong> será banido. Todas as comissões pendentes ({confirmBan?.comissaoPendente?.toLocaleString("pt-MZ")} MZN) serão removidas.
          </p>
          <p style={{ fontSize: 12, color: C.red, marginBottom: 20, fontWeight: 600 }}>Esta ação é registada no log de auditoria e não pode ser desfeita facilmente.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Cancelar"        variant="secondary" onClick={() => setConfirmBan(null)} />
            <Btn label="Banir e remover ganhos" variant="danger"     onClick={() => banirAfiliado(confirmBan.id)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── 3. DETALHE DO AFILIADO ────────────────────────────────────────────────────
function SubDetalheAfiliado({ afiliado, onVoltar, setAfiliados }) {
  const nivel = NIVEIS[afiliado.nivel];
  const [modalBonus, setModalBonus] = useState(false);
  const [valorBonus, setValorBonus] = useState("");

  const COMISSOES_DETALHE = [
    { id: "C001", produto: "Ténis Nike Air Max", data: "18 Abr", valor: 456, estado: "disponivel", pedido: "#4821" },
    { id: "C002", produto: "Smartphone Samsung", data: "17 Abr", valor: 340, estado: "disponivel", pedido: "#4820" },
    { id: "C003", produto: "Laptop Lenovo",      data: "15 Abr", valor: 780, estado: "pago",        pedido: "#4818" },
    { id: "C004", produto: "Conjunto Capulana",  data: "12 Abr", valor: 185, estado: "pendente",    pedido: "#4815" },
    { id: "C005", produto: "Perfume Chanel",     data: "10 Abr", valor: 450, estado: "cancelado",   pedido: "#4812" },
  ];

  const LINKS_DETALHE = [
    { produto: "Ténis Nike Air Max", cliques: 1820, conversoes: 97, ganho: 8400, estado: "activo" },
    { produto: "Laptop Lenovo",      cliques: 2100, conversoes: 89, ganho: 7800, estado: "activo" },
    { produto: "Smartphone Samsung", cliques: 900,  conversoes: 42, ganho: 2800, estado: "pausado" },
  ];

  const estadoCor = {
    disponivel: { bg: C.greenDim, color: C.green },
    pendente:   { bg: C.amberDim, color: C.amber },
    pago:       { bg: "#f1f5f9",  color: C.textSub },
    cancelado:  { bg: C.redDim,   color: C.red },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onVoltar} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: C.textSub, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
          ← Voltar
        </button>
        <div style={{ width: 1, height: 24, background: C.border }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: nivel.cor + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{nivel.icon}</div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{afiliado.nome}</p>
            <p style={{ fontSize: 12, color: C.textMute }}>{afiliado.email} · {afiliado.id}</p>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Badge label={afiliado.estado.charAt(0).toUpperCase() + afiliado.estado.slice(1)} type={afiliado.estado === "ativo" ? "success" : afiliado.estado === "suspeito" ? "danger" : "warning"} />
          <Btn label="Dar Bónus" icon="gift" variant="ghost" onClick={() => setModalBonus(true)} />
          <Btn label="Exportar PDF" icon="download" variant="secondary" size="sm" />
        </div>
      </div>

      {/* KPIs do afiliado */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <StatCard label="Total Vendas"    value={afiliado.vendas}                       icon="activity"  color={C.blue} />
        <StatCard label="Taxa Conversão"  value={`${afiliado.conversao}%`}              icon="trending-up" color={afiliado.conversao > 90 ? C.red : C.green} />
        <StatCard label="Comissão Total"  value={`${(afiliado.comissaoTotal/1000).toFixed(1)}k`} icon="dollar" color={C.green} sub="MZN" />
        <StatCard label="Pendente"        value={afiliado.comissaoPendente.toLocaleString("pt-MZ")} icon="clock" color={C.amber} sub="MZN" />
        <StatCard label="Links Activos"   value={afiliado.links}                        icon="link"      color={C.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Perfil completo */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>👤 Perfil do Afiliado</h3>
          {[
            ["ID",                   afiliado.id],
            ["Nível atual",          `${nivel.icon} ${nivel.label}`],
            ["Método de pagamento",  afiliado.metodo],
            ["Registo",              afiliado.registoEm],
            ["Última atividade",     afiliado.ultimaAtiv],
            ["Ocorrências de fraude", afiliado.fraudes === 0 ? "✅ Nenhuma" : `⚠️ ${afiliado.fraudes} ocorrência(s)`],
            ["Comissão custom",      afiliado.comissaoCustom ? `${afiliado.comissaoCustom}% (especial)` : "Padrão por nível"],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 6 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 12, color: C.textMute, fontWeight: 500 }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{v}</span>
            </div>
          ))}

          {/* Score de risco expandido */}
          <div style={{ marginTop: 16, padding: "12px", background: afiliado.risco >= 70 ? C.redDim : afiliado.risco >= 40 ? C.amberDim : C.greenDim, borderRadius: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6 }}>Score de Risco</p>
            <RiskScore score={afiliado.risco} />
            <p style={{ fontSize: 11, color: C.textMute, marginTop: 6 }}>
              {afiliado.risco >= 70 ? "⚠️ Risco elevado — recomenda-se investigação imediata." : afiliado.risco >= 40 ? "📊 Risco moderado — monitorizar com atenção." : "✅ Afiliado em conformidade com as regras."}
            </p>
          </div>
        </div>

        {/* Evolução de ganhos */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>📈 Evolução de Ganhos</h3>
          <p style={{ fontSize: 12, color: C.textMute, marginBottom: 16 }}>Comissões mensais (MZN)</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
            {afiliado.historico.map((d, i) => {
              const max = Math.max(...afiliado.historico.map(x => x.ganho), 1);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: C.textMute }}>{d.ganho > 0 ? `${(d.ganho/1000).toFixed(1)}k` : "—"}</span>
                  <div style={{ width: "100%", height: `${Math.max(4, (d.ganho / max) * 75)}px`, background: i === afiliado.historico.length - 1 ? C.green : C.green + "55", borderRadius: "4px 4px 0 0", transition: "height 0.4s" }} />
                  <span style={{ fontSize: 10, color: C.textMute }}>{d.mes}</span>
                </div>
              );
            })}
          </div>

          {/* Links activos */}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 20, marginBottom: 12 }}>🔗 Links de Afiliado</h3>
          {LINKS_DETALHE.map((l, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < LINKS_DETALHE.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{l.produto}</p>
                <p style={{ fontSize: 11, color: C.textMute }}>{l.cliques} cliques · {l.conversoes} vendas</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{l.ganho.toLocaleString("pt-MZ")} MZN</p>
                <Badge label={l.estado} type={l.estado === "activo" ? "success" : "default"} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de comissões */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>💰 Histórico de Comissões</h3>
          <Btn label="Exportar" icon="download" size="sm" variant="secondary" />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1.5px solid ${C.border}`, background: C.bg }}>
              {["Produto","Pedido","Data","Valor (MZN)","Estado","Ação"].map((c, i) => (
                <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.textMute }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMISSOES_DETALHE.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: C.text }}>{c.produto}</td>
                <td style={{ padding: "10px 12px", color: C.textSub }}>{c.pedido}</td>
                <td style={{ padding: "10px 12px", color: C.textSub }}>{c.data}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: c.estado === "cancelado" ? C.red : C.green }}>
                  {c.estado === "cancelado" ? "−" : "+"}{c.valor.toLocaleString("pt-MZ")} MZN
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: estadoCor[c.estado].bg, color: estadoCor[c.estado].color }}>
                    {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {c.estado === "pendente" && <Btn label="Cancelar comissão" icon="x" size="sm" variant="secondary" />}
                  {c.estado === "cancelado" && <span style={{ fontSize: 11, color: C.textMute }}>—</span>}
                  {(c.estado === "disponivel" || c.estado === "pago") && <Btn label="Ver pedido" icon="eye" size="sm" variant="ghost" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Bónus */}
      <Modal open={modalBonus} onClose={() => setModalBonus(false)} width={400}>
        <div style={{ padding: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="gift" size={20} color={C.green} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>Atribuir Bónus</h3>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}>Adicionar bónus à carteira de <strong>{afiliado.nome}</strong></p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Valor (MZN)</label>
            <input type="number" value={valorBonus} onChange={e => setValorBonus(e.target.value)} placeholder="Ex: 500"
              style={{ width: "100%", padding: "10px 12px", fontSize: 15, fontWeight: 700, border: `2px solid ${C.green}`, borderRadius: 8, fontFamily: "inherit", color: C.text, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ padding: "10px 12px", background: C.greenDim, borderRadius: 8, fontSize: 12, color: C.green, fontWeight: 500, marginBottom: 20 }}>
            ✅ O bónus será creditado imediatamente como "disponível para saque". Ação registada no log.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Cancelar" variant="secondary" onClick={() => setModalBonus(false)} />
            <Btn label="Confirmar bónus" variant="primary"   onClick={() => setModalBonus(false)} disabled={!valorBonus} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── 4. REGRAS E CONFIGURAÇÕES ─────────────────────────────────────────────────
function SubRegras() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Comissões por nível */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>⚙️ Comissões por Nível</h3>
          {[
            { nivel: "bronze", icon: "🥉", cor: "#CD7F32", min: 0, max: 5000, comMin: 5, comMax: 10 },
            { nivel: "prata",  icon: "🥈", cor: "#A8A9AD", min: 5000, max: 20000, comMin: 11, comMax: 20 },
            { nivel: "ouro",   icon: "🥇", cor: "#FFD700", min: 20000, max: null, comMin: 21, comMax: 30 },
          ].map((n, i) => (
            <div key={i} style={{ padding: 14, background: C.bg, borderRadius: 10, marginBottom: 10, border: `1.5px solid ${n.cor}30` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{n.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{NIVEIS[n.nivel].label}</span>
                </div>
                <Btn label="Editar" icon="edit" size="sm" variant="secondary" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "Ganho mín. acesso", val: n.min === 0 ? "—" : `${n.min.toLocaleString("pt-MZ")} MZN` },
                  { label: "Comissão mín.",      val: `${n.comMin}%` },
                  { label: "Comissão máx.",      val: `${n.comMax}%` },
                ].map(({ label, val }, j) => (
                  <div key={j} style={{ background: C.card, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: n.cor }}>{val}</p>
                    <p style={{ fontSize: 10, color: C.textMute, marginTop: 2 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Regras do sistema */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>🛡️ Regras Anti-Fraude</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Toggle label="Bloquear auto-referência"                  active={true} />
            <Toggle label="Detetar múltiplas contas por IP"           active={true} />
            <Toggle label="Alertas de tráfego inválido (bots)"       active={true} />
            <Toggle label="Congelar saldo suspeito automaticamente"   active={true} />
            <Toggle label="Score de risco por transação"              active={true} />
            <Toggle label="Alerta de conversão > 50% (suspeito)"     active={true} />
            <Toggle label="Aprovar manualmente afiliados novos"       active={true} />
            <Toggle label="Auto-pagamento afiliados Bronze"           active={false} />
            <Toggle label="Auto-pagamento afiliados Prata"            active={true} />
            <Toggle label="Auto-pagamento afiliados Ouro"             active={true} />
          </div>

          <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>⏱️ Tempos de Liberação</h3>
            {[
              { label: "Liberação comissão Bronze (dias)", value: "7" },
              { label: "Liberação comissão Prata (dias)",  value: "5" },
              { label: "Liberação comissão Ouro (dias)",   value: "3" },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMute, display: "block", marginBottom: 4 }}>{f.label}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input defaultValue={f.value} style={{ flex: 1, padding: "6px 10px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 7, fontFamily: "inherit", color: C.text, background: C.bg }} />
                  <Btn label="OK" size="sm" variant="ghost" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inteligência estratégica */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Icon name="zap" size={16} color={C.purple} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>💡 Sugestões Automáticas do Sistema</h3>
          <Badge label="Beta" type="purple" />
        </div>
        {[
          { tipo: "oportunidade", msg: "João Matos cresceu 18% este mês. Considere promovê-lo para programa VIP ou oferecer bónus de retenção.", icon: "trending-up", cor: C.green },
          { tipo: "alerta",      msg: "spam_afilX tem taxa de conversão de 100% — impossível em tráfego orgânico. Investigar e banir.", icon: "alert-triangle", cor: C.red },
          { tipo: "sugestão",    msg: "5 afiliados Bronze estão perto do limiar para Prata. Um incentivo pode acelerar o upgrade.", icon: "gift", cor: C.amber },
          { tipo: "sugestão",    msg: "A taxa de afiliados inativos (sem vendas há 30+ dias) é 23%. Considere campanha de reativação.", icon: "activity", cor: C.blue },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.cor + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={s.icon} size={14} color={s.cor} />
            </div>
            <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, flex: 1 }}>{s.msg}</p>
            <Btn label="Agir" size="sm" variant="secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 5. FRAUDE AFILIADOS ───────────────────────────────────────────────────────
function SubFraude({ afiliados, setAfiliados }) {
  const suspeitos = afiliados.filter(a => a.risco >= 50 || a.estado === "suspeito");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Afiliados Suspeitos"      value={suspeitos.length}         icon="alert-triangle" color={C.red} />
        <StatCard label="Comissões em Risco (MZN)" value={suspeitos.reduce((s,a)=>s+a.comissaoPendente,0).toLocaleString("pt-MZ")} icon="dollar" color={C.amber} />
        <StatCard label="Banidos (total)"          value={afiliados.filter(a=>a.estado==="bloqueado").length} icon="ban" color={C.red} />
        <StatCard label="Fraudes detetadas"        value={afiliados.reduce((s,a)=>s+a.fraudes,0)} icon="shield" color={C.blue} />
      </div>

      {suspeitos.length === 0 ? (
        <div style={{ background: C.greenDim, border: `1.5px solid ${C.green}30`, borderRadius: 14, padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.green }}>Nenhum afiliado suspeito no momento</p>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>O sistema está a monitorizar todos os afiliados em tempo real.</p>
        </div>
      ) : (
        <div style={{ background: C.card, border: `1.5px solid ${C.red}30`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", background: C.redDim, borderBottom: `1px solid ${C.red}20` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="alert-triangle" size={16} color={C.red} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.red }}>Afiliados a Investigar</h3>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                {["Afiliado","Taxa Conversão","Vendas","Comissão em Risco","Score Risco","Fraudes","Estado","Ações"].map((c, i) => (
                  <th key={i} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.textMute }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suspeitos.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: C.text }}>{a.nome}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: a.conversao > 90 ? C.red : C.amber }}>{a.conversao}% {a.conversao > 90 ? "🚨" : ""}</td>
                  <td style={{ padding: "12px 14px", color: C.text }}>{a.vendas}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: C.red }}>{a.comissaoPendente.toLocaleString("pt-MZ")} MZN</td>
                  <td style={{ padding: "12px 14px" }}><RiskScore score={a.risco} /></td>
                  <td style={{ padding: "12px 14px" }}><Badge label={a.fraudes > 0 ? `${a.fraudes} ocorrência(s)` : "Sem registo"} type={a.fraudes > 0 ? "danger" : "default"} /></td>
                  <td style={{ padding: "12px 14px" }}><Badge label={a.estado.charAt(0).toUpperCase() + a.estado.slice(1)} type={a.estado === "suspeito" ? "danger" : "warning"} /></td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn label="Banir" icon="ban" size="sm" variant="danger" onClick={() => setAfiliados(prev => prev.map(x => x.id === a.id ? { ...x, estado: "bloqueado", comissaoPendente: 0 } : x))} />
                      <Btn label="Remover ganhos" icon="trash" size="sm" variant="secondary" onClick={() => setAfiliados(prev => prev.map(x => x.id === a.id ? { ...x, comissaoPendente: 0 } : x))} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Log de ações de fraude */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>📋 Log de Ações Anti-Fraude</h3>
        {[
          { acao: "Conta bloqueada por auto-afiliação",              afiliado: "spam_afilX",  data: "17 Abr 02:20", admin: "super_admin", tipo: "danger" },
          { acao: "28 000 MZN de ganhos removidos (fraude)",        afiliado: "spam_afilX",  data: "17 Abr 02:21", admin: "super_admin", tipo: "danger" },
          { acao: "Score de risco atualizado para 98",               afiliado: "spam_afilX",  data: "17 Abr 02:15", admin: "sistema",     tipo: "warning" },
          { acao: "Alerta: conversão 100% detetada",                 afiliado: "spam_afilX",  data: "17 Abr 01:40", admin: "sistema",     tipo: "warning" },
          { acao: "Comissão cancelada (pedido estornado)",           afiliado: "Carlos Nhaca",data: "15 Abr 10:00", admin: "mod_finance", tipo: "default" },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
            <Badge label={l.tipo === "danger" ? "Crítico" : l.tipo === "warning" ? "Alerta" : "Info"} type={l.tipo} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{l.acao}</p>
              <p style={{ fontSize: 11, color: C.textMute }}>Afiliado: {l.afiliado} · Por: {l.admin}</p>
            </div>
            <span style={{ fontSize: 11, color: C.textMute, whiteSpace: "nowrap" }}>{l.data}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const SUBTABS = [
  { id: "visao",    label: "Visão Geral",   icon: "bar-chart" },
  { id: "lista",    label: "Afiliados",     icon: "users" },
  { id: "fraude",   label: "Fraude",        icon: "alert-triangle", badge: true },
  { id: "regras",   label: "Regras & Config", icon: "settings" },
];

export default function PageAfiliados() {
  const [subtab, setSubtab] = useState("visao");
  const [afiliados, setAfiliados] = useState(AFILIADOS_MOCK);
  const [afiliadoDetalhe, setAfiliadoDetalhe] = useState(null);

  const suspeitos = afiliados.filter(a => a.risco >= 50 || a.estado === "suspeito").length;

  const handleSelectAfiliado = (a) => {
    setAfiliadoDetalhe(a);
    setSubtab("detalhe");
  };

  const handleVoltar = () => {
    setAfiliadoDetalhe(null);
    setSubtab("lista");
  };

  const conteudo = {
    visao:   <SubVisaoGeral    afiliados={afiliados} onSelectAfiliado={handleSelectAfiliado} />,
    lista:   <SubListaAfiliados afiliados={afiliados} setAfiliados={setAfiliados} onSelectAfiliado={handleSelectAfiliado} />,
    fraude:  <SubFraude        afiliados={afiliados} setAfiliados={setAfiliados} />,
    regras:  <SubRegras />,
    detalhe: afiliadoDetalhe ? <SubDetalheAfiliado afiliado={afiliadoDetalhe} onVoltar={handleVoltar} setAfiliados={setAfiliados} /> : null,
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
      {/* Header da página */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Gestão de Afiliados</h2>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Controlo total — afiliados, comissões, performance e fraude</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Relatório PDF"   icon="download" variant="secondary" size="sm" />
          <Btn label="Relatório Excel" icon="download" variant="ghost"     size="sm" />
        </div>
      </div>

      {/* Subtabs */}
      {subtab !== "detalhe" && (
        <div style={{ display: "flex", gap: 2, background: "#f1f5f9", padding: 4, borderRadius: 12, marginBottom: 22, width: "fit-content" }}>
          {SUBTABS.map(t => {
            const isActive = subtab === t.id;
            return (
              <button key={t.id} onClick={() => setSubtab(t.id)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "none", background: isActive ? C.card : "transparent", color: isActive ? C.text : C.textSub, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s", boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none", fontFamily: "inherit", position: "relative" }}>
                <Icon name={t.icon} size={14} color={isActive ? C.text : C.textSub} />
                {t.label}
                {t.badge && suspeitos > 0 && (
                  <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: C.red, color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{suspeitos}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Conteúdo */}
      {conteudo[subtab]}
    </div>
  );
}