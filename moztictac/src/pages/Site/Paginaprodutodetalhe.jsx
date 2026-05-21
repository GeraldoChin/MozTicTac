import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Truck, Package,
  Heart, Share2, ShoppingCart, MessageCircle,
  ChevronRight, CheckCircle, Copy, Minus, Plus,
  Shield, BadgeCheck, Send, ThumbsUp, AlertCircle,
  ChevronLeft, Zap,
} from "lucide-react";
import { Cabecalho } from "../../components/Cabecalho";
import { adicionarAoCarrinho } from "../../utils/carrinho";

// ── API ───────────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function req(caminho) {
  const res = await fetch(`${BASE_URL}${caminho}`);
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.message || dados.mensagem || `Erro ${res.status}`);
  return dados;
}

async function reqAuth(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${caminho}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opcoes,
  });
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.message || dados.mensagem || `Erro ${res.status}`);
  return dados;
}

// ── Normalizar produto ────────────────────────────────────────────
function normalizarProduto(raw) {
  const preco         = Number(raw.preco ?? raw.price ?? 0);
  const precoOriginal = raw.precoOriginal ?? raw.originalPrice ?? null;
  const desconto      = precoOriginal ? Math.round((1 - preco / precoOriginal) * 100) : null;
  const avaliacao     = Number(raw.mediaAvaliacoes ?? raw.rating ?? 0);
  const totalAval     = raw.totalAvaliacoes ?? raw.reviews ?? 0;

  return {
    id:              raw.id,
    nome:            raw.nome ?? raw.name ?? "Produto",
    categoria:       raw.categoria?.nome ?? raw.category ?? "",
    categoriaId:     raw.categoria?.id ?? raw.categoriaId ?? null,
    estado:          raw.estadoItem === "NOVO" || raw.isNew ? "Novo" : "Usado",
    preco,
    precoOriginal,
    desconto,
    media:           avaliacao,
    totalAvaliacoes: totalAval,
    totalVendidos:   raw.totalVendidos ?? Math.floor(totalAval * 0.3),
    stock:           raw.estoque ?? raw.stock ?? 0,
    comEntrega:      raw.entregaDisponivel ?? raw.hasDelivery ?? false,
    afiliado:        raw.aceitaAfiliados ?? raw.hasAffiliate ?? false,
    afiliadoPct:     Number(raw.percentualAfiliado ?? raw.affiliatePct ?? 0),
    pagamentos:      raw.metodosPagamento ?? ["M-Pesa", "E-Mola", "mKesh", "Visa"],
    imagens:         raw.imagens ?? (raw.img ? [raw.img] : []),
    descricao:       raw.descricao ?? raw.description ?? "",
    vendedor: {
      id:              raw.vendedor?.id ?? null,
      nome:            raw.vendedor?.nome ?? raw.vendedor?.nomeCompleto ?? raw.vendedor?.name ?? "Vendedor",
      iniciais:        (raw.vendedor?.nome ?? raw.vendedor?.nomeCompleto ?? raw.vendedor?.name ?? "VV")
                         .split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase(),
      cidade:          raw.vendedor?.cidade ?? raw.city ?? "",
      avaliacao:       Number(raw.vendedor?.mediaAvaliacoes ?? 4.8),
      totalAvaliacoes: raw.vendedor?.totalAvaliacoes ?? 0,
      totalVendas:     raw.vendedor?.totalVendas ?? 0,
      membro:          raw.vendedor?.criadoEm
                         ? new Date(raw.vendedor.criadoEm).toLocaleDateString("pt-MZ", { month: "short", year: "numeric" })
                         : "—",
    },
    avaliacoes: (raw.avaliacoes ?? raw.reviews_list ?? []).map(r => ({
      id:         r.id,
      autor:      r.avaliador?.nomeCompleto ?? r.autor?.nome ?? r.autor ?? "Anónimo",
      nota:       Number(r.nota ?? r.rating ?? 5),
      comentario: r.comentario ?? r.comment ?? "",
      data:       r.criadoEm
                    ? new Date(r.criadoEm).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" })
                    : r.data ?? "",
    })),
  };
}

// ── Tokens ────────────────────────────────────────────────────────
const G  = "#00b96b";
const GD = "#009a5a";
const GL = "#e6f9f0";

const PALETTE = ["#3b82f6","#8b5cf6","#ec4899","#f97316","#14b8a6","#f59e0b","#06b6d4","#10b981"];
function avatarBg(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

// ─────────────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────────────────────────

function Stars({ rating, size = 13 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
          stroke={i <= Math.round(rating) ? "#f59e0b" : "#d1d5db"} />
      ))}
    </span>
  );
}

// ── Galeria ───────────────────────────────────────────────────────
function Gallery({ imagens, name }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom]     = useState(false);
  const prev = () => setActive(a => (a - 1 + imagens.length) % imagens.length);
  const next = () => setActive(a => (a + 1) % imagens.length);

  return (
    <div className="space-y-3 lg:sticky lg:top-4">
      <div className="w-full aspect-square rounded-2xl bg-gray-50 overflow-hidden relative group cursor-zoom-in" onClick={() => setZoom(true)}>
        {imagens[active]
          ? <img src={imagens[active]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={72} className="text-gray-200" /></div>
        }
        {imagens.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none">
              <ChevronLeft size={16} className="text-gray-700" />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none">
              <ChevronRight size={16} className="text-gray-700" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imagens.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i); }}
                  className="rounded-full transition-all cursor-pointer border-none"
                  style={{ width: i === active ? 20 : 6, height: 6, background: i === active ? G : "rgba(255,255,255,0.7)" }} />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-black/50 text-white text-[10px] rounded-lg font-medium">
          Ampliar
        </div>
      </div>

      {imagens.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imagens.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="w-16 h-16 flex-shrink-0 rounded-xl bg-gray-100 overflow-hidden border-2 transition-all cursor-pointer"
              style={{ borderColor: active === i ? G : "transparent" }}>
              {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package size={18} className="text-gray-300 m-auto" />}
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoom(false)}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl border-none bg-transparent cursor-pointer">✕</button>
          {imagens.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white/60 hover:text-white border-none bg-transparent cursor-pointer"><ChevronLeft size={32} /></button>
              <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 text-white/60 hover:text-white border-none bg-transparent cursor-pointer"><ChevronRight size={32} /></button>
            </>
          )}
          <img src={imagens[active]} alt={name} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// ── Histograma ────────────────────────────────────────────────────
function ReviewHistogram({ reviews, avg, total }) {
  const counts = [5,4,3,2,1].map(n => ({
    n,
    count: reviews.filter(r => Math.round(r.nota) === n).length,
    pct: reviews.length ? Math.round((reviews.filter(r => Math.round(r.nota) === n).length / reviews.length) * 100) : 0,
  }));

  return (
    <div className="flex items-center gap-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
      <div className="text-center shrink-0">
        <p className="text-5xl font-black text-gray-900 leading-none">{avg.toFixed(1)}</p>
        <Stars rating={avg} size={14} />
        <p className="text-xs text-gray-400 mt-1.5">{total} avaliações</p>
      </div>
      <div className="flex-1 space-y-1.5">
        {counts.map(({ n, count, pct }) => (
          <div key={n} className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-gray-500 w-2.5 text-right">{n}</span>
            <Star size={9} fill="#f59e0b" stroke="#f59e0b" />
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: n >= 4 ? "#22c55e" : n === 3 ? "#f59e0b" : "#ef4444" }} />
            </div>
            <span className="text-[10px] text-gray-400 w-5 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Formulário de avaliação ───────────────────────────────────────
function FormAvaliacao({ produtoId, onSucesso }) {
  const [nota,       setNota]       = useState(0);
  const [hover,      setHover]      = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando,   setEnviando]   = useState(false);
  const [erro,       setErro]       = useState(null);
  const [sucesso,    setSucesso]    = useState(false);
  const MAX = 500;
  const labels = ["","Muito mau","Mau","Regular","Bom","Excelente"];
  const podeEnviar = nota > 0 && comentario.trim().length >= 10;

  async function submeter(e) {
    e.preventDefault();
    if (!podeEnviar) return;
    const token = localStorage.getItem("token");
    if (!token) { setErro("Precisas de estar autenticado para avaliar."); return; }
    setEnviando(true); setErro(null);
    try {
      await reqAuth("/conta/avaliacao", {
        method: "POST",
        body: JSON.stringify({ produtoId, nota, comentario: comentario.trim() }),
      });
      setSucesso(true);
      setNota(0); setComentario("");
      onSucesso?.();
    } catch (e) { setErro(e.message); }
    finally { setEnviando(false); }
  }

  if (sucesso) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: GL }}>
          <CheckCircle size={28} style={{ color: G }} />
        </div>
        <p className="font-black text-gray-900">Avaliação publicada!</p>
        <p className="text-sm text-gray-400">Obrigado pelo teu feedback.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submeter} className="space-y-4">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Classificação *</p>
        <div className="flex items-center gap-3">
          <span className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button"
                onClick={() => setNota(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                className="border-none bg-transparent cursor-pointer p-0.5 transition-transform hover:scale-110">
                <Star size={28}
                  fill={(hover || nota) >= i ? "#f59e0b" : "none"}
                  stroke={(hover || nota) >= i ? "#f59e0b" : "#d1d5db"} />
              </button>
            ))}
          </span>
          {(hover || nota) > 0 && (
            <span className="text-sm font-black"
              style={{ color: nota >= 4 ? G : nota === 3 ? "#f59e0b" : "#ef4444" }}>
              {labels[hover || nota]}
            </span>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
          Comentário * <span className="text-gray-300 font-normal normal-case">({comentario.length}/{MAX} chars)</span>
        </p>
        <textarea
          value={comentario}
          onChange={e => setComentario(e.target.value.slice(0, MAX))}
          placeholder="Partilha a tua experiência com este produto... (mínimo 10 caracteres)"
          rows={4}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-gray-50/50"
        />
        {comentario.length > 0 && comentario.length < 10 && (
          <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
            <AlertCircle size={11} /> Faltam {10 - comentario.length} caracteres
          </p>
        )}
      </div>

      {erro && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle size={14} /> {erro}
        </div>
      )}

      <button type="submit" disabled={!podeEnviar || enviando}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white border-none cursor-pointer transition-all disabled:opacity-50"
        style={{ background: podeEnviar && !enviando ? G : "#9ca3af" }}>
        {enviando
          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> A publicar...</>
          : <><Send size={14} /> Publicar avaliação</>
        }
      </button>
    </form>
  );
}

// ── Card avaliação ────────────────────────────────────────────────
function ReviewCard({ r }) {
  const [util, setUtil]   = useState(0);
  const [voted, setVoted] = useState(false);
  const bg = avatarBg(r.autor);

  return (
    <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-2.5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
            style={{ background: bg }}>
            {r.autor[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">{r.autor}</p>
            <p className="text-[10px] text-gray-400">{r.data}</p>
          </div>
        </div>
        <Stars rating={r.nota} size={12} />
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{r.comentario}</p>
      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        <span className="text-[11px] text-gray-400">Útil?</span>
        <button
          onClick={() => { if (!voted) { setUtil(u => u + 1); setVoted(true); } }}
          disabled={voted}
          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border-none cursor-pointer transition-all
            ${voted ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"}`}>
          <ThumbsUp size={10} /> {util > 0 ? `${util} pessoa${util > 1 ? "s" : ""}` : "Sim"}
        </button>
      </div>
    </div>
  );
}

// ── Secção avaliações ─────────────────────────────────────────────
function SecaoAvaliacoes({ produto, onReload }) {
  const [showForm,    setShowForm]    = useState(false);
  const [filtroNota,  setFiltroNota]  = useState(0);
  const [pagina,      setPagina]      = useState(1);
  const POR_PAGINA = 5;
  const token = localStorage.getItem("token");

  const filtradas = filtroNota
    ? produto.avaliacoes.filter(r => Math.round(r.nota) === filtroNota)
    : produto.avaliacoes;
  const paginadas = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const totalPags = Math.ceil(filtradas.length / POR_PAGINA);

  return (
    <div className="space-y-5">
      {produto.avaliacoes.length > 0 && (
        <ReviewHistogram reviews={produto.avaliacoes} avg={produto.media} total={produto.totalAvaliacoes} />
      )}

      {/* Filtro estrelas */}
      {produto.avaliacoes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">Filtrar:</span>
          {[0,5,4,3,2,1].map(n => (
            <button key={n}
              onClick={() => { setFiltroNota(n); setPagina(1); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border-none cursor-pointer transition-all"
              style={filtroNota === n
                ? { background: G, color: "#fff" }
                : { background: "#f3f4f6", color: "#6b7280" }}>
              {n === 0 ? "Todas" : <><Star size={10} fill="#f59e0b" stroke="none" /> {n}</>}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm font-medium text-gray-500">Ainda não há avaliações.</p>
          <p className="text-xs text-gray-400 mt-1">Sê o primeiro a partilhar a tua opinião!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginadas.map((r, i) => <ReviewCard key={r.id || i} r={r} />)}
        </div>
      )}

      {/* Paginação avaliações */}
      {totalPags > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-gray-500 disabled:opacity-40 cursor-pointer bg-gray-100 border-none hover:bg-gray-200">‹</button>
          {Array.from({ length: totalPags }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPagina(p)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black border-none cursor-pointer transition-all"
              style={p === pagina ? { background: G, color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}>
              {p}
            </button>
          ))}
          <button onClick={() => setPagina(p => Math.min(totalPags, p + 1))} disabled={pagina >= totalPags}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-gray-500 disabled:opacity-40 cursor-pointer bg-gray-100 border-none hover:bg-gray-200">›</button>
        </div>
      )}

      {/* CTA / Formulário */}
      <div className="border-t border-gray-100 pt-5">
        {!showForm ? (
          <button
            onClick={() => {
              if (!token) { alert("Precisas de estar autenticado para avaliar."); return; }
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm border-2 border-dashed cursor-pointer transition-all w-full justify-center"
            style={{ borderColor: G, color: G, background: "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = GL}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <Star size={15} fill={G} stroke="none" />
            Escrever uma avaliação
          </button>
        ) : (
          <div className="bg-gray-50/60 rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-gray-900 text-sm">A tua avaliação</p>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 text-lg border-none bg-transparent cursor-pointer leading-none">✕</button>
            </div>
            <FormAvaliacao
              produtoId={produto.id}
              onSucesso={() => { setShowForm(false); onReload?.(); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mini card produto relacionado ─────────────────────────────────
function MiniCard({ p }) {
  const navigate = useNavigate();
  const [adicionado, setAdicionado] = useState(false);

  const nome    = p.nome ?? p.name ?? "Produto";
  const preco   = Number(p.preco ?? p.price ?? 0);
  const imagem  = p.imagens?.[0] ?? p.img ?? "";
  const avaliacao = Number(p.mediaAvaliacoes ?? p.rating ?? 0);
  const cidade  = p.vendedor?.cidade ?? "";
  const entrega = p.entregaDisponivel ?? false;

  function addCart(e) {
    e.stopPropagation();
    adicionarAoCarrinho({
      id: p.id, nome, preco, imagem, quantidade: 1,
      vendedorId: p.vendedor?.id ?? null,
      vendedorNome: p.vendedor?.nomeCompleto ?? "",
      localidade: cidade, estado: "Novo",
      entrega, afiliado: false, atacado: false,
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  }

  return (
    <div onClick={() => navigate(`/produto/${p.id}`)}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {imagem
          ? <img src={imagem} alt={nome} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={40} className="text-gray-200" /></div>
        }
        {entrega && (
          <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 flex items-center gap-1">
            <Truck size={8} /> Entrega
          </span>
        )}
        <div className="absolute bottom-0 inset-x-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-250">
          <button onClick={addCart}
            className="w-full py-2 rounded-xl text-[11px] font-black text-white border-none cursor-pointer flex items-center justify-center gap-1.5"
            style={{ background: adicionado ? "#16a34a" : G }}>
            {adicionado ? <><CheckCircle size={11} /> Adicionado!</> : <><ShoppingCart size={11} /> Adicionar</>}
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-black text-gray-900 leading-snug line-clamp-2 mb-2 min-h-[32px]">{nome}</p>
        {avaliacao > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <Star size={10} fill="#f59e0b" stroke="none" />
            <span className="text-[10px] font-black text-gray-700">{avaliacao.toFixed(1)}</span>
          </div>
        )}
        <p className="text-sm font-black text-gray-900">
          {preco.toLocaleString("pt-MZ")}
          <span className="text-[10px] font-normal text-gray-400 ml-1">MZN</span>
        </p>
        {cidade && (
          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
            <MapPin size={8} /> {cidade}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Produtos relacionados ─────────────────────────────────────────
function ProdutosRelacionados({ categoriaId, produtoAtualId }) {
  const [produtos,     setProdutos]     = useState([]);
  const [carregando,   setCarregando]   = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!categoriaId) { setCarregando(false); return; }
    setCarregando(true);
    const p = new URLSearchParams({ categoriaId, limite: "12", tab: "melhores" });
    req(`/publico/produtos?${p.toString()}`)
      .then(res => {
        const lista = (res.success ? res.data?.produtos : res.dados?.produtos) ?? [];
        setProdutos(lista.filter(x => x.id !== produtoAtualId));
      })
      .catch(() => setProdutos([]))
      .finally(() => setCarregando(false));
  }, [categoriaId, produtoAtualId]);

  const scroll = dir => scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });

  if (!carregando && produtos.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-black text-gray-900">Produtos relacionados</h2>
          <p className="text-xs text-gray-400 mt-0.5">Mais produtos desta categoria</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)}
            className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <button onClick={() => scroll(1)}
            className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {produtos.map(p => (
            <div key={p.id} className="flex-shrink-0" style={{ width: 196 }}>
              <MiniCard p={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────
export default function PaginaProdutoDetalhe() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [produto,      setProduto]      = useState(null);
  const [carregando,   setCarregando]   = useState(true);
  const [erro,         setErro]         = useState(null);

  const [qty,          setQty]          = useState(1);
  const [wishlist,     setWishlist]     = useState(false);
  const [salvandoWish, setSalvandoWish] = useState(false);
  const [link,         setLink]         = useState(null);
  const [copiado,      setCopiado]      = useState(false);
  const [adicionado,   setAdicionado]   = useState(false);
  const [pesquisa,     setPesquisa]     = useState("");
  const [aba,          setAba]          = useState("descricao");

  const carregarProduto = useCallback(async () => {
    if (!id) return;
    setCarregando(true); setErro(null);
    try {
      const res = await req(`/publico/produtos/${id}`);
      const raw = res.success ? (res.data ?? res.dados) : (res.dados ?? res.data ?? res);
      setProduto(normalizarProduto(raw));
    } catch (e) { setErro(e.message); }
    finally { setCarregando(false); }
  }, [id]);

  useEffect(() => { carregarProduto(); }, [carregarProduto]);

  function gerarLink() { setLink(`moztictac.mz/p/${id}?ref=ANA82KP9XBTU`); }
  function copiar()    { navigator.clipboard?.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }

  function addCart() {
    if (!produto) return;
    adicionarAoCarrinho({
      id: produto.id, nome: produto.nome, preco: produto.preco,
      imagem: produto.imagens?.[0] ?? null, quantidade: qty,
      vendedorId: produto.vendedor.id, vendedorNome: produto.vendedor.nome,
      localidade: produto.vendedor.cidade, estado: produto.estado,
      entrega: produto.comEntrega, afiliado: produto.afiliado, atacado: false,
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  }

  async function toggleWishlist() {
    if (!produto) return;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setSalvandoWish(true);
    try {
      if (wishlist) {
        await reqAuth(`/desejos/${produto.id}`, { method: "DELETE" });
        setWishlist(false);
      } else {
        await reqAuth(`/desejos/${produto.id}`, { method: "POST" });
        setWishlist(true);
      }
    } catch {}
    finally { setSalvandoWish(false); }
  }

  function contactarVendedor() {
    navigate("/chat", { state: { productId: id, vendedorId: produto?.vendedor?.id } });
  }

  // ── Loading ───────────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Cabecalho utilizadorAutenticado valorPesquisa="" aoMudarPesquisa={() => {}}
          aoClicarPesquisa={() => {}} aoClicarConta={() => {}} aoClicarCarteira={() => {}}
          aoClicarCarrinho={() => {}} aoClicarWishlist={() => {}} aoClicarNotificacoes={() => {}}
          aoClicarChat={() => navigate("/chat")} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
              <div className="flex gap-2">
                {Array.from({length:4}).map((_,i) => <div key={i} className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            </div>
            <div className="space-y-4 pt-2">
              {[70,45,55,30,80,40].map((w,i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Erro ──────────────────────────────────────────────────────
  if (erro || !produto) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <p className="text-lg font-black text-gray-700">{erro ? "Erro ao carregar produto" : "Produto não encontrado"}</p>
        {erro && <p className="text-sm text-red-400 text-center max-w-sm">{erro}</p>}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white border-none cursor-pointer"
          style={{ background: G }}>
          <ArrowLeft size={14} /> Voltar
        </button>
      </div>
    );
  }

  const p = produto;

  return (
    <div className="min-h-screen bg-gray-50">
      <Cabecalho utilizadorAutenticado valorPesquisa={pesquisa}
        aoMudarPesquisa={setPesquisa} aoClicarPesquisa={() => {}} aoClicarConta={() => {}}
        aoClicarCarteira={() => {}} aoClicarCarrinho={() => {}} aoClicarWishlist={() => {}}
        aoClicarNotificacoes={() => {}} aoClicarChat={() => navigate("/chat")} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center gap-1 text-xs text-gray-400 flex-wrap">
          <button onClick={() => navigate("/")} className="hover:text-green-600 transition-colors border-none bg-transparent cursor-pointer">Início</button>
          <ChevronRight size={11} />
          <span className="text-gray-500">{p.categoria}</span>
          <ChevronRight size={11} />
          <span className="text-gray-700 font-medium truncate max-w-[180px]">{p.nome}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 sm:py-8">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors border-none bg-transparent cursor-pointer mb-5">
          <ArrowLeft size={14} /> Voltar
        </button>

        {/* ── Grid produto ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-10 items-start">
          <Gallery imagens={p.imagens} name={p.nome} />

          <div className="space-y-4 sm:space-y-5">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{p.categoria}</span>
              <span className="text-gray-200">·</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full" style={{ background: GL, color: G }}>{p.estado}</span>
              {p.comEntrega && (
                <span className="flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  <Truck size={10} /> Entrega
                </span>
              )}
              {p.desconto && (
                <span className="flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-red-50 text-red-500">
                  <Zap size={10} /> -{p.desconto}%
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">{p.nome}</h1>

            {/* Rating clicável → leva à aba avaliações */}
            <div className="flex items-center gap-2 flex-wrap">
              <Stars rating={p.media} size={14} />
              <span className="text-sm font-black text-gray-900">{p.media.toFixed(1)}</span>
              <button onClick={() => setAba("avaliacoes")}
                className="text-sm text-green-600 hover:underline cursor-pointer border-none bg-transparent">
                ({p.totalAvaliacoes} avaliações)
              </button>
              {p.totalVendidos > 0 && <span className="text-sm text-gray-400 hidden sm:inline">· {p.totalVendidos} vendidos</span>}
            </div>

            {/* Preço */}
            <div className="py-4 border-y border-gray-100">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {p.preco.toLocaleString("pt-MZ")}
                  <span className="text-base font-normal text-gray-400 ml-1.5">MZN</span>
                </span>
                {p.precoOriginal && (
                  <div className="flex flex-col mb-0.5">
                    <span className="text-sm text-gray-400 line-through">{p.precoOriginal.toLocaleString("pt-MZ")} MZN</span>
                    {p.desconto && (
                      <span className="text-xs font-black text-red-500">
                        Poupas {(p.precoOriginal - p.preco).toLocaleString("pt-MZ")} MZN
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Vendedor */}
            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ background: avatarBg(p.vendedor.nome) }}>
                  {p.vendedor.iniciais}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 flex items-center gap-1 truncate">
                    {p.vendedor.nome} <BadgeCheck size={13} style={{ color: G }} />
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                    <MapPin size={9} /> {p.vendedor.cidade}
                    {p.vendedor.totalVendas > 0 && ` · ${p.vendedor.totalVendas} vendas`}
                  </p>
                </div>
              </div>
              <button onClick={contactarVendedor}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border-2 cursor-pointer transition-all shrink-0"
                style={{ borderColor: G, color: G, background: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = GL}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <MessageCircle size={12} />
                <span className="hidden sm:inline">Contactar</span>
              </button>
            </div>

            {/* Qty + pagamentos */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-black text-gray-700">Quantidade</span>
                <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 cursor-pointer border-none bg-white transition-colors">
                    <Minus size={12} className="text-gray-600" />
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-sm font-black border-x border-gray-200">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(Math.max(p.stock, 1), q + 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 cursor-pointer border-none bg-white transition-colors">
                    <Plus size={12} className="text-gray-600" />
                  </button>
                </div>
                {p.stock > 0
                  ? <span className="text-xs text-gray-400">{p.stock} em stock</span>
                  : <span className="text-xs text-red-400 font-black">Sem stock</span>
                }
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.pagamentos.map(pg => (
                  <span key={pg} className="text-xs font-bold px-2.5 py-1 rounded-xl border border-gray-200 text-gray-500 bg-white">{pg}</span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-2.5 flex-wrap">
              <button onClick={addCart} disabled={p.stock === 0}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-white text-sm cursor-pointer border-none transition-all active:scale-95 disabled:opacity-50"
                style={{ background: adicionado ? "#16a34a" : G }}>
                {adicionado ? <><CheckCircle size={16} /> Adicionado!</> : <><ShoppingCart size={16} /> Adicionar ao Carrinho</>}
              </button>
              {p.afiliado && (
                <button onClick={gerarLink}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-2xl font-black text-white text-sm cursor-pointer border-none transition-all active:scale-95"
                  style={{ background: "#f97316" }}>
                  <Share2 size={14} />
                  <span className="hidden sm:inline">Afiliar</span> ({p.afiliadoPct}%)
                </button>
              )}
              <button onClick={toggleWishlist} disabled={salvandoWish}
                className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all cursor-pointer shrink-0"
                style={{ borderColor: wishlist ? "#ef4444" : "#e5e7eb", background: wishlist ? "#fef2f2" : "white" }}>
                {salvandoWish
                  ? <div className="w-4 h-4 border-2 border-gray-300 border-t-red-400 rounded-full animate-spin" />
                  : <Heart size={17} fill={wishlist ? "#ef4444" : "none"} stroke={wishlist ? "#ef4444" : "#9ca3af"} />
                }
              </button>
            </div>

            {/* Link afiliado */}
            {link && (
              <div className="p-4 rounded-2xl border border-orange-100 bg-orange-50/60">
                <p className="text-xs font-black text-orange-500 mb-2 uppercase tracking-wide">Link de Afiliado</p>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-orange-100">
                  <span className="text-xs font-mono text-gray-500 flex-1 truncate">{link}</span>
                  <button onClick={copiar}
                    className="text-xs font-black text-orange-500 flex items-center gap-1 border-none bg-transparent cursor-pointer shrink-0 hover:text-orange-700">
                    <Copy size={11} /> {copiado ? "✓ Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
            )}

            {/* Escrow */}
            <div className="flex items-start sm:items-center gap-2.5 p-3.5 rounded-2xl border border-green-100" style={{ background: GL }}>
              <Shield size={15} style={{ color: G }} className="shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs text-gray-600 leading-relaxed">
                <b className="text-gray-800">Compra protegida por escrow</b> — o dinheiro só é libertado ao vendedor após confirmares a recepção.
              </p>
            </div>
          </div>
        </div>

        {/* ── Abas ── */}
        <div className="mt-10">
          <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit mb-6 shadow-sm">
            {[
              { id: "descricao",  label: "Descrição" },
              { id: "avaliacoes", label: `Avaliações (${p.totalAvaliacoes})` },
              { id: "detalhes",   label: "Detalhes & Vendedor" },
            ].map(a => (
              <button key={a.id} onClick={() => setAba(a.id)}
                className="px-5 py-2.5 rounded-xl text-sm font-black border-none cursor-pointer transition-all"
                style={aba === a.id ? { background: G, color: "#fff" } : { background: "transparent", color: "#6b7280" }}>
                {a.label}
              </button>
            ))}
          </div>

          {/* ── Descrição ── */}
          {aba === "descricao" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl">
              {p.descricao
                ? <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{p.descricao}</p>
                : <p className="text-sm text-gray-400 italic">Sem descrição disponível para este produto.</p>
              }
            </div>
          )}

          {/* ── Avaliações ── */}
          {aba === "avaliacoes" && (
            <div className="max-w-2xl">
              <SecaoAvaliacoes produto={p} onReload={carregarProduto} />
            </div>
          )}

          {/* ── Detalhes & Vendedor ── */}
          {aba === "detalhes" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  ["Categoria",    p.categoria || "—"],
                  ["Estado",       p.estado],
                  ["Stock",        p.stock > 0 ? `${p.stock} unidades` : "Indisponível"],
                  ["Vendidos",     p.totalVendidos > 0 ? `${p.totalVendidos} un.` : "—"],
                  ["Entrega",      p.comEntrega ? "Disponível" : "Não disponível"],
                  ["Afiliados",    p.afiliado ? `Sim · ${p.afiliadoPct}%` : "Não"],
                  ["Localidade",   p.vendedor.cidade || "—"],
                  ["Membro desde", p.vendedor.membro],
                ].map(([label, valor]) => (
                  <div key={label} className="flex flex-col p-3 bg-gray-50 rounded-xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1">{label}</span>
                    <span className="text-xs font-black text-gray-800">{valor}</span>
                  </div>
                ))}
              </div>

              {/* Vendedor card */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shrink-0"
                      style={{ background: avatarBg(p.vendedor.nome) }}>
                      {p.vendedor.iniciais}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 flex items-center gap-1.5 text-sm">
                        {p.vendedor.nome} <BadgeCheck size={14} style={{ color: G }} />
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} /> {p.vendedor.cidade} · Membro desde {p.vendedor.membro}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Stars rating={p.vendedor.avaliacao} size={11} />
                        <span className="text-xs text-gray-500">{p.vendedor.avaliacao.toFixed(1)} ({p.vendedor.totalAvaliacoes})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {p.vendedor.totalVendas > 0 && (
                      <div className="text-center">
                        <p className="text-xl font-black text-gray-900">{p.vendedor.totalVendas}</p>
                        <p className="text-xs text-gray-400">Vendas</p>
                      </div>
                    )}
                    <button onClick={contactarVendedor}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border-2 cursor-pointer transition-all"
                      style={{ borderColor: G, color: G, background: "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = GL}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <MessageCircle size={13} /> Contactar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Produtos relacionados ── */}
        <ProdutosRelacionados categoriaId={p.categoriaId} produtoAtualId={p.id} />

      </div>
    </div>
  );
}