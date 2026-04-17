import { useState } from "react";

// ─── Ícones SVG inline ────────────────────────────────────────────────────────
const IcoBag      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IcoTruck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcoChat     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IcoStar     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoSearch   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoAlert    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoCheck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoX        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoRefresh  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>;
const IcoLock     = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoWallet   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 002 2h14v-4"/><circle cx="17" cy="16" r="1" fill="currentColor"/></svg>;
const IcoChevron  = ({ up }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>;
const IcoFilter   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoMap      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoHistory  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 112.83-5.67"/><polyline points="3 3 3 9 9 9"/></svg>;
const IcoNotif    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;

// ─── Dados ────────────────────────────────────────────────────────────────────
const PEDIDOS = [
  { id: "#MTT-0091", nome: "Ventilador de Mesa Philips", vendedor: "ElectroShop Maputo", preco: 2850, estado: "entregue", data: "12 Abr 2025", categoria: "Electrónica", qtd: 1, taxas: 142, metodo: "M-Pesa", rastreio: "MZT9921AA", avaliado: false },
  { id: "#MTT-0088", nome: "Curso de Programação Web", vendedor: "TechLearn MZ", preco: 1500, estado: "entregue", data: "8 Abr 2025", categoria: "Digital", qtd: 1, taxas: 75, metodo: "Carteira", rastreio: null, avaliado: true },
  { id: "#MTT-0085", nome: "Sapatos Sociais Couro", vendedor: "Moda Beira Store", preco: 3200, estado: "enviado", data: "5 Abr 2025", categoria: "Moda", qtd: 1, taxas: 160, metodo: "E-Mola", rastreio: "MZT8834BC", avaliado: false },
  { id: "#MTT-0082", nome: "Arroz Carolino 10kg × 2", vendedor: "Mercado Central Online", preco: 1400, estado: "pendente", data: "3 Abr 2025", categoria: "Alimentação", qtd: 2, taxas: 70, metodo: "mKesh", rastreio: null, avaliado: false },
  { id: "#MTT-0079", nome: "Serviço de Limpeza Residencial", vendedor: "CleanPro Beira", preco: 2000, estado: "em disputa", data: "28 Mar 2025", categoria: "Serviço", qtd: 1, taxas: 100, metodo: "M-Pesa", rastreio: null, avaliado: false },
  { id: "#MTT-0076", nome: "Carregador Solar 20W", vendedor: "SolarTech MZ", preco: 1850, estado: "enviado", data: "25 Mar 2025", categoria: "Electrónica", qtd: 1, taxas: 92, metodo: "Carteira", rastreio: "MZT7701CD", avaliado: false },
  { id: "#MTT-0071", nome: "Tênis Nike Air Max", vendedor: "Sportzone MZ", preco: 5200, estado: "pago", data: "20 Mar 2025", categoria: "Moda", qtd: 1, taxas: 260, metodo: "M-Pesa", rastreio: null, avaliado: false },
];

const NOTIFICACOES = [
  { id: 1, texto: "Sapatos Sociais Couro foi enviado — rastreio MZT8834BC", tipo: "info", hora: "há 2h", lida: false },
  { id: 2, texto: "Pedido #MTT-0076 está a caminho. Confirme o recebimento.", tipo: "info", hora: "há 5h", lida: false },
  { id: 3, texto: "Disputa #MTT-0079 em análise pelo suporte MozTicTac.", tipo: "alerta", hora: "há 1 dia", lida: true },
  { id: 4, texto: "Pagamento M-Pesa confirmado para o pedido #MTT-0082.", tipo: "sucesso", hora: "há 2 dias", lida: true },
];

const STEPS = ["Pedido", "Pago", "Processando", "Enviado", "Entregue"];
const STEP_MAP = { pendente: 0, pago: 1, "em processamento": 2, enviado: 3, entregue: 4, "em disputa": 2 };

const STATUS_STYLE = {
  pendente:       { bg: "bg-blue-100",   text: "text-blue-800",   dot: "bg-blue-400"   },
  pago:           { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-400" },
  enviado:        { bg: "bg-amber-100",  text: "text-amber-800",  dot: "bg-amber-400"  },
  entregue:       { bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-500"  },
  "concluído":    { bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-500"  },
  "em disputa":   { bg: "bg-red-100",    text: "text-red-800",    dot: "bg-red-400"    },
  "em processamento": { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400"  },
};

const CAT_ICON = { Electrónica: "⚡", Digital: "💻", Moda: "👗", Alimentação: "🛒", Serviço: "🛠️" };

const TABS = [
  { id: "pedidos",     label: "Pedidos",       icon: IcoBag },
  { id: "rastreio",    label: "Rastreio",       icon: IcoTruck },
  { id: "disputas",    label: "Disputas",       icon: IcoAlert },
  { id: "avaliacoes",  label: "Avaliações",     icon: IcoStar },
  { id: "notificacoes",label: "Notificações",   icon: IcoNotif },
];

const fmt = (n) => Number(n).toLocaleString("pt-MZ") + " MZN";

// ─── Componentes base ─────────────────────────────────────────────────────────
function StatusBadge({ estado }) {
  const s = STATUS_STYLE[estado] || STATUS_STYLE["pendente"];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

function StatCard({ label, valor, sub, cor }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-xl font-semibold font-mono tracking-tight ${cor || "text-gray-900"}`}>{valor}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
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

function IconBtn({ onClick, danger, title, children }) {
  return (
    <button onClick={onClick} title={title}
      className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors cursor-pointer bg-transparent
        ${danger ? "border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500" : "border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-600"}`}>
      {children}
    </button>
  );
}

// ─── Barra de progresso do pedido ─────────────────────────────────────────────
function ProgressoPedido({ estado }) {
  const idx = STEP_MAP[estado] ?? 0;
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

// ─── Detalhe expandido do pedido ──────────────────────────────────────────────
function DetalhePedido({ pedido, onConfirmar, onDisputa, onAvaliar, onChat }) {
  const Row = ({ label, val, verde }) => (
    <div className="flex justify-between py-1.5 border-b border-gray-50 text-xs">
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium ${verde ? "text-green-600" : "text-gray-800"}`}>{val}</span>
    </div>
  );

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <Row label="Nº pedido"    val={pedido.id} />
      <Row label="Data"         val={pedido.data} />
      <Row label="Quantidade"   val={`${pedido.qtd} unid.`} />
      <Row label="Método"       val={pedido.metodo} />
      <Row label="Taxas incl."  val={`${pedido.taxas.toLocaleString("pt-MZ")} MZN`} />
      {pedido.rastreio && <Row label="Rastreio" val={pedido.rastreio} verde />}
      <div className="flex justify-between py-1.5 text-xs">
        <span className="text-gray-400">Total pago</span>
        <span className="font-bold text-green-600 font-mono">{fmt(pedido.preco)}</span>
      </div>

      {/* Escrow info */}
      <div className="mt-3 flex items-center gap-1.5 p-2 bg-green-50 rounded-lg">
        <IcoLock style={{ color: "#1a7a4a", flexShrink: 0 }} />
        <span className="text-xs text-green-700">Pagamento em escrow — liberado após confirmação de entrega</span>
      </div>

      {/* Acções */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {pedido.estado === "enviado" && (
          <>
            <button onClick={() => onConfirmar(pedido.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg border-0 cursor-pointer transition-colors">
              <IcoCheck /> Confirmar recebimento
            </button>
            <button className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-500 text-xs rounded-lg bg-transparent cursor-pointer hover:border-gray-300">
              <IcoTruck /> Rastrear
            </button>
          </>
        )}
        {pedido.estado === "entregue" && !pedido.avaliado && (
          <button onClick={() => onAvaliar(pedido.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg border-0 cursor-pointer transition-colors">
            <IcoStar /> Avaliar produto e vendedor
          </button>
        )}
        {pedido.estado === "entregue" && (
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-500 text-xs rounded-lg bg-transparent cursor-pointer hover:border-gray-300">
            <IcoRefresh /> Comprar novamente
          </button>
        )}
        {pedido.estado === "pendente" && (
          <>
            <button onClick={() => onChat(pedido)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg bg-transparent cursor-pointer hover:border-green-400 hover:text-green-600 transition-colors">
              <IcoChat /> Chat com vendedor
            </button>
            <button
              className="flex items-center gap-1 px-3 py-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
              <IcoX /> Cancelar
            </button>
          </>
        )}
        {pedido.estado === "em disputa" && (
          <>
            <button onClick={() => onDisputa(pedido)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
              <IcoAlert /> Ver disputa
            </button>
            <button className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-500 text-xs rounded-lg bg-transparent cursor-pointer hover:border-gray-300">
              <IcoChat /> Chat suporte
            </button>
          </>
        )}
        {(pedido.estado === "pago" || pedido.estado === "em processamento") && (
          <button onClick={() => onChat(pedido)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg bg-transparent cursor-pointer hover:border-green-400 hover:text-green-600 transition-colors">
            <IcoChat /> Chat com vendedor
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Pedidos ─────────────────────────────────────────────────────────────
function TabPedidos({ pedidos, setPedidos, onAvaliar, onDisputa, onChat }) {
  const [filtro, setFiltro]     = useState("todos");
  const [pesquisa, setPesquisa] = useState("");
  const [expandido, setExpandido] = useState(null);
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroMetodo, setFiltroMetodo] = useState("todos");

  const FILTROS = ["todos", "pendente", "pago", "enviado", "entregue", "em disputa"];
  const METODOS = ["todos", "M-Pesa", "mKesh", "E-Mola", "Carteira"];

  const lista = pedidos.filter(p => {
    const pF = filtro === "todos" || p.estado === filtro;
    const pM = filtroMetodo === "todos" || p.metodo === filtroMetodo;
    const termo = pesquisa.toLowerCase();
    const pP = !termo || p.nome.toLowerCase().includes(termo) || p.vendedor.toLowerCase().includes(termo) || p.id.toLowerCase().includes(termo);
    return pF && pM && pP;
  });

  const totalGasto   = pedidos.reduce((a, p) => a + p.preco, 0);
  const entregues    = pedidos.filter(p => p.estado === "entregue").length;
  const emTransito   = pedidos.filter(p => p.estado === "enviado").length;

  function confirmarRecebimento(id) {
    if (window.confirm("Confirmas que recebeste o produto? Esta acção é irreversível.")) {
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: "entregue" } : p));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Os meus pedidos <span className="font-normal text-gray-400 text-xs">({lista.length})</span>
        </p>
        <button onClick={() => setShowFiltros(!showFiltros)}
          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs cursor-pointer transition-all bg-transparent
            ${showFiltros ? "border-green-500 text-green-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
          <IcoFilter /> Filtros
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard label="Total gasto"  valor={`${Math.round(totalGasto/1000)}k MZN`} sub="acumulado" />
        <StatCard label="Entregues"    valor={entregues}  sub="pedidos" cor="text-green-600" />
        <StatCard label="Em trânsito"  valor={emTransito} sub="pedidos" cor="text-amber-600" />
      </div>

      {/* Filtros avançados */}
      {showFiltros && (
        <div className="p-3 bg-gray-50 rounded-xl mb-3 space-y-2.5 border border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Método de pagamento</p>
            <div className="flex gap-1.5 flex-wrap">
              {METODOS.map(m => (
                <button key={m} onClick={() => setFiltroMetodo(m)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all
                    ${filtroMetodo === m ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 bg-white hover:border-green-400"}`}>
                  {m === "todos" ? "Todos" : m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtros de estado */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {FILTROS.map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${filtro === f ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 hover:border-green-400 bg-transparent"}`}>
            {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Pesquisa */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IcoSearch /></div>
        <input value={pesquisa} onChange={e => setPesquisa(e.target.value)} placeholder="Pesquisar por nome, vendedor ou nº pedido..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-transparent" />
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {lista.length === 0 && <div className="text-center text-sm text-gray-400 py-12">Nenhum pedido encontrado.</div>}
        {lista.map(p => {
          const isExp = expandido === p.id;
          return (
            <div key={p.id} onClick={() => setExpandido(isExp ? null : p.id)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${isExp ? "border-green-300" : "border-gray-100 hover:border-green-200"}`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  {CAT_ICON[p.categoria] || "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.vendedor}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge estado={p.estado} />
                    {p.avaliado && <span className="text-xs text-amber-500">★ Avaliado</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold font-mono text-gray-900">{p.preco.toLocaleString("pt-MZ")}</p>
                  <p className="text-xs text-gray-400">MZN</p>
                  <div className="mt-1 flex justify-end text-gray-400"><IcoChevron up={isExp} /></div>
                </div>
              </div>
              {p.estado !== "em disputa" && <ProgressoPedido estado={p.estado} />}
              {isExp && (
                <DetalhePedido pedido={p}
                  onConfirmar={confirmarRecebimento}
                  onDisputa={onDisputa}
                  onAvaliar={onAvaliar}
                  onChat={onChat}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Rastreio ────────────────────────────────────────────────────────────
function TabRastreio({ pedidos }) {
  const comRastreio = pedidos.filter(p => p.rastreio);
  const [codigo, setCodigo] = useState("");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Rastreio de encomendas</p>
      </div>
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IcoSearch /></div>
        <input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Inserir código de rastreio..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-transparent" />
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Encomendas activas</p>
      <div className="flex flex-col gap-3">
        {comRastreio.length === 0 && <div className="text-center text-sm text-gray-400 py-12">Nenhuma encomenda com rastreio.</div>}
        {comRastreio.map(p => (
          <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{p.nome}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.vendedor}</p>
              </div>
              <StatusBadge estado={p.estado} />
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg mb-3">
              <IcoTruck style={{ color: "#1a7a4a", flexShrink: 0 }} />
              <div>
                <p className="text-xs text-gray-500">Código de rastreio</p>
                <p className="text-sm font-bold text-green-700 font-mono">{p.rastreio}</p>
              </div>
            </div>
            <ProgressoPedido estado={p.estado} />
            <div className="flex gap-2 mt-3">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-green-500 text-green-600 text-xs font-medium rounded-lg bg-transparent cursor-pointer hover:bg-green-50 transition-colors">
                <IcoMap /> Ver localização
              </button>
              {p.estado === "enviado" && (
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-xs font-medium rounded-lg border-0 cursor-pointer hover:bg-green-700 transition-colors">
                  <IcoCheck /> Confirmar recebimento
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Disputas ────────────────────────────────────────────────────────────
function TabDisputas({ pedidos, setPedidos }) {
  const [showForm, setShowForm] = useState(false);
  const [pedidoSel, setPedidoSel] = useState("");
  const [motivo, setMotivo] = useState("");
  const [descricao, setDescricao] = useState("");

  const disputas = pedidos.filter(p => p.estado === "em disputa");
  const elegiveis = pedidos.filter(p => ["enviado", "entregue", "pago"].includes(p.estado));

  const MOTIVOS = ["Produto não entregue", "Produto diferente do anunciado", "Serviço não cumprido", "Produto com defeito", "Outro"];

  function abrirDisputa() {
    if (!pedidoSel || !motivo) { alert("Seleciona um pedido e o motivo."); return; }
    setPedidos(prev => prev.map(p => p.id === pedidoSel ? { ...p, estado: "em disputa" } : p));
    setShowForm(false); setPedidoSel(""); setMotivo(""); setDescricao("");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Disputas e reclamações</p>
        <button onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border-0 cursor-pointer transition-all
            ${showForm ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
          <IcoAlert /> Abrir disputa
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
              {elegiveis.map(p => <option key={p.id} value={p.id}>{p.id} — {p.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Motivo *</label>
            <select value={motivo} onChange={e => setMotivo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
              <option value="">Selecionar motivo...</option>
              {MOTIVOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Descrição</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} placeholder="Descreve o problema em detalhe..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none bg-white" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 bg-transparent cursor-pointer">Cancelar</button>
            <button onClick={abrirDisputa} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium border-0 cursor-pointer hover:bg-red-700 transition-colors">Submeter disputa</button>
          </div>
        </div>
      )}

      {/* Aviso escrow */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4 flex gap-2 items-start">
        <IcoLock style={{ color: "#2255b0", flexShrink: 0, marginTop: 2 }} />
        <div>
          <p className="text-xs font-semibold text-blue-800">Pagamento bloqueado durante disputa</p>
          <p className="text-xs text-blue-700 mt-0.5">O valor permanece em escrow até o admin tomar uma decisão. Pode resultar em reembolso total, parcial ou pagamento ao vendedor.</p>
        </div>
      </div>

      {disputas.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-12 bg-gray-50 rounded-xl">Nenhuma disputa activa.</div>
      ) : disputas.map(p => (
        <div key={p.id} className="bg-white border border-red-100 rounded-xl p-4 mb-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400 font-mono">{p.id} · {p.data}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{p.nome}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.vendedor}</p>
            </div>
            <StatusBadge estado={p.estado} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-2">
            <IcoAlert style={{ flexShrink: 0 }} />
            Em análise pelo suporte MozTicTac
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 border border-gray-200 text-gray-500 text-xs rounded-lg bg-transparent cursor-pointer hover:border-gray-300">Chat suporte</button>
            <button className="flex-1 py-2 border border-green-500 text-green-600 text-xs rounded-lg bg-transparent cursor-pointer hover:bg-green-50 transition-colors">Ver detalhes</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Avaliações ──────────────────────────────────────────────────────────
function TabAvaliacoes({ pedidos, setPedidos }) {
  const [modalPedido, setModalPedido] = useState(null);
  const [stars, setStars] = useState(5);
  const [comentario, setComentario] = useState("");

  const paraAvaliar = pedidos.filter(p => p.estado === "entregue" && !p.avaliado);
  const avaliados   = pedidos.filter(p => p.avaliado);

  function submitAvaliacao() {
    if (!comentario.trim()) { alert("Escreve um comentário."); return; }
    setPedidos(prev => prev.map(p => p.id === modalPedido.id ? { ...p, avaliado: true } : p));
    setModalPedido(null); setStars(5); setComentario("");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Avaliações</p>
        {paraAvaliar.length > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{paraAvaliar.length} pendente{paraAvaliar.length > 1 ? "s" : ""}</span>
        )}
      </div>

      {paraAvaliar.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Por avaliar</p>
          <div className="flex flex-col gap-2 mb-5">
            {paraAvaliar.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-white border border-amber-100 flex items-center justify-center text-lg flex-shrink-0">
                  {CAT_ICON[p.categoria] || "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-500">{p.vendedor}</p>
                </div>
                <button onClick={() => setModalPedido(p)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg border-0 cursor-pointer hover:bg-amber-600 transition-colors flex-shrink-0">
                  <IcoStar /> Avaliar
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
                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                  {CAT_ICON[p.categoria] || "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-500">{p.vendedor}</p>
                </div>
                <div className="text-amber-400 text-sm flex-shrink-0">★★★★★</div>
              </div>
            ))}
          </div>
        </>
      )}

      {paraAvaliar.length === 0 && avaliados.length === 0 && (
        <div className="text-center text-sm text-gray-400 py-12 bg-gray-50 rounded-xl">Nenhuma avaliação ainda.</div>
      )}

      {/* Modal avaliação */}
      {modalPedido && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModalPedido(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Avaliar compra</h3>
              <button onClick={() => setModalPedido(null)} className="text-gray-400 text-xl bg-transparent border-0 cursor-pointer leading-none">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-4 truncate">{modalPedido.nome}</p>

            {/* Estrelas */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setStars(s)}
                  className={`text-2xl border-0 bg-transparent cursor-pointer transition-transform hover:scale-110 ${s <= stars ? "text-amber-400" : "text-gray-200"}`}>★</button>
              ))}
            </div>

            <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={4}
              placeholder="Partilha a tua experiência com este produto e vendedor..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none mb-4" />

            <div className="flex gap-2">
              <button onClick={() => setModalPedido(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-transparent cursor-pointer">Cancelar</button>
              <button onClick={submitAvaliacao} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg border-0 cursor-pointer transition-colors">Publicar avaliação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Notificações ────────────────────────────────────────────────────────
function TabNotificacoes() {
  const [notifs, setNotifs] = useState(NOTIFICACOES);

  const NTF_STYLE = {
    info:    { bg: "bg-blue-50",   border: "border-blue-100",  icon: "text-blue-500",  dot: "bg-blue-400"   },
    alerta:  { bg: "bg-red-50",    border: "border-red-100",   icon: "text-red-500",   dot: "bg-red-400"    },
    sucesso: { bg: "bg-green-50",  border: "border-green-100", icon: "text-green-600", dot: "bg-green-500"  },
  };

  const naoLidas = notifs.filter(n => !n.lida).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Notificações {naoLidas > 0 && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{naoLidas}</span>}
        </p>
        <button onClick={() => setNotifs(prev => prev.map(n => ({ ...n, lida: true })))}
          className="text-xs text-green-600 hover:underline bg-transparent border-0 cursor-pointer">
          Marcar todas como lidas
        </button>
      </div>

      {/* Preferências */}
      <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">Preferências de notificação</p>
        {[
          { label: "Pedido confirmado",      sub: "Quando um pedido é criado" },
          { label: "Produto enviado",         sub: "Quando o vendedor envia" },
          { label: "Mensagens",               sub: "Novas mensagens no chat" },
          { label: "Disputas e reembolsos",   sub: "Actualizações de disputas" },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-xs font-medium text-gray-700">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
            <Toggle value={true} onChange={() => {}} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {notifs.map(n => {
          const s = NTF_STYLE[n.tipo] || NTF_STYLE.info;
          return (
            <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, lida: true } : x))}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${n.lida ? "bg-white border-gray-100 opacity-60" : `${s.bg} ${s.border}`}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.lida ? "bg-gray-200" : s.dot}`} />
              <div className="flex-1">
                <p className="text-xs text-gray-700 leading-relaxed">{n.texto}</p>
                <p className="text-xs text-gray-400 mt-1">{n.hora}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Modal: Chat com vendedor ─────────────────────────────────────────────────
function ModalChat({ pedido, onClose }) {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([
    { de: "vendedor", texto: "Olá! Em que posso ajudar?", hora: "10:30" },
  ]);

  function enviar() {
    if (!msg.trim()) return;
    setMsgs(prev => [...prev, { de: "eu", texto: msg.trim(), hora: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }) }]);
    setMsg("");
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl flex flex-col" style={{ maxHeight: "85vh" }}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">{pedido.vendedor}</p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{pedido.nome}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-xl bg-transparent border-0 cursor-pointer">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.de === "eu" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs ${m.de === "eu" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                <p>{m.texto}</p>
                <p className={`text-[10px] mt-1 ${m.de === "eu" ? "text-green-200" : "text-gray-400"}`}>{m.hora}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100 flex gap-2">
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && enviar()}
            placeholder="Escreve uma mensagem..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-transparent" />
          <button onClick={enviar} className="px-3 py-2 bg-green-600 text-white rounded-lg border-0 cursor-pointer hover:bg-green-700 transition-colors text-sm">
            ↑
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 pb-2">Histórico protegido · Não partilhes contactos externos</p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function SecaoCompras() {
  const [tab, setTab] = useState("pedidos");
  const [pedidos, setPedidos] = useState(PEDIDOS);
  const [chatPedido, setChatPedido] = useState(null);
  const [disputaPedido, setDisputaPedido] = useState(null);
  const [avaliarPedido, setAvaliarPedido] = useState(null);

  const naoLidas = NOTIFICACOES.filter(n => !n.lida).length;

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AM</div>
          <div>
            <div className="text-base font-semibold text-gray-900">Minhas Compras</div>
            <div className="text-xs text-gray-400">Ana Machava · ana.machava@email.com</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Actualizado agora
        </div>
      </div>

      {/* Stats globais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total gasto</div>
          <div className="text-xl font-semibold font-mono tracking-tight">{Math.round(pedidos.reduce((a,p)=>a+p.preco,0)/1000)}k</div>
          <div className="text-xs text-gray-400 mt-1">MZN acumulado</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pedidos</div>
          <div className="text-xl font-semibold font-mono tracking-tight">{pedidos.length}</div>
          <div className="text-xs text-gray-400 mt-1">total</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Entregues</div>
          <div className="text-xl font-semibold font-mono tracking-tight text-green-600">{pedidos.filter(p=>p.estado==="entregue").length}</div>
          <div className="text-xs text-gray-400 mt-1">concluídos</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Em trânsito</div>
          <div className="text-xl font-semibold font-mono tracking-tight text-amber-600">{pedidos.filter(p=>p.estado==="enviado").length}</div>
          <div className="text-xs text-gray-400 mt-1">pedidos</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => {
          const Icon = t.icon;
          const isNotif = t.id === "notificacoes" && naoLidas > 0;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 relative
                ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 bg-transparent"}`}>
              <Icon />
              <span className="hidden sm:inline">{t.label}</span>
              {isNotif && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {tab === "pedidos"      && <TabPedidos pedidos={pedidos} setPedidos={setPedidos} onAvaliar={id => {}} onDisputa={setDisputaPedido} onChat={setChatPedido} />}
      {tab === "rastreio"     && <TabRastreio pedidos={pedidos} />}
      {tab === "disputas"     && <TabDisputas pedidos={pedidos} setPedidos={setPedidos} />}
      {tab === "avaliacoes"   && <TabAvaliacoes pedidos={pedidos} setPedidos={setPedidos} />}
      {tab === "notificacoes" && <TabNotificacoes />}

      {/* Modal Chat */}
      {chatPedido && <ModalChat pedido={chatPedido} onClose={() => setChatPedido(null)} />}
    </div>
  );
}