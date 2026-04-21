import { useState } from "react";

// ── Cores & tokens ────────────────────────────────────────────
const C = {
  bg:       "#f5f6fa",
  card:     "#ffffff",
  border:   "#e8eaf0",
  text:     "#1a1d2e",
  textSub:  "#5a6080",
  textMute: "#9aa0bc",
  blue:     "#3b6ef8",
  blueLt:   "#eef2ff",
  green:    "#22c55e",
  greenLt:  "#f0fdf4",
  amber:    "#f59e0b",
  amberLt:  "#fffbeb",
  red:      "#ef4444",
  redLt:    "#fef2f2",
  purple:   "#8b5cf6",
  purpleLt: "#f5f3ff",
};

// ── Ícones SVG minimalistas ───────────────────────────────────
const Icon = ({ name, size = 14, color = "currentColor" }) => {
  const s = { width: size, height: size, flexShrink: 0 };
  const icons = {
    download:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    plus:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    refresh:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.96"/></svg>,
    eye:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    x:         <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    users:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    bag:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    package:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    link:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    block:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
    chevL:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
    chevR:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
    updown:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18" opacity=".4"/></svg>,
  };
  return icons[name] || null;
};

// ── Badge ─────────────────────────────────────────────────────
const BADGE_STYLES = {
  success: { bg: C.greenLt,  dot: C.green,  text: "#15803d" },
  danger:  { bg: C.redLt,    dot: C.red,    text: "#b91c1c" },
  warning: { bg: C.amberLt,  dot: C.amber,  text: "#b45309" },
  info:    { bg: C.blueLt,   dot: C.blue,   text: "#1d4ed8" },
  purple:  { bg: C.purpleLt, dot: C.purple, text: "#6d28d9" },
  default: { bg: C.bg,       dot: C.textMute, text: C.textSub, border: C.border },
};

function Badge({ label, type = "default" }) {
  const s = BADGE_STYLES[type] || BADGE_STYLES.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20, fontSize: 12, fontWeight: 500,
      background: s.bg, color: s.text, whiteSpace: "nowrap",
      border: s.border ? `1px solid ${s.border}` : "none",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ── Botão ──────────────────────────────────────────────────────
function Btn({ label, icon, variant = "secondary", size = "md", onClick }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
    border: "none", fontFamily: "inherit", fontWeight: 500, transition: "all .15s",
    borderRadius: size === "sm" ? 7 : 9,
    padding: size === "sm" ? "5px 10px" : "8px 14px",
    fontSize: size === "sm" ? 12 : 13,
  };
  const variants = {
    secondary: { background: C.card, border: `1.5px solid ${C.border}`, color: C.textSub },
    primary:   { background: C.text, color: "#fff", border: "none" },
    ghost:     { background: "transparent", color: C.textSub, border: "none", padding: size === "sm" ? "5px 8px" : "8px 10px" },
    danger:    { background: C.redLt, color: C.red, border: `1px solid #fecaca` },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick}>
      {icon && <Icon name={icon} size={13} />}
      {label}
    </button>
  );
}

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ label, value, icon, color, trend, trendUp = true }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: 16, position: "relative", overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,.07)",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 700, letterSpacing: -1, color: C.text }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: .8, textTransform: "uppercase", color: C.textMute, marginTop: 2 }}>{label}</div>
      {trend && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500,
          marginTop: 8, padding: "3px 7px", borderRadius: 20,
          background: trendUp ? C.greenLt : C.redLt,
          color: trendUp ? "#15803d" : "#b91c1c",
        }}>
          {trendUp ? "▲" : "▲"} {trend}
        </div>
      )}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "linear-gradient(135deg,#3b6ef8,#6b8ff8)",
  "linear-gradient(135deg,#14b8a6,#2dd4bf)",
  "linear-gradient(135deg,#22c55e,#4ade80)",
  "linear-gradient(135deg,#f59e0b,#fbbf24)",
  "linear-gradient(135deg,#ec4899,#f472b6)",
  "linear-gradient(135deg,#8b5cf6,#a78bfa)",
];
function Avatar({ initials, index = 0 }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: AVATAR_COLORS[index % AVATAR_COLORS.length],
      fontSize: 13, fontWeight: 700, color: "#fff",
    }}>{initials}</div>
  );
}

// ── Checkbox ──────────────────────────────────────────────────
function Checkbox({ checked, onChange }) {
  return (
    <input type="checkbox" checked={checked} onChange={onChange}
      style={{ width: 15, height: 15, accentColor: C.blue, cursor: "pointer" }} />
  );
}

// ── Dados mockados ────────────────────────────────────────────
const USERS = [
  { id: "USR001", name: "João Matos",   email: "joao@gmail.com",    tipo: "Afiliado Ouro",  tipoType: "purple",  data: "12 Jan 2025", provincia: "Maputo",  compras: 14, estado: "Ativo",     estadoType: "success", blocked: false },
  { id: "USR002", name: "Ana Lopes",    email: "ana@gmail.com",     tipo: "Vendedor",        tipoType: "info",    data: "08 Fev 2025", provincia: "Sofala",  compras:  3, estado: "Ativo",     estadoType: "success", blocked: false },
  { id: "USR003", name: "Carlos Nhaca", email: "carlos@hotmail.com",tipo: "Comprador",       tipoType: "default", data: "20 Mar 2025", provincia: "Nampula", compras: 22, estado: "Ativo",     estadoType: "success", blocked: false },
  { id: "USR004", name: "spam_user99",  email: "spam99@test.com",   tipo: "Comprador",       tipoType: "default", data: "01 Abr 2025", provincia: null,      compras:  0, estado: "Bloqueado", estadoType: "danger",  blocked: true  },
  { id: "USR005", name: "Fátima Dique", email: "fatima@gmail.com",  tipo: "Afiliado Prata", tipoType: "info",    data: "15 Mar 2025", provincia: "Gaza",    compras:  8, estado: "Ativo",     estadoType: "success", blocked: false },
];

const TIPOS = ["Todos os tipos", "Comprador", "Vendedor", "Afiliado Ouro", "Afiliado Prata"];
const ESTADOS = ["Todos os estados", "Ativo", "Bloqueado", "Pendente"];
const PROVINCIAS = ["Todas as províncias", "Maputo", "Gaza", "Sofala", "Nampula", "Zambézia"];

// ── Componente principal ──────────────────────────────────────
export default function PageUtilizadores() {
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("Todos os tipos");
  const [estado, setEstado] = useState("Todos os estados");
  const [provincia, setProvincia] = useState("Todas as províncias");
  const [selected, setSelected] = useState([]);
  const [users, setUsers] = useState(USERS);
  const [page, setPage] = useState(1);

  // Filtros
  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase()) ||
                        u.id.toLowerCase().includes(search.toLowerCase());
    const matchTipo = tipo === "Todos os tipos" || u.tipo === tipo;
    const matchEstado = estado === "Todos os estados" || u.estado === estado;
    const matchProv = provincia === "Todas as províncias" || u.provincia === provincia;
    return matchSearch && matchTipo && matchEstado && matchProv;
  });

  // Selecção
  const allSelected = filtered.length > 0 && filtered.every(u => selected.includes(u.id));
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map(u => u.id));
  const toggleOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // Bloquear / Ativar
  const toggleBlock = (id) => {
    setUsers(prev => prev.map(u => u.id !== id ? u : {
      ...u,
      blocked: !u.blocked,
      estado: u.blocked ? "Ativo" : "Bloqueado",
      estadoType: u.blocked ? "success" : "danger",
    }));
  };

  const limpar = () => { setSearch(""); setTipo("Todos os tipos"); setEstado("Todos os estados"); setProvincia("Todas as províncias"); };

  const selectStyle = {
    padding: "9px 12px", fontSize: 13, fontFamily: "inherit",
    border: `1.5px solid ${C.border}`, borderRadius: 9,
    color: C.text, background: C.bg, outline: "none", cursor: "pointer",
  };

  const thStyle = {
    padding: "10px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 600,
    letterSpacing: .7, textTransform: "uppercase", color: C.textMute, whiteSpace: "nowrap",
  };
  const tdStyle = { padding: "12px 14px", verticalAlign: "middle" };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: 24, fontFamily: "'DM Sans', sans-serif", color: C.text, fontSize: 14 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -.3 }}>Gestão de Utilizadores</div>
          <div style={{ color: C.textSub, fontSize: 13, marginTop: 3 }}>Ver, filtrar e gerir todos os utilizadores da plataforma</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Exportar Excel" icon="download" variant="secondary" />
          <Btn label="Novo Utilizador" icon="plus" variant="primary" />
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total"       value="12 480" icon="users"   color={C.blue}   trend="+3.2% este mês" />
        <StatCard label="Compradores" value="9 840"  icon="bag"     color={C.green}  trend="+142 novos" />
        <StatCard label="Vendedores"  value="1 340"  icon="package" color={C.amber}  trend="+28 novos" />
        <StatCard label="Afiliados"   value="892"    icon="link"    color={C.purple} trend="+67 novos" />
        <StatCard label="Bloqueados"  value="408"    icon="block"   color={C.red}    trend="+12 esta semana" trendUp={false} />
      </div>

      {/* Main Card */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.07)" }}>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: C.textMute, display: "flex" }}>
              <Icon name="search" size={14} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar por nome, email ou ID..."
              style={{
                width: "100%", padding: "9px 12px 9px 34px",
                border: `1.5px solid ${C.border}`, borderRadius: 9,
                fontSize: 13, fontFamily: "inherit", color: C.text, background: C.bg,
                outline: "none",
              }}
            />
          </div>

          <select style={selectStyle} value={tipo} onChange={e => setTipo(e.target.value)}>
            {TIPOS.map(t => <option key={t}>{t}</option>)}
          </select>
          <select style={selectStyle} value={estado} onChange={e => setEstado(e.target.value)}>
            {ESTADOS.map(e => <option key={e}>{e}</option>)}
          </select>
          <select style={selectStyle} value={provincia} onChange={e => setProvincia(e.target.value)}>
            {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <Btn label="Limpar" icon="refresh" variant="secondary" size="sm" onClick={limpar} />
            <span style={{ fontSize: 12, color: C.textMute, whiteSpace: "nowrap" }}>{filtered.length} de 12 480</span>
          </div>
        </div>

        {/* Tabela */}
        <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${C.border}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: C.bg }}>
              <tr>
                <th style={{ ...thStyle, width: 40 }}><Checkbox checked={allSelected} onChange={toggleAll} /></th>
                <th style={thStyle}>Utilizador <Icon name="updown" size={11} color={C.textMute} /></th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Registado <Icon name="updown" size={11} color={C.textMute} /></th>
                <th style={thStyle}>Província</th>
                <th style={thStyle}>Compras</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{
                  borderTop: `1px solid ${C.border}`,
                  opacity: u.blocked ? .75 : 1,
                  background: selected.includes(u.id) ? "#f8f9ff" : "transparent",
                  transition: "background .1s",
                }}>
                  <td style={{ ...tdStyle, width: 40 }}>
                    <Checkbox checked={selected.includes(u.id)} onChange={() => toggleOne(u.id)} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={u.name.split(" ").map(w => w[0]).join("").slice(0,2)} index={i} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{u.name}</span>
                        <span style={{ color: C.textMute, fontSize: 11.5 }}>{u.email}</span>
                        <span style={{ color: C.textMute, fontSize: 10.5, fontFamily: "monospace" }}>#{u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}><Badge label={u.tipo} type={u.tipoType} /></td>
                  <td style={{ ...tdStyle, color: C.textSub, fontSize: 13 }}>{u.data}</td>
                  <td style={{ ...tdStyle, color: C.textSub, fontSize: 13 }}>
                    {u.provincia || <span style={{ color: C.textMute }}>—</span>}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 13, fontWeight: 500 }}>{u.compras}</td>
                  <td style={tdStyle}><Badge label={u.estado} type={u.estadoType} /></td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <Btn label="Ver" icon="eye" variant="ghost" size="sm" />
                      {u.blocked
                        ? <Btn label="Ativar"    icon="check" variant="secondary" size="sm" onClick={() => toggleBlock(u.id)} />
                        : <Btn label="Bloquear"  icon="x"     variant="danger"    size="sm" onClick={() => toggleBlock(u.id)} />
                      }
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ ...tdStyle, textAlign: "center", color: C.textMute, padding: 40 }}>Nenhum utilizador encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 12, color: C.textMute }}>
          <span>Mostrando 1–{filtered.length} de 12 480 utilizadores</span>
          <div style={{ display: "flex", gap: 5 }}>
            {[{ label: "‹ Anterior", p: null }, 1, 2, 3, "…", 420, { label: "Seguinte ›", p: null }].map((p, i) => {
              const isNav = typeof p === "object";
              const label = isNav ? p.label : p;
              const isActive = p === page;
              return (
                <button key={i}
                  onClick={() => typeof p === "number" && setPage(p)}
                  style={{
                    height: 30, borderRadius: 8, border: `1.5px solid ${isActive ? C.text : C.border}`,
                    background: isActive ? C.text : "transparent",
                    color: isActive ? "#fff" : C.textSub,
                    fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                    padding: isNav ? "0 12px" : "0",
                    width: isNav ? "auto" : 30,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}