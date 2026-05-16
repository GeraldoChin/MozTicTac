// ─────────────────────────────────────────────
// MOZTICTAC — PageProdutos (Admin) — Com Publicação de Produto
// ─────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000/api/v1";

async function api(caminho, opcoes = {}) {
  const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
  const isFormData = opcoes.body instanceof FormData;
  const resp = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });
  const dados = await resp.json();
  if (!resp.ok) throw new Error(dados.mensagem || dados.message || `Erro ${resp.status}`);
  return dados;
}

// ── API CALLS ─────────────────────────────────────────────────────────────────
const apiAdmin = {
  listarTodos: (pagina = 1, estado, categoriaId, busca) => {
    const p = new URLSearchParams({ pagina });
    if (estado && estado !== "todos") p.set("estado", estado);
    if (categoriaId) p.set("categoriaId", categoriaId);
    if (busca) p.set("busca", busca);
    return api(`/admin/produtos?${p}`);
  },
  kpis:    ()            => api("/admin/produtos/kpis"),  // ← novo
  aprovar: (id)          => api(`/admin/produtos/${id}/aprovar`, { method: "PUT" }),
  rejeitar:(id, motivo)  => api(`/admin/produtos/${id}/rejeitar`, { method: "PUT", body: JSON.stringify({ motivo }) }),
  publicar:(form)        => api("/produtos", { method: "POST", body: form }),
};

const apiPublico = {
  // Tenta rota pública, depois a de produtos
  categorias: async () => {
    try {
      return await api("/publico/categorias");
    } catch {
      return await api("/produtos/categorias");
    }
  },
};

// ── PALETA ────────────────────────────────────────────────────────────────────
const C = {
  green: "#16a34a", greenDim: "#dcfce7", greenMuted: "rgba(22,163,74,0.12)",
  bg: "#f8fafc", card: "#ffffff", border: "#e2e8f0",
  text: "#0f172a", textSub: "#64748b", textMute: "#94a3b8",
  red: "#ef4444", redDim: "#fef2f2",
  amber: "#f59e0b", amberDim: "#fffbeb",
  blue: "#3b82f6", blueDim: "#eff6ff",
  purple: "#8b5cf6", purpleDim: "#f5f3ff",
  orange: "#f97316", orangeDim: "#fff7ed",
};

function mapProduto(p) {
  const estadoMap = {
    ATIVO: "ativo", PENDENTE_APROVACAO: "pendente", PAUSADO: "pausado",
    REJEITADO: "rejeitado", RASCUNHO: "rascunho", ELIMINADO: "eliminado",
  };
  return {
    id: p.id, nome: p.nome, descricao: p.descricao ?? "",
    tipo: (p.tipo ?? "FISICO") === "SERVICO" ? "servico" : "produto",
    estado: estadoMap[p.estado] ?? p.estado?.toLowerCase() ?? "pendente",
    cat: p.categoria?.nome ?? p.categoriaId ?? "—",
    categoriaId: p.categoriaId ?? p.categoria?.id,
    vendedor: p.vendedor?.nomeCompleto ?? p.vendedorId ?? "—",
    vendedorId: p.vendedor?.id ?? p.vendedorId,
    vendedorEmail: p.vendedor?.email ?? "",
    preco: Number(p.preco ?? 0),
    stock: p.tipo !== "SERVICO" ? (p.stock ?? 0) : null,
    afiliados: p.aceitaAfiliados ?? false,
    comissao: Number(p.percentualAfiliado ?? 0),
    entrega: p.entregaDisponivel ?? false,
    atacado: !!(p.precoAtacado),
    vendas: p.totalVendas ?? 0,
    media: Number(p.mediaAvaliacoes ?? 0),
    imagens: p.imagens ?? [],
    destaque: p.destaque ?? false,
    motivoRejeicao: p.motivoRejeicao ?? null,
    submissao: p.criadoEm
      ? new Date(p.criadoEm).toLocaleDateString("pt-MZ", { day: "numeric", month: "short", year: "numeric" })
      : "—",
    suspeito: false,
  };
}

// ── ÍCONES SVG ────────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width: size, height: size, stroke: color, fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0, display: "block" };
  const icons = {
    package:          <svg style={s} viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    check:            <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    x:                <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    bell:             <svg style={s} viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    eye:              <svg style={s} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    search:           <svg style={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    "alert-triangle": <svg style={s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    star:             <svg style={s} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    percent:          <svg style={s} viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    pause:            <svg style={s} viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    play:             <svg style={s} viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    "bar-chart":      <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    "trending-up":    <svg style={s} viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    truck:            <svg style={s} viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    tag:              <svg style={s} viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    edit:             <svg style={s} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    user:             <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    link:             <svg style={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    refresh:          <svg style={s} viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
    info:             <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    "chevron-left":   <svg style={s} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
    "chevron-right":  <svg style={s} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
    settings:         <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    plus:             <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    upload:           <svg style={s} viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
    image:            <svg style={s} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  };
  return icons[name] ?? null;
}

// ── COMPONENTES BASE ──────────────────────────────────────────────────────────
function Badge({ label, type = "default" }) {
  const map = {
    success: { bg: C.greenDim, color: C.green },
    warning: { bg: C.amberDim, color: C.amber },
    danger:  { bg: C.redDim, color: C.red },
    info:    { bg: C.blueDim, color: C.blue },
    purple:  { bg: C.purpleDim, color: C.purple },
    orange:  { bg: C.orangeDim, color: C.orange },
    default: { bg: "#f1f5f9", color: C.textSub },
  };
  const s = map[type] || map.default;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: s.bg, color: s.color, display: "inline-block", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function Btn({ label, icon, onClick, variant = "primary", size = "md", disabled = false, loading = false }) {
  const styles = {
    primary:   { bg: C.green, color: "#fff", border: "none" },
    secondary: { bg: "transparent", color: C.textSub, border: `1.5px solid ${C.border}` },
    danger:    { bg: C.red, color: "#fff", border: "none" },
    ghost:     { bg: C.greenMuted, color: C.green, border: "none" },
    amber:     { bg: C.amberDim, color: C.amber, border: "none" },
  };
  const pad = size === "sm" ? "5px 11px" : "9px 18px";
  const fs  = size === "sm" ? 12 : 13;
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: pad, fontSize: fs, fontWeight: 700, background: (disabled || loading) ? "#f1f5f9" : s.bg, color: (disabled || loading) ? C.textMute : s.color, border: s.border || "none", borderRadius: 8, cursor: (disabled || loading) ? "not-allowed" : "pointer", opacity: (disabled || loading) ? 0.7 : 1, transition: "opacity 0.15s", whiteSpace: "nowrap", fontFamily: "inherit" }}>
      {loading
        ? <span style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
        : icon && <Icon name={icon} size={12} color={(disabled || loading) ? C.textMute : s.color} />}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon, color = C.green, loading }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={17} color={color} />
      </div>
      <div>
        {loading
          ? <div style={{ height: 24, width: 48, borderRadius: 6, background: "#e2e8f0", animation: "pulse 1.5s ease-in-out infinite" }} />
          : <p style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>}
        <p style={{ fontSize: 12, color: C.textSub, marginTop: 3, fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  );
}

function Spinner({ size = 24 }) {
  return <div style={{ width: size, height: size, border: "3px solid #e2e8f0", borderTopColor: C.green, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}

function Paginacao({ pagina, totalPaginas, total, onChange }) {
  if (totalPaginas <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 12, color: C.textMute }}>Página {pagina} de {totalPaginas} ({total} registos)</span>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={() => onChange(pagina - 1)} disabled={pagina <= 1}
          style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", cursor: pagina <= 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: pagina <= 1 ? 0.4 : 1 }}>
          <Icon name="chevron-left" size={14} color={C.textSub} />
        </button>
        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
          let pg = i + 1;
          if (totalPaginas > 5) {
            if (pagina <= 3) pg = i + 1;
            else if (pagina >= totalPaginas - 2) pg = totalPaginas - 4 + i;
            else pg = pagina - 2 + i;
          }
          return (
            <button key={pg} onClick={() => onChange(pg)}
              style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${pg === pagina ? C.green : C.border}`, background: pg === pagina ? C.green : "transparent", color: pg === pagina ? "#fff" : C.textSub, fontSize: 12, fontWeight: pg === pagina ? 700 : 400, cursor: "pointer" }}>
              {pg}
            </button>
          );
        })}
        <button onClick={() => onChange(pagina + 1)} disabled={pagina >= totalPaginas}
          style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", cursor: pagina >= totalPaginas ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: pagina >= totalPaginas ? 0.4 : 1 }}>
          <Icon name="chevron-right" size={14} color={C.textSub} />
        </button>
      </div>
    </div>
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

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", top: 20, right: 20, background: C.text, color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", maxWidth: 360, animation: "fadeIn 0.2s ease" }}>
      {msg}
    </div>
  );
}

function EstadoBadge({ estado }) {
  const map = {
    ativo:     ["Ativo",     "success"],
    pendente:  ["Pendente",  "warning"],
    rejeitado: ["Rejeitado", "danger"],
    suspeito:  ["Suspeito",  "danger"],
    pausado:   ["Pausado",   "default"],
    rascunho:  ["Rascunho",  "default"],
  };
  const [label, type] = map[estado] || ["—", "default"];
  return <Badge label={label} type={type} />;
}

const MOTIVOS_REJEICAO = [
  "Produto proibido ou ilegal",
  "Réplica ou contrafação declarada",
  "Informação insuficiente / imagens em falta",
  "Preço incorreto ou enganoso",
  "Categoria incorreta",
  "Produto de saúde sem certificação",
  "Imagens de baixa qualidade",
  "Descrição enganosa",
  "Outro motivo",
];

// ── TOGGLE ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ position: "relative", width: 40, height: 20, borderRadius: 10, border: "none", background: value ? C.green : "#e2e8f0", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 2, left: value ? 22 : 2, width: 16, height: 16, background: "#fff", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </button>
  );
}

// ── MODAL PUBLICAR PRODUTO (Admin) ────────────────────────────────────────────
function ModalPublicarProduto({ open, onClose, onSucesso, categorias, catsCarregando }) {
  const [tipo, setTipo]           = useState("produto");
  const [nome, setNome]           = useState("");
  const [desc, setDesc]           = useState("");
  const [cat, setCat]             = useState("");
  const [preco, setPreco]         = useState("");
  const [stock, setStock]         = useState("");
  const [afiliados, setAfiliados] = useState(false);
  const [comissao, setComissao]   = useState(5);
  const [entrega, setEntrega]     = useState(true);
  const [atacado, setAtacado]     = useState(false);
  const [imagens, setImagens]     = useState(null);
  const [enviando, setEnviando]   = useState(false);
  const [erro, setErro]           = useState("");

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setTipo("produto"); setNome(""); setDesc(""); setCat(""); setPreco("");
      setStock(""); setAfiliados(false); setComissao(5); setEntrega(true);
      setAtacado(false); setImagens(null); setErro("");
    }
  }, [open]);

  const taxa    = preco ? Math.round(Number(preco) * 0.105) : 0;
  const liquido = preco ? Math.round(Number(preco) - taxa) : 0;

  async function handlePublicar() {
    setErro("");
    if (!nome.trim()) { setErro("Preenche o nome do produto."); return; }
    if (desc.length < 10) { setErro("A descrição deve ter pelo menos 10 caracteres."); return; }
    if (!preco || Number(preco) <= 0) { setErro("Preenche o preço."); return; }
    if (!cat) { setErro("Seleciona uma categoria."); return; }

    setEnviando(true);
    try {
      const form = new FormData();
      form.append("nome", nome.trim());
      form.append("descricao", desc);
      form.append("tipo", tipo === "produto" ? "FISICO" : "SERVICO");
      form.append("preco", String(Number(preco)));
      form.append("categoriaId", cat);
      if (tipo === "produto") form.append("stock", String(Number(stock) || 0));
      form.append("aceitaAfiliados", afiliados ? "true" : "false");
      if (afiliados) form.append("percentualAfiliado", String(comissao));
      form.append("entregaDisponivel", entrega ? "true" : "false");
      form.append("atacado", atacado ? "true" : "false");
      form.append("metodosPagamento", "MPESA");
      form.append("metodosPagamento", "EMOLA");

      if (imagens) {
        Array.from(imagens).forEach(f => form.append("imagens", f));
      }

      await apiAdmin.publicar(form);
      onSucesso("✅ Produto publicado com sucesso e enviado para aprovação.");
      onClose();
    } catch (e) {
      setErro(e.message || "Erro ao publicar produto.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} width={560}>
      <div style={{ padding: 28 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.greenMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="plus" size={18} color={C.green} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Publicar produto</p>
              <p style={{ fontSize: 12, color: C.textMute }}>Criação directa pelo administrador</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.textMute, lineHeight: 1 }}>×</button>
        </div>

        {/* Tipo */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {["produto", "servico"].map(t => (
            <button key={t} onClick={() => setTipo(t)}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1.5px solid ${tipo === t ? C.green : C.border}`, background: tipo === t ? C.greenDim : C.bg, color: tipo === t ? C.green : C.textSub, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>
              {t === "produto" ? "📦 Produto físico" : "🛠️ Serviço"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Nome */}
          <div>
            <label style={labelStyle}>Nome do produto *</label>
            <input value={nome} onChange={e => setNome(e.target.value)}
              placeholder="ex: Smartphone Samsung Galaxy A54"
              style={inputStyle(nome.length > 0 && nome.length < 3)} />
          </div>

          {/* Descrição */}
          <div>
            <label style={labelStyle}>Descrição *</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              placeholder="Descreve o produto com clareza... (mínimo 10 caracteres)"
              style={{ ...inputStyle(desc.length > 0 && desc.length < 10), resize: "none" }} />
            <p style={{ fontSize: 11, color: desc.length < 10 ? C.red : C.textMute, textAlign: "right", marginTop: 2 }}>
              {desc.length} caracteres {desc.length >= 10 ? "✓" : `(faltam ${10 - desc.length})`}
            </p>
          </div>

          {/* Categoria */}
          <div>
            <label style={labelStyle}>Categoria *</label>
            <select value={cat} onChange={e => setCat(e.target.value)} disabled={catsCarregando}
              style={{ ...inputStyle(!cat && cat !== undefined), appearance: "none", cursor: catsCarregando ? "wait" : "pointer" }}>
              <option value="">
                {catsCarregando ? "A carregar categorias..." : "Selecionar categoria..."}
              </option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {!catsCarregando && categorias.length === 0 && (
              <p style={{ fontSize: 11, color: C.amber, marginTop: 4 }}>
                ⚠️ Nenhuma categoria encontrada. Verifica se existem categorias na base de dados.
              </p>
            )}
          </div>

          {/* Preço + Stock */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Preço (MZN) *</label>
              <input type="number" value={preco} onChange={e => setPreco(e.target.value)}
                placeholder="0.00" min="0" style={inputStyle(!preco)} />
            </div>
            {tipo === "produto" && (
              <div style={{ width: 110 }}>
                <label style={labelStyle}>Stock</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)}
                  placeholder="qtd" min="0" style={inputStyle(false)} />
              </div>
            )}
          </div>

          {/* Preview taxa */}
          {Number(preco) > 0 && (
            <div style={{ padding: "12px 14px", background: C.bg, borderRadius: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Preço base", val: `${Number(preco).toLocaleString("pt-MZ")} MZN`, color: C.text },
                { label: "Taxa plataforma (10.5%)", val: `−${taxa.toLocaleString("pt-MZ")} MZN`, color: C.red },
                { label: "Vendedor recebe", val: `${liquido.toLocaleString("pt-MZ")} MZN`, color: C.green },
              ].map(({ label, val, color }, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderTop: i === 2 ? `1px solid ${C.border}` : "none", paddingTop: i === 2 ? 6 : 0 }}>
                  <span style={{ color: C.textSub }}>{label}</span>
                  <span style={{ color, fontWeight: 700, fontFamily: "monospace" }}>{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Imagens */}
          <div>
            <label style={labelStyle}>Imagens (máx. 12)</label>
            <div style={{ border: `1.5px dashed ${C.border}`, borderRadius: 10, padding: "16px", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", position: "relative" }}
              onClick={() => document.getElementById("admin-img-input")?.click()}>
              <Icon name="image" size={24} color={C.textMute} />
              <p style={{ fontSize: 12, color: C.textSub, fontWeight: 500 }}>
                {imagens ? `${imagens.length} ficheiro(s) selecionado(s)` : "Clica para adicionar imagens"}
              </p>
              <p style={{ fontSize: 11, color: C.textMute }}>JPEG, PNG, WebP — máx. 5MB cada</p>
              <input id="admin-img-input" type="file" accept="image/*" multiple
                onChange={e => setImagens(e.target.files)}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
            </div>
            {imagens && imagens.length > 0 && (
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {Array.from(imagens).slice(0, 6).map((f, i) => (
                  <div key={i} style={{ width: 48, height: 48, borderRadius: 8, background: C.border, overflow: "hidden", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={URL.createObjectURL(f)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
                {imagens.length > 6 && (
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.textSub, fontWeight: 600 }}>
                    +{imagens.length - 6}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opções */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Entrega disponível", sub: "Produto pode ser entregue ao comprador", val: entrega, set: setEntrega },
              ...(tipo === "produto" ? [{ label: "Venda em atacado", sub: "Permite preços por volume", val: atacado, set: setAtacado }] : []),
              { label: "Aceitar afiliados", sub: "Afiliados ganham comissão por cada venda", val: afiliados, set: setAfiliados },
            ].map(({ label, sub, val, set }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: C.bg, borderRadius: 10 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</p>
                  <p style={{ fontSize: 11, color: C.textMute, marginTop: 1 }}>{sub}</p>
                </div>
                <Toggle value={val} onChange={set} />
              </div>
            ))}
          </div>

          {/* Slider comissão */}
          {afiliados && (
            <div style={{ padding: "12px 14px", background: C.greenDim, borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Comissão de afiliado</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.green }}>{comissao}%</span>
              </div>
              <input type="range" min="1" max="30" step="1" value={comissao}
                onChange={e => setComissao(Number(e.target.value))}
                style={{ width: "100%", accentColor: C.green }} />
              {preco && (
                <p style={{ fontSize: 11, color: C.green, marginTop: 4 }}>
                  Ganho por venda para afiliado: {Math.round(Number(preco) * comissao / 100).toLocaleString("pt-MZ")} MZN
                </p>
              )}
            </div>
          )}
        </div>

        {/* Erro */}
        {erro && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: C.redDim, borderRadius: 8, fontSize: 12, color: C.red, fontWeight: 500 }}>
            ⚠️ {erro}
          </div>
        )}

        {/* Aviso fluxo */}
        <div style={{ marginTop: 14, padding: "10px 14px", background: C.blueDim, borderRadius: 8, fontSize: 11, color: C.blue, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Icon name="info" size={13} color={C.blue} />
          <span>O produto ficará com estado <strong>PENDENTE_APROVACAO</strong> e pode ser aprovado imediatamente nesta mesma página.</span>
        </div>

        {/* Acções */}
        <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          <Btn label="Cancelar" variant="secondary" onClick={onClose} disabled={enviando} />
          <div style={{ flex: 1 }} />
          <Btn label={enviando ? "A publicar..." : "Publicar produto"} icon="upload" loading={enviando} onClick={handlePublicar} />
        </div>
      </div>
    </Modal>
  );
}

// Estilos auxiliares
const labelStyle = { fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 };
const inputStyle = (hasError) => ({
  width: "100%", padding: "9px 12px", fontSize: 13, border: `1.5px solid ${hasError ? C.red : C.border}`,
  borderRadius: 8, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none",
  boxSizing: "border-box", transition: "border-color 0.15s",
});

// ── MODAL DETALHE ────────────────────────────────────────────────────────────
function ModalDetalhe({ p, onClose, onAprovar, onRejeitar, acaoId }) {
  if (!p) return null;
  const taxa    = Math.round(p.preco * 0.105);
  const liquido = p.preco - taxa;
  const emAcao  = acaoId === p.id;
  return (
    <Modal open onClose={onClose} width={580}>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 6 }}>{p.nome}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge label={p.tipo === "produto" ? "Produto" : "Serviço"} type={p.tipo === "produto" ? "info" : "purple"} />
              <EstadoBadge estado={p.estado} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.textMute, lineHeight: 1 }}>×</button>
        </div>

        {p.descricao && (
          <div style={{ padding: "10px 14px", background: C.bg, borderRadius: 10, marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: C.textMute, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Descrição</p>
            <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{p.descricao}</p>
          </div>
        )}

        {p.imagens?.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {p.imagens.slice(0, 5).map((img, i) => (
              <img key={i} src={img} alt="" style={{ width: 70, height: 70, borderRadius: 8, objectFit: "cover", border: `1px solid ${C.border}` }} />
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { icon: "user",        label: "Vendedor",           val: `${p.vendedor}${p.vendedorEmail ? ` · ${p.vendedorEmail}` : ""}` },
            { icon: "tag",         label: "Categoria",          val: p.cat },
            { icon: "bar-chart",   label: "Preço base",         val: `${p.preco.toLocaleString("pt-MZ")} MZN` },
            { icon: "trending-up", label: "Taxa plataforma",    val: `${taxa.toLocaleString("pt-MZ")} MZN (10.5%)` },
            { icon: "trending-up", label: "Vendedor recebe",    val: `${liquido.toLocaleString("pt-MZ")} MZN` },
            ...(p.tipo === "produto" ? [{ icon: "package", label: "Stock", val: `${p.stock ?? 0} unidades` }] : []),
            { icon: "star",        label: "Vendas",             val: p.vendas > 0 ? `${p.vendas} vendas` : "Ainda sem vendas" },
            { icon: "link",        label: "Afiliados",          val: p.afiliados ? `Sim — ${p.comissao}% comissão` : "Não" },
            { icon: "truck",       label: "Entrega",            val: p.entrega ? "Disponível" : "Não disponível" },
            { icon: "bell",        label: "Submetido em",       val: p.submissao },
          ].map(({ icon, label, val }, i) => (
            <div key={i} style={{ background: C.bg, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={icon} size={13} color={C.textSub} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 10, color: C.textMute, fontWeight: 600, textTransform: "uppercase" }}>{label}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.text, wordBreak: "break-word" }}>{val}</p>
              </div>
            </div>
          ))}
        </div>

        {p.motivoRejeicao && (
          <div style={{ padding: "10px 14px", background: C.redDim, borderRadius: 10, marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: C.red, fontWeight: 700, marginBottom: 3 }}>MOTIVO DE REJEIÇÃO ANTERIOR</p>
            <p style={{ fontSize: 12, color: C.red }}>{p.motivoRejeicao}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <Btn label="Fechar" variant="secondary" onClick={onClose} />
          {p.estado === "pendente" && <>
            <Btn label="Aprovar" icon="check" variant="ghost"  loading={emAcao} onClick={() => { onAprovar(p.id); onClose(); }} />
            <Btn label="Rejeitar" icon="x"   variant="danger" loading={emAcao} onClick={() => { onRejeitar(p); onClose(); }} />
          </>}
          {p.estado === "ativo" && (
            <Btn label="Pausar produto" icon="pause" variant="secondary" loading={emAcao} onClick={() => { onRejeitar({ ...p, _pausar: true }); onClose(); }} />
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── MODAL REJEITAR ───────────────────────────────────────────────────────────
function ModalRejeitar({ p, onClose, onConfirmar, acaoId }) {
  const [motivo, setMotivo]           = useState("");
  const [customMotivo, setCustomMotivo] = useState("");
  if (!p) return null;
  const emAcao  = acaoId === p.id;
  const isPausar = p._pausar;

  return (
    <Modal open onClose={onClose} width={440}>
      <div style={{ padding: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: isPausar ? C.amberDim : C.redDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Icon name={isPausar ? "pause" : "x"} size={20} color={isPausar ? C.amber : C.red} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>
          {isPausar ? "Pausar produto" : "Rejeitar produto"}
        </p>
        <p style={{ fontSize: 13, color: C.textSub, marginBottom: 18 }}>
          {isPausar ? "Pausando" : "Rejeitando"} <strong>{p.nome}</strong> de <strong>{p.vendedor}</strong>.
        </p>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{isPausar ? "Motivo da pausa *" : "Motivo da rejeição *"}</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(isPausar ? ["Stock esgotado", "Produto em revisão", "Pedido do vendedor", "Outro motivo"] : MOTIVOS_REJEICAO).map((m, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${motivo === m ? (isPausar ? C.amber : C.red) : C.border}`, background: motivo === m ? (isPausar ? C.amberDim : C.redDim) : C.bg, cursor: "pointer" }}>
                <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => setMotivo(m)} style={{ accentColor: isPausar ? C.amber : C.red }} />
                <span style={{ fontSize: 13, color: C.text }}>{m}</span>
              </label>
            ))}
          </div>
        </div>

        {motivo === "Outro motivo" && (
          <div style={{ marginBottom: 14 }}>
            <textarea value={customMotivo} onChange={e => setCustomMotivo(e.target.value)} rows={3}
              placeholder="Descreve o motivo..."
              style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, resize: "none", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Cancelar" variant="secondary" onClick={onClose} />
          <Btn
            label={isPausar ? "Confirmar pausa" : "Confirmar rejeição"}
            icon={isPausar ? "pause" : "x"}
            variant={isPausar ? "amber" : "danger"}
            disabled={!motivo}
            loading={emAcao}
            onClick={() => {
              const motivoFinal = motivo === "Outro motivo" ? customMotivo : motivo;
              onConfirmar(p.id, motivoFinal, isPausar);
              onClose();
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

// ── MODAL COMISSÃO ───────────────────────────────────────────────────────────
function ModalComissao({ p, onClose, onConfirmar }) {
  const [val, setVal] = useState(p?.comissao || 5);
  if (!p) return null;
  return (
    <Modal open onClose={onClose} width={400}>
      <div style={{ padding: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Ajustar comissão afiliada</p>
        <p style={{ fontSize: 13, color: C.textSub, marginBottom: 20 }}><strong>{p.nome}</strong></p>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: "uppercase", marginBottom: 8 }}>
          Taxa: <span style={{ color: C.green, fontSize: 20, fontWeight: 800 }}>{val}%</span>
        </p>
        <input type="range" min="1" max="30" step="1" value={val} onChange={e => setVal(Number(e.target.value))}
          style={{ width: "100%", accentColor: C.green, marginBottom: 12 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMute, marginBottom: 16 }}>
          <span>1% (mín.)</span><span>30% (máx.)</span>
        </div>
        <div style={{ padding: "10px 14px", background: C.greenDim, borderRadius: 8, fontSize: 12, color: C.green, fontWeight: 500, marginBottom: 20 }}>
          Ganho por venda para afiliado: {Math.round(p.preco * val / 100).toLocaleString("pt-MZ")} MZN
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Cancelar" variant="secondary" onClick={onClose} />
          <Btn label="Guardar taxa" icon="check" onClick={() => { onConfirmar(p.id, val); onClose(); }} />
        </div>
      </div>
    </Modal>
  );
}

// ── CARD PENDENTE ────────────────────────────────────────────────────────────
function CardPendente({ p, onAprovar, onRejeitar, onVer, acaoId }) {
  const taxa    = Math.round(p.preco * 0.105);
  const liquido = p.preco - taxa;
  const emAcao  = acaoId === p.id;

  return (
    <div style={{ background: C.card, border: `1.5px solid ${C.amber}60`, borderRadius: 14, padding: 18, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: p.tipo === "produto" ? C.blueDim : C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {p.imagens?.[0]
            ? <img src={p.imagens[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Icon name={p.tipo === "produto" ? "package" : "settings"} size={22} color={p.tipo === "produto" ? C.blue : C.purple} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.nome}</p>
            <Badge label={p.tipo === "produto" ? "Produto" : "Serviço"} type={p.tipo === "produto" ? "info" : "purple"} />
          </div>
          <p style={{ fontSize: 12, color: C.textMute, marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: C.textSub }}>{p.vendedor}</span>
            {p.vendedorEmail && <span style={{ color: C.textMute }}> · {p.vendedorEmail}</span>}
            {" · "}{p.cat}{" · "}{p.submissao}
          </p>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub }}>
              💰 {p.preco.toLocaleString("pt-MZ")} MZN
            </span>
            {p.tipo === "produto" && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub }}>
                📦 Stock: {p.stock ?? 0}
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

          <div style={{ marginTop: 10, padding: "8px 12px", background: C.bg, borderRadius: 8, display: "flex", gap: 20 }}>
            <div style={{ fontSize: 11, color: C.textMute }}>Taxa: <strong style={{ color: C.red }}>{taxa.toLocaleString("pt-MZ")} MZN</strong></div>
            <div style={{ fontSize: 11, color: C.textMute }}>Vendedor recebe: <strong style={{ color: C.green }}>{liquido.toLocaleString("pt-MZ")} MZN</strong></div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        <Btn label="Ver detalhes" icon="eye"   variant="secondary" size="sm" onClick={() => onVer(p)} />
        <Btn label="Aprovar"      icon="check" variant="ghost"     size="sm" loading={emAcao} onClick={() => onAprovar(p.id)} />
        <Btn label="Rejeitar"     icon="x"     variant="danger"    size="sm" loading={emAcao} onClick={() => onRejeitar(p)} />
      </div>
    </div>
  );
}

// ── TABELA GERAL ─────────────────────────────────────────────────────────────
function TabelaProdutos({ lista, onVer, onAprovar, onRejeitar, onDestaque, onComissao, acaoId }) {
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
            <tr><td colSpan={9} style={{ padding: 48, textAlign: "center", color: C.textMute, fontSize: 13 }}>Nenhum produto encontrado.</td></tr>
          )}
          {lista.map(p => {
            const emAcao = acaoId === p.id;
            return (
              <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: p.tipo === "produto" ? C.blueDim : C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {p.imagens?.[0]
                        ? <img src={p.imagens[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <Icon name={p.tipo === "produto" ? "package" : "settings"} size={16} color={p.tipo === "produto" ? C.blue : C.purple} />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: C.text, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nome}</p>
                      {p.tipo === "produto" && <p style={{ fontSize: 11, color: C.textMute }}>Stock: {p.stock ?? 0}</p>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 14px", color: C.textSub, fontWeight: 500, whiteSpace: "nowrap" }}>
                  <div>{p.vendedor}</div>
                  {p.vendedorEmail && <div style={{ fontSize: 11, color: C.textMute }}>{p.vendedorEmail}</div>}
                </td>
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
                <td style={{ padding: "12px 14px" }}><EstadoBadge estado={p.estado} /></td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "nowrap" }}>
                    <Btn label="Ver"  icon="eye" size="sm" variant="ghost" onClick={() => onVer(p)} />
                    {p.estado === "pendente" && <>
                      <Btn size="sm" variant="ghost"  label="✓" loading={emAcao} onClick={() => onAprovar(p.id)} />
                      <Btn size="sm" variant="danger" label="✕" loading={emAcao} onClick={() => onRejeitar(p)} />
                    </>}
                    {p.estado === "ativo" && <>
                      <Btn label="Pausar" icon="pause" size="sm" variant="secondary" loading={emAcao} onClick={() => onRejeitar({ ...p, _pausar: true })} />
                      <Btn label="⭐" size="sm" variant="amber" onClick={() => onDestaque(p.id)} />
                      {p.afiliados && <Btn label="%" icon="percent" size="sm" variant="secondary" onClick={() => onComissao(p)} />}
                    </>}
                    {p.estado === "pausado" && (
                      <Btn label="Activar" icon="play" size="sm" variant="ghost" loading={emAcao} onClick={() => onAprovar(p.id)} />
                    )}
                    {p.estado === "rejeitado" && (
                      <Btn label="Re-aprovar" icon="check" size="sm" variant="ghost" loading={emAcao} onClick={() => onAprovar(p.id)} />
                    )}
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

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function PageProdutos() {
  const [subtab, setSubtab]         = useState("pendentes");
  const [produtos, setProdutos]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina]         = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState(null);

  const [busca, setBusca]           = useState("");
  const [buscaInput, setBuscaInput] = useState("");
  const [filtroCat, setFiltroCat]   = useState("");

  // Categorias — carregadas uma vez
  const [categorias, setCategorias]           = useState([]);
  const [catsCarregando, setCatsCarregando]   = useState(true);

  const [kpis, setKpis]             = useState({ total: 0, ativos: 0, pendentes: 0, pausados: 0, rejeitados: 0 });
  const [kpisCarregando, setKpisCarregando] = useState(true);

  const [modalDetalhe,    setModalDetalhe]    = useState(null);
  const [modalRejeitar,   setModalRejeitar]   = useState(null);
  const [modalComissao,   setModalComissao]   = useState(null);
  const [modalPublicar,   setModalPublicar]   = useState(false);
  const [acaoId, setAcaoId]                   = useState(null);
  const [toast, setToast]                     = useState(null);
  const toastTimer = useRef(null);

  function showToast(msg) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  // ── Carregar categorias
  useEffect(() => {
    setCatsCarregando(true);
    apiPublico.categorias()
      .then(r => {
        // Normaliza tanto { data: [] } como { dados: [] } como array directo
        const lista = r.data ?? r.dados ?? (Array.isArray(r) ? r : []);
        setCategorias(lista);
      })
      .catch(() => setCategorias([]))
      .finally(() => setCatsCarregando(false));
  }, []);

  // ── Debounce busca
  useEffect(() => {
    const t = setTimeout(() => { setBusca(buscaInput); setPagina(1); }, 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  const estadoFiltro = {
    pendentes:  "PENDENTE_APROVACAO",
    ativos:     "ATIVO",
    pausados:   "PAUSADO",
    rejeitados: "REJEITADO",
    todos:      "",
  }[subtab] ?? "";

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiAdmin.listarTodos(pagina, estadoFiltro, filtroCat, busca);
      const d = res.success ? res.data : res.sucesso ? res.dados : {};
      setProdutos((d.produtos ?? []).map(mapProduto));
      setTotal(d.total ?? 0);
      setTotalPaginas(d.totalPaginas ?? (Math.ceil((d.total ?? 0) / 20) || 1));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [pagina, estadoFiltro, filtroCat, busca]);

  useEffect(() => { carregar(); }, [carregar]);
const carregarKpis = useCallback(async () => {
  setKpisCarregando(true);
  try {
    const res = await apiAdmin.kpis();
    setKpis(res.data);
  } catch (_) {}
  finally { setKpisCarregando(false); }
}, []);

  useEffect(() => { carregarKpis(); }, [carregarKpis]);

  function mudarSubtab(t) { setSubtab(t); setPagina(1); }

async function handleAprovar(id) {
  setAcaoId(id);
  try {
    await apiAdmin.aprovar(id);
    showToast("✅ Produto aprovado e publicado com sucesso.");
    await Promise.all([carregar(), carregarKpis()]);
  } catch (e) {
    showToast(`❌ Erro ao aprovar: ${e.message}`);
  } finally {
    setAcaoId(null);
  }
}

async function handleConfirmarRejeicao(id, motivo, isPausar = false) {
  setAcaoId(id);
  try {
    await apiAdmin.rejeitar(id, motivo);
    const msg = isPausar
      ? `⏸ Produto pausado. Motivo: "${motivo}"`
      : `❌ Produto rejeitado. Notificação enviada ao vendedor.`;
    showToast(msg);
    await Promise.all([carregar(), carregarKpis()]);
  } catch (e) {
    showToast(`❌ Erro: ${e.message}`);
  } finally {
    setAcaoId(null);
  }
}
  function handleDestaque(id) {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, destaque: !p.destaque } : p));
    showToast("⭐ Destaque actualizado. (Implementar rota backend se necessário.)");
  }

  function handleConfirmarComissao(id, val) {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, comissao: val } : p));
    showToast(`🔗 Comissão actualizada para ${val}%.`);
  }

  const SUBTABS = [
    { id: "pendentes",  label: "Pendentes",  count: kpis.pendentes,  badge: kpis.pendentes > 0 },
    { id: "todos",      label: "Todos",      count: kpis.total },
    { id: "ativos",     label: "Activos",    count: kpis.ativos },
    { id: "pausados",   label: "Pausados",   count: kpis.pausados },
    { id: "rejeitados", label: "Rejeitados", count: kpis.rejeitados },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }
        select { font-family: inherit; }
      `}</style>

      <Toast msg={toast} />

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Produtos & Serviços</h2>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>
            Aprovação, moderação e gestão de todos os anúncios da plataforma.
            {kpis.pendentes > 0 && <span style={{ color: C.amber, fontWeight: 700 }}> {kpis.pendentes} pendente(s) aguardam revisão.</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Actualizar" icon="refresh" variant="secondary" size="sm" onClick={() => { carregar(); carregarKpis(); }} />
          {/* ── BOTÃO PUBLICAR PRODUTO ── */}
          <Btn label="Publicar produto" icon="plus" variant="primary" size="sm" onClick={() => setModalPublicar(true)} />
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 22 }}>
        <StatCard label="Total anúncios"       value={kpis.total}      icon="package" color={C.blue}   loading={kpisCarregando} />
        <StatCard label="Activos"              value={kpis.ativos}     icon="check"   color={C.green}  loading={kpisCarregando} />
        <StatCard label="Pendentes aprovação"  value={kpis.pendentes}  icon="bell"    color={C.amber}  loading={kpisCarregando} />
        <StatCard label="Pausados"             value={kpis.pausados}   icon="pause"   color={C.orange} loading={kpisCarregando} />
        <StatCard label="Rejeitados"           value={kpis.rejeitados} icon="x"       color={C.red}    loading={kpisCarregando} />
      </div>

      {/* ── Nota de fluxo ── */}
      <div style={{ padding: "10px 14px", background: C.blueDim, border: `1px solid ${C.blue}30`, borderRadius: 10, marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Icon name="info" size={15} color={C.blue} />
        <p style={{ fontSize: 12, color: C.blue, lineHeight: 1.6 }}>
          <strong>Fluxo:</strong> Vendedor publica → <code>PENDENTE_APROVACAO</code> → Admin aprova/rejeita → <code>ATIVO</code> ou <code>REJEITADO</code>.
          O admin também pode publicar produtos directamente usando o botão <strong>"Publicar produto"</strong>.
        </p>
      </div>

      {/* ── Subtabs ── */}
      <div style={{ display: "flex", gap: 2, background: "#f1f5f9", padding: 4, borderRadius: 12, marginBottom: 18, width: "fit-content", flexWrap: "wrap" }}>
        {SUBTABS.map(t => {
          const isActive = subtab === t.id;
          return (
            <button key={t.id} onClick={() => mudarSubtab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "none", background: isActive ? C.card : "transparent", color: isActive ? C.text : C.textSub, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {t.label}
              <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: t.badge ? C.red : isActive ? C.bg : "transparent", color: t.badge ? "#fff" : C.textMute }}>
                {kpisCarregando ? "..." : t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── SUBTAB PENDENTES ── */}
      {subtab === "pendentes" && (
        <div>
          {carregando ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>
          ) : erro ? (
            <div style={{ padding: 20, textAlign: "center", color: C.red, fontSize: 13 }}>
              {erro} — <button onClick={carregar} style={{ color: C.blue, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Tentar novamente</button>
            </div>
          ) : produtos.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Fila vazia!</p>
              <p style={{ fontSize: 13, color: C.textMute }}>Não há produtos a aguardar aprovação.</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="bell" size={14} color={C.amber} />
                Fila de aprovação ({total})
              </p>
              {produtos.map(p => (
                <CardPendente key={p.id} p={p} onAprovar={handleAprovar} onRejeitar={p => setModalRejeitar(p)} onVer={setModalDetalhe} acaoId={acaoId} />
              ))}
              {totalPaginas > 1 && (
                <Paginacao pagina={pagina} totalPaginas={totalPaginas} total={total} onChange={setPagina} />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── OUTROS SUBTABS ── */}
      {subtab !== "pendentes" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          {/* Barra de filtros */}
          <div style={{ display: "flex", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
                <Icon name="search" size={13} color={C.textMute} />
              </span>
              <input value={buscaInput} onChange={e => setBuscaInput(e.target.value)}
                placeholder="Pesquisar produto ou vendedor..."
                style={{ width: "100%", padding: "7px 12px 7px 32px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none", boxSizing: "border-box" }} />
            </div>
            <select value={filtroCat} onChange={e => { setFiltroCat(e.target.value); setPagina(1); }}
              style={{ padding: "7px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.text, background: C.bg, fontFamily: "inherit", cursor: "pointer" }}>
              <option value="">Todas as categorias</option>
              {catsCarregando
                ? <option disabled>A carregar...</option>
                : categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <span style={{ fontSize: 12, color: C.textMute, whiteSpace: "nowrap" }}>
              {carregando ? "A carregar..." : `${total} resultado(s)`}
            </span>
          </div>

          {carregando ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><Spinner /></div>
          ) : erro ? (
            <div style={{ padding: 24, textAlign: "center", color: C.red, fontSize: 13 }}>
              {erro} — <button onClick={carregar} style={{ color: C.blue, background: "none", border: "none", cursor: "pointer" }}>Tentar novamente</button>
            </div>
          ) : (
            <TabelaProdutos
              lista={produtos}
              onVer={setModalDetalhe}
              onAprovar={handleAprovar}
              onRejeitar={p => setModalRejeitar(p)}
              onDestaque={handleDestaque}
              onComissao={setModalComissao}
              acaoId={acaoId}
            />
          )}

          <Paginacao pagina={pagina} totalPaginas={totalPaginas} total={total} onChange={p => { setPagina(p); window.scrollTo(0, 0); }} />
        </div>
      )}

      {/* ── Cards informativos ── */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { icon: "check",   color: C.green,  title: "Aprovação manual",       desc: "Produtos publicados pelos vendedores chegam como PENDENTE_APROVACAO." },
          { icon: "bell",    color: C.amber,  title: "Notificação ao vendedor", desc: "Ao aprovar ou rejeitar, o vendedor recebe notificação automática." },
          { icon: "percent", color: C.purple, title: "Comissões de afiliado",   desc: "Admin pode ajustar a % de comissão por produto após aprovação." },
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

      {/* ── Modais ── */}
      <ModalPublicarProduto
        open={modalPublicar}
        onClose={() => setModalPublicar(false)}
        categorias={categorias}
        catsCarregando={catsCarregando}
        onSucesso={(msg) => {
          showToast(msg);
          carregar();
          carregarKpis();
        }}
      />
      <ModalDetalhe
        p={modalDetalhe}
        onClose={() => setModalDetalhe(null)}
        onAprovar={handleAprovar}
        onRejeitar={p => setModalRejeitar(p)}
        acaoId={acaoId}
      />
      <ModalRejeitar
        p={modalRejeitar}
        onClose={() => setModalRejeitar(null)}
        onConfirmar={handleConfirmarRejeicao}
        acaoId={acaoId}
      />
      <ModalComissao
        p={modalComissao}
        onClose={() => setModalComissao(null)}
        onConfirmar={handleConfirmarComissao}
      />
    </div>
  );
}