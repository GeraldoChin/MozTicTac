import { useState } from "react";

// ─── Design tokens (mesmos do admin) ─────────────────────────────────────────
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

// ─── Dados mock ───────────────────────────────────────────────────────────────
const TRANSACOES_MOCK = [
  { id:"TXN-00821", tipo:"Venda",        valor:3400,  de:"João Matos",    para:"Ana Lopes",      data:"18 Abr 14:32", estado:"concluido", gateway:"M-Pesa",  split:{ vendedor:3060, plataforma:272, afiliado:68 } },
  { id:"TXN-00820", tipo:"Comissão",     valor:340,   de:"Sistema",       para:"João Matos",     data:"18 Abr 14:32", estado:"concluido", gateway:"Sistema", split:null },
  { id:"TXN-00819", tipo:"Levantamento", valor:5000,  de:"Carlos Nhaca",  para:"M-Pesa",         data:"18 Abr 13:40", estado:"pendente",  gateway:"M-Pesa",  split:null },
  { id:"TXN-00818", tipo:"Reembolso",    valor:1900,  de:"Plataforma",    para:"Maria Simone",   data:"17 Abr 18:10", estado:"concluido", gateway:"E-Mola",  split:null },
  { id:"TXN-00817", tipo:"Suspeito",     valor:28000, de:"spam_afilX",    para:"?",              data:"17 Abr 02:14", estado:"bloqueado", gateway:"M-Pesa",  split:null },
  { id:"TXN-00816", tipo:"Venda",        valor:8200,  de:"Fátima Dique",  para:"Pedro Mabunda",  data:"17 Abr 09:22", estado:"concluido", gateway:"Banco",   split:{ vendedor:7380, plataforma:656, afiliado:164 } },
  { id:"TXN-00815", tipo:"Venda",        valor:1200,  de:"Luísa Tembe",   para:"Carlos Nhaca",   data:"16 Abr 17:55", estado:"concluido", gateway:"E-Mola",  split:{ vendedor:1080, plataforma:96,  afiliado:24  } },
  { id:"TXN-00814", tipo:"Levantamento", valor:12000, de:"João Matos",    para:"Banco BCI",      data:"16 Abr 11:00", estado:"aprovado",  gateway:"Banco",   split:null },
  { id:"TXN-00813", tipo:"Reembolso",    valor:600,   de:"Plataforma",    para:"Rogério Sitoe",  data:"15 Abr 14:30", estado:"concluido", gateway:"M-Pesa",  split:null },
  { id:"TXN-00812", tipo:"Comissão",     valor:820,   de:"Sistema",       para:"Ana Lopes",      data:"15 Abr 10:00", estado:"concluido", gateway:"Sistema", split:null },
];

const SAQUES_MOCK = [
  { id:"SQ-0041", nome:"Carlos Nhaca",  valor:5000,  taxa:100,  liquido:4900,  metodo:"M-Pesa",  solicitado:"18 Abr 13:40", estado:"pendente",  risco:18 },
  { id:"SQ-0040", nome:"João Matos",    valor:12000, taxa:240,  liquido:11760, metodo:"Banco",   solicitado:"16 Abr 11:00", estado:"aprovado",  risco:8  },
  { id:"SQ-0039", nome:"Ana Lopes",     valor:4500,  taxa:90,   liquido:4410,  metodo:"E-Mola",  solicitado:"15 Abr 09:10", estado:"pago",      risco:12 },
  { id:"SQ-0038", nome:"spam_afilX",    valor:28000, taxa:560,  liquido:27440, metodo:"M-Pesa",  solicitado:"17 Abr 01:50", estado:"rejeitado", risco:98 },
  { id:"SQ-0037", nome:"Fátima Dique",  valor:2000,  taxa:40,   liquido:1960,  metodo:"Banco",   solicitado:"14 Abr 16:20", estado:"pago",      risco:22 },
  { id:"SQ-0036", nome:"Pedro Mabunda", valor:800,   taxa:16,   liquido:784,   metodo:"M-Pesa",  solicitado:"13 Abr 12:00", estado:"pago",      risco:31 },
];

const CARTEIRAS_MOCK = [
  { id:"W001", nome:"João Matos",    tipo:"Afiliado", disponivel:6800,  pendente:2400, bloqueado:0,    metodo:"M-Pesa",  estado:"ativo",    ultimaMov:"18 Abr" },
  { id:"W002", nome:"Ana Lopes",     tipo:"Afiliado", disponivel:4200,  pendente:1800, bloqueado:0,    metodo:"E-Mola",  estado:"ativo",    ultimaMov:"18 Abr" },
  { id:"W003", nome:"Carlos Nhaca",  tipo:"Vendedor", disponivel:18400, pendente:3200, bloqueado:0,    metodo:"M-Pesa",  estado:"ativo",    ultimaMov:"18 Abr" },
  { id:"W004", nome:"spam_afilX",    tipo:"Afiliado", disponivel:0,     pendente:0,    bloqueado:28000,metodo:"M-Pesa",  estado:"bloqueado",ultimaMov:"17 Abr" },
  { id:"W005", nome:"Fátima Dique",  tipo:"Vendedor", disponivel:9100,  pendente:700,  bloqueado:0,    metodo:"Banco",   estado:"ativo",    ultimaMov:"17 Abr" },
  { id:"W006", nome:"Pedro Mabunda", tipo:"Afiliado", disponivel:1300,  pendente:400,  bloqueado:0,    metodo:"M-Pesa",  estado:"ativo",    ultimaMov:"16 Abr" },
  { id:"W007", nome:"Plataforma",    tipo:"Sistema",  disponivel:380000,pendente:0,    bloqueado:0,    metodo:"Sistema", estado:"ativo",    ultimaMov:"18 Abr" },
];

const ALERTAS_MOCK = [
  { tipo:"fraude",    msg:"spam_afilX tentou saque de 28 000 MZN com score de risco 98",           hora:"17 Abr 02:14", acao:"Bloqueado automaticamente" },
  { tipo:"alto",      msg:"Saque de 12 000 MZN de João Matos aguarda aprovação manual",            hora:"16 Abr 11:00", acao:"Pendente" },
  { tipo:"reembolso", msg:"Pico de reembolsos: 4 reembolsos nas últimas 6h (acima do normal)",     hora:"17 Abr 17:00", acao:"Monitorizar" },
  { tipo:"saldo",     msg:"Saldo da plataforma caiu 8% em relação ao mês anterior",                hora:"18 Abr 08:00", acao:"Relatório gerado" },
];

const RECEITA_DIARIA = [
  { dia:"9 Abr", valor:42 },{ dia:"10 Abr", valor:38 },{ dia:"11 Abr", valor:55 },
  { dia:"12 Abr", valor:61 },{ dia:"13 Abr", valor:48 },{ dia:"14 Abr", valor:70 },
  { dia:"15 Abr", valor:88 },{ dia:"16 Abr", valor:65 },{ dia:"17 Abr", valor:92 },
  { dia:"18 Abr", valor:110 },
];

// ─── Reutilizáveis ────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width: size, height: size, stroke: color, fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 };
  const icons = {
    "dollar":         <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    "credit-card":    <svg style={s} viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    "link":           <svg style={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    "zap":            <svg style={s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    "trending-up":    <svg style={s} viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    "alert-triangle": <svg style={s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    "check":          <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    "x":              <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    "eye":            <svg style={s} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    "download":       <svg style={s} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    "settings":       <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    "shield":         <svg style={s} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "bar-chart":      <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    "search":         <svg style={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    "wallet":         <svg style={s} viewBox="0 0 24 24"><path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 002 2h14v-4"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>,
    "activity":       <svg style={s} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    "clock":          <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    "ban":            <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
    "lock":           <svg style={s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    "unlock":         <svg style={s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>,
    "refresh-cw":     <svg style={s} viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
    "file-text":      <svg style={s} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    "users":          <svg style={s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    "percent":        <svg style={s} viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    "inbox":          <svg style={s} viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
    "arrow-right":    <svg style={s} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    "toggle-right":   <svg style={s} viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3"/></svg>,
    "info":           <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    "edit":           <svg style={s} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    "split":          <svg style={s} viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 00-1.172-2.872L3 3M21 3l-7.828 8.828A4 4 0 0012 14.5V22"/></svg>,
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
    primary:   { bg: C.green,      color: "#fff",    border: "none" },
    secondary: { bg: "transparent",color: C.textSub, border: `1.5px solid ${C.border}` },
    danger:    { bg: C.red,        color: "#fff",    border: "none" },
    ghost:     { bg: C.greenMuted, color: C.green,   border: "none" },
    amber:     { bg: C.amberDim,   color: C.amber,   border: "none" },
    blue:      { bg: C.blueDim,    color: C.blue,    border: "none" },
  };
  const pad = size === "sm" ? "6px 12px" : "9px 18px";
  const fs  = size === "sm" ? 12 : 13;
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:pad, fontSize:fs, fontWeight:700, background:disabled?"#f1f5f9":s.bg, color:disabled?C.textMute:s.color, border:s.border||"none", borderRadius:8, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.6:1, whiteSpace:"nowrap", fontFamily:"inherit" }}>
      {icon && <Icon name={icon} size={13} color={disabled ? C.textMute : s.color} />}
      {label}
    </button>
  );
}

function Toggle({ label, active = false, onChange }) {
  const [on, setOn] = useState(active);
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
      <span style={{ fontSize:13, color:C.textSub, fontWeight:500 }}>{label}</span>
      <div onClick={() => { setOn(!on); onChange && onChange(!on); }}
        style={{ width:38, height:22, borderRadius:99, cursor:"pointer", background:on?C.green:C.border, position:"relative", transition:"background 0.2s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:3, left:on?19:3, width:16, height:16, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.18)", transition:"left 0.2s" }} />
      </div>
    </div>
  );
}

function Modal({ open, onClose, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}>
      <div style={{ background:C.card, borderRadius:18, width:"100%", maxWidth:width, boxShadow:"0 24px 80px rgba(0,0,0,0.18)", maxHeight:"90vh", overflowY:"auto" }}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBar({ data, color = C.green, height = 80 }) {
  const max = Math.max(...data.map(d => d.valor), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <div title={`${d.dia}: ${d.valor}k MZN`}
            style={{ width:"100%", height:`${Math.max(6, (d.valor/max)*100)}%`, background:i===data.length-1?color:color+"55", borderRadius:"3px 3px 0 0", transition:"height 0.3s" }} />
        </div>
      ))}
    </div>
  );
}

// ─── Split visual ─────────────────────────────────────────────────────────────
function SplitBar({ split, total }) {
  if (!split) return null;
  const vPct = Math.round((split.vendedor / total) * 100);
  const pPct = Math.round((split.plataforma / total) * 100);
  const aPct = Math.round((split.afiliado / total) * 100);
  return (
    <div style={{ display:"flex", gap:2, height:6, borderRadius:99, overflow:"hidden", width:"100%" }}>
      <div title={`Vendedor: ${split.vendedor.toLocaleString("pt-MZ")} MZN`} style={{ width:`${vPct}%`, background:C.blue, borderRadius:"99px 0 0 99px" }} />
      <div title={`Plataforma: ${split.plataforma.toLocaleString("pt-MZ")} MZN`} style={{ width:`${pPct}%`, background:C.green }} />
      <div title={`Afiliado: ${split.afiliado.toLocaleString("pt-MZ")} MZN`} style={{ width:`${aPct}%`, background:C.amber, borderRadius:"0 99px 99px 0" }} />
    </div>
  );
}

// ─── SUBTABS ──────────────────────────────────────────────────────────────────
const SUBTABS = [
  { id:"visao",      label:"Visão Geral",    icon:"bar-chart" },
  { id:"transacoes", label:"Transações",     icon:"activity" },
  { id:"saques",     label:"Saques",         icon:"inbox",    badge: true },
  { id:"carteiras",  label:"Carteiras",      icon:"wallet" },
  { id:"relatorios", label:"Relatórios",     icon:"file-text" },
  { id:"config",     label:"Configuração",   icon:"settings" },
  { id:"fraude",     label:"Fraude",         icon:"shield",   badgeDanger: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 1 — VISÃO GERAL
// ═══════════════════════════════════════════════════════════════════════════════
function SubVisaoGeral({ onNav }) {
  const receitaHoje = 110000;
  const receitaMes  = 2400000;
  const saldoPlat   = 380000;
  const pendenteSaques = SAQUES_MOCK.filter(s => s.estado === "pendente" || s.estado === "aprovado").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* KPIs principais */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
        <StatCard label="Receita Total (MZN)"   value="2.4M"    icon="dollar"       color={C.green}  trend={18.7} />
        <StatCard label="Saldo Plataforma"       value="380k"    icon="credit-card"  color={C.blue}   sub="MZN" />
        <StatCard label="Comissões Pagas"        value="148k"    icon="link"         color={C.amber}  trend={8.1} />
        <StatCard label="Taxas Cobradas"         value="240k"    icon="percent"      color={C.purple} />
        <StatCard label="GMV — Volume de Vendas" value="6.2M"    icon="trending-up"  color={C.green}  trend={22.3} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Receita diária */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
            <div>
              <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>📈 Receita — últimos 10 dias</h3>
              <p style={{ fontSize:12, color:C.textMute }}>Receita líquida diária (MZN '000)</p>
            </div>
            <Badge label={`Hoje: ${receitaHoje.toLocaleString("pt-MZ")} MZN`} type="success" />
          </div>
          <div style={{ marginTop:16 }}>
            <MiniBar data={RECEITA_DIARIA} height={90} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color:C.textMute }}>
            <span>9 Abr</span>
            {RECEITA_DIARIA.map((d,i) => i===9?<span key={i}>Hoje</span>:null)}
          </div>
          {/* Legenda simples dos dias */}
          <div style={{ marginTop:8, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[
                { label:"Ticket médio",    value:"1 240 MZN", color:C.blue },
                { label:"Vendas hoje",     value:"89",        color:C.green },
                { label:"Crescimento",     value:"+18.7%",    color:C.green },
              ].map((k,i) => (
                <div key={i} style={{ textAlign:"center", background:C.bg, borderRadius:8, padding:"8px 6px" }}>
                  <p style={{ fontSize:14, fontWeight:800, color:k.color }}>{k.value}</p>
                  <p style={{ fontSize:10, color:C.textMute, marginTop:2 }}>{k.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Split financeiro da plataforma */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>⚡ Split Automático</h3>
          <p style={{ fontSize:12, color:C.textMute, marginBottom:16 }}>Como cada venda é distribuída</p>

          {/* Exemplo de split */}
          <div style={{ background:C.bg, borderRadius:10, padding:16, marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.textSub }}>Exemplo: venda de 1 000 MZN (taxa 10%)</span>
              <Badge label="ACID" type="info" />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"Comprador paga", valor:"1 100 MZN", note:"incl. taxa 10%", color:C.text, bg:C.bg },
                { label:"Vendedor recebe", valor:"900 MZN",  note:"após comissão afiliado", color:C.blue, bg:C.blueDim },
                { label:"Plataforma retém", valor:"89 MZN",  note:"taxa líquida", color:C.green, bg:C.greenDim },
                { label:"Afiliado recebe", valor:"11 MZN",   note:"comissão 1,1%", color:C.amber, bg:C.amberDim },
              ].map((r,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 12px", background:r.bg, borderRadius:8 }}>
                  <div>
                    <span style={{ fontSize:13, fontWeight:600, color:r.color }}>{r.label}</span>
                    <span style={{ fontSize:11, color:C.textMute, marginLeft:6 }}>{r.note}</span>
                  </div>
                  <span style={{ fontSize:14, fontWeight:800, color:r.color }}>{r.valor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proporção visual */}
          <div style={{ marginBottom:6 }}>
            <p style={{ fontSize:11, color:C.textMute, marginBottom:6 }}>Distribuição de 1 100 MZN</p>
            <div style={{ display:"flex", gap:2, height:10, borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:"81.8%", background:C.blue }} title="Vendedor 81.8%" />
              <div style={{ width:"8.1%", background:C.green }} title="Plataforma 8.1%" />
              <div style={{ width:"1%", background:C.amber }} title="Afiliado 1%" />
              <div style={{ width:"9.1%", background:C.border }} title="Taxa bruta 9.1%" />
            </div>
            <div style={{ display:"flex", gap:12, marginTop:6, fontSize:10, color:C.textMute }}>
              <span><span style={{ display:"inline-block", width:8, height:8, borderRadius:2, background:C.blue, marginRight:3 }}/>Vendedor</span>
              <span><span style={{ display:"inline-block", width:8, height:8, borderRadius:2, background:C.green, marginRight:3 }}/>Plataforma</span>
              <span><span style={{ display:"inline-block", width:8, height:8, borderRadius:2, background:C.amber, marginRight:3 }}/>Afiliado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas em tempo real */}
      {ALERTAS_MOCK.length > 0 && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Icon name="alert-triangle" size={15} color={C.amber} />
              <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>🔔 Alertas em Tempo Real</h3>
            </div>
            <Badge label="4 ativos" type="warning" />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {ALERTAS_MOCK.map((a,i) => {
              const tipoMap = { fraude:"danger", alto:"warning", reembolso:"info", saldo:"warning" };
              const iconeMap = { fraude:"ban", alto:"inbox", reembolso:"refresh-cw", saldo:"trending-up" };
              const cor = { danger:C.red, warning:C.amber, info:C.blue }[tipoMap[a.tipo]] || C.textSub;
              return (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0", borderBottom:i<3?`1px solid ${C.border}`:"none" }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:cor+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon name={iconeMap[a.tipo]} size={14} color={cor} />
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, color:C.text, fontWeight:500, lineHeight:1.5 }}>{a.msg}</p>
                    <p style={{ fontSize:11, color:C.textMute, marginTop:2 }}>{a.hora} · {a.acao}</p>
                  </div>
                  <Badge label={a.tipo === "fraude" ? "Crítico" : a.tipo === "alto" ? "Alto" : "Info"} type={tipoMap[a.tipo]} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumo gateways + saques pendentes */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>💳 Gateways de Pagamento</h3>
          {["M-Pesa","E-Mola","mKesh","Banco BCI","Banco BIM"].map((g,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<4?`1px solid ${C.border}`:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:i<4?C.green:C.textMute }} />
                <span style={{ fontSize:13, fontWeight:500, color:C.text }}>{g}</span>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <Badge label={i<4?"Ativo":"Config"} type={i<4?"success":"default"} />
                <Btn label="Config" size="sm" variant="secondary" />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>📤 Saques Pendentes</h3>
            <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99, background:C.amberDim, color:C.amber }}>{pendenteSaques} pendente(s)</span>
          </div>
          {SAQUES_MOCK.filter(s=>s.estado==="pendente"||s.estado==="aprovado").map((s,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{s.nome}</p>
                <p style={{ fontSize:11, color:C.textMute }}>{s.metodo} · {s.solicitado}</p>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <span style={{ fontSize:14, fontWeight:800, color:C.amber }}>{s.valor.toLocaleString("pt-MZ")} MZN</span>
                <Btn label="Aprovar" icon="check" size="sm" variant="ghost" onClick={() => onNav("saques")} />
              </div>
            </div>
          ))}
          <div style={{ marginTop:10 }}>
            <Btn label="Ver todos os saques" icon="arrow-right" variant="secondary" size="sm" onClick={() => onNav("saques")} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 2 — TRANSAÇÕES
// ═══════════════════════════════════════════════════════════════════════════════
function SubTransacoes() {
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [txDetalhe, setTxDetalhe] = useState(null);

  const lista = TRANSACOES_MOCK.filter(t => {
    const ok1 = filtroTipo === "todos" || t.tipo.toLowerCase() === filtroTipo;
    const ok2 = filtroEstado === "todos" || t.estado === filtroEstado;
    const ok3 = t.id.toLowerCase().includes(busca.toLowerCase()) || t.de.toLowerCase().includes(busca.toLowerCase()) || t.para.toLowerCase().includes(busca.toLowerCase());
    return ok1 && ok2 && ok3;
  });

  const estadoCor = { concluido:"success", pendente:"warning", bloqueado:"danger", aprovado:"info" };
  const tipoCor = { Venda:C.green, Comissão:C.amber, Levantamento:C.blue, Reembolso:C.purple, Suspeito:C.red };

  const totalEntradas = lista.filter(t=>t.tipo==="Venda").reduce((s,t)=>s+t.valor,0);
  const totalSaidas = lista.filter(t=>t.tipo==="Levantamento"||t.tipo==="Reembolso").reduce((s,t)=>s+t.valor,0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <StatCard label="Total transações" value={TRANSACOES_MOCK.length} icon="activity" color={C.blue} />
        <StatCard label="Entradas (MZN)"   value={totalEntradas.toLocaleString("pt-MZ")} icon="trending-up" color={C.green} />
        <StatCard label="Saídas (MZN)"     value={totalSaidas.toLocaleString("pt-MZ")} icon="inbox" color={C.amber} />
        <StatCard label="Bloqueadas"        value={TRANSACOES_MOCK.filter(t=>t.estado==="bloqueado").length} icon="ban" color={C.red} />
      </div>

      {/* Filtros */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:16, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><Icon name="search" size={14} color={C.textMute} /></span>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Pesquisar por ID, remetente ou destinatário..."
            style={{ width:"100%", padding:"8px 12px 8px 32px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", color:C.text, background:C.bg, outline:"none", boxSizing:"border-box" }} />
        </div>
        <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)}
          style={{ padding:"8px 12px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:8, color:C.text, background:C.bg, fontFamily:"inherit" }}>
          {[["todos","Todos os tipos"],["venda","Venda"],["comissão","Comissão"],["levantamento","Levantamento"],["reembolso","Reembolso"],["suspeito","Suspeito"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filtroEstado} onChange={e=>setFiltroEstado(e.target.value)}
          style={{ padding:"8px 12px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:8, color:C.text, background:C.bg, fontFamily:"inherit" }}>
          {[["todos","Todos os estados"],["concluido","Concluído"],["pendente","Pendente"],["aprovado","Aprovado"],["bloqueado","Bloqueado"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
        <Btn label="Exportar" icon="download" variant="secondary" size="sm" />
      </div>

      {/* Tabela */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`1.5px solid ${C.border}`, background:C.bg }}>
                {["ID","Tipo","Valor (MZN)","De → Para","Gateway","Split","Data","Estado","Ação"].map((c,i)=>(
                  <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:C.textMute, whiteSpace:"nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((t,i) => (
                <tr key={t.id} style={{ borderBottom:`1px solid ${C.border}` }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"11px 14px", fontFamily:"monospace", fontSize:12, color:C.textSub, fontWeight:600 }}>{t.id}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:tipoCor[t.tipo]||C.textMute, flexShrink:0 }} />
                      <span style={{ fontWeight:600, color:C.text }}>{t.tipo}</span>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:t.tipo==="Reembolso"?C.red:t.estado==="bloqueado"?C.red:C.text }}>
                    {t.tipo==="Reembolso"?"−":""}{t.valor.toLocaleString("pt-MZ")}
                  </td>
                  <td style={{ padding:"11px 14px", color:C.textSub, fontSize:12 }}>{t.de} → {t.para}</td>
                  <td style={{ padding:"11px 14px" }}><Badge label={t.gateway} type="default" /></td>
                  <td style={{ padding:"11px 14px", minWidth:90 }}>
                    {t.split
                      ? <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                          <SplitBar split={t.split} total={t.valor} />
                          <span style={{ fontSize:10, color:C.textMute }}>V/P/A</span>
                        </div>
                      : <span style={{ color:C.textMute, fontSize:11 }}>—</span>
                    }
                  </td>
                  <td style={{ padding:"11px 14px", color:C.textSub, fontSize:12, whiteSpace:"nowrap" }}>{t.data}</td>
                  <td style={{ padding:"11px 14px" }}><Badge label={t.estado.charAt(0).toUpperCase()+t.estado.slice(1)} type={estadoCor[t.estado]||"default"} /></td>
                  <td style={{ padding:"11px 14px" }}>
                    <Btn label="Ver" icon="eye" size="sm" variant="ghost" onClick={()=>setTxDetalhe(t)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${C.border}`, fontSize:12, color:C.textMute, display:"flex", justifyContent:"space-between" }}>
          <span>Mostrando {lista.length} de {TRANSACOES_MOCK.length} transações</span>
          <span>Cada venda é registada com IP, ID único e garantia ACID</span>
        </div>
      </div>

      {/* Modal detalhe transação */}
      <Modal open={!!txDetalhe} onClose={()=>setTxDetalhe(null)} width={500}>
        {txDetalhe && (
          <div style={{ padding:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <h3 style={{ fontSize:16, fontWeight:800, color:C.text }}>{txDetalhe.id}</h3>
                <p style={{ fontSize:12, color:C.textMute, marginTop:2 }}>{txDetalhe.data}</p>
              </div>
              <Badge label={txDetalhe.estado.charAt(0).toUpperCase()+txDetalhe.estado.slice(1)} type={txDetalhe.estado==="concluido"?"success":txDetalhe.estado==="bloqueado"?"danger":"warning"} />
            </div>
            {[
              ["Tipo",       txDetalhe.tipo],
              ["Valor",      `${txDetalhe.valor.toLocaleString("pt-MZ")} MZN`],
              ["Remetente",  txDetalhe.de],
              ["Destinatário",txDetalhe.para],
              ["Gateway",    txDetalhe.gateway],
              ["Data",       txDetalhe.data],
              ["IP Registo", "197.220.xxx.xxx (Maputo)"],
              ["Ref. interna","REF-"+txDetalhe.id],
            ].map(([k,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:12, color:C.textMute, fontWeight:500 }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{v}</span>
              </div>
            ))}
            {txDetalhe.split && (
              <div style={{ marginTop:16, background:C.bg, borderRadius:10, padding:14 }}>
                <p style={{ fontSize:12, fontWeight:700, color:C.textSub, marginBottom:10 }}>Split automático</p>
                {[
                  ["Vendedor", txDetalhe.split.vendedor, C.blue],
                  ["Plataforma", txDetalhe.split.plataforma, C.green],
                  ["Afiliado", txDetalhe.split.afiliado, C.amber],
                ].map(([k,v,cor],i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:C.textSub }}>{k}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:cor }}>{v.toLocaleString("pt-MZ")} MZN</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop:20, display:"flex", gap:8 }}>
              <Btn label="Fechar" variant="secondary" onClick={()=>setTxDetalhe(null)} />
              {txDetalhe.estado === "pendente" && <Btn label="Aprovar" icon="check" variant="ghost" />}
              {(txDetalhe.estado === "pendente" || txDetalhe.tipo === "Suspeito") && <Btn label="Bloquear" icon="ban" variant="danger" />}
              <Btn label="Exportar comprovativo" icon="download" variant="secondary" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 3 — SAQUES / CASHOUT
// ═══════════════════════════════════════════════════════════════════════════════
function SubSaques() {
  const [saques, setSaques] = useState(SAQUES_MOCK);
  const [filtro, setFiltro] = useState("todos");
  const [modalOTP, setModalOTP] = useState(null);
  const [otp, setOtp] = useState("");

  const lista = filtro === "todos" ? saques : saques.filter(s=>s.estado===filtro);
  const totalPendente = saques.filter(s=>s.estado==="pendente").reduce((sum,s)=>sum+s.valor,0);

  const aprovar = (id) => {
    setSaques(prev => prev.map(s => s.id===id ? {...s, estado:"aprovado"} : s));
    setModalOTP(null);
    setOtp("");
  };
  const rejeitar = (id) => setSaques(prev => prev.map(s => s.id===id ? {...s, estado:"rejeitado"} : s));
  const pagar = (id) => setSaques(prev => prev.map(s => s.id===id ? {...s, estado:"pago"} : s));

  const estadoCor = { pendente:"warning", aprovado:"info", pago:"success", rejeitado:"danger" };
  const riscoColor = (r) => r >= 70 ? C.red : r >= 40 ? C.amber : C.green;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <StatCard label="Pendentes"         value={saques.filter(s=>s.estado==="pendente").length} icon="clock"  color={C.amber} />
        <StatCard label="Total Pendente"    value={`${(totalPendente/1000).toFixed(0)}k MZN`} icon="dollar" color={C.amber} />
        <StatCard label="Pagos este mês"    value={saques.filter(s=>s.estado==="pago").length} icon="check"  color={C.green} />
        <StatCard label="Rejeitados"        value={saques.filter(s=>s.estado==="rejeitado").length} icon="x"  color={C.red} />
      </div>

      {/* Alerta saque grande pendente */}
      {saques.some(s=>s.estado==="pendente"&&s.valor>=10000) && (
        <div style={{ background:C.amberDim, border:`1.5px solid ${C.amber}30`, borderRadius:12, padding:14, display:"flex", alignItems:"center", gap:10 }}>
          <Icon name="alert-triangle" size={16} color={C.amber} />
          <p style={{ fontSize:13, color:C.amber, fontWeight:600 }}>⚠️ Há saques de valor elevado (≥10 000 MZN) pendentes. Requerem aprovação dupla + OTP.</p>
        </div>
      )}

      {/* Filtro */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:14, display:"flex", gap:10, alignItems:"center" }}>
        <Icon name="inbox" size={14} color={C.textMute} />
        <span style={{ fontSize:13, color:C.textSub, fontWeight:500 }}>Filtrar:</span>
        {[["todos","Todos"],["pendente","Pendentes"],["aprovado","Aprovados"],["pago","Pagos"],["rejeitado","Rejeitados"]].map(([v,l]) => (
          <button key={v} onClick={()=>setFiltro(v)}
            style={{ padding:"5px 14px", fontSize:12, fontWeight:600, borderRadius:7, border:"none", cursor:"pointer", background:filtro===v?C.green:"transparent", color:filtro===v?"#fff":C.textSub, fontFamily:"inherit" }}>
            {l}
          </button>
        ))}
        <div style={{ marginLeft:"auto" }}>
          <Btn label="Exportar" icon="download" size="sm" variant="secondary" />
        </div>
      </div>

      {/* Tabela de saques */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`1.5px solid ${C.border}`, background:C.bg }}>
                {["ID","Utilizador","Valor","Taxa (2%)","Líquido","Método","Solicitado","Risco","Estado","Ações"].map((c,i)=>(
                  <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:C.textMute, whiteSpace:"nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((s,i) => (
                <tr key={s.id} style={{ borderBottom:`1px solid ${C.border}` }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"11px 14px", fontFamily:"monospace", fontSize:12, color:C.textSub }}>{s.id}</td>
                  <td style={{ padding:"11px 14px", fontWeight:700, color:C.text }}>{s.nome}</td>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:C.text }}>{s.valor.toLocaleString("pt-MZ")} MZN</td>
                  <td style={{ padding:"11px 14px", color:C.red, fontWeight:600 }}>−{s.taxa.toLocaleString("pt-MZ")}</td>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:C.green }}>{s.liquido.toLocaleString("pt-MZ")} MZN</td>
                  <td style={{ padding:"11px 14px" }}><Badge label={s.metodo} type="default" /></td>
                  <td style={{ padding:"11px 14px", color:C.textSub, fontSize:12, whiteSpace:"nowrap" }}>{s.solicitado}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:12, fontWeight:700, color:riscoColor(s.risco) }}>{s.risco >= 70 ? "🚨" : s.risco >= 40 ? "⚠️" : "✅"} {s.risco}</span>
                  </td>
                  <td style={{ padding:"11px 14px" }}><Badge label={s.estado.charAt(0).toUpperCase()+s.estado.slice(1)} type={estadoCor[s.estado]} /></td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:4 }}>
                      {s.estado === "pendente" && (
                        <>
                          <Btn label="Aprovar" icon="check" size="sm" variant="ghost" onClick={()=>s.valor>=10000?setModalOTP(s):aprovar(s.id)} />
                          <Btn label="Rejeitar" icon="x" size="sm" variant="secondary" onClick={()=>rejeitar(s.id)} />
                        </>
                      )}
                      {s.estado === "aprovado" && (
                        <Btn label="Marcar pago" icon="check" size="sm" variant="primary" onClick={()=>pagar(s.id)} />
                      )}
                      {(s.estado === "pago" || s.estado === "rejeitado") && (
                        <Btn label="Comprovativo" icon="file-text" size="sm" variant="secondary" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.border}`, fontSize:11, color:C.textMute }}>
          Saque mínimo: 500 MZN · Taxa: 2% · OTP obrigatório para saques ≥10 000 MZN · Processamento em 1-3 dias úteis
        </div>
      </div>

      {/* Modal OTP aprovação */}
      <Modal open={!!modalOTP} onClose={()=>setModalOTP(null)} width={400}>
        {modalOTP && (
          <div style={{ padding:24 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:C.amberDim, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
              <Icon name="lock" size={22} color={C.amber} />
            </div>
            <h3 style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:4 }}>Aprovação com OTP</h3>
            <p style={{ fontSize:13, color:C.textSub, marginBottom:20 }}>
              Saque de <strong>{modalOTP.valor.toLocaleString("pt-MZ")} MZN</strong> para <strong>{modalOTP.nome}</strong> requer verificação.<br/>
              Código enviado para o email do administrador.
            </p>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.textMute, textTransform:"uppercase", display:"block", marginBottom:6 }}>Código OTP (6 dígitos)</label>
              <input type="text" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} placeholder="000000"
                style={{ width:"100%", padding:"12px 14px", fontSize:22, fontWeight:800, letterSpacing:"0.3em", textAlign:"center", border:`2px solid ${otp.length===6?C.green:C.border}`, borderRadius:8, fontFamily:"monospace", color:C.text, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ padding:"10px 12px", background:C.amberDim, borderRadius:8, fontSize:12, color:C.amber, fontWeight:500, marginBottom:20 }}>
              🔐 Esta ação ficará registada no log de auditoria com timestamp e IP.
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn label="Cancelar" variant="secondary" onClick={()=>setModalOTP(null)} />
              <Btn label="Confirmar aprovação" variant="primary" disabled={otp.length!==6} onClick={()=>aprovar(modalOTP.id)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 4 — CARTEIRAS
// ═══════════════════════════════════════════════════════════════════════════════
function SubCarteiras() {
  const [carteiras, setCarteiras] = useState(CARTEIRAS_MOCK);
  const [modalBloquear, setModalBloquear] = useState(null);
  const [busca, setBusca] = useState("");

  const lista = carteiras.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));
  const totalPlataforma = carteiras.find(c=>c.tipo==="Sistema")?.disponivel || 0;
  const totalUsuarios = carteiras.filter(c=>c.tipo!=="Sistema").reduce((s,c)=>s+c.disponivel+c.pendente,0);

  const bloquear = (id) => {
    setCarteiras(prev => prev.map(c => c.id===id ? {...c, estado:"bloqueado", bloqueado:c.disponivel+c.pendente, disponivel:0, pendente:0} : c));
    setModalBloquear(null);
  };
  const desbloquear = (id) => setCarteiras(prev => prev.map(c => c.id===id ? {...c, estado:"ativo"} : c));

  const tipoCor = { Afiliado:C.purple, Vendedor:C.blue, Sistema:C.green };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <StatCard label="Total Carteiras"         value={carteiras.length}                        icon="wallet"       color={C.blue} />
        <StatCard label="Saldo Plataforma (MZN)"  value={`${(totalPlataforma/1000).toFixed(0)}k`} icon="credit-card"  color={C.green} />
        <StatCard label="Saldo Usuários (MZN)"    value={`${(totalUsuarios/1000).toFixed(0)}k`}   icon="users"        color={C.blue} />
        <StatCard label="Bloqueadas"               value={carteiras.filter(c=>c.estado==="bloqueado").length} icon="ban" color={C.red} />
      </div>

      {/* Separação plataforma vs utilizadores */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>🔒 Separação Financeira (Ledger)</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {[
            { label:"Dinheiro da Plataforma",  valor:totalPlataforma, note:"Receita própria", color:C.green, icon:"zap" },
            { label:"Dinheiro dos Utilizadores",valor:totalUsuarios,  note:"Fundos de terceiros", color:C.blue, icon:"users" },
            { label:"Fundos Bloqueados",        valor:carteiras.reduce((s,c)=>s+c.bloqueado,0), note:"Em investigação", color:C.red, icon:"lock" },
          ].map((k,i) => (
            <div key={i} style={{ background:k.color+"0f", border:`1.5px solid ${k.color}20`, borderRadius:12, padding:16, textAlign:"center" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:k.color+"18", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                <Icon name={k.icon} size={16} color={k.color} />
              </div>
              <p style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.valor.toLocaleString("pt-MZ")} MZN</p>
              <p style={{ fontSize:12, fontWeight:600, color:C.text, marginTop:4 }}>{k.label}</p>
              <p style={{ fontSize:11, color:C.textMute }}>{k.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtro pesquisa */}
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ position:"relative", flex:1 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><Icon name="search" size={14} color={C.textMute} /></span>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Pesquisar carteira por nome..."
            style={{ width:"100%", padding:"8px 12px 8px 32px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", color:C.text, background:C.card, outline:"none", boxSizing:"border-box" }} />
        </div>
        <Btn label="Exportar" icon="download" variant="secondary" size="sm" />
      </div>

      {/* Tabela de carteiras */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`1.5px solid ${C.border}`, background:C.bg }}>
                {["Utilizador","Tipo","Disponível","Pendente","Bloqueado","Método","Última Mov.","Estado","Ações"].map((c,i) => (
                  <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:C.textMute, whiteSpace:"nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((c,i) => (
                <tr key={c.id} style={{ borderBottom:`1px solid ${C.border}`, background:c.estado==="bloqueado"?C.redDim+"80":"transparent" }}
                  onMouseEnter={e=>{ if(c.estado!=="bloqueado") e.currentTarget.style.background=C.bg }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=c.estado==="bloqueado"?C.redDim+"80":"transparent" }}>
                  <td style={{ padding:"11px 14px", fontWeight:700, color:C.text }}>{c.nome}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:99, background:(tipoCor[c.tipo]||C.textMute)+"18", color:tipoCor[c.tipo]||C.textMute }}>
                      {c.tipo}
                    </span>
                  </td>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:C.green }}>{c.disponivel.toLocaleString("pt-MZ")} MZN</td>
                  <td style={{ padding:"11px 14px", fontWeight:600, color:C.amber }}>{c.pendente.toLocaleString("pt-MZ")} MZN</td>
                  <td style={{ padding:"11px 14px", fontWeight:600, color:c.bloqueado>0?C.red:C.textMute }}>
                    {c.bloqueado > 0 ? `${c.bloqueado.toLocaleString("pt-MZ")} MZN` : "—"}
                  </td>
                  <td style={{ padding:"11px 14px" }}><Badge label={c.metodo} type="default" /></td>
                  <td style={{ padding:"11px 14px", color:C.textSub, fontSize:12 }}>{c.ultimaMov}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <Badge label={c.estado === "ativo" ? "Ativo" : "Bloqueado"} type={c.estado === "ativo" ? "success" : "danger"} />
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    {c.tipo !== "Sistema" && (
                      c.estado === "ativo"
                        ? <Btn label="Bloquear" icon="lock" size="sm" variant="danger" onClick={()=>setModalBloquear(c)} />
                        : <Btn label="Desbloquear" icon="unlock" size="sm" variant="secondary" onClick={()=>desbloquear(c.id)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal bloquear carteira */}
      <Modal open={!!modalBloquear} onClose={()=>setModalBloquear(null)} width={400}>
        {modalBloquear && (
          <div style={{ padding:24 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:C.redDim, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
              <Icon name="lock" size={22} color={C.red} />
            </div>
            <h3 style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:6 }}>Bloquear carteira?</h3>
            <p style={{ fontSize:13, color:C.textSub, marginBottom:4 }}>
              A carteira de <strong>{modalBloquear.nome}</strong> será bloqueada. Todo o saldo ({(modalBloquear.disponivel+modalBloquear.pendente).toLocaleString("pt-MZ")} MZN) fica congelado.
            </p>
            <p style={{ fontSize:12, color:C.red, fontWeight:600, marginBottom:20 }}>Ação registada no log de auditoria com timestamp, IP e admin responsável.</p>
            <div style={{ display:"flex", gap:8 }}>
              <Btn label="Cancelar" variant="secondary" onClick={()=>setModalBloquear(null)} />
              <Btn label="Bloquear carteira" icon="lock" variant="danger" onClick={()=>bloquear(modalBloquear.id)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 5 — RELATÓRIOS
// ═══════════════════════════════════════════════════════════════════════════════
function SubRelatorios() {
  const [periodo, setPeriodo] = useState("mensal");
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [relatorioGerado, setRelatorioGerado] = useState(false);

  const gerarRelatorio = () => {
    setGerandoPDF(true);
    setTimeout(() => { setGerandoPDF(false); setRelatorioGerado(true); }, 2000);
  };

  const METRICAS = [
    { label:"GMV (Volume Total)",      valor:"6.200.000",  unidade:"MZN", trend:22.3,  icon:"trending-up", color:C.green },
    { label:"Receita Líquida",         valor:"2.400.000",  unidade:"MZN", trend:18.7,  icon:"dollar",      color:C.green },
    { label:"Lucro Operacional",       valor:"1.920.000",  unidade:"MZN", trend:14.2,  icon:"bar-chart",   color:C.blue },
    { label:"Comissões Afiliados",     valor:"148.000",    unidade:"MZN", trend:-2.1,  icon:"link",        color:C.amber },
    { label:"Taxa de Reembolso",       valor:"2.4",        unidade:"%",   trend:-0.3,  icon:"refresh-cw",  color:C.purple },
    { label:"Ticket Médio",            valor:"1.240",      unidade:"MZN", trend:5.8,   icon:"activity",    color:C.blue },
  ];

  const RELATORIOS_AUTO = [
    { nome:"Relatório Diário — 18 Abr", tamanho:"234 KB", gerado:"Hoje 00:01", tipo:"PDF" },
    { nome:"Relatório Mensal — Abr 2025", tamanho:"1.2 MB", gerado:"1 Abr 00:01", tipo:"PDF" },
    { nome:"Exportação Excel — Abr 2025", tamanho:"892 KB", gerado:"1 Abr 00:05", tipo:"XLSX" },
    { nome:"Relatório Fiscal AT — Q1 2025", tamanho:"2.1 MB", gerado:"1 Abr 08:00", tipo:"PDF" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Métricas do período */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>📊 Métricas do Período</h3>
          <div style={{ display:"flex", gap:4, background:"#f1f5f9", padding:3, borderRadius:10 }}>
            {[["diario","Diário"],["mensal","Mensal"],["anual","Anual"]].map(([v,l]) => (
              <button key={v} onClick={()=>setPeriodo(v)}
                style={{ padding:"5px 14px", fontSize:12, fontWeight:600, borderRadius:8, border:"none", cursor:"pointer", background:periodo===v?C.card:"transparent", color:periodo===v?C.text:C.textSub, fontFamily:"inherit", boxShadow:periodo===v?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {METRICAS.map((m,i) => (
            <div key={i} style={{ background:C.bg, borderRadius:10, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontSize:11, color:C.textMute, fontWeight:500, marginBottom:4 }}>{m.label}</p>
                <p style={{ fontSize:18, fontWeight:800, color:C.text }}>{m.valor} <span style={{ fontSize:12, fontWeight:500, color:C.textSub }}>{m.unidade}</span></p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:m.color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon name={m.icon} size={14} color={m.color} />
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:m.trend>0?C.green:C.red }}>
                  {m.trend>0?"+":""}{m.trend}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendas por categoria */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>🏷️ Vendas por Categoria</h3>
          {[
            { nome:"Eletrónicos",  valor:2100000, pct:34 },
            { nome:"Moda",         valor:1550000, pct:25 },
            { nome:"Casa & Deco",  valor:930000,  pct:15 },
            { nome:"Serviços",     valor:744000,  pct:12 },
            { nome:"Outros",       valor:876000,  pct:14 },
          ].map((c,i) => (
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{c.nome}</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.green }}>{(c.valor/1000000).toFixed(1)}M MZN</span>
              </div>
              <div style={{ height:6, background:C.border, borderRadius:99 }}>
                <div style={{ height:"100%", width:`${c.pct}%`, background:[C.blue,C.green,C.amber,C.purple,C.textMute][i], borderRadius:99 }} />
              </div>
              <p style={{ fontSize:10, color:C.textMute, marginTop:2 }}>{c.pct}% do total</p>
            </div>
          ))}
        </div>

        {/* Gerar relatório */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>📄 Gerar Relatório</h3>

          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            {[
              { label:"Tipo de relatório", options:["Diário","Semanal","Mensal","Anual","Fiscal (AT)"] },
              { label:"Formato de exportação", options:["PDF","Excel (XLSX)","Ambos"] },
              { label:"Período", options:["Abril 2025","Março 2025","Q1 2025","2024 Completo"] },
            ].map((f,i) => (
              <div key={i}>
                <label style={{ fontSize:11, fontWeight:600, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:4 }}>{f.label}</label>
                <select style={{ width:"100%", padding:"8px 10px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", color:C.text, background:C.bg }}>
                  {f.options.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <Btn label={gerandoPDF?"A gerar...":"Gerar Relatório"} icon={gerandoPDF?"clock":"file-text"} variant="primary" disabled={gerandoPDF} onClick={gerarRelatorio} />

          {relatorioGerado && (
            <div style={{ marginTop:12, padding:"10px 14px", background:C.greenDim, borderRadius:8, display:"flex", alignItems:"center", gap:8 }}>
              <Icon name="check" size={14} color={C.green} />
              <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Relatório gerado com sucesso!</span>
              <Btn label="Download" icon="download" size="sm" variant="ghost" onClick={()=>setRelatorioGerado(false)} />
            </div>
          )}

          <div style={{ marginTop:20, borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>📁 Relatórios Automáticos</h3>
            {RELATORIOS_AUTO.map((r,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<3?`1px solid ${C.border}`:"none" }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:C.text }}>{r.nome}</p>
                  <p style={{ fontSize:11, color:C.textMute }}>{r.tamanho} · {r.gerado}</p>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <Badge label={r.tipo} type={r.tipo==="PDF"?"danger":"success"} />
                  <Btn label="Download" icon="download" size="sm" variant="secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conformidade AT */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <Icon name="shield" size={15} color={C.blue} />
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>🇲🇿 Conformidade Legal — Autoridade Tributária</h3>
          <Badge label="Moçambique" type="info" />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { label:"IVA cobrado",           valor:"336 000 MZN", estado:"OK", note:"17% aplicado" },
            { label:"IRPS retido na fonte",  valor:"48 000 MZN",  estado:"OK", note:"20% prestadores" },
            { label:"Relatório fiscal Q1",   valor:"Gerado",      estado:"OK", note:"Submetido AT" },
            { label:"Próxima submissão AT",  valor:"30 Jun 2025", estado:"PENDENTE", note:"Q2 2025" },
          ].map((k,i) => (
            <div key={i} style={{ background:C.bg, borderRadius:10, padding:"12px 14px" }}>
              <p style={{ fontSize:12, fontWeight:700, color:k.estado==="OK"?C.green:C.amber }}>{k.valor}</p>
              <p style={{ fontSize:12, fontWeight:600, color:C.text, marginTop:4 }}>{k.label}</p>
              <p style={{ fontSize:11, color:C.textMute, marginTop:2 }}>{k.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 6 — CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════
function SubConfig() {
  const [taxas, setTaxas] = useState({ produto:10, servico:8, saque:2, minSaque:500, liberacao:3 });
  const [modalOTP, setModalOTP] = useState(false);
  const [campoEditando, setCampoEditando] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [salvo, setSalvo] = useState(null);

  const pedirOTP = (campo) => { setCampoEditando(campo); setModalOTP(true); setOtpCode(""); };
  const confirmarOTP = () => { setSalvo(campoEditando); setModalOTP(false); setTimeout(()=>setSalvo(null),3000); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Taxas */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <Icon name="percent" size={15} color={C.green} />
            <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>⚙️ Configuração de Taxas</h3>
          </div>
          {[
            { campo:"produto",   label:"Taxa por venda de produto (%)",     tipo:"%" },
            { campo:"servico",   label:"Taxa por venda de serviço (%)",     tipo:"%" },
            { campo:"saque",     label:"Taxa de levantamento / cashout (%)", tipo:"%" },
            { campo:"minSaque",  label:"Valor mínimo de saque (MZN)",       tipo:"MZN" },
            { campo:"liberacao", label:"Tempo de liberação de saldo (dias)", tipo:"dias" },
          ].map((f,i) => (
            <div key={i} style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:600, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:5 }}>{f.label}</label>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input
                  type="number"
                  value={taxas[f.campo]}
                  onChange={e=>setTaxas(prev=>({...prev,[f.campo]:e.target.value}))}
                  style={{ flex:1, padding:"8px 12px", fontSize:14, fontWeight:700, border:`1.5px solid ${salvo===f.campo?C.green:C.border}`, borderRadius:8, fontFamily:"inherit", color:C.text, background:C.bg, outline:"none" }} />
                <span style={{ fontSize:12, color:C.textMute, minWidth:30 }}>{f.tipo}</span>
                <Btn label="Guardar" size="sm" variant="ghost" onClick={()=>pedirOTP(f.campo)} />
              </div>
              {salvo === f.campo && (
                <p style={{ fontSize:11, color:C.green, marginTop:3, fontWeight:600 }}>✅ Guardado com sucesso</p>
              )}
            </div>
          ))}
          <div style={{ marginTop:8, padding:"10px 12px", background:C.amberDim, borderRadius:8, fontSize:12, color:C.amber, fontWeight:500 }}>
            🔐 Alterações financeiras requerem OTP por email + registo no log de auditoria
          </div>
        </div>

        {/* Automações e regras */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>🤖 Automações Financeiras</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <Toggle label="Aprovar saques pequenos (<500 MZN) automaticamente" active={true} />
              <Toggle label="Pagar afiliados automaticamente (nível Ouro/Prata)"  active={true} />
              <Toggle label="Gerar relatórios diários automáticos"               active={true} />
              <Toggle label="Bloquear contas suspeitas automaticamente"           active={true} />
              <Toggle label="Alerta de fraude por email"                          active={true} />
              <Toggle label="Calcular e reter IVA automaticamente"               active={true} />
              <Toggle label="Aplicar cashback em compras acima de 2 000 MZN"     active={false} />
            </div>
          </div>

          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>🏦 Comissões de Afiliados</h3>
            {[
              { nivel:"🥉 Bronze", min:"5%", max:"10%", prazo:"7 dias" },
              { nivel:"🥈 Prata",  min:"11%", max:"20%", prazo:"5 dias" },
              { nivel:"🥇 Ouro",   min:"21%", max:"30%", prazo:"3 dias" },
            ].map((n,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<2?`1px solid ${C.border}`:"none" }}>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{n.nivel}</span>
                <div style={{ display:"flex", gap:8 }}>
                  <Badge label={`${n.min}–${n.max}`} type="success" />
                  <Badge label={`Lib. ${n.prazo}`} type="default" />
                  <Btn label="Editar" icon="edit" size="sm" variant="secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segurança financeira */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <Icon name="shield" size={15} color={C.purple} />
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>🛡️ Segurança Financeira (Nível Fintech)</h3>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[
            { label:"OTP por email",          estado:"Ativo", icon:"lock",    color:C.green },
            { label:"2FA (recomendado)",       estado:"Config",icon:"shield",  color:C.amber },
            { label:"Logs imutáveis",          estado:"Ativo", icon:"file-text",color:C.green },
            { label:"Anti-fraude automático",  estado:"Ativo", icon:"ban",     color:C.green },
            { label:"Encriptação AES-256",     estado:"Ativo", icon:"lock",    color:C.green },
            { label:"Scoring de risco",        estado:"Ativo", icon:"activity",color:C.green },
          ].map((k,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:C.bg, borderRadius:10, border:`1px solid ${k.color}20` }}>
              <div style={{ width:30, height:30, borderRadius:8, background:k.color+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name={k.icon} size={14} color={k.color} />
              </div>
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:C.text }}>{k.label}</p>
                <Badge label={k.estado} type={k.estado==="Ativo"?"success":"warning"} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal OTP config */}
      <Modal open={modalOTP} onClose={()=>setModalOTP(false)} width={380}>
        <div style={{ padding:24 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:C.amberDim, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
            <Icon name="lock" size={20} color={C.amber} />
          </div>
          <h3 style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:6 }}>Confirmar alteração</h3>
          <p style={{ fontSize:13, color:C.textSub, marginBottom:20 }}>Insira o código OTP enviado para o seu email de administrador.</p>
          <input type="text" maxLength={6} value={otpCode} onChange={e=>setOtpCode(e.target.value.replace(/\D/g,""))} placeholder="000000"
            style={{ width:"100%", padding:"12px 14px", fontSize:22, fontWeight:800, letterSpacing:"0.3em", textAlign:"center", border:`2px solid ${otpCode.length===6?C.green:C.border}`, borderRadius:8, fontFamily:"monospace", color:C.text, outline:"none", boxSizing:"border-box", marginBottom:16 }} />
          <div style={{ display:"flex", gap:8 }}>
            <Btn label="Cancelar" variant="secondary" onClick={()=>setModalOTP(false)} />
            <Btn label="Confirmar" variant="primary" disabled={otpCode.length!==6} onClick={confirmarOTP} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 7 — FRAUDE FINANCEIRA
// ═══════════════════════════════════════════════════════════════════════════════
function SubFraudeFinanceiro() {
  const [transacoes, setTransacoes] = useState(TRANSACOES_MOCK);

  const suspeitas = transacoes.filter(t=>t.estado==="bloqueado"||t.tipo==="Suspeito");
  const valorRisco = suspeitas.reduce((s,t)=>s+t.valor,0);

  const LOG_FRAUDE = [
    { acao:"Transação bloqueada por IP suspeito",         id:"TXN-00817", data:"17 Abr 02:20", admin:"sistema",   tipo:"danger" },
    { acao:"Score de risco 98 — bloqueio automático",     id:"TXN-00817", data:"17 Abr 02:15", admin:"sistema",   tipo:"danger" },
    { acao:"Alerta: padrão de tráfego anómalo detetado",  id:"TXN-00817", data:"17 Abr 01:40", admin:"sistema",   tipo:"warning" },
    { acao:"Reembolso múltiplo detetado (4 em 6h)",       id:"TXN-00818", data:"17 Abr 17:00", admin:"sistema",   tipo:"warning" },
    { acao:"Carteira bloqueada: spam_afilX",              id:"W004",       data:"17 Abr 02:22", admin:"super_admin",tipo:"danger" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <StatCard label="Transações Bloqueadas" value={suspeitas.length}                         icon="ban"          color={C.red} />
        <StatCard label="Valor em Risco (MZN)"  value={`${(valorRisco/1000).toFixed(0)}k`}      icon="alert-triangle" color={C.amber} />
        <StatCard label="Reembolsos (este mês)" value={transacoes.filter(t=>t.tipo==="Reembolso").length} icon="refresh-cw" color={C.purple} />
        <StatCard label="Tentativas Bloqueadas" value="14"                                        icon="shield"       color={C.blue} />
      </div>

      {/* Transações suspeitas */}
      {suspeitas.length > 0 && (
        <div style={{ background:C.card, border:`1.5px solid ${C.red}30`, borderRadius:14, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", background:C.redDim, borderBottom:`1px solid ${C.red}20`, display:"flex", alignItems:"center", gap:8 }}>
            <Icon name="alert-triangle" size={16} color={C.red} />
            <h3 style={{ fontSize:14, fontWeight:700, color:C.red }}>🚨 Transações a Investigar</h3>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.border}`, background:C.bg }}>
                {["ID","Tipo","Valor","De → Para","Gateway","Data","Estado","Ações"].map((c,i)=>(
                  <th key={i} style={{ padding:"8px 14px", textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:C.textMute }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suspeitas.map((t,i) => (
                <tr key={t.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:12, color:C.textSub }}>{t.id}</td>
                  <td style={{ padding:"10px 14px", fontWeight:700, color:C.red }}>{t.tipo}</td>
                  <td style={{ padding:"10px 14px", fontWeight:800, color:C.red }}>{t.valor.toLocaleString("pt-MZ")} MZN</td>
                  <td style={{ padding:"10px 14px", color:C.textSub, fontSize:12 }}>{t.de} → {t.para}</td>
                  <td style={{ padding:"10px 14px" }}><Badge label={t.gateway} type="default" /></td>
                  <td style={{ padding:"10px 14px", color:C.textSub, fontSize:12 }}>{t.data}</td>
                  <td style={{ padding:"10px 14px" }}><Badge label="Bloqueado" type="danger" /></td>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", gap:4 }}>
                      <Btn label="Reverter" icon="refresh-cw" size="sm" variant="secondary" onClick={()=>setTransacoes(prev=>prev.map(x=>x.id===t.id?{...x,estado:"concluido"}:x))} />
                      <Btn label="Confirmar bloqueio" icon="ban" size="sm" variant="danger" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Log de fraude */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>📋 Log de Anti-Fraude Financeira</h3>
          <Btn label="Exportar log" icon="download" size="sm" variant="secondary" />
        </div>
        {LOG_FRAUDE.map((l,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<4?`1px solid ${C.border}`:"none" }}>
            <Badge label={l.tipo==="danger"?"Crítico":"Alerta"} type={l.tipo} />
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{l.acao}</p>
              <p style={{ fontSize:11, color:C.textMute }}>Ref: {l.id} · Por: {l.admin}</p>
            </div>
            <span style={{ fontSize:11, color:C.textMute, whiteSpace:"nowrap" }}>{l.data}</span>
          </div>
        ))}
      </div>

      {/* Regras anti-fraude financeira */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>🛡️ Regras de Deteção Ativa</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { label:"Bloquear transações com IP suspeito",    ativo:true },
            { label:"Alerta de reembolsos acima da média",    ativo:true },
            { label:"Bloquear auto-pagamentos (anti-fraude)", ativo:true },
            { label:"Detetar carteiras com múltiplos IPs",    ativo:true },
            { label:"Limitar saques por dia (máx: 50 000 MZN)", ativo:true },
            { label:"Exigir OTP em saques acima de 10 000 MZN", ativo:true },
            { label:"Scoring de risco por transação",         ativo:true },
            { label:"Congelar saldo automático (risco >70)",  ativo:true },
          ].map((r,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:C.bg, borderRadius:8 }}>
              <div style={{ width:16, height:16, borderRadius:4, background:r.ativo?C.green:C.border, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {r.ativo && <Icon name="check" size={10} color="#fff" />}
              </div>
              <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function PageFinanceiro() {
  const [subtab, setSubtab] = useState("visao");

  const saquesPendentes = SAQUES_MOCK.filter(s=>s.estado==="pendente").length;
  const txBloqueadas    = TRANSACOES_MOCK.filter(t=>t.estado==="bloqueado").length;

  const conteudo = {
    visao:      <SubVisaoGeral    onNav={setSubtab} />,
    transacoes: <SubTransacoes />,
    saques:     <SubSaques />,
    carteiras:  <SubCarteiras />,
    relatorios: <SubRelatorios />,
    config:     <SubConfig />,
    fraude:     <SubFraudeFinanceiro />,
  };

  return (
    <div style={{ fontFamily:"'DM Sans','Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.text, letterSpacing:"-0.02em" }}>Gestão Financeira</h2>
          <p style={{ fontSize:13, color:C.textSub, marginTop:2 }}>Coração do negócio — receita, split automático, saques, carteiras e auditoria</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn label="Relatório PDF"   icon="download" variant="secondary" size="sm" />
          <Btn label="Relatório Excel" icon="download" variant="ghost"     size="sm" />
        </div>
      </div>

      {/* Subtabs */}
      <div style={{ display:"flex", gap:2, background:"#f1f5f9", padding:4, borderRadius:12, marginBottom:22, width:"fit-content", flexWrap:"wrap" }}>
        {SUBTABS.map(t => {
          const isActive = subtab === t.id;
          return (
            <button key={t.id} onClick={()=>setSubtab(t.id)}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:9, border:"none", background:isActive?C.card:"transparent", color:isActive?C.text:C.textSub, fontSize:13, fontWeight:isActive?700:500, cursor:"pointer", transition:"all 0.15s", boxShadow:isActive?"0 1px 4px rgba(0,0,0,0.08)":"none", fontFamily:"inherit", position:"relative" }}>
              <Icon name={t.icon} size={14} color={isActive?C.text:C.textSub} />
              {t.label}
              {t.badge && saquesPendentes > 0 && (
                <span style={{ position:"absolute", top:4, right:4, width:16, height:16, borderRadius:"50%", background:C.amber, color:"#fff", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{saquesPendentes}</span>
              )}
              {t.badgeDanger && txBloqueadas > 0 && (
                <span style={{ position:"absolute", top:4, right:4, width:16, height:16, borderRadius:"50%", background:C.red, color:"#fff", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{txBloqueadas}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {conteudo[subtab]}
    </div>
  );
}