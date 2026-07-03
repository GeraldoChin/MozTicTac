import { useState, useEffect, useCallback } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
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

// ─── HTTP helper ──────────────────────────────────────────────────────────────
const BASE = import.meta?.env?.VITE_API_URL ?? "http://localhost:3000/api/v1";

async function api(path, opts = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensagem || json.message || `Erro ${res.status}`);
  return json;
}

// ─── Formatadores ─────────────────────────────────────────────────────────────
const fmtN  = (n) => Number(n || 0).toLocaleString("pt-MZ");
const fmtK  = (n) => { const v = Number(n || 0); return v >= 1000000 ? (v/1000000).toFixed(1)+"M" : v >= 1000 ? (v/1000).toFixed(0)+"k" : String(v); };
const fmtDt = (d) => d ? new Date(d).toLocaleString("pt-MZ", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : "—";

// ─── Componentes base ─────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width:size, height:size, stroke:color, fill:"none", strokeWidth:1.8, strokeLinecap:"round", strokeLinejoin:"round", flexShrink:0 };
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
    "info":           <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    "edit":           <svg style={s} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    "split":          <svg style={s} viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 00-1.172-2.872L3 3M21 3l-7.828 8.828A4 4 0 0012 14.5V22"/></svg>,
  };
  return icons[name] || null;
}

function Badge({ label, type = "default" }) {
  const map = {
    success: { bg: C.greenDim, color: C.green },
    warning: { bg: C.amberDim, color: C.amber },
    danger:  { bg: C.redDim,   color: C.red   },
    info:    { bg: C.blueDim,  color: C.blue  },
    purple:  { bg: C.purpleDim,color: C.purple},
    default: { bg: "#f1f5f9",  color: C.textSub },
  };
  const s = map[type] || map.default;
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:99, background:s.bg, color:s.color, display:"inline-block", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, icon, color = C.green, trend, loading }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px", display:"flex", flexDirection:"column", gap:10, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ width:38, height:38, borderRadius:10, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name={icon} size={17} color={color} />
        </div>
        {trend !== undefined && !loading && (
          <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:99, background:trend>0?C.greenDim:C.redDim, color:trend>0?C.green:C.red }}>
            {trend>0?"+":""}{trend}%
          </span>
        )}
      </div>
      <div>
        {loading
          ? <div style={{ height:28, width:80, background:C.border, borderRadius:6, animation:"pulse 1.5s infinite" }} />
          : <p style={{ fontSize:22, fontWeight:800, color:C.text, letterSpacing:"-0.03em", lineHeight:1 }}>{value}</p>
        }
        <p style={{ fontSize:12, color:C.textSub, marginTop:3, fontWeight:500 }}>{label}</p>
        {sub && <p style={{ fontSize:11, color:C.textMute, marginTop:1 }}>{sub}</p>}
      </div>
    </div>
  );
}

function Btn({ label, icon, onClick, variant = "primary", size = "md", disabled = false, loading = false }) {
  const styles = {
    primary:   { bg:C.green,       color:"#fff",    border:"none" },
    secondary: { bg:"transparent", color:C.textSub, border:`1.5px solid ${C.border}` },
    danger:    { bg:C.red,         color:"#fff",    border:"none" },
    ghost:     { bg:C.greenMuted,  color:C.green,   border:"none" },
    amber:     { bg:C.amberDim,    color:C.amber,   border:"none" },
    blue:      { bg:C.blueDim,     color:C.blue,    border:"none" },
  };
  const pad = size === "sm" ? "6px 12px" : "9px 18px";
  const fs  = size === "sm" ? 12 : 13;
  const s = styles[variant];
  const dis = disabled || loading;
  return (
    <button onClick={onClick} disabled={dis}
      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:pad, fontSize:fs, fontWeight:700, background:dis?"#f1f5f9":s.bg, color:dis?C.textMute:s.color, border:s.border||"none", borderRadius:8, cursor:dis?"not-allowed":"pointer", opacity:dis?0.6:1, whiteSpace:"nowrap", fontFamily:"inherit" }}>
      {icon && !loading && <Icon name={icon} size={13} color={dis?C.textMute:s.color} />}
      {loading && <span style={{ width:12, height:12, border:"2px solid currentColor", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.6s linear infinite" }} />}
      {label}
    </button>
  );
}

function Toggle({ label, active = false, onChange }) {
  const [on, setOn] = useState(active);
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
      <span style={{ fontSize:13, color:C.textSub, fontWeight:500 }}>{label}</span>
      <div onClick={() => { setOn(!on); onChange?.(!on); }}
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

function ErroBloco({ mensagem, onRetry }) {
  return (
    <div style={{ padding:24, textAlign:"center", color:C.red }}>
      <p style={{ fontSize:13, marginBottom:8 }}>{mensagem}</p>
      {onRetry && <Btn label="Tentar novamente" icon="refresh-cw" variant="secondary" size="sm" onClick={onRetry} />}
    </div>
  );
}

function MiniBar({ data, color = C.green, height = 80 }) {
  const max = Math.max(...data.map(d => d.valor), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div title={`${d.dia}: ${d.valor}k MZN`}
            style={{ width:"100%", height:`${Math.max(6,(d.valor/max)*100)}%`, background:i===data.length-1?color:color+"55", borderRadius:"3px 3px 0 0", transition:"height 0.3s" }} />
        </div>
      ))}
    </div>
  );
}

function SplitBar({ split, total }) {
  if (!split) return null;
  const vPct = Math.round((split.vendedor / total) * 100);
  const pPct = Math.round((split.plataforma / total) * 100);
  const aPct = Math.round((split.afiliado / total) * 100);
  return (
    <div style={{ display:"flex", gap:2, height:6, borderRadius:99, overflow:"hidden", width:"100%" }}>
      <div title={`Vendedor: ${fmtN(split.vendedor)} MZN`} style={{ width:`${vPct}%`, background:C.blue, borderRadius:"99px 0 0 99px" }} />
      <div title={`Plataforma: ${fmtN(split.plataforma)} MZN`} style={{ width:`${pPct}%`, background:C.green }} />
      <div title={`Afiliado: ${fmtN(split.afiliado)} MZN`} style={{ width:`${aPct}%`, background:C.amber, borderRadius:"0 99px 99px 0" }} />
    </div>
  );
}

// ─── Hook genérico de fetch ───────────────────────────────────────────────────
function useFetch(path, activo = true) {
  const [dados, setDados]         = useState(null);
  const [carregando, setCarreg]   = useState(true);
  const [erro, setErro]           = useState(null);

  const carregar = useCallback(async () => {
    if (!activo) return;
    setCarreg(true); setErro(null);
    try {
      const res = await api(path);
      setDados(res.success ? res.data : res.sucesso ? res.dados : res.data ?? res.dados ?? res);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarreg(false);
    }
  }, [path, activo]);

  useEffect(() => { carregar(); }, [carregar]);
  return { dados, carregando, erro, recarregar: carregar };
}

// ─── SUBTABS ──────────────────────────────────────────────────────────────────
const SUBTABS = [
  { id:"visao",      label:"Visão Geral",  icon:"bar-chart" },
  { id:"transacoes", label:"Transações",   icon:"activity"  },
  { id:"saques",     label:"Saques",       icon:"inbox",     badge:true },
  { id:"carteiras",  label:"Carteiras",    icon:"wallet"    },
  { id:"relatorios", label:"Relatórios",   icon:"file-text" },
  { id:"config",     label:"Configuração", icon:"settings"  },
  { id:"fraude",     label:"Fraude",       icon:"shield",    badgeDanger:true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 1 — VISÃO GERAL
// ═══════════════════════════════════════════════════════════════════════════════
function SubVisaoGeral({ onNav }) {
  const { dados: kpis,     carregando: ck, erro: ek, recarregar: rk } = useFetch("/admin/dashboard/kpis");
  const { dados: alertas,  carregando: ca, erro: ea                  } = useFetch("/admin/financeiro/alertas");
  const { dados: saques,   carregando: cs                             } = useFetch("/admin/saques-pendentes");
  const { dados: receita,  carregando: cr                             } = useFetch("/admin/dashboard/receita-mensal");

  const kpisArr      = kpis?.kpis ?? [];
  const alertasArr   = alertas ?? [];
  const saquesArr    = saques?.saques ?? [];
  const receitaArr   = receita ?? [];
  const pendentes    = saquesArr.filter(s => s.estado === "SOLICITADO" || s.estado === "APROVADO");

  // Últimos 10 dias de receita para o mini gráfico
  const receitaDiaria = receitaArr.slice(-10).map(r => ({ dia: r.mes, valor: Math.round(r.receita / 1000) }));

  const tipoAlertaMap  = { SAQUE_ALTO:"warning", CONTA_SUSPEITA:"warning", DISPUTA_ABERTA:"danger" };
  const iconeAlertaMap = { SAQUE_ALTO:"inbox",   CONTA_SUSPEITA:"ban",     DISPUTA_ABERTA:"alert-triangle" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {ek && <ErroBloco mensagem={ek} onRetry={rk} />}

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
        {[
          { label:"GMV Mês (MZN)",       key:"GMV Mês (MZN)",          icon:"trending-up",  color:C.green  },
          { label:"Receita Mês (MZN)",   key:"Receita Mês (MZN)",       icon:"dollar",       color:C.green  },
          { label:"Comissões Pagas",      key:"Comissões Pagas (MZN)",   icon:"link",         color:C.amber  },
          { label:"Taxas Cobradas",       key:"Receita Mês (MZN)",       icon:"percent",      color:C.purple },
          { label:"Afiliados Activos",    key:"Afiliados",               icon:"users",        color:C.blue   },
        ].map((card, i) => {
          const kpi = kpisArr.find(k => k.label === card.key);
          return (
            <StatCard key={i}
              label={card.label}
              value={kpi ? fmtK(kpi.valor) : "—"}
              icon={card.icon}
              color={card.color}
              trend={kpi?.tendencia ? parseFloat(kpi.tendencia) : undefined}
              loading={ck} />
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Gráfico receita */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
            <div>
              <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>📈 Receita — últimos meses</h3>
              <p style={{ fontSize:12, color:C.textMute }}>Receita líquida mensal (MZN '000)</p>
            </div>
          </div>
          <div style={{ marginTop:16 }}>
            {cr
              ? <div style={{ height:90, background:C.bg, borderRadius:8, animation:"pulse 1.5s infinite" }} />
              : <MiniBar data={receitaDiaria.length > 0 ? receitaDiaria : [{ dia:"—", valor:0 }]} height={90} />
            }
          </div>
          <div style={{ marginTop:8, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[
                { label:"Ticket médio",  value: kpisArr.find(k=>k.label==="Ticket Médio (MZN)")?.valor, color:C.blue  },
                { label:"Pedidos hoje",  value: kpisArr.find(k=>k.label==="Pedidos Hoje")?.valor,       color:C.green },
                { label:"Conversão",     value: kpisArr.find(k=>k.label==="Taxa de Conversão")?.valor,  color:C.green },
              ].map((k, i) => (
                <div key={i} style={{ textAlign:"center", background:C.bg, borderRadius:8, padding:"8px 6px" }}>
                  {ck
                    ? <div style={{ height:20, background:C.border, borderRadius:4, margin:"0 auto", width:60 }} />
                    : <p style={{ fontSize:14, fontWeight:800, color:k.color }}>{k.value ?? "—"}</p>
                  }
                  <p style={{ fontSize:10, color:C.textMute, marginTop:2 }}>{k.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Split automático — estático, representa a lógica real */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>⚡ Split Automático</h3>
          <p style={{ fontSize:12, color:C.textMute, marginBottom:16 }}>Como cada venda é distribuída</p>
          <div style={{ background:C.bg, borderRadius:10, padding:16, marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.textSub }}>Exemplo: venda de 1 000 MZN (taxa 10.5%)</span>
              <Badge label="ACID" type="info" />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"Comprador paga",   valor:"1 105 MZN", note:"incl. taxa 10.5%",       color:C.text,  bg:C.bg      },
                { label:"Vendedor recebe",  valor:"~889 MZN",  note:"após comissão afiliado",  color:C.blue,  bg:C.blueDim },
                { label:"Plataforma retém", valor:"~105 MZN",  note:"taxa líquida",             color:C.green, bg:C.greenDim},
                { label:"Afiliado recebe",  valor:"~11 MZN",   note:"comissão ~1%",             color:C.amber, bg:C.amberDim},
              ].map((r, i) => (
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
        </div>
      </div>

      {/* Alertas */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Icon name="alert-triangle" size={15} color={C.amber} />
            <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>🔔 Alertas Financeiros</h3>
          </div>
          {!ca && <Badge label={`${alertasArr.length} activos`} type="warning" />}
        </div>
        {ca
          ? <div style={{ height:80, background:C.bg, borderRadius:8, animation:"pulse 1.5s infinite" }} />
          : ea
            ? <ErroBloco mensagem={ea} />
            : alertasArr.length === 0
              ? <p style={{ fontSize:13, color:C.textMute, textAlign:"center", padding:"20px 0" }}>Sem alertas activos.</p>
              : alertasArr.map((a, i) => {
                  const tipo = tipoAlertaMap[a.tipo] || "warning";
                  const cor  = { danger:C.red, warning:C.amber, info:C.blue }[tipo] || C.textSub;
                  return (
                    <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0", borderBottom:i<alertasArr.length-1?`1px solid ${C.border}`:"none" }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:cor+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <Icon name={iconeAlertaMap[a.tipo]||"alert-triangle"} size={14} color={cor} />
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, color:C.text, fontWeight:500, lineHeight:1.5 }}>{a.descricao}</p>
                        <p style={{ fontSize:11, color:C.textMute, marginTop:2 }}>{fmtDt(a.data)}</p>
                      </div>
                      <Badge label={a.prioridade === "alta" ? "Alto" : "Info"} type={tipo} />
                    </div>
                  );
                })
        }
      </div>

      {/* Saques pendentes */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>📤 Saques Pendentes</h3>
          {!cs && <Badge label={`${pendentes.length} pendente(s)`} type="warning" />}
        </div>
        {cs
          ? <div style={{ height:60, background:C.bg, borderRadius:8, animation:"pulse 1.5s infinite" }} />
          : pendentes.slice(0, 3).map((s, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{s.usuario?.nomeCompleto ?? "—"}</p>
                  <p style={{ fontSize:11, color:C.textMute }}>{s.metodoPagamento} · {fmtDt(s.criadoEm)}</p>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:14, fontWeight:800, color:C.amber }}>{fmtN(s.valor)} MZN</span>
                  <Btn label="Ver" icon="eye" size="sm" variant="ghost" onClick={() => onNav("saques")} />
                </div>
              </div>
            ))
        }
        <div style={{ marginTop:10 }}>
          <Btn label="Ver todos os saques" icon="arrow-right" variant="secondary" size="sm" onClick={() => onNav("saques")} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 2 — TRANSAÇÕES
// ═══════════════════════════════════════════════════════════════════════════════
function SubTransacoes() {
  const [pagina,       setPagina]      = useState(1);
  const [filtroTipo,   setFiltroTipo]  = useState("");
  const [filtroEstado, setFiltroEst]   = useState("");
  const [busca,        setBusca]       = useState("");
  const [txDetalhe,    setTxDetalhe]   = useState(null);

  const params = new URLSearchParams({ pagina, ...(filtroTipo && { tipo:filtroTipo }), ...(filtroEstado && { estado:filtroEstado }) }).toString();
  const { dados, carregando, erro, recarregar } = useFetch(`/admin/financeiro/transacoes?${params}`);

  const lista = (dados?.transacoes ?? []).filter(t =>
    !busca || t.id?.toLowerCase().includes(busca.toLowerCase()) ||
    t.usuario?.nomeCompleto?.toLowerCase().includes(busca.toLowerCase())
  );
  const total = dados?.total ?? 0;
  const totalPaginas = dados?.totalPaginas ?? 1;

  const estadoCor = { CONCLUIDA:"success", PENDENTE:"warning", BLOQUEADA:"danger", CANCELADA:"danger" };
  const tipoCor   = { VENDA:C.green, COMISSAO_AFILIADO:C.amber, SAQUE:C.blue, REEMBOLSO:C.purple, ESTORNO:C.red };

  const totalEntradas = lista.filter(t => t.tipo==="VENDA").reduce((s,t) => s+Number(t.valor), 0);
  const totalSaidas   = lista.filter(t => t.tipo==="SAQUE"||t.tipo==="REEMBOLSO").reduce((s,t) => s+Number(t.valor), 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <StatCard label="Total transações" value={total}               icon="activity"   color={C.blue}   loading={carregando} />
        <StatCard label="Entradas (MZN)"   value={fmtK(totalEntradas)} icon="trending-up" color={C.green} loading={carregando} />
        <StatCard label="Saídas (MZN)"     value={fmtK(totalSaidas)}   icon="inbox"      color={C.amber}  loading={carregando} />
        <StatCard label="Bloqueadas"       value={lista.filter(t=>t.estado==="BLOQUEADA").length} icon="ban" color={C.red} loading={carregando} />
      </div>

      {/* Filtros */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:16, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><Icon name="search" size={14} color={C.textMute} /></span>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Pesquisar por ID ou utilizador..."
            style={{ width:"100%", padding:"8px 12px 8px 32px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", color:C.text, background:C.bg, outline:"none", boxSizing:"border-box" }} />
        </div>
        <select value={filtroTipo} onChange={e=>{setFiltroTipo(e.target.value);setPagina(1);}}
          style={{ padding:"8px 12px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:8, color:C.text, background:C.bg, fontFamily:"inherit" }}>
          <option value="">Todos os tipos</option>
          {["VENDA","COMISSAO_AFILIADO","SAQUE","REEMBOLSO","ESTORNO","TAXA_PLATAFORMA"].map(v=><option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filtroEstado} onChange={e=>{setFiltroEst(e.target.value);setPagina(1);}}
          style={{ padding:"8px 12px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:8, color:C.text, background:C.bg, fontFamily:"inherit" }}>
          <option value="">Todos os estados</option>
          {["CONCLUIDA","PENDENTE","BLOQUEADA","CANCELADA"].map(v=><option key={v} value={v}>{v.charAt(0)+v.slice(1).toLowerCase()}</option>)}
        </select>
        <Btn label="Exportar" icon="download" variant="secondary" size="sm" />
      </div>

      {/* Tabela */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        {carregando
          ? <div style={{ padding:40, textAlign:"center", color:C.textMute }}>A carregar transações...</div>
          : erro
            ? <ErroBloco mensagem={erro} onRetry={recarregar} />
            : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:`1.5px solid ${C.border}`, background:C.bg }}>
                      {["ID","Tipo","Valor (MZN)","Utilizador","Descrição","Data","Estado","Ação"].map((c,i)=>(
                        <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:C.textMute, whiteSpace:"nowrap" }}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((t, i) => (
                      <tr key={t.id} style={{ borderBottom:`1px solid ${C.border}` }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"11px 14px", fontFamily:"monospace", fontSize:12, color:C.textSub, fontWeight:600 }}>{t.id?.substring(0,8)}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:6, height:6, borderRadius:"50%", background:tipoCor[t.tipo]||C.textMute, flexShrink:0 }} />
                            <span style={{ fontWeight:600, color:C.text }}>{t.tipo}</span>
                          </div>
                        </td>
                        <td style={{ padding:"11px 14px", fontWeight:800, color:t.tipo==="REEMBOLSO"||t.tipo==="ESTORNO"?C.red:C.text }}>
                          {["REEMBOLSO","ESTORNO"].includes(t.tipo)?"−":""}{fmtN(t.valor)}
                        </td>
                        <td style={{ padding:"11px 14px", color:C.textSub, fontSize:12 }}>{t.usuario?.nomeCompleto ?? "Sistema"}</td>
                        <td style={{ padding:"11px 14px", color:C.textSub, fontSize:12, maxWidth:200 }}>
                          <span style={{ display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.descricao}</span>
                        </td>
                        <td style={{ padding:"11px 14px", color:C.textSub, fontSize:12, whiteSpace:"nowrap" }}>{fmtDt(t.data)}</td>
                        <td style={{ padding:"11px 14px" }}><Badge label={t.estado} type={estadoCor[t.estado]||"default"} /></td>
                        <td style={{ padding:"11px 14px" }}>
                          <Btn label="Ver" icon="eye" size="sm" variant="ghost" onClick={()=>setTxDetalhe(t)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${C.border}`, fontSize:12, color:C.textMute, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>Mostrando {lista.length} de {total} transações</span>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <Btn label="←" size="sm" variant="secondary" disabled={pagina<=1} onClick={()=>setPagina(p=>p-1)} />
            <span>{pagina} / {totalPaginas}</span>
            <Btn label="→" size="sm" variant="secondary" disabled={pagina>=totalPaginas} onClick={()=>setPagina(p=>p+1)} />
          </div>
        </div>
      </div>

      {/* Modal detalhe */}
      <Modal open={!!txDetalhe} onClose={()=>setTxDetalhe(null)} width={500}>
        {txDetalhe && (
          <div style={{ padding:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <h3 style={{ fontSize:16, fontWeight:800, color:C.text }}>{txDetalhe.id?.substring(0,8).toUpperCase()}</h3>
                <p style={{ fontSize:12, color:C.textMute, marginTop:2 }}>{fmtDt(txDetalhe.data)}</p>
              </div>
              <Badge label={txDetalhe.estado} type={estadoCor[txDetalhe.estado]||"default"} />
            </div>
            {[
              ["Tipo",        txDetalhe.tipo],
              ["Valor",       `${fmtN(txDetalhe.valor)} MZN`],
              ["Utilizador",  txDetalhe.usuario?.nomeCompleto ?? "Sistema"],
              ["Descrição",   txDetalhe.descricao],
              ["Método",      txDetalhe.metodo ?? "—"],
            ].map(([k,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:12, color:C.textMute, fontWeight:500 }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:20, display:"flex", gap:8 }}>
              <Btn label="Fechar" variant="secondary" onClick={()=>setTxDetalhe(null)} />
              <Btn label="Exportar comprovativo" icon="download" variant="secondary" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 3 — SAQUES
// ═══════════════════════════════════════════════════════════════════════════════
function SubSaques() {
  const [filtro,    setFiltro]   = useState("todos");
  const [pagina,    setPagina]   = useState(1);
  const [modalOTP,  setModalOTP] = useState(null);
  const [otp,       setOtp]      = useState("");
  const [acaoId,    setAcaoId]   = useState(null);
  const [feedback,  setFeedback] = useState(null); // { id, tipo: 'ok'|'erro', msg }

  const params = new URLSearchParams({ pagina, ...(filtro !== "todos" && { estado: filtro.toUpperCase() }) }).toString();
  const { dados, carregando, erro, recarregar } = useFetch(`/admin/saques-pendentes?${params}`);

  const saques      = dados?.saques ?? [];
  const total       = dados?.total  ?? 0;
  const totalPags   = dados?.totalPaginas ?? 1;
  const totalPend   = saques.filter(s=>s.estado==="SOLICITADO").reduce((sum,s)=>sum+Number(s.valor),0);

  const estadoCor = { SOLICITADO:"warning", APROVADO:"info", CONCLUIDO:"success", REJEITADO:"danger" };
  const riscoColor = r => r>=70?C.red:r>=40?C.amber:C.green;

  async function aprovar(id) {
    setAcaoId(id);
    try {
      await api(`/admin/saques/${id}/aprovar`, { method:"PATCH" });
      setFeedback({ id, tipo:"ok", msg:"Aprovado" });
      recarregar();
    } catch (e) {
      setFeedback({ id, tipo:"erro", msg:e.message });
    } finally {
      setAcaoId(null); setModalOTP(null); setOtp("");
    }
  }

  async function rejeitar(id) {
    const motivo = prompt("Motivo de rejeição:");
    if (!motivo) return;
    setAcaoId(id);
    try {
      await api(`/admin/saques/${id}/rejeitar`, { method:"PATCH", body:JSON.stringify({ motivo }) });
      setFeedback({ id, tipo:"ok", msg:"Rejeitado" });
      recarregar();
    } catch (e) {
      setFeedback({ id, tipo:"erro", msg:e.message });
    } finally {
      setAcaoId(null);
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <StatCard label="Pendentes"      value={saques.filter(s=>s.estado==="SOLICITADO").length} icon="clock"  color={C.amber} loading={carregando} />
        <StatCard label="Total Pendente" value={`${fmtK(totalPend)} MZN`}                         icon="dollar" color={C.amber} loading={carregando} />
        <StatCard label="Aprovados"      value={saques.filter(s=>s.estado==="APROVADO").length}   icon="check"  color={C.green} loading={carregando} />
        <StatCard label="Rejeitados"     value={saques.filter(s=>s.estado==="REJEITADO").length}  icon="x"      color={C.red}   loading={carregando} />
      </div>

      {saques.some(s=>s.estado==="SOLICITADO"&&Number(s.valor)>=10000) && (
        <div style={{ background:C.amberDim, border:`1.5px solid ${C.amber}30`, borderRadius:12, padding:14, display:"flex", alignItems:"center", gap:10 }}>
          <Icon name="alert-triangle" size={16} color={C.amber} />
          <p style={{ fontSize:13, color:C.amber, fontWeight:600 }}>⚠️ Há saques ≥10 000 MZN pendentes. Requerem OTP.</p>
        </div>
      )}

      {/* Filtros */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:14, display:"flex", gap:10, alignItems:"center" }}>
        {[["todos","Todos"],["SOLICITADO","Pendentes"],["APROVADO","Aprovados"],["CONCLUIDO","Pagos"],["REJEITADO","Rejeitados"]].map(([v,l]) => (
          <button key={v} onClick={()=>{setFiltro(v);setPagina(1);}}
            style={{ padding:"5px 14px", fontSize:12, fontWeight:600, borderRadius:7, border:"none", cursor:"pointer", background:filtro===v?C.green:"transparent", color:filtro===v?"#fff":C.textSub, fontFamily:"inherit" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        {carregando
          ? <div style={{ padding:40, textAlign:"center", color:C.textMute }}>A carregar saques...</div>
          : erro
            ? <ErroBloco mensagem={erro} onRetry={recarregar} />
            : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:`1.5px solid ${C.border}`, background:C.bg }}>
                      {["ID","Utilizador","Valor","Taxa","Líquido","Método","Solicitado","Estado","Ações"].map((c,i)=>(
                        <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:C.textMute, whiteSpace:"nowrap" }}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {saques.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom:`1px solid ${C.border}` }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"11px 14px", fontFamily:"monospace", fontSize:12, color:C.textSub }}>{s.id?.substring(0,8)}</td>
                        <td style={{ padding:"11px 14px", fontWeight:700, color:C.text }}>{s.usuario?.nomeCompleto ?? "—"}</td>
                        <td style={{ padding:"11px 14px", fontWeight:800, color:C.text }}>{fmtN(s.valor)} MZN</td>
                        <td style={{ padding:"11px 14px", color:C.red, fontWeight:600 }}>−{fmtN(s.taxa)}</td>
                        <td style={{ padding:"11px 14px", fontWeight:800, color:C.green }}>{fmtN(s.valorLiquido)} MZN</td>
                        <td style={{ padding:"11px 14px" }}><Badge label={s.metodoPagamento} type="default" /></td>
                        <td style={{ padding:"11px 14px", color:C.textSub, fontSize:12, whiteSpace:"nowrap" }}>{fmtDt(s.criadoEm)}</td>
                        <td style={{ padding:"11px 14px" }}>
                          {feedback?.id===s.id
                            ? <Badge label={feedback.msg} type={feedback.tipo==="ok"?"success":"danger"} />
                            : <Badge label={s.estado} type={estadoCor[s.estado]||"default"} />
                          }
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ display:"flex", gap:4 }}>
                            {s.estado === "SOLICITADO" && (
                              <>
                                <Btn label="Aprovar" icon="check" size="sm" variant="ghost"
                                  loading={acaoId===s.id}
                                  onClick={()=>Number(s.valor)>=10000?setModalOTP(s):aprovar(s.id)} />
                                <Btn label="Rejeitar" icon="x" size="sm" variant="secondary"
                                  loading={acaoId===s.id}
                                  onClick={()=>rejeitar(s.id)} />
                              </>
                            )}
                            {(s.estado==="CONCLUIDO"||s.estado==="REJEITADO") && (
                              <Btn label="Comprovativo" icon="file-text" size="sm" variant="secondary" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
        <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.border}`, fontSize:11, color:C.textMute, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>Saque mínimo: 500 MZN · Taxa: 2% · OTP obrigatório ≥10 000 MZN</span>
          <div style={{ display:"flex", gap:8 }}>
            <Btn label="←" size="sm" variant="secondary" disabled={pagina<=1} onClick={()=>setPagina(p=>p-1)} />
            <span style={{ fontSize:12, color:C.textMute }}>{pagina}/{totalPags}</span>
            <Btn label="→" size="sm" variant="secondary" disabled={pagina>=totalPags} onClick={()=>setPagina(p=>p+1)} />
          </div>
        </div>
      </div>

      {/* Modal OTP */}
      <Modal open={!!modalOTP} onClose={()=>setModalOTP(null)} width={400}>
        {modalOTP && (
          <div style={{ padding:24 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:C.amberDim, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
              <Icon name="lock" size={22} color={C.amber} />
            </div>
            <h3 style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:4 }}>Aprovação com OTP</h3>
            <p style={{ fontSize:13, color:C.textSub, marginBottom:20 }}>
              Saque de <strong>{fmtN(modalOTP.valor)} MZN</strong> para <strong>{modalOTP.usuario?.nomeCompleto}</strong>.
              Código enviado para o seu email.
            </p>
            <div style={{ marginBottom:16 }}>
              <input type="text" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} placeholder="000000"
                style={{ width:"100%", padding:"12px 14px", fontSize:22, fontWeight:800, letterSpacing:"0.3em", textAlign:"center", border:`2px solid ${otp.length===6?C.green:C.border}`, borderRadius:8, fontFamily:"monospace", color:C.text, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ padding:"10px 12px", background:C.amberDim, borderRadius:8, fontSize:12, color:C.amber, fontWeight:500, marginBottom:20 }}>
              🔐 Registado no log de auditoria com timestamp e IP.
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn label="Cancelar" variant="secondary" onClick={()=>setModalOTP(null)} />
              <Btn label="Confirmar" variant="primary" disabled={otp.length!==6} loading={!!acaoId} onClick={()=>aprovar(modalOTP.id)} />
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
  const [busca,         setBusca]         = useState("");
  const [pagina,        setPagina]        = useState(1);
  const [modalBloquear, setModalBloquear] = useState(null);
  const [acaoId,        setAcaoId]        = useState(null);

  const params = new URLSearchParams({ pagina, ...(busca && { busca }) }).toString();
  const { dados, carregando, erro, recarregar } = useFetch(`/admin/financeiro/carteiras?${params}`);

  const carteiras   = dados?.carteiras ?? [];
  const total       = dados?.total     ?? 0;
  const totalPags   = dados?.totalPaginas ?? 1;

  const totalPlat  = carteiras.find(c=>c.usuario?.nomeCompleto==="Plataforma")?.saldoDisponivel ?? 0;
  const totalUsers = carteiras.filter(c=>c.usuario?.nomeCompleto!=="Plataforma")
    .reduce((s,c)=>s+Number(c.saldoDisponivel)+Number(c.saldoPendente),0);
  const totalBloq  = carteiras.reduce((s,c)=>s+Number(c.saldoBloqueado),0);

  async function bloquear(usuarioId) {
    setAcaoId(usuarioId);
    try {
      await api(`/admin/utilizadores/${usuarioId}/bloquear`, { method:"PATCH", body:JSON.stringify({ motivo:"Bloqueio manual via painel financeiro" }) });
      recarregar();
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setAcaoId(null); setModalBloquear(null);
    }
  }

  async function desbloquear(usuarioId) {
    setAcaoId(usuarioId);
    try {
      await api(`/admin/utilizadores/${usuarioId}/desbloquear`, { method:"PATCH" });
      recarregar();
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setAcaoId(null);
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <StatCard label="Total Carteiras"        value={total}                       icon="wallet"      color={C.blue}  loading={carregando} />
        <StatCard label="Saldo Plataforma (MZN)" value={fmtK(totalPlat)}             icon="credit-card" color={C.green} loading={carregando} />
        <StatCard label="Saldo Utilizadores"     value={fmtK(totalUsers)}            icon="users"       color={C.blue}  loading={carregando} />
        <StatCard label="Fundos Bloqueados"      value={fmtK(totalBloq)}             icon="ban"         color={C.red}   loading={carregando} />
      </div>

      {/* Separação financeira */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>🔒 Separação Financeira (Ledger)</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {[
            { label:"Dinheiro da Plataforma",   valor:totalPlat,  note:"Receita própria",       color:C.green, icon:"zap"   },
            { label:"Dinheiro dos Utilizadores", valor:totalUsers, note:"Fundos de terceiros",   color:C.blue,  icon:"users" },
            { label:"Fundos Bloqueados",          valor:totalBloq,  note:"Em investigação",       color:C.red,   icon:"lock"  },
          ].map((k,i) => (
            <div key={i} style={{ background:k.color+"0f", border:`1.5px solid ${k.color}20`, borderRadius:12, padding:16, textAlign:"center" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:k.color+"18", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                <Icon name={k.icon} size={16} color={k.color} />
              </div>
              {carregando
                ? <div style={{ height:28, width:80, background:k.color+"30", borderRadius:6, margin:"0 auto" }} />
                : <p style={{ fontSize:20, fontWeight:800, color:k.color }}>{fmtN(k.valor)} MZN</p>
              }
              <p style={{ fontSize:12, fontWeight:600, color:C.text, marginTop:4 }}>{k.label}</p>
              <p style={{ fontSize:11, color:C.textMute }}>{k.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtro */}
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ position:"relative", flex:1 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}><Icon name="search" size={14} color={C.textMute} /></span>
          <input value={busca} onChange={e=>{setBusca(e.target.value);setPagina(1);}} placeholder="Pesquisar por nome..."
            style={{ width:"100%", padding:"8px 12px 8px 32px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", color:C.text, background:C.card, outline:"none", boxSizing:"border-box" }} />
        </div>
        <Btn label="Exportar" icon="download" variant="secondary" size="sm" />
      </div>

      {/* Tabela */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        {carregando
          ? <div style={{ padding:40, textAlign:"center", color:C.textMute }}>A carregar carteiras...</div>
          : erro
            ? <ErroBloco mensagem={erro} onRetry={recarregar} />
            : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:`1.5px solid ${C.border}`, background:C.bg }}>
                      {["Utilizador","Disponível","Pendente","Bloqueado","Total Ganho","Estado","Ações"].map((c,i)=>(
                        <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:C.textMute, whiteSpace:"nowrap" }}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {carteiras.map((c, i) => {
                      const bloqueada = c.usuario?.estadoConta === "BLOQUEADA";
                      return (
                        <tr key={c.id} style={{ borderBottom:`1px solid ${C.border}`, background:bloqueada?C.redDim+"80":"transparent" }}
                          onMouseEnter={e=>{ if(!bloqueada) e.currentTarget.style.background=C.bg }}
                          onMouseLeave={e=>{ e.currentTarget.style.background=bloqueada?C.redDim+"80":"transparent" }}>
                          <td style={{ padding:"11px 14px" }}>
                            <p style={{ fontSize:13, fontWeight:700, color:C.text }}>{c.usuario?.nomeCompleto ?? "—"}</p>
                            <p style={{ fontSize:11, color:C.textMute }}>{c.usuario?.email}</p>
                          </td>
                          <td style={{ padding:"11px 14px", fontWeight:800, color:C.green }}>{fmtN(c.saldoDisponivel)} MZN</td>
                          <td style={{ padding:"11px 14px", fontWeight:600, color:C.amber }}>{fmtN(c.saldoPendente)} MZN</td>
                          <td style={{ padding:"11px 14px", fontWeight:600, color:Number(c.saldoBloqueado)>0?C.red:C.textMute }}>
                            {Number(c.saldoBloqueado)>0?`${fmtN(c.saldoBloqueado)} MZN`:"—"}
                          </td>
                          <td style={{ padding:"11px 14px", color:C.textSub }}>{fmtN(Number(c.totalGanhoVendas)+Number(c.totalGanhoAfiliados))} MZN</td>
                          <td style={{ padding:"11px 14px" }}>
                            <Badge label={bloqueada?"Bloqueada":"Activa"} type={bloqueada?"danger":"success"} />
                          </td>
                          <td style={{ padding:"11px 14px" }}>
                            {bloqueada
                              ? <Btn label="Desbloquear" icon="unlock" size="sm" variant="secondary" loading={acaoId===c.usuario?.id} onClick={()=>desbloquear(c.usuario?.id)} />
                              : <Btn label="Bloquear" icon="lock" size="sm" variant="danger" loading={acaoId===c.usuario?.id} onClick={()=>setModalBloquear(c)} />
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
        }
        <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"flex-end", gap:8, alignItems:"center" }}>
          <Btn label="←" size="sm" variant="secondary" disabled={pagina<=1} onClick={()=>setPagina(p=>p-1)} />
          <span style={{ fontSize:12, color:C.textMute }}>{pagina}/{totalPags}</span>
          <Btn label="→" size="sm" variant="secondary" disabled={pagina>=totalPags} onClick={()=>setPagina(p=>p+1)} />
        </div>
      </div>

      {/* Modal bloquear */}
      <Modal open={!!modalBloquear} onClose={()=>setModalBloquear(null)} width={400}>
        {modalBloquear && (
          <div style={{ padding:24 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:C.redDim, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
              <Icon name="lock" size={22} color={C.red} />
            </div>
            <h3 style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:6 }}>Bloquear carteira?</h3>
            <p style={{ fontSize:13, color:C.textSub, marginBottom:4 }}>
              A conta de <strong>{modalBloquear.usuario?.nomeCompleto}</strong> será bloqueada.
              Saldo disponível: <strong>{fmtN(modalBloquear.saldoDisponivel)} MZN</strong>.
            </p>
            <p style={{ fontSize:12, color:C.red, fontWeight:600, marginBottom:20 }}>Registado no log de auditoria.</p>
            <div style={{ display:"flex", gap:8 }}>
              <Btn label="Cancelar" variant="secondary" onClick={()=>setModalBloquear(null)} />
              <Btn label="Bloquear" icon="lock" variant="danger" loading={!!acaoId} onClick={()=>bloquear(modalBloquear.usuario?.id)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 5 — RELATÓRIOS (dados reais do endpoint financeiro)
// ═══════════════════════════════════════════════════════════════════════════════
function SubRelatorios() {
  const [periodo,        setPeriodo]   = useState("mensal");
  const [gerandoPDF,     setGerando]   = useState(false);
  const [relatorioGerado,setGerado]    = useState(false);

  const hoje     = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
  const fimMes    = hoje.toISOString().split("T")[0];

  const { dados: rel, carregando, erro, recarregar } = useFetch(
    `/admin/financeiro/relatorio?dataInicio=${inicioMes}&dataFim=${fimMes}`
  );

  const gmv       = rel?.gmv              ?? 0;
  const receita   = rel?.receitaPlataforma ?? 0;
  const comissoes = rel?.totalComissoesPagas ?? 0;
  const saques    = rel?.totalSaquesProcessados ?? 0;

  const METRICAS = [
    { label:"GMV (Volume Total)",     valor:fmtK(gmv),       unidade:"MZN", icon:"trending-up", color:C.green },
    { label:"Receita Plataforma",     valor:fmtK(receita),   unidade:"MZN", icon:"dollar",      color:C.green },
    { label:"Comissões Afiliados",    valor:fmtK(comissoes), unidade:"MZN", icon:"link",        color:C.amber },
    { label:"Saques Processados",     valor:fmtK(saques),    unidade:"MZN", icon:"inbox",       color:C.blue  },
    { label:"Taxa Reembolso",         valor:"—",             unidade:"%",   icon:"refresh-cw",  color:C.purple },
    { label:"Ticket Médio",           valor:"—",             unidade:"MZN", icon:"activity",    color:C.blue  },
  ];

  const pedidosEstados = rel?.pedidosPorEstado ?? [];

  const gerarRelatorio = () => {
    setGerando(true);
    setTimeout(() => { setGerando(false); setGerado(true); }, 2000);
  };

  const RELATORIOS_AUTO = [
    { nome:`Relatório Diário — ${hoje.toLocaleDateString("pt-MZ")}`, tamanho:"—", gerado:"Hoje 00:01", tipo:"PDF" },
    { nome:`Relatório Mensal — ${hoje.toLocaleString("pt-MZ",{month:"long",year:"numeric"})}`, tamanho:"—", gerado:`1 ${hoje.toLocaleString("pt-MZ",{month:"short"})} 00:01`, tipo:"PDF" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Métricas */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>📊 Métricas do Período</h3>
          <div style={{ display:"flex", gap:4, background:"#f1f5f9", padding:3, borderRadius:10 }}>
            {[["diario","Diário"],["mensal","Mensal"],["anual","Anual"]].map(([v,l]) => (
              <button key={v} onClick={()=>setPeriodo(v)}
                style={{ padding:"5px 14px", fontSize:12, fontWeight:600, borderRadius:8, border:"none", cursor:"pointer", background:periodo===v?C.card:"transparent", color:periodo===v?C.text:C.textSub, fontFamily:"inherit" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {erro
          ? <ErroBloco mensagem={erro} onRetry={recarregar} />
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {METRICAS.map((m,i) => (
                <div key={i} style={{ background:C.bg, borderRadius:10, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <p style={{ fontSize:11, color:C.textMute, fontWeight:500, marginBottom:4 }}>{m.label}</p>
                    {carregando
                      ? <div style={{ height:24, width:80, background:C.border, borderRadius:4 }} />
                      : <p style={{ fontSize:18, fontWeight:800, color:C.text }}>{m.valor} <span style={{ fontSize:12, fontWeight:500, color:C.textSub }}>{m.unidade}</span></p>
                    }
                  </div>
                  <div style={{ width:32, height:32, borderRadius:8, background:m.color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon name={m.icon} size={14} color={m.color} />
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {/* Pedidos por estado + Gerar relatório */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>📦 Pedidos por Estado</h3>
          {carregando
            ? <div style={{ height:120, background:C.bg, borderRadius:8 }} />
            : pedidosEstados.map((p, i) => {
                const cores = { ENTREGUE:C.green, ENVIADO:C.blue, PAGO:C.amber, CANCELADO:C.red, EM_DISPUTA:C.red, AGUARDANDO_PAGAMENTO:C.textMute };
                const total = pedidosEstados.reduce((s,x)=>s+(x._count?.estado||0),0) || 1;
                const cnt   = p._count?.estado ?? 0;
                const pct   = Math.round((cnt/total)*100);
                const cor   = cores[p.estado] ?? C.textMute;
                return (
                  <div key={i} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{p.estado}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:cor }}>{fmtN(cnt)}</span>
                    </div>
                    <div style={{ height:6, background:C.border, borderRadius:99 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:cor, borderRadius:99 }} />
                    </div>
                    <p style={{ fontSize:10, color:C.textMute, marginTop:2 }}>{pct}% do total</p>
                  </div>
                );
              })
          }
        </div>

        {/* Gerar relatório */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>📄 Gerar Relatório</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            {[
              { label:"Tipo", options:["Diário","Semanal","Mensal","Anual","Fiscal (AT)"] },
              { label:"Formato", options:["PDF","Excel (XLSX)","Ambos"] },
            ].map((f,i) => (
              <div key={i}>
                <label style={{ fontSize:11, fontWeight:600, color:C.textMute, textTransform:"uppercase", display:"block", marginBottom:4 }}>{f.label}</label>
                <select style={{ width:"100%", padding:"8px 10px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", color:C.text, background:C.bg }}>
                  {f.options.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <Btn label={gerandoPDF?"A gerar...":"Gerar Relatório"} icon={gerandoPDF?"clock":"file-text"} variant="primary" loading={gerandoPDF} onClick={gerarRelatorio} />
          {relatorioGerado && (
            <div style={{ marginTop:12, padding:"10px 14px", background:C.greenDim, borderRadius:8, display:"flex", alignItems:"center", gap:8 }}>
              <Icon name="check" size={14} color={C.green} />
              <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Relatório gerado!</span>
              <Btn label="Download" icon="download" size="sm" variant="ghost" onClick={()=>setGerado(false)} />
            </div>
          )}
          <div style={{ marginTop:20, borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>📁 Relatórios Automáticos</h3>
            {RELATORIOS_AUTO.map((r,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<1?`1px solid ${C.border}`:"none" }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:C.text }}>{r.nome}</p>
                  <p style={{ fontSize:11, color:C.textMute }}>{r.gerado}</p>
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
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>🇲🇿 Conformidade — Autoridade Tributária</h3>
          <Badge label="Moçambique" type="info" />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { label:"IVA cobrado",          valor:"17% aplicado",  estado:"OK",      note:"Calculado automaticamente" },
            { label:"IRPS retido",          valor:"20% prestadores",estado:"OK",     note:"Retido na fonte" },
            { label:"Relatório fiscal",     valor:"Disponível",    estado:"OK",      note:"Via painel de relatórios" },
            { label:"Próxima submissão AT", valor:"Verificar",     estado:"PENDENTE",note:"Consulte o calendário fiscal" },
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
  const [taxas,         setTaxas]      = useState({ produto:10.5, servico:15, saque:2, minSaque:500, liberacao:3 });
  const [modalOTP,      setModalOTP]   = useState(false);
  const [campoEdit,     setCampoEdit]  = useState(null);
  const [otpCode,       setOtpCode]    = useState("");
  const [salvo,         setSalvo]      = useState(null);
  const [salvando,      setSalvando]   = useState(false);

  const pedirOTP = (campo) => { setCampoEdit(campo); setModalOTP(true); setOtpCode(""); };

  async function confirmarOTP() {
    setSalvando(true);
    try {
      // Endpoint real de configuração de taxas (a implementar)
      // await api("/admin/config/taxas", { method:"PATCH", body:JSON.stringify({ campo:campoEdit, valor:taxas[campoEdit] }) });
      setSalvo(campoEdit);
      setModalOTP(false);
      setTimeout(() => setSalvo(null), 3000);
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

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
            { campo:"produto",   label:"Taxa por venda de produto (%)",      tipo:"%"   },
            { campo:"servico",   label:"Taxa por venda de serviço (%)",      tipo:"%"   },
            { campo:"saque",     label:"Taxa de levantamento (%)",           tipo:"%"   },
            { campo:"minSaque",  label:"Valor mínimo de saque (MZN)",        tipo:"MZN" },
            { campo:"liberacao", label:"Tempo de libertação de saldo (dias)",tipo:"dias"},
          ].map((f, i) => (
            <div key={i} style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:600, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:5 }}>{f.label}</label>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input type="number" value={taxas[f.campo]}
                  onChange={e=>setTaxas(prev=>({...prev,[f.campo]:e.target.value}))}
                  style={{ flex:1, padding:"8px 12px", fontSize:14, fontWeight:700, border:`1.5px solid ${salvo===f.campo?C.green:C.border}`, borderRadius:8, fontFamily:"inherit", color:C.text, background:C.bg, outline:"none" }} />
                <span style={{ fontSize:12, color:C.textMute, minWidth:30 }}>{f.tipo}</span>
                <Btn label="Guardar" size="sm" variant="ghost" onClick={()=>pedirOTP(f.campo)} />
              </div>
              {salvo===f.campo && <p style={{ fontSize:11, color:C.green, marginTop:3, fontWeight:600 }}>✅ Guardado</p>}
            </div>
          ))}
          <div style={{ marginTop:8, padding:"10px 12px", background:C.amberDim, borderRadius:8, fontSize:12, color:C.amber, fontWeight:500 }}>
            🔐 Alterações requerem OTP + log de auditoria
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>🤖 Automações Financeiras</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <Toggle label="Aprovar saques pequenos (<500 MZN) automaticamente" active={true} />
              <Toggle label="Pagar afiliados automaticamente (Ouro/Prata)"       active={true} />
              <Toggle label="Gerar relatórios diários automáticos"               active={true} />
              <Toggle label="Bloquear contas suspeitas automaticamente"          active={true} />
              <Toggle label="Calcular e reter IVA automaticamente"               active={true} />
              <Toggle label="Aplicar cashback em compras acima de 2 000 MZN"    active={false} />
            </div>
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>🏦 Comissões de Afiliados</h3>
            {[
              { nivel:"🥉 Bronze", range:"5–10%",  prazo:"7 dias" },
              { nivel:"🥈 Prata",  range:"11–20%", prazo:"5 dias" },
              { nivel:"🥇 Ouro",   range:"21–30%", prazo:"3 dias" },
            ].map((n,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<2?`1px solid ${C.border}`:"none" }}>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{n.nivel}</span>
                <div style={{ display:"flex", gap:8 }}>
                  <Badge label={n.range} type="success" />
                  <Badge label={`Lib. ${n.prazo}`} type="default" />
                  <Btn label="Editar" icon="edit" size="sm" variant="secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <Icon name="shield" size={15} color={C.purple} />
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>🛡️ Segurança Financeira</h3>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[
            { label:"OTP por email",         estado:"Ativo", icon:"lock",      color:C.green },
            { label:"Logs imutáveis",         estado:"Ativo", icon:"file-text", color:C.green },
            { label:"Anti-fraude automático", estado:"Ativo", icon:"ban",       color:C.green },
            { label:"Encriptação AES-256",    estado:"Ativo", icon:"lock",      color:C.green },
            { label:"Scoring de risco",       estado:"Ativo", icon:"activity",  color:C.green },
            { label:"2FA administrador",      estado:"Config",icon:"shield",    color:C.amber },
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

      {/* Modal OTP */}
      <Modal open={modalOTP} onClose={()=>setModalOTP(false)} width={380}>
        <div style={{ padding:24 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:C.amberDim, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
            <Icon name="lock" size={20} color={C.amber} />
          </div>
          <h3 style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:6 }}>Confirmar alteração</h3>
          <p style={{ fontSize:13, color:C.textSub, marginBottom:20 }}>Insira o código OTP enviado para o seu email.</p>
          <input type="text" maxLength={6} value={otpCode} onChange={e=>setOtpCode(e.target.value.replace(/\D/g,""))} placeholder="000000"
            style={{ width:"100%", padding:"12px 14px", fontSize:22, fontWeight:800, letterSpacing:"0.3em", textAlign:"center", border:`2px solid ${otpCode.length===6?C.green:C.border}`, borderRadius:8, fontFamily:"monospace", color:C.text, outline:"none", boxSizing:"border-box", marginBottom:16 }} />
          <div style={{ display:"flex", gap:8 }}>
            <Btn label="Cancelar" variant="secondary" onClick={()=>setModalOTP(false)} />
            <Btn label="Confirmar" variant="primary" disabled={otpCode.length!==6} loading={salvando} onClick={confirmarOTP} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB 7 — FRAUDE
// ═══════════════════════════════════════════════════════════════════════════════
function SubFraudeFinanceiro() {
  const { dados: alertas, carregando, erro, recarregar } = useFetch("/admin/financeiro/alertas");
  const { dados: txDados, carregando: cTx, recarregar: rTx } = useFetch("/admin/financeiro/transacoes?estado=BLOQUEADA&pagina=1");

  const alertasArr = alertas ?? [];
  const suspeitas  = txDados?.transacoes ?? [];
  const valorRisco = suspeitas.reduce((s,t)=>s+Number(t.valor),0);

  async function reverterBloqueio(id) {
    try {
      // Endpoint a implementar: PATCH /admin/financeiro/transacoes/:id/reverter
      alert("Funcionalidade a implementar: reverter bloqueio " + id);
      rTx();
    } catch (e) {
      alert("Erro: " + e.message);
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <StatCard label="Transações Bloqueadas" value={txDados?.total??0}             icon="ban"            color={C.red}   loading={cTx} />
        <StatCard label="Valor em Risco (MZN)"  value={fmtK(valorRisco)}              icon="alert-triangle" color={C.amber} loading={cTx} />
        <StatCard label="Alertas Activos"        value={alertasArr.length}             icon="shield"         color={C.blue}  loading={carregando} />
        <StatCard label="Contas Suspeitas"       value={alertasArr.filter(a=>a.tipo==="CONTA_SUSPEITA").length} icon="ban" color={C.amber} loading={carregando} />
      </div>

      {/* Transações suspeitas */}
      <div style={{ background:C.card, border:`1.5px solid ${C.red}30`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", background:C.redDim, borderBottom:`1px solid ${C.red}20`, display:"flex", alignItems:"center", gap:8 }}>
          <Icon name="alert-triangle" size={16} color={C.red} />
          <h3 style={{ fontSize:14, fontWeight:700, color:C.red }}>🚨 Transações Bloqueadas</h3>
        </div>
        {cTx
          ? <div style={{ padding:40, textAlign:"center", color:C.textMute }}>A carregar...</div>
          : suspeitas.length === 0
            ? <p style={{ padding:24, textAlign:"center", fontSize:13, color:C.textMute }}>Sem transações bloqueadas.</p>
            : (
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${C.border}`, background:C.bg }}>
                    {["ID","Tipo","Valor","Utilizador","Descrição","Data","Ações"].map((c,i)=>(
                      <th key={i} style={{ padding:"8px 14px", textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:C.textMute }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suspeitas.map((t, i) => (
                    <tr key={t.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                      <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:12, color:C.textSub }}>{t.id?.substring(0,8)}</td>
                      <td style={{ padding:"10px 14px", fontWeight:700, color:C.red }}>{t.tipo}</td>
                      <td style={{ padding:"10px 14px", fontWeight:800, color:C.red }}>{fmtN(t.valor)} MZN</td>
                      <td style={{ padding:"10px 14px", color:C.textSub }}>{t.usuario?.nomeCompleto??"-"}</td>
                      <td style={{ padding:"10px 14px", color:C.textSub, fontSize:12 }}>{t.descricao}</td>
                      <td style={{ padding:"10px 14px", color:C.textSub, fontSize:12 }}>{fmtDt(t.data)}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <div style={{ display:"flex", gap:4 }}>
                          <Btn label="Reverter" icon="refresh-cw" size="sm" variant="secondary" onClick={()=>reverterBloqueio(t.id)} />
                          <Btn label="Confirmar bloqueio" icon="ban" size="sm" variant="danger" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        }
      </div>

      {/* Log de alertas */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.text }}>📋 Log de Alertas Financeiros</h3>
          <Btn label="Exportar log" icon="download" size="sm" variant="secondary" />
        </div>
        {carregando
          ? <div style={{ height:80, background:C.bg, borderRadius:8 }} />
          : erro
            ? <ErroBloco mensagem={erro} onRetry={recarregar} />
            : alertasArr.length === 0
              ? <p style={{ fontSize:13, color:C.textMute, textAlign:"center", padding:"20px 0" }}>Sem alertas.</p>
              : alertasArr.map((a, i) => {
                  const cor = a.prioridade==="alta"?C.red:C.amber;
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<alertasArr.length-1?`1px solid ${C.border}`:"none" }}>
                      <Badge label={a.prioridade==="alta"?"Crítico":"Alerta"} type={a.prioridade==="alta"?"danger":"warning"} />
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{a.titulo}</p>
                        <p style={{ fontSize:11, color:C.textMute }}>{a.descricao}</p>
                      </div>
                      <span style={{ fontSize:11, color:C.textMute, whiteSpace:"nowrap" }}>{fmtDt(a.data)}</span>
                    </div>
                  );
                })
        }
      </div>

      {/* Regras activas */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>🛡️ Regras de Deteção Activa</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            "Bloquear transações com IP suspeito",
            "Alerta de reembolsos acima da média",
            "Bloquear auto-pagamentos (anti-fraude)",
            "Detetar carteiras com múltiplos IPs",
            "Limitar saques por dia (máx: 50 000 MZN)",
            "Exigir OTP em saques acima de 10 000 MZN",
            "Scoring de risco por transação",
            "Congelar saldo automático (risco >70)",
          ].map((r, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:C.bg, borderRadius:8 }}>
              <div style={{ width:16, height:16, borderRadius:4, background:C.green, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name="check" size={10} color="#fff" />
              </div>
              <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{r}</span>
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

  // Contadores para badges nas tabs — carregados uma vez
  const { dados: saquesDados } = useFetch("/admin/saques-pendentes?pagina=1");
  const { dados: txDados      } = useFetch("/admin/financeiro/transacoes?estado=BLOQUEADA&pagina=1");

  const saquesPendentes = saquesDados?.saques?.filter(s=>s.estado==="SOLICITADO").length ?? 0;
  const txBloqueadas    = txDados?.total ?? 0;

  return (
    <div style={{ fontFamily:"'DM Sans','Inter',system-ui,sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.text, letterSpacing:"-0.02em" }}>Gestão Financeira</h2>
          <p style={{ fontSize:13, color:C.textSub, marginTop:2 }}>Receita, split automático, saques, carteiras e auditoria</p>
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
              {t.badge && saquesPendentes>0 && (
                <span style={{ position:"absolute", top:4, right:4, width:16, height:16, borderRadius:"50%", background:C.amber, color:"#fff", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{saquesPendentes}</span>
              )}
              {t.badgeDanger && txBloqueadas>0 && (
                <span style={{ position:"absolute", top:4, right:4, width:16, height:16, borderRadius:"50%", background:C.red, color:"#fff", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{txBloqueadas}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {subtab==="visao"      && <SubVisaoGeral   onNav={setSubtab} />}
      {subtab==="transacoes" && <SubTransacoes />}
      {subtab==="saques"     && <SubSaques />}
      {subtab==="carteiras"  && <SubCarteiras />}
      {subtab==="relatorios" && <SubRelatorios />}
      {subtab==="config"     && <SubConfig />}
      {subtab==="fraude"     && <SubFraudeFinanceiro />}
    </div>
  );
}