// src/components/SecaoVendas.jsx
// ─────────────────────────────────────────────────────────────────
// Integração completa com:
//   Prioridade 1 — pedidoControlador (listarVendas, marcarEnviado, abrirDisputa)
//   Prioridade 2 — afiliadoControlador + rankingControlador (meus afiliados, comissões, stats, posição)
//   Prioridade 3 — contaControlador + carteiraControlador (resumo real, saldo, stats)
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";

// ── API BASE ──────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const cabecalhos = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opcoes.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
  };
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: { ...cabecalhos, ...opcoes.headers },
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || dados.message || `Erro ${resposta.status}`);
  return dados;
}

// ── API: PRODUTOS ─────────────────────────────────────────────────
const apiProdutos = {
  meusProdutos:    (pagina = 1, estado) => requisitar(`/produtos/meus?pagina=${pagina}${estado ? `&estado=${estado}` : ""}`),
  categorias:      ()                   => requisitar("/produtos/categorias"),
  criarProduto:    (form)               => requisitar("/produtos",       { method: "POST",  body: form }),
  atualizarProduto:(id, dados)          => requisitar(`/produtos/${id}`, { method: "PUT",   body: JSON.stringify(dados) }),
  pausarProduto:   (id)                 => requisitar(`/produtos/${id}/pausar`,   { method: "PATCH" }),
  reativarProduto: (id)                 => requisitar(`/produtos/${id}/reativar`, { method: "PATCH" }),
  eliminarProduto: (id)                 => requisitar(`/produtos/${id}`, { method: "DELETE" }),
};

// ── API: PEDIDOS (Prioridade 1) ───────────────────────────────────
const apiPedidos = {
  listarVendas:  (pagina = 1, estado) =>
    requisitar(`/pedidos/vendas?pagina=${pagina}${estado && estado !== "todos" ? `&estado=${estado}` : ""}`),
  marcarEnviado: (id) =>
    requisitar(`/pedidos/${id}/enviado`, { method: "PATCH" }),
  abrirDisputa:  (id, motivo, descricao) =>
    requisitar(`/pedidos/${id}/disputa`, {
      method: "POST",
      body: JSON.stringify({ motivo, descricao }),
    }),
};

// ── API: AFILIADOS (Prioridade 2) ─────────────────────────────────
const apiAfiliados = {
  meusAfiliados:  (pagina = 1)  => requisitar(`/afiliados/meus?pagina=${pagina}`),
  comissoes:      (pagina = 1, estado) =>
    requisitar(`/afiliados/comissoes?pagina=${pagina}${estado ? `&estado=${estado}` : ""}`),
  estatisticas:   ()            => requisitar("/afiliados/estatisticas"),
  minhaPosicao:   ()            => requisitar("/afiliados/ranking/minha-posicao"),
};

// ── API: CONTA & CARTEIRA (Prioridade 3) ──────────────────────────
const apiConta = {
  resumo:      () => requisitar("/conta/resumo"),
  minhasVendas:(pagina = 1) => requisitar(`/conta/vendas?pagina=${pagina}`),
  saldo:       () => requisitar("/carteira/saldo"),
};

// ── Mappers ───────────────────────────────────────────────────────
function mapearProduto(p) {
  return {
    id:        p.id,
    nome:      p.nome,
    preco:     Number(p.preco),
    stock:     p.stock ?? 0,
    estado:    (p.estado ?? "").toLowerCase().replace(/_/g, " "),
    tipo:      (p.tipo ?? "produto").toLowerCase() === "servico" ? "servico" : "produto",
    vendas:    p.totalVendas ?? 0,
    afiliados: p.aceitaAfiliados ?? false,
    comissao:  Number(p.percentualAfiliado ?? p.comissaoAfiliado ?? 5),
    entrega:   p.entregaDisponivel ?? p.temEntrega ?? false,
    atacado:   p.atacado ?? false,
    descricao: p.descricao ?? "",
    imagens:   p.imagens ?? [],
    cat:       p.categoriaId ?? "",
  };
}

const ESTADO_LABEL = {
  AGUARDANDO_PAGAMENTO: "aguardando pagamento",
  PAGO:                 "pago",
  EM_PROCESSAMENTO:     "em processamento",
  ENVIADO:              "enviado",
  ENTREGUE:             "entregue",
  CANCELADO:            "cancelado",
  REEMBOLSADO:          "reembolsado",
  EM_DISPUTA:           "em disputa",
};

function normalizarEstadoPedido(e) {
  return ESTADO_LABEL[e] ?? (e ?? "").toLowerCase().replace(/_/g, " ");
}

const STATUS_CLS = {
  "aguardando pagamento": "bg-gray-100 text-gray-600",
  pago:                   "bg-blue-100 text-blue-800",
  "em processamento":     "bg-amber-100 text-amber-700",
  enviado:                "bg-amber-100 text-amber-800",
  entregue:               "bg-green-100 text-green-800",
  concluído:              "bg-green-100 text-green-800",
  cancelado:              "bg-red-100 text-red-700",
  reembolsado:            "bg-purple-100 text-purple-700",
  "em disputa":           "bg-red-100 text-red-800",
};

const ESCROW_PCT = {
  AGUARDANDO_PAGAMENTO: 0,
  PAGO:                 40,
  EM_PROCESSAMENTO:     50,
  ENVIADO:              70,
  ENTREGUE:             100,
  CANCELADO:            0,
  REEMBOLSADO:          0,
  EM_DISPUTA:           60,
};

// ── Ícones SVG ────────────────────────────────────────────────────
const Ico = {
  Home:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
  Bag:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Users:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Star:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Bar:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Pause:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Play:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Trash:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Plus:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Lock:     () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Info:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Trend:    () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Truck:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Alert:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronL: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  Refresh:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  Produto:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  Servico:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
  Trophy:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>,
  Link:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  Copy:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
};

// ── Helpers ───────────────────────────────────────────────────────
const fmt     = (n) => Number(n || 0).toLocaleString("pt-MZ") + " MZN";
const fmtK    = (n) => { const v = Number(n || 0); return v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v); };
const fmtData = (d) => d ? new Date(d).toLocaleDateString("pt-MZ", { day: "numeric", month: "short" }) : "—";

const NIVEL_CLS = {
  ouro:   { bg: "bg-amber-100",  text: "text-amber-800",  border: "border-amber-300" },
  prata:  { bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-300"  },
  bronze: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300"},
};

// ── Componentes base ──────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full border-0 transition-colors flex-shrink-0 cursor-pointer ${value ? "bg-green-600" : "bg-gray-200"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function IconBtn({ onClick, danger, title, children, disabled }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed
        ${danger ? "border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500"
                 : "border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-600"}`}>
      {children}
    </button>
  );
}

function Spinner({ small }) {
  return (
    <div className={`border-2 border-gray-200 border-t-green-600 rounded-full animate-spin ${small ? "w-4 h-4" : "w-6 h-6"}`} />
  );
}

function Paginacao({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onChange(pagina - 1)} disabled={pagina <= 1}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-green-400 cursor-pointer bg-transparent">
        <Ico.ChevronL />
      </button>
      <span className="text-xs text-gray-500 font-mono">{pagina} / {totalPaginas}</span>
      <button onClick={() => onChange(pagina + 1)} disabled={pagina >= totalPaginas}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-green-400 cursor-pointer bg-transparent">
        <Ico.ChevronR />
      </button>
    </div>
  );
}

function EstadoVazio({ texto }) {
  return <div className="text-center text-sm text-gray-400 py-12">{texto}</div>;
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

// ── PRIORIDADE 1 — TabPedidos integrada ──────────────────────────
function TabPedidos() {
  const [filtro, setFiltro]             = useState("todos");
  const [pagina, setPagina]             = useState(1);
  const [pedidos, setPedidos]           = useState([]);
  const [total, setTotal]               = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando]     = useState(true);
  const [erro, setErro]                 = useState(null);
  const [acaoId, setAcaoId]             = useState(null); // id do pedido em processamento
  const [modalDisputa, setModalDisputa] = useState(null); // { pedidoId }

  const FILTROS = ["todos", "PAGO", "ENVIADO", "ENTREGUE", "EM_DISPUTA", "CANCELADO"];
  const FILTROS_LABEL = { todos: "Todos", PAGO: "Pagos", ENVIADO: "Enviados", ENTREGUE: "Entregues", EM_DISPUTA: "Em disputa", CANCELADO: "Cancelados" };

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiPedidos.listarVendas(pagina, filtro === "todos" ? null : filtro);
      const d = res.sucesso ? res.dados : res.data ?? {};
      setPedidos(d.pedidos ?? []);
      setTotal(d.total ?? 0);
      setTotalPaginas(d.totalPaginas ?? Math.ceil((d.total ?? 0) / 20) || 1);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [pagina, filtro]);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleMarcarEnviado(id) {
    setAcaoId(id);
    try {
      await apiPedidos.marcarEnviado(id);
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: "ENVIADO", enviadoEm: new Date().toISOString() } : p));
    } catch (e) { alert("Erro: " + e.message); }
    finally { setAcaoId(null); }
  }

  function mudarFiltro(f) { setFiltro(f); setPagina(1); }

  const totalExibido = filtro === "todos" ? total : pedidos.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Pedidos recebidos{" "}
          <span className="font-normal text-gray-400 text-xs">({total})</span>
        </p>
        <button onClick={carregar} disabled={carregando}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:border-gray-300 bg-transparent cursor-pointer flex items-center gap-1.5 disabled:opacity-60">
          <Ico.Refresh /> Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTROS.map(f => (
          <button key={f} onClick={() => mudarFiltro(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${filtro === f ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 hover:border-green-400 bg-transparent"}`}>
            {FILTROS_LABEL[f]}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : erro ? (
        <ErroBloco mensagem={erro} onRetry={carregar} />
      ) : pedidos.length === 0 ? (
        <EstadoVazio texto="Nenhum pedido encontrado." />
      ) : (
        <div className="flex flex-col gap-2">
          {pedidos.map(p => {
            const estadoNorm = normalizarEstadoPedido(p.estado);
            const pct = ESCROW_PCT[p.estado] ?? 50;
            const podeEnviar = p.estado === "PAGO";
            const podeDisputa = ["PAGO", "ENVIADO", "ENTREGUE"].includes(p.estado);
            const emAcao = acaoId === p.id;

            return (
              <div key={p.id} className="p-4 bg-white border border-gray-100 rounded-xl hover:border-green-100 transition-all">
                {/* Cabeçalho */}
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-400 font-mono">
                      #{p.id?.substring(0, 8)} · {p.comprador?.nomeCompleto ?? "—"} · {fmtData(p.criadoEm ?? p.data)}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                      {p.itens?.[0]?.nome ?? p.produto ?? "Produto"}
                      {(p.itens?.length > 1) && ` +${p.itens.length - 1} mais`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">{fmt(p.total ?? p.valor)}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ml-2 ${STATUS_CLS[estadoNorm] || "bg-gray-100 text-gray-500"}`}>
                    {estadoNorm}
                  </span>
                </div>

                {/* Escrow */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                  <Ico.Lock /> Escrow: {pct}% liberado
                </div>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>

                {/* Acções */}
                {(podeEnviar || podeDisputa) && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    {podeEnviar && (
                      <button onClick={() => handleMarcarEnviado(p.id)} disabled={emAcao}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-60">
                        {emAcao ? <Spinner small /> : <Ico.Truck />}
                        Marcar como enviado
                      </button>
                    )}
                    {podeDisputa && !p.emDisputa && (
                      <button onClick={() => setModalDisputa({ pedidoId: p.id })} disabled={emAcao}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg bg-transparent cursor-pointer transition-colors disabled:opacity-60">
                        <Ico.Alert /> Abrir disputa
                      </button>
                    )}
                    {p.emDisputa && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 font-medium">
                        <Ico.Alert /> Disputa aberta
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />

      {/* Nota Escrow */}
      {!carregando && !erro && (
        <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl flex gap-2.5 items-start">
          <Ico.Info />
          <div>
            <div className="text-xs font-semibold text-green-800">Sistema Escrow activo</div>
            <div className="text-xs text-green-700 mt-0.5">O dinheiro é retido até o comprador confirmar a entrega. Protege ambas as partes.</div>
          </div>
        </div>
      )}

      {/* Modal de Disputa */}
      {modalDisputa && (
        <ModalDisputa
          pedidoId={modalDisputa.pedidoId}
          onClose={() => setModalDisputa(null)}
          onSucesso={() => { setModalDisputa(null); carregar(); }}
        />
      )}
    </div>
  );
}

// ── Modal de Disputa ──────────────────────────────────────────────
function ModalDisputa({ pedidoId, onClose, onSucesso }) {
  const [motivo, setMotivo]       = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando]   = useState(false);

  const MOTIVOS = [
    "Produto não recebido",
    "Produto diferente do anunciado",
    "Produto com defeito",
    "Produto danificado na entrega",
    "Vendedor não responde",
    "Outro",
  ];

  async function handleSubmit() {
    if (!motivo) { alert("Seleciona um motivo."); return; }
    if (descricao.length < 10) { alert("Descreve o problema com mais detalhe (mínimo 10 caracteres)."); return; }
    setEnviando(true);
    try {
      await apiPedidos.abrirDisputa(pedidoId, motivo, descricao);
      onSucesso();
    } catch (e) { alert("Erro ao abrir disputa: " + e.message); }
    finally { setEnviando(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Abrir disputa</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl bg-transparent border-0 cursor-pointer leading-none">×</button>
          </div>
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4 flex gap-2 items-start">
            <Ico.Alert />
            <p className="text-xs text-red-700">Uma disputa notifica o comprador e a equipa MozTicTac. Use apenas quando necessário.</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Motivo *</label>
              <select value={motivo} onChange={e => setMotivo(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
                <option value="">Selecionar motivo...</option>
                {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Descrição detalhada *</label>
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={4}
                placeholder="Descreve o problema com o máximo de detalhe possível..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none focus:border-red-400" />
              <p className={`text-xs mt-0.5 text-right ${descricao.length < 10 ? "text-red-400" : "text-gray-400"}`}>
                {descricao.length} caracteres {descricao.length >= 10 ? "✓" : `(faltam ${10 - descricao.length})`}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={onClose} disabled={enviando}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-gray-300 bg-transparent cursor-pointer">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={enviando}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors border-0 cursor-pointer disabled:opacity-60">
              {enviando ? "A enviar..." : "Abrir disputa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PRIORIDADE 2 — TabAfiliados integrada ─────────────────────────
function TabAfiliados({ produtos, setProdutos }) {
  const [subTab, setSubTab]               = useState("links");
  const [afiliados, setAfiliados]         = useState([]);
  const [comissoes, setComissoes]         = useState([]);
  const [estatisticas, setEstatisticas]   = useState(null);
  const [posicao, setPosicao]             = useState(null);
  const [carregando, setCarregando]       = useState(true);
  const [erro, setErro]                   = useState(null);
  const [paginaComissoes, setPaginaComissoes] = useState(1);
  const [totalComissoes, setTotalComissoes]   = useState(0);
  const [totalPaginasCom, setTotalPaginasCom] = useState(1);

  const [copiadoId, setCopiadoId] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [resAfi, resPos, resStats] = await Promise.all([
        apiAfiliados.meusAfiliados(),
        apiAfiliados.minhaPosicao(),
        apiAfiliados.estatisticas(),
      ]);

      const d = resAfi.sucesso ? resAfi.dados : resAfi.data ?? {};
      setAfiliados(d.afiliados ?? []);

      const dp = resPos.success ? resPos.data : resPos.dados ?? {};
      setPosicao(dp);

      const ds = resStats.sucesso ? resStats.dados : resStats.data ?? {};
      setEstatisticas(ds);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarComissoes = useCallback(async () => {
    try {
      const res = await apiAfiliados.comissoes(paginaComissoes);
      const d = res.sucesso ? res.dados : res.data ?? {};
      setComissoes(d.comissoes ?? []);
      setTotalComissoes(d.total ?? 0);
      setTotalPaginasCom(d.totalPaginas ?? 1);
    } catch (e) { /* silencioso */ }
  }, [paginaComissoes]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { if (subTab === "historico") carregarComissoes(); }, [subTab, carregarComissoes]);

  function copiarLink(codigo) {
    const link = `${window.location.origin}/r/${codigo}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiadoId(codigo);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  async function toggleAff(id, aceitaAtual) {
    try {
      await apiProdutos.atualizarProduto(id, { aceitaAfiliados: !aceitaAtual });
      setProdutos(prev => prev.map(p => p.id === id ? { ...p, afiliados: !aceitaAtual } : p));
    } catch (e) { alert("Erro: " + e.message); }
  }

  async function updateComissao(id, val) {
    try {
      await apiProdutos.atualizarProduto(id, { percentualAfiliado: val });
      setProdutos(prev => prev.map(p => p.id === id ? { ...p, comissao: Number(val) } : p));
    } catch (e) { alert("Erro: " + e.message); }
  }

  const totalGanhoAfiliados = afiliados.reduce((s, a) => s + Number(a.totalGanho || 0), 0);
  const totalCliques        = afiliados.reduce((s, a) => s + Number(a.totalCliques || 0), 0);
  const totalConversoes     = afiliados.reduce((s, a) => s + Number(a.totalConversoes || 0), 0);
  const nivel               = posicao?.nivel ?? "bronze";
  const nivelCls            = NIVEL_CLS[nivel] ?? NIVEL_CLS.bronze;

  const SUBTABS = [
    { id: "links",    label: "Os meus links" },
    { id: "produtos", label: "Gestão produtos" },
    { id: "historico",label: "Histórico" },
  ];

  if (carregando) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (erro)       return <ErroBloco mensagem={erro} onRetry={carregar} />;

  return (
    <div>
      {/* Cabeçalho estatísticas reais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total ganho</div>
          <div className="text-lg font-semibold font-mono text-gray-900">{fmtK(totalGanhoAfiliados)}</div>
          <div className="text-xs text-gray-400">MZN</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Cliques</div>
          <div className="text-lg font-semibold font-mono text-gray-900">{totalCliques}</div>
          <div className="text-xs text-gray-400">total</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Conversões</div>
          <div className="text-lg font-semibold font-mono text-gray-900">{totalConversoes}</div>
          <div className="text-xs text-gray-400">
            {totalCliques > 0 ? ((totalConversoes / totalCliques) * 100).toFixed(1) + "%" : "0%"} taxa
          </div>
        </div>
        <div className={`rounded-xl p-3 border ${nivelCls.bg} ${nivelCls.border}`}>
          <div className={`text-xs uppercase tracking-wide mb-1 font-medium ${nivelCls.text}`}>Nível</div>
          <div className={`text-lg font-bold capitalize ${nivelCls.text}`}>{nivel}</div>
          {posicao?.posicao && <div className={`text-xs ${nivelCls.text} opacity-70`}>#{posicao.posicao} no ranking</div>}
          {posicao?.proximoNivel && (
            <div className={`text-xs mt-1 ${nivelCls.text} opacity-70`}>
              faltam {fmtK(posicao.proximoNivel.faltaParaProximo)} MZN → {posicao.proximoNivel.nome}
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
        {SUBTABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-0
              ${subTab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 bg-transparent"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-tab: Links de afiliado reais */}
      {subTab === "links" && (
        <div className="flex flex-col gap-2">
          {afiliados.length === 0 && <EstadoVazio texto="Ainda não criaste nenhum link de afiliado." />}
          {afiliados.map(a => (
            <div key={a.id} className="p-4 bg-white border border-gray-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {a.produto?.imagem
                    ? <img src={a.produto.imagem} alt="" className="w-full h-full object-cover" />
                    : <Ico.Produto />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{a.produto?.nome ?? "Produto"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.cliques ?? 0} cliques · {a.conversoes ?? 0} conversões · {Number(a.comissao ?? 0)}% comissão
                  </p>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-sm font-semibold text-green-600 font-mono">{fmt(a.ganho)}</p>
                  <p className="text-xs text-gray-400">ganhos</p>
                </div>
                <button onClick={() => copiarLink(a.codigoAfiliado)}
                  title="Copiar link"
                  className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors cursor-pointer bg-transparent flex-shrink-0
                    ${copiadoId === a.codigoAfiliado ? "border-green-400 text-green-600" : "border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500"}`}>
                  {copiadoId === a.codigoAfiliado ? <Ico.Check /> : <Ico.Copy />}
                </button>
              </div>
              <div className="mt-2 px-1">
                <p className="text-xs text-gray-300 font-mono truncate">
                  {window.location.origin}/r/{a.codigoAfiliado}
                </p>
              </div>
            </div>
          ))}

          {/* Top produtos de estatísticas */}
          {estatisticas?.maisLucrativos?.length > 0 && (
            <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-semibold text-blue-800 mb-3 uppercase tracking-wide">Top produtos afiliados</p>
              <div className="flex flex-col gap-2">
                {estatisticas.maisLucrativos.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-800 flex-shrink-0">{i + 1}</div>
                    <p className="text-xs font-medium text-blue-900 flex-1 truncate">{t.produtoNome}</p>
                    <span className="text-xs text-blue-700 font-mono">{t.taxaConversao}%</span>
                    <span className="text-xs text-blue-800 font-semibold font-mono">{fmtK(t.ganho)} MZN</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab: Gestão de produtos (toggle afiliados) */}
      {subTab === "produtos" && (
        <div className="flex flex-col gap-2">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-2 flex gap-2 items-start">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2255b0" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p className="text-xs text-blue-800">Afiliados promovem os seus produtos e recebem comissão apenas quando há venda. Você só paga quando vende.</p>
          </div>
          {produtos.map(p => (
            <div key={p.id} className="p-4 bg-white border border-gray-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                  {p.tipo === "produto" ? <Ico.Produto /> : <Ico.Servico />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.afiliados ? `Comissão: ${p.comissao}% · activo` : "Afiliados desactivados"}</p>
                </div>
                {p.afiliados && (
                  <div className="text-right mr-3 hidden sm:block flex-shrink-0">
                    <p className="text-sm font-semibold text-green-600 font-mono">{Math.round(((p.vendas ?? 0) * p.preco * p.comissao) / 100).toLocaleString("pt-MZ")}</p>
                    <p className="text-xs text-gray-400">MZN gerado</p>
                  </div>
                )}
                <Toggle value={p.afiliados} onChange={() => toggleAff(p.id, p.afiliados)} />
              </div>
              {p.afiliados && (
                <div className="mt-3 flex items-center gap-3 px-1 bg-gray-50 rounded-lg p-2">
                  <span className="text-xs text-gray-500 w-24 flex-shrink-0">Comissão: {p.comissao}%</span>
                  <input type="range" min="1" max="30" step="1" value={p.comissao}
                    onChange={e => updateComissao(p.id, e.target.value)} className="flex-1" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sub-tab: Histórico de comissões real */}
      {subTab === "historico" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400">{totalComissoes} comissões no total</p>
          </div>
          {comissoes.length === 0 ? (
            <EstadoVazio texto="Nenhuma comissão registada ainda." />
          ) : (
            <div className="flex flex-col gap-2">
              {comissoes.map(c => {
                const estadoCls = {
                  PENDENTE:      "bg-amber-100 text-amber-700",
                  EM_VALIDACAO:  "bg-blue-100 text-blue-700",
                  DISPONIVEL:    "bg-green-100 text-green-700",
                  PAGA:          "bg-gray-100 text-gray-500",
                  CANCELADA:     "bg-red-100 text-red-600",
                }[c.estado] ?? "bg-gray-100 text-gray-500";

                return (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.produto}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Pedido #{c.pedidoId?.substring(0, 8)} · {fmtData(c.data)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-green-600 font-mono">{fmt(c.valor)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoCls}`}>{c.estado?.toLowerCase()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Paginacao pagina={paginaComissoes} totalPaginas={totalPaginasCom} onChange={setPaginaComissoes} />
        </div>
      )}
    </div>
  );
}

// ── Tab: Produtos ─────────────────────────────────────────────────
function TabProdutos({ produtos, setProdutos, onPublicar, onEditar }) {
  const [filtro, setFiltro]         = useState("todos");
  const [carregando, setCarregando] = useState(false);

  const FILTROS = ["todos", "activo", "pausado", "pendente aprovacao", "produto", "servico"];
  const lista = filtro === "todos" ? produtos : produtos.filter(p => p.estado === filtro || p.tipo === filtro);

  async function toggleEstado(id, estadoActual) {
    setCarregando(true);
    try {
      if (estadoActual === "activo") {
        await apiProdutos.pausarProduto(id);
        setProdutos(prev => prev.map(p => p.id === id ? { ...p, estado: "pausado" } : p));
      } else {
        await apiProdutos.reativarProduto(id);
        setProdutos(prev => prev.map(p => p.id === id ? { ...p, estado: "pendente aprovacao" } : p));
      }
    } catch (e) { alert("Erro ao alterar estado: " + e.message); }
    finally { setCarregando(false); }
  }

  async function eliminar(id) {
    if (!window.confirm("Tens a certeza que queres eliminar este anúncio?")) return;
    setCarregando(true);
    try {
      await apiProdutos.eliminarProduto(id);
      setProdutos(prev => prev.filter(p => p.id !== id));
    } catch (e) { alert("Erro ao eliminar: " + e.message); }
    finally { setCarregando(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Os meus anúncios <span className="font-normal text-gray-400 text-xs">({lista.length})</span>
        </p>
        <button onClick={onPublicar} disabled={carregando}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0 disabled:opacity-60">
          <Ico.Plus /> Publicar
        </button>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTROS.map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${filtro === f ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 hover:border-green-400 bg-transparent"}`}>
            {f === "servico" ? "Serviço" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {lista.length === 0 && <EstadoVazio texto="Nenhum anúncio encontrado." />}
        {lista.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition-all">
            <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
              {p.imagens?.[0]
                ? <img src={p.imagens[0]} alt="" className="w-full h-full object-cover" />
                : p.tipo === "produto" ? <Ico.Produto /> : <Ico.Servico />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
              <p className="text-xs text-gray-400 mt-0.5">{p.vendas ?? 0} vendas · {p.tipo === "produto" ? `Stock: ${p.stock ?? 0}` : "Serviço"}</p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>{p.estado}</span>
                {p.afiliados && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">Afiliados {p.comissao}%</span>}
                {p.atacado   && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">Atacado</span>}
                {p.entrega   && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">Entrega</span>}
              </div>
            </div>
            <div className="text-right flex-shrink-0 hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 font-mono">{Number(p.preco).toLocaleString("pt-MZ")} MZN</p>
              <p className="text-xs text-gray-400">preço base</p>
              <p className="text-xs text-green-600 mt-0.5">recebe {Math.round(p.preco * 0.895).toLocaleString("pt-MZ")}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <IconBtn title="Editar" onClick={() => onEditar(p)}><Ico.Edit /></IconBtn>
              <IconBtn title={p.estado === "activo" ? "Pausar" : "Activar"} onClick={() => toggleEstado(p.id, p.estado)} disabled={carregando}>
                {p.estado === "activo" ? <Ico.Pause /> : <Ico.Play />}
              </IconBtn>
              <IconBtn danger title="Eliminar" onClick={() => eliminar(p.id)} disabled={carregando}><Ico.Trash /></IconBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Promoções ────────────────────────────────────────────────
const PROMO_PLANS = [
  { nome: "Básico",    duracao: "3 dias",  preco: 250,  desc: "Destaque no feed geral" },
  { nome: "Standard", duracao: "7 dias",  preco: 500,  desc: "Destaque + notificações", popular: true },
  { nome: "Premium",  duracao: "30 dias", preco: 1500, desc: "Topo do feed + banner" },
];

function TabPromocoes({ produtos }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-4">Promoções e destaque</p>
      <div className="p-4 bg-white border border-gray-100 rounded-xl mb-4">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span className="text-sm font-semibold text-gray-800">Como funcionam as promoções?</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">Pague uma taxa e o seu anúncio ganha prioridade no feed. Mais visibilidade significa mais cliques e mais vendas.</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {PROMO_PLANS.map(pl => (
            <div key={pl.nome} className={`p-3 rounded-xl border ${pl.popular ? "border-amber-300 bg-amber-50" : "border-gray-100 bg-gray-50"}`}>
              {pl.popular && <div className="text-xs font-bold text-amber-700 mb-1">POPULAR</div>}
              <div className="text-sm font-bold text-gray-900">{pl.nome}</div>
              <div className="text-xs text-gray-500 mt-1">{pl.duracao} · {pl.desc}</div>
              <div className="text-sm font-bold text-green-600 mt-2 font-mono">{pl.preco} MZN</div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-3">Anúncios elegíveis</p>
      <div className="flex flex-col gap-2">
        {produtos.filter(p => p.estado === "activo").map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
              {p.imagens?.[0] ? <img src={p.imagens[0]} alt="" className="w-full h-full object-cover" /> : p.tipo === "produto" ? <Ico.Produto /> : <Ico.Servico />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
              <p className="text-xs text-gray-400">{p.vendas ?? 0} vendas · {fmt(p.preco)}</p>
            </div>
            <button className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg border-0 cursor-pointer hover:bg-amber-600 transition-colors flex-shrink-0">Promover</button>
          </div>
        ))}
        {produtos.filter(p => p.estado === "activo").length === 0 && <EstadoVazio texto="Nenhum produto activo para promover." />}
      </div>
    </div>
  );
}

// ── Tab: Estatísticas ─────────────────────────────────────────────
function TabStats({ produtos, statsVendas }) {
  const top  = [...produtos].sort((a, b) => (b.vendas ?? 0) - (a.vendas ?? 0)).slice(0, 4);
  const max  = top[0]?.vendas || 1;
  const RANK_CLS = ["bg-green-500", "bg-blue-500", "bg-gray-400", "bg-gray-300"];

  const totalComissoesPagas = produtos
    .filter(p => p.afiliados)
    .reduce((acc, p) => acc + (p.vendas ?? 0) * p.preco * (p.comissao / 100), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Desempenho detalhado</p>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Taxa plataforma</div>
          <div className="text-lg font-semibold font-mono">10.5%</div>
          <div className="text-xs text-gray-400">sobre cada venda</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Comissões est.</div>
          <div className="text-lg font-semibold font-mono">{fmtK(totalComissoesPagas)}</div>
          <div className="text-xs text-gray-400">MZN estimado</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total vendas</div>
          <div className="text-lg font-semibold font-mono">{statsVendas?.totalVendas ?? "—"}</div>
          <div className="text-xs text-gray-400">pedidos</div>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Mais vendidos</p>
      <div className="flex flex-col gap-3 mb-5">
        {top.length === 0 && <EstadoVazio texto="Nenhum dado de vendas ainda." />}
        {top.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${RANK_CLS[i]}`}>{i + 1}</div>
            <p className="text-sm font-medium text-gray-800 flex-1 truncate min-w-0">{p.nome}</p>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round(((p.vendas ?? 0) / max) * 100)}%` }} />
            </div>
            <span className="text-sm font-semibold text-gray-700 flex-shrink-0 font-mono w-8 text-right">{p.vendas ?? 0}</span>
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Sugestões de melhoria</p>
      <div className="flex flex-col gap-2">
        {top[0] && (
          <div className="flex gap-3 p-3 rounded-xl border border-green-100 bg-green-50 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"><Ico.Trend /></div>
            <div>
              <div className="text-xs font-semibold text-green-800">Produto com mais vendas: {top[0]?.nome ?? "—"}</div>
              <div className="text-xs text-green-700 mt-0.5">Considere aumentar o stock e activar promoção para maximizar receita.</div>
            </div>
          </div>
        )}
        <div className="flex gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50 items-start">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><Ico.Users /></div>
          <div>
            <div className="text-xs font-semibold text-blue-800">Produtos sem afiliados activos</div>
            <div className="text-xs text-blue-700 mt-0.5">Activar afiliados pode aumentar vendas para produtos de alto valor.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal Publicar/Editar ─────────────────────────────────────────
function ModalPublicar({ item, onClose, onSalvar }) {
  const [tipo, setTipo]           = useState(item?.tipo || "produto");
  const [nome, setNome]           = useState(item?.nome || "");
  const [desc, setDesc]           = useState(item?.descricao || "");
  const [cat, setCat]             = useState(item?.cat || "");
  const [preco, setPreco]         = useState(item?.preco || "");
  const [stock, setStock]         = useState(item?.stock || "");
  const [afiliados, setAfiliados] = useState(item?.afiliados || false);
  const [comissao, setComissao]   = useState(item?.comissao || 5);
  const [entrega, setEntrega]     = useState(item?.entrega ?? true);
  const [atacado, setAtacado]     = useState(item?.atacado || false);
  const [imagens, setImagens]     = useState(null);
  const [enviando, setEnviando]   = useState(false);
  const [cats, setCats]           = useState([]);
  const [catsCarregando, setCatsCarregando] = useState(true);

  useEffect(() => {
    apiProdutos.categorias()
      .then(r => setCats(r.dados ?? r.data ?? []))
      .catch(() => setCats([]))
      .finally(() => setCatsCarregando(false));
  }, []);

  const taxa    = preco ? Math.round(Number(preco) * 0.105) : 0;
  const liquido = preco ? Math.round(Number(preco) - taxa)  : 0;

  async function handleSalvar() {
    if (!nome.trim())      { alert("Preenche o nome do anúncio."); return; }
    if (desc.length < 10)  { alert("A descrição deve ter pelo menos 10 caracteres."); return; }
    if (!preco)            { alert("Preenche o preço."); return; }
    if (!cat)              { alert("Seleciona uma categoria."); return; }

    setEnviando(true);
    try {
      await onSalvar({
        id:               item?.id,
        nome:             nome.trim(),
        descricao:        desc,
        tipo:             tipo === "produto" ? "FISICO" : "SERVICO",
        preco:            Number(preco),
        stock:            tipo === "produto" ? Number(stock) || 0 : undefined,
        categoriaId:      cat,
        aceitaAfiliados:  Boolean(afiliados),
        percentualAfiliado: afiliados ? Number(comissao) : 0,
        entregaDisponivel: entrega,
        atacado,
        metodosPagamento: ["MPESA", "EMOLA"],
        imagens,
      });
      onClose();
    } catch (e) { alert("Erro ao guardar: " + e.message); }
    finally { setEnviando(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">{item ? "Editar anúncio" : "Publicar anúncio"}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl bg-transparent border-0 cursor-pointer leading-none">×</button>
          </div>
          <div className="flex gap-2 mb-4">
            {["produto", "servico"].map(t => (
              <button key={t} onClick={() => setTipo(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer
                  ${tipo === t ? "border-green-500 text-green-700 bg-green-50" : "border-gray-200 text-gray-500 bg-transparent"}`}>
                {t === "produto" ? "📦 Produto" : "🛠️ Serviço"}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Nome do anúncio *</label>
              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="ex: Smartphone Samsung A54"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Descrição *</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                placeholder="Descreva com clareza... (mínimo 10 caracteres)"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none transition-colors
                  ${desc.length > 0 && desc.length < 10 ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-green-500"}`} />
              <p className={`text-xs mt-0.5 text-right ${desc.length < 10 ? "text-red-400" : "text-gray-400"}`}>
                {desc.length} caracteres {desc.length < 10 ? `(faltam ${10 - desc.length})` : "✓"}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Categoria *</label>
              <select value={cat} onChange={e => setCat(e.target.value)} disabled={catsCarregando}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 disabled:opacity-60 bg-white">
                <option value="">{catsCarregando ? "A carregar categorias..." : "Selecionar categoria..."}</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 block mb-1">Preço (MZN) *</label>
                <input type="number" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0.00" min="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
              </div>
              {tipo === "produto" && (
                <div className="w-24">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Stock *</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="qtd" min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                </div>
              )}
            </div>
            {Number(preco) > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between"><span className="text-gray-500">Preço base</span><span className="font-mono">{Number(preco).toLocaleString("pt-MZ")} MZN</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Taxa plataforma (10.5%)</span><span className="font-mono text-red-500">−{taxa.toLocaleString("pt-MZ")} MZN</span></div>
                <div className="flex justify-between pt-1.5 border-t border-gray-200"><span className="font-semibold">Você recebe</span><span className="font-mono font-bold text-green-600">{liquido.toLocaleString("pt-MZ")} MZN</span></div>
              </div>
            )}
            {tipo === "produto" && (
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Imagens (máx. 12)</label>
                <input type="file" accept="image/*" multiple onChange={e => setImagens(e.target.files)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Entrega disponível</p>
              <Toggle value={entrega} onChange={setEntrega} />
            </div>
            {tipo === "produto" && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Venda em atacado</p>
                <Toggle value={atacado} onChange={setAtacado} />
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Aceitar afiliados</p>
                <p className="text-xs text-gray-400">Afiliados promovem e ganham comissão por venda</p>
              </div>
              <Toggle value={afiliados} onChange={setAfiliados} />
            </div>
            {afiliados && (
              <div className="px-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Comissão de afiliado</span>
                  <span className="text-sm font-bold text-green-600 font-mono">{comissao}%</span>
                </div>
                <input type="range" min="1" max="30" step="1" value={comissao}
                  onChange={e => setComissao(Number(e.target.value))} className="w-full" />
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={onClose} disabled={enviando}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-gray-300 bg-transparent cursor-pointer">
              Cancelar
            </button>
            <button onClick={handleSalvar} disabled={enviando}
              className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors border-0 cursor-pointer disabled:opacity-60">
              {enviando ? "A guardar..." : item ? "Guardar alterações" : "Publicar anúncio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────
const TABS = [
  { id: "produtos",  label: "Produtos",     icon: Ico.Home  },
  { id: "pedidos",   label: "Pedidos",      icon: Ico.Bag   },
  { id: "afiliados", label: "Afiliados",    icon: Ico.Users },
  { id: "promos",    label: "Promoções",    icon: Ico.Star  },
  { id: "stats",     label: "Estatísticas", icon: Ico.Bar   },
];

export function SecaoVendas() {
  const [tab, setTab]               = useState("produtos");
  const [produtos, setProdutos]     = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState(null);
  const [modal, setModal]           = useState(null);

  // ── PRIORIDADE 3 — Dados reais do cabeçalho e StatCards ──
  const [resumo, setResumo]           = useState(null);
  const [statsVendas, setStatsVendas] = useState(null);
  const [saldo, setSaldo]             = useState(null);
  const [carregandoResumo, setCarregandoResumo] = useState(true);

  // Carregar dados reais do cabeçalho e stats
  useEffect(() => {
    Promise.all([
      apiConta.resumo(),
      apiConta.minhasVendas(1),
      apiConta.saldo(),
    ]).then(([resResumo, resVendas, resSaldo]) => {
      const dr = resResumo.success ? resResumo.data : resResumo.dados ?? {};
      setResumo(dr);

      const dv = resVendas.success ? resVendas.data : resVendas.dados ?? {};
      setStatsVendas({
        totalVendas:   dv.total ?? 0,
        totalPaginas:  dv.totalPaginas ?? 1,
      });

      const ds = resSaldo.sucesso ? resSaldo.dados : resSaldo.data ?? {};
      setSaldo(ds);
    }).catch(() => {
      // Fallback silencioso — mostra "—" nos cards
    }).finally(() => setCarregandoResumo(false));
  }, []);

  // Carregar produtos
  useEffect(() => {
    apiProdutos.meusProdutos()
      .then(res => {
        const lista = res.dados?.produtos ?? res.data?.produtos ?? res.dados ?? res.data ?? [];
        setProdutos(lista.map(mapearProduto));
      })
      .catch(e => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function handleSalvar(dadosModal) {
    const { id, imagens, ...resto } = dadosModal;
    if (id) {
      const res        = await apiProdutos.atualizarProduto(id, resto);
      const atualizado = mapearProduto(res.dados ?? res.data);
      setProdutos(prev => prev.map(p => p.id === id ? atualizado : p));
    } else {
      const form = new FormData();
      Object.entries(resto).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (Array.isArray(v)) v.forEach(item => form.append(k, String(item)));
        else if (typeof v === "boolean") form.append(k, v ? "true" : "false");
        else form.append(k, String(v));
      });
      if (imagens) Array.from(imagens).forEach(f => form.append("imagens", f));
      const res  = await apiProdutos.criarProduto(form);
      const novo = mapearProduto(res.dados ?? res.data);
      setProdutos(prev => [novo, ...prev]);
    }
  }

  // ── Valores reais para StatCards (com fallback para "—") ──
  const nomeUtilizador  = resumo?.nome   ?? "—";
  const emailUtilizador = resumo?.email  ?? "";
  const iniciais        = nomeUtilizador.split(" ").map(p => p[0]).join("").substring(0, 2).toUpperCase();
  const fotoPerfil      = resumo?.fotoPerfil ?? null;

  const receitaLiquida  = resumo?.carteira?.ganhoVendas ?? null;
  const saldoDisponivel = saldo?.saldoDisponivel ?? resumo?.carteira?.saldoDisponivel ?? null;
  const totalVendasMes  = statsVendas?.totalVendas ?? null;
  const totalProdutos   = resumo?.estatisticas?.totalProdutos ?? produtos.length;

  const receitaBruta = receitaLiquida !== null
    ? Math.round(receitaLiquida / 0.895) // estimativa reversa da taxa 10.5%
    : null;

  const taxaConversao = totalVendasMes !== null && totalProdutos > 0
    ? ((totalVendasMes / Math.max(totalProdutos * 10, 1)) * 100).toFixed(1)
    : null;

  if (carregando) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
      <Spinner /> A carregar os seus produtos...
    </div>
  );

  if (erro) return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <p className="text-red-500 text-sm font-medium">Erro ao carregar produtos</p>
      <p className="text-gray-400 text-xs max-w-xs">{erro}</p>
      <button onClick={() => window.location.reload()}
        className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg border-0 cursor-pointer hover:bg-green-700">
        Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── Cabeçalho com dados reais ── */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
            {fotoPerfil
              ? <img src={fotoPerfil} alt={iniciais} className="w-full h-full object-cover" />
              : carregandoResumo ? <Spinner small /> : iniciais}
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">
              {carregandoResumo ? <span className="text-gray-300">A carregar...</span> : "Minhas Vendas"}
            </div>
            <div className="text-xs text-gray-400 truncate max-w-[180px]">
              {carregandoResumo ? "" : `${nomeUtilizador} · ${emailUtilizador}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Actualizado agora
        </div>
      </div>

      {/* ── StatCards com dados reais ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Vendas</div>
          <div className="text-xl font-semibold text-gray-900 font-mono tracking-tight">
            {carregandoResumo ? <span className="text-gray-300 text-base">...</span> : (totalVendasMes ?? "—")}
          </div>
          <div className="text-xs text-gray-400 mt-1">pedidos total</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Receita bruta</div>
          <div className="text-xl font-semibold text-gray-900 font-mono tracking-tight">
            {carregandoResumo ? <span className="text-gray-300 text-base">...</span> : (receitaBruta !== null ? fmtK(receitaBruta) : "—")}
          </div>
          <div className="text-xs text-gray-400 mt-1">MZN</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Saldo disponível</div>
          <div className="text-xl font-semibold text-gray-900 font-mono tracking-tight">
            {carregandoResumo ? <span className="text-gray-300 text-base">...</span> : (saldoDisponivel !== null ? fmtK(saldoDisponivel) : "—")}
          </div>
          <div className="text-xs text-gray-400 mt-1">MZN na carteira</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Produtos</div>
          <div className="text-xl font-semibold text-gray-900 font-mono tracking-tight">
            {totalProdutos}
          </div>
          <div className="text-xs text-gray-400 mt-1">publicados</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-0
                ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 bg-transparent"}`}>
              <Icon />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Conteúdo das tabs ── */}
      {tab === "produtos"  && (
        <TabProdutos
          produtos={produtos}
          setProdutos={setProdutos}
          onPublicar={() => setModal("novo")}
          onEditar={item => setModal({ item })}
        />
      )}
      {tab === "pedidos"   && <TabPedidos />}
      {tab === "afiliados" && <TabAfiliados produtos={produtos} setProdutos={setProdutos} />}
      {tab === "promos"    && <TabPromocoes produtos={produtos} />}
      {tab === "stats"     && <TabStats     produtos={produtos} statsVendas={statsVendas} />}

      {/* ── Modal ── */}
      {modal && (
        <ModalPublicar
          item={modal === "novo" ? null : modal.item}
          onClose={() => setModal(null)}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}