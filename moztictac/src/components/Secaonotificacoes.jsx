import { CreditCard, Truck, Star, Share2, ShieldCheck, Bell, RefreshCw, Trash2, CheckCheck, X, Filter, BellOff } from "lucide-react";
import { useState, useEffect } from "react";
import { VERDE } from "../components/Contaconstantes";

const BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "http://localhost:3000/api/v1";

async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || dados.message || `Erro ${resposta.status}`);
  return dados;
}

const ICONE_POR_TIPO = {
  PAGAMENTO_CONFIRMADO:  CreditCard,
  NOVA_VENDA:            CreditCard,
  PEDIDO_ENVIADO:        Truck,
  PEDIDO_ENTREGUE:       Truck,
  COMISSAO_RECEBIDA:     Share2,
  NIVEL_AFILIADO_SUBIU:  Share2,
  SAQUE_APROVADO:        CreditCard,
  SAQUE_REJEITADO:       CreditCard,
  NOVA_MENSAGEM:         Bell,
  ALERTA_SEGURANCA:      ShieldCheck,
  DISPUTA_ABERTA:        ShieldCheck,
  DISPUTA_RESOLVIDA:     ShieldCheck,
  CONTA_BLOQUEADA:       ShieldCheck,
  KYC_APROVADO:          ShieldCheck,
  KYC_REJEITADO:         ShieldCheck,
  PRODUTO_APROVADO:      Star,
  PRODUTO_REJEITADO:     Star,
  OTP_ENVIADO:           ShieldCheck,
};

const COR_POR_TIPO = {
  PAGAMENTO_CONFIRMADO:  { bg: "bg-green-100",  ic: "text-green-600"  },
  NOVA_VENDA:            { bg: "bg-green-100",  ic: "text-green-600"  },
  PEDIDO_ENVIADO:        { bg: "bg-blue-100",   ic: "text-blue-600"   },
  PEDIDO_ENTREGUE:       { bg: "bg-blue-100",   ic: "text-blue-600"   },
  COMISSAO_RECEBIDA:     { bg: "bg-cyan-100",   ic: "text-cyan-600"   },
  NIVEL_AFILIADO_SUBIU:  { bg: "bg-cyan-100",   ic: "text-cyan-600"   },
  SAQUE_APROVADO:        { bg: "bg-emerald-100",ic: "text-emerald-600"},
  SAQUE_REJEITADO:       { bg: "bg-red-100",    ic: "text-red-500"    },
  NOVA_MENSAGEM:         { bg: "bg-purple-100", ic: "text-purple-600" },
  ALERTA_SEGURANCA:      { bg: "bg-amber-100",  ic: "text-amber-600"  },
  DISPUTA_ABERTA:        { bg: "bg-red-100",    ic: "text-red-500"    },
  DISPUTA_RESOLVIDA:     { bg: "bg-green-100",  ic: "text-green-600"  },
  CONTA_BLOQUEADA:       { bg: "bg-red-100",    ic: "text-red-500"    },
  KYC_APROVADO:          { bg: "bg-green-100",  ic: "text-green-600"  },
  KYC_REJEITADO:         { bg: "bg-red-100",    ic: "text-red-500"    },
  PRODUTO_APROVADO:      { bg: "bg-violet-100", ic: "text-violet-600" },
  PRODUTO_REJEITADO:     { bg: "bg-red-100",    ic: "text-red-500"    },
  OTP_ENVIADO:           { bg: "bg-amber-100",  ic: "text-amber-600"  },
};

const CATEGORIAS = [
  { id: "todas",      label: "Todas"      },
  { id: "nao_lidas",  label: "Não lidas"  },
  { id: "financeiro", label: "Financeiro" },
  { id: "seguranca",  label: "Segurança"  },
  { id: "envios",     label: "Envios"     },
];

const TIPOS_FINANCEIRO = ["PAGAMENTO_CONFIRMADO","NOVA_VENDA","COMISSAO_RECEBIDA","NIVEL_AFILIADO_SUBIU","SAQUE_APROVADO","SAQUE_REJEITADO"];
const TIPOS_SEGURANCA  = ["ALERTA_SEGURANCA","DISPUTA_ABERTA","DISPUTA_RESOLVIDA","CONTA_BLOQUEADA","KYC_APROVADO","KYC_REJEITADO","OTP_ENVIADO"];
const TIPOS_ENVIOS     = ["PEDIDO_ENVIADO","PEDIDO_ENTREGUE"];

function pertenceCategoria(n, cat) {
  if (cat === "todas")      return true;
  if (cat === "nao_lidas")  return !n.lida;
  if (cat === "financeiro") return TIPOS_FINANCEIRO.includes(n.tipo);
  if (cat === "seguranca")  return TIPOS_SEGURANCA.includes(n.tipo);
  if (cat === "envios")     return TIPOS_ENVIOS.includes(n.tipo);
  return true;
}

function formatarData(dataStr) {
  if (!dataStr) return "—";
  const data = new Date(dataStr);
  const agora = new Date();
  const diff  = agora - data;
  const mins  = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Agora mesmo";
  if (mins < 60)  return `Há ${mins} min`;
  if (horas < 24) return `Hoje • ${data.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}`;
  if (dias === 1) return `Ontem • ${data.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}`;
  return data.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short" });
}

// ── Skeleton ────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-2">
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-white animate-pulse">
          <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2 py-0.5">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-2.5 bg-gray-100 rounded w-2/3" />
            <div className="h-2 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Card de notificação ─────────────────────────────────────────
function CartaoNotificacao({ notif, onMarcarLida, onRemover, removendo }) {
  const Icone = ICONE_POR_TIPO[notif.tipo] ?? Bell;
  const cor   = COR_POR_TIPO[notif.tipo]  ?? { bg: "bg-gray-100", ic: "text-gray-500" };

  return (
    <div className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-200
      ${notif.lida
        ? "bg-white border-gray-100 hover:border-gray-200"
        : "bg-green-50/60 border-green-200/70 hover:border-green-300"}`}
    >
      {/* Ícone */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cor.bg}`}>
        <Icone size={15} className={cor.ic} />
      </div>

      {/* Conteúdo */}
      <div
        className={`flex-1 min-w-0 ${!notif.lida ? "cursor-pointer" : ""}`}
        onClick={() => !notif.lida && onMarcarLida(notif.id)}
      >
        <div className="flex items-center gap-2 pr-6">
          <p className={`text-sm truncate ${notif.lida ? "font-medium text-gray-700" : "font-semibold text-gray-900"}`}>
            {notif.titulo}
          </p>
          {!notif.lida && (
            <span className="w-2 h-2 rounded-full shrink-0 bg-green-500" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.mensagem}</p>
        <p className="text-xs text-gray-400 mt-1.5">{formatarData(notif.criadoEm)}</p>
      </div>

      {/* Acções — aparecem no hover */}
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notif.lida && (
          <button
            type="button"
            title="Marcar como lida"
            onClick={() => onMarcarLida(notif.id)}
            className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-300 cursor-pointer transition-colors"
          >
            <CheckCheck size={11} />
          </button>
        )}
        <button
          type="button"
          title="Remover"
          onClick={() => onRemover(notif.id)}
          disabled={removendo === notif.id}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 cursor-pointer transition-colors disabled:opacity-40"
        >
          {removendo === notif.id
            ? <div className="w-2.5 h-2.5 border border-gray-300 rounded-full animate-spin border-t-transparent" />
            : <X size={11} />
          }
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────
export function SecaoNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas,     setNaoLidas]     = useState(0);
  const [carregando,   setCarregando]   = useState(true);
  const [erro,         setErro]         = useState(null);
  const [marcando,     setMarcando]     = useState(false);
  const [removendo,    setRemovendo]    = useState(null); // id a remover
  const [categoria,    setCategoria]    = useState("todas");
  const [selecao,      setSelecao]      = useState([]); // ids seleccionados
  const [modoSelecao,  setModoSelecao]  = useState(false);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const res = await requisitar("/usuarios/notificacoes");
        if (cancelado) return;
        const d = res.dados ?? res.data ?? {};
        setNotificacoes(d.notificacoes ?? []);
        setNaoLidas(d.naoLidas ?? 0);
      } catch (e) {
        if (!cancelado) setErro(e.message);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, []);

  function recarregar() {
    setCarregando(true);
    setErro(null);
    requisitar("/usuarios/notificacoes")
      .then(res => {
        const d = res.dados ?? res.data ?? {};
        setNotificacoes(d.notificacoes ?? []);
        setNaoLidas(d.naoLidas ?? 0);
      })
      .catch(e => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  async function marcarLida(id) {
    try {
      await requisitar(`/usuarios/notificacoes/${id}/lida`, { method: "PATCH" });
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (_) {}
  }

  async function marcarTodasLidas() {
    setMarcando(true);
    try {
      await requisitar("/usuarios/notificacoes/lidas", { method: "PATCH" });
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setMarcando(false);
    }
  }

  async function removerUma(id) {
    setRemovendo(id);
    try {
      await requisitar(`/usuarios/notificacoes/${id}`, { method: "DELETE" });
      const removida = notificacoes.find(n => n.id === id);
      setNotificacoes(prev => prev.filter(n => n.id !== id));
      if (removida && !removida.lida) setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (e) {
      alert("Erro ao remover: " + e.message);
    } finally {
      setRemovendo(null);
    }
  }

  async function removerSeleccionadas() {
    if (selecao.length === 0) return;
    setMarcando(true);
    try {
      await Promise.all(selecao.map(id => requisitar(`/usuarios/notificacoes/${id}`, { method: "DELETE" })));
      const removidas = notificacoes.filter(n => selecao.includes(n.id));
      const naoLidasRemovidas = removidas.filter(n => !n.lida).length;
      setNotificacoes(prev => prev.filter(n => !selecao.includes(n.id)));
      setNaoLidas(prev => Math.max(0, prev - naoLidasRemovidas));
      setSelecao([]);
      setModoSelecao(false);
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setMarcando(false);
    }
  }

  async function marcarSeleccionadasLidas() {
    if (selecao.length === 0) return;
    setMarcando(true);
    try {
      await Promise.all(selecao.map(id => requisitar(`/usuarios/notificacoes/${id}/lida`, { method: "PATCH" })));
      const naoLidasMarcadas = notificacoes.filter(n => selecao.includes(n.id) && !n.lida).length;
      setNotificacoes(prev => prev.map(n => selecao.includes(n.id) ? { ...n, lida: true } : n));
      setNaoLidas(prev => Math.max(0, prev - naoLidasMarcadas));
      setSelecao([]);
      setModoSelecao(false);
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setMarcando(false);
    }
  }

  function toggleSelecao(id) {
    setSelecao(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleTodas() {
    const visiveis = filtradas.map(n => n.id);
    const todasMarcadas = visiveis.every(id => selecao.includes(id));
    setSelecao(todasMarcadas ? [] : visiveis);
  }

  // ── Filtro por categoria ──────────────────────────────────────
  const filtradas = notificacoes.filter(n => pertenceCategoria(n, categoria));

  const contsPorCategoria = {
    todas:      notificacoes.length,
    nao_lidas:  notificacoes.filter(n => !n.lida).length,
    financeiro: notificacoes.filter(n => pertenceCategoria(n, "financeiro")).length,
    seguranca:  notificacoes.filter(n => pertenceCategoria(n, "seguranca")).length,
    envios:     notificacoes.filter(n => pertenceCategoria(n, "envios")).length,
  };

  return (
    <div className="space-y-5">

      {/* ── Cabeçalho ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-900">Notificações</h2>
            {naoLidas > 0 && (
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: VERDE }}>
                {naoLidas}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {carregando ? "A carregar…" : `${notificacoes.length} notificações · ${naoLidas} por ler`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={recarregar}
            disabled={carregando}
            title="Actualizar"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300 cursor-pointer transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={carregando ? "animate-spin" : ""} />
          </button>

          {!modoSelecao ? (
            <button
              type="button"
              onClick={() => setModoSelecao(true)}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-500 hover:border-gray-300 cursor-pointer transition-colors"
            >
              <Filter size={11} /> Seleccionar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setModoSelecao(false); setSelecao([]); }}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-500 hover:border-gray-300 cursor-pointer transition-colors"
            >
              <X size={11} /> Cancelar
            </button>
          )}

          {naoLidas > 0 && !modoSelecao && (
            <button
              type="button"
              onClick={marcarTodasLidas}
              disabled={marcando}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              style={{ borderColor: VERDE, color: VERDE, background: "transparent" }}
            >
              <CheckCheck size={11} />
              {marcando ? "A marcar…" : "Marcar todas"}
            </button>
          )}
        </div>
      </div>

      {/* ── Barra de acções em modo selecção ── */}
      {modoSelecao && (
        <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filtradas.length > 0 && filtradas.every(n => selecao.includes(n.id))}
              onChange={toggleTodas}
              className="w-4 h-4 rounded cursor-pointer accent-green-500"
            />
            <span className="text-xs text-gray-600 font-medium">
              {selecao.length === 0 ? "Nenhuma seleccionada" : `${selecao.length} seleccionada${selecao.length !== 1 ? "s" : ""}`}
            </span>
          </div>
          {selecao.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={marcarSeleccionadasLidas}
                disabled={marcando}
                className="h-7 px-2.5 flex items-center gap-1 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:border-green-400 hover:text-green-600 cursor-pointer transition-colors disabled:opacity-40"
              >
                <CheckCheck size={11} /> Marcar lidas
              </button>
              <button
                type="button"
                onClick={removerSeleccionadas}
                disabled={marcando}
                className="h-7 px-2.5 flex items-center gap-1 rounded-lg border border-red-200 bg-white text-xs font-medium text-red-500 hover:bg-red-50 cursor-pointer transition-colors disabled:opacity-40"
              >
                <Trash2 size={11} /> Remover
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Abas de categoria ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        {CATEGORIAS.map(cat => {
          const count = contsPorCategoria[cat.id];
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => { setCategoria(cat.id); setSelecao([]); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer shrink-0
                ${categoria === cat.id
                  ? "text-white border-transparent"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
              style={categoria === cat.id ? { background: VERDE, borderColor: VERDE } : {}}
            >
              {cat.label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0 font-semibold
                  ${categoria === cat.id ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Conteúdo ── */}
      {carregando ? (
        <Skeleton />
      ) : erro ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-500 text-sm font-medium">Erro ao carregar notificações</p>
          <p className="text-gray-400 text-xs max-w-xs">{erro}</p>
          <button
            type="button"
            onClick={recarregar}
            className="flex items-center gap-1.5 text-xs text-white px-4 py-2 rounded-lg border-0 cursor-pointer"
            style={{ background: VERDE }}
          >
            <RefreshCw size={12} /> Tentar novamente
          </button>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <BellOff size={22} className="text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {categoria === "todas" ? "Sem notificações" : `Sem notificações em "${CATEGORIAS.find(c => c.id === categoria)?.label}"`}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Quando houver novidades aparecerão aqui.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map(n => (
            <div key={n.id} className="relative flex items-start gap-2">
              {/* Checkbox de selecção */}
              {modoSelecao && (
                <div className="flex items-center pt-4 pl-1 shrink-0">
                  <input
                    type="checkbox"
                    checked={selecao.includes(n.id)}
                    onChange={() => toggleSelecao(n.id)}
                    className="w-4 h-4 rounded cursor-pointer accent-green-500"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CartaoNotificacao
                  notif={n}
                  onMarcarLida={marcarLida}
                  onRemover={removerUma}
                  removendo={removendo}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Rodapé: apagar todas lidas ── */}
      {!modoSelecao && notificacoes.some(n => n.lida) && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={async () => {
              const lidas = notificacoes.filter(n => n.lida).map(n => n.id);
              setMarcando(true);
              try {
                await Promise.all(lidas.map(id => requisitar(`/usuarios/notificacoes/${id}`, { method: "DELETE" })));
                setNotificacoes(prev => prev.filter(n => !n.lida));
              } catch (e) {
                alert("Erro: " + e.message);
              } finally {
                setMarcando(false);
              }
            }}
            disabled={marcando}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 bg-transparent border-0 cursor-pointer transition-colors disabled:opacity-40"
          >
            <Trash2 size={11} /> Limpar notificações lidas
          </button>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}