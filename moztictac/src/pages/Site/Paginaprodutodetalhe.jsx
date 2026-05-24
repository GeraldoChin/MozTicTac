import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Truck, Package,
  Heart, Share2, ShoppingCart, MessageCircle,
  ChevronRight, CheckCircle, Copy, Minus, Plus,
  Shield, BadgeCheck, Send, ThumbsUp, AlertCircle,
  ChevronLeft, Zap, Briefcase, Clock, RefreshCw,
  Globe, Tag, Link, ExternalLink, Check,
} from "lucide-react";
import { Cabecalho } from "../../components/Cabecalho";
import { adicionarAoCarrinho } from "../../utils/carrinho";

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

function normalizarProduto(raw) {
  const tipo      = (raw.tipo ?? "FISICO").toString().toUpperCase();
  const isServico = tipo === "SERVICO";

  const preco         = Number(raw.preco ?? raw.price ?? 0);
  const precoOriginal = raw.precoOriginal ?? raw.originalPrice ?? null;
  const desconto      = precoOriginal ? Math.round((1 - preco / precoOriginal) * 100) : null;

  const media     = Number(raw.mediaAvaliacoes ?? raw.media ?? raw.rating ?? 0);
  const totalAval = raw.totalAvaliacoes ?? raw.reviews ?? 0;
  const totalVendas = raw.totalVendas ?? raw.totalVendidos ?? 0;

  const planos = (raw.planos ?? []).map(p => ({
    id:           p.id,
    nome:         p.nome ?? "Plano",
    descricao:    p.descricao ?? p.desc ?? "",
    preco:        Number(p.preco ?? 0),
    prazoEntrega: Number(p.prazoEntrega ?? p.prazo ?? 7),
    revisoes:     p.revisoes ?? "1",
    extras:       (p.extras ?? []).map(e => ({
      id:    e.id ?? Math.random(),
      nome:  e.nome,
      preco: Number(e.preco ?? 0),
    })),
  }));

  return {
    id:          raw.id,
    nome:        raw.nome ?? raw.name ?? "Produto",
    tipo,
    isServico,
    categoria:   raw.categoria?.nome ?? raw.category ?? "",
    categoriaId: raw.categoria?.id   ?? raw.categoriaId ?? null,
    estadoItem:  raw.estadoItem ?? (raw.isNew ? "NOVO" : "USADO"),
    preco,
    precoOriginal,
    desconto,
    media,
    totalAvaliacoes: totalAval,
    totalVendas,
    stock: raw.stock ?? raw.estoque ?? 0,
    entregaDisponivel: isServico ? false : (raw.entregaDisponivel ?? raw.hasDelivery ?? false),
    aceitaAfiliados:    raw.aceitaAfiliados ?? raw.hasAffiliate ?? false,
    percentualAfiliado: Number(raw.percentualAfiliado ?? raw.affiliatePct ?? 0),
    metodosPagamento: raw.metodosPagamento ?? ["MPESA", "EMOLA", "MKESH"],
    imagens:   raw.imagens ?? (raw.img ? [raw.img] : []),
    descricao: raw.descricao ?? raw.description ?? "",
    planos,
    modalidade:    raw.modalidade    ?? null,
    idiomas:       raw.idiomas       ?? [],
    tags:          raw.tags          ?? [],
    tempoResposta: raw.tempoResposta ?? null,
    portfolio:     raw.portfolio     ?? null,
    vendedor: {
      id:          raw.vendedor?.id ?? null,
      nome:        raw.vendedor?.nomeCompleto ?? raw.vendedor?.nome ?? raw.vendedor?.name ?? "Vendedor",
      iniciais:    (raw.vendedor?.nomeCompleto ?? raw.vendedor?.nome ?? raw.vendedor?.name ?? "VV")
                     .split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase(),
      cidade:      raw.vendedor?.cidade ?? "",
      avaliacao:   Number(raw.vendedor?.mediaAvaliacoes ?? 4.8),
      totalAval:   raw.vendedor?.totalAvaliacoesRecebidas ?? 0,
      totalVendas: raw.vendedor?.totalVendas ?? 0,
      membro:      raw.vendedor?.criadoEm
                     ? new Date(raw.vendedor.criadoEm).toLocaleDateString("pt-MZ", { month: "short", year: "numeric" })
                     : "—",
    },
    avaliacoes: (raw.avaliacoes ?? []).map(r => ({
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

const G  = "#00b96b";
const GD = "#009a5a";
const GL = "#e6f9f0";

const PALETTE = ["#3b82f6","#8b5cf6","#ec4899","#f97316","#14b8a6","#f59e0b","#06b6d4","#10b981"];
function avatarBg(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function estadoLabel(ei) {
  if (ei === "NOVO")           return "Novo";
  if (ei === "RECONDICIONADO") return "Recondicionado";
  return "Usado";
}

function modalidadeLabel(m) {
  if (m === "remoto")     return "Remoto";
  if (m === "presencial") return "Presencial";
  if (m === "hibrido")    return "Híbrido";
  return m ?? "—";
}

function modalidadeIcon(m) {
  if (m === "remoto")     return "🌐";
  if (m === "presencial") return "📍";
  if (m === "hibrido")    return "🔀";
  return "💼";
}

// ─── CORES para planos (alinhadas com ModalPublicar) ─────────────
const PLANO_CORES = [
  { borda: "#e5e7eb", fundo: "#f9fafb", badge: { bg: "#f3f4f6", text: "#6b7280" }, acento: "#6b7280" },
  { borda: "#bfdbfe", fundo: "#eff6ff", badge: { bg: "#dbeafe", text: "#1d4ed8" }, acento: "#3b82f6" },
  { borda: "#fde68a", fundo: "#fffbeb", badge: { bg: "#fef3c7", text: "#92400e" }, acento: "#f59e0b" },
  { borda: "#e9d5ff", fundo: "#faf5ff", badge: { bg: "#f3e8ff", text: "#7e22ce" }, acento: "#8b5cf6" },
  { borda: "#fecdd3", fundo: "#fff1f2", badge: { bg: "#ffe4e6", text: "#9f1239" }, acento: "#f43f5e" },
];

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
  const [zoom,   setZoom]   = useState(false);
  const prev = () => setActive(a => (a - 1 + imagens.length) % imagens.length);
  const next = () => setActive(a => (a + 1) % imagens.length);

  return (
    <div className="space-y-3 lg:sticky lg:top-4">
      <div className="w-full aspect-square rounded-2xl bg-gray-50 overflow-hidden relative group cursor-zoom-in"
        onClick={() => setZoom(true)}>
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoom(false)}>
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

// ── Extras seleccionáveis ─────────────────────────────────────────
function ExtrasServico({ extras, extrasSel, onToggleExtra }) {
  if (!extras?.length) return null;
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Extras opcionais</p>
      {extras.map((e) => {
        const sel = extrasSel.some(x => x.nome === e.nome);
        return (
          <button key={e.id ?? e.nome} onClick={() => onToggleExtra(e)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer text-sm"
            style={{
              borderColor: sel ? G : "#e5e7eb",
              background:  sel ? GL : "#fff",
            }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded flex items-center justify-center transition-all flex-shrink-0"
                style={{ background: sel ? G : "#f3f4f6", border: sel ? "none" : "1.5px solid #d1d5db" }}>
                {sel && <Check size={10} color="#fff" strokeWidth={3} />}
              </div>
              <span className="font-medium text-gray-700 text-xs">{e.nome}</span>
            </div>
            <span className="text-xs font-black text-gray-800 flex-shrink-0">
              +{e.preco.toLocaleString("pt-MZ")} MZN
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Planos do serviço — UI principal ─────────────────────────────
// Exibe os planos directamente na página (sem modal)
// Alinhado com as cores e campos do ModalPublicar
function PlanosServico({ planos, planoSel, onSelectPlano, extrasSel, onToggleExtra }) {
  if (!planos?.length) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-gray-500 uppercase tracking-wide">Escolhe um plano</p>
        <span className="text-[10px] text-gray-400">{planos.length} plano{planos.length !== 1 ? "s" : ""} disponível{planos.length !== 1 ? "s" : ""}</span>
      </div>

      {planos.map((plano, idx) => {
        const cor = PLANO_CORES[idx] ?? PLANO_CORES[0];
        const sel = planoSel?.id === plano.id;

        return (
          <div key={plano.id}
            className="rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-pointer"
            style={{
              borderColor: sel ? G : cor.borda,
              background:  sel ? GL : cor.fundo,
              boxShadow:   sel ? `0 0 0 1px ${G}22` : "none",
            }}
            onClick={() => onSelectPlano(plano)}
          >
            {/* Cabeçalho do plano */}
            <div className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Badge igual ao ModalPublicar: "Plano N" */}
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                  style={{ background: sel ? "#dcfce7" : cor.badge.bg, color: sel ? GD : cor.badge.text }}>
                  Plano {idx + 1}
                </span>
                <span className="text-sm font-black text-gray-900">{plano.nome}</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900 leading-none">
                    {plano.preco.toLocaleString("pt-MZ")}
                    <span className="text-[10px] font-normal text-gray-400 ml-1">MZN</span>
                  </p>
                </div>
                {/* Indicador de selecção */}
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ borderColor: sel ? G : "#d1d5db", background: sel ? G : "transparent" }}>
                  {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                </div>
              </div>
            </div>

            {/* Descrição */}
            {plano.descricao && (
              <p className="px-4 pb-2 text-xs text-gray-600 leading-relaxed">{plano.descricao}</p>
            )}

            {/* Meta — prazo + revisões (alinhado com campos ModalPublicar: prazo, revisoes) */}
            <div className="px-4 pb-3 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center"
                  style={{ background: sel ? "#d1fae5" : "#f3f4f6" }}>
                  <Clock size={10} style={{ color: sel ? GD : "#9ca3af" }} />
                </div>
                <span className="font-semibold" style={{ color: sel ? GD : "#6b7280" }}>
                  {plano.prazoEntrega} dias
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center"
                  style={{ background: sel ? "#d1fae5" : "#f3f4f6" }}>
                  <RefreshCw size={10} style={{ color: sel ? GD : "#9ca3af" }} />
                </div>
                <span className="font-semibold" style={{ color: sel ? GD : "#6b7280" }}>
                  {plano.revisoes} revisões
                </span>
              </span>
            </div>

            {/* Extras — só aparecem quando o plano está seleccionado */}
            {sel && plano.extras?.length > 0 && (
              <div className="px-4 pb-4"
                onClick={e => e.stopPropagation()} // evita deseleccionar ao clicar nos extras
              >
                <ExtrasServico
                  extras={plano.extras}
                  extrasSel={extrasSel}
                  onToggleExtra={onToggleExtra}
                />
              </div>
            )}

            {/* Rodapé quando seleccionado */}
            {sel && (
              <div className="px-4 pb-3 flex items-center gap-1.5 text-xs font-bold"
                style={{ color: GD }}>
                <CheckCircle size={13} />
                Plano seleccionado
                {extrasSel.length > 0 && (
                  <span className="ml-1 font-normal text-gray-500">
                    · {extrasSel.length} extra{extrasSel.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Bloco de info do serviço ──────────────────────────────────────
// (modalidade, idiomas, tempo de resposta, tags, portfolio)
function InfoServico({ produto }) {
  if (!produto.isServico) return null;

  const temInfo =
    produto.modalidade || produto.tempoResposta ||
    produto.idiomas?.length || produto.portfolio ||
    produto.tags?.length;

  if (!temInfo) return null;

  return (
    <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/60 space-y-3">
      <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Detalhes do serviço</p>
      <div className="grid grid-cols-2 gap-3">
        {produto.modalidade && (
          <div className="flex items-center gap-2.5">
            <span className="text-base leading-none">{modalidadeIcon(produto.modalidade)}</span>
            <div>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">Modalidade</p>
              <p className="text-xs font-black text-blue-900">{modalidadeLabel(produto.modalidade)}</p>
            </div>
          </div>
        )}
        {produto.tempoResposta && (
          <div className="flex items-center gap-2.5">
            <Clock size={14} className="text-blue-400 shrink-0" />
            <div>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">Resposta em</p>
              <p className="text-xs font-black text-blue-900">{produto.tempoResposta}</p>
            </div>
          </div>
        )}
        {produto.idiomas?.length > 0 && (
          <div className="flex items-start gap-2.5 col-span-2">
            <Globe size={14} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">Idiomas</p>
              <p className="text-xs font-black text-blue-900">{produto.idiomas.join(", ")}</p>
            </div>
          </div>
        )}
        {produto.portfolio && (
          <div className="flex items-center gap-2.5 col-span-2">
            <ExternalLink size={14} className="text-blue-400 shrink-0" />
            <a href={produto.portfolio} target="_blank" rel="noreferrer"
              className="text-xs font-black text-blue-600 hover:underline truncate">
              Ver portfólio →
            </a>
          </div>
        )}
      </div>
      {produto.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-blue-100/80">
          {produto.tags.map(t => (
            <span key={t} className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
              <Tag size={8} />{t}
            </span>
          ))}
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
    pct:   reviews.length ? Math.round((reviews.filter(r => Math.round(r.nota) === n).length / reviews.length) * 100) : 0,
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
          Comentário * <span className="text-gray-300 font-normal normal-case">({comentario.length}/{MAX})</span>
        </p>
        <textarea value={comentario}
          onChange={e => setComentario(e.target.value.slice(0, MAX))}
          placeholder="Partilha a tua experiência... (mínimo 10 caracteres)"
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

function ReviewCard({ r }) {
  const [util,  setUtil]  = useState(0);
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
        <button onClick={() => { if (!voted) { setUtil(u => u + 1); setVoted(true); } }} disabled={voted}
          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border-none cursor-pointer transition-all ${voted ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"}`}>
          <ThumbsUp size={10} /> {util > 0 ? `${util} pessoa${util > 1 ? "s" : ""}` : "Sim"}
        </button>
      </div>
    </div>
  );
}

function SecaoAvaliacoes({ produto, onReload }) {
  const [showForm,   setShowForm]   = useState(false);
  const [filtroNota, setFiltroNota] = useState(0);
  const [pagina,     setPagina]     = useState(1);
  const POR_PAGINA = 5;
  const token = localStorage.getItem("token");

  const filtradas = filtroNota
    ? produto.avaliacoes.filter(r => Math.round(r.nota) === filtroNota)
    : produto.avaliacoes;
  const paginadas  = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const totalPags  = Math.ceil(filtradas.length / POR_PAGINA);

  return (
    <div className="space-y-5">
      {produto.avaliacoes.length > 0 && (
        <ReviewHistogram reviews={produto.avaliacoes} avg={produto.media} total={produto.totalAvaliacoes} />
      )}
      {produto.avaliacoes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">Filtrar:</span>
          {[0,5,4,3,2,1].map(n => (
            <button key={n} onClick={() => { setFiltroNota(n); setPagina(1); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border-none cursor-pointer transition-all"
              style={filtroNota === n ? { background: G, color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}>
              {n === 0 ? "Todas" : <><Star size={10} fill="#f59e0b" stroke="none" /> {n}</>}
            </button>
          ))}
        </div>
      )}
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
      <div className="border-t border-gray-100 pt-5">
        {!showForm ? (
          <button onClick={() => { if (!token) { alert("Precisas de estar autenticado."); return; } setShowForm(true); }}
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
            <FormAvaliacao produtoId={produto.id} onSucesso={() => { setShowForm(false); onReload?.(); }} />
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({ p }) {
  const navigate = useNavigate();
  const [adicionado, setAdicionado] = useState(false);
  const isServico = (p.tipo ?? "").toUpperCase() === "SERVICO";
  const nome    = p.nome ?? p.name ?? "Produto";
  const preco   = Number(p.preco ?? p.price ?? 0);
  const imagem  = p.imagens?.[0] ?? p.img ?? "";
  const avaliacao = Number(p.mediaAvaliacoes ?? p.rating ?? 0);
  const cidade  = p.vendedor?.cidade ?? "";

  function addCart(e) {
    e.stopPropagation();
    adicionarAoCarrinho({
      id: p.id, nome, preco, imagem, quantidade: 1,
      tipo: isServico ? "SERVICO" : "FISICO",
      vendedorId: p.vendedor?.id ?? null,
      vendedorNome: p.vendedor?.nomeCompleto ?? "",
      localidade: cidade,
      estadoItem: p.estadoItem ?? "NOVO",
      entregaDisponivel: p.entregaDisponivel ?? false,
      aceitaAfiliados:   p.aceitaAfiliados   ?? false,
      percentualAfiliado: Number(p.percentualAfiliado ?? 0),
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
          : <div className="w-full h-full flex items-center justify-center">
              {isServico ? <Briefcase size={40} className="text-gray-200" /> : <Package size={40} className="text-gray-200" />}
            </div>
        }
        {isServico && (
          <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">Serviço</span>
        )}
        {!isServico && p.entregaDisponivel && (
          <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 flex items-center gap-1">
            <Truck size={8} /> Entrega
          </span>
        )}
        <div className="absolute bottom-0 inset-x-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-250">
          <button onClick={addCart}
            className="w-full py-2 rounded-xl text-[11px] font-black text-white border-none cursor-pointer flex items-center justify-center gap-1.5"
            style={{ background: adicionado ? "#16a34a" : G }}>
            {adicionado ? <><CheckCircle size={11} /> Adicionado!</> : <><ShoppingCart size={11} /> {isServico ? "Encomendar" : "Adicionar"}</>}
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

function ProdutosRelacionados({ categoriaId, produtoAtualId }) {
  const [produtos,   setProdutos]   = useState([]);
  const [carregando, setCarregando] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!categoriaId) { setCarregando(false); return; }
    setCarregando(true);
    req(`/publico/produtos?categoriaId=${categoriaId}&limite=12&tab=melhores`)
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
          <p className="text-xs text-gray-400 mt-0.5">Mais da mesma categoria</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <button onClick={() => scroll(1)} className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
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
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
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
  const [planoSel,     setPlanoSel]     = useState(null);
  const [extrasSel,    setExtrasSel]    = useState([]);

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
      const p   = normalizarProduto(raw);
      setProduto(p);
      if (p.isServico && p.planos?.length > 0) setPlanoSel(p.planos[0]);
    } catch (e) { setErro(e.message); }
    finally { setCarregando(false); }
  }, [id]);

  useEffect(() => { carregarProduto(); }, [carregarProduto]);

  function toggleExtra(extra) {
    setExtrasSel(prev =>
      prev.some(x => x.nome === extra.nome)
        ? prev.filter(x => x.nome !== extra.nome)
        : [...prev, extra]
    );
  }

  function handleSelectPlano(plano) {
    setPlanoSel(plano);
    setExtrasSel([]); // reset extras ao mudar plano
  }

  // Preço total = plano + extras seleccionados
  const precoServico = planoSel
    ? planoSel.preco + extrasSel.reduce((s, e) => s + e.preco, 0)
    : 0;

  function gerarLink() { setLink(`moztictac.mz/p/${id}?ref=ANA82KP9XBTU`); }
  function copiar()    { navigator.clipboard?.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }

  function addCart() {
    if (!produto) return;
    if (produto.isServico) {
      if (!planoSel) { alert("Selecciona um plano para continuar."); return; }
      adicionarAoCarrinho({
        id: produto.id, nome: produto.nome, tipo: "SERVICO",
        preco: planoSel.preco, imagem: produto.imagens?.[0] ?? null,
        quantidade: 1, vendedorId: produto.vendedor.id,
        vendedorNome: produto.vendedor.nome, localidade: produto.vendedor.cidade,
        modalidade: produto.modalidade, tempoResposta: produto.tempoResposta,
        aceitaAfiliados: produto.aceitaAfiliados,
        percentualAfiliado: produto.percentualAfiliado,
        planoSelecionado: planoSel,
        extrasSeleccionados: extrasSel,
      });
    } else {
      adicionarAoCarrinho({
        id: produto.id, nome: produto.nome, tipo: "FISICO",
        preco: produto.preco, imagem: produto.imagens?.[0] ?? null,
        quantidade: qty, vendedorId: produto.vendedor.id,
        vendedorNome: produto.vendedor.nome, localidade: produto.vendedor.cidade,
        estadoItem: produto.estadoItem,
        entregaDisponivel: produto.entregaDisponivel,
        aceitaAfiliados: produto.aceitaAfiliados,
        percentualAfiliado: produto.percentualAfiliado,
      });
    }
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

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Cabecalho utilizadorAutenticado valorPesquisa="" aoMudarPesquisa={() => {}}
          aoClicarPesquisa={() => {}} aoClicarConta={() => {}} aoClicarCarteira={() => {}}
          aoClicarCarrinho={() => {}} aoClicarWishlist={() => {}} aoClicarNotificacoes={() => {}}
          aoClicarChat={() => navigate("/chat")} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
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

  if (erro || !produto) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <p className="text-lg font-black text-gray-700">{erro ? "Erro ao carregar" : "Não encontrado"}</p>
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

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-10 items-start">
          <Gallery imagens={p.imagens} name={p.nome} />

          <div className="space-y-4 sm:space-y-5">

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{p.categoria}</span>
              <span className="text-gray-200">·</span>
              {p.isServico ? (
                <span className="flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  <Briefcase size={10} /> Serviço
                </span>
              ) : (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full" style={{ background: GL, color: G }}>
                  {estadoLabel(p.estadoItem)}
                </span>
              )}
              {!p.isServico && p.entregaDisponivel && (
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

            {/* Rating */}
            <div className="flex items-center gap-2 flex-wrap">
              <Stars rating={p.media} size={14} />
              <span className="text-sm font-black text-gray-900">{p.media.toFixed(1)}</span>
              <button onClick={() => setAba("avaliacoes")}
                className="text-sm text-green-600 hover:underline cursor-pointer border-none bg-transparent">
                ({p.totalAvaliacoes} avaliações)
              </button>
              {p.totalVendas > 0 && (
                <span className="text-sm text-gray-400 hidden sm:inline">· {p.totalVendas} vendidos</span>
              )}
            </div>

            {/* ── PREÇO ─────────────────────────────────────────────── */}
            <div className="py-4 border-y border-gray-100">
              {p.isServico ? (
                // Para serviços: mostra range de preços ou plano seleccionado
                planoSel ? (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      Plano: <b className="text-gray-700">{planoSel.nome}</b>
                      {extrasSel.length > 0 && (
                        <span className="ml-1 font-normal">
                          + {extrasSel.length} extra{extrasSel.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                    <div className="flex items-end gap-3 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                        {precoServico.toLocaleString("pt-MZ")}
                        <span className="text-base font-normal text-gray-400 ml-1.5">MZN</span>
                      </span>
                      {extrasSel.length > 0 && (
                        <span className="text-xs text-gray-400 mb-1">
                          (base {planoSel.preco.toLocaleString("pt-MZ")} + {extrasSel.reduce((s,e) => s+e.preco,0).toLocaleString("pt-MZ")} MZN em extras)
                        </span>
                      )}
                    </div>
                  </div>
                ) : p.planos?.length > 0 ? (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">A partir de</p>
                    <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                      {Math.min(...p.planos.map(pl => pl.preco)).toLocaleString("pt-MZ")}
                      <span className="text-base font-normal text-gray-400 ml-1.5">MZN</span>
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-black text-gray-900">
                    {p.preco.toLocaleString("pt-MZ")}
                    <span className="text-base font-normal text-gray-400 ml-1.5">MZN</span>
                  </span>
                )
              ) : (
                // Produto físico — preço normal
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
              )}
            </div>

            {/* ── INFO DO SERVIÇO (modalidade, idiomas, tags, portfolio) */}
            <InfoServico produto={p} />

            {/* ── PLANOS — exibidos directamente na página ─────────── */}
            {p.isServico && p.planos?.length > 0 && (
              <PlanosServico
                planos={p.planos}
                planoSel={planoSel}
                onSelectPlano={handleSelectPlano}
                extrasSel={extrasSel}
                onToggleExtra={toggleExtra}
              />
            )}

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

            {/* Qty (produto físico) */}
            {!p.isServico && (
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
            )}

            {/* Resumo de encomenda para serviços (quando há plano seleccionado) */}
            {p.isServico && planoSel && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100 text-xs text-green-700">
                <CheckCircle size={14} className="text-green-500 shrink-0" />
                <span>
                  <b>{planoSel.nome}</b> · entrega em {planoSel.prazoEntrega} dias · {planoSel.revisoes} revisões
                  {extrasSel.length > 0 && ` · ${extrasSel.length} extra${extrasSel.length !== 1 ? "s" : ""} (+${extrasSel.reduce((s,e) => s+e.preco,0).toLocaleString("pt-MZ")} MZN)`}
                </span>
              </div>
            )}

            {/* Métodos de pagamento */}
            <div className="flex flex-wrap gap-1.5">
              {p.metodosPagamento.map(pg => (
                <span key={pg} className="text-xs font-bold px-2.5 py-1 rounded-xl border border-gray-200 text-gray-500 bg-white">{pg}</span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-2.5 flex-wrap">
              <button onClick={addCart} disabled={!p.isServico && p.stock === 0}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-white text-sm cursor-pointer border-none transition-all active:scale-95 disabled:opacity-50"
                style={{ background: adicionado ? "#16a34a" : G }}>
                {adicionado
                  ? <><CheckCircle size={16} /> Adicionado!</>
                  : <><ShoppingCart size={16} /> {p.isServico ? "Encomendar" : "Adicionar ao Carrinho"}</>
                }
              </button>

              {p.aceitaAfiliados && (
                <button onClick={gerarLink}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-2xl font-black text-white text-sm cursor-pointer border-none transition-all active:scale-95"
                  style={{ background: "#f97316" }}>
                  <Share2 size={14} />
                  <span className="hidden sm:inline">Afiliar</span> ({p.percentualAfiliado}%)
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

        {/* Abas */}
        <div className="mt-10">
          <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit mb-6 shadow-sm overflow-x-auto">
            {[
              { id: "descricao",  label: "Descrição" },
              { id: "avaliacoes", label: `Avaliações (${p.totalAvaliacoes})` },
              { id: "detalhes",   label: "Detalhes & Vendedor" },
            ].map(a => (
              <button key={a.id} onClick={() => setAba(a.id)}
                className="px-5 py-2.5 rounded-xl text-sm font-black border-none cursor-pointer transition-all whitespace-nowrap"
                style={aba === a.id ? { background: G, color: "#fff" } : { background: "transparent", color: "#6b7280" }}>
                {a.label}
              </button>
            ))}
          </div>

          {aba === "descricao" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl">
              {p.descricao
                ? <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{p.descricao}</p>
                : <p className="text-sm text-gray-400 italic">Sem descrição disponível.</p>
              }
            </div>
          )}

          {aba === "avaliacoes" && (
            <div className="max-w-2xl">
              <SecaoAvaliacoes produto={p} onReload={carregarProduto} />
            </div>
          )}

          {aba === "detalhes" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  ["Tipo",         p.isServico ? "Serviço" : "Produto físico"],
                  ["Categoria",    p.categoria || "—"],
                  p.isServico
                    ? ["Modalidade", modalidadeLabel(p.modalidade)]
                    : ["Estado",     estadoLabel(p.estadoItem)],
                  p.isServico
                    ? ["Resposta",   p.tempoResposta ?? "—"]
                    : ["Stock",      p.stock > 0 ? `${p.stock} unidades` : "Indisponível"],
                  ["Vendidos",     p.totalVendas > 0 ? `${p.totalVendas}` : "—"],
                  p.isServico
                    ? ["Idiomas",   p.idiomas?.join(", ") || "—"]
                    : ["Entrega",   p.entregaDisponivel ? "Disponível" : "Não disponível"],
                  ["Afiliados",    p.aceitaAfiliados ? `Sim · ${p.percentualAfiliado}%` : "Não"],
                  ["Localidade",   p.vendedor.cidade || "—"],
                  ["Membro desde", p.vendedor.membro],
                ].map(([label, valor]) => (
                  <div key={label} className="flex flex-col p-3 bg-gray-50 rounded-xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1">{label}</span>
                    <span className="text-xs font-black text-gray-800">{valor}</span>
                  </div>
                ))}
              </div>

              {/* Planos resumidos na aba Detalhes (apenas serviço) */}
              {p.isServico && p.planos?.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Planos disponíveis</p>
                  <div className="space-y-2">
                    {p.planos.map((pl, idx) => {
                      const cor = PLANO_CORES[idx] ?? PLANO_CORES[0];
                      return (
                        <div key={pl.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
                          style={{ borderColor: cor.borda, background: cor.fundo }}>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                              style={{ background: cor.badge.bg, color: cor.badge.text }}>
                              {pl.nome}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={9} /> {pl.prazoEntrega}d · <RefreshCw size={9} /> {pl.revisoes} rev.
                            </span>
                          </div>
                          <span className="text-xs font-black text-gray-900">{pl.preco.toLocaleString("pt-MZ")} MZN</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                        <span className="text-xs text-gray-500">{p.vendedor.avaliacao.toFixed(1)} ({p.vendedor.totalAval})</span>
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

        <ProdutosRelacionados categoriaId={p.categoriaId} produtoAtualId={p.id} />
      </div>
    </div>
  );
}