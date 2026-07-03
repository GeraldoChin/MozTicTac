import { useState, useEffect } from "react";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function apiFetch(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensagem || data.message || `Erro ${res.status}`);
  return data;
}

// ── Ícones ──────────────────────────────────────────────────────
const IcoLogin    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const IcoUser     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoBag      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IcoTag      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IcoLink     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
const IcoDeposit  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IcoWithdraw = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const IcoTransfer = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>;
const IcoShield   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoSearch   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoFilter   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoChevD    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoChevU    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoLock     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoMonitor  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IcoPhone    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IcoInfo     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoDown     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoRefresh  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>;
const IcoMoney    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;

// ── Config visual por tipo ───────────────────────────────────────
const TIPO_CONFIG = {
  login:                { label: "Login",         Ico: IcoLogin,    bg: "bg-blue-100",   text: "text-blue-700"   },
  logout:               { label: "Logout",        Ico: IcoLogin,    bg: "bg-gray-100",   text: "text-gray-600"   },
  registro:             { label: "Registo",       Ico: IcoUser,     bg: "bg-purple-100", text: "text-purple-700" },
  alteracao_dados:      { label: "Perfil",        Ico: IcoUser,     bg: "bg-purple-100", text: "text-purple-700" },
  alteracao_senha:      { label: "Segurança",     Ico: IcoShield,   bg: "bg-amber-100",  text: "text-amber-700"  },
  alteracao_email:      { label: "Email",         Ico: IcoUser,     bg: "bg-purple-100", text: "text-purple-700" },
  criacao_produto:      { label: "Produto",       Ico: IcoTag,      bg: "bg-green-100",  text: "text-green-700"  },
  edicao_produto:       { label: "Produto",       Ico: IcoTag,      bg: "bg-green-100",  text: "text-green-700"  },
  remocao_produto:      { label: "Produto",       Ico: IcoTag,      bg: "bg-red-100",    text: "text-red-700"    },
  disputa_aberta:       { label: "Disputa",       Ico: IcoShield,   bg: "bg-red-100",    text: "text-red-700"    },
  disputa_resolvida:    { label: "Disputa",       Ico: IcoShield,   bg: "bg-green-100",  text: "text-green-700"  },
  kyc_enviado:          { label: "KYC",           Ico: IcoShield,   bg: "bg-amber-100",  text: "text-amber-700"  },
  kyc_aprovado:         { label: "KYC",           Ico: IcoShield,   bg: "bg-green-100",  text: "text-green-700"  },
  kyc_rejeitado:        { label: "KYC",           Ico: IcoShield,   bg: "bg-red-100",    text: "text-red-700"    },
  deposito:             { label: "Depósito",      Ico: IcoDeposit,  bg: "bg-green-100",  text: "text-green-700"  },
  compra:               { label: "Compra",        Ico: IcoBag,      bg: "bg-amber-100",  text: "text-amber-700"  },
  venda:                { label: "Venda",         Ico: IcoTag,      bg: "bg-green-100",  text: "text-green-700"  },
  saque:                { label: "Levantamento",  Ico: IcoWithdraw, bg: "bg-orange-100", text: "text-orange-700" },
  comissao_afiliado:    { label: "Afiliado",      Ico: IcoLink,     bg: "bg-cyan-100",   text: "text-cyan-700"   },
  taxa_plataforma:      { label: "Taxa",          Ico: IcoMoney,    bg: "bg-gray-100",   text: "text-gray-600"   },
  reembolso:            { label: "Reembolso",     Ico: IcoTransfer, bg: "bg-indigo-100", text: "text-indigo-700" },
  transferencia:        { label: "Transferência", Ico: IcoTransfer, bg: "bg-indigo-100", text: "text-indigo-700" },
  ajuste_admin:         { label: "Ajuste",        Ico: IcoMoney,    bg: "bg-gray-100",   text: "text-gray-600"   },
  estorno:              { label: "Estorno",       Ico: IcoTransfer, bg: "bg-red-100",    text: "text-red-700"    },
  pagamento_iniciado:   { label: "Pagamento",     Ico: IcoMoney,    bg: "bg-blue-100",   text: "text-blue-700"   },
  pagamento_confirmado: { label: "Pagamento",     Ico: IcoMoney,    bg: "bg-green-100",  text: "text-green-700"  },
  saque_solicitado:     { label: "Levantamento",  Ico: IcoWithdraw, bg: "bg-orange-100", text: "text-orange-700" },
  saque_aprovado:       { label: "Levantamento",  Ico: IcoWithdraw, bg: "bg-green-100",  text: "text-green-700"  },
  saque_rejeitado:      { label: "Levantamento",  Ico: IcoWithdraw, bg: "bg-red-100",    text: "text-red-700"    },
};

const FILTROS_TIPO = [
  { id: "todos",             label: "Todos"          },
  { id: "login",             label: "Logins"         },
  { id: "compra",            label: "Compras"        },
  { id: "venda",             label: "Vendas"         },
  { id: "comissao_afiliado", label: "Afiliados"      },
  { id: "deposito",          label: "Depósitos"      },
  { id: "saque",             label: "Levantamentos"  },
  { id: "transferencia",     label: "Transferências" },
  { id: "alteracao_dados",   label: "Perfil"         },
  { id: "disputa_aberta",    label: "Disputas"       },
  { id: "kyc_enviado",       label: "KYC"            },
];

const TIPOS_SAIDA = ["compra", "saque", "taxa_plataforma", "transferencia", "estorno"];
const POR_PAGINA  = 15;

function normTipo(s) { return (s ?? "").toLowerCase().replace(/ /g, "_"); }

function getCfg(tipo) {
  return TIPO_CONFIG[normTipo(tipo)] ?? { label: tipo || "—", Ico: IcoInfo, bg: "bg-gray-100", text: "text-gray-600" };
}

function calcValor(tipo, valor) {
  if (valor == null) return null;
  const n = Number(valor);
  return TIPOS_SAIDA.includes(normTipo(tipo)) ? -n : n;
}

function fmtData(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-MZ", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtK(n) {
  const v = Number(n || 0);
  return v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v);
}

// ── Sub-componentes ──────────────────────────────────────────────

function LinhaAuditoria({ item }) {
  const [aberto, setAberto] = useState(false);
  const cfg     = getCfg(item.tipo);
  const Ico     = cfg.Ico;
  const isMob   = ["mobile", "android", "iphone"].some(k => (item.dispositivo ?? "").toLowerCase().includes(k));
  const isFalha = item.resultado === "falha" || item.resultado === "FALHA";

  return (
    <div className={`bg-white border rounded-xl overflow-hidden ${isFalha ? "border-red-100" : "border-gray-100"}`}>
      <button
        type="button"
        onClick={() => setAberto(prev => !prev)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
          <Ico />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 truncate">{item.titulo}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0 ${isFalha ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {isFalha ? "✗ falha" : "✓ sucesso"}
            </span>
          </div>
          {item.descricao && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.descricao}</p>}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-400">{fmtData(item.data)}</span>
            {item.dispositivo && (
              <>
                <span className="text-xs text-gray-300">·</span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  {isMob ? <IcoPhone /> : <IcoMonitor />}
                  {item.dispositivo.split(" · ")[0]}
                </span>
              </>
            )}
          </div>
        </div>
        <span className="text-gray-300 flex-shrink-0">{aberto ? <IcoChevU /> : <IcoChevD />}</span>
      </button>

      {aberto && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Detalhes do evento</p>
            {[
              { label: "ID",         val: item.id ? item.id.substring(0, 12) + "…" : "—" },
              item.ip          && { label: "IP",          val: item.ip },
              item.dispositivo && { label: "Dispositivo", val: item.dispositivo },
              { label: "Data",       val: fmtData(item.data) },
            ].filter(Boolean).map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between text-xs gap-2">
                <span className="text-gray-400 flex-shrink-0">{label}</span>
                <span className="font-mono text-gray-700 font-medium text-right break-all">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2 p-2 bg-amber-50 rounded-lg">
            <IcoLock />
            <p className="text-xs text-amber-700">Este registo não pode ser alterado ou eliminado.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LinhaTransacao({ item }) {
  const [aberto, setAberto] = useState(false);
  const cfg     = getCfg(item.tipo);
  const Ico     = cfg.Ico;
  const valor   = calcValor(item.tipo, item.valor);
  const isFalha = item.estado === "CANCELADA" || item.estado === "BLOQUEADA";

  return (
    <div className={`bg-white border rounded-xl overflow-hidden ${isFalha ? "border-red-100" : "border-gray-100"}`}>
      <button
        type="button"
        onClick={() => setAberto(prev => !prev)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
          <Ico />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 truncate">{item.titulo}</span>
            {item.estado && (
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0 ${isFalha ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {item.estado.toLowerCase()}
              </span>
            )}
          </div>
          {item.descricao && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.descricao}</p>}
          <span className="text-xs text-gray-400">{fmtData(item.data)}</span>
        </div>
        {valor !== null && (
          <div className="text-right flex-shrink-0 mr-1">
            <p className={`text-sm font-semibold font-mono ${valor > 0 ? "text-green-600" : "text-gray-700"}`}>
              {valor > 0 ? "+" : ""}{Number(valor).toLocaleString("pt-MZ")} MZN
            </p>
          </div>
        )}
        <span className="text-gray-300 flex-shrink-0">{aberto ? <IcoChevU /> : <IcoChevD />}</span>
      </button>

      {aberto && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Detalhes da transação</p>
            {[
              { label: "ID",     val: item.id ? item.id.substring(0, 12) + "…" : "—" },
              { label: "Tipo",   val: cfg.label },
              valor !== null && { label: "Valor",  val: `${Number(Math.abs(item.valor)).toLocaleString("pt-MZ")} MZN` },
              { label: "Estado", val: item.estado ?? "—" },
              { label: "Data",   val: fmtData(item.data) },
            ].filter(Boolean).map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between text-xs gap-2">
                <span className="text-gray-400">{label}</span>
                <span className="font-mono text-gray-700 font-medium text-right">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-2.5 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="w-16 h-3 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function BotaoFiltro({ activo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer flex-shrink-0
        ${activo
          ? "bg-green-600 text-white border-green-600"
          : "border-gray-200 text-gray-500 bg-white hover:border-green-400"}`}
    >
      {children}
    </button>
  );
}

// ── Componente principal ─────────────────────────────────────────
export function SecaoHistorico() {
  const [registos,    setRegistos]    = useState([]);
  const [transacoes,  setTransacoes]  = useState([]);
  const [totalBack,   setTotalBack]   = useState(0);
  const [paginasBack, setPaginasBack] = useState(1);
  const [paginaBack,  setPaginaBack]  = useState(1);
  const [carregando,  setCarregando]  = useState(true);
  const [erro,        setErro]        = useState(null);

  const [filtroFonte,  setFiltroFonte]  = useState("todos");
  const [filtroTipo,   setFiltroTipo]   = useState("todos");
  const [filtroResult, setFiltroResult] = useState("todos");
  const [busca,        setBusca]        = useState("");
  const [paginaLocal,  setPaginaLocal]  = useState(1);

  // ── Buscar dados do servidor ─────────────────────────────────
  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const res = await apiFetch(`/conta/historico?pagina=${paginaBack}`);
        if (cancelado) return;
        const d = res.success ? res.data : (res.dados ?? {});
        setRegistos(d.registos ?? []);
        setTransacoes(d.transacoesFinanceiras ?? []);
        setTotalBack(d.total ?? 0);
        setPaginasBack(d.totalPaginas ?? 1);
      } catch (e) {
        if (!cancelado) setErro(e.message);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();
    return () => { cancelado = true; };
  }, [paginaBack]);

  // ── Montar lista unificada ───────────────────────────────────
  const todos = [
    ...registos.map(r => ({
      fonte: "auditoria",
      id: r.id, tipo: r.tipo, titulo: r.titulo, descricao: r.descricao,
      resultado: r.resultado, ip: r.ip, dispositivo: r.dispositivo,
      data: r.data, valor: null, estado: null,
    })),
    ...transacoes.map(t => ({
      fonte: "financeiro",
      id: t.id, tipo: t.tipo, titulo: t.titulo, descricao: t.descricao,
      resultado: t.estado === "CANCELADA" || t.estado === "BLOQUEADA" ? "falha" : "sucesso",
      ip: null, dispositivo: null,
      data: t.data, valor: t.valor, estado: t.estado,
    })),
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  // ── Filtrar ──────────────────────────────────────────────────
  const filtrados = todos.filter(item => {
    const t = normTipo(item.tipo);

    if (filtroFonte !== "todos" && item.fonte !== filtroFonte) return false;
    if (filtroTipo  !== "todos" && t !== filtroTipo && !t.startsWith(filtroTipo)) return false;
    if (filtroResult !== "todos" && item.resultado !== filtroResult) return false;

    if (busca) {
      const q = busca.toLowerCase();
      const emTitulo    = (item.titulo   ?? "").toLowerCase().includes(q);
      const emDescricao = (item.descricao ?? "").toLowerCase().includes(q);
      if (!emTitulo && !emDescricao) return false;
    }

    return true;
  });

  // ── Paginação local ──────────────────────────────────────────
  const totalPaginasLocal = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaLocalSafe   = Math.min(paginaLocal, totalPaginasLocal);
  const inicio            = (paginaLocalSafe - 1) * POR_PAGINA;
  const paginated         = filtrados.slice(inicio, inicio + POR_PAGINA);

  // ── Handlers de filtro — simples, sem curry ──────────────────
  function mudarFonte(valor) {
    setFiltroFonte(valor);
    setPaginaLocal(1);
  }
  function mudarTipo(valor) {
    setFiltroTipo(valor);
    setPaginaLocal(1);
  }
  function mudarResult(valor) {
    setFiltroResult(valor);
    setPaginaLocal(1);
  }
  function mudarBusca(valor) {
    setBusca(valor);
    setPaginaLocal(1);
  }
  function limparFiltros() {
    setFiltroFonte("todos");
    setFiltroTipo("todos");
    setFiltroResult("todos");
    setBusca("");
    setPaginaLocal(1);
  }

  // ── Stats ────────────────────────────────────────────────────
  const nSucessos = todos.filter(h => h.resultado === "sucesso").length;
  const nFalhas   = todos.filter(h => h.resultado === "falha").length;
  const saldoNet  = transacoes.reduce((acc, t) => {
    const v = calcValor(t.tipo, t.valor);
    return acc + (v ?? 0);
  }, 0);

  // ── Exportar CSV ─────────────────────────────────────────────
  function exportarCSV() {
    const cabecalho = ["ID","Fonte","Tipo","Título","Descrição","Resultado","Valor","Data","IP","Dispositivo"];
    const linhas = filtrados.map(h => [
      h.id, h.fonte, h.tipo, h.titulo, h.descricao ?? "",
      h.resultado, h.valor ?? "", fmtData(h.data), h.ip ?? "", h.dispositivo ?? "",
    ]);
    const csv  = [cabecalho, ...linhas].map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "historico_moztictac.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const temFiltros = filtroFonte !== "todos" || filtroTipo !== "todos" || filtroResult !== "todos" || busca !== "";

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <p className="text-base font-semibold text-gray-900">Histórico de Actividade</p>
          <p className="text-xs text-gray-400">
            {carregando ? "A carregar…" : `${totalBack} registos · ${transacoes.length} transações`}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPaginaBack(p => p)}
            disabled={carregando}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 bg-white cursor-pointer hover:border-gray-300 transition-colors disabled:opacity-50">
            <IcoRefresh /> Actualizar
          </button>
          <button type="button" onClick={exportarCSV}
            disabled={carregando || filtrados.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 bg-white cursor-pointer hover:border-gray-300 transition-colors disabled:opacity-50">
            <IcoDown /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Total eventos", val: carregando ? "…" : String(todos.length), sub: "registos", cor: "text-gray-900" },
          { label: "Sucesso / Falha", val: carregando ? "…" : `${nSucessos} / ${nFalhas}`, sub: "operações", cor: "text-gray-900" },
          { label: "Saldo net", val: carregando ? "…" : `${saldoNet >= 0 ? "+" : ""}${fmtK(Math.abs(saldoNet))}`, sub: "MZN", cor: saldoNet >= 0 ? "text-green-600" : "text-red-500" },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-xl font-semibold font-mono ${s.cor}`}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Aviso */}
      <div className="flex gap-2 items-start p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <div className="flex-shrink-0 mt-0.5 text-amber-600"><IcoLock /></div>
        <p className="text-xs text-amber-800">
          O histórico é <strong>imutável</strong> — não pode ser editado ou apagado.
          Apenas administradores têm acesso à auditoria completa com dados de IP.
        </p>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between gap-3">
          <p className="text-sm text-red-600">{erro}</p>
          <button type="button" onClick={() => setPaginaBack(p => p)}
            className="flex items-center gap-1 text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-lg bg-white cursor-pointer hover:bg-red-50">
            <IcoRefresh /> Tentar novamente
          </button>
        </div>
      )}

      {/* Pesquisa */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <span className="text-gray-400"><IcoSearch /></span>
        <input
          value={busca}
          onChange={e => mudarBusca(e.target.value)}
          placeholder="Pesquisar no histórico…"
          className="bg-transparent border-none outline-none text-sm flex-1 text-gray-800 placeholder-gray-400"
        />
        {busca && (
          <button type="button" onClick={() => mudarBusca("")}
            className="text-gray-400 text-lg leading-none bg-transparent border-0 cursor-pointer hover:text-gray-600">
            ×
          </button>
        )}
      </div>

      {/* Filtro fonte */}
      <div className="flex gap-2">
        <BotaoFiltro activo={filtroFonte === "todos"}      onClick={() => mudarFonte("todos")}>Tudo</BotaoFiltro>
        <BotaoFiltro activo={filtroFonte === "auditoria"}  onClick={() => mudarFonte("auditoria")}>🔐 Auditoria</BotaoFiltro>
        <BotaoFiltro activo={filtroFonte === "financeiro"} onClick={() => mudarFonte("financeiro")}>💰 Financeiro</BotaoFiltro>
      </div>

      {/* Filtro tipo */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <IcoFilter /> Filtrar por tipo
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTROS_TIPO.map(f => (
            <BotaoFiltro key={f.id} activo={filtroTipo === f.id} onClick={() => mudarTipo(f.id)}>
              {f.label}
            </BotaoFiltro>
          ))}
        </div>
      </div>

      {/* Filtro resultado */}
      <div className="flex gap-2 flex-wrap">
        <BotaoFiltro activo={filtroResult === "todos"}   onClick={() => mudarResult("todos")}>Todos</BotaoFiltro>
        <BotaoFiltro activo={filtroResult === "sucesso"} onClick={() => mudarResult("sucesso")}>✓ Sucesso</BotaoFiltro>
        <BotaoFiltro activo={filtroResult === "falha"}   onClick={() => mudarResult("falha")}>✗ Falha</BotaoFiltro>
      </div>

      {/* Contador */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
          {filtrados.length !== todos.length ? ` (de ${todos.length})` : ""}
        </p>
        {temFiltros && (
          <button type="button" onClick={limparFiltros}
            className="text-xs text-green-600 font-medium border-0 bg-transparent cursor-pointer hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista */}
      {carregando ? (
        <Skeleton />
      ) : filtrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl">
          <p className="text-sm">Nenhum evento encontrado com os filtros actuais.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map(item =>
            item.fonte === "financeiro"
              ? <LinhaTransacao key={`tx-${item.id}`}  item={item} />
              : <LinhaAuditoria key={`aud-${item.id}`} item={item} />
          )}
        </div>
      )}

      {/* Paginação local */}
      {totalPaginasLocal > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button type="button"
            onClick={() => setPaginaLocal(p => Math.max(1, p - 1))}
            disabled={paginaLocalSafe === 1}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium border-gray-200 text-gray-600 bg-white cursor-pointer hover:border-green-400 disabled:opacity-30 disabled:cursor-default">
            ← Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPaginasLocal, 7) }, (_, i) => {
              let p;
              if      (totalPaginasLocal <= 7)                    p = i + 1;
              else if (paginaLocalSafe <= 4)                      p = i + 1;
              else if (paginaLocalSafe >= totalPaginasLocal - 3)  p = totalPaginasLocal - 6 + i;
              else                                                 p = paginaLocalSafe - 3 + i;
              return (
                <button type="button" key={p} onClick={() => setPaginaLocal(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium border cursor-pointer transition-all
                    ${paginaLocalSafe === p
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-200 text-gray-500 bg-white hover:border-green-400"}`}>
                  {p}
                </button>
              );
            })}
          </div>
          <button type="button"
            onClick={() => setPaginaLocal(p => Math.min(totalPaginasLocal, p + 1))}
            disabled={paginaLocalSafe === totalPaginasLocal}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium border-gray-200 text-gray-600 bg-white cursor-pointer hover:border-green-400 disabled:opacity-30 disabled:cursor-default">
            Seguinte →
          </button>
        </div>
      )}

      {/* Paginação servidor */}
      {paginasBack > 1 && (
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Página {paginaBack} de {paginasBack} no servidor</p>
          <div className="flex gap-2">
            <button type="button"
              onClick={() => { setPaginaBack(p => Math.max(1, p - 1)); setPaginaLocal(1); }}
              disabled={paginaBack <= 1 || carregando}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium border-gray-200 text-gray-600 bg-white cursor-pointer hover:border-green-400 disabled:opacity-40">
              ← Anterior
            </button>
            <button type="button"
              onClick={() => { setPaginaBack(p => Math.min(paginasBack, p + 1)); setPaginaLocal(1); }}
              disabled={paginaBack >= paginasBack || carregando}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium border-gray-200 text-gray-600 bg-white cursor-pointer hover:border-green-400 disabled:opacity-40">
              Seguinte →
            </button>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default SecaoHistorico;