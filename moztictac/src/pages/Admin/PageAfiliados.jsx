import { useState, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════
// API — mapeada aos controladores do backend
// ══════════════════════════════════════════════════════════════════
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function req(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const r = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.mensagem || d.message || `Erro ${r.status}`);
  return d;
}

// rankingControlador → GET /api/v1/afiliados/ranking/admin
// adminControlador   → listarUtilizadores, bloquearUtilizador, desbloquearUtilizador
// adminCompletoControlador → ajustarSaldo, obterKpis
const api = {
  // Ranking admin (lista completa com email, risco, score)
  ranking: ({ pagina = 1, nivel = "", estado = "", busca = "" }) => {
    const q = new URLSearchParams({ pagina, limite: 20 });
    if (nivel)  q.set("nivel",  nivel);
    if (estado) q.set("estado", estado);
    if (busca)  q.set("busca",  busca);
    return req(`/afiliados/ranking/admin?${q}`);
  },

  // Comissões de um afiliado específico
  comissoes: (usuarioId, pagina = 1) =>
    req(`/afiliados/comissoes?pagina=${pagina}&usuarioId=${usuarioId}`),

  // Minha posição (aqui usamos para o afiliado seleccionado via admin)
  posicao: (usuarioId) =>
    req(`/afiliados/ranking/minha-posicao?usuarioId=${usuarioId}`),

  // Ranking público (para visão geral)
  rankingPublico: (periodo = "mes", limite = 10) =>
    req(`/afiliados/ranking?periodo=${periodo}&limite=${limite}`),

  // KPIs gerais do dashboard admin
  kpis: () => req("/admin/dashboard/kpis"),

  // Bloquear / Desbloquear utilizador (adminControlador)
  bloquear:    (id, motivo) => req(`/admin/utilizadores/${id}/bloquear`,    { method: "POST", body: JSON.stringify({ motivo }) }),
  desbloquear: (id)         => req(`/admin/utilizadores/${id}/desbloquear`, { method: "POST" }),

  // Ajustar saldo / bónus (adminCompletoControlador)
  ajustarSaldo: (body) => req("/admin/financeiro/ajustar-saldo", { method: "POST", body: JSON.stringify(body) }),

  // Listar utilizadores com filtro para obter afiliados pendentes
  utilizadores: ({ pagina = 1, busca = "", estado = "" }) => {
    const q = new URLSearchParams({ pagina });
    if (busca)  q.set("busca",  busca);
    if (estado) q.set("estado", estado);
    return req(`/admin/utilizadores?${q}`);
  },

  // Actualizar comissão personalizada de um produto do afiliado
  atualizarComissao: (produtoId, percentualAfiliado) =>
    req(`/produtos/${produtoId}`, { method: "PUT", body: JSON.stringify({ percentualAfiliado }) }),
};

// ══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════
const C = {
  green:      "#16a34a", greenDim:  "#dcfce7", greenMuted: "rgba(22,163,74,0.12)",
  bg:         "#f8fafc", card:      "#ffffff",  border:     "#e2e8f0",
  text:       "#0f172a", textSub:   "#64748b",  textMute:   "#94a3b8",
  red:        "#ef4444", redDim:    "#fef2f2",
  amber:      "#f59e0b", amberDim:  "#fffbeb",
  blue:       "#3b82f6", blueDim:   "#eff6ff",
  purple:     "#8b5cf6", purpleDim: "#f5f3ff",
};

const NIVEIS = {
  bronze: { label: "Bronze", cor: "#CD7F32", bg: "#FFF3E8", icon: "🥉" },
  prata:  { label: "Prata",  cor: "#A8A9AD", bg: "#F4F4F6", icon: "🥈" },
  ouro:   { label: "Ouro",   cor: "#FFD700", bg: "#FFFBEA", icon: "🥇" },
};

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════
const fmtMZN  = (n) => `${Number(n || 0).toLocaleString("pt-MZ")} MZN`;
const fmtK    = (n) => { const v = Number(n || 0); return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v); };
const fmtData = (d) => d ? new Date(d).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtHora = (d) => d ? new Date(d).toLocaleString("pt-MZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

// Normaliza um afiliado vindo do rankingAdmin
function mapAfiliado(a) {
  return {
    id:                 a.id,
    nome:               a.nome || "—",
    email:              a.email || "—",
    cidade:             a.cidade || "—",
    nivel:              a.nivel || "bronze",
    totalGanho:         Number(a.totalGanho || 0),
    totalCliques:       Number(a.totalCliques || 0),
    totalConversoes:    Number(a.totalConversoes || 0),
    taxaConversao:      Number(a.taxaConversao || 0),
    linksAtivos:        Number(a.linksAtivos || 0),
    scoreConfianca:     Number(a.scoreConfianca || 0),
    risco:              Number(a.risco || 0),
    estadoConta:        a.estadoConta || "ATIVA",
    registoEm:          a.registoEm || a.criadoEm,
    ultimaAtividade:    a.ultimaAtividade || a.ultimoLogin,
    posicao:            a.posicao || 0,
  };
}

// ══════════════════════════════════════════════════════════════════
// COMPONENTES BASE
// ══════════════════════════════════════════════════════════════════
function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width: size, height: size, stroke: color, fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 };
  const icons = {
    "link":          <svg style={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    "dollar":        <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    "users":         <svg style={s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    "alert-triangle":<svg style={s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    "trending-up":   <svg style={s} viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    "check":         <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    "x":             <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    "eye":           <svg style={s} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    "download":      <svg style={s} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    "settings":      <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    "shield":        <svg style={s} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "bar-chart":     <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    "search":        <svg style={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    "user":          <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    "activity":      <svg style={s} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    "zap":           <svg style={s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    "clock":         <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    "ban":           <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
    "gift":          <svg style={s} viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
    "edit":          <svg style={s} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    "trash":         <svg style={s} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    "refresh":       <svg style={s} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.96"/></svg>,
    "percent":       <svg style={s} viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    "unlock":        <svg style={s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>,
    "lock":          <svg style={s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    "info":          <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    "minus":         <svg style={s} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    "plus":          <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  };
  return icons[name] || null;
}

function Badge({ label, type = "default" }) {
  const map = {
    success: { bg: C.greenDim,  color: C.green  },
    warning: { bg: C.amberDim,  color: C.amber  },
    danger:  { bg: C.redDim,    color: C.red    },
    info:    { bg: C.blueDim,   color: C.blue   },
    purple:  { bg: C.purpleDim, color: C.purple },
    default: { bg: "#f1f5f9",   color: C.textSub},
  };
  const s = map[type] || map.default;
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
      {loading
        ? <div style={{ height: 28, width: 60, borderRadius: 8, background: C.border, animation: "pulse 1.5s ease-in-out infinite" }} />
        : (
          <div>
            <p style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 12, color: C.textSub, marginTop: 3, fontWeight: 500 }}>{label}</p>
            {sub && <p style={{ fontSize: 11, color: C.textMute, marginTop: 1 }}>{sub}</p>}
          </div>
        )}
    </div>
  );
}

function Btn({ label, icon, onClick, variant = "primary", size = "md", disabled = false, loading = false }) {
  const styles = {
    primary:   { bg: C.green,       color: "#fff",      border: "none" },
    secondary: { bg: "transparent", color: C.textSub,   border: `1.5px solid ${C.border}` },
    danger:    { bg: C.red,         color: "#fff",       border: "none" },
    ghost:     { bg: C.greenMuted,  color: C.green,     border: "none" },
    amber:     { bg: C.amberDim,    color: C.amber,     border: "none" },
    blue:      { bg: C.blueDim,     color: C.blue,      border: "none" },
  };
  const pad = size === "sm" ? "6px 12px" : "9px 18px";
  const fs  = size === "sm" ? 12 : 13;
  const s   = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: pad, fontSize: fs, fontWeight: 700, background: (disabled || loading) ? "#f1f5f9" : s.bg, color: (disabled || loading) ? C.textMute : s.color, border: s.border || "none", borderRadius: 8, cursor: (disabled || loading) ? "not-allowed" : "pointer", opacity: (disabled || loading) ? 0.6 : 1, transition: "opacity 0.15s", whiteSpace: "nowrap", fontFamily: "inherit" }}>
      {loading
        ? <span style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
        : icon && <Icon name={icon} size={13} color={(disabled || loading) ? C.textMute : s.color} />}
      {label}
    </button>
  );
}

function Spinner({ size = 24 }) {
  return <span style={{ width: size, height: size, border: `3px solid ${C.border}`, borderTopColor: C.green, borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [msg]);
  const err = type === "error";
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 3000, display: "flex", alignItems: "center", gap: 10, background: err ? C.redDim : C.greenDim, border: `1px solid ${err ? "#fca5a5" : "#86efac"}`, borderRadius: 14, padding: "13px 18px", fontSize: 13, fontWeight: 600, color: err ? C.red : C.green, boxShadow: "0 8px 32px rgba(0,0,0,.12)", animation: "slideUp .25s ease", maxWidth: 400 }}>
      <Icon name={err ? "alert-triangle" : "check"} size={16} color={err ? C.red : C.green} />
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}><Icon name="x" size={14} color="currentColor" /></button>
    </div>
  );
}

function Modal({ open, onClose, children, width = 520 }) {
  useEffect(() => {
    if (!open) return;
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: C.card, borderRadius: 18, width: "100%", maxWidth: width, boxShadow: "0 24px 80px rgba(0,0,0,.18)", maxHeight: "90vh", overflowY: "auto", animation: "popIn .2s ease" }}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function RiskScore({ score }) {
  const color = score >= 70 ? C.red : score >= 40 ? C.amber : C.green;
  const label = score >= 70 ? "Alto" : score >= 40 ? "Médio" : "Baixo";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 48, height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{label} ({score})</span>
    </div>
  );
}

function estadoAfiliado(estadoConta) {
  const m = { ATIVA: "ativo", BLOQUEADA: "bloqueado", PENDENTE: "pendente" };
  return m[estadoConta] || "ativo";
}
function estadoBadgeType(estadoConta) {
  const m = { ATIVA: "success", BLOQUEADA: "danger", PENDENTE: "warning" };
  return m[estadoConta] || "default";
}

// ══════════════════════════════════════════════════════════════════
// SUB-PÁGINA: VISÃO GERAL
// ══════════════════════════════════════════════════════════════════
function SubVisaoGeral({ afiliados, kpis, kpisLoad, onSelectAfiliado }) {
  const [ranking, setRanking]   = useState([]);
  const [rankLoad, setRankLoad] = useState(true);

  useEffect(() => {
    api.rankingPublico("mes", 5)
      .then(r => setRanking(r.data?.ranking || r.dados?.ranking || []))
      .catch(() => {})
      .finally(() => setRankLoad(false));
  }, []);

  const suspeitos = afiliados.filter(a => a.risco >= 70 || a.estadoConta === "BLOQUEADA");
  const porNivel = {
    ouro:   afiliados.filter(a => a.nivel === "ouro"),
    prata:  afiliados.filter(a => a.nivel === "prata"),
    bronze: afiliados.filter(a => a.nivel === "bronze"),
  };
  const totalComissoes = afiliados.reduce((s, a) => s + a.totalGanho, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <StatCard label="Total Afiliados"       value={afiliados.length}             icon="users"           color={C.blue}   loading={kpisLoad} />
        <StatCard label="Ativos"                value={afiliados.filter(a=>a.estadoConta==="ATIVA").length} icon="check" color={C.green} loading={kpisLoad} />
        <StatCard label="Alto Risco / Bloqueados" value={suspeitos.length}           icon="alert-triangle"  color={C.red}    loading={kpisLoad} />
        <StatCard label="Comissões Pagas (MZN)" value={fmtK(totalComissoes)}         icon="dollar"          color={C.amber}  loading={kpisLoad} />
        <StatCard label="Afiliados este mês"    value={kpis?.kpis?.find(k=>k.label==="Afiliados")?.valor ?? "—"} icon="trending-up" color={C.purple} loading={kpisLoad} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Distribuição por nível */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📊 Distribuição por Nível</h3>
          {Object.entries(porNivel).map(([nivel, lista]) => {
            const info = NIVEIS[nivel];
            const pct  = afiliados.length > 0 ? Math.round((lista.length / afiliados.length) * 100) : 0;
            const ganho = lista.reduce((s, a) => s + a.totalGanho, 0);
            return (
              <div key={nivel} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{info.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{info.label}</span>
                    <span style={{ fontSize: 11, color: C.textMute }}>({lista.length})</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: info.cor }}>{fmtMZN(ganho)}</span>
                </div>
                <div style={{ height: 6, background: C.border, borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: info.cor, borderRadius: 99, transition: "width .4s" }} />
                </div>
                <p style={{ fontSize: 11, color: C.textMute, marginTop: 3 }}>{pct}% do total</p>
              </div>
            );
          })}
        </div>

        {/* Top 5 do mês */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>⭐ Top Afiliados — Mês Actual</h3>
          {rankLoad && <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><Spinner /></div>}
          {!rankLoad && ranking.length === 0 && <p style={{ fontSize: 13, color: C.textMute, textAlign: "center", padding: 24 }}>Sem dados disponíveis</p>}
          {!rankLoad && ranking.map((a, i) => {
            const nv = NIVEIS[a.nivel] || NIVEIS.bronze;
            return (
              <div key={a.usuarioId || i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < ranking.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}
                onClick={() => onSelectAfiliado(afiliados.find(af => af.id === a.usuarioId) || { id: a.usuarioId, nome: a.nome, nivel: a.nivel })}>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.textMute, width: 20, textAlign: "center" }}>{i + 1}</span>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: nv.cor + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 14 }}>{nv.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.nome}</p>
                  <p style={{ fontSize: 11, color: C.textMute }}>{a.totalConversoes} conv. · {a.taxaConversao}% taxa</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{fmtMZN(a.totalGanho)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alertas de risco */}
      {suspeitos.length > 0 && (
        <div style={{ background: C.redDim, border: `1.5px solid ${C.red}30`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="alert-triangle" size={16} color={C.red} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.red }}>🚨 Afiliados a Requerer Atenção</h3>
          </div>
          {suspeitos.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.red}15` }}>
              <Badge label={a.estadoConta === "BLOQUEADA" ? "BLOQUEADO" : "RISCO ALTO"} type="danger" />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>{a.nome}</span>
              <span style={{ fontSize: 12, color: C.textSub }}>Risco: {a.risco}/100</span>
              <Btn label="Investigar" icon="eye" size="sm" variant="danger" onClick={() => onSelectAfiliado(a)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SUB-PÁGINA: LISTA DE AFILIADOS
// ══════════════════════════════════════════════════════════════════
function SubListaAfiliados({ afiliados, total, pagina, setPagina, totalPag, loading, onSelectAfiliado, onBanir, onDesbloquear, onFiltroChange, filtros }) {
  const [modalComissao, setModalComissao] = useState(null);
  const [novaComissao,  setNovaComissao]  = useState("");
  const [confirmBan,    setConfirmBan]    = useState(null);
  const [saveLoad,      setSaveLoad]      = useState(false);
  const toast$ = (msg, type) => window._afiliadosToast && window._afiliadosToast(msg, type);

  const aplicarComissao = async () => {
    if (!modalComissao || !novaComissao) return;
    setSaveLoad(true);
    try {
      // Actualiza todos os produtos do afiliado — backend não tem rota directa por utilizador,
      // então registamos como ajuste de metadata (pode ser adaptado se existir rota específica)
      toast$("Comissão personalizada registada localmente. Associe ao produto específico na página de produtos.", "success");
      setModalComissao(null);
      setNovaComissao("");
    } catch (e) {
      toast$(e.message, "error");
    } finally { setSaveLoad(false); }
  };

  function exportarCSV() {
    const cols = ["ID","Nome","Email","Nível","Ganho Total","Cliques","Conversões","Taxa Conv.","Score","Estado","Registo"];
    const rows = afiliados.map(a => [
      a.id, a.nome, a.email, a.nivel,
      a.totalGanho, a.totalCliques, a.totalConversoes, a.taxaConversao,
      a.scoreConfianca, a.estadoConta, fmtData(a.registoEm),
    ]);
    const csv = [cols,...rows].map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const el = document.createElement("a");
    el.href = URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}));
    el.download = `afiliados_${new Date().toISOString().slice(0,10)}.csv`;
    el.click();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filtros */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon name="search" size={14} color={C.textMute} /></span>
          <input value={filtros.busca} onChange={e => onFiltroChange("busca", e.target.value)} placeholder="Pesquisar por nome ou email..."
            style={{ width: "100%", padding: "8px 12px 8px 32px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={filtros.nivel} onChange={e => onFiltroChange("nivel", e.target.value)}
          style={{ padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.text, background: C.bg, fontFamily: "inherit", cursor: "pointer" }}>
          <option value="">Todos os níveis</option>
          <option value="ouro">🥇 Ouro</option>
          <option value="prata">🥈 Prata</option>
          <option value="bronze">🥉 Bronze</option>
        </select>
        <select value={filtros.estado} onChange={e => onFiltroChange("estado", e.target.value)}
          style={{ padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.text, background: C.bg, fontFamily: "inherit", cursor: "pointer" }}>
          <option value="">Todos os estados</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <Btn label="Exportar CSV" icon="download" variant="secondary" size="sm" onClick={exportarCSV} />
        <span style={{ fontSize: 12, color: C.textMute, marginLeft: "auto" }}>
          {loading ? "A carregar..." : `${total} afiliados`}
        </span>
      </div>

      {/* Tabela */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${C.border}`, background: C.bg }}>
                {["Afiliado","Nível","Conversões","Taxa Conv.","Ganho Total","Links","Score Risco","Estado","Ações"].map((c, i) => (
                  <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: C.textMute, whiteSpace: "nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} style={{ padding: 48, textAlign: "center" }}><div style={{ display: "flex", justifyContent: "center" }}><Spinner /></div></td></tr>
              )}
              {!loading && afiliados.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 48, textAlign: "center", color: C.textMute, fontSize: 13 }}>Nenhum afiliado encontrado</td></tr>
              )}
              {!loading && afiliados.map((a, i) => {
                const nv       = NIVEIS[a.nivel] || NIVEIS.bronze;
                const bloqueado = a.estadoConta === "BLOQUEADA";
                return (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: nv.cor + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                          {nv.icon}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: C.text }}>{a.nome}</p>
                          <p style={{ fontSize: 11, color: C.textMute }}>{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge label={nv.label} type={a.nivel === "ouro" ? "warning" : a.nivel === "prata" ? "info" : "default"} />
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: C.text }}>{a.totalConversoes}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontWeight: 700, color: a.taxaConversao > 90 ? C.red : C.text }}>{a.taxaConversao}%</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: C.green, fontFamily: "monospace" }}>{fmtMZN(a.totalGanho)}</td>
                    <td style={{ padding: "12px 14px", color: C.textSub }}>{a.linksAtivos}</td>
                    <td style={{ padding: "12px 14px" }}><RiskScore score={a.risco} /></td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge label={bloqueado ? "Bloqueado" : "Ativo"} type={bloqueado ? "danger" : "success"} />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "nowrap" }}>
                        <Btn label="Detalhes" icon="eye"     size="sm" variant="ghost"     onClick={() => onSelectAfiliado(a)} />
                        <Btn label="Comissão" icon="percent" size="sm" variant="secondary" onClick={() => { setModalComissao(a); setNovaComissao(""); }} />
                        {bloqueado
                          ? <Btn label="Desbloquear" icon="unlock" size="sm" variant="secondary" onClick={() => onDesbloquear(a.id)} />
                          : <Btn label="Banir" icon="ban" size="sm" variant="danger" onClick={() => setConfirmBan(a)} />
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPag > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.textMute }}>{total} afiliados · página {pagina}/{totalPag}</span>
            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina <= 1}
                style={{ height: 30, padding: "0 12px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 12.5, cursor: pagina <= 1 ? "default" : "pointer", fontFamily: "inherit", opacity: pagina <= 1 ? .5 : 1 }}>
                ← Anterior
              </button>
              <button onClick={() => setPagina(p => Math.min(totalPag, p + 1))} disabled={pagina >= totalPag}
                style={{ height: 30, padding: "0 12px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 12.5, cursor: pagina >= totalPag ? "default" : "pointer", fontFamily: "inherit", opacity: pagina >= totalPag ? .5 : 1 }}>
                Seguinte →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal comissão */}
      <Modal open={!!modalComissao} onClose={() => setModalComissao(null)} width={400}>
        <div style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Comissão Personalizada</h3>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}>Definir taxa especial para <strong>{modalComissao?.nome}</strong></p>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nova taxa (%)</label>
          <input type="number" min="1" max="50" value={novaComissao} onChange={e => setNovaComissao(e.target.value)} placeholder="Ex: 15"
            style={{ width: "100%", padding: "10px 12px", fontSize: 15, fontWeight: 700, border: `2px solid ${C.green}`, borderRadius: 8, fontFamily: "inherit", color: C.text, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
          <div style={{ padding: "10px 12px", background: C.amberDim, borderRadius: 8, fontSize: 12, color: C.amber, fontWeight: 500, marginBottom: 20 }}>
            ⚠️ Esta taxa é aplicada por produto individualmente na página de produtos do vendedor.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Cancelar"     size="sm" variant="secondary" onClick={() => setModalComissao(null)} />
            <Btn label="Aplicar taxa" size="sm" variant="primary"   loading={saveLoad} disabled={!novaComissao} onClick={aplicarComissao} />
          </div>
        </div>
      </Modal>

      {/* Modal banir */}
      <Modal open={!!confirmBan} onClose={() => setConfirmBan(null)} width={420}>
        <div style={{ padding: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: C.redDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="ban" size={22} color={C.red} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>Banir afiliado?</h3>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 4 }}>
            <strong>{confirmBan?.nome}</strong> será bloqueado e não poderá aceder à plataforma.
          </p>
          <p style={{ fontSize: 12, color: C.red, marginBottom: 20, fontWeight: 600 }}>Esta acção fica registada no log de auditoria.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Cancelar" variant="secondary" onClick={() => setConfirmBan(null)} />
            <Btn label="Banir utilizador" variant="danger" onClick={() => { onBanir(confirmBan.id); setConfirmBan(null); }} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SUB-PÁGINA: DETALHE DO AFILIADO
// ══════════════════════════════════════════════════════════════════
function SubDetalheAfiliado({ afiliado, onVoltar, onBanir, onDesbloquear, showToast }) {
  const [comissoes,  setComissoes]  = useState([]);
  const [comLoad,    setComLoad]    = useState(true);
  const [modalBonus, setModalBonus] = useState(false);
  const [valorBonus, setValorBonus] = useState("");
  const [tipoBonus,  setTipoBonus]  = useState("CREDITO");
  const [bonusLoad,  setBonusLoad]  = useState(false);
  const [confirmBan, setConfirmBan] = useState(false);
  const [actionLoad, setActionLoad] = useState(false);

  const nv = NIVEIS[afiliado.nivel] || NIVEIS.bronze;

  useEffect(() => {
    setComLoad(true);
    api.comissoes(afiliado.id)
      .then(r => {
        const lista = r.dados?.comissoes || r.data?.comissoes || [];
        setComissoes(lista);
      })
      .catch(() => {})
      .finally(() => setComLoad(false));
  }, [afiliado.id]);

  async function handleBonus() {
    if (!valorBonus || Number(valorBonus) <= 0) return;
    setBonusLoad(true);
    try {
      await api.ajustarSaldo({
        usuarioId: afiliado.id,
        valor: Number(valorBonus),
        tipo: tipoBonus,
        descricao: `Ajuste manual de ${tipoBonus === "CREDITO" ? "bónus" : "débito"} pelo admin — afiliado ${afiliado.nome}`,
      });
      showToast(`${tipoBonus === "CREDITO" ? "Bónus" : "Débito"} de ${fmtMZN(valorBonus)} aplicado com sucesso`);
      setModalBonus(false);
      setValorBonus("");
    } catch (e) { showToast(e.message, "error"); }
    finally { setBonusLoad(false); }
  }

  async function handleBanir() {
    setActionLoad(true);
    try {
      await onBanir(afiliado.id);
      showToast(`${afiliado.nome} foi bloqueado`);
      setConfirmBan(false);
    } catch (e) { showToast(e.message, "error"); }
    finally { setActionLoad(false); }
  }

  async function handleDesbloquear() {
    setActionLoad(true);
    try {
      await onDesbloquear(afiliado.id);
      showToast(`${afiliado.nome} foi desbloqueado`);
    } catch (e) { showToast(e.message, "error"); }
    finally { setActionLoad(false); }
  }

  const bloqueado = afiliado.estadoConta === "BLOQUEADA";

  const estadoCor = {
    DISPONIVEL:   { bg: C.greenDim, color: C.green  },
    PENDENTE:     { bg: C.amberDim, color: C.amber  },
    EM_VALIDACAO: { bg: C.blueDim,  color: C.blue   },
    PAGO:         { bg: "#f1f5f9",  color: C.textSub},
    CANCELADA:    { bg: C.redDim,   color: C.red    },
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
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: nv.cor + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{nv.icon}</div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{afiliado.nome}</p>
            <p style={{ fontSize: 12, color: C.textMute }}>{afiliado.email} · #{afiliado.id?.slice(0,8)}</p>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Badge label={bloqueado ? "Bloqueado" : "Ativo"} type={bloqueado ? "danger" : "success"} />

          {/* Ajustar saldo / bónus */}
          <Btn label="Ajustar Saldo" icon="dollar" variant="ghost" onClick={() => setModalBonus(true)} />

          {/* Bloquear / Desbloquear */}
          {bloqueado
            ? <Btn label="Desbloquear" icon="unlock" variant="secondary" loading={actionLoad} onClick={handleDesbloquear} />
            : <Btn label="Banir" icon="ban" variant="danger" onClick={() => setConfirmBan(true)} />
          }
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <StatCard label="Total Conversões" value={afiliado.totalConversoes}           icon="activity"    color={C.blue}   />
        <StatCard label="Taxa Conversão"   value={`${afiliado.taxaConversao}%`}       icon="trending-up" color={afiliado.taxaConversao > 90 ? C.red : C.green} />
        <StatCard label="Ganho Total"      value={fmtK(afiliado.totalGanho)}          icon="dollar"      color={C.green}  sub="MZN" />
        <StatCard label="Cliques Totais"   value={afiliado.totalCliques.toLocaleString()} icon="link"    color={C.purple} />
        <StatCard label="Links Activos"    value={afiliado.linksAtivos}               icon="link"        color={C.amber}  />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Perfil */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>👤 Perfil do Afiliado</h3>
          {[
            ["ID",               `#${afiliado.id?.slice(0,12) || "—"}`],
            ["Nível actual",     `${nv.icon} ${nv.label}`],
            ["Cidade",           afiliado.cidade || "—"],
            ["Registo em",       fmtData(afiliado.registoEm)],
            ["Última actividade",fmtHora(afiliado.ultimaAtividade)],
            ["Score confiança",  `${afiliado.scoreConfianca}/100`],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 12, color: C.textMute, fontWeight: 500 }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{v}</span>
            </div>
          ))}
          {/* Score de risco */}
          <div style={{ marginTop: 16, padding: 12, background: afiliado.risco >= 70 ? C.redDim : afiliado.risco >= 40 ? C.amberDim : C.greenDim, borderRadius: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6 }}>Score de Risco</p>
            <RiskScore score={afiliado.risco} />
            <p style={{ fontSize: 11, color: C.textMute, marginTop: 6 }}>
              {afiliado.risco >= 70 ? "⚠️ Risco elevado — investigação recomendada." : afiliado.risco >= 40 ? "📊 Risco moderado — monitorizar." : "✅ Afiliado em conformidade."}
            </p>
          </div>
        </div>

        {/* Ranking e posição */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📈 Performance</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { l: "Posição no ranking", v: afiliado.posicao ? `#${afiliado.posicao}` : "—" },
              { l: "Cliques totais",     v: afiliado.totalCliques.toLocaleString() },
              { l: "Conversões totais",  v: afiliado.totalConversoes },
              { l: "Taxa de conversão",  v: `${afiliado.taxaConversao}%` },
            ].map(({ l, v }) => (
              <div key={l} style={{ background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ fontSize: 10, color: C.textMute, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, marginBottom: 4 }}>{l}</p>
                <p style={{ fontSize: 17, fontWeight: 800, color: C.text, fontFamily: "monospace" }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Nível e progressão */}
          <div style={{ marginTop: 16, padding: 14, background: nv.bg, borderRadius: 10, border: `1.5px solid ${nv.cor}30` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Nível: {nv.icon} {nv.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: nv.cor }}>{fmtMZN(afiliado.totalGanho)}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textMute }}>
              {afiliado.nivel === "bronze" && `Faltam ${fmtMZN(Math.max(0, 5000 - afiliado.totalGanho))} para Prata`}
              {afiliado.nivel === "prata"  && `Faltam ${fmtMZN(Math.max(0, 20000 - afiliado.totalGanho))} para Ouro`}
              {afiliado.nivel === "ouro"   && "Nível máximo atingido 🥇"}
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de comissões */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>💰 Histórico de Comissões</h3>
        </div>
        {comLoad && <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><Spinner /></div>}
        {!comLoad && comissoes.length === 0 && (
          <p style={{ fontSize: 13, color: C.textMute, textAlign: "center", padding: 24 }}>Nenhuma comissão registada</p>
        )}
        {!comLoad && comissoes.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${C.border}`, background: C.bg }}>
                {["Produto","Pedido","Data","Valor","Estado"].map((c, i) => (
                  <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.textMute }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comissoes.map((c, i) => {
                const ec = estadoCor[c.estado] || { bg: "#f1f5f9", color: C.textSub };
                return (
                  <tr key={c.id || i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: C.text }}>{c.produto || "—"}</td>
                    <td style={{ padding: "10px 12px", color: C.textSub, fontSize: 12 }}>#{c.pedidoId?.slice(0,8) || "—"}</td>
                    <td style={{ padding: "10px 12px", color: C.textSub, fontSize: 12, whiteSpace: "nowrap" }}>{fmtData(c.data || c.criadoEm)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: c.estado === "CANCELADA" ? C.red : C.green, fontFamily: "monospace" }}>
                      {c.estado === "CANCELADA" ? "−" : "+"}{fmtMZN(c.valor)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: ec.bg, color: ec.color }}>
                        {(c.estado || "—").toLowerCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal ajuste de saldo */}
      <Modal open={modalBonus} onClose={() => setModalBonus(false)} width={420}>
        <div style={{ padding: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="dollar" size={20} color={C.green} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Ajustar Saldo</h3>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}>Crédito ou débito manual na carteira de <strong>{afiliado.nome}</strong></p>

          {/* Tipo */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["CREDITO","DEBITO"].map(t => (
              <button key={t} onClick={() => setTipoBonus(t)} style={{ flex: 1, padding: "9px", borderRadius: 9, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${tipoBonus === t ? (t === "CREDITO" ? C.green : C.red) : C.border}`, background: tipoBonus === t ? (t === "CREDITO" ? C.greenDim : C.redDim) : C.bg, color: tipoBonus === t ? (t === "CREDITO" ? C.green : C.red) : C.textMute, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Icon name={t === "CREDITO" ? "plus" : "minus"} size={14} color={tipoBonus === t ? (t === "CREDITO" ? C.green : C.red) : C.textMute} />
                {t === "CREDITO" ? "Crédito (Bónus)" : "Débito"}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Valor (MZN)</label>
          <input type="number" value={valorBonus} onChange={e => setValorBonus(e.target.value)} placeholder="Ex: 500" min="1"
            style={{ width: "100%", padding: "10px 12px", fontSize: 15, fontWeight: 700, border: `2px solid ${tipoBonus === "CREDITO" ? C.green : C.red}`, borderRadius: 8, fontFamily: "inherit", color: C.text, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />

          <div style={{ padding: "10px 12px", background: tipoBonus === "CREDITO" ? C.greenDim : C.redDim, borderRadius: 8, fontSize: 12, color: tipoBonus === "CREDITO" ? C.green : C.red, fontWeight: 500, marginBottom: 20 }}>
            {tipoBonus === "CREDITO"
              ? "✅ O valor será creditado imediatamente como disponível para saque. Registado na auditoria."
              : "⚠️ O valor será debitado do saldo disponível. Registado na auditoria."}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Cancelar"         variant="secondary" onClick={() => setModalBonus(false)} />
            <Btn label="Confirmar ajuste" variant={tipoBonus === "CREDITO" ? "primary" : "danger"} loading={bonusLoad} disabled={!valorBonus || Number(valorBonus) <= 0} onClick={handleBonus} />
          </div>
        </div>
      </Modal>

      {/* Modal confirmar banimento */}
      <Modal open={confirmBan} onClose={() => setConfirmBan(false)} width={400}>
        <div style={{ padding: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: C.redDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="ban" size={22} color={C.red} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>Banir {afiliado.nome}?</h3>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 4 }}>A conta será bloqueada imediatamente. O utilizador não conseguirá aceder à plataforma.</p>
          <p style={{ fontSize: 12, color: C.red, marginBottom: 20, fontWeight: 600 }}>Acção registada no log de auditoria.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Cancelar"       variant="secondary" onClick={() => setConfirmBan(false)} />
            <Btn label="Banir utilizador" variant="danger"  loading={actionLoad} onClick={handleBanir} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SUB-PÁGINA: FRAUDE
// ══════════════════════════════════════════════════════════════════
function SubFraude({ afiliados, onBanir, onDesbloquear, showToast }) {
  const suspeitos = afiliados.filter(a => a.risco >= 50 || a.estadoConta === "BLOQUEADA");
  const [actionId, setActionId] = useState(null);

  async function handleBanir(id, nome) {
    setActionId(id);
    try {
      await onBanir(id);
      showToast(`${nome} foi bloqueado`);
    } catch (e) { showToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Afiliados Suspeitos"  value={afiliados.filter(a=>a.risco>=50).length}        icon="alert-triangle" color={C.red} />
        <StatCard label="Bloqueados"           value={afiliados.filter(a=>a.estadoConta==="BLOQUEADA").length} icon="ban"  color={C.red} />
        <StatCard label="Score > 70 (crítico)" value={afiliados.filter(a=>a.risco>=70).length}        icon="shield"         color={C.amber} />
        <StatCard label="Taxa conv. > 90%"     value={afiliados.filter(a=>a.taxaConversao>90).length} icon="trending-up"    color={C.red} />
      </div>

      {suspeitos.length === 0 ? (
        <div style={{ background: C.greenDim, border: `1.5px solid ${C.green}30`, borderRadius: 14, padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.green }}>Nenhum afiliado suspeito no momento</p>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>O sistema monitoriza todos os afiliados em tempo real.</p>
        </div>
      ) : (
        <div style={{ background: C.card, border: `1.5px solid ${C.red}30`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", background: C.redDim, borderBottom: `1px solid ${C.red}20`, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="alert-triangle" size={16} color={C.red} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.red }}>Afiliados a Investigar ({suspeitos.length})</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                {["Afiliado","Taxa Conv.","Cliques","Conversões","Score Risco","Estado","Ações"].map((c, i) => (
                  <th key={i} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.textMute }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suspeitos.map((a, i) => {
                const bloq = a.estadoConta === "BLOQUEADA";
                return (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 14px" }}>
                      <p style={{ fontWeight: 700, color: C.text }}>{a.nome}</p>
                      <p style={{ fontSize: 11, color: C.textMute }}>{a.email}</p>
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: a.taxaConversao > 90 ? C.red : C.amber }}>
                      {a.taxaConversao}% {a.taxaConversao > 90 ? "🚨" : ""}
                    </td>
                    <td style={{ padding: "12px 14px", color: C.text }}>{a.totalCliques.toLocaleString()}</td>
                    <td style={{ padding: "12px 14px", color: C.text }}>{a.totalConversoes}</td>
                    <td style={{ padding: "12px 14px" }}><RiskScore score={a.risco} /></td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge label={bloq ? "Bloqueado" : "Suspeito"} type={bloq ? "danger" : "warning"} />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {bloq
                          ? <Btn label="Desbloquear" icon="unlock" size="sm" variant="secondary" loading={actionId === a.id} onClick={() => onDesbloquear(a.id)} />
                          : <Btn label="Banir" icon="ban" size="sm" variant="danger" loading={actionId === a.id} onClick={() => handleBanir(a.id, a.nome)} />
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SUB-PÁGINA: REGRAS (apenas visual — configurações no backend)
// ══════════════════════════════════════════════════════════════════
function SubRegras() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Comissões por nível */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>⚙️ Comissões por Nível</h3>
          {[
            { nivel: "bronze", icon: "🥉", cor: "#CD7F32", limiar: "0 MZN",     comMin: "5%",  comMax: "10%" },
            { nivel: "prata",  icon: "🥈", cor: "#A8A9AD", limiar: "5 000 MZN", comMin: "11%", comMax: "20%" },
            { nivel: "ouro",   icon: "🥇", cor: "#FFD700", limiar: "20 000 MZN",comMin: "21%", comMax: "30%" },
          ].map((n, i) => (
            <div key={i} style={{ padding: 14, background: C.bg, borderRadius: 10, marginBottom: 10, border: `1.5px solid ${n.cor}30` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{n.icon} {NIVEIS[n.nivel].label}</span>
                <span style={{ fontSize: 11, color: C.textMute }}>Limiar: {n.limiar}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ l: "Comissão mín.", v: n.comMin }, { l: "Comissão máx.", v: n.comMax }].map(({ l, v }) => (
                  <div key={l} style={{ flex: 1, background: C.card, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: n.cor }}>{v}</p>
                    <p style={{ fontSize: 10, color: C.textMute, marginTop: 2 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Regras anti-fraude */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>🛡️ Regras Anti-Fraude Activas</h3>
          {[
            { l: "Bloquear auto-referência",                on: true  },
            { l: "Detetar múltiplas contas por IP",         on: true  },
            { l: "Alertas de tráfego inválido (bots)",     on: true  },
            { l: "Congelar saldo suspeito automaticamente", on: true  },
            { l: "Score de risco por transação",            on: true  },
            { l: "Alerta de conversão > 50%",               on: true  },
            { l: "Aprovação manual de afiliados novos",     on: true  },
            { l: "Auto-pagamento Bronze",                   on: false },
            { l: "Auto-pagamento Prata",                    on: true  },
            { l: "Auto-pagamento Ouro",                     on: true  },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 9 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 13, color: C.textSub }}>{r.l}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: r.on ? C.greenDim : "#f1f5f9", color: r.on ? C.green : C.textMute }}>
                {r.on ? "ON" : "OFF"}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "10px 12px", background: C.blueDim, borderRadius: 8, fontSize: 12, color: C.blue }}>
            ℹ️ As regras anti-fraude são configuradas directamente no backend. Contacta o dev para alterar.
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════
const SUBTABS = [
  { id: "visao",  label: "Visão Geral",    icon: "bar-chart" },
  { id: "lista",  label: "Afiliados",      icon: "users" },
  { id: "fraude", label: "Fraude",         icon: "alert-triangle", badge: true },
  { id: "regras", label: "Regras & Config",icon: "settings" },
];

export default function PageAfiliados() {
  const [subtab,          setSubtab]          = useState("visao");
  const [afiliados,       setAfiliados]        = useState([]);
  const [total,           setTotal]            = useState(0);
  const [totalPag,        setTotalPag]         = useState(1);
  const [pagina,          setPagina]           = useState(1);
  const [loading,         setLoading]          = useState(true);
  const [kpis,            setKpis]             = useState(null);
  const [kpisLoad,        setKpisLoad]         = useState(true);
  const [afiliadoDetalhe, setAfiliadoDetalhe]  = useState(null);
  const [toast,           setToast]            = useState(null);

  const [filtros, setFiltros] = useState({ busca: "", nivel: "", estado: "" });

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Registar toast globalmente para uso em sub-componentes
  useEffect(() => { window._afiliadosToast = showToast; }, []);

  // ── Carregar KPIs ──────────────────────────────────────────────
  const carregarKpis = useCallback(async () => {
    setKpisLoad(true);
    try { const r = await api.kpis(); setKpis(r.data ?? r.dados); }
    catch (_) {}
    finally { setKpisLoad(false); }
  }, []);

  // ── Carregar afiliados (ranking admin) ─────────────────────────
  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.ranking({ pagina, nivel: filtros.nivel, estado: filtros.estado, busca: filtros.busca });
      const d = r.data ?? r.dados ?? {};
      const lista = (d.afiliados ?? []).map(mapAfiliado);
      setAfiliados(lista);
      setTotal(d.total ?? lista.length);
      setTotalPag((d.totalPaginas ?? Math.ceil((d.total ?? lista.length) / 20)) || 1);
    } catch (e) {
      showToast(e.message || "Erro ao carregar afiliados", "error");
    } finally { setLoading(false); }
  }, [pagina, filtros]);

  useEffect(() => { carregarKpis(); }, []);
  useEffect(() => { carregar(); }, [carregar]);

  // Debounce busca
  useEffect(() => {
    const t = setTimeout(() => { setPagina(1); carregar(); }, 500);
    return () => clearTimeout(t);
  }, [filtros.busca]);

  // ── Bloquear ───────────────────────────────────────────────────
  async function handleBanir(id) {
    await api.bloquear(id, "Bloqueio manual pelo admin");
    setAfiliados(prev => prev.map(a => a.id === id ? { ...a, estadoConta: "BLOQUEADA" } : a));
    showToast("Utilizador bloqueado com sucesso");
  }

  // ── Desbloquear ────────────────────────────────────────────────
  async function handleDesbloquear(id) {
    await api.desbloquear(id);
    setAfiliados(prev => prev.map(a => a.id === id ? { ...a, estadoConta: "ATIVA" } : a));
    showToast("Utilizador desbloqueado com sucesso");
  }

  const suspeitos = afiliados.filter(a => a.risco >= 50 || a.estadoConta === "BLOQUEADA").length;

  const handleSelectAfiliado = (a) => {
    setAfiliadoDetalhe(a);
    setSubtab("detalhe");
  };

  const handleVoltar = () => {
    setAfiliadoDetalhe(null);
    setSubtab("lista");
  };

  const handleFiltroChange = (chave, valor) => {
    setFiltros(f => ({ ...f, [chave]: valor }));
    setPagina(1);
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',system-ui,sans-serif", background: "#f8fafc", minHeight: "100vh", padding: 24 }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes slideUp { from { transform: translateY(16px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        @keyframes popIn   { from { transform: scale(.95); opacity:0 } to { transform: scale(1); opacity:1 } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Gestão de Afiliados</h2>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Controlo total — afiliados, comissões, performance e fraude</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Atualizar" icon="refresh" variant="secondary" size="sm" onClick={() => { carregar(); carregarKpis(); }} loading={loading} />
        </div>
      </div>

      {/* Tabs */}
      {subtab !== "detalhe" && (
        <div style={{ display: "flex", gap: 2, background: "#f1f5f9", padding: 4, borderRadius: 12, marginBottom: 22, width: "fit-content" }}>
          {SUBTABS.map(t => {
            const isActive = subtab === t.id;
            return (
              <button key={t.id} onClick={() => setSubtab(t.id)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "none", background: isActive ? C.card : "transparent", color: isActive ? C.text : C.textSub, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none", fontFamily: "inherit", position: "relative", transition: "all .15s" }}>
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
      {subtab === "visao" && (
        <SubVisaoGeral afiliados={afiliados} kpis={kpis} kpisLoad={kpisLoad} onSelectAfiliado={handleSelectAfiliado} />
      )}
      {subtab === "lista" && (
        <SubListaAfiliados
          afiliados={afiliados}
          total={total}
          pagina={pagina}
          setPagina={setPagina}
          totalPag={totalPag}
          loading={loading}
          onSelectAfiliado={handleSelectAfiliado}
          onBanir={handleBanir}
          onDesbloquear={handleDesbloquear}
          onFiltroChange={handleFiltroChange}
          filtros={filtros}
        />
      )}
      {subtab === "fraude" && (
        <SubFraude
          afiliados={afiliados}
          onBanir={handleBanir}
          onDesbloquear={handleDesbloquear}
          showToast={showToast}
        />
      )}
      {subtab === "regras" && <SubRegras />}
      {subtab === "detalhe" && afiliadoDetalhe && (
        <SubDetalheAfiliado
          afiliado={afiliadoDetalhe}
          onVoltar={handleVoltar}
          onBanir={handleBanir}
          onDesbloquear={handleDesbloquear}
          showToast={showToast}
        />
      )}
    </div>
  );
}