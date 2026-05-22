// ─────────────────────────────────────────────────────────────────
// MOZTICTAC — PAGE ADMIN: VENDAS RELÂMPAGO
// Interage com: relampago.controlador.ts (admin + público)
//               TabRelampago em SecaoVendas.jsx (vendedor)
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function req(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.message || dados.mensagem || `Erro ${res.status}`);
  return dados;
}

const api = {
  kpis:            ()          => req("/admin/relampago/kpis"),
  listar:          (params)    => req(`/admin/relampago?${new URLSearchParams(params)}`),
  criar:           (dados)     => req("/admin/relampago",       { method: "POST", body: JSON.stringify(dados) }),
  atualizar:       (id, dados) => req(`/admin/relampago/${id}`, { method: "PUT",  body: JSON.stringify(dados) }),
  desativar:       (id)        => req(`/admin/relampago/${id}`, { method: "DELETE" }),
  expirarVencidas: ()          => req("/admin/relampago/expirar-vencidas", { method: "POST" }),
  produtos:        (busca)     => req(`/admin/produtos?busca=${encodeURIComponent(busca || "")}&estado=ATIVO&pagina=1`),
};

// ── Helpers ───────────────────────────────────────────────────────
const fmt     = (n) => Number(n || 0).toLocaleString("pt-MZ") + " MZN";
const fmtData = (d) => d ? new Date(d).toLocaleString("pt-MZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const disc    = (orig, promo) => orig > 0 ? Math.round((1 - promo / orig) * 100) : 0;

const C = {
  amber:     "#f59e0b",
  amberDim:  "#fffbeb",
  amberBorder:"#fde68a",
  green:     "#16a34a",
  greenDim:  "#dcfce7",
  red:       "#ef4444",
  redDim:    "#fef2f2",
  blue:      "#3b82f6",
  blueDim:   "#eff6ff",
  gray:      "#6b7280",
  grayDim:   "#f9fafb",
  border:    "#e5e7eb",
  text:      "#111827",
  textSub:   "#6b7280",
  card:      "#ffffff",
};

function estadoInfo(r) {
  const agora = new Date();
  if (!r.ativo)                           return { label: "Inativa",  color: C.gray,  bg: "#f3f4f6" };
  if (new Date(r.inicioEm) > agora)       return { label: "Futura",   color: C.blue,  bg: C.blueDim };
  if (new Date(r.fimEm)    < agora)       return { label: "Expirada", color: C.gray,  bg: "#f3f4f6" };
  return                                         { label: "Activa",   color: C.green, bg: C.greenDim };
}

function tempoRestante(fimEm) {
  const diff = new Date(fimEm) - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.ceil(h / 24)}d restantes`;
  return `${h}h ${m}m restantes`;
}

// ── Ícones ────────────────────────────────────────────────────────
const Ico = {
  Zap:     (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Plus:    (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:    (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:   (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Refresh: (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  X:       (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:   (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevL:   (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevR:   (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  Search:  (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Clock:   (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Package: (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  Alert:   (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Eye:     (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// ── Spinner ────────────────────────────────────────────────────────
function Spinner({ s = false }) {
  return <div style={{ width: s ? 14 : 20, height: s ? 14 : 20, border: "2px solid #e5e7eb", borderTopColor: C.amber, borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />;
}

// ── KPI Card ──────────────────────────────────────────────────────
function KpiCard({ label, valor, sub, color = C.amber, icon, loading }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
      </div>
      {loading
        ? <div style={{ height: 28, width: 60, borderRadius: 6, background: "#f3f4f6", animation: "pulse 1.5s ease-in-out infinite" }} />
        : <p style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{valor}</p>
      }
      <div>
        <p style={{ fontSize: 12, color: C.textSub, fontWeight: 600 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: bg, color, display: "inline-block", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ── Modal Criar / Editar ──────────────────────────────────────────
function ModalRelampago({ item, onClose, onSalvo }) {
  const [busca, setBusca]           = useState("");
  const [produtos, setProdutos]     = useState([]);
  const [buscando, setBuscando]     = useState(false);
  const [produtoSel, setProdutoSel] = useState(item?.produto || null);
  const [preco, setPreco]           = useState(item?.precoRelampago ? String(item.precoRelampago) : "");
  const [limite, setLimite]         = useState(item?.quantidadeLimite ? String(item.quantidadeLimite) : "");
  const [inicioEm, setInicioEm]     = useState(item?.inicioEm ? new Date(item.inicioEm).toISOString().slice(0, 16) : "");
  const [fimEm, setFimEm]           = useState(item?.fimEm   ? new Date(item.fimEm).toISOString().slice(0, 16) : "");
  const [enviando, setEnviando]     = useState(false);
  const [erro, setErro]             = useState("");

  const precoOrig = produtoSel ? Number(produtoSel.preco) : 0;
  const desconto  = preco && precoOrig ? disc(precoOrig, Number(preco)) : 0;

  async function buscarProdutos(q) {
    if (!q.trim()) { setProdutos([]); return; }
    setBuscando(true);
    try {
      const res = await api.produtos(q);
      setProdutos(res.data?.produtos || []);
    } catch (_) {} finally { setBuscando(false); }
  }

  useEffect(() => {
    const t = setTimeout(() => buscarProdutos(busca), 400);
    return () => clearTimeout(t);
  }, [busca]);

  function preencherSugestao() {
    const agora  = new Date();
    const fim    = new Date(agora.getTime() + 24 * 3600000);
    setInicioEm(agora.toISOString().slice(0, 16));
    setFimEm(fim.toISOString().slice(0, 16));
  }

  async function handleSalvar() {
    setErro("");
    if (!produtoSel && !item) { setErro("Seleciona um produto."); return; }
    if (!preco || Number(preco) <= 0) { setErro("Preço relâmpago inválido."); return; }
    if (precoOrig && Number(preco) >= precoOrig) { setErro("O preço relâmpago deve ser inferior ao preço original."); return; }
    if (!inicioEm || !fimEm) { setErro("Define as datas de início e fim."); return; }
    if (new Date(fimEm) <= new Date(inicioEm)) { setErro("A data de fim deve ser posterior ao início."); return; }

    setEnviando(true);
    try {
      const dados = {
        precoRelampago:   Number(preco),
        quantidadeLimite: limite ? Number(limite) : undefined,
        inicioEm:         new Date(inicioEm).toISOString(),
        fimEm:            new Date(fimEm).toISOString(),
      };
      let res;
      if (item?.id) {
        res = await api.atualizar(item.id, dados);
      } else {
        res = await api.criar({ ...dados, produtoId: produtoSel.id });
      }
      onSalvo(res.data ?? res.dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: C.card, borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: 24 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{item ? "Editar venda relâmpago" : "Nova venda relâmpago"}</h3>
              <p style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>Oferta com desconto por tempo limitado</p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSub, padding: 4 }}>{Ico.X()}</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Produto */}
            {!item && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Produto *</label>
                {produtoSel ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.amberDim, border: `1px solid ${C.amberBorder}`, borderRadius: 10 }}>
                    {produtoSel.imagens?.[0] && <img src={produtoSel.imagens[0]} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{produtoSel.nome}</p>
                      <p style={{ fontSize: 11, color: C.textSub }}>Preço original: {fmt(produtoSel.preco)}</p>
                    </div>
                    <button onClick={() => { setProdutoSel(null); setPreco(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSub }}>{Ico.X(12)}</button>
                  </div>
                ) : (
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textSub }}>{Ico.Search()}</div>
                    <input
                      value={busca}
                      onChange={e => setBusca(e.target.value)}
                      placeholder="Pesquisar produto activo..."
                      style={{ width: "100%", padding: "9px 12px 9px 32px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 10, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                    {buscando && <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}><Spinner s /></div>}
                    {produtos.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 10, maxHeight: 200, overflowY: "auto", marginTop: 4 }}>
                        {produtos.map(p => (
                          <button
                            key={p.id}
                            onClick={() => { setProdutoSel(p); setBusca(""); setProdutos([]); }}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                            onMouseEnter={e => e.currentTarget.style.background = C.grayDim}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}
                          >
                            {p.imagens?.[0] && <img src={p.imagens[0]} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nome}</p>
                              <p style={{ fontSize: 11, color: C.textSub }}>{fmt(p.preco)} · {p.categoria?.nome}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Produto info se edição */}
            {item?.produto && (
              <div style={{ padding: "10px 14px", background: C.grayDim, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                {item.produto.imagens?.[0] && <img src={item.produto.imagens[0]} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.produto.nome}</p>
                  <p style={{ fontSize: 11, color: C.textSub }}>Preço original: {fmt(item.precoOriginal)}</p>
                </div>
              </div>
            )}

            {/* Preço */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Preço relâmpago (MZN) *
                {precoOrig > 0 && <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>· original: {fmt(precoOrig)}</span>}
              </label>
              <input
                type="number"
                value={preco}
                onChange={e => setPreco(e.target.value)}
                placeholder="ex: 5000"
                min="1"
                style={{ width: "100%", padding: "9px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 10, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
              {desconto > 0 && (
                <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.red, background: C.redDim, padding: "2px 8px", borderRadius: 99 }}>-{desconto}% desconto</span>
                  <span style={{ fontSize: 12, color: C.textSub }}>poupança de {fmt(precoOrig - Number(preco))}</span>
                </div>
              )}
            </div>

            {/* Quantidade limite */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Quantidade limite <span style={{ fontWeight: 400, color: "#9ca3af" }}>(opcional — vazio = ilimitado)</span>
              </label>
              <input
                type="number"
                value={limite}
                onChange={e => setLimite(e.target.value)}
                placeholder="ex: 20"
                min="1"
                style={{ width: "100%", padding: "9px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 10, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>

            {/* Período */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.05em" }}>Período *</label>
                <button onClick={preencherSugestao} style={{ fontSize: 11, color: C.amber, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  Preencher agora → +24h
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>Início</p>
                  <input type="datetime-local" value={inicioEm} onChange={e => setInicioEm(e.target.value)}
                    style={{ width: "100%", padding: "9px 10px", fontSize: 12, border: `1.5px solid ${C.border}`, borderRadius: 10, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>Fim</p>
                  <input type="datetime-local" value={fimEm} onChange={e => setFimEm(e.target.value)}
                    style={{ width: "100%", padding: "9px 10px", fontSize: 12, border: `1.5px solid ${C.border}`, borderRadius: 10, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>

            {/* Resumo */}
            {preco && inicioEm && fimEm && desconto > 0 && (
              <div style={{ padding: "12px 14px", background: C.amberDim, border: `1px solid ${C.amberBorder}`, borderRadius: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>Resumo da oferta</p>
                {[
                  ["Produto", (produtoSel || item?.produto)?.nome || "—"],
                  ["Preço original", fmt(precoOrig)],
                  ["Preço relâmpago", fmt(Number(preco))],
                  ["Desconto", `-${desconto}%`],
                  ...(limite ? [["Unidades disponíveis", limite]] : []),
                  ["Início", fmtData(new Date(inicioEm).toISOString())],
                  ["Fim", fmtData(new Date(fimEm).toISOString())],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#92400e", marginBottom: 4 }}>
                    <span>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {erro && (
              <div style={{ padding: "10px 14px", background: C.redDim, border: `1px solid #fecaca`, borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>{erro}</p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={onClose} disabled={enviando}
              style={{ flex: 1, padding: "11px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.textSub, background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
            <button onClick={handleSalvar} disabled={enviando}
              style={{ flex: 1, padding: "11px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff", background: C.amber, cursor: enviando ? "default" : "pointer", opacity: enviando ? 0.7 : 1, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {enviando ? <Spinner s /> : Ico.Zap(14)}
              {enviando ? "A guardar..." : item ? "Guardar alterações" : "⚡ Criar oferta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal Detalhe / Ver ───────────────────────────────────────────
function ModalDetalhe({ item, onClose }) {
  const est = estadoInfo(item);
  const restante = item.fimEm ? tempoRestante(item.fimEm) : null;
  const pct = item.quantidadeLimite
    ? Math.round(((item.quantidadeVendida || 0) / item.quantidadeLimite) * 100)
    : null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: C.card, borderRadius: 20, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Detalhe da oferta</h3>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSub }}>{Ico.X()}</button>
          </div>

          {/* Produto */}
          {item.produto && (
            <div style={{ display: "flex", gap: 12, padding: "12px 14px", background: C.grayDim, borderRadius: 12, marginBottom: 16 }}>
              {item.produto.imagens?.[0] && <img src={item.produto.imagens[0]} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />}
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.produto.nome}</p>
                <p style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{item.produto.categoria?.nome} · {item.produto.vendedor?.nomeCompleto}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <Badge label={est.label} color={est.color} bg={est.bg} />
                  {restante && <Badge label={`⏱ ${restante}`} color={C.amber} bg={C.amberDim} />}
                </div>
              </div>
            </div>
          )}

          {/* Preços */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Preço original", valor: fmt(item.precoOriginal), color: C.textSub },
              { label: "Preço relâmpago", valor: fmt(item.precoRelampago), color: C.amber },
              { label: "Desconto", valor: `-${item.desconto ?? disc(item.precoOriginal, item.precoRelampago)}%`, color: C.red },
            ].map(c => (
              <div key={c.label} style={{ padding: "10px 12px", background: C.grayDim, borderRadius: 10, textAlign: "center" }}>
                <p style={{ fontSize: 11, color: C.textSub, marginBottom: 4 }}>{c.label}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.valor}</p>
              </div>
            ))}
          </div>

          {/* Período */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ padding: "10px 12px", background: C.grayDim, borderRadius: 10 }}>
              <p style={{ fontSize: 11, color: C.textSub, marginBottom: 3 }}>Início</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{fmtData(item.inicioEm)}</p>
            </div>
            <div style={{ padding: "10px 12px", background: C.grayDim, borderRadius: 10 }}>
              <p style={{ fontSize: 11, color: C.textSub, marginBottom: 3 }}>Fim</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{fmtData(item.fimEm)}</p>
            </div>
          </div>

          {/* Stock */}
          {item.quantidadeLimite != null && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.textSub }}>Unidades vendidas</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{item.quantidadeVendida ?? 0} / {item.quantidadeLimite}</span>
              </div>
              <div style={{ height: 8, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? C.red : C.amber, borderRadius: 99, transition: "width .4s" }} />
              </div>
              <p style={{ fontSize: 11, color: C.textSub, marginTop: 4 }}>{pct}% vendido · {item.quantidadeLimite - (item.quantidadeVendida || 0)} restantes</p>
            </div>
          )}

          {/* Criado por */}
          {item.criadoPor && (
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Criado por: {item.criadoPor.nomeCompleto} em {fmtData(item.criadoEm)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════
export default function PageRelampago() {
  const [kpis, setKpis]             = useState(null);
  const [vendas, setVendas]         = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina]         = useState(1);
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [loadKpis, setLoadKpis]     = useState(true);
  const [loadVendas, setLoadVendas] = useState(true);
  const [acaoId, setAcaoId]         = useState(null);
  const [modal, setModal]           = useState(null); // null | "novo" | { item } | { detalhe }
  const [toast, setToast]           = useState(null);
  const [expirandoVencidas, setExpirandoVencidas] = useState(false);

  function showToast(msg, tipo = "success") {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  const carregarKpis = useCallback(async () => {
    setLoadKpis(true);
    try {
      const res = await api.kpis();
      setKpis(res.data);
    } catch (_) {} finally { setLoadKpis(false); }
  }, []);

  const carregarVendas = useCallback(async () => {
    setLoadVendas(true);
    try {
      const params = { pagina, estado: filtroEstado };
      const res = await api.listar(params);
      const d = res.data;
      setVendas(d.vendas || []);
      setTotal(d.total || 0);
      setTotalPaginas(d.totalPaginas || 1);
    } catch (e) {
      showToast("Erro ao carregar: " + e.message, "error");
    } finally { setLoadVendas(false); }
  }, [pagina, filtroEstado]);

  useEffect(() => { carregarKpis(); }, [carregarKpis]);
  useEffect(() => { carregarVendas(); }, [carregarVendas]);

  async function handleDesativar(id) {
    if (!window.confirm("Desativar esta venda relâmpago?")) return;
    setAcaoId(id);
    try {
      await api.desativar(id);
      showToast("Venda relâmpago desativada.");
      carregarVendas();
      carregarKpis();
    } catch (e) {
      showToast(e.message, "error");
    } finally { setAcaoId(null); }
  }

  async function handleExpirarVencidas() {
    setExpirandoVencidas(true);
    try {
      const res = await api.expirarVencidas();
      showToast(`${res.data?.expiradas ?? 0} venda(s) expirada(s) processada(s).`);
      carregarVendas();
      carregarKpis();
    } catch (e) {
      showToast(e.message, "error");
    } finally { setExpirandoVencidas(false); }
  }

  function handleSalvo(novaVenda) {
    showToast(modal?.item ? "Venda actualizada!" : "Venda relâmpago criada!");
    setModal(null);
    carregarVendas();
    carregarKpis();
  }

  function mudarFiltro(f) { setFiltroEstado(f); setPagina(1); }

  const FILTROS = [
    { id: "todas",    label: "Todas" },
    { id: "ativa",    label: "Activas" },
    { id: "futura",   label: "Futuras" },
    { id: "expirada", label: "Expiradas" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fadeUp{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes slideIn{ from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:none} }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 200,
          padding: "12px 18px", borderRadius: 12, fontWeight: 600, fontSize: 13,
          background: toast.tipo === "error" ? C.red : C.green, color: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)", animation: "slideIn .25s ease",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {toast.tipo === "error" ? Ico.Alert() : Ico.Check()}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.amberDim, display: "flex", alignItems: "center", justifyContent: "center", color: C.amber }}>
              {Ico.Zap(18)}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Vendas Relâmpago</h2>
          </div>
          <p style={{ fontSize: 13, color: C.textSub, marginLeft: 46 }}>Cria e gere ofertas com desconto por tempo limitado</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleExpirarVencidas}
            disabled={expirandoVencidas}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 12, fontWeight: 600, border: `1.5px solid ${C.border}`, borderRadius: 9, background: "transparent", color: C.textSub, cursor: "pointer", fontFamily: "inherit" }}
          >
            {expirandoVencidas ? <Spinner s /> : Ico.Clock()}
            Expirar vencidas
          </button>
          <button
            onClick={() => carregarVendas()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 12, fontWeight: 600, border: `1.5px solid ${C.border}`, borderRadius: 9, background: "transparent", color: C.textSub, cursor: "pointer", fontFamily: "inherit" }}
          >
            {Ico.Refresh()} Actualizar
          </button>
          <button
            onClick={() => setModal("novo")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 9, background: C.amber, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}
          >
            {Ico.Plus()} Nova oferta
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Activas agora"      valor={kpis?.ativas ?? "—"}      color={C.green}  icon={Ico.Zap(18)}     loading={loadKpis} sub="a decorrer" />
        <KpiCard label="Futuras agendadas"  valor={kpis?.futuras ?? "—"}     color={C.blue}   icon={Ico.Clock(18)}   loading={loadKpis} sub="não iniciadas" />
        <KpiCard label="Expiradas"          valor={kpis?.expiradas ?? "—"}   color={C.gray}   icon={Ico.Package(18)} loading={loadKpis} sub="histórico" />
        <KpiCard label="Unidades vendidas"  valor={kpis?.totalUnidadesVendidas ?? "—"} color={C.amber} icon={Ico.Check(18)} loading={loadKpis} sub="via relâmpago" />
      </div>

      {/* Info fluxo */}
      <div style={{ padding: "14px 18px", background: C.amberDim, border: `1px solid ${C.amberBorder}`, borderRadius: 12, marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
        {Ico.Alert()}
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Como funciona o fluxo admin → vendedor → comprador</p>
          <p style={{ fontSize: 12, color: "#a16207", marginTop: 4, lineHeight: 1.6 }}>
            <strong>Admin cria aqui</strong> → aparece automaticamente em <strong>⚡ Flash Deals</strong> na loja pública e na aba <strong>Relâmpago</strong> da área de vendas do vendedor. 
            O vendedor também pode criar as suas próprias ofertas relâmpago na SecaoVendas, mas estas ficam associadas aos seus produtos. 
            Aqui o admin pode gerir TODAS as ofertas de TODOS os vendedores.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTROS.map(f => (
          <button key={f.id} onClick={() => mudarFiltro(f.id)}
            style={{ padding: "7px 16px", fontSize: 12, fontWeight: 600, border: `1.5px solid ${filtroEstado === f.id ? C.amber : C.border}`, borderRadius: 99, background: filtroEstado === f.id ? C.amberDim : "transparent", color: filtroEstado === f.id ? "#92400e" : C.textSub, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            {f.label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: C.textSub, display: "flex", alignItems: "center" }}>
          {total} resultado{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabela */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {/* Cabeçalho tabela */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 100px", padding: "10px 16px", borderBottom: `1.5px solid ${C.border}`, background: "#fafafa" }}>
          {["Produto", "Estado", "Preço / Desconto", "Período", "Stock", "Criado por", "Ações"].map((h, i) => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 6 ? "center" : "left" }}>{h}</span>
          ))}
        </div>

        {loadVendas ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px 0", gap: 10 }}>
            <Spinner /> <span style={{ fontSize: 13, color: C.textSub }}>A carregar...</span>
          </div>
        ) : vendas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.amberDim, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: C.amber, fontSize: 24 }}>⚡</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.textSub }}>Nenhuma venda relâmpago encontrada</p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Cria a primeira clicando em "Nova oferta"</p>
          </div>
        ) : (
          vendas.map((v, i) => {
            const est  = estadoInfo(v);
            const rest = v.fimEm ? tempoRestante(v.fimEm) : null;
            const pct  = v.quantidadeLimite ? Math.round(((v.quantidadeVendida || 0) / v.quantidadeLimite) * 100) : null;
            const desconto = v.desconto ?? disc(v.precoOriginal, v.precoRelampago);
            const emAcao = acaoId === v.id;
            const podeEditar = v.ativo && new Date(v.fimEm) > new Date();

            return (
              <div
                key={v.id}
                style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 100px", padding: "14px 16px", borderBottom: i < vendas.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center", animation: "fadeUp .2s ease", transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Produto */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  {v.produto?.imagens?.[0]
                    ? <img src={v.produto.imagens[0]} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 38, height: 38, borderRadius: 8, background: C.amberDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.amber }}>⚡</div>
                  }
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.produto?.nome || "—"}</p>
                    <p style={{ fontSize: 11, color: C.textSub }}>{v.produto?.categoria?.nome || "—"}</p>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <Badge label={est.label} color={est.color} bg={est.bg} />
                  {rest && <p style={{ fontSize: 10, color: C.amber, marginTop: 4, fontWeight: 600 }}>⏱ {rest}</p>}
                </div>

                {/* Preço */}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{fmt(v.precoRelampago)}</p>
                  <p style={{ fontSize: 11, color: C.textSub, textDecoration: "line-through" }}>{fmt(v.precoOriginal)}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.red, background: C.redDim, padding: "1px 6px", borderRadius: 99 }}>-{desconto}%</span>
                </div>

                {/* Período */}
                <div>
                  <p style={{ fontSize: 11, color: C.textSub }}>Início: {fmtData(v.inicioEm)}</p>
                  <p style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>Fim: {fmtData(v.fimEm)}</p>
                </div>

                {/* Stock */}
                <div>
                  {v.quantidadeLimite != null ? (
                    <>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{v.quantidadeVendida ?? 0} / {v.quantidadeLimite}</p>
                      <div style={{ marginTop: 4, height: 5, background: "#f3f4f6", borderRadius: 99, overflow: "hidden", width: 60 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? C.red : C.amber, borderRadius: 99 }} />
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: 11, color: "#9ca3af" }}>Ilimitado</p>
                  )}
                </div>

                {/* Criado por */}
                <div>
                  <p style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{v.criadoPor?.nomeCompleto || "—"}</p>
                  <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{fmtData(v.criadoEm)}</p>
                </div>

                {/* Ações */}
                <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                  <button
                    onClick={() => setModal({ detalhe: v })}
                    title="Ver detalhe"
                    style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, borderRadius: 7, background: "transparent", cursor: "pointer", color: C.textSub }}
                  >{Ico.Eye()}</button>
                  {podeEditar && (
                    <button
                      onClick={() => setModal({ item: v })}
                      title="Editar"
                      style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, borderRadius: 7, background: "transparent", cursor: "pointer", color: C.textSub }}
                    >{Ico.Edit()}</button>
                  )}
                  {v.ativo && (
                    <button
                      onClick={() => handleDesativar(v.id)}
                      disabled={emAcao}
                      title="Desativar"
                      style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid #fecaca`, borderRadius: 7, background: "transparent", cursor: emAcao ? "default" : "pointer", color: C.red, opacity: emAcao ? 0.5 : 1 }}
                    >{emAcao ? <Spinner s /> : Ico.Trash()}</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", cursor: pagina === 1 ? "default" : "pointer", opacity: pagina === 1 ? 0.4 : 1, color: C.textSub }}>
            {Ico.ChevL()}
          </button>
          {Array.from({ length: totalPaginas }).map((_, i) => (
            <button key={i} onClick={() => setPagina(i + 1)}
              style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${pagina === i + 1 ? C.amber : C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 700, background: pagina === i + 1 ? C.amberDim : "transparent", color: pagina === i + 1 ? "#92400e" : C.textSub, cursor: "pointer" }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", cursor: pagina === totalPaginas ? "default" : "pointer", opacity: pagina === totalPaginas ? 0.4 : 1, color: C.textSub }}>
            {Ico.ChevR()}
          </button>
        </div>
      )}

      {/* Modais */}
      {modal === "novo"  && <ModalRelampago onClose={() => setModal(null)} onSalvo={handleSalvo} />}
      {modal?.item       && <ModalRelampago item={modal.item} onClose={() => setModal(null)} onSalvo={handleSalvo} />}
      {modal?.detalhe    && <ModalDetalhe item={modal.detalhe} onClose={() => setModal(null)} />}
    </div>
  );
}