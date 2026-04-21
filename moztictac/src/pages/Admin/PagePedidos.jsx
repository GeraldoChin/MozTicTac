import { useState } from "react";

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

const ESTADOS = {
  pendente:   { label: "Pendente",   type: "warning", cor: "#f59e0b" },
  pago:       { label: "Pago",       type: "info",    cor: "#3b82f6" },
  enviado:    { label: "Enviado",    type: "info",    cor: "#3b82f6" },
  concluido:  { label: "Concluído",  type: "success", cor: "#16a34a" },
  cancelado:  { label: "Cancelado",  type: "danger",  cor: "#ef4444" },
  disputa:    { label: "Disputa",    type: "danger",  cor: "#ef4444" },
  reembolso:  { label: "Reembolso",  type: "purple",  cor: "#8b5cf6" },
};

const PEDIDOS_MOCK = [
  { id: "#4821", comprador: "João Matos",    compradorEmail: "joao@gmail.com",    vendedor: "Ana Lopes",     vendedorEmail: "ana@gmail.com",    produto: "Ténis Nike Air Max",   total: 3400,  data: "18 Abr 2025", metodo: "M-Pesa",  provincia: "Maputo",  estado: "concluido", afiliado: "João M.", fraude: false, historico: [{acao:"Pedido criado",data:"18 Abr 09:00"},{acao:"Pagamento confirmado",data:"18 Abr 09:05"},{acao:"Enviado",data:"18 Abr 14:00"},{acao:"Concluído",data:"18 Abr 18:30"}] },
  { id: "#4820", comprador: "Carlos Nhaca",  compradorEmail: "carlos@hotmail.com",vendedor: "Fátima Dique",  vendedorEmail: "fatima@gmail.com", produto: "Smartphone Samsung",   total: 1900,  data: "18 Abr 2025", metodo: "E-Mola",  provincia: "Nampula", estado: "enviado",   afiliado: null,      fraude: false, historico: [{acao:"Pedido criado",data:"18 Abr 10:00"},{acao:"Pagamento confirmado",data:"18 Abr 10:10"},{acao:"Enviado",data:"18 Abr 16:00"}] },
  { id: "#4819", comprador: "Maria Sitoe",   compradorEmail: "maria@gmail.com",   vendedor: "Pedro Mabunda", vendedorEmail: "pedro@gmail.com",  produto: "Laptop Lenovo",        total: 4200,  data: "17 Abr 2025", metodo: "Banco",   provincia: "Sofala",  estado: "pago",      afiliado: "Ana L.",  fraude: false, historico: [{acao:"Pedido criado",data:"17 Abr 11:00"},{acao:"Pagamento confirmado",data:"17 Abr 11:20"}] },
  { id: "#4818", comprador: "André Fumo",    compradorEmail: "andre@gmail.com",   vendedor: "Ana Lopes",     vendedorEmail: "ana@gmail.com",    produto: "Capulana Bordada",     total: 800,   data: "17 Abr 2025", metodo: "M-Pesa",  provincia: "Gaza",    estado: "disputa",   afiliado: null,      fraude: true,  historico: [{acao:"Pedido criado",data:"17 Abr 08:00"},{acao:"Pagamento confirmado",data:"17 Abr 08:15"},{acao:"Disputa aberta pelo comprador",data:"17 Abr 20:00"}] },
  { id: "#4817", comprador: "Luísa Tembe",   compradorEmail: "luisa@gmail.com",   vendedor: "João Matos",    vendedorEmail: "joao@gmail.com",   produto: "Perfume Chanel",       total: 2100,  data: "16 Abr 2025", metodo: "E-Mola",  provincia: "Maputo",  estado: "cancelado", afiliado: "Fátima D.", fraude: false, historico: [{acao:"Pedido criado",data:"16 Abr 09:00"},{acao:"Cancelado pelo comprador",data:"16 Abr 10:30"}] },
  { id: "#4816", comprador: "Rogério Sitoe", compradorEmail: "rogerio@gmail.com", vendedor: "Carlos Nhaca",  vendedorEmail: "carlos@hotmail.com",produto: "Camisola Adidas",      total: 650,   data: "15 Abr 2025", metodo: "M-Pesa",  provincia: "Zambézia",estado: "concluido", afiliado: null,      fraude: false, historico: [{acao:"Pedido criado",data:"15 Abr 07:00"},{acao:"Concluído",data:"15 Abr 19:00"}] },
  { id: "#4815", comprador: "Amina Cossa",   compradorEmail: "amina@gmail.com",   vendedor: "Fátima Dique",  vendedorEmail: "fatima@gmail.com", produto: "Conjunto Capulana",    total: 1200,  data: "14 Abr 2025", metodo: "Banco",   provincia: "Maputo",  estado: "reembolso", afiliado: "Carlos N.", fraude: false, historico: [{acao:"Pedido criado",data:"14 Abr 10:00"},{acao:"Reembolso solicitado",data:"14 Abr 18:00"}] },
  { id: "#4814", comprador: "João Matos",    compradorEmail: "joao@gmail.com",    vendedor: "Pedro Mabunda", vendedorEmail: "pedro@gmail.com",  produto: "Ténis Puma",           total: 980,   data: "13 Abr 2025", metodo: "M-Pesa",  provincia: "Maputo",  estado: "concluido", afiliado: null,      fraude: false, historico: [{acao:"Pedido criado",data:"13 Abr 09:00"},{acao:"Concluído",data:"13 Abr 20:00"}] },
];

function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width: size, height: size, stroke: color, fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 };
  const icons = {
    "shopping-bag":   <svg style={s} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    "bell":           <svg style={s} viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    "activity":       <svg style={s} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
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
    "credit-card":    <svg style={s} viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    "user":           <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    "map-pin":        <svg style={s} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    "clock":          <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    "link":           <svg style={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    "info":           <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    "message":        <svg style={s} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    "rotate-ccw":     <svg style={s} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.96"/></svg>,
    "zap":            <svg style={s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  };
  return icons[name] || null;
}

function Badge({ label, type = "default" }) {
  const map = {
    success: { bg: C.greenDim,  color: C.green },
    warning: { bg: C.amberDim,  color: C.amber },
    danger:  { bg: C.redDim,    color: C.red },
    info:    { bg: C.blueDim,   color: C.blue },
    purple:  { bg: C.purpleDim, color: C.purple },
    default: { bg: "#f1f5f9",   color: C.textSub },
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
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: trend >= 0 ? C.greenDim : C.redDim, color: trend >= 0 ? C.green : C.red }}>
            {trend >= 0 ? "+" : ""}{trend}%
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
    primary:   { bg: C.green,       color: "#fff",    border: "none" },
    secondary: { bg: "transparent", color: C.textSub, border: `1.5px solid ${C.border}` },
    danger:    { bg: C.red,         color: "#fff",     border: "none" },
    ghost:     { bg: C.greenMuted,  color: C.green,   border: "none" },
    amber:     { bg: C.amberDim,    color: C.amber,   border: "none" },
    blue:      { bg: C.blueDim,     color: C.blue,    border: "none" },
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

// ── 1. VISÃO GERAL ────────────────────────────────────────────────────────────
function SubVisaoGeral({ pedidos, onSelectPedido }) {
  const total      = pedidos.length;
  const pendentes  = pedidos.filter(p => p.estado === "pendente").length;
  const transito   = pedidos.filter(p => p.estado === "enviado").length;
  const concluidos = pedidos.filter(p => p.estado === "concluido").length;
  const cancelados = pedidos.filter(p => p.estado === "cancelado").length;
  const disputas   = pedidos.filter(p => p.estado === "disputa").length;
  const reembolsos = pedidos.filter(p => p.estado === "reembolso").length;
  const volumeTotal = pedidos.reduce((s, p) => s + p.total, 0);
  const volumeConcluido = pedidos.filter(p => p.estado === "concluido").reduce((s, p) => s + p.total, 0);

  const metodos = pedidos.reduce((acc, p) => { acc[p.metodo] = (acc[p.metodo] || 0) + 1; return acc; }, {});
  const provincias = pedidos.reduce((acc, p) => { acc[p.provincia] = (acc[p.provincia] || 0) + p.total; return acc; }, {});
  const maxProv = Math.max(...Object.values(provincias));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <StatCard label="Total Pedidos"      value={total}                                           icon="shopping-bag" color={C.blue}   trend={5.2} />
        <StatCard label="Volume (MZN)"       value={`${(volumeTotal/1000).toFixed(1)}k`}             icon="dollar"       color={C.green}  trend={8.4} />
        <StatCard label="Concluídos"         value={concluidos}                                      icon="check"        color={C.green}  />
        <StatCard label="Em Disputa"         value={disputas}                                        icon="alert-triangle" color={C.red}  />
        <StatCard label="Reembolsos Pend."   value={reembolsos}                                      icon="rotate-ccw"   color={C.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Distribuição por estado */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📊 Distribuição por Estado</h3>
          {[
            { label: "Concluídos",  val: concluidos, cor: C.green,  type: "success" },
            { label: "Enviados",    val: transito,   cor: C.blue,   type: "info" },
            { label: "Pendentes",   val: pendentes,  cor: C.amber,  type: "warning" },
            { label: "Cancelados",  val: cancelados, cor: C.red,    type: "danger" },
            { label: "Disputas",    val: disputas,   cor: C.red,    type: "danger" },
            { label: "Reembolsos",  val: reembolsos, cor: C.purple, type: "purple" },
          ].map(({ label, val, cor, type }, i) => {
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
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

        {/* Volume por província */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>🗺️ Volume por Província (MZN)</h3>
          <p style={{ fontSize: 12, color: C.textMute, marginBottom: 16 }}>Total movimentado por região</p>
          {Object.entries(provincias).sort((a, b) => b[1] - a[1]).map(([prov, vol], i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{prov}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{vol.toLocaleString("pt-MZ")} MZN</span>
              </div>
              <div style={{ height: 5, background: C.border, borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${(vol / maxProv) * 100}%`, background: C.blue, borderRadius: 99 }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>💳 Métodos de Pagamento</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(metodos).map(([m, count], i) => (
                <div key={i} style={{ flex: 1, minWidth: 80, background: C.bg, borderRadius: 10, padding: "10px 12px", textAlign: "center", border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{count}</p>
                  <p style={{ fontSize: 11, color: C.textMute, marginTop: 2 }}>{m}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disputas e reembolsos ativos */}
      {(disputas > 0 || reembolsos > 0) && (
        <div style={{ background: C.redDim, border: `1.5px solid ${C.red}30`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="alert-triangle" size={16} color={C.red} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.red }}>🚨 Pedidos a Requerer Atenção Imediata</h3>
          </div>
          {pedidos.filter(p => p.estado === "disputa" || p.estado === "reembolso").map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.red}15` }}>
              <Badge label={p.estado === "disputa" ? "DISPUTA" : "REEMBOLSO"} type="danger" />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>{p.id} — {p.produto}</span>
              <span style={{ fontSize: 12, color: C.textSub }}>{p.total.toLocaleString("pt-MZ")} MZN</span>
              <Btn label="Intervir" icon="shield" size="sm" variant="danger" onClick={() => onSelectPedido(p)} />
            </div>
          ))}
        </div>
      )}

      {/* Pedidos recentes */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>🕐 Pedidos Recentes</h3>
          <Badge label={`${pedidos.length} total`} type="default" />
        </div>
        {pedidos.slice(0, 5).map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}
            onClick={() => onSelectPedido(p)}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: ESTADOS[p.estado] ? ESTADOS[p.estado].cor + "18" : C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="shopping-bag" size={15} color={ESTADOS[p.estado]?.cor || C.textMute} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.id} — {p.produto}</p>
              <p style={{ fontSize: 11, color: C.textMute }}>{p.comprador} → {p.vendedor} · {p.data}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{p.total.toLocaleString("pt-MZ")} MZN</p>
              <Badge label={ESTADOS[p.estado]?.label || p.estado} type={ESTADOS[p.estado]?.type || "default"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. LISTA DE PEDIDOS ───────────────────────────────────────────────────────
function SubListaPedidos({ pedidos, setPedidos, onSelectPedido }) {
  const [busca, setBusca] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroMetodo, setFiltroMetodo] = useState("todos");
  const [filtroProv, setFiltroProv] = useState("todas");
  const [ordenar, setOrdenar] = useState("recente");

  let lista = pedidos.filter(p => {
    const ok1 = filtroEstado === "todos" || p.estado === filtroEstado;
    const ok2 = filtroMetodo === "todos" || p.metodo === filtroMetodo;
    const ok3 = filtroProv === "todas" || p.provincia === filtroProv;
    const ok4 = p.id.toLowerCase().includes(busca.toLowerCase()) ||
                p.comprador.toLowerCase().includes(busca.toLowerCase()) ||
                p.produto.toLowerCase().includes(busca.toLowerCase());
    return ok1 && ok2 && ok3 && ok4;
  });
  if (ordenar === "recente") lista = [...lista].reverse();
  else if (ordenar === "maior") lista = [...lista].sort((a, b) => b.total - a.total);
  else if (ordenar === "menor") lista = [...lista].sort((a, b) => a.total - b.total);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filtros */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon name="search" size={14} color={C.textMute} /></span>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar pedido #, comprador ou produto..."
            style={{ width: "100%", padding: "8px 12px 8px 32px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" }} />
        </div>
        {[
          { value: filtroEstado, setValue: setFiltroEstado, options: [["todos","Todos os estados"],["pendente","Pendente"],["pago","Pago"],["enviado","Enviado"],["concluido","Concluído"],["cancelado","Cancelado"],["disputa","Disputa"],["reembolso","Reembolso"]] },
          { value: filtroMetodo, setValue: setFiltroMetodo, options: [["todos","Todos os métodos"],["M-Pesa","M-Pesa"],["E-Mola","E-Mola"],["Banco","Banco"]] },
          { value: filtroProv,   setValue: setFiltroProv,   options: [["todas","Todas as províncias"],["Maputo","Maputo"],["Sofala","Sofala"],["Nampula","Nampula"],["Gaza","Gaza"],["Zambézia","Zambézia"]] },
          { value: ordenar,      setValue: setOrdenar,      options: [["recente","Mais recentes"],["maior","Maior valor"],["menor","Menor valor"]] },
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
                {["Pedido #","Produto","Comprador","Vendedor","Método","Província","Total (MZN)","Data","Estado","Ações"].map((c, i) => (
                  <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: C.textMute, whiteSpace: "nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((p, i) => {
                const est = ESTADOS[p.estado] || {};
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontWeight: 800, color: C.blue, fontFamily: "monospace" }}>{p.id}</span>
                      {p.fraude && <span style={{ marginLeft: 6, fontSize: 10, background: C.redDim, color: C.red, fontWeight: 700, padding: "2px 6px", borderRadius: 99 }}>FRAUDE</span>}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: C.text, maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.produto}</td>
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
                    <td style={{ padding: "12px 14px", color: C.textSub, fontSize: 13 }}>{p.provincia}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: C.green }}>{p.total.toLocaleString("pt-MZ")}</td>
                    <td style={{ padding: "12px 14px", color: C.textSub, whiteSpace: "nowrap" }}>{p.data}</td>
                    <td style={{ padding: "12px 14px" }}><Badge label={est.label || p.estado} type={est.type || "default"} /></td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn label="Ver" icon="eye" size="sm" variant="ghost" onClick={() => onSelectPedido(p)} />
                        {p.estado === "disputa" && <Btn label="Intervir" icon="shield" size="sm" variant="danger" onClick={() => onSelectPedido(p)} />}
                        {p.estado === "pendente" && <Btn label="Cancelar" icon="x" size="sm" variant="secondary" onClick={() => setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, estado: "cancelado" } : x))} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textMute, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Mostrando {lista.length} de {pedidos.length} pedidos</span>
          <span style={{ fontWeight: 700, color: C.green }}>{lista.reduce((s, p) => s + p.total, 0).toLocaleString("pt-MZ")} MZN total filtrado</span>
        </div>
      </div>
    </div>
  );
}

// ── 3. DETALHE DO PEDIDO ──────────────────────────────────────────────────────
function SubDetalhePedido({ pedido, onVoltar, setPedidos }) {
  const [modalIntervir, setModalIntervir] = useState(false);
  const [modalReembolso, setModalReembolso] = useState(false);
  const [notaIntervencao, setNotaIntervencao] = useState("");
  const est = ESTADOS[pedido.estado] || {};

  const TIMELINE_ICONS = { "Pedido criado": "shopping-bag", "Pagamento confirmado": "credit-card", "Enviado": "truck", "Concluído": "check", "Cancelado pelo comprador": "x", "Disputa aberta pelo comprador": "alert-triangle", "Reembolso solicitado": "rotate-ccw" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onVoltar} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: C.textSub, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>← Voltar</button>
        <div style={{ width: 1, height: 24, background: C.border }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: (est.cor || C.blue) + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="shopping-bag" size={18} color={est.cor || C.blue} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Pedido {pedido.id}</p>
            <p style={{ fontSize: 12, color: C.textMute }}>{pedido.produto} · {pedido.data}</p>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <Badge label={est.label || pedido.estado} type={est.type || "default"} />
          {pedido.estado === "disputa" && <Btn label="Intervir na Disputa" icon="shield" variant="danger" onClick={() => setModalIntervir(true)} />}
          {(pedido.estado === "pago" || pedido.estado === "enviado") && <Btn label="Forçar Reembolso" icon="rotate-ccw" variant="amber" onClick={() => setModalReembolso(true)} />}
          <Btn label="Exportar PDF" icon="download" variant="secondary" size="sm" />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Valor Total"       value={`${pedido.total.toLocaleString("pt-MZ")} MZN`} icon="dollar"      color={C.green} />
        <StatCard label="Método Pagamento"  value={pedido.metodo}                                  icon="credit-card" color={C.blue} />
        <StatCard label="Província"         value={pedido.provincia}                               icon="map-pin"     color={C.purple} />
        <StatCard label="Afiliado"          value={pedido.afiliado || "Nenhum"}                    icon="link"        color={pedido.afiliado ? C.amber : C.textMute} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Informações do pedido */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>📦 Detalhes do Pedido</h3>
          {[
            ["ID do Pedido",    pedido.id],
            ["Produto",        pedido.produto],
            ["Data",           pedido.data],
            ["Método",         pedido.metodo],
            ["Província",      pedido.provincia],
            ["Suspeita Fraude", pedido.fraude ? "⚠️ Sim — investigar" : "✅ Nenhuma"],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 12, color: C.textMute, fontWeight: 500 }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: pedido.fraude && k === "Suspeita Fraude" ? C.red : C.text }}>{v}</span>
            </div>
          ))}

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: C.bg, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 11, color: C.textMute, fontWeight: 600, marginBottom: 6 }}>COMPRADOR</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{pedido.comprador}</p>
              <p style={{ fontSize: 11, color: C.textMute }}>{pedido.compradorEmail}</p>
            </div>
            <div style={{ background: C.bg, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 11, color: C.textMute, fontWeight: 600, marginBottom: 6 }}>VENDEDOR</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{pedido.vendedor}</p>
              <p style={{ fontSize: 11, color: C.textMute }}>{pedido.vendedorEmail}</p>
            </div>
          </div>

          {pedido.afiliado && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: C.amberDim, borderRadius: 10, border: `1px solid ${C.amber}30` }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.amber }}>🔗 Afiliado: {pedido.afiliado} — comissão pendente de liberação</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>📋 Timeline do Pedido</h3>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: C.border }} />
            {pedido.historico.map((h, i) => {
              const isLast = i === pedido.historico.length - 1;
              const iconName = TIMELINE_ICONS[h.acao] || "info";
              const isAlert = h.acao.toLowerCase().includes("disputa") || h.acao.toLowerCase().includes("cancel") || h.acao.toLowerCase().includes("reembolso");
              return (
                <div key={i} style={{ display: "flex", gap: 16, marginBottom: i < pedido.historico.length - 1 ? 20 : 0, position: "relative" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: isLast ? C.green : isAlert ? C.red : C.bg, border: `2px solid ${isLast ? C.green : isAlert ? C.red : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                    <Icon name={iconName} size={13} color={isLast ? "#fff" : isAlert ? C.red : C.textMute} />
                  </div>
                  <div style={{ paddingTop: 5 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: isAlert ? C.red : C.text }}>{h.acao}</p>
                    <p style={{ fontSize: 11, color: C.textMute }}>{h.data}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {pedido.estado === "disputa" && (
            <div style={{ marginTop: 20, padding: "12px 14px", background: C.redDim, borderRadius: 10, border: `1.5px solid ${C.red}30` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 4 }}>⚠️ Disputa Ativa</p>
              <p style={{ fontSize: 12, color: C.textSub }}>O comprador reportou um problema. Intervenha para mediar ou forçar resolução.</p>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <Btn label="Aprovar comprador" icon="check" size="sm" variant="ghost" />
                <Btn label="Aprovar vendedor" icon="check" size="sm" variant="secondary" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Intervir */}
      <Modal open={modalIntervir} onClose={() => setModalIntervir(false)} width={460}>
        <div style={{ padding: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.redDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="shield" size={20} color={C.red} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Intervir na Disputa</h3>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}>Pedido <strong>{pedido.id}</strong> — <strong>{pedido.produto}</strong></p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <button onClick={() => { setPedidos(prev => prev.map(x => x.id === pedido.id ? { ...x, estado: "reembolso" } : x)); setModalIntervir(false); onVoltar && null; }}
              style={{ padding: "12px", background: C.blueDim, border: `1.5px solid ${C.blue}30`, borderRadius: 10, cursor: "pointer", textAlign: "left" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>✅ Favor comprador</p>
              <p style={{ fontSize: 11, color: C.textMute, marginTop: 3 }}>Iniciar reembolso total ao comprador</p>
            </button>
            <button onClick={() => { setPedidos(prev => prev.map(x => x.id === pedido.id ? { ...x, estado: "concluido" } : x)); setModalIntervir(false); }}
              style={{ padding: "12px", background: C.greenDim, border: `1.5px solid ${C.green}30`, borderRadius: 10, cursor: "pointer", textAlign: "left" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.green }}>✅ Favor vendedor</p>
              <p style={{ fontSize: 11, color: C.textMute, marginTop: 3 }}>Concluir pedido e libertar pagamento</p>
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nota de intervenção (obrigatório)</label>
            <textarea value={notaIntervencao} onChange={e => setNotaIntervencao(e.target.value)} rows={3} placeholder="Descreva o motivo da intervenção..."
              style={{ width: "100%", padding: "10px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ padding: "10px 12px", background: C.amberDim, borderRadius: 8, fontSize: 12, color: C.amber, fontWeight: 500, marginBottom: 16 }}>
            ⚠️ Esta ação é registada no log de auditoria. Ambas as partes serão notificadas.
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
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}>O valor de <strong>{pedido.total.toLocaleString("pt-MZ")} MZN</strong> será devolvido ao comprador via <strong>{pedido.metodo}</strong>.</p>
          <div style={{ padding: "10px 12px", background: C.redDim, borderRadius: 8, fontSize: 12, color: C.red, fontWeight: 500, marginBottom: 20 }}>
            ⚠️ O vendedor será notificado e o pagamento revertido. Esta ação não pode ser desfeita facilmente.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Cancelar" variant="secondary" onClick={() => setModalReembolso(false)} />
            <Btn label="Confirmar reembolso" variant="danger" onClick={() => { setPedidos(prev => prev.map(x => x.id === pedido.id ? { ...x, estado: "reembolso" } : x)); setModalReembolso(false); }} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── 4. DISPUTAS ───────────────────────────────────────────────────────────────
function SubDisputas({ pedidos, setPedidos, onSelectPedido }) {
  const disputas   = pedidos.filter(p => p.estado === "disputa");
  const reembolsos = pedidos.filter(p => p.estado === "reembolso");
  const fraudes    = pedidos.filter(p => p.fraude);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Disputas Ativas"    value={disputas.length}                                                    icon="alert-triangle" color={C.red} />
        <StatCard label="Reembolsos Pend."   value={reembolsos.length}                                                  icon="rotate-ccw"     color={C.purple} />
        <StatCard label="Valor em Disputa"   value={`${disputas.reduce((s,p)=>s+p.total,0).toLocaleString("pt-MZ")} MZN`} icon="dollar"        color={C.amber} />
        <StatCard label="Suspeita de Fraude" value={fraudes.length}                                                     icon="shield"         color={C.red} />
      </div>

      {disputas.length === 0 && reembolsos.length === 0 ? (
        <div style={{ background: C.greenDim, border: `1.5px solid ${C.green}30`, borderRadius: 14, padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.green }}>Sem disputas ou reembolsos pendentes</p>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>Todos os pedidos estão em conformidade.</p>
        </div>
      ) : (
        <>
          {disputas.length > 0 && (
            <div style={{ background: C.card, border: `1.5px solid ${C.red}30`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", background: C.redDim, borderBottom: `1px solid ${C.red}20`, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="alert-triangle" size={15} color={C.red} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.red }}>Disputas Abertas ({disputas.length})</h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                    {["Pedido","Produto","Comprador","Vendedor","Valor","Ações"].map((c, i) => (
                      <th key={i} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: C.textMute }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {disputas.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "12px 14px", fontWeight: 800, color: C.blue, fontFamily: "monospace" }}>{p.id}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: C.text }}>{p.produto}</td>
                      <td style={{ padding: "12px 14px", color: C.textSub }}>{p.comprador}</td>
                      <td style={{ padding: "12px 14px", color: C.textSub }}>{p.vendedor}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: C.red }}>{p.total.toLocaleString("pt-MZ")} MZN</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Btn label="Intervir" icon="shield" size="sm" variant="danger" onClick={() => onSelectPedido(p)} />
                          <Btn label="Reembolsar" icon="rotate-ccw" size="sm" variant="secondary" onClick={() => setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, estado: "reembolso" } : x))} />
                          <Btn label="Resolver" icon="check" size="sm" variant="ghost" onClick={() => setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, estado: "concluido" } : x))} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reembolsos.length > 0 && (
            <div style={{ background: C.card, border: `1.5px solid ${C.purple}30`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", background: C.purpleDim, borderBottom: `1px solid ${C.purple}20`, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="rotate-ccw" size={15} color={C.purple} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.purple }}>Reembolsos Pendentes ({reembolsos.length})</h3>
              </div>
              {reembolsos.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: i < reembolsos.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontWeight: 800, color: C.blue, fontFamily: "monospace" }}>{p.id}</span>
                  <span style={{ flex: 1, fontWeight: 600, color: C.text }}>{p.produto}</span>
                  <span style={{ color: C.textSub }}>{p.comprador}</span>
                  <span style={{ fontWeight: 700, color: C.purple }}>{p.total.toLocaleString("pt-MZ")} MZN</span>
                  <Btn label="Processar" icon="check" size="sm" variant="ghost" onClick={() => setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, estado: "cancelado" } : x))} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Log disputas */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>📋 Log de Ações em Disputas</h3>
        {[
          { acao: "Disputa resolvida a favor do comprador", pedido: "#4810", data: "16 Abr 11:00", admin: "super_admin", tipo: "info" },
          { acao: "Reembolso processado — 1 200 MZN devolvidos", pedido: "#4805", data: "15 Abr 09:30", admin: "mod_finance", tipo: "success" },
          { acao: "Pedido sinalizado como potencial fraude", pedido: "#4818", data: "17 Abr 20:05", admin: "sistema", tipo: "danger" },
          { acao: "Disputa encerrada a favor do vendedor", pedido: "#4801", data: "14 Abr 16:00", admin: "super_admin", tipo: "default" },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
            <Badge label={l.tipo === "danger" ? "Crítico" : l.tipo === "success" ? "Resolvido" : l.tipo === "info" ? "Intervenção" : "Info"} type={l.tipo} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{l.acao}</p>
              <p style={{ fontSize: 11, color: C.textMute }}>Pedido: {l.pedido} · Por: {l.admin}</p>
            </div>
            <span style={{ fontSize: 11, color: C.textMute, whiteSpace: "nowrap" }}>{l.data}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 5. CONFIGURAÇÕES ──────────────────────────────────────────────────────────
function SubConfiguracoes() {
  const [vals, setVals] = useState({ prazoEnvio: "3", prazoEntrega: "7", prazoDisputa: "14", autoConfirmar: "48" });
  const [toggles, setToggles] = useState({
    autoConfirm: true, notifComprador: true, notifVendedor: true,
    bloquearFraude: true, revisaoManual: false, disputaAuto: false,
  });

  const Toggle = ({ label, k }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 13, color: C.textSub, fontWeight: 500 }}>{label}</span>
      <div onClick={() => setToggles(p => ({ ...p, [k]: !p[k] }))}
        style={{ width: 38, height: 22, borderRadius: 99, cursor: "pointer", background: toggles[k] ? C.green : C.border, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: toggles[k] ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left 0.2s" }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>⚙️ Prazos Operacionais</h3>
          {[
            { label: "Prazo máximo envio (dias)", k: "prazoEnvio" },
            { label: "Prazo máximo entrega (dias)", k: "prazoEntrega" },
            { label: "Janela de disputa (dias após entrega)", k: "prazoDisputa" },
            { label: "Auto-confirmação entrega (horas)", k: "autoConfirmar" },
          ].map(({ label, k }, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMute, display: "block", marginBottom: 5 }}>{label}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={vals[k]} onChange={e => setVals(p => ({ ...p, [k]: e.target.value }))}
                  style={{ flex: 1, padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none" }} />
                <Btn label="Salvar" size="sm" variant="ghost" />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>🔔 Automações & Notificações</h3>
          <p style={{ fontSize: 12, color: C.textMute, marginBottom: 16 }}>Controla o comportamento automático da plataforma</p>
          <Toggle label="Auto-confirmação de entrega"       k="autoConfirm" />
          <Toggle label="Notificar comprador em cada estado" k="notifComprador" />
          <Toggle label="Notificar vendedor em cada estado"  k="notifVendedor" />
          <Toggle label="Bloquear pedidos com risco de fraude" k="bloquearFraude" />
          <Toggle label="Revisão manual para pedidos > 5 000 MZN" k="revisaoManual" />
          <Toggle label="Resolução automática de disputas (IA)" k="disputaAuto" />
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Icon name="zap" size={16} color={C.purple} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>💡 Sugestões do Sistema</h3>
          <Badge label="Beta" type="purple" />
        </div>
        {[
          { msg: "3 pedidos marcados como 'Pago' há mais de 48h sem envio. Considera notificar os vendedores.", icon: "truck", cor: C.amber },
          { msg: "O pedido #4818 tem padrão de fraude (IP repetido + auto-afiliação). Investigar urgente.", icon: "alert-triangle", cor: C.red },
          { msg: "Taxa de cancelamento subiu 4% esta semana. Verifica os vendedores com mais cancelamentos.", icon: "trending-up", cor: C.blue },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
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

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const SUBTABS = [
  { id: "visao",   label: "Visão Geral", icon: "bar-chart" },
  { id: "lista",   label: "Pedidos",     icon: "shopping-bag" },
  { id: "disputas",label: "Disputas",    icon: "alert-triangle", badge: true },
  { id: "config",  label: "Configurações", icon: "settings" },
];

export default function PagePedidos() {
  const [subtab, setSubtab] = useState("visao");
  const [pedidos, setPedidos] = useState(PEDIDOS_MOCK);
  const [pedidoDetalhe, setPedidoDetalhe] = useState(null);

  const disputasCount = pedidos.filter(p => p.estado === "disputa").length;

  const handleSelect = (p) => { setPedidoDetalhe(p); setSubtab("detalhe"); };
  const handleVoltar = () => { setPedidoDetalhe(null); setSubtab("lista"); };

  const conteudo = {
    visao:    <SubVisaoGeral   pedidos={pedidos} onSelectPedido={handleSelect} />,
    lista:    <SubListaPedidos pedidos={pedidos} setPedidos={setPedidos} onSelectPedido={handleSelect} />,
    disputas: <SubDisputas     pedidos={pedidos} setPedidos={setPedidos} onSelectPedido={handleSelect} />,
    config:   <SubConfiguracoes />,
    detalhe:  pedidoDetalhe ? <SubDetalhePedido pedido={pedidoDetalhe} onVoltar={handleVoltar} setPedidos={setPedidos} /> : null,
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Gestão de Pedidos</h2>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Acompanhar e intervir em todos os pedidos da plataforma</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Relatório PDF"   icon="download" variant="secondary" size="sm" />
          <Btn label="Relatório Excel" icon="download" variant="ghost"     size="sm" />
        </div>
      </div>

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
                  <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: C.red, color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{disputasCount}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {conteudo[subtab]}
    </div>
  );
}