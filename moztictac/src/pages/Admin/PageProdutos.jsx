// ─── PageProdutos — Super Admin MozTicTac ────────────────────────────────────
// Substitui a função PageProdutos() no ficheiro do admin existente.
// Usa os mesmos helpers: C, Icon, Badge, StatCard, Btn, Input, Toggle, Modal
// que já existem no teu AdminPanel.jsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

// ── Paleta (igual ao admin existente) ─────────────────────────────────────────
const C = {
  green: "#16a34a", greenDim: "#dcfce7", greenMuted: "rgba(22,163,74,0.12)",
  bg: "#f8fafc", card: "#ffffff", border: "#e2e8f0",
  text: "#0f172a", textSub: "#64748b", textMute: "#94a3b8",
  red: "#ef4444", redDim: "#fef2f2",
  amber: "#f59e0b", amberDim: "#fffbeb",
  blue: "#3b82f6", blueDim: "#eff6ff",
  purple: "#8b5cf6", purpleDim: "#f5f3ff",
};

// ── Dados mock ────────────────────────────────────────────────────────────────
const CATEGORIAS_LISTA = [
  "Electrónica", "Moda e Vestuário", "Casa e Decoração",
  "Serviços Profissionais", "Educação e Formação",
  "Saúde e Beleza", "Alimentação", "Veículos", "Calçado", "Acessórios", "Outro",
];

const PRODUTOS_MOCK = [
  // ── Activos
  { id: "P001", nome: "Ténis Nike Air Max 2024",  tipo: "produto",  estado: "ativo",     vendedor: "Ana Lopes",    vendedorId: "AF002", cat: "Calçado",               preco: 3200,  stock: 14,  afiliados: true,  comissao: 8,  vendas: 214, entrega: true,  atacado: false, submissao: "10 Mar 2025", suspeito: false },
  { id: "P002", nome: "Conjunto Capulana Bordada", tipo: "produto",  estado: "ativo",     vendedor: "Fátima Dique", vendedorId: "AF004", cat: "Moda e Vestuário",       preco: 1850,  stock: 31,  afiliados: true,  comissao: 12, vendas: 189, entrega: true,  atacado: true,  submissao: "15 Mar 2025", suspeito: false },
  { id: "P003", nome: "Aulas de Culinária Online", tipo: "servico",  estado: "ativo",     vendedor: "Carlos Nhaca", vendedorId: "AF003", cat: "Educação e Formação",    preco: 1200,  stock: null,afiliados: false, comissao: 0,  vendas: 98,  entrega: false, atacado: false, submissao: "18 Mar 2025", suspeito: false },
  { id: "P004", nome: "Castanha de Caju 1kg",      tipo: "produto",  estado: "ativo",     vendedor: "Pedro Mabunda",vendedorId: "AF005", cat: "Alimentação",            preco: 450,   stock: 200, afiliados: false, comissao: 0,  vendas: 120, entrega: true,  atacado: true,  submissao: "20 Mar 2025", suspeito: false },
  { id: "P005", nome: "Laptop Lenovo IdeaPad",     tipo: "produto",  estado: "ativo",     vendedor: "João Matos",   vendedorId: "AF001", cat: "Electrónica",            preco: 65000, stock: 3,   afiliados: true,  comissao: 6,  vendas: 42,  entrega: true,  atacado: false, submissao: "22 Mar 2025", suspeito: false },
  // ── Pendentes
  { id: "P006", nome: "Perfume Chanel Nº5 (réplica)",tipo:"produto", estado: "pendente",  vendedor: "Carlos Nhaca", vendedorId: "AF003", cat: "Acessórios",             preco: 4500,  stock: 8,   afiliados: true,  comissao: 10, vendas: 0,   entrega: true,  atacado: false, submissao: "17 Abr 2025", suspeito: false },
  { id: "P007", nome: "Aulas de Inglês Online",     tipo: "servico", estado: "pendente",  vendedor: "João Matos",   vendedorId: "AF001", cat: "Educação e Formação",    preco: 800,   stock: null,afiliados: false, comissao: 0,  vendas: 0,   entrega: false, atacado: false, submissao: "17 Abr 2025", suspeito: false },
  { id: "P008", nome: "Cadeira de Escritório Pro",  tipo: "produto", estado: "pendente",  vendedor: "Fátima Dique", vendedorId: "AF004", cat: "Casa e Decoração",       preco: 22000, stock: 5,   afiliados: true,  comissao: 11, vendas: 0,   entrega: true,  atacado: false, submissao: "18 Abr 2025", suspeito: false },
  { id: "P009", nome: "Consultoria de TI — hora",   tipo: "servico", estado: "pendente",  vendedor: "Pedro Mabunda",vendedorId: "AF005", cat: "Serviços Profissionais",  preco: 3500,  stock: null,afiliados: false, comissao: 0,  vendas: 0,   entrega: false, atacado: false, submissao: "18 Abr 2025", suspeito: false },
  // ── Suspeitos / rejeitados
  { id: "P010", nome: "Produto Suspeito XYZ v2",    tipo: "produto", estado: "suspeito",  vendedor: "spam99",       vendedorId: "X001",  cat: "Outro",                  preco: 50,    stock: 999, afiliados: true,  comissao: 30, vendas: 12,  entrega: false, atacado: false, submissao: "15 Abr 2025", suspeito: true  },
  { id: "P011", nome: "Remédio Milagroso Gold",     tipo: "produto", estado: "rejeitado", vendedor: "spam99",       vendedorId: "X001",  cat: "Saúde e Beleza",         preco: 2500,  stock: 50,  afiliados: true,  comissao: 25, vendas: 0,   entrega: true,  atacado: false, submissao: "14 Abr 2025", suspeito: true  },
  // ── Pausados
  { id: "P012", nome: "Bicicleta City Tour",        tipo: "produto", estado: "pausado",   vendedor: "Ana Lopes",    vendedorId: "AF002", cat: "Veículos",               preco: 18000, stock: 1,   afiliados: true,  comissao: 9,  vendas: 54,  entrega: false, atacado: false, submissao: "01 Fev 2025", suspeito: false },
];

const MOTIVOS_REJEICAO = [
  "Produto proibido ou ilegal",
  "Réplica ou contrafação declarada",
  "Informação insuficiente / imagens em falta",
  "Preço incorreto ou enganoso",
  "Categoria incorreta",
  "Produto de saúde sem certificação",
  "Outro motivo",
];

// ── Helpers locais ─────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width: size, height: size, stroke: color, fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 };
  const icons = {
    "package":        <svg style={s} viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    "check":          <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    "x":              <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    "bell":           <svg style={s} viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    "eye":            <svg style={s} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    "shield":         <svg style={s} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "download":       <svg style={s} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    "search":         <svg style={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    "alert-triangle": <svg style={s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    "star":           <svg style={s} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    "percent":        <svg style={s} viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    "pause":          <svg style={s} viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    "play":           <svg style={s} viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    "user":           <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    "link":           <svg style={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    "truck":          <svg style={s} viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    "tag":            <svg style={s} viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    "trending-up":    <svg style={s} viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    "edit":           <svg style={s} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    "bar-chart":      <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    "info":           <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    "settings":       <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
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

function StatCard({ label, value, icon, color = C.green, trend }) {
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
      </div>
    </div>
  );
}

function Btn({ label, icon, onClick, variant = "primary", size = "md", disabled = false }) {
  const styles = {
    primary:   { bg: C.green,       color: "#fff",    border: "none" },
    secondary: { bg: "transparent", color: C.textSub, border: `1.5px solid ${C.border}` },
    danger:    { bg: C.red,         color: "#fff",    border: "none" },
    ghost:     { bg: C.greenMuted,  color: C.green,   border: "none" },
    amber:     { bg: C.amberDim,    color: C.amber,   border: "none" },
  };
  const pad = size === "sm" ? "5px 11px" : "9px 18px";
  const fs  = size === "sm" ? 12 : 13;
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: pad, fontSize: fs, fontWeight: 700, background: disabled ? "#f1f5f9" : s.bg, color: disabled ? C.textMute : s.color, border: s.border || "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, transition: "opacity 0.15s", whiteSpace: "nowrap", fontFamily: "inherit" }}>
      {icon && <Icon name={icon} size={12} color={disabled ? C.textMute : s.color} />}
      {label}
    </button>
  );
}

function Modal({ open, onClose, children, width = 540 }) {
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

// ── Badge de estado do produto ────────────────────────────────────────────────
function estadoBadge(estado) {
  const map = { ativo: ["Ativo", "success"], pendente: ["Pendente", "warning"], rejeitado: ["Rejeitado", "danger"], suspeito: ["Suspeito", "danger"], pausado: ["Pausado", "default"] };
  const [label, type] = map[estado] || ["—", "default"];
  return <Badge label={label} type={type} />;
}

// ── Card de produto (na fila de pendentes) ───────────────────────────────────
function CardPendente({ p, onAprovar, onRejeitar, onVer }) {
  const taxa = Math.round(p.preco * 0.105);
  const liquido = p.preco - taxa;
  return (
    <div style={{ background: C.card, border: `1.5px solid ${C.amber}40`, borderRadius: 14, padding: 18, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Ícone tipo */}
        <div style={{ width: 44, height: 44, borderRadius: 10, background: p.tipo === "produto" ? C.blueDim : C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={p.tipo === "produto" ? "package" : "settings"} size={20} color={p.tipo === "produto" ? C.blue : C.purple} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.nome}</p>
            <Badge label={p.tipo === "produto" ? "Produto" : "Serviço"} type={p.tipo === "produto" ? "info" : "purple"} />
            {p.suspeito && <Badge label="⚠️ Suspeito" type="danger" />}
          </div>
          <p style={{ fontSize: 12, color: C.textMute, marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: C.textSub }}>{p.vendedor}</span> · {p.cat} · Submetido em {p.submissao}
          </p>

          {/* Infos rápidas */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub }}>
              💰 {p.preco.toLocaleString("pt-MZ")} MZN
            </span>
            {p.tipo === "produto" && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub }}>
                📦 Stock: {p.stock}
              </span>
            )}
            {p.afiliados && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: C.greenDim, color: C.green }}>
                🔗 Afiliados {p.comissao}%
              </span>
            )}
            {p.entrega && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: C.blueDim, color: C.blue }}>
                🚚 Entrega
              </span>
            )}
          </div>

          {/* Preview de receita */}
          <div style={{ marginTop: 10, padding: "8px 12px", background: C.bg, borderRadius: 8, display: "flex", gap: 20 }}>
            <div style={{ fontSize: 11, color: C.textMute }}>Taxa plataforma: <strong style={{ color: C.red }}>{taxa.toLocaleString("pt-MZ")} MZN</strong></div>
            <div style={{ fontSize: 11, color: C.textMute }}>Vendedor recebe: <strong style={{ color: C.green }}>{liquido.toLocaleString("pt-MZ")} MZN</strong></div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        <Btn label="Ver detalhes"  icon="eye"     variant="secondary" size="sm" onClick={() => onVer(p)} />
        <Btn label="Aprovar"       icon="check"   variant="ghost"     size="sm" onClick={() => onAprovar(p.id)} />
        <Btn label="Rejeitar"      icon="x"       variant="danger"    size="sm" onClick={() => onRejeitar(p)} />
        {p.suspeito && <Btn label="Marcar como suspeito" icon="alert-triangle" variant="amber" size="sm" />}
      </div>
    </div>
  );
}

// ── Modal detalhe do produto ──────────────────────────────────────────────────
function ModalDetalhe({ p, onClose, onAprovar, onRejeitar }) {
  if (!p) return null;
  const taxa = Math.round(p.preco * 0.105);
  return (
    <Modal open onClose={onClose} width={560}>
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>{p.nome}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge label={p.tipo === "produto" ? "Produto" : "Serviço"} type={p.tipo === "produto" ? "info" : "purple"} />
              {estadoBadge(p.estado)}
              {p.suspeito && <Badge label="⚠️ Suspeito" type="danger" />}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.textMute, lineHeight: 1 }}>×</button>
        </div>

        {/* Grid de info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { icon: "user",       label: "Vendedor",      val: p.vendedor },
            { icon: "tag",        label: "Categoria",     val: p.cat },
            { icon: "bar-chart",  label: "Preço base",    val: `${p.preco.toLocaleString("pt-MZ")} MZN` },
            { icon: "trending-up",label: "Receita plataforma", val: `${taxa.toLocaleString("pt-MZ")} MZN (10.5%)` },
            ...(p.tipo === "produto" ? [{ icon: "package", label: "Stock", val: `${p.stock} unidades` }] : []),
            { icon: "star",       label: "Vendas",        val: p.vendas > 0 ? `${p.vendas} vendas` : "Ainda sem vendas" },
            { icon: "link",       label: "Afiliados",     val: p.afiliados ? `Sim — ${p.comissao}% comissão` : "Não" },
            { icon: "truck",      label: "Entrega",       val: p.entrega ? "Disponível" : "Não disponível" },
            { icon: "bell",       label: "Submetido em",  val: p.submissao },
          ].map(({ icon, label, val }, i) => (
            <div key={i} style={{ background: C.bg, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={icon} size={14} color={C.textSub} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: C.textMute, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Aviso se suspeito */}
        {p.suspeito && (
          <div style={{ padding: "10px 14px", background: C.redDim, border: `1px solid ${C.red}30`, borderRadius: 10, marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Icon name="alert-triangle" size={15} color={C.red} />
            <p style={{ fontSize: 12, color: C.red, fontWeight: 500, lineHeight: 1.5 }}>
              Este produto foi sinalizado pelo sistema como potencialmente suspeito. Verifique a legitimidade antes de aprovar.
            </p>
          </div>
        )}

        {/* Ações */}
        {p.estado === "pendente" && (
          <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <Btn label="Fechar"   variant="secondary" onClick={onClose} />
            <Btn label="Aprovar produto"  icon="check" variant="ghost"  onClick={() => { onAprovar(p.id); onClose(); }} />
            <Btn label="Rejeitar produto" icon="x"     variant="danger" onClick={() => { onRejeitar(p); onClose(); }} />
          </div>
        )}
        {p.estado !== "pendente" && (
          <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <Btn label="Fechar" variant="secondary" onClick={onClose} />
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Modal rejeitar com motivo ────────────────────────────────────────────────
function ModalRejeitar({ p, onClose, onConfirmar }) {
  const [motivo, setMotivo] = useState("");
  const [customMotivo, setCustomMotivo] = useState("");
  if (!p) return null;
  return (
    <Modal open onClose={onClose} width={440}>
      <div style={{ padding: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.redDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Icon name="x" size={20} color={C.red} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Rejeitar produto</p>
        <p style={{ fontSize: 13, color: C.textSub, marginBottom: 18 }}>
          Rejeitando <strong>{p.nome}</strong> de {p.vendedor}. Será enviada uma notificação ao vendedor com o motivo.
        </p>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Motivo da rejeição *</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {MOTIVOS_REJEICAO.map((m, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${motivo === m ? C.red : C.border}`, background: motivo === m ? C.redDim : C.bg, cursor: "pointer", transition: "all 0.15s" }}>
                <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => setMotivo(m)} style={{ accentColor: C.red }} />
                <span style={{ fontSize: 13, color: C.text }}>{m}</span>
              </label>
            ))}
          </div>
        </div>

        {motivo === "Outro motivo" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Descrever motivo</label>
            <textarea value={customMotivo} onChange={e => setCustomMotivo(e.target.value)} rows={3}
              placeholder="Descreve o motivo da rejeição..."
              style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, resize: "none", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Cancelar"                 variant="secondary" onClick={onClose} />
          <Btn label="Confirmar rejeição" icon="x" variant="danger"    disabled={!motivo} onClick={() => { onConfirmar(p.id, motivo === "Outro motivo" ? customMotivo : motivo); onClose(); }} />
        </div>
      </div>
    </Modal>
  );
}

// ── Modal ajustar comissão afiliada ──────────────────────────────────────────
function ModalComissao({ p, onClose, onConfirmar }) {
  const [val, setVal] = useState(p?.comissao || 5);
  if (!p) return null;
  return (
    <Modal open onClose={onClose} width={400}>
      <div style={{ padding: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Ajustar comissão afiliada</p>
        <p style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}>Produto: <strong>{p.nome}</strong></p>
        <label style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
          Taxa de comissão: <span style={{ color: C.green, fontSize: 18, fontWeight: 800 }}>{val}%</span>
        </label>
        <input type="range" min="1" max="30" step="1" value={val} onChange={e => setVal(Number(e.target.value))}
          style={{ width: "100%", accentColor: C.green, marginBottom: 16 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMute, marginBottom: 18 }}>
          <span>1% (mín.)</span><span>30% (máx.)</span>
        </div>
        <div style={{ padding: "10px 14px", background: C.greenDim, borderRadius: 8, fontSize: 12, color: C.green, fontWeight: 500, marginBottom: 20 }}>
          Ganho por venda para afiliado: {Math.round(p.preco * val / 100).toLocaleString("pt-MZ")} MZN
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Cancelar"    variant="secondary" onClick={onClose} />
          <Btn label="Guardar taxa" icon="check" onClick={() => { onConfirmar(p.id, val); onClose(); }} />
        </div>
      </div>
    </Modal>
  );
}

// ── Tabela geral de produtos ──────────────────────────────────────────────────
function TabelaProdutos({ lista, onVer, onToggleEstado, onAprovar, onRejeitar, onDestaque, onComissao }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1.5px solid ${C.border}`, background: C.bg }}>
            {["Produto", "Vendedor", "Tipo", "Categoria", "Preço (MZN)", "Vendas", "Afiliados", "Estado", "Ações"].map((c, i) => (
              <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: C.textMute, whiteSpace: "nowrap" }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 && (
            <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: C.textMute, fontSize: 13 }}>Nenhum produto encontrado.</td></tr>
          )}
          {lista.map((p, i) => (
            <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: p.tipo === "produto" ? C.blueDim : C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={p.tipo === "produto" ? "package" : "settings"} size={15} color={p.tipo === "produto" ? C.blue : C.purple} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: C.text, whiteSpace: "nowrap", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</p>
                    {p.tipo === "produto" && <p style={{ fontSize: 11, color: C.textMute }}>Stock: {p.stock ?? "—"}</p>}
                  </div>
                </div>
              </td>
              <td style={{ padding: "12px 14px", color: C.textSub, fontWeight: 500, whiteSpace: "nowrap" }}>{p.vendedor}</td>
              <td style={{ padding: "12px 14px" }}>
                <Badge label={p.tipo === "produto" ? "Produto" : "Serviço"} type={p.tipo === "produto" ? "info" : "purple"} />
              </td>
              <td style={{ padding: "12px 14px", color: C.textSub, whiteSpace: "nowrap" }}>{p.cat}</td>
              <td style={{ padding: "12px 14px", fontWeight: 700, color: C.text, whiteSpace: "nowrap", fontFamily: "monospace" }}>
                {p.preco.toLocaleString("pt-MZ")}
              </td>
              <td style={{ padding: "12px 14px", color: C.textSub }}>{p.vendas}</td>
              <td style={{ padding: "12px 14px" }}>
                {p.afiliados
                  ? <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>✓ {p.comissao}%</span>
                  : <span style={{ fontSize: 12, color: C.textMute }}>—</span>}
              </td>
              <td style={{ padding: "12px 14px" }}>{estadoBadge(p.estado)}</td>
              <td style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 4", flexWrap: "nowrap", gap: 4 }}>
                  <Btn label="Ver"  icon="eye"  size="sm" variant="ghost"     onClick={() => onVer(p)} />
                  {p.estado === "pendente" && <>
                    <Btn label="✓" size="sm" variant="ghost"    onClick={() => onAprovar(p.id)} />
                    <Btn label="✕" size="sm" variant="danger"   onClick={() => onRejeitar(p)} />
                  </>}
                  {p.estado === "ativo" && <>
                    <Btn label="Pausar"   icon="pause"   size="sm" variant="secondary" onClick={() => onToggleEstado(p.id)} />
                    <Btn label="Destaque" icon="star"    size="sm" variant="amber"     onClick={() => onDestaque(p.id)} />
                    {p.afiliados && <Btn label="%" icon="percent" size="sm" variant="secondary" onClick={() => onComissao(p)} />}
                  </>}
                  {p.estado === "pausado" && (
                    <Btn label="Ativar" icon="play" size="sm" variant="ghost" onClick={() => onToggleEstado(p.id)} />
                  )}
                  {p.suspeito && (
                    <Btn label="🚨" size="sm" variant="secondary" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function PageProdutos() {
  const [produtos, setProdutos] = useState(PRODUTOS_MOCK);
  const [subtab, setSubtab] = useState("todos");
  const [busca, setBusca] = useState("");
  const [filtroCat, setFiltroCat] = useState("todas");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [modalDetalhe, setModalDetalhe] = useState(null);
  const [modalRejeitar, setModalRejeitar] = useState(null);
  const [modalComissao, setModalComissao] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Contagens
  const totalAtivos    = produtos.filter(p => p.estado === "ativo").length;
  const totalPendentes = produtos.filter(p => p.estado === "pendente").length;
  const totalSuspeitos = produtos.filter(p => p.suspeito || p.estado === "suspeito").length;
  const totalRejeitados = produtos.filter(p => p.estado === "rejeitado").length;

  // Toast helper
  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2800); };

  // Ações
  const handleAprovar = (id) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, estado: "ativo" } : p));
    toast("✅ Produto aprovado e publicado.");
  };
  const handleRejeitar = (p) => setModalRejeitar(p);
  const confirmarRejeicao = (id, motivo) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, estado: "rejeitado" } : p));
    toast(`❌ Produto rejeitado: "${motivo}". Notificação enviada ao vendedor.`);
  };
  const handleToggleEstado = (id) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, estado: p.estado === "ativo" ? "pausado" : "ativo" } : p));
  };
  const handleDestaque = (id) => toast("⭐ Produto destacado no feed por 7 dias.");
  const handleComissao = (p) => setModalComissao(p);
  const confirmarComissao = (id, val) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, comissao: val } : p));
    toast(`🔗 Comissão de afiliados actualizada para ${val}%.`);
  };

  // Filtro de lista
  const pendentes = produtos.filter(p => p.estado === "pendente");
  const suspeitos = produtos.filter(p => p.suspeito || p.estado === "suspeito");

  let listaFiltrada = produtos.filter(p => {
    const okBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.vendedor.toLowerCase().includes(busca.toLowerCase());
    const okCat   = filtroCat === "todas" || p.cat === filtroCat;
    const okTipo  = filtroTipo === "todos" || p.tipo === filtroTipo;
    const okTab   = subtab === "todos" ? true : subtab === "pendentes" ? p.estado === "pendente" : subtab === "suspeitos" ? (p.suspeito || p.estado === "suspeito") : subtab === "ativos" ? p.estado === "ativo" : p.estado === "pausado" || p.estado === "rejeitado";
    return okBusca && okCat && okTipo && okTab;
  });

  const SUBTABS = [
    { id: "todos",     label: "Todos",     count: produtos.length },
    { id: "pendentes", label: "Pendentes", count: totalPendentes,  badge: totalPendentes > 0 },
    { id: "ativos",    label: "Ativos",    count: totalAtivos },
    { id: "suspeitos", label: "Suspeitos", count: totalSuspeitos,  badge: totalSuspeitos > 0 },
    { id: "outros",    label: "Pausados / Rejeitados", count: produtos.filter(p => p.estado === "pausado" || p.estado === "rejeitado").length },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", top: 20, right: 20, background: C.text, color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", maxWidth: 360 }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Produtos & Serviços</h2>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Aprovar, rejeitar, destacar e gerir todos os anúncios da plataforma</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Exportar" icon="download" variant="secondary" size="sm" />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 22 }}>
        <StatCard label="Total de anúncios"  value={produtos.length} icon="package"         color={C.blue} />
        <StatCard label="Ativos"             value={totalAtivos}     icon="check"            color={C.green} trend={5.2} />
        <StatCard label="Pendentes aprovação" value={totalPendentes} icon="bell"             color={C.amber} />
        <StatCard label="Suspeitos"          value={totalSuspeitos}  icon="alert-triangle"   color={C.red} />
        <StatCard label="Rejeitados"         value={totalRejeitados} icon="x"                color={C.red} />
      </div>

      {/* Subtabs */}
      <div style={{ display: "flex", gap: 2, background: "#f1f5f9", padding: 4, borderRadius: 12, marginBottom: 18, width: "fit-content" }}>
        {SUBTABS.map(t => {
          const isActive = subtab === t.id;
          return (
            <button key={t.id} onClick={() => setSubtab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "none", background: isActive ? C.card : "transparent", color: isActive ? C.text : C.textSub, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s", boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none", fontFamily: "inherit", position: "relative", whiteSpace: "nowrap" }}>
              {t.label}
              <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: t.badge ? C.red : isActive ? C.bg : "transparent", color: t.badge ? "#fff" : C.textMute }}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fila de pendentes expandida (só no subtab "pendentes") */}
      {subtab === "pendentes" && pendentes.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="bell" size={14} color={C.amber} />
            Fila de aprovação ({pendentes.length})
          </p>
          {pendentes.map(p => (
            <CardPendente key={p.id} p={p} onAprovar={handleAprovar} onRejeitar={handleRejeitar} onVer={setModalDetalhe} />
          ))}
        </div>
      )}

      {/* Filtros + Tabela (todos os outros subtabs, ou "todos") */}
      {subtab !== "pendentes" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          {/* Barra de filtros */}
          <div style={{ display: "flex", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon name="search" size={13} color={C.textMute} /></span>
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar produto ou vendedor..."
                style={{ width: "100%", padding: "7px 12px 7px 30px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" }} />
            </div>
            <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)}
              style={{ padding: "7px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.text, background: C.bg, fontFamily: "inherit", cursor: "pointer" }}>
              <option value="todas">Todas as categorias</option>
              {CATEGORIAS_LISTA.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
              style={{ padding: "7px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.text, background: C.bg, fontFamily: "inherit", cursor: "pointer" }}>
              <option value="todos">Produtos e Serviços</option>
              <option value="produto">Apenas Produtos</option>
              <option value="servico">Apenas Serviços</option>
            </select>
            <span style={{ fontSize: 12, color: C.textMute, whiteSpace: "nowrap" }}>{listaFiltrada.length} resultado(s)</span>
          </div>

          {/* Tabela */}
          <TabelaProdutos
            lista={listaFiltrada}
            onVer={setModalDetalhe}
            onToggleEstado={handleToggleEstado}
            onAprovar={handleAprovar}
            onRejeitar={handleRejeitar}
            onDestaque={handleDestaque}
            onComissao={handleComissao}
          />

          {/* Paginação placeholder */}
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.textMute }}>Mostrando {listaFiltrada.length} de {produtos.length} anúncios</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, "...", "4 212"].map((pg, i) => (
                <button key={i} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${pg === 1 ? C.green : C.border}`, background: pg === 1 ? C.green : "transparent", color: pg === 1 ? "#fff" : C.textSub, fontSize: 12, cursor: "pointer" }}>{pg}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info sobre regras (visível só no subtab todos) */}
      {subtab === "todos" && (
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { icon: "check",   color: C.green,  title: "Aprovação manual obrigatória",   desc: "Todos os produtos novos passam pela fila de aprovação antes de serem publicados." },
            { icon: "star",    color: C.amber,  title: "Destaque pago ou concedido",      desc: "Admin pode destacar gratuitamente produtos de qualidade. Vendedores podem pagar para promover." },
            { icon: "percent", color: C.purple, title: "Comissão ajustável por produto",  desc: "A comissão padrão é definida por nível do afiliado. Admin pode sobrepor por produto individualmente." },
          ].map((r, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: r.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={r.icon} size={15} color={r.color} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{r.title}</p>
                <p style={{ fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      <ModalDetalhe  p={modalDetalhe}  onClose={() => setModalDetalhe(null)}  onAprovar={handleAprovar}  onRejeitar={handleRejeitar} />
      <ModalRejeitar p={modalRejeitar} onClose={() => setModalRejeitar(null)} onConfirmar={confirmarRejeicao} />
      <ModalComissao p={modalComissao} onClose={() => setModalComissao(null)} onConfirmar={confirmarComissao} />
    </div>
  );
}