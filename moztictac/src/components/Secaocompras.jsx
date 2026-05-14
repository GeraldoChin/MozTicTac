// src/components/SecaoCompras.jsx
// ─────────────────────────────────────────────────────────────────
// Integração completa com:
//   contaControlador  → /conta/compras, /conta/resumo, /conta/avaliacao
//   pedidoControlador → /pedidos/:id/confirmar, /pedidos/:id/disputa
//   usuarioControlador→ /usuario/notificacoes, marcar lida(s)
//   chatControlador   → /chat/:destinatarioId, /chat/:conversaId/mensagens
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";

// ── API BASE ──────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function req(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opcoes.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...opcoes.headers,
  };
  const res = await fetch(`${BASE_URL}${caminho}`, { ...opcoes, headers });
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.mensagem || dados.message || `Erro ${res.status}`);
  return dados;
}

// ── APIs ──────────────────────────────────────────────────────────
const apiConta = {
  resumo:         ()                    => req("/conta/resumo"),
  minhasCompras:  (pagina = 1, estado, busca) =>
    req(`/conta/compras?pagina=${pagina}${estado && estado !== "todos" ? `&estado=${estado}` : ""}${busca ? `&busca=${encodeURIComponent(busca)}` : ""}`),
  avaliarProduto: (dados)               => req("/conta/avaliacao", { method: "POST", body: JSON.stringify(dados) }),
};

const apiPedidos = {
  confirmarEntrega: (id)                => req(`/pedidos/${id}/confirmar`, { method: "PATCH" }),
  abrirDisputa:    (id, motivo, desc)   => req(`/pedidos/${id}/disputa`,   { method: "POST",  body: JSON.stringify({ motivo, descricao: desc }) }),
};

const apiNotif = {
  listar:           (pagina = 1)        => req(`/usuario/notificacoes?pagina=${pagina}`),
  marcarLida:       (id)                => req(`/usuario/notificacoes/${id}/lida`, { method: "PATCH" }),
  marcarTodasLidas: ()                  => req("/usuario/notificacoes/todas-lidas", { method: "PATCH" }),
};

const apiChat = {
  iniciar:      (destinatarioId)        => req(`/chat/${destinatarioId}`, { method: "POST" }),
  mensagens:    (conversaId, pagina=1)  => req(`/chat/${conversaId}/mensagens?pagina=${pagina}`),
  enviar:       (conversaId, conteudo)  => req(`/chat/${conversaId}/mensagens`, { method: "POST", body: JSON.stringify({ conteudo }) }),
};

// ── Ícones ────────────────────────────────────────────────────────
const Ico = {
  Bag:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Truck:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Chat:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Star:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Search:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Alert:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  X:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Refresh: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
  Lock:    () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  ChevUp:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>,
  ChevDn:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  Filter:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Map:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Notif:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Repeat:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
};

// ── Constantes ────────────────────────────────────────────────────
const STEPS = ["Pedido", "Pago", "Processando", "Enviado", "Entregue"];
const STEP_MAP = {
  AGUARDANDO_PAGAMENTO: 0, PAGO: 1, EM_PROCESSAMENTO: 2,
  ENVIADO: 3, ENTREGUE: 4, EM_DISPUTA: 2,
  CANCELADO: 0, REEMBOLSADO: 0,
};

const STATUS_STYLE = {
  "aguardando pagamento": { bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400"   },
  pago:                   { bg: "bg-blue-100",   text: "text-blue-800",   dot: "bg-blue-400"   },
  "em processamento":     { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-400" },
  enviado:                { bg: "bg-amber-100",  text: "text-amber-800",  dot: "bg-amber-400"  },
  entregue:               { bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-500"  },
  cancelado:              { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-400"    },
  reembolsado:            { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-400" },
  "em disputa":           { bg: "bg-red-100",    text: "text-red-800",    dot: "bg-red-500"    },
};

const ESTADO_LABEL = {
  AGUARDANDO_PAGAMENTO: "aguardando pagamento",
  PAGO: "pago", EM_PROCESSAMENTO: "em processamento",
  ENVIADO: "enviado", ENTREGUE: "entregue",
  CANCELADO: "cancelado", REEMBOLSADO: "reembolsado", EM_DISPUTA: "em disputa",
};

const normEstado = (e) => ESTADO_LABEL[e] ?? (e ?? "").toLowerCase().replace(/_/g, " ");
const fmt        = (n) => Number(n || 0).toLocaleString("pt-MZ") + " MZN";
const fmtK       = (n) => { const v = Number(n || 0); return v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v); };
const fmtData    = (d) => d ? new Date(d).toLocaleDateString("pt-MZ", { day: "numeric", month: "short", year: "numeric" }) : "—";

const TABS = [
  { id: "pedidos",      label: "Pedidos",      icon: Ico.Bag   },
  { id: "rastreio",     label: "Rastreio",     icon: Ico.Truck },
  { id: "disputas",     label: "Disputas",     icon: Ico.Alert },
  { id: "avaliacoes",   label: "Avaliações",   icon: Ico.Star  },
  { id: "notificacoes", label: "Notificações", icon: Ico.Notif },
];

const MOTIVOS_DISPUTA = [
  "Produto não entregue",
  "Produto diferente do anunciado",
  "Serviço não cumprido",
  "Produto com defeito",
  "Produto danificado na entrega",
  "Vendedor não responde",
  "Outro",
];

// ── Componentes base ──────────────────────────────────────────────
function Spinner({ small }) {
  return <div className={`border-2 border-gray-200 border-t-green-600 rounded-full animate-spin ${small ? "w-4 h-4" : "w-6 h-6"}`} />;
}

function ErroBloco({ mensagem, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <p className="text-red-500 text-sm font-medium">Erro ao carregar</p>
      <p className="text-gray-400 text-xs max-w-xs text-center">{mensagem}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-4 py-2 rounded-lg border-0 cursor-pointer hover:bg-green-700">
          <Ico.Refresh /> Tentar novamente
        </button>
      )}
    </div>
  );
}

function Vazio({ texto }) {
  return <div className="text-center text-sm text-gray-400 py-12 bg-gray-50 rounded-xl">{texto}</div>;
}

function Paginacao({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onChange(pagina - 1)} disabled={pagina <= 1}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-green-400 cursor-pointer bg-transparent">
        <Ico.ChevUp />
      </button>
      <span className="text-xs text-gray-500 font-mono">{pagina} / {totalPaginas}</span>
      <button onClick={() => onChange(pagina + 1)} disabled={pagina >= totalPaginas}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-green-400 cursor-pointer bg-transparent">
        <Ico.ChevDn />
      </button>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full border-0 transition-colors flex-shrink-0 cursor-pointer ${value ? "bg-green-600" : "bg-gray-200"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function StatusBadge({ estado }) {
  const s = STATUS_STYLE[estado] || STATUS_STYLE["aguardando pagamento"];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

// ── Barra de progresso ────────────────────────────────────────────
function ProgressoPedido({ estadoRaw }) {
  const idx = STEP_MAP[estadoRaw] ?? 0;
  return (
    <div className="mt-3">
      <div className="flex items-start">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-2 h-2 rounded-full transition-all ${i <= idx ? "bg-green-500" : "bg-gray-200"} ${i === idx ? "ring-2 ring-green-200" : ""}`} />
            <span className="text-[9px] text-gray-400 text-center leading-tight">{s}</span>
          </div>
        ))}
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.round((idx / 4) * 100)}%` }} />
      </div>
    </div>
  );
}

// ── Detalhe expandido do pedido ───────────────────────────────────
function DetalhePedido({ pedido, onConfirmar, onDisputa, onAvaliar, onChat, emAcao }) {
  const estadoNorm = normEstado(pedido.estado);
  const podeConfirmar = pedido.estado === "ENVIADO";
  const podeAvaliar   = pedido.estado === "ENTREGUE" && !pedido.avaliado;
  const podeDisputa   = ["PAGO", "ENVIADO", "ENTREGUE"].includes(pedido.estado) && !pedido.disputa;
  const temDisputa    = !!pedido.disputa;
  const podeChat      = ["PAGO", "EM_PROCESSAMENTO", "ENVIADO", "AGUARDANDO_PAGAMENTO"].includes(pedido.estado);

  const Row = ({ label, val, verde }) => (
    <div className="flex justify-between py-1.5 border-b border-gray-50 text-xs">
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium ${verde ? "text-green-600" : "text-gray-800"}`}>{val}</span>
    </div>
  );

  return (
    <div className="mt-4 pt-4 border-t border-gray-100" onClick={e => e.stopPropagation()}>
      <Row label="Nº pedido"     val={`#${pedido.id?.substring(0, 8)}`} />
      <Row label="Data"          val={fmtData(pedido.data)} />
      <Row label="Método"        val={pedido.metodoPagamento ?? "—"} />
      <Row label="Taxa plataforma" val={fmt(pedido.taxaPlataforma)} />
      {pedido.codigoAfiliado && <Row label="Código afiliado" val={pedido.codigoAfiliado} verde />}
      {pedido.itens?.map((item, i) => (
        <Row key={i} label={item.nome} val={`${item.quantidade}× ${fmt(item.precoUnitario)}`} />
      ))}
      <div className="flex justify-between py-1.5 text-xs">
        <span className="font-semibold text-gray-700">Total pago</span>
        <span className="font-bold text-green-600 font-mono">{fmt(pedido.total)}</span>
      </div>

      {/* Escrow */}
      <div className="mt-3 flex items-center gap-1.5 p-2 bg-green-50 rounded-lg">
        <Ico.Lock />
        <span className="text-xs text-green-700">Pagamento em escrow — liberado após confirmação de entrega</span>
      </div>

      {/* Acções */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {podeConfirmar && (
          <button onClick={() => onConfirmar(pedido.id)} disabled={emAcao}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-60">
            {emAcao ? <Spinner small /> : <Ico.Check />}
            Confirmar recebimento
          </button>
        )}
        {pedido.rastreio && (
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-500 text-xs rounded-lg bg-transparent cursor-pointer hover:border-gray-300">
            <Ico.Map /> Rastrear
          </button>
        )}
        {podeAvaliar && (
          <button onClick={() => onAvaliar(pedido)} disabled={emAcao}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-60">
            <Ico.Star /> Avaliar produto
          </button>
        )}
        {pedido.estado === "ENTREGUE" && (
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-500 text-xs rounded-lg bg-transparent cursor-pointer hover:border-gray-300">
            <Ico.Repeat /> Comprar novamente
          </button>
        )}
        {podeChat && (
          <button onClick={() => onChat(pedido)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg bg-transparent cursor-pointer hover:border-green-400 hover:text-green-600 transition-colors">
            <Ico.Chat /> Chat com vendedor
          </button>
        )}
        {podeDisputa && (
          <button onClick={() => onDisputa(pedido)}
            className="flex items-center gap-1 px-3 py-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
            <Ico.Alert /> Abrir disputa
          </button>
        )}
        {temDisputa && (
          <span className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 font-medium bg-red-50 rounded-lg border border-red-100">
            <Ico.Alert /> Disputa aberta — em análise
          </span>
        )}
      </div>
    </div>
  );
}

// ── Tab: Pedidos ──────────────────────────────────────────────────
function TabPedidos({ onAvaliar, onDisputa, onChat }) {
  const [filtro, setFiltro]     = useState("todos");
  const [pagina, setPagina]     = useState(1);
  const [busca, setBusca]       = useState("");
  const [pedidos, setPedidos]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando]     = useState(true);
  const [erro, setErro]         = useState(null);
  const [expandido, setExpandido]       = useState(null);
  const [acaoId, setAcaoId]     = useState(null);

  const FILTROS       = ["todos", "PAGO", "ENVIADO", "ENTREGUE", "EM_DISPUTA", "CANCELADO"];
  const FILTROS_LABEL = { todos: "Todos", PAGO: "Pagos", ENVIADO: "Enviados", ENTREGUE: "Entregues", EM_DISPUTA: "Em disputa", CANCELADO: "Cancelados" };

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiConta.minhasCompras(pagina, filtro, busca);
      const d = res.success ? res.data : res.dados ?? {};
      setPedidos(d.pedidos ?? []);
      setTotal(d.total ?? 0);
      setTotalPaginas(d.totalPaginas ?? (Math.ceil((d.total ?? 0) / 10) || 1));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [pagina, filtro, busca]);

  useEffect(() => { carregar(); }, [carregar]);

  async function confirmarRecebimento(id) {
    if (!window.confirm("Confirmas que recebeste o produto? Esta acção é irreversível.")) return;
    setAcaoId(id);
    try {
      await apiPedidos.confirmarEntrega(id);
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: "ENTREGUE", entregueEm: new Date().toISOString() } : p));
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setAcaoId(null);
    }
  }

  function mudarFiltro(f) { setFiltro(f); setPagina(1); }

  const entregues  = pedidos.filter(p => p.estado === "ENTREGUE").length;
  const emTransito = pedidos.filter(p => p.estado === "ENVIADO").length;
  const totalGasto = pedidos.reduce((a, p) => a + Number(p.total || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Os meus pedidos <span className="font-normal text-gray-400 text-xs">({total})</span>
        </p>
        <button onClick={carregar} disabled={carregando}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:border-gray-300 bg-transparent cursor-pointer disabled:opacity-60">
          <Ico.Refresh /> Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total gasto</div>
          <div className="text-xl font-semibold font-mono tracking-tight">{fmtK(totalGasto)}</div>
          <div className="text-xs text-gray-400 mt-1">MZN</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Entregues</div>
          <div className="text-xl font-semibold font-mono tracking-tight text-green-600">{entregues}</div>
          <div className="text-xs text-gray-400 mt-1">pedidos</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Em trânsito</div>
          <div className="text-xl font-semibold font-mono tracking-tight text-amber-600">{emTransito}</div>
          <div className="text-xs text-gray-400 mt-1">pedidos</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {FILTROS.map(f => (
          <button key={f} onClick={() => mudarFiltro(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${filtro === f ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 hover:border-green-400 bg-transparent"}`}>
            {FILTROS_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Pesquisa */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Ico.Search /></div>
        <input value={busca} onChange={e => { setBusca(e.target.value); setPagina(1); }}
          placeholder="Pesquisar por produto ou vendedor..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-transparent" />
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : erro ? (
        <ErroBloco mensagem={erro} onRetry={carregar} />
      ) : pedidos.length === 0 ? (
        <Vazio texto="Nenhum pedido encontrado." />
      ) : (
        <div className="flex flex-col gap-2">
          {pedidos.map(p => {
            const estadoNorm = normEstado(p.estado);
            const isExp      = expandido === p.id;
            const imagem     = p.itens?.[0]?.imagem ?? null;

            return (
              <div key={p.id} onClick={() => setExpandido(isExp ? null : p.id)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${isExp ? "border-green-300" : "border-gray-100 hover:border-green-200"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
                    {imagem
                      ? <img src={imagem} alt="" className="w-full h-full object-cover" />
                      : <span className="text-xl">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {p.itens?.[0]?.nome ?? "Produto"}
                      {(p.itens?.length > 1) && <span className="text-gray-400 font-normal"> +{p.itens.length - 1}</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.vendedor?.nomeCompleto ?? "—"} · {fmtData(p.data)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge estado={estadoNorm} />
                      {p.avaliado && <span className="text-xs text-amber-500">★ Avaliado</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold font-mono text-gray-900">{fmtK(p.total)}</p>
                    <p className="text-xs text-gray-400">MZN</p>
                    <div className="mt-1 flex justify-end text-gray-400">
                      {isExp ? <Ico.ChevUp /> : <Ico.ChevDn />}
                    </div>
                  </div>
                </div>

                {!["CANCELADO", "REEMBOLSADO"].includes(p.estado) && <ProgressoPedido estadoRaw={p.estado} />}

                {isExp && (
                  <DetalhePedido
                    pedido={p}
                    onConfirmar={confirmarRecebimento}
                    onDisputa={onDisputa}
                    onAvaliar={onAvaliar}
                    onChat={onChat}
                    emAcao={acaoId === p.id}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  );
}

// ── Tab: Rastreio ─────────────────────────────────────────────────
function TabRastreio() {
  const [pedidos, setPedidos]   = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]         = useState(null);
  const [codigo, setCodigo]     = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiConta.minhasCompras(1, "ENVIADO");
      const d = res.success ? res.data : res.dados ?? {};
      const todos = d.pedidos ?? [];
      // Inclui também os entregues recentes com rastreio
      const res2 = await apiConta.minhasCompras(1, "ENTREGUE");
      const d2 = res2.success ? res2.data : res2.dados ?? {};
      const comRastreio = [...todos, ...(d2.pedidos ?? [])]
        .filter(p => p.rastreio || p.enviadoEm);
      setPedidos(comRastreio);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtrados = codigo.trim()
    ? pedidos.filter(p => p.rastreio?.toLowerCase().includes(codigo.toLowerCase()))
    : pedidos;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Rastreio de encomendas</p>
      </div>
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Ico.Search /></div>
        <input value={codigo} onChange={e => setCodigo(e.target.value)}
          placeholder="Inserir código de rastreio..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-transparent" />
      </div>

      {carregando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : erro ? (
        <ErroBloco mensagem={erro} onRetry={carregar} />
      ) : filtrados.length === 0 ? (
        <Vazio texto="Nenhuma encomenda com rastreio." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map(p => {
            const estadoNorm = normEstado(p.estado);
            return (
              <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {p.itens?.[0]?.nome ?? "Produto"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.vendedor?.nomeCompleto ?? "—"}</p>
                  </div>
                  <StatusBadge estado={estadoNorm} />
                </div>
                {p.rastreio && (
                  <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg mb-3">
                    <Ico.Truck />
                    <div>
                      <p className="text-xs text-gray-500">Código de rastreio</p>
                      <p className="text-sm font-bold text-green-700 font-mono">{p.rastreio}</p>
                    </div>
                  </div>
                )}
                <ProgressoPedido estadoRaw={p.estado} />
                {p.enviadoEm && (
                  <p className="text-xs text-gray-400 mt-2">Enviado em {fmtData(p.enviadoEm)}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab: Disputas ─────────────────────────────────────────────────
function TabDisputas() {
  const [disputas, setDisputas]   = useState([]);
  const [elegiveis, setElegiveis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]           = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [pedidoSel, setPedidoSel] = useState("");
  const [motivo, setMotivo]       = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando]   = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [resD, resE] = await Promise.all([
        apiConta.minhasCompras(1, "EM_DISPUTA"),
        apiConta.minhasCompras(1, "ENVIADO"),
      ]);
      const dD = resD.success ? resD.data : resD.dados ?? {};
      const dE = resE.success ? resE.data : resE.dados ?? {};
      setDisputas(dD.pedidos ?? []);
      setElegiveis(dE.pedidos ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function abrirDisputa() {
    if (!pedidoSel || !motivo) { alert("Seleciona um pedido e o motivo."); return; }
    if (descricao.length < 10) { alert("Descrição muito curta (mínimo 10 caracteres)."); return; }
    setEnviando(true);
    try {
      await apiPedidos.abrirDisputa(pedidoSel, motivo, descricao);
      setShowForm(false); setPedidoSel(""); setMotivo(""); setDescricao("");
      carregar();
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Disputas e reclamações</p>
        <button onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border-0 cursor-pointer transition-all
            ${showForm ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
          <Ico.Alert /> Abrir disputa
        </button>
      </div>

      {showForm && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-4 space-y-3">
          <p className="text-sm font-semibold text-red-800">Abrir nova disputa</p>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Pedido *</label>
            <select value={pedidoSel} onChange={e => setPedidoSel(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
              <option value="">Selecionar pedido...</option>
              {elegiveis.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.id.substring(0, 8)} — {p.itens?.[0]?.nome ?? "Produto"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Motivo *</label>
            <select value={motivo} onChange={e => setMotivo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
              <option value="">Selecionar motivo...</option>
              {MOTIVOS_DISPUTA.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Descrição *</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3}
              placeholder="Descreve o problema em detalhe (mínimo 10 caracteres)..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none bg-white" />
            <p className={`text-xs mt-0.5 text-right ${descricao.length < 10 ? "text-red-400" : "text-gray-400"}`}>
              {descricao.length} {descricao.length < 10 ? `(faltam ${10 - descricao.length})` : "✓"}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} disabled={enviando}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 bg-transparent cursor-pointer">
              Cancelar
            </button>
            <button onClick={abrirDisputa} disabled={enviando}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium border-0 cursor-pointer hover:bg-red-700 disabled:opacity-60 transition-colors">
              {enviando ? "A enviar..." : "Submeter disputa"}
            </button>
          </div>
        </div>
      )}

      {/* Aviso escrow */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4 flex gap-2 items-start">
        <Ico.Lock />
        <div>
          <p className="text-xs font-semibold text-blue-800">Pagamento bloqueado durante disputa</p>
          <p className="text-xs text-blue-700 mt-0.5">O valor permanece em escrow até o admin tomar uma decisão. Pode resultar em reembolso total, parcial ou pagamento ao vendedor.</p>
        </div>
      </div>

      {carregando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : erro ? (
        <ErroBloco mensagem={erro} onRetry={carregar} />
      ) : disputas.length === 0 ? (
        <Vazio texto="Nenhuma disputa activa." />
      ) : (
        <div className="flex flex-col gap-3">
          {disputas.map(p => (
            <div key={p.id} className="bg-white border border-red-100 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-400 font-mono">#{p.id?.substring(0, 8)} · {fmtData(p.data)}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{p.itens?.[0]?.nome ?? "Produto"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.vendedor?.nomeCompleto ?? "—"}</p>
                </div>
                <StatusBadge estado="em disputa" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-2">
                <Ico.Alert />
                Em análise pelo suporte MozTicTac
              </div>
              {p.disputa?.estado && (
                <p className="text-xs text-gray-400 mt-2">Estado: {p.disputa.estado}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Avaliações ───────────────────────────────────────────────
function TabAvaliacoes() {
  const [paraAvaliar, setParaAvaliar] = useState([]);
  const [avaliados, setAvaliados]     = useState([]);
  const [carregando, setCarregando]   = useState(true);
  const [erro, setErro]               = useState(null);
  const [modalPedido, setModalPedido] = useState(null);
  const [stars, setStars]             = useState(5);
  const [comentario, setComentario]   = useState("");
  const [enviando, setEnviando]       = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiConta.minhasCompras(1, "ENTREGUE");
      const d = res.success ? res.data : res.dados ?? {};
      const todos = d.pedidos ?? [];
      setParaAvaliar(todos.filter(p => !p.avaliado));
      setAvaliados(todos.filter(p => p.avaliado));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function submitAvaliacao() {
    if (!comentario.trim()) { alert("Escreve um comentário."); return; }
    setEnviando(true);
    try {
      await apiConta.avaliarProduto({
        pedidoId:   modalPedido.id,
        produtoId:  modalPedido.itens?.[0]?.produtoId,
        nota:       stars,
        comentario: comentario.trim(),
      });
      setParaAvaliar(prev => prev.filter(p => p.id !== modalPedido.id));
      setAvaliados(prev => [{ ...modalPedido, avaliado: true }, ...prev]);
      setModalPedido(null); setStars(5); setComentario("");
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (erro)       return <ErroBloco mensagem={erro} onRetry={carregar} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Avaliações</p>
        {paraAvaliar.length > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            {paraAvaliar.length} pendente{paraAvaliar.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {paraAvaliar.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Por avaliar</p>
          <div className="flex flex-col gap-2 mb-5">
            {paraAvaliar.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-white border border-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {p.itens?.[0]?.imagem
                    ? <img src={p.itens[0].imagem} alt="" className="w-full h-full object-cover" />
                    : <span className="text-lg">📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.itens?.[0]?.nome ?? "Produto"}</p>
                  <p className="text-xs text-gray-500">{p.vendedor?.nomeCompleto ?? "—"}</p>
                </div>
                <button onClick={() => setModalPedido(p)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg border-0 cursor-pointer hover:bg-amber-600 transition-colors flex-shrink-0">
                  <Ico.Star /> Avaliar
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {avaliados.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Já avaliados</p>
          <div className="flex flex-col gap-2">
            {avaliados.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {p.itens?.[0]?.imagem
                    ? <img src={p.itens[0].imagem} alt="" className="w-full h-full object-cover" />
                    : <span className="text-lg">📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.itens?.[0]?.nome ?? "Produto"}</p>
                  <p className="text-xs text-gray-500">{p.vendedor?.nomeCompleto ?? "—"}</p>
                </div>
                <div className="text-amber-400 text-sm flex-shrink-0">★★★★★</div>
              </div>
            ))}
          </div>
        </>
      )}

      {paraAvaliar.length === 0 && avaliados.length === 0 && (
        <Vazio texto="Nenhuma avaliação ainda — as avaliações aparecem após a entrega." />
      )}

      {/* Modal avaliação */}
      {modalPedido && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setModalPedido(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Avaliar compra</h3>
              <button onClick={() => setModalPedido(null)} className="text-gray-400 text-xl bg-transparent border-0 cursor-pointer leading-none">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-4 truncate">{modalPedido.itens?.[0]?.nome ?? "Produto"}</p>
            <div className="flex justify-center gap-2 mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setStars(s)}
                  className={`text-2xl border-0 bg-transparent cursor-pointer transition-transform hover:scale-110 ${s <= stars ? "text-amber-400" : "text-gray-200"}`}>★</button>
              ))}
            </div>
            <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={4}
              placeholder="Partilha a tua experiência com este produto e vendedor..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setModalPedido(null)} disabled={enviando}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-transparent cursor-pointer">
                Cancelar
              </button>
              <button onClick={submitAvaliacao} disabled={enviando}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg border-0 cursor-pointer disabled:opacity-60 transition-colors">
                {enviando ? "A publicar..." : "Publicar avaliação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Notificações ─────────────────────────────────────────────
function TabNotificacoes({ onNaoLidasChange }) {
  const [notifs, setNotifs]         = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState(null);
  const [pagina, setPagina]         = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [prefNotif, setPrefNotif]   = useState({
    pedidoConfirmado: true, produtoEnviado: true,
    mensagens: true, disputas: true,
  });

  const NTF_STYLE = {
    PEDIDO:   { bg: "bg-blue-50",   border: "border-blue-100",  dot: "bg-blue-400"  },
    SAQUE:    { bg: "bg-purple-50", border: "border-purple-100",dot: "bg-purple-400"},
    DISPUTA:  { bg: "bg-red-50",    border: "border-red-100",   dot: "bg-red-400"   },
    SISTEMA:  { bg: "bg-gray-50",   border: "border-gray-100",  dot: "bg-gray-400"  },
    AFILIADO: { bg: "bg-green-50",  border: "border-green-100", dot: "bg-green-500" },
  };

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiNotif.listar(pagina);
      const d = res.sucesso ? res.dados : res.data ?? {};
      setNotifs(d.notificacoes ?? []);
      setTotalPaginas(d.totalPaginas ?? 1);
      onNaoLidasChange?.(d.naoLidas ?? 0);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [pagina]);

  useEffect(() => { carregar(); }, [carregar]);

  async function marcarLida(id) {
    try {
      await apiNotif.marcarLida(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch { /* silencioso */ }
  }

  async function marcarTodasLidas() {
    try {
      await apiNotif.marcarTodasLidas();
      setNotifs(prev => prev.map(n => ({ ...n, lida: true })));
      onNaoLidasChange?.(0);
    } catch { /* silencioso */ }
  }

  const naoLidas = notifs.filter(n => !n.lida).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Notificações{" "}
          {naoLidas > 0 && (
            <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{naoLidas}</span>
          )}
        </p>
        {naoLidas > 0 && (
          <button onClick={marcarTodasLidas}
            className="text-xs text-green-600 hover:underline bg-transparent border-0 cursor-pointer">
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Preferências */}
      <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">Preferências de notificação</p>
        {[
          { key: "pedidoConfirmado", label: "Pedido confirmado",    sub: "Quando um pedido é criado" },
          { key: "produtoEnviado",   label: "Produto enviado",      sub: "Quando o vendedor envia" },
          { key: "mensagens",        label: "Mensagens",            sub: "Novas mensagens no chat" },
          { key: "disputas",         label: "Disputas e reembolsos",sub: "Actualizações de disputas" },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-xs font-medium text-gray-700">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
            <Toggle value={prefNotif[item.key]} onChange={v => setPrefNotif(prev => ({ ...prev, [item.key]: v }))} />
          </div>
        ))}
      </div>

      {carregando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : erro ? (
        <ErroBloco mensagem={erro} onRetry={carregar} />
      ) : notifs.length === 0 ? (
        <Vazio texto="Nenhuma notificação." />
      ) : (
        <div className="flex flex-col gap-2">
          {notifs.map(n => {
            const tipo = n.tipo ?? "SISTEMA";
            const s = NTF_STYLE[tipo] || NTF_STYLE.SISTEMA;
            return (
              <div key={n.id}
                onClick={() => !n.lida && marcarLida(n.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                  ${n.lida ? "bg-white border-gray-100 opacity-60" : `${s.bg} ${s.border}`}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.lida ? "bg-gray-200" : s.dot}`} />
                <div className="flex-1">
                  <p className="text-xs text-gray-700 leading-relaxed">{n.titulo ?? n.mensagem ?? n.texto}</p>
                  {n.mensagem && n.titulo && <p className="text-xs text-gray-500 mt-0.5">{n.mensagem}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {n.criadoEm ? fmtData(n.criadoEm) : n.hora ?? "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  );
}

// ── Modal: Chat com vendedor ──────────────────────────────────────
function ModalChat({ pedido, onClose }) {
  const [msgs, setMsgs]             = useState([]);
  const [conversa, setConversa]     = useState(null);
  const [msg, setMsg]               = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando]     = useState(false);
  const bottomRef                   = useRef(null);

  // Iniciar ou obter conversa existente com o vendedor
  useEffect(() => {
    const vendedorId = pedido.vendedor?.id;
    if (!vendedorId) { setCarregando(false); return; }

    apiChat.iniciar(vendedorId)
      .then(res => {
        const c = res.sucesso ? res.dados : res.data ?? {};
        setConversa(c);
        const mensagensOrdenadas = [...(c.mensagens ?? [])].reverse();
        setMsgs(mensagensOrdenadas);
      })
      .catch(() => setMsgs([]))
      .finally(() => setCarregando(false));
  }, [pedido.vendedor?.id]);

  // Scroll para o fim ao abrir
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function enviar() {
    const texto = msg.trim();
    if (!texto || !conversa?.id || enviando) return;
    setEnviando(true);
    const hora = new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" });
    // Optimistic update
    const tempId = Date.now();
    setMsgs(prev => [...prev, { id: tempId, conteudo: texto, remetente: { id: "eu" }, criadoEm: new Date().toISOString() }]);
    setMsg("");
    try {
      await apiChat.enviar(conversa.id, texto);
    } catch {
      // Reverter em caso de erro
      setMsgs(prev => prev.filter(m => m.id !== tempId));
      setMsg(texto);
    } finally {
      setEnviando(false);
    }
  }

  const meuId = localStorage.getItem("usuarioId") ?? "eu";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl flex flex-col" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">{pedido.vendedor?.nomeCompleto ?? "Vendedor"}</p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{pedido.itens?.[0]?.nome ?? "Produto"}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-xl bg-transparent border-0 cursor-pointer">×</button>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
          {carregando ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : msgs.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-8">Sem mensagens ainda. Inicia a conversa.</p>
          ) : (
            msgs.map((m, i) => {
              const sou = m.remetente?.id === meuId || m.remetente?.id === "eu";
              return (
                <div key={m.id ?? i} className={`flex ${sou ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs ${sou ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                    <p>{m.conteudo}</p>
                    <p className={`text-[10px] mt-1 ${sou ? "text-green-200" : "text-gray-400"}`}>
                      {m.criadoEm ? new Date(m.criadoEm).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 flex gap-2">
          <input value={msg} onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviar()}
            placeholder="Escreve uma mensagem..."
            disabled={!conversa}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-transparent disabled:opacity-50" />
          <button onClick={enviar} disabled={!msg.trim() || enviando || !conversa}
            className="px-3 py-2 bg-green-600 text-white rounded-lg border-0 cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
            {enviando ? "..." : "↑"}
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 pb-2">Histórico protegido · Não partilhes contactos externos</p>
      </div>
    </div>
  );
}

// ── Modal: Abrir disputa ──────────────────────────────────────────
function ModalDisputa({ pedido, onClose, onSucesso }) {
  const [motivo, setMotivo]       = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando]   = useState(false);

  async function handleSubmit() {
    if (!motivo) { alert("Seleciona um motivo."); return; }
    if (descricao.length < 10) { alert("Descrição muito curta (mínimo 10 caracteres)."); return; }
    setEnviando(true);
    try {
      await apiPedidos.abrirDisputa(pedido.id, motivo, descricao);
      onSucesso?.();
      onClose();
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Abrir disputa</h3>
          <button onClick={onClose} className="text-gray-400 text-xl bg-transparent border-0 cursor-pointer leading-none">×</button>
        </div>
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4 flex gap-2 items-start">
          <Ico.Alert />
          <p className="text-xs text-red-700">Uma disputa notifica o vendedor e o suporte MozTicTac. Use apenas quando necessário.</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Pedido</label>
            <p className="text-sm font-medium text-gray-800">#{pedido.id?.substring(0, 8)} — {pedido.itens?.[0]?.nome ?? "Produto"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Motivo *</label>
            <select value={motivo} onChange={e => setMotivo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
              <option value="">Selecionar motivo...</option>
              {MOTIVOS_DISPUTA.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Descrição detalhada *</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={4}
              placeholder="Descreve o problema com o máximo de detalhe possível..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none focus:border-red-400" />
            <p className={`text-xs mt-0.5 text-right ${descricao.length < 10 ? "text-red-400" : "text-gray-400"}`}>
              {descricao.length} {descricao.length < 10 ? `(faltam ${10 - descricao.length})` : "✓"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} disabled={enviando}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 bg-transparent cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={enviando}
            className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium border-0 cursor-pointer disabled:opacity-60 transition-colors">
            {enviando ? "A enviar..." : "Abrir disputa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────
export function SecaoCompras() {
  const [tab, setTab]             = useState("pedidos");
  const [resumo, setResumo]       = useState(null);
  const [carregandoResumo, setCarregandoResumo] = useState(true);
  const [naoLidas, setNaoLidas]   = useState(0);
  const [chatPedido, setChatPedido]       = useState(null);
  const [disputaPedido, setDisputaPedido] = useState(null);

  // Carregar resumo do utilizador (cabeçalho)
  useEffect(() => {
    apiConta.resumo()
      .then(res => {
        const d = res.success ? res.data : res.dados ?? {};
        setResumo(d);
      })
      .catch(() => {})
      .finally(() => setCarregandoResumo(false));
  }, []);

  const nome      = resumo?.nome ?? "—";
  const email     = resumo?.email ?? "";
  const iniciais  = nome.split(" ").map(p => p[0]).join("").substring(0, 2).toUpperCase();
  const fotoPerfil= resumo?.fotoPerfil ?? null;

  // Stats do resumo
  const totalCompras   = resumo?.estatisticas?.totalCompras ?? null;
  const saldoDisponivel= resumo?.carteira?.saldoDisponivel ?? null;
  const fmtK = (n) => { const v = Number(n || 0); return v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v); };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
            {fotoPerfil
              ? <img src={fotoPerfil} alt={iniciais} className="w-full h-full object-cover" />
              : carregandoResumo ? <Spinner small /> : iniciais}
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">
              {carregandoResumo ? <span className="text-gray-300">A carregar...</span> : "Minhas Compras"}
            </div>
            <div className="text-xs text-gray-400 truncate max-w-[180px]">
              {!carregandoResumo && `${nome} · ${email}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Actualizado agora
        </div>
      </div>

      {/* StatCards com dados reais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total compras</div>
          <div className="text-xl font-semibold font-mono tracking-tight">
            {carregandoResumo ? <span className="text-gray-300 text-base">...</span> : (totalCompras ?? "—")}
          </div>
          <div className="text-xs text-gray-400 mt-1">pedidos</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Saldo carteira</div>
          <div className="text-xl font-semibold font-mono tracking-tight">
            {carregandoResumo ? <span className="text-gray-300 text-base">...</span> : (saldoDisponivel !== null ? fmtK(saldoDisponivel) : "—")}
          </div>
          <div className="text-xs text-gray-400 mt-1">MZN disponível</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Verificação</div>
          <div className="text-xl font-semibold font-mono tracking-tight text-green-600 truncate text-sm">
            {carregandoResumo ? "..." : (resumo?.nivelVerificacao ?? "—")}
          </div>
          <div className="text-xs text-gray-400 mt-1">nível</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notificações</div>
          <div className={`text-xl font-semibold font-mono tracking-tight ${naoLidas > 0 ? "text-red-500" : "text-gray-900"}`}>
            {naoLidas}
          </div>
          <div className="text-xs text-gray-400 mt-1">não lidas</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => {
          const Icon = t.icon;
          const temBadge = t.id === "notificacoes" && naoLidas > 0;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 relative
                ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 bg-transparent"}`}>
              <Icon />
              <span className="hidden sm:inline">{t.label}</span>
              {temBadge && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {tab === "pedidos"      && (
        <TabPedidos
          onAvaliar={p => setDisputaPedido(null) || setTab("avaliacoes")}
          onDisputa={p => setDisputaPedido(p)}
          onChat={p => setChatPedido(p)}
        />
      )}
      {tab === "rastreio"     && <TabRastreio />}
      {tab === "disputas"     && <TabDisputas />}
      {tab === "avaliacoes"   && <TabAvaliacoes />}
      {tab === "notificacoes" && <TabNotificacoes onNaoLidasChange={setNaoLidas} />}

      {/* Modal Chat */}
      {chatPedido && (
        <ModalChat pedido={chatPedido} onClose={() => setChatPedido(null)} />
      )}

      {/* Modal Disputa */}
      {disputaPedido && (
        <ModalDisputa
          pedido={disputaPedido}
          onClose={() => setDisputaPedido(null)}
          onSucesso={() => setTab("disputas")}
        />
      )}
    </div>
  );
}