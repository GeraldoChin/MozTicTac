// ─────────────────────────────────────────────────────────────────
// MOZTICTAC — PAINEL ADMIN: GESTÃO DE PROMOÇÕES
// Novas ações:
//   - Aprovar / Rejeitar promoções pendentes
//   - Cancelar promoções ATIVAS (com reembolso opcional)
//   - Ativar produto manualmente
//   - Rejeitar produto com motivo
//   - Modal de detalhe completo com tabs Info / Financeiro
//   - Modal de ação com toggle de reembolso e seleção de motivo
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";

// ── API ───────────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function apiFetch(caminho, opcoes = {}) {
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

const api = {
  // Promoções
  listar: ({ pagina = 1, estado = "", busca = "", planoId = "" }) => {
    const q = new URLSearchParams({ pagina });
    if (estado)  q.set("estado",  estado);
    if (busca)   q.set("busca",   busca);
    if (planoId) q.set("planoId", planoId);
    return apiFetch(`/admin/promocoes?${q}`);
  },
  kpis:            ()                          => apiFetch("/admin/promocoes/kpis"),
  detalhe:         (id)                        => apiFetch(`/admin/promocoes/${id}`),
  aprovar:         (id)                        => apiFetch(`/admin/promocoes/${id}/aprovar`,  { method: "PUT" }),
  rejeitar:        (id, motivo, reembolsar)    => apiFetch(`/admin/promocoes/${id}/rejeitar`, { method: "PUT",  body: JSON.stringify({ motivo, reembolsar }) }),
  cancelar:        (id, motivo, reembolsar)    => apiFetch(`/admin/promocoes/${id}/cancelar`, { method: "PUT",  body: JSON.stringify({ motivo, reembolsar }) }),
  expirarVencidas: ()                          => apiFetch("/admin/promocoes/expirar-vencidas", { method: "POST" }),
  // Produtos (novas ações admin)
  ativarProduto:   (id, observacao)            => apiFetch(`/admin/produtos/${id}/ativar`,   { method: "PUT",  body: JSON.stringify({ observacao }) }),
  rejeitarProduto: (id, motivo)                => apiFetch(`/admin/produtos/${id}/rejeitar`, { method: "PUT",  body: JSON.stringify({ motivo }) }),
};

// ── Paleta ────────────────────────────────────────────────────────
const C = {
  bg: "#f5f6fa", card: "#fff", border: "#e8eaf0",
  text: "#1a1d2e", sub: "#5a6080", mute: "#9aa0bc",
  blue: "#3b6ef8",   blueLt:   "#eef2ff",
  green: "#16a34a",  greenLt:  "#f0fdf4",
  amber: "#d97706",  amberLt:  "#fffbeb",
  red: "#ef4444",    redLt:    "#fef2f2",
  purple: "#8b5cf6", purpleLt: "#f5f3ff",
};

// ── Helpers ───────────────────────────────────────────────────────
const fmt   = (n) => `${Number(n || 0).toLocaleString("pt-MZ")} MZN`;
const fmtD  = (d) => d ? new Date(d).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDH = (d) => d ? new Date(d).toLocaleString("pt-MZ",    { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const diasR = (f) => f ? Math.ceil((new Date(f) - new Date()) / 86400000) : null;

const ESTADO_META = {
  PENDENTE_PAGAMENTO: { label: "Pend. Pagamento",   bg: "#fffbeb", color: "#d97706", dot: "#d97706" },
  PENDENTE_APROVACAO: { label: "Aguarda Aprovação", bg: "#fef9c3", color: "#a16207", dot: "#a16207" },
  ATIVA:              { label: "Activa",            bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
  EXPIRADA:           { label: "Expirada",          bg: "#f5f6fa", color: "#9aa0bc", dot: "#9aa0bc" },
  CANCELADA:          { label: "Cancelada",         bg: "#fef2f2", color: "#ef4444", dot: "#ef4444" },
  REJEITADA:          { label: "Rejeitada",         bg: "#fef2f2", color: "#ef4444", dot: "#ef4444" },
};

const PLANO_META = {
  premium:  { label: "Premium",  bg: "#fff7ed", color: "#f97316", bar: "#f97316", icon: "👑" },
  standard: { label: "Standard", bg: "#f0fdf4", color: "#16a34a", bar: "#16a34a", icon: "⭐" },
  basico:   { label: "Básico",   bg: "#eef2ff", color: "#3b6ef8", bar: "#3b6ef8", icon: "📦" },
};

const MOTIVOS_PROMOCAO = [
  "Produto não elegível para promoção",
  "Imagens de baixa qualidade",
  "Produto suspeito ou em análise",
  "Categoria não suportada",
  "Vendedor com restrições activas",
  "Pagamento não confirmado pelo sistema",
  "Conteúdo inapropriado",
  "Duplicado ou spam",
  "Outro motivo",
];

const MOTIVOS_PRODUTO = [
  "Imagens de baixa qualidade ou inexistentes",
  "Descrição insuficiente ou enganosa",
  "Preço incorreto ou incoerente",
  "Categoria errada",
  "Produto proibido ou não permitido",
  "Conteúdo duplicado",
  "Vendedor sem verificação completa",
  "Violação dos termos de serviço",
  "Outro motivo",
];

// ── Ícones ────────────────────────────────────────────────────────
const I = ({ n, size = 14, c = "currentColor" }) => {
  const s = { width: size, height: size, flexShrink: 0, display: "block" };
  const icons = {
    check:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    eye:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    refresh: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.96"/></svg>,
    search:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    warn:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    info:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    clock:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    dl:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    close:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    play:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    pause:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    reject:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  };
  return icons[n] || null;
};

// ── Componentes base ──────────────────────────────────────────────
function Badge({ estado }) {
  const m = ESTADO_META[estado] || { label: estado || "—", bg: C.bg, color: C.mute, dot: C.mute };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: m.bg, color: m.color, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

function PlanoBadge({ planoId }) {
  const m = PLANO_META[planoId] || { label: planoId || "—", bg: C.bg, color: C.mute, icon: "📋" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: m.bg, color: m.color, whiteSpace: "nowrap" }}>
      {m.icon} {m.label}
    </span>
  );
}

function Btn({ label, icon, variant = "secondary", size = "md", onClick, loading = false, disabled = false, full = false, style: extraStyle = {} }) {
  const variants = {
    secondary: { background: C.card,    border: `1.5px solid ${C.border}`, color: C.sub    },
    primary:   { background: C.text,    border: "none",                    color: "#fff"    },
    ghost:     { background: "transparent", border: "none",                color: C.sub     },
    success:   { background: C.greenLt, border: `1px solid #86efac`,       color: "#15803d" },
    danger:    { background: C.redLt,   border: `1px solid #fca5a5`,       color: "#b91c1c" },
    amber:     { background: C.amberLt, border: `1px solid #fcd34d`,       color: "#b45309" },
    blue:      { background: C.blueLt,  border: `1px solid #93c5fd`,       color: "#1d4ed8" },
    purple:    { background: C.purpleLt,border: `1px solid #c4b5fd`,       color: "#6d28d9" },
  }[variant] || {};
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        cursor: disabled || loading ? "default" : "pointer",
        fontFamily: "inherit", fontWeight: 600, transition: "opacity .15s",
        opacity: disabled || loading ? 0.5 : 1,
        borderRadius: size === "sm" ? 8 : 10,
        padding: size === "sm" ? "5px 11px" : "8px 15px",
        fontSize: size === "sm" ? 12 : 13,
        width: full ? "100%" : "auto",
        ...variants,
        ...extraStyle,
      }}
    >
      {loading
        ? <span style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
        : icon && <I n={icon} size={size === "sm" ? 12 : 14} />}
      {label}
    </button>
  );
}

function Spinner() {
  return <span style={{ width: 26, height: 26, border: `3px solid ${C.border}`, borderTopColor: C.blue, borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [msg]);
  const err = type === "error";
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 3000, display: "flex", alignItems: "center", gap: 10, background: err ? C.redLt : C.greenLt, border: `1px solid ${err ? "#fca5a5" : "#86efac"}`, borderRadius: 14, padding: "12px 16px", fontSize: 13, fontWeight: 600, color: err ? "#b91c1c" : "#15803d", boxShadow: "0 8px 32px rgba(0,0,0,.12)", animation: "slideUp .25s ease", maxWidth: 400 }}>
      <I n={err ? "warn" : "check"} size={15} c={err ? C.red : C.green} />
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}><I n="x" size={13} /></button>
    </div>
  );
}

function Overlay({ children, onClose, width = 520 }) {
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: C.card, borderRadius: 20, width: "100%", maxWidth: width, maxHeight: "92vh", overflow: "auto", boxShadow: "0 32px 100px rgba(0,0,0,.25)", animation: "popIn .2s ease" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHead({ title, sub, emoji, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px 16px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{title}</div>
        {sub && <div style={{ color: C.mute, fontSize: 12, marginTop: 2 }}>{sub}</div>}
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.mute, display: "flex", padding: 4, borderRadius: 8 }}><I n="close" size={17} /></button>
    </div>
  );
}

function StatCard({ label, value, icon, color, sub, loading }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,.05)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      {loading
        ? <div style={{ height: 26, width: 60, borderRadius: 8, background: C.border, animation: "pulse 1.5s ease-in-out infinite", marginBottom: 6 }} />
        : <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: -1 }}>{value}</div>}
      <div style={{ fontSize: 11.5, fontWeight: 600, color: C.mute, textTransform: "uppercase", letterSpacing: .7 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.mute, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────
function ToggleSwitch({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{ width: 48, height: 26, borderRadius: 13, border: "none", background: value ? C.green : C.border, cursor: "pointer", position: "relative", transition: "background .25s", flexShrink: 0 }}
    >
      <span style={{ position: "absolute", top: 3, left: value ? 25 : 3, width: 20, height: 20, background: "#fff", borderRadius: "50%", transition: "left .25s", boxShadow: "0 1px 4px rgba(0,0,0,.25)" }} />
    </button>
  );
}

// ── Seletor de motivo ─────────────────────────────────────────────
function SeletorMotivo({ motivos, value, onChange, cor = C.red }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {motivos.map((m) => (
        <label
          key={m}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", borderRadius: 10, border: `1.5px solid ${value === m ? cor : C.border}`, background: value === m ? `${cor}15` : C.bg, cursor: "pointer", transition: "all .15s" }}
        >
          <input type="radio" name="motivo" value={m} checked={value === m} onChange={() => onChange(m)} style={{ accentColor: cor, width: 13, height: 13, cursor: "pointer" }} />
          <span style={{ fontSize: 12.5, color: C.text }}>{m}</span>
        </label>
      ))}
    </div>
  );
}

// ── Bloco de reembolso ────────────────────────────────────────────
function BlocoReembolso({ valor, pagoEm, metodoPagamento, value, onChange }) {
  return (
    <div style={{ padding: 14, background: value ? C.greenLt : C.bg, border: `1.5px solid ${value ? "#86efac" : C.border}`, borderRadius: 14, transition: "all .2s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>💰 Reembolsar vendedor?</div>
          <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>
            {pagoEm
              ? `Devolver ${fmt(valor)} ao saldo da carteira`
              : "Pagamento ainda não confirmado — reembolso pode não aplicar"}
          </div>
        </div>
        <ToggleSwitch value={value} onChange={onChange} />
      </div>
      <div style={{ marginTop: 10, padding: "7px 11px", background: C.card, borderRadius: 8, fontSize: 11.5, color: value ? "#15803d" : C.mute, fontWeight: 600 }}>
        {value
          ? `✓ ${fmt(valor)} creditados automaticamente na carteira (${metodoPagamento === "SALDO_INTERNO" ? "saldo interno" : `reembolso via ${metodoPagamento}`})`
          : "Sem reembolso — o valor fica retido na plataforma"}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL DETALHE COMPLETO
// ══════════════════════════════════════════════════════════════════
function ModalDetalhe({ promo, onClose, onAprovar, onRejeitar, onCancelar, onAtivarProduto, onRejeitarProduto, acaoId }) {
  const [d, setD]       = useState(null);
  const [tab, setTab]   = useState("info");
  const [load, setLoad] = useState(true);

  useEffect(() => {
    if (!promo) return;
    setLoad(true);
    api.detalhe(promo.id)
      .then((r) => setD(r.data ?? r.dados ?? promo))
      .catch(() => setD(promo))
      .finally(() => setLoad(false));
  }, [promo?.id]);

  if (!promo) return null;
  const p        = d || promo;
  const emAcao   = acaoId === p.id;
  const isPend   = p.estado === "PENDENTE_APROVACAO";
  const isAtiva  = p.estado === "ATIVA";
  const dias     = diasR(p.fimEfetivo);

  // Estado do produto associado
  const prodAtivo    = p.produto?.estado === "ATIVO";
  const prodPendente = p.produto?.estado === "PENDENTE_APROVACAO";
  const prodPausado  = p.produto?.estado === "PAUSADO";
  const podAtivarProd = prodPendente || prodPausado || p.produto?.estado === "REJEITADO";

  const TABS = [{ k: "info", l: "Informação" }, { k: "financeiro", l: "Financeiro" }, { k: "produto", l: "Produto" }];

  const tabBtn = (t) => ({
    padding: "11px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    background: "none", border: "none", fontFamily: "inherit", transition: "all .15s",
    color: tab === t.k ? C.blue : C.mute,
    borderBottom: tab === t.k ? `2px solid ${C.blue}` : "2px solid transparent",
  });

  return (
    <Overlay onClose={onClose} width={640}>
      <ModalHead title="Detalhe da promoção" sub={p.produto?.nome} emoji="📢" onClose={onClose} />

      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 22px" }}>
        {TABS.map((t) => <button key={t.k} onClick={() => setTab(t.k)} style={tabBtn(t)}>{t.l}</button>)}
      </div>

      <div style={{ padding: 22 }}>
        {load ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>
        ) : (
          <>
            {/* ── INFO ── */}
            {tab === "info" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 14, padding: 14, background: C.bg, borderRadius: 12 }}>
                  <div style={{ width: 68, height: 68, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                    {p.produto?.imagens?.[0] ? <img src={p.produto.imagens[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.produto?.nome || "—"}</div>
                    <div style={{ color: C.mute, fontSize: 12, marginTop: 3 }}>{p.produto?.categoria?.nome || "—"}</div>
                    <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
                      <Badge estado={p.estado} />
                      <PlanoBadge planoId={p.planoId} />
                      {dias !== null && dias > 0  && <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: dias < 3 ? C.redLt : C.greenLt, color: dias < 3 ? C.red : C.green }}>{dias}d restantes</span>}
                      {dias !== null && dias <= 0 && <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: C.redLt, color: C.red }}>Expirou há {Math.abs(dias)}d</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  {[
                    ["Vendedor",       p.usuario?.nomeCompleto || "—"],
                    ["Email",          p.usuario?.email || "—"],
                    ["Plano",          `${p.planoNome || p.planoId || "—"} · ${p.duracaoDias || "—"} dias`],
                    ["Método pag.",    p.metodoPagamento || "—"],
                    ["Submetido em",   fmtDH(p.criadoEm)],
                    ["Pago em",        p.pagoEm ? fmtDH(p.pagoEm) : "Não confirmado"],
                    ...(p.inicioEfetivo ? [["Início efectivo", fmtDH(p.inicioEfetivo)]] : []),
                    ...(p.fimEfetivo    ? [["Fim efectivo",    fmtDH(p.fimEfetivo)]]    : []),
                    ...(p.motivoCancelamento ? [["Motivo cancel.", p.motivoCancelamento]] : []),
                  ].map(([l, v]) => (
                    <div key={l} style={{ background: C.bg, borderRadius: 10, padding: "10px 13px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, wordBreak: "break-word" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {p.beneficios?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 7 }}>Benefícios incluídos</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {p.beneficios.map((b) => {
                        const pm = PLANO_META[p.planoId] || PLANO_META.basico;
                        return <span key={b} style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: pm.bg, color: pm.color }}>{b.replace(/_/g, " ")}</span>;
                      })}
                    </div>
                  </div>
                )}

                {/* Ações promoção */}
                <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 10 }}>Acções — promoção</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {isPend && <Btn label="✓ Aprovar promoção" variant="success" loading={emAcao} onClick={() => { onAprovar(p.id); onClose(); }} />}
                    {isPend && <Btn label="Rejeitar" icon="x"                   variant="danger"  loading={emAcao} onClick={() => { onClose(); onRejeitar(p); }} />}
                    {isAtiva && <Btn label="⏸ Cancelar promoção activa"          variant="amber"   loading={emAcao} onClick={() => { onClose(); onCancelar(p); }} />}
                    {!isPend && !isAtiva && <span style={{ fontSize: 12.5, color: C.mute }}>Nenhuma acção de promoção disponível ({p.estado}).</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ── FINANCEIRO ── */}
            {tab === "financeiro" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
                  {[
                    { l: "Valor pago",          v: fmt(p.valor),         c: C.green  },
                    { l: "Taxa plataforma (20%)",v: fmt(p.valor * 0.2),  c: C.blue   },
                    { l: "Receita líquida",      v: fmt(p.valor * 0.8),  c: C.purple },
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ background: C.bg, borderRadius: 10, padding: 13 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 6 }}>{l}</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: c, fontFamily: "monospace" }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "13px 15px", background: C.bg, borderRadius: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 7 }}>Estado do pagamento</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.pagoEm ? C.green : C.amber, flexShrink: 0 }} />
                    <div style={{ fontSize: 12.5, color: C.text }}>
                      {p.pagoEm
                        ? <><strong>Pago</strong> via <strong>{p.metodoPagamento}</strong> em {fmtDH(p.pagoEm)}</>
                        : <span style={{ color: C.amber, fontWeight: 600 }}>Aguarda confirmação de pagamento</span>}
                    </div>
                  </div>
                  {p.numeroCelular && <div style={{ fontSize: 11.5, color: C.mute, marginTop: 5 }}>Número: {p.numeroCelular}</div>}
                </div>

                {p.pagoEm && (isPend || isAtiva) && (
                  <div style={{ padding: "13px 15px", background: C.amberLt, border: `1px solid #fcd34d`, borderRadius: 12, display: "flex", gap: 9 }}>
                    <I n="info" size={15} c={C.amber} />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.amber }}>Reembolso disponível</div>
                      <div style={{ fontSize: 11.5, color: C.amber, marginTop: 2, opacity: .9 }}>
                        Ao rejeitar ou cancelar, podes devolver {fmt(p.valor)} ao saldo da carteira do vendedor.
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {isPend && <Btn label="✓ Aprovar" variant="success" loading={emAcao} onClick={() => { onAprovar(p.id); onClose(); }} />}
                  {isPend && <Btn label="Rejeitar c/ reembolso" icon="x" variant="danger" loading={emAcao} onClick={() => { onClose(); onRejeitar(p); }} />}
                  {isAtiva && <Btn label="⏸ Cancelar + reembolsar" variant="amber" loading={emAcao} onClick={() => { onClose(); onCancelar(p); }} />}
                </div>
              </div>
            )}

            {/* ── PRODUTO ── */}
            {tab === "produto" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div style={{ padding: 14, background: C.bg, borderRadius: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Estado do produto</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                    {[
                      ["Nome",      p.produto?.nome || "—"],
                      ["Estado",    p.produto?.estado || "—"],
                      ["Categoria", p.produto?.categoria?.nome || "—"],
                      ["Vendedor",  p.produto?.vendedor?.nomeCompleto || p.usuario?.nomeCompleto || "—"],
                    ].map(([l, v]) => (
                      <div key={l} style={{ background: C.card, borderRadius: 10, padding: "10px 13px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 3 }}>{l}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 10 }}>Acções — produto</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {podAtivarProd && (
                      <Btn label="✓ Ativar produto" variant="success" loading={emAcao}
                        onClick={() => { onClose(); onAtivarProduto(p.produto); }} />
                    )}
                    {(prodAtivo || prodPendente) && (
                      <Btn label="Rejeitar produto" icon="reject" variant="danger" loading={emAcao}
                        onClick={() => { onClose(); onRejeitarProduto(p.produto); }} />
                    )}
                    {!podAtivarProd && !prodAtivo && !prodPendente && (
                      <span style={{ fontSize: 12.5, color: C.mute }}>Nenhuma acção de produto disponível ({p.produto?.estado}).</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Overlay>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL REJEITAR / CANCELAR PROMOÇÃO
// ══════════════════════════════════════════════════════════════════
function ModalAcaoPromocao({ promo, tipo, onClose, onConfirm, acaoId }) {
  const [motivo,     setMotivo]     = useState("");
  const [custom,     setCustom]     = useState("");
  const [reembolsar, setReembolsar] = useState(true);

  if (!promo) return null;
  const emAcao     = acaoId === promo.id;
  const isCancelar = tipo === "cancelar";
  const mFinal     = motivo === "Outro motivo" ? custom.trim() : motivo;
  const canSubmit  = motivo && (motivo !== "Outro motivo" || custom.trim().length >= 5);

  return (
    <Overlay onClose={onClose} width={500}>
      <ModalHead
        title={isCancelar ? "Cancelar promoção activa" : "Rejeitar promoção"}
        sub={promo.produto?.nome}
        emoji={isCancelar ? "⏸" : "❌"}
        onClose={onClose}
      />
      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>

        <div style={{ padding: "11px 14px", background: isCancelar ? C.amberLt : C.redLt, border: `1px solid ${isCancelar ? "#fcd34d" : "#fca5a5"}`, borderRadius: 12, display: "flex", gap: 9 }}>
          <I n="warn" size={15} c={isCancelar ? C.amber : C.red} />
          <div style={{ fontSize: 12.5, color: isCancelar ? C.amber : "#b91c1c" }}>
            {isCancelar
              ? "A promoção está activa. Cancelar remove o produto do destaque imediatamente."
              : "O vendedor será notificado com o motivo indicado abaixo."}
          </div>
        </div>

        {/* Resumo financeiro */}
        <div style={{ display: "flex", justifyContent: "space-between", background: C.bg, borderRadius: 10, padding: "12px 15px" }}>
          {[["Valor pago", fmt(promo.valor)], ["Método", promo.metodoPagamento || "—"], ["Pagamento", promo.pagoEm ? "✓ Confirmado" : "⚠ Pendente"]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 9 }}>Motivo *</div>
          <SeletorMotivo motivos={MOTIVOS_PROMOCAO} value={motivo} onChange={setMotivo} />
          {motivo === "Outro motivo" && (
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              rows={3}
              placeholder="Descreve o motivo em detalhe (mínimo 5 caracteres)..."
              style={{ width: "100%", marginTop: 8, padding: "9px 11px", fontSize: 12.5, fontFamily: "inherit", border: `1.5px solid ${C.border}`, borderRadius: 10, resize: "vertical", outline: "none", color: C.text, background: C.bg, boxSizing: "border-box" }}
            />
          )}
        </div>

        <BlocoReembolso valor={promo.valor} pagoEm={promo.pagoEm} metodoPagamento={promo.metodoPagamento} value={reembolsar} onChange={setReembolsar} />

        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Cancelar" variant="secondary" onClick={onClose} disabled={emAcao} full />
          <Btn
            label={isCancelar ? "⏸ Confirmar cancelamento" : "✕ Confirmar rejeição"}
            variant="danger"
            loading={emAcao}
            disabled={!canSubmit}
            full
            onClick={() => onConfirm(promo.id, mFinal, reembolsar)}
          />
        </div>
      </div>
    </Overlay>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL ATIVAR PRODUTO
// ══════════════════════════════════════════════════════════════════
function ModalAtivarProduto({ produto, onClose, onConfirm, loading }) {
  const [observacao, setObservacao] = useState("");
  if (!produto) return null;
  return (
    <Overlay onClose={onClose} width={440}>
      <ModalHead title="Ativar produto" sub={produto.nome} emoji="✅" onClose={onClose} />
      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: "11px 14px", background: C.greenLt, border: `1px solid #86efac`, borderRadius: 12, display: "flex", gap: 9 }}>
          <I n="info" size={15} c={C.green} />
          <div style={{ fontSize: 12.5, color: "#15803d" }}>
            O produto passará para <strong>ATIVO</strong> e ficará visível na loja. O vendedor será notificado.
          </div>
        </div>
        <div style={{ background: C.bg, borderRadius: 10, padding: "12px 15px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 3 }}>Produto</div>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{produto.nome}</div>
          <div style={{ fontSize: 11.5, color: C.mute, marginTop: 2 }}>Estado actual: {produto.estado || "—"}</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 7 }}>Observação (opcional)</div>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            rows={2}
            placeholder="Nota para o vendedor sobre a aprovação..."
            style={{ width: "100%", padding: "9px 11px", fontSize: 12.5, fontFamily: "inherit", border: `1.5px solid ${C.border}`, borderRadius: 10, resize: "vertical", outline: "none", color: C.text, background: C.bg, boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Cancelar" variant="secondary" onClick={onClose} disabled={loading} full />
          <Btn label="✓ Ativar produto" variant="success" loading={loading} full onClick={() => onConfirm(produto.id, observacao)} />
        </div>
      </div>
    </Overlay>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL REJEITAR PRODUTO
// ══════════════════════════════════════════════════════════════════
function ModalRejeitarProduto({ produto, onClose, onConfirm, loading }) {
  const [motivo, setMotivo] = useState("");
  const [custom, setCustom] = useState("");
  if (!produto) return null;
  const mFinal    = motivo === "Outro motivo" ? custom.trim() : motivo;
  const canSubmit = motivo && (motivo !== "Outro motivo" || custom.trim().length >= 5);
  return (
    <Overlay onClose={onClose} width={480}>
      <ModalHead title="Rejeitar produto" sub={produto.nome} emoji="🚫" onClose={onClose} />
      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: "11px 14px", background: C.redLt, border: `1px solid #fca5a5`, borderRadius: 12, display: "flex", gap: 9 }}>
          <I n="warn" size={15} c={C.red} />
          <div style={{ fontSize: 12.5, color: "#b91c1c" }}>
            O produto será marcado como <strong>REJEITADO</strong>. O vendedor receberá o motivo e poderá corrigir e resubmeter.
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 9 }}>Motivo *</div>
          <SeletorMotivo motivos={MOTIVOS_PRODUTO} value={motivo} onChange={setMotivo} />
          {motivo === "Outro motivo" && (
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              rows={3}
              placeholder="Descreve o motivo em detalhe (mínimo 5 caracteres)..."
              style={{ width: "100%", marginTop: 8, padding: "9px 11px", fontSize: 12.5, fontFamily: "inherit", border: `1.5px solid ${C.border}`, borderRadius: 10, resize: "vertical", outline: "none", color: C.text, background: C.bg, boxSizing: "border-box" }}
            />
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Cancelar" variant="secondary" onClick={onClose} disabled={loading} full />
          <Btn label="Confirmar rejeição" icon="reject" variant="danger" loading={loading} disabled={!canSubmit} full onClick={() => onConfirm(produto.id, mFinal)} />
        </div>
      </div>
    </Overlay>
  );
}

// ══════════════════════════════════════════════════════════════════
// CARD FILA DE PENDENTES
// ══════════════════════════════════════════════════════════════════
function CardPendente({ promo, onAprovar, onRejeitar, onVer, acaoId }) {
  const emAcao = acaoId === promo.id;
  const p      = promo.produto || {};
  const u      = promo.usuario || {};
  const pm     = PLANO_META[promo.planoId] || PLANO_META.basico;

  return (
    <div style={{ background: C.card, border: `2px solid #fbbf2440`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.06)", marginBottom: 12 }}>
      <div style={{ height: 4, background: pm.bar }} />
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", gap: 13 }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
            {p.imagens?.[0] ? <img src={p.imagens[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 5 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{p.nome || "—"}</span>
              <PlanoBadge planoId={promo.planoId} />
              <Badge estado={promo.estado} />
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 9 }}>
              👤 <strong>{u.nomeCompleto || "—"}</strong>
              {u.email && <span style={{ color: C.mute }}> · {u.email}</span>}
              <span style={{ color: C.mute }}> · {fmtD(promo.criadoEm)}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { label: `💰 ${fmt(promo.valor)}`, bg: C.greenLt, color: C.green },
                { label: `⏳ ${promo.duracaoDias} dias`, bg: C.bg, color: C.sub, border: `1px solid ${C.border}` },
                promo.pagoEm
                  ? { label: "✓ Pagamento confirmado", bg: C.greenLt, color: C.green }
                  : { label: "⚠ Aguarda pagamento", bg: C.amberLt, color: C.amber },
                { label: `💳 ${promo.metodoPagamento || "—"}`, bg: C.bg, color: C.sub, border: `1px solid ${C.border}` },
              ].map((pill, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 600, padding: "3px 11px", borderRadius: 20, background: pill.bg, color: pill.color, border: pill.border || "none" }}>
                  {pill.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: .7, color: C.mute, marginBottom: 9 }}>Acções</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <Btn label="Ver detalhes" icon="eye"             variant="secondary" onClick={() => onVer(promo)} />
            <Btn label="✓ Aprovar promoção" variant="success" loading={emAcao}   onClick={() => onAprovar(promo.id)} />
            <Btn label="Rejeitar" icon="x"                   variant="danger"   loading={emAcao} onClick={() => onRejeitar(promo)} />
          </div>
          {!promo.pagoEm && (
            <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.amber, fontWeight: 600 }}>
              <I n="warn" size={13} c={C.amber} />
              Pagamento ainda não confirmado — verifica antes de aprovar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// TABELA GERAL
// ══════════════════════════════════════════════════════════════════
function TabelaGeral({ lista, onVer, onAprovar, onRejeitar, onCancelar, acaoId }) {
  const th = { padding: "9px 13px", textAlign: "left", fontSize: 10.5, fontWeight: 700, letterSpacing: .7, textTransform: "uppercase", color: C.mute, whiteSpace: "nowrap", background: C.bg };
  const td = { padding: "11px 13px", verticalAlign: "middle" };
  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{["Produto / Vendedor", "Plano", "Valor", "Pago em", "Duração", "Estado", "Acções"].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {lista.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign: "center", padding: 44, color: C.mute }}>Nenhuma promoção encontrada</td></tr>}
          {lista.map((p, i) => {
            const emAcao  = acaoId === p.id;
            const isPend  = p.estado === "PENDENTE_APROVACAO";
            const isAtiva = p.estado === "ATIVA";
            const dias    = diasR(p.fimEfetivo);
            return (
              <tr key={p.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : "#fafbfe" }}>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      {p.produto?.imagens?.[0] ? <img src={p.produto.imagens[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: C.text, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.produto?.nome || "—"}</div>
                      <div style={{ fontSize: 11, color: C.mute }}>{p.usuario?.nomeCompleto || "—"}</div>
                    </div>
                  </div>
                </td>
                <td style={td}><PlanoBadge planoId={p.planoId} /></td>
                <td style={{ ...td, fontFamily: "monospace", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" }}>{fmt(p.valor)}</td>
                <td style={{ ...td, fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>
                  {p.pagoEm ? fmtD(p.pagoEm) : <span style={{ color: C.amber, fontWeight: 600 }}>Pendente</span>}
                </td>
                <td style={{ ...td, fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>
                  {p.duracaoDias}d
                  {dias !== null && <div style={{ fontSize: 10, color: dias > 0 ? C.green : C.red, fontWeight: 600, marginTop: 1 }}>{dias > 0 ? `${dias}d restantes` : "Expirado"}</div>}
                </td>
                <td style={td}><Badge estado={p.estado} /></td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <Btn label="" icon="eye" variant="ghost" size="sm" onClick={() => onVer(p)} style={{ padding: "5px 9px" }} />
                    {isPend && <Btn label="✓" variant="success" size="sm" loading={emAcao} onClick={() => onAprovar(p.id)} />}
                    {isPend && <Btn label="" icon="x" variant="danger" size="sm" loading={emAcao} onClick={() => onRejeitar(p)} />}
                    {isAtiva && <Btn label="⏸" variant="amber" size="sm" loading={emAcao} onClick={() => onCancelar(p)} />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════
export default function PagePromocoes() {
  const [tab,       setTab]       = useState("pendentes");
  const [promocoes, setPromocoes] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [totalPag,  setTotalPag]  = useState(1);
  const [pagina,    setPagina]    = useState(1);
  const [kpis,      setKpis]      = useState(null);
  const [kpisLoad,  setKpisLoad]  = useState(true);
  const [loading,   setLoading]   = useState(true);
  const [acaoId,    setAcaoId]    = useState(null);
  const [toast,     setToast]     = useState(null);

  const [buscaInput, setBuscaInput] = useState("");
  const [busca,      setBusca]      = useState("");
  const [planoId,    setPlanoId]    = useState("");

  // Modais
  const [mDetalhe,         setMDetalhe]         = useState(null);
  const [mRejeitar,        setMRejeitar]        = useState(null);
  const [mCancelar,        setMCancelar]        = useState(null);
  const [mAtivarProduto,   setMAtivarProduto]   = useState(null);
  const [mRejeitarProduto, setMRejeitarProduto] = useState(null);
  const [loadingProduto,   setLoadingProduto]   = useState(false);

  const toast$ = (msg, type = "success") => setToast({ msg, type });

  const ESTADO_POR_TAB = {
    pendentes: "PENDENTE_APROVACAO", ativas: "ATIVA",
    expiradas: "EXPIRADA", canceladas: "CANCELADA", todos: "",
  };

  // Debounce busca
  useEffect(() => {
    const t = setTimeout(() => { setBusca(buscaInput); setPagina(1); }, 450);
    return () => clearTimeout(t);
  }, [buscaInput]);

  const carregarKpis = useCallback(async () => {
    setKpisLoad(true);
    try { const r = await api.kpis(); setKpis(r.data ?? r.dados); } catch (_) {}
    finally { setKpisLoad(false); }
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.listar({ pagina, estado: ESTADO_POR_TAB[tab], busca, planoId });
      const d = r.data ?? r.dados ?? {};
      setPromocoes(d.promocoes ?? []);
      setTotal(d.total ?? 0);
    setTotalPag(
  d.totalPaginas ?? (Math.ceil((d.total ?? 0) / 20) || 1)
);
      if (d.kpis) setKpis(d.kpis);
    } catch (e) {
      toast$(e.message || "Erro ao carregar", "error");
    } finally { setLoading(false); }
  }, [pagina, tab, busca, planoId]);

  useEffect(() => { carregarKpis(); }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const mudarTab = (t) => { setTab(t); setPagina(1); };
  const reload   = () => { carregar(); carregarKpis(); };

  // ── Ações de promoção ─────────────────────────────────────────
  async function handleAprovar(id) {
    setAcaoId(id);
    try {
      const r = await api.aprovar(id);
      toast$(`✅ Promoção aprovada!${r.data?.fimEfetivo ? ` Activa até ${fmtD(r.data.fimEfetivo)}` : ""}`);
      await reload();
    } catch (e) { toast$(e.message, "error"); }
    finally { setAcaoId(null); }
  }

  async function handleRejeitar(id, motivo, reembolsar) {
    setAcaoId(id);
    try {
      await api.rejeitar(id, motivo, reembolsar);
      toast$(`Promoção rejeitada.${reembolsar ? " Valor reembolsado ao vendedor." : ""}`);
      setMRejeitar(null);
      await reload();
    } catch (e) { toast$(e.message, "error"); }
    finally { setAcaoId(null); }
  }

  async function handleCancelar(id, motivo, reembolsar) {
    setAcaoId(id);
    try {
      await api.cancelar(id, motivo, reembolsar);
      toast$(`Promoção cancelada.${reembolsar ? " Valor reembolsado." : ""}`);
      setMCancelar(null);
      await reload();
    } catch (e) { toast$(e.message, "error"); }
    finally { setAcaoId(null); }
  }

  // ── Ações de produto ──────────────────────────────────────────
  async function handleAtivarProduto(produtoId, observacao) {
    setLoadingProduto(true);
    try {
      await api.ativarProduto(produtoId, observacao);
      toast$("✅ Produto ativado com sucesso. Vendedor notificado.");
      setMAtivarProduto(null);
      await reload();
    } catch (e) { toast$(e.message, "error"); }
    finally { setLoadingProduto(false); }
  }

  async function handleRejeitarProduto(produtoId, motivo) {
    setLoadingProduto(true);
    try {
      await api.rejeitarProduto(produtoId, motivo);
      toast$("Produto rejeitado. Vendedor notificado com o motivo.");
      setMRejeitarProduto(null);
      await reload();
    } catch (e) { toast$(e.message, "error"); }
    finally { setLoadingProduto(false); }
  }

  async function handleExpirar() {
    try {
      const r = await api.expirarVencidas();
      toast$(`${r.expiradas ?? 0} promoção(ões) expirada(s)`);
      await reload();
    } catch (e) { toast$(e.message, "error"); }
  }

  function exportarCSV() {
    const cols = ["ID", "Produto", "Vendedor", "Plano", "Valor", "Método", "Estado", "Criado em", "Pago em"];
    const rows = promocoes.map((p) => [
      p.id, p.produto?.nome || "", p.usuario?.nomeCompleto || "",
      p.planoId, p.valor, p.metodoPagamento, p.estado, fmtD(p.criadoEm), fmtD(p.pagoEm),
    ]);
    const csv = [cols, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `promocoes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  // Paginação
  const paginas = [];
  if (totalPag <= 7) { for (let i = 1; i <= totalPag; i++) paginas.push(i); }
  else {
    paginas.push(1);
    if (pagina > 3) paginas.push("…");
    for (let i = Math.max(2, pagina - 1); i <= Math.min(totalPag - 1, pagina + 1); i++) paginas.push(i);
    if (pagina < totalPag - 2) paginas.push("…");
    paginas.push(totalPag);
  }

  const TABS = [
    { id: "pendentes",  label: "Aguarda Aprovação", count: kpis?.pendenteAprovacao ?? 0, alert: true },
    { id: "todos",      label: "Todas",             count: total },
    { id: "ativas",     label: "Activas",           count: kpis?.ativas            ?? 0 },
    { id: "expiradas",  label: "Expiradas",         count: kpis?.expiradas         ?? 0 },
    { id: "canceladas", label: "Canceladas",        count: kpis?.canceladas        ?? 0 },
  ];

  const selSty = { padding: "8px 11px", fontSize: 13, fontFamily: "inherit", border: `1.5px solid ${C.border}`, borderRadius: 9, color: C.text, background: C.bg, outline: "none", cursor: "pointer" };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: 22, fontFamily: "system-ui, sans-serif", color: C.text, fontSize: 14 }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes slideUp { from { transform: translateY(16px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        @keyframes popIn   { from { transform: scale(.95); opacity:0 } to { transform: scale(1); opacity:1 } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      {/* Modais */}
      {mDetalhe && (
        <ModalDetalhe
          promo={mDetalhe}
          onClose={() => setMDetalhe(null)}
          onAprovar={handleAprovar}
          onRejeitar={(p) => { setMDetalhe(null); setMRejeitar(p); }}
          onCancelar={(p) => { setMDetalhe(null); setMCancelar(p); }}
          onAtivarProduto={(prod) => { setMDetalhe(null); setMAtivarProduto(prod); }}
          onRejeitarProduto={(prod) => { setMDetalhe(null); setMRejeitarProduto(prod); }}
          acaoId={acaoId}
        />
      )}
      {mRejeitar        && <ModalAcaoPromocao  promo={mRejeitar}        tipo="rejeitar" onClose={() => setMRejeitar(null)}        onConfirm={handleRejeitar}        acaoId={acaoId} />}
      {mCancelar        && <ModalAcaoPromocao  promo={mCancelar}        tipo="cancelar" onClose={() => setMCancelar(null)}        onConfirm={handleCancelar}        acaoId={acaoId} />}
      {mAtivarProduto   && <ModalAtivarProduto   produto={mAtivarProduto}   onClose={() => setMAtivarProduto(null)}   onConfirm={handleAtivarProduto}   loading={loadingProduto} />}
      {mRejeitarProduto && <ModalRejeitarProduto produto={mRejeitarProduto} onClose={() => setMRejeitarProduto(null)} onConfirm={handleRejeitarProduto} loading={loadingProduto} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: -.3 }}>Gestão de Promoções</div>
          <div style={{ color: C.sub, fontSize: 12.5, marginTop: 3 }}>
            Aprovação, rejeição e gestão de promoções pagas pelos vendedores
            {(kpis?.pendenteAprovacao ?? 0) > 0 && (
              <span style={{ marginLeft: 8, fontWeight: 700, color: C.amber }}>· {kpis.pendenteAprovacao} aguardam aprovação</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Exportar CSV"    icon="dl"      variant="secondary" onClick={exportarCSV} />
          <Btn label="Expirar vencidas" icon="clock"  variant="amber"     onClick={handleExpirar} />
          <Btn label="Atualizar"       icon="refresh" variant="secondary" onClick={reload} loading={loading} />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 11, marginBottom: 22 }}>
        <StatCard label="Aguarda aprovação" value={kpis?.pendenteAprovacao ?? 0} icon="⏳" color={C.amber}  loading={kpisLoad} />
        <StatCard label="Activas agora"     value={kpis?.ativas            ?? 0} icon="🟢" color={C.green}  loading={kpisLoad} />
        <StatCard label="Expiradas"         value={kpis?.expiradas         ?? 0} icon="⌛" color={C.mute}   loading={kpisLoad} />
        <StatCard label="Canceladas"        value={kpis?.canceladas        ?? 0} icon="❌" color={C.red}    loading={kpisLoad} />
        <StatCard label="Receita total"     value={kpis ? fmt(kpis.receitaTotal) : "—"} icon="💰" color={C.purple} loading={kpisLoad} sub={kpis?.receitaMes ? `${fmt(kpis.receitaMes)} este mês` : undefined} />
      </div>

      {/* Info bar */}
      <div style={{ padding: "11px 15px", background: C.blueLt, border: `1px solid ${C.blue}30`, borderRadius: 12, marginBottom: 18, display: "flex", gap: 9, alignItems: "center" }}>
        <I n="info" size={15} c={C.blue} />
        <span style={{ fontSize: 12.5, color: C.blue }}>
          Só promoções <strong>ATIVA</strong> aparecem no TopTendências. <strong>Premium</strong> aparece primeiro, depois <strong>Standard</strong> e Básico.
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 3, background: "#eef0f7", padding: 4, borderRadius: 14, marginBottom: 18, width: "fit-content", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => mudarTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 15px", borderRadius: 10, border: "none", background: tab === t.id ? C.card : "transparent", color: tab === t.id ? C.text : C.mute, fontSize: 12.5, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,.08)" : "none", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all .15s" }}
          >
            {t.label}
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: t.alert && (kpis?.pendenteAprovacao ?? 0) > 0 ? C.red : tab === t.id ? C.bg : "transparent", color: t.alert && (kpis?.pendenteAprovacao ?? 0) > 0 ? "#fff" : C.mute }}>
              {kpisLoad ? "…" : t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Painel */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
        {tab === "pendentes" ? (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 14 }}>
              Fila de aprovação <span style={{ fontWeight: 400, color: C.mute, fontSize: 12.5 }}>({total})</span>
            </div>
            {loading && <div style={{ display: "flex", justifyContent: "center", padding: 50 }}><Spinner /></div>}
            {!loading && promocoes.length === 0 && (
              <div style={{ textAlign: "center", padding: "52px 0" }}>
                <div style={{ fontSize: 38, marginBottom: 11 }}>✅</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>Fila vazia!</div>
                <div style={{ fontSize: 12.5, color: C.mute }}>Não há promoções a aguardar aprovação.</div>
              </div>
            )}
            {!loading && promocoes.map((p) => (
              <CardPendente key={p.id} promo={p} onAprovar={handleAprovar} onRejeitar={(p) => setMRejeitar(p)} onVer={(p) => setMDetalhe(p)} acaoId={acaoId} />
            ))}
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 9, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mute, display: "flex" }}><I n="search" size={13} /></span>
                <input
                  value={buscaInput}
                  onChange={(e) => setBuscaInput(e.target.value)}
                  placeholder="Pesquisar produto ou vendedor..."
                  style={{ width: "100%", padding: "8px 11px 8px 32px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 12.5, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <select style={selSty} value={planoId} onChange={(e) => { setPlanoId(e.target.value); setPagina(1); }}>
                <option value="">Todos os planos</option>
                <option value="premium">👑 Premium</option>
                <option value="standard">⭐ Standard</option>
                <option value="basico">📦 Básico</option>
              </select>
              <span style={{ fontSize: 12, color: C.mute, marginLeft: "auto" }}>{loading ? "A carregar..." : `${total} resultado(s)`}</span>
            </div>
            {loading
              ? <div style={{ display: "flex", justifyContent: "center", padding: 50 }}><Spinner /></div>
              : <TabelaGeral lista={promocoes} onVer={setMDetalhe} onAprovar={handleAprovar} onRejeitar={setMRejeitar} onCancelar={setMCancelar} acaoId={acaoId} />}
          </div>
        )}

        {/* Paginação */}
        {totalPag > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 12, color: C.mute }}>
            <span>Página {pagina} de {totalPag} · {total} promoções</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}
                style={{ height: 29, padding: "0 11px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 12, cursor: pagina === 1 ? "default" : "pointer", fontFamily: "inherit", opacity: pagina === 1 ? 0.5 : 1 }}>
                ‹ Anterior
              </button>
              {paginas.map((p, i) => (
                <button key={i} onClick={() => typeof p === "number" && setPagina(p)} disabled={p === "…"}
                  style={{ height: 29, width: p === "…" ? "auto" : 29, padding: p === "…" ? "0 4px" : 0, borderRadius: 7, border: `1.5px solid ${p === pagina ? C.text : C.border}`, background: p === pagina ? C.text : "transparent", color: p === pagina ? "#fff" : C.sub, fontSize: 12, cursor: p === "…" ? "default" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPagina((p) => Math.min(totalPag, p + 1))} disabled={pagina === totalPag}
                style={{ height: 29, padding: "0 11px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 12, cursor: pagina === totalPag ? "default" : "pointer", fontFamily: "inherit", opacity: pagina === totalPag ? 0.5 : 1 }}>
                Seguinte ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}