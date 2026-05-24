// ─────────────────────────────────────────────────────────────────
// MOZTICTAC — PAGE ADMIN: VENDAS RELÂMPAGO + HERO SLIDES (integrado)
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

const apiRelampago = {
  kpis:            ()          => req("/admin/relampago/kpis"),
  listar:          (params)    => req(`/admin/relampago?${new URLSearchParams(params)}`),
  criar:           (dados)     => req("/admin/relampago",       { method: "POST", body: JSON.stringify(dados) }),
  atualizar:       (id, dados) => req(`/admin/relampago/${id}`, { method: "PUT",  body: JSON.stringify(dados) }),
  desativar:       (id)        => req(`/admin/relampago/${id}`, { method: "DELETE" }),
  expirarVencidas: ()          => req("/admin/relampago/expirar-vencidas", { method: "POST" }),
  produtos:        (busca)     => req(`/admin/produtos?busca=${encodeURIComponent(busca || "")}&estado=ATIVO&pagina=1`),
};

const apiHero = {
  listar:    ()           => req("/hero/admin"),
  criar:     (d)          => req("/hero/admin",            { method: "POST",   body: JSON.stringify(d) }),
  atualizar: (id, d)      => req(`/hero/admin/${id}`,      { method: "PUT",    body: JSON.stringify(d) }),
  eliminar:  (id)         => req(`/hero/admin/${id}`,      { method: "DELETE" }),
  reordenar: (items)      => req("/hero/admin/reordenar",  { method: "PUT",    body: JSON.stringify(items) }),
  produtos:  (busca)      => req(`/admin/produtos?busca=${encodeURIComponent(busca||"")}&estado=ATIVO&pagina=1`),
};

// ── Paleta unificada ──────────────────────────────────────────────
const C = {
  bg:"#f5f6fa", card:"#fff", border:"#e8eaf0",
  text:"#1a1d2e", sub:"#5a6080", mute:"#9aa0bc",
  blue:"#3b6ef8", blueLt:"#eef2ff",
  green:"#16a34a", greenLt:"#f0fdf4",
  amber:"#d97706", amberLt:"#fffbeb", amberBorder:"#fde68a",
  red:"#ef4444", redLt:"#fef2f2",
  purple:"#8b5cf6", purpleLt:"#f5f3ff",
  gray:"#6b7280", grayDim:"#f9fafb",
};

const ACCENT_OPTS = [
  { label:"Verde",   value:"#00b96b" },
  { label:"Azul",    value:"#3b82f6" },
  { label:"Laranja", value:"#f97316" },
  { label:"Roxo",    value:"#8b5cf6" },
  { label:"Rosa",    value:"#ec4899" },
  { label:"Vermelho",value:"#ef4444" },
];

// ── Helpers ───────────────────────────────────────────────────────
const fmt     = (n) => Number(n || 0).toLocaleString("pt-MZ") + " MZN";
const fmtData = (d) => d ? new Date(d).toLocaleString("pt-MZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const disc    = (orig, promo) => orig > 0 ? Math.round((1 - promo / orig) * 100) : 0;

function estadoInfo(r) {
  const agora = new Date();
  if (!r.ativo)                     return { label:"Inativa",  color:C.gray,  bg:"#f3f4f6" };
  if (new Date(r.inicioEm) > agora) return { label:"Futura",   color:C.blue,  bg:C.blueLt  };
  if (new Date(r.fimEm)    < agora) return { label:"Expirada", color:C.gray,  bg:"#f3f4f6" };
  return                                   { label:"Activa",   color:C.green, bg:C.greenLt };
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
  Image:   (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Up:      (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>,
  Down:    (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  Info:    (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Slides:  (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
};

// ── Spinner ───────────────────────────────────────────────────────
function Spinner({ s = false, color = C.amber }) {
  return <div style={{ width:s?14:20, height:s?14:20, border:"2px solid #e5e7eb", borderTopColor:color, borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }} />;
}

// ── Badge ─────────────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:bg, color, display:"inline-block", whiteSpace:"nowrap" }}>{label}</span>;
}

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  const isErr = type === "error";
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:3000, display:"flex", alignItems:"center", gap:10, background:isErr?C.redLt:C.greenLt, border:`1px solid ${isErr?"#fca5a5":"#86efac"}`, borderRadius:14, padding:"12px 16px", fontSize:13, fontWeight:600, color:isErr?"#b91c1c":"#15803d", boxShadow:"0 8px 32px rgba(0,0,0,.12)", maxWidth:400 }}>
      {isErr ? Ico.Alert(15) : Ico.Check(15)}
      <span style={{ flex:1 }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"inherit", padding:0, display:"flex" }}>{Ico.X(13)}</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAIS — RELÂMPAGO
// ══════════════════════════════════════════════════════════════════

function ModalRelampago({ item, onClose, onSalvo }) {
  const [busca, setBusca]           = useState("");
  const [produtos, setProdutos]     = useState([]);
  const [buscando, setBuscando]     = useState(false);
  const [produtoSel, setProdutoSel] = useState(item?.produto || null);
  const [preco, setPreco]           = useState(item?.precoRelampago ? String(item.precoRelampago) : "");
  const [limite, setLimite]         = useState(item?.quantidadeLimite ? String(item.quantidadeLimite) : "");
  const [inicioEm, setInicioEm]     = useState(item?.inicioEm ? new Date(item.inicioEm).toISOString().slice(0,16) : "");
  const [fimEm, setFimEm]           = useState(item?.fimEm   ? new Date(item.fimEm).toISOString().slice(0,16)   : "");
  const [enviando, setEnviando]     = useState(false);
  const [erro, setErro]             = useState("");

  const precoOrig = produtoSel ? Number(produtoSel.preco) : item ? Number(item.precoOriginal) : 0;
  const desconto  = preco && precoOrig ? disc(precoOrig, Number(preco)) : 0;

  useEffect(() => {
    if (!busca.trim()) { setProdutos([]); return; }
    const t = setTimeout(async () => {
      setBuscando(true);
      try { const r = await apiRelampago.produtos(busca); setProdutos(r.data?.produtos || []); }
      catch (_) {} finally { setBuscando(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [busca]);

  function preencherSugestao() {
    const agora = new Date();
    const fim   = new Date(agora.getTime() + 24 * 3600000);
    setInicioEm(agora.toISOString().slice(0,16));
    setFimEm(fim.toISOString().slice(0,16));
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
      const dados = { precoRelampago:Number(preco), quantidadeLimite:limite?Number(limite):undefined, inicioEm:new Date(inicioEm).toISOString(), fimEm:new Date(fimEm).toISOString() };
      const res = item?.id ? await apiRelampago.atualizar(item.id, dados) : await apiRelampago.criar({ ...dados, produtoId:produtoSel.id });
      onSalvo(res.data ?? res.dados);
    } catch (e) { setErro(e.message); }
    finally { setEnviando(false); }
  }

  const inp = { width:"100%", padding:"9px 12px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box", background:"#fafbfe", color:C.text };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:C.card, borderRadius:20, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.18)" }}>
        <div style={{ padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <h3 style={{ fontSize:16, fontWeight:800, color:C.text }}>{item ? "Editar venda relâmpago" : "Nova venda relâmpago"}</h3>
              <p style={{ fontSize:12, color:C.mute, marginTop:2 }}>Oferta com desconto por tempo limitado</p>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.mute, padding:4 }}>{Ico.X()}</button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Produto */}
            {!item && (
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:C.mute, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Produto *</label>
                {produtoSel ? (
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:C.amberLt, border:`1px solid ${C.amberBorder}`, borderRadius:10 }}>
                    {produtoSel.imagens?.[0] && <img src={produtoSel.imagens[0]} alt="" style={{ width:36, height:36, borderRadius:8, objectFit:"cover", flexShrink:0 }} />}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{produtoSel.nome}</p>
                      <p style={{ fontSize:11, color:C.mute }}>Preço original: {fmt(produtoSel.preco)}</p>
                    </div>
                    <button onClick={() => { setProdutoSel(null); setPreco(""); }} style={{ background:"none", border:"none", cursor:"pointer", color:C.mute }}>{Ico.X(12)}</button>
                  </div>
                ) : (
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.mute }}>{Ico.Search()}</span>
                    <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Pesquisar produto activo..." style={{ ...inp, paddingLeft:32 }} />
                    {buscando && <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)" }}><Spinner s color={C.amber} /></span>}
                    {produtos.length > 0 && (
                      <div style={{ position:"absolute", top:"100%", left:0, right:0, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,.10)", zIndex:10, maxHeight:200, overflowY:"auto", marginTop:4 }}>
                        {produtos.map(p => (
                          <button key={p.id} onClick={() => { setProdutoSel(p); setBusca(""); setProdutos([]); }}
                            style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}
                            onMouseEnter={e=>e.currentTarget.style.background=C.grayDim}
                            onMouseLeave={e=>e.currentTarget.style.background="none"}>
                            {p.imagens?.[0] && <img src={p.imagens[0]} alt="" style={{ width:32, height:32, borderRadius:6, objectFit:"cover", flexShrink:0 }} />}
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:13, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nome}</p>
                              <p style={{ fontSize:11, color:C.mute }}>{fmt(p.preco)} · {p.categoria?.nome}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {item?.produto && (
              <div style={{ padding:"10px 14px", background:C.grayDim, borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
                {item.produto.imagens?.[0] && <img src={item.produto.imagens[0]} alt="" style={{ width:36, height:36, borderRadius:8, objectFit:"cover" }} />}
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.text }}>{item.produto.nome}</p>
                  <p style={{ fontSize:11, color:C.mute }}>Preço original: {fmt(item.precoOriginal)}</p>
                </div>
              </div>
            )}

            {/* Preço */}
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:C.mute, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>
                Preço relâmpago (MZN) *
                {precoOrig > 0 && <span style={{ fontWeight:400, color:"#9ca3af", marginLeft:6 }}>· original: {fmt(precoOrig)}</span>}
              </label>
              <input type="number" value={preco} onChange={e=>setPreco(e.target.value)} placeholder="ex: 5000" min="1" style={inp} />
              {desconto > 0 && (
                <div style={{ marginTop:6, display:"flex", gap:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.red, background:C.redLt, padding:"2px 8px", borderRadius:99 }}>-{desconto}% desconto</span>
                  <span style={{ fontSize:12, color:C.mute }}>poupança de {fmt(precoOrig - Number(preco))}</span>
                </div>
              )}
            </div>

            {/* Quantidade */}
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:C.mute, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>
                Quantidade limite <span style={{ fontWeight:400, color:"#9ca3af" }}>(opcional — vazio = ilimitado)</span>
              </label>
              <input type="number" value={limite} onChange={e=>setLimite(e.target.value)} placeholder="ex: 20" min="1" style={inp} />
            </div>

            {/* Período */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.mute, textTransform:"uppercase", letterSpacing:"0.05em" }}>Período *</label>
                <button onClick={preencherSugestao} style={{ fontSize:11, color:C.amber, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Preencher agora → +24h</button>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:11, color:C.mute, marginBottom:4 }}>Início</p>
                  <input type="datetime-local" value={inicioEm} onChange={e=>setInicioEm(e.target.value)} style={{ ...inp, fontSize:12 }} />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:11, color:C.mute, marginBottom:4 }}>Fim</p>
                  <input type="datetime-local" value={fimEm} onChange={e=>setFimEm(e.target.value)} style={{ ...inp, fontSize:12 }} />
                </div>
              </div>
            </div>

            {/* Resumo */}
            {preco && inicioEm && fimEm && desconto > 0 && (
              <div style={{ padding:"12px 14px", background:C.amberLt, border:`1px solid ${C.amberBorder}`, borderRadius:12 }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#92400e", marginBottom:8 }}>Resumo da oferta</p>
                {[
                  ["Produto", (produtoSel||item?.produto)?.nome||"—"],
                  ["Preço original", fmt(precoOrig)],
                  ["Preço relâmpago", fmt(Number(preco))],
                  ["Desconto", `-${desconto}%`],
                  ...(limite?[["Unidades",limite]]:[]),
                  ["Início", fmtData(new Date(inicioEm).toISOString())],
                  ["Fim", fmtData(new Date(fimEm).toISOString())],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#92400e", marginBottom:4 }}>
                    <span>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {erro && (
              <div style={{ padding:"10px 14px", background:C.redLt, border:`1px solid #fecaca`, borderRadius:10 }}>
                <p style={{ fontSize:12, color:C.red, fontWeight:600 }}>{erro}</p>
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={onClose} disabled={enviando} style={{ flex:1, padding:"11px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontWeight:600, color:C.sub, background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
            <button onClick={handleSalvar} disabled={enviando} style={{ flex:1, padding:"11px", border:"none", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", background:C.amber, cursor:enviando?"default":"pointer", opacity:enviando?.7:1, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              {enviando ? <Spinner s color="#fff" /> : Ico.Zap(14)}
              {enviando ? "A guardar..." : item ? "Guardar alterações" : "⚡ Criar oferta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalDetalheRelampago({ item, onClose }) {
  const est = estadoInfo(item);
  const restante = item.fimEm ? tempoRestante(item.fimEm) : null;
  const pct = item.quantidadeLimite ? Math.round(((item.quantidadeVendida||0)/item.quantidadeLimite)*100) : null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:C.card, borderRadius:20, width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,.18)" }}>
        <div style={{ padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:C.text }}>Detalhe da oferta</h3>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.mute }}>{Ico.X()}</button>
          </div>
          {item.produto && (
            <div style={{ display:"flex", gap:12, padding:"12px 14px", background:C.grayDim, borderRadius:12, marginBottom:16 }}>
              {item.produto.imagens?.[0] && <img src={item.produto.imagens[0]} alt="" style={{ width:56, height:56, borderRadius:10, objectFit:"cover", flexShrink:0 }} />}
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:C.text }}>{item.produto.nome}</p>
                <p style={{ fontSize:12, color:C.mute, marginTop:2 }}>{item.produto.categoria?.nome} · {item.produto.vendedor?.nomeCompleto}</p>
                <div style={{ display:"flex", gap:6, marginTop:6 }}>
                  <Badge label={est.label} color={est.color} bg={est.bg} />
                  {restante && <Badge label={`⏱ ${restante}`} color={C.amber} bg={C.amberLt} />}
                </div>
              </div>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
            {[
              { label:"Preço original",   valor:fmt(item.precoOriginal),   color:C.mute  },
              { label:"Preço relâmpago",  valor:fmt(item.precoRelampago),  color:C.amber },
              { label:"Desconto",         valor:`-${item.desconto??disc(item.precoOriginal,item.precoRelampago)}%`, color:C.red },
            ].map(c=>(
              <div key={c.label} style={{ padding:"10px 12px", background:C.grayDim, borderRadius:10, textAlign:"center" }}>
                <p style={{ fontSize:11, color:C.mute, marginBottom:4 }}>{c.label}</p>
                <p style={{ fontSize:14, fontWeight:700, color:c.color }}>{c.valor}</p>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            <div style={{ padding:"10px 12px", background:C.grayDim, borderRadius:10 }}>
              <p style={{ fontSize:11, color:C.mute, marginBottom:3 }}>Início</p>
              <p style={{ fontSize:12, fontWeight:600, color:C.text }}>{fmtData(item.inicioEm)}</p>
            </div>
            <div style={{ padding:"10px 12px", background:C.grayDim, borderRadius:10 }}>
              <p style={{ fontSize:11, color:C.mute, marginBottom:3 }}>Fim</p>
              <p style={{ fontSize:12, fontWeight:600, color:C.text }}>{fmtData(item.fimEm)}</p>
            </div>
          </div>
          {item.quantidadeLimite != null && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, color:C.mute }}>Unidades vendidas</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{item.quantidadeVendida??0} / {item.quantidadeLimite}</span>
              </div>
              <div style={{ height:8, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:pct>=70?C.red:C.amber, borderRadius:99 }} />
              </div>
              <p style={{ fontSize:11, color:C.mute, marginTop:4 }}>{pct}% vendido · {item.quantidadeLimite-(item.quantidadeVendida||0)} restantes</p>
            </div>
          )}
          {item.criadoPor && <p style={{ fontSize:12, color:"#9ca3af" }}>Criado por: {item.criadoPor.nomeCompleto} em {fmtData(item.criadoEm)}</p>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL — HERO SLIDE
// ══════════════════════════════════════════════════════════════════

function ModalHeroSlide({ item, onClose, onSalvo }) {
  const [titulo,      setTitulo]      = useState(item?.titulo      || "");
  const [subtitulo,   setSubtitulo]   = useState(item?.subtitulo   || "");
  const [descricao,   setDescricao]   = useState(item?.descricao   || "");
  const [ctaTexto,    setCtaTexto]    = useState(item?.ctaTexto    || "Ver mais");
  const [ctaUrl,      setCtaUrl]      = useState(item?.ctaUrl      || "/tendencias");
  const [imagemUrl,   setImagemUrl]   = useState(item?.imagemUrl   || "");
  const [tag,         setTag]         = useState(item?.tag         || "Destaque");
  const [accentColor, setAccentColor] = useState(item?.accentColor || "#00b96b");
  const [statLabel,   setStatLabel]   = useState(item?.statLabel   || "");
  const [statValor,   setStatValor]   = useState(item?.statValor   || "");
  const [ativo,       setAtivo]       = useState(item?.ativo       ?? true);
  const [ordem,       setOrdem]       = useState(item?.ordem       ?? 0);
  const [buscaProd,   setBuscaProd]   = useState("");
  const [prodResults, setProdResults] = useState([]);
  const [buscando,    setBuscando]    = useState(false);
  const [produtoSel,  setProdutoSel]  = useState(item?.produto     || null);
  const [enviando,    setEnviando]    = useState(false);
  const [erro,        setErro]        = useState("");

  useEffect(() => {
    if (!buscaProd.trim()) { setProdResults([]); return; }
    const t = setTimeout(async () => {
      setBuscando(true);
      try { const r = await apiHero.produtos(buscaProd); setProdResults(r.data?.produtos || []); }
      catch (_) {} finally { setBuscando(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [buscaProd]);

  function selecionarProduto(p) {
    setProdutoSel(p);
    setBuscaProd(""); setProdResults([]);
    if (!titulo)    setTitulo(p.nome);
    if (!imagemUrl) setImagemUrl(p.imagens?.[0] || "");
    if (!subtitulo) setSubtitulo(p.categoria?.nome || "");
    if (!ctaUrl)    setCtaUrl(`/produto/${p.id}`);
    setStatLabel("Vendas"); setStatValor(`${p.totalVendas ?? 0}`);
  }

  async function handleSalvar() {
    setErro("");
    if (!titulo.trim())    { setErro("Título obrigatório."); return; }
    if (!imagemUrl.trim()) { setErro("URL da imagem obrigatória."); return; }
    setEnviando(true);
    try {
      const dados = { titulo, subtitulo, descricao, ctaTexto, ctaUrl, imagemUrl, tag, accentColor, statLabel, statValor, ativo, ordem:Number(ordem), produtoId:produtoSel?.id??null };
      const r = item?.id ? await apiHero.atualizar(item.id, dados) : await apiHero.criar(dados);
      onSalvo(r.data);
    } catch (e) { setErro(e.message); }
    finally { setEnviando(false); }
  }

  const inp = { width:"100%", padding:"9px 12px", fontSize:13, border:`1.5px solid ${C.border}`, borderRadius:10, outline:"none", fontFamily:"inherit", boxSizing:"border-box", color:C.text, background:"#fafbfe" };
  const lbl = { fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".7px", color:C.mute, display:"block", marginBottom:5 };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:C.card, borderRadius:20, width:"100%", maxWidth:560, maxHeight:"92vh", overflow:"auto", boxShadow:"0 32px 100px rgba(0,0,0,.25)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px 16px", borderBottom:`1px solid ${C.border}` }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{item ? "Editar slide" : "Novo slide"}</div>
            <div style={{ color:C.mute, fontSize:12, marginTop:2 }}>Configurar slide do hero da página principal</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.mute, display:"flex", padding:4 }}>{Ico.X(17)}</button>
        </div>

        <div style={{ padding:24, display:"flex", flexDirection:"column", gap:14 }}>
          {/* Preview */}
          {imagemUrl && (
            <div style={{ borderRadius:14, overflow:"hidden", height:140, position:"relative", border:`1px solid ${C.border}` }}>
              <img src={imagemUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(0,0,0,.7) 40%,rgba(0,0,0,.1))" }} />
              <div style={{ position:"absolute", bottom:12, left:16 }}>
                <span style={{ fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:99, background:accentColor+"33", color:accentColor, border:`1px solid ${accentColor}55` }}>{tag}</span>
                <div style={{ fontSize:18, fontWeight:800, color:"#fff", marginTop:4 }}>{titulo||"Título do slide"}</div>
                <div style={{ fontSize:11, color:accentColor, marginTop:1 }}>{subtitulo}</div>
              </div>
            </div>
          )}

          {/* Produto */}
          <div>
            <label style={lbl}>Produto associado <span style={{ fontWeight:400, color:C.mute }}>(opcional)</span></label>
            {produtoSel ? (
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:C.blueLt, border:`1px solid ${C.blue}30`, borderRadius:10 }}>
                {produtoSel.imagens?.[0] && <img src={produtoSel.imagens[0]} alt="" style={{ width:36, height:36, borderRadius:8, objectFit:"cover", flexShrink:0 }} />}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{produtoSel.nome}</div>
                  <div style={{ fontSize:11, color:C.mute }}>Produto vinculado ao slide</div>
                </div>
                <button onClick={()=>setProdutoSel(null)} style={{ background:"none", border:"none", cursor:"pointer", color:C.mute }}>{Ico.X(13)}</button>
              </div>
            ) : (
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.mute }}>{Ico.Search()}</span>
                <input value={buscaProd} onChange={e=>setBuscaProd(e.target.value)} placeholder="Pesquisar produto activo..." style={{ ...inp, paddingLeft:32 }} />
                {buscando && <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)" }}><Spinner s color={C.blue} /></span>}
                {prodResults.length > 0 && (
                  <div style={{ position:"absolute", top:"100%", left:0, right:0, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,.10)", zIndex:10, maxHeight:200, overflowY:"auto", marginTop:4 }}>
                    {prodResults.map(p=>(
                      <button key={p.id} onClick={()=>selecionarProduto(p)}
                        style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#f5f6fa"}
                        onMouseLeave={e=>e.currentTarget.style.background="none"}>
                        {p.imagens?.[0] && <img src={p.imagens[0]} alt="" style={{ width:32, height:32, borderRadius:6, objectFit:"cover", flexShrink:0 }} />}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nome}</div>
                          <div style={{ fontSize:11, color:C.mute }}>{p.categoria?.nome}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={lbl}>Título *</label><input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="ex: Moda Moçambicana" style={inp} /></div>
            <div><label style={lbl}>Subtítulo</label><input value={subtitulo} onChange={e=>setSubtitulo(e.target.value)} placeholder="ex: Autêntica & Artesanal" style={inp} /></div>
          </div>

          <div><label style={lbl}>Descrição</label><textarea value={descricao} onChange={e=>setDescricao(e.target.value)} rows={2} placeholder="Texto de apoio breve..." style={{ ...inp, resize:"vertical" }} /></div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={lbl}>Texto do botão</label><input value={ctaTexto} onChange={e=>setCtaTexto(e.target.value)} placeholder="ex: Ver produtos" style={inp} /></div>
            <div><label style={lbl}>URL do botão</label><input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)} placeholder="ex: /tendencias" style={inp} /></div>
          </div>

          <div>
            <label style={lbl}>URL da imagem *</label>
            <div style={{ display:"flex", gap:8 }}>
              <input value={imagemUrl} onChange={e=>setImagemUrl(e.target.value)} placeholder="https://..." style={{ ...inp, flex:1 }} />
              {imagemUrl && <a href={imagemUrl} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", padding:"0 12px", background:C.blueLt, borderRadius:10, border:`1px solid ${C.blue}30`, color:C.blue, flexShrink:0 }}>{Ico.Eye(14)}</a>}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <div><label style={lbl}>Tag / Badge</label><input value={tag} onChange={e=>setTag(e.target.value)} placeholder="ex: Novo" style={inp} /></div>
            <div><label style={lbl}>Stat — label</label><input value={statLabel} onChange={e=>setStatLabel(e.target.value)} placeholder="ex: Artesãos" style={inp} /></div>
            <div><label style={lbl}>Stat — valor</label><input value={statValor} onChange={e=>setStatValor(e.target.value)} placeholder="ex: +340" style={inp} /></div>
          </div>

          {/* Cor accent */}
          <div>
            <label style={lbl}>Cor de destaque</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {ACCENT_OPTS.map(opt=>(
                <button key={opt.value} onClick={()=>setAccentColor(opt.value)}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:99, border:`2px solid ${accentColor===opt.value?opt.value:C.border}`, background:accentColor===opt.value?opt.value+"15":"transparent", cursor:"pointer", fontSize:12, fontWeight:600, color:accentColor===opt.value?opt.value:C.sub }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:opt.value, flexShrink:0 }} />
                  {opt.label}
                </button>
              ))}
              <input type="color" value={accentColor} onChange={e=>setAccentColor(e.target.value)} title="Cor personalizada" style={{ width:36, height:36, borderRadius:8, border:`1px solid ${C.border}`, cursor:"pointer", padding:2, background:C.bg }} />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={lbl}>Ordem</label><input type="number" value={ordem} onChange={e=>setOrdem(e.target.value)} min="0" style={inp} /></div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:10 }}>
              <label style={{ ...lbl, marginBottom:0 }}>Activo</label>
              <button onClick={()=>setAtivo(v=>!v)} style={{ width:48, height:26, borderRadius:13, border:"none", background:ativo?C.green:C.border, cursor:"pointer", position:"relative", transition:"background .25s", flexShrink:0 }}>
                <span style={{ position:"absolute", top:3, left:ativo?25:3, width:20, height:20, background:"#fff", borderRadius:"50%", transition:"left .25s", boxShadow:"0 1px 4px rgba(0,0,0,.25)" }} />
              </button>
            </div>
          </div>

          {erro && <div style={{ padding:"10px 12px", background:C.redLt, border:`1px solid #fca5a5`, borderRadius:10, fontSize:12, fontWeight:600, color:"#b91c1c" }}>{erro}</div>}

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose} disabled={enviando} style={{ flex:1, padding:"10px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, fontWeight:600, color:C.sub, background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
            <button onClick={handleSalvar} disabled={enviando} style={{ flex:1, padding:"10px", border:"none", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", background:C.blue, cursor:enviando?"default":"pointer", opacity:enviando?.7:1, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              {enviando ? <Spinner s color="#fff" /> : Ico.Check(14)}
              {enviando ? "A guardar..." : item ? "Guardar" : "Criar slide"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ABA — VENDAS RELÂMPAGO
// ══════════════════════════════════════════════════════════════════

function TabRelampago() {
  const [kpis, setKpis]                 = useState(null);
  const [vendas, setVendas]             = useState([]);
  const [total, setTotal]               = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina]             = useState(1);
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [loadKpis, setLoadKpis]         = useState(true);
  const [loadVendas, setLoadVendas]     = useState(true);
  const [acaoId, setAcaoId]             = useState(null);
  const [modal, setModal]               = useState(null);
  const [expirandoVencidas, setExpirandoVencidas] = useState(false);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type="success") => setToast({ msg, type });

  const carregarKpis = useCallback(async () => {
    setLoadKpis(true);
    try { const r = await apiRelampago.kpis(); setKpis(r.data); }
    catch (_) {} finally { setLoadKpis(false); }
  }, []);

  const carregarVendas = useCallback(async () => {
    setLoadVendas(true);
    try {
      const r = await apiRelampago.listar({ pagina, estado:filtroEstado });
      const d = r.data;
      setVendas(d.vendas||[]);
      setTotal(d.total||0);
      setTotalPaginas(d.totalPaginas||1);
    } catch (e) { showToast("Erro ao carregar: "+e.message, "error"); }
    finally { setLoadVendas(false); }
  }, [pagina, filtroEstado]);

  useEffect(() => { carregarKpis(); }, [carregarKpis]);
  useEffect(() => { carregarVendas(); }, [carregarVendas]);

  async function handleDesativar(id) {
    if (!window.confirm("Desativar esta venda relâmpago?")) return;
    setAcaoId(id);
    try {
      await apiRelampago.desativar(id);
      showToast("Venda relâmpago desativada.");
      carregarVendas(); carregarKpis();
    } catch (e) { showToast(e.message, "error"); }
    finally { setAcaoId(null); }
  }

  async function handleExpirarVencidas() {
    setExpirandoVencidas(true);
    try {
      const r = await apiRelampago.expirarVencidas();
      showToast(`${r.data?.expiradas??0} venda(s) processada(s).`);
      carregarVendas(); carregarKpis();
    } catch (e) { showToast(e.message, "error"); }
    finally { setExpirandoVencidas(false); }
  }

  function handleSalvo() {
    showToast(modal?.item ? "Venda actualizada!" : "Venda relâmpago criada!");
    setModal(null);
    carregarVendas(); carregarKpis();
  }

  const FILTROS = [
    { id:"todas",    label:"Todas"    },
    { id:"ativa",    label:"Activas"  },
    { id:"futura",   label:"Futuras"  },
    { id:"expirada", label:"Expiradas"},
  ];

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}

      {/* Acções */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:20 }}>
        <button onClick={handleExpirarVencidas} disabled={expirandoVencidas}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", fontSize:12, fontWeight:600, border:`1.5px solid ${C.border}`, borderRadius:9, background:"transparent", color:C.sub, cursor:"pointer", fontFamily:"inherit" }}>
          {expirandoVencidas ? <Spinner s /> : Ico.Clock()} Expirar vencidas
        </button>
        <button onClick={()=>carregarVendas()}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", fontSize:12, fontWeight:600, border:`1.5px solid ${C.border}`, borderRadius:9, background:"transparent", color:C.sub, cursor:"pointer", fontFamily:"inherit" }}>
          {Ico.Refresh()} Actualizar
        </button>
        <button onClick={()=>setModal("novo")}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", fontSize:13, fontWeight:700, border:"none", borderRadius:9, background:C.amber, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>
          {Ico.Plus()} Nova oferta
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Activas agora",    valor:kpis?.ativas??0,               color:C.green,  icon:Ico.Zap(18),     sub:"a decorrer"    },
          { label:"Futuras",          valor:kpis?.futuras??0,              color:C.blue,   icon:Ico.Clock(18),   sub:"não iniciadas"  },
          { label:"Expiradas",        valor:kpis?.expiradas??0,            color:C.gray,   icon:Ico.Package(18), sub:"histórico"      },
          { label:"Unidades vendidas",valor:kpis?.totalUnidadesVendidas??0,color:C.amber,  icon:Ico.Check(18),   sub:"via relâmpago"  },
        ].map(k=>(
          <div key={k.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:k.color+"18", display:"flex", alignItems:"center", justifyContent:"center", color:k.color, marginBottom:10 }}>{k.icon}</div>
            {loadKpis
              ? <div style={{ height:28, width:60, borderRadius:6, background:"#f3f4f6", animation:"pulse 1.5s ease-in-out infinite", marginBottom:6 }} />
              : <p style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:"-0.03em", lineHeight:1, marginBottom:4 }}>{k.valor}</p>}
            <p style={{ fontSize:12, color:C.mute, fontWeight:600 }}>{k.label}</p>
            <p style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div style={{ padding:"14px 18px", background:C.amberLt, border:`1px solid ${C.amberBorder}`, borderRadius:12, marginBottom:20, display:"flex", gap:12, alignItems:"flex-start" }}>
        {Ico.Alert()}
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:"#92400e" }}>Fluxo admin → vendedor → comprador</p>
          <p style={{ fontSize:12, color:"#a16207", marginTop:4, lineHeight:1.6 }}>
            <strong>Admin cria aqui</strong> → aparece em <strong>⚡ Flash Deals</strong> na loja e na aba <strong>Relâmpago</strong> do vendedor. O admin gere TODAS as ofertas de TODOS os vendedores.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {FILTROS.map(f=>(
          <button key={f.id} onClick={()=>{ setFiltroEstado(f.id); setPagina(1); }}
            style={{ padding:"7px 16px", fontSize:12, fontWeight:600, border:`1.5px solid ${filtroEstado===f.id?C.amber:C.border}`, borderRadius:99, background:filtroEstado===f.id?C.amberLt:"transparent", color:filtroEstado===f.id?"#92400e":C.sub, cursor:"pointer", fontFamily:"inherit" }}>
            {f.label}
          </button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:12, color:C.mute, display:"flex", alignItems:"center" }}>{total} resultado{total!==1?"s":""}</span>
      </div>

      {/* Tabela */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 100px", padding:"10px 16px", borderBottom:`1.5px solid ${C.border}`, background:"#fafafa" }}>
          {["Produto","Estado","Preço / Desconto","Período","Stock","Criado por","Ações"].map((h,i)=>(
            <span key={h} style={{ fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em", textAlign:i===6?"center":"left" }}>{h}</span>
          ))}
        </div>

        {loadVendas ? (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"48px 0", gap:10 }}>
            <Spinner color={C.amber} /> <span style={{ fontSize:13, color:C.mute }}>A carregar...</span>
          </div>
        ) : vendas.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:C.amberLt, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", color:C.amber, fontSize:24 }}>⚡</div>
            <p style={{ fontSize:14, fontWeight:600, color:C.mute }}>Nenhuma venda relâmpago encontrada</p>
            <p style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>Cria a primeira clicando em "Nova oferta"</p>
          </div>
        ) : vendas.map((v,i)=>{
          const est = estadoInfo(v);
          const rest = v.fimEm ? tempoRestante(v.fimEm) : null;
          const pct  = v.quantidadeLimite ? Math.round(((v.quantidadeVendida||0)/v.quantidadeLimite)*100) : null;
          const desconto = v.desconto ?? disc(v.precoOriginal, v.precoRelampago);
          const emAcao = acaoId === v.id;
          const podeEditar = v.ativo && new Date(v.fimEm) > new Date();

          return (
            <div key={v.id}
              style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 100px", padding:"14px 16px", borderBottom:i<vendas.length-1?`1px solid ${C.border}`:"none", alignItems:"center", transition:"background .15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                {v.produto?.imagens?.[0]
                  ? <img src={v.produto.imagens[0]} alt="" style={{ width:38, height:38, borderRadius:8, objectFit:"cover", flexShrink:0 }} />
                  : <div style={{ width:38, height:38, borderRadius:8, background:C.amberLt, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:C.amber }}>⚡</div>}
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.produto?.nome||"—"}</p>
                  <p style={{ fontSize:11, color:C.mute }}>{v.produto?.categoria?.nome||"—"}</p>
                </div>
              </div>
              <div>
                <Badge label={est.label} color={est.color} bg={est.bg} />
                {rest && <p style={{ fontSize:10, color:C.amber, marginTop:4, fontWeight:600 }}>⏱ {rest}</p>}
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:C.amber }}>{fmt(v.precoRelampago)}</p>
                <p style={{ fontSize:11, color:C.mute, textDecoration:"line-through" }}>{fmt(v.precoOriginal)}</p>
                <span style={{ fontSize:10, fontWeight:700, color:C.red, background:C.redLt, padding:"1px 6px", borderRadius:99 }}>-{desconto}%</span>
              </div>
              <div>
                <p style={{ fontSize:11, color:C.mute }}>Início: {fmtData(v.inicioEm)}</p>
                <p style={{ fontSize:11, color:C.mute, marginTop:2 }}>Fim: {fmtData(v.fimEm)}</p>
              </div>
              <div>
                {v.quantidadeLimite != null ? (
                  <>
                    <p style={{ fontSize:12, fontWeight:600, color:C.text }}>{v.quantidadeVendida??0} / {v.quantidadeLimite}</p>
                    <div style={{ marginTop:4, height:5, background:"#f3f4f6", borderRadius:99, overflow:"hidden", width:60 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:pct>=70?C.red:C.amber, borderRadius:99 }} />
                    </div>
                  </>
                ) : <p style={{ fontSize:11, color:"#9ca3af" }}>Ilimitado</p>}
              </div>
              <div>
                <p style={{ fontSize:12, color:C.text, fontWeight:500 }}>{v.criadoPor?.nomeCompleto||"—"}</p>
                <p style={{ fontSize:10, color:"#9ca3af", marginTop:2 }}>{fmtData(v.criadoEm)}</p>
              </div>
              <div style={{ display:"flex", gap:4, justifyContent:"center" }}>
                <button onClick={()=>setModal({detalhe:v})} title="Ver detalhe"
                  style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.border}`, borderRadius:7, background:"transparent", cursor:"pointer", color:C.sub }}>
                  {Ico.Eye()}
                </button>
                {podeEditar && (
                  <button onClick={()=>setModal({item:v})} title="Editar"
                    style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.border}`, borderRadius:7, background:"transparent", cursor:"pointer", color:C.sub }}>
                    {Ico.Edit()}
                  </button>
                )}
                {v.ativo && (
                  <button onClick={()=>handleDesativar(v.id)} disabled={emAcao} title="Desativar"
                    style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid #fecaca`, borderRadius:7, background:"transparent", cursor:emAcao?"default":"pointer", color:C.red, opacity:emAcao?.5:1 }}>
                    {emAcao?<Spinner s color={C.red} />:Ico.Trash()}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:16 }}>
          <button onClick={()=>setPagina(p=>Math.max(1,p-1))} disabled={pagina===1}
            style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.border}`, borderRadius:8, background:"transparent", cursor:pagina===1?"default":"pointer", opacity:pagina===1?.4:1, color:C.sub }}>
            {Ico.ChevL()}
          </button>
          {Array.from({length:totalPaginas}).map((_,i)=>(
            <button key={i} onClick={()=>setPagina(i+1)}
              style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${pagina===i+1?C.amber:C.border}`, borderRadius:8, fontSize:12, fontWeight:700, background:pagina===i+1?C.amberLt:"transparent", color:pagina===i+1?"#92400e":C.sub, cursor:"pointer" }}>
              {i+1}
            </button>
          ))}
          <button onClick={()=>setPagina(p=>Math.min(totalPaginas,p+1))} disabled={pagina===totalPaginas}
            style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.border}`, borderRadius:8, background:"transparent", cursor:pagina===totalPaginas?"default":"pointer", opacity:pagina===totalPaginas?.4:1, color:C.sub }}>
            {Ico.ChevR()}
          </button>
        </div>
      )}

      {/* Modais */}
      {modal==="novo"   && <ModalRelampago onClose={()=>setModal(null)} onSalvo={handleSalvo} />}
      {modal?.item      && <ModalRelampago item={modal.item} onClose={()=>setModal(null)} onSalvo={handleSalvo} />}
      {modal?.detalhe   && <ModalDetalheRelampago item={modal.detalhe} onClose={()=>setModal(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ABA — HERO SLIDES
// ══════════════════════════════════════════════════════════════════

function TabHeroSlides() {
  const [slides,  setSlides]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [acaoId,  setAcaoId]  = useState(null);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, type="success") => setToast({ msg, type });

  const carregar = useCallback(async () => {
    setLoading(true);
    try { const r = await apiHero.listar(); setSlides(r.data||[]); }
    catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleEliminar(id) {
    if (!window.confirm("Eliminar este slide?")) return;
    setAcaoId(id);
    try { await apiHero.eliminar(id); setSlides(prev=>prev.filter(s=>s.id!==id)); showToast("Slide eliminado."); }
    catch (e) { showToast(e.message, "error"); }
    finally { setAcaoId(null); }
  }

  async function handleToggleAtivo(slide) {
    try {
      await apiHero.atualizar(slide.id, { ativo:!slide.ativo });
      setSlides(prev=>prev.map(s=>s.id===slide.id?{...s,ativo:!s.ativo}:s));
      showToast(slide.ativo?"Slide desactivado.":"Slide activado.");
    } catch (e) { showToast(e.message, "error"); }
  }

  async function mover(idx, dir) {
    const novo = [...slides];
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= novo.length) return;
    [novo[idx], novo[alvo]] = [novo[alvo], novo[idx]];
    const reordenados = novo.map((s,i)=>({...s,ordem:i}));
    setSlides(reordenados);
    try {
      await apiHero.reordenar(reordenados.map(s=>({id:s.id,ordem:s.ordem})));
      showToast("Ordem actualizada.");
    } catch (e) { showToast(e.message,"error"); await carregar(); }
  }

  function handleSalvo() {
    showToast(modal?.item?"Slide actualizado!":"Slide criado!");
    setModal(null);
    carregar();
  }

  const ativos   = slides.filter(s=>s.ativo).length;
  const inativos = slides.filter(s=>!s.ativo).length;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}

      {/* Acções */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:20 }}>
        <button onClick={carregar} disabled={loading}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", fontSize:12, fontWeight:600, border:`1.5px solid ${C.border}`, borderRadius:9, background:C.card, color:C.sub, cursor:"pointer", fontFamily:"inherit" }}>
          {loading?<Spinner s color={C.blue} />:Ico.Refresh()} Actualizar
        </button>
        <button onClick={()=>setModal("novo")}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", fontSize:13, fontWeight:700, border:"none", borderRadius:9, background:C.blue, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>
          {Ico.Plus(14)} Novo slide
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Total de slides", value:slides.length, color:C.blue  },
          { label:"Slides activos",  value:ativos,        color:C.green },
          { label:"Slides inactivos",value:inativos,      color:C.mute  },
        ].map(k=>(
          <div key={k.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:k.color }} />
            <div style={{ fontFamily:"monospace", fontSize:28, fontWeight:800, color:C.text, letterSpacing:-1 }}>{loading?"—":k.value}</div>
            <div style={{ fontSize:11.5, fontWeight:600, color:C.mute, textTransform:"uppercase", letterSpacing:.7, marginTop:4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Banner info */}
      <div style={{ padding:"12px 16px", background:C.blueLt, border:`1px solid ${C.blue}30`, borderRadius:12, marginBottom:20, display:"flex", gap:9, alignItems:"center" }}>
        {Ico.Info(15)}
        <span style={{ fontSize:12.5, color:C.blue }}>
          {ativos === 0
            ? <><strong>Nenhum slide activo</strong> — o hero mostrará automaticamente os <strong>produtos mais relevantes</strong> (por destaque, cliques e vendas).</>
            : <><strong>{ativos} slide{ativos>1?"s":""} activo{ativos>1?"s":""}</strong> — exibidos na ordem configurada. Desactiva todos para voltar ao modo automático.</>}
        </span>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:60 }}><Spinner color={C.blue} /></div>
      ) : slides.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", background:C.card, borderRadius:16, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🖼️</div>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>Nenhum slide configurado</div>
          <div style={{ fontSize:13, color:C.mute, marginBottom:20 }}>O hero mostrará automaticamente os produtos mais relevantes.</div>
          <button onClick={()=>setModal("novo")} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", background:C.blue, color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            {Ico.Plus(14)} Criar primeiro slide
          </button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {slides.map((slide,idx)=>(
            <div key={slide.id} style={{ background:C.card, border:`2px solid ${slide.ativo?`${slide.accentColor}40`:C.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
              <div style={{ height:4, background:slide.ativo?slide.accentColor:C.border }} />
              <div style={{ padding:18, display:"flex", gap:16, alignItems:"center" }}>
                {/* Thumbnail */}
                <div style={{ width:100, height:68, borderRadius:10, overflow:"hidden", flexShrink:0, background:C.bg, border:`1px solid ${C.border}`, position:"relative" }}>
                  {slide.imagemUrl
                    ? <img src={slide.imagemUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
                    : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>{Ico.Image(24)}</div>}
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(0,0,0,.5),transparent)" }} />
                  <div style={{ position:"absolute", top:6, left:6 }}>
                    <span style={{ fontSize:8, fontWeight:700, padding:"1px 5px", borderRadius:99, background:slide.accentColor+"33", color:slide.accentColor, border:`1px solid ${slide.accentColor}55` }}>{slide.tag}</span>
                  </div>
                  <div style={{ position:"absolute", bottom:4, left:6, right:4, fontSize:9, fontWeight:700, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{slide.titulo}</div>
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                    <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{slide.titulo}</span>
                    <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, background:slide.ativo?C.greenLt:C.bg, color:slide.ativo?C.green:C.mute, border:`1px solid ${slide.ativo?"#86efac":C.border}` }}>
                      {slide.ativo?"Activo":"Inactivo"}
                    </span>
                    <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, background:C.blueLt, color:C.blue }}>Ordem #{slide.ordem}</span>
                    {slide.produto && <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:99, background:C.purpleLt, color:C.purple }}>📦 {slide.produto.nome}</span>}
                  </div>
                  <div style={{ fontSize:12, color:C.sub, marginBottom:6 }}>{slide.subtitulo}</div>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap", fontSize:11, color:C.mute }}>
                    <span>🔗 {slide.ctaTexto} → {slide.ctaUrl}</span>
                    {slide.statLabel && <span>📊 {slide.statLabel}: {slide.statValor}</span>}
                  </div>
                </div>

                {/* Ações */}
                <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={()=>mover(idx,-1)} disabled={idx===0} title="Mover para cima"
                      style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.border}`, borderRadius:7, background:"transparent", cursor:idx===0?"default":"pointer", opacity:idx===0?.4:1, color:C.sub }}>
                      {Ico.Up()}
                    </button>
                    <button onClick={()=>mover(idx,1)} disabled={idx===slides.length-1} title="Mover para baixo"
                      style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.border}`, borderRadius:7, background:"transparent", cursor:idx===slides.length-1?"default":"pointer", opacity:idx===slides.length-1?.4:1, color:C.sub }}>
                      {Ico.Down()}
                    </button>
                  </div>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={()=>handleToggleAtivo(slide)} title={slide.ativo?"Desactivar":"Activar"}
                      style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${slide.ativo?"#86efac":"#fca5a5"}`, borderRadius:7, background:slide.ativo?C.greenLt:C.redLt, cursor:"pointer", color:slide.ativo?C.green:C.red }}>
                      {Ico.Eye()}
                    </button>
                    <button onClick={()=>setModal({item:slide})} title="Editar"
                      style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.border}`, borderRadius:7, background:"transparent", cursor:"pointer", color:C.sub }}>
                      {Ico.Edit()}
                    </button>
                    <button onClick={()=>handleEliminar(slide.id)} disabled={acaoId===slide.id} title="Eliminar"
                      style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid #fca5a5`, borderRadius:7, background:C.redLt, cursor:"pointer", color:C.red, opacity:acaoId===slide.id?.5:1 }}>
                      {acaoId===slide.id?<Spinner s color={C.red} />:Ico.Trash()}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {slides.length > 0 && (
        <div style={{ marginTop:20, padding:"12px 16px", background:C.amberLt, border:`1px solid ${C.amber}30`, borderRadius:12, display:"flex", gap:9, alignItems:"flex-start" }}>
          {Ico.Alert(15)}
          <div style={{ fontSize:12.5, color:C.amber }}>
            <strong>Modo automático:</strong> se desactivares todos os slides, o hero volta a mostrar automaticamente os 3 produtos com mais destaque, cliques e vendas.
          </div>
        </div>
      )}

      {modal==="novo" && <ModalHeroSlide onClose={()=>setModal(null)} onSalvo={handleSalvo} />}
      {modal?.item    && <ModalHeroSlide item={modal.item} onClose={()=>setModal(null)} onSalvo={handleSalvo} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL — com abas
// ══════════════════════════════════════════════════════════════════
export default function PageRelampago() {
  const [aba, setAba] = useState("relampago"); // "relampago" | "hero"

  const ABAS = [
    {
      id: "relampago",
      label: "Vendas Relâmpago",
      icon: Ico.Zap(15),
      color: C.amber,
      desc: "Ofertas com desconto por tempo limitado",
    },
    {
      id: "hero",
      label: "Hero Slides",
      icon: Ico.Slides(15),
      color: C.blue,
      desc: "Slides do carrossel da página principal",
    },
  ];

  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:24, fontFamily:"system-ui, sans-serif", color:C.text, fontSize:14 }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:aba==="relampago"?C.amberLt:C.blueLt, display:"flex", alignItems:"center", justifyContent:"center", color:aba==="relampago"?C.amber:C.blue, transition:"all .2s" }}>
            {aba==="relampago" ? Ico.Zap(18) : Ico.Slides(18)}
          </div>
          <div>
            <h2 style={{ fontSize:20, fontWeight:800, color:C.text, letterSpacing:"-0.02em" }}>
              {aba==="relampago" ? "Vendas Relâmpago" : "Hero Slides"}
            </h2>
            <p style={{ fontSize:12, color:C.mute }}>
              {aba==="relampago" ? "Cria e gere ofertas com desconto por tempo limitado" : "Configura os slides do carrossel da página principal"}
            </p>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div style={{ display:"flex", gap:4, marginBottom:28, background:C.card, padding:4, borderRadius:14, border:`1px solid ${C.border}`, width:"fit-content" }}>
        {ABAS.map(a=>(
          <button key={a.id} onClick={()=>setAba(a.id)}
            style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"9px 18px", borderRadius:10, border:"none", cursor:"pointer",
              fontFamily:"inherit", fontSize:13, fontWeight:aba===a.id?700:500,
              background:aba===a.id?a.color:"transparent",
              color:aba===a.id?"#fff":C.sub,
              transition:"all .18s",
            }}>
            <span style={{ color:aba===a.id?"#fff":a.color }}>{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {aba==="relampago" && <TabRelampago />}
      {aba==="hero"      && <TabHeroSlides />}
    </div>
  );
}