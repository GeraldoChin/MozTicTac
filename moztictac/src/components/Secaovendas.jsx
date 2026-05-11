// ─────────────────────────────────────────────
// MOZTICTAC — SECÇÃO DE VENDAS (conectado ao backend)
// ─────────────────────────────────────────────
import { useState, useEffect } from "react";
import { api, mapearProduto } from "./api";

// ─── Ícones SVG inline ────────────────────────────────────────────────────────
const IcoHome = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
  </svg>
);
const IcoBag = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IcoUsers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IcoStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcoBar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IcoEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcoPause = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const IcoPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IcoTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcoLock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IcoInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IcoTrend = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IcoProduto = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
  </svg>
);
const IcoServico = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
  </svg>
);

// ─── Dados estáticos (pedidos — virão do backend futuramente) ─────────────────
const PEDIDOS = [
  { id: "#4821", produto: "Smartphone Samsung A54", cliente: "João Cossa", valor: 18500, estado: "pago", pct: 40, data: "16 Abr" },
  { id: "#4807", produto: "Capas de telemóvel (atacado)", cliente: "Fátima Bila", valor: 7000, estado: "enviado", pct: 70, data: "15 Abr" },
  { id: "#4790", produto: "Colchão King Size", cliente: "Maria Sitoe", valor: 32000, estado: "entregue", pct: 100, data: "13 Abr" },
  { id: "#4780", produto: "Reparação de electrodomésticos", cliente: "Pedro Nhane", valor: 2500, estado: "pendente", pct: 10, data: "12 Abr" },
  { id: "#4761", produto: "Capas de telemóvel (atacado)", cliente: "Carla Mussa", valor: 3500, estado: "concluído", pct: 100, data: "10 Abr" },
  { id: "#4744", produto: "Smartphone Samsung A54", cliente: "Hélio Filipe", valor: 18500, estado: "em disputa", pct: 60, data: "8 Abr" },
];

const PROMO_PLANS = [
  { nome: "Básico", duracao: "3 dias", preco: 250, desc: "Destaque no feed geral" },
  { nome: "Standard", duracao: "7 dias", preco: 500, desc: "Destaque + notificações", popular: true },
  { nome: "Premium", duracao: "30 dias", preco: 1500, desc: "Topo do feed + banner" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => Number(n).toLocaleString("pt-MZ") + " MZN";
const STATUS_CLS: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  pago: "bg-blue-100 text-blue-800",
  enviado: "bg-amber-100 text-amber-800",
  entregue: "bg-green-100 text-green-800",
  "concluído": "bg-green-100 text-green-800",
  "em disputa": "bg-red-100 text-red-800",
};

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full border-0 transition-colors flex-shrink-0 cursor-pointer ${value ? "bg-green-600" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

// ─── IconBtn ──────────────────────────────────────────────────────────────────
function IconBtn({ onClick, danger, title, children }: any) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors cursor-pointer bg-transparent
        ${danger ? "border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500" : "border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-600"}`}
    >
      {children}
    </button>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, valor, sub, delta }: any) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 relative overflow-hidden">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-xl font-semibold text-gray-900 font-mono tracking-tight">{valor}</div>
      <div className="text-xs text-gray-400 mt-1">
        {sub} {delta && <span className="text-green-600 font-medium">{delta}</span>}
      </div>
    </div>
  );
}

// ─── Tab: Produtos ────────────────────────────────────────────────────────────
function TabProdutos({ produtos, setProdutos, onPublicar, onEditar }: any) {
  const [filtro, setFiltro] = useState("todos");
  const [carregando, setCarregando] = useState(false);

  const FILTROS = ["todos", "activo", "pausado", "produto", "servico"];

  const lista = filtro === "todos"
    ? produtos
    : produtos.filter((p: any) => p.estado === filtro || p.tipo === filtro);

  async function toggleEstado(id: string, estadoActual: string) {
    setCarregando(true);
    try {
      if (estadoActual === "activo") {
        await api.pausarProduto(id);
        setProdutos((prev: any[]) => prev.map(p => p.id === id ? { ...p, estado: "pausado" } : p));
      } else {
        await api.reativarProduto(id);
        // Volta a PENDENTE_APROVACAO no backend — mostramos como "pendente" no frontend
        setProdutos((prev: any[]) => prev.map(p => p.id === id ? { ...p, estado: "pendente_aprovacao" } : p));
      }
    } catch (e: any) {
      alert("Erro ao alterar estado: " + e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function eliminar(id: string) {
    if (!window.confirm("Tens a certeza que queres eliminar este anúncio?")) return;
    setCarregando(true);
    try {
      await api.eliminarProduto(id);
      setProdutos((prev: any[]) => prev.filter(p => p.id !== id));
    } catch (e: any) {
      alert("Erro ao eliminar: " + e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Os meus anúncios <span className="font-normal text-gray-400 text-xs">({lista.length})</span>
        </p>
        <button
          onClick={onPublicar}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0"
        >
          <IcoPlus /> Publicar
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
        {lista.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-12">Nenhum anúncio encontrado.</div>
        )}
        {lista.map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition-all">
            <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
              {p.tipo === "produto" ? <IcoProduto /> : <IcoServico />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {p.vendas ?? p.totalVendas ?? 0} vendas · {p.tipo === "produto" ? `Stock: ${p.stock ?? 0}` : `Serviço`}
              </p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                  {p.estado}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                  {p.tipo === "produto" ? "Produto" : "Serviço"}
                </span>
                {(p.afiliados ?? p.aceitaAfiliados) && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
                    Afiliados {p.comissao ?? p.comissaoAfiliado}%
                  </span>
                )}
                {p.atacado && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">Atacado</span>
                )}
                {(p.entrega ?? p.temEntrega) && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">Entrega</span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0 hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 font-mono">{Number(p.preco).toLocaleString("pt-MZ")} MZN</p>
              <p className="text-xs text-gray-400">preço base</p>
              <p className="text-xs text-green-600 mt-0.5">recebe {Math.round(p.preco * 0.895).toLocaleString("pt-MZ")}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <IconBtn title="Editar" onClick={() => onEditar(p)}><IcoEdit /></IconBtn>
              <IconBtn
                title={p.estado === "activo" ? "Pausar" : "Activar"}
                onClick={() => toggleEstado(p.id, p.estado)}
              >
                {p.estado === "activo" ? <IcoPause /> : <IcoPlay />}
              </IconBtn>
              <IconBtn danger title="Eliminar" onClick={() => eliminar(p.id)}><IcoTrash /></IconBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Pedidos ─────────────────────────────────────────────────────────────
function TabPedidos() {
  const [filtro, setFiltro] = useState("todos");
  const FILTROS = ["todos", "pendente", "pago", "enviado", "concluído"];
  const lista = filtro === "todos" ? PEDIDOS : PEDIDOS.filter(p => p.estado === filtro);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Pedidos recebidos</p>
        <button className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:border-gray-300 bg-transparent cursor-pointer">
          Exportar CSV
        </button>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTROS.map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${filtro === f ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 hover:border-green-400 bg-transparent"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {lista.map(p => (
          <div key={p.id} className="p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs text-gray-400 font-mono">{p.id} · {p.cliente} · {p.data}</div>
                <div className="text-sm font-semibold text-gray-900 mt-0.5">{p.produto}</div>
                <div className="text-xs text-gray-500 mt-0.5 font-mono">{fmt(p.valor)}</div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CLS[p.estado] ?? "bg-gray-100 text-gray-500"}`}>
                {p.estado}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
              <IcoLock /> Escrow: {p.pct}% liberado
            </div>
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${p.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl flex gap-2.5 items-start">
        <IcoInfo />
        <div>
          <div className="text-xs font-semibold text-green-800">Sistema Escrow activo</div>
          <div className="text-xs text-green-700 mt-0.5">O dinheiro é retido até o comprador confirmar a entrega. Protege ambas as partes.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Afiliados ───────────────────────────────────────────────────────────
function TabAfiliados({ produtos, setProdutos }: any) {
  const totalGerado = produtos
    .filter((p: any) => p.afiliados ?? p.aceitaAfiliados)
    .reduce((acc: number, p: any) => acc + (p.vendas ?? 0) * p.preco * ((p.comissao ?? p.comissaoAfiliado ?? 0) / 100), 0);

  async function toggleAff(id: string, aceitaAtual: boolean) {
    try {
      await api.atualizarProduto(id, { aceitaAfiliados: !aceitaAtual });
      setProdutos((prev: any[]) => prev.map(p => p.id === id ? { ...p, afiliados: !aceitaAtual, aceitaAfiliados: !aceitaAtual } : p));
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  }

  async function updateComissao(id: string, val: number) {
    try {
      await api.atualizarProduto(id, { comissaoAfiliado: val });
      setProdutos((prev: any[]) => prev.map(p => p.id === id ? { ...p, comissao: val, comissaoAfiliado: val } : p));
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Gestão de afiliados</p>
        <span className="text-xs text-gray-400">{Math.round(totalGerado).toLocaleString("pt-MZ")} MZN gerados</span>
      </div>
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4 flex gap-2 items-start">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2255b0" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <p className="text-xs text-blue-800">Afiliados promovem os seus produtos e recebem comissão apenas quando há venda. Você só paga quando vende.</p>
      </div>
      <div className="flex flex-col gap-2">
        {produtos.map((p: any) => {
          const aff = p.afiliados ?? p.aceitaAfiliados ?? false;
          const com = p.comissao ?? p.comissaoAfiliado ?? 5;
          return (
            <div key={p.id} className="p-4 bg-white border border-gray-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                  {p.tipo === "produto" ? <IcoProduto /> : <IcoServico />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {aff ? `Comissão: ${com}% · activo` : "Afiliados desactivados"}
                  </p>
                </div>
                {aff && (
                  <div className="text-right mr-3 hidden sm:block flex-shrink-0">
                    <p className="text-sm font-semibold text-green-600 font-mono">
                      {Math.round((p.vendas ?? 0) * p.preco * com / 100).toLocaleString("pt-MZ")}
                    </p>
                    <p className="text-xs text-gray-400">MZN gerado</p>
                  </div>
                )}
                <Toggle value={aff} onChange={() => toggleAff(p.id, aff)} />
              </div>
              {aff && (
                <div className="mt-3 flex items-center gap-3 px-1 bg-gray-50 rounded-lg p-2">
                  <span className="text-xs text-gray-500 w-24 flex-shrink-0">Comissão: {com}%</span>
                  <input
                    type="range" min="1" max="30" step="1" value={com}
                    onChange={e => updateComissao(p.id, Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Promoções ───────────────────────────────────────────────────────────
function TabPromocoes({ produtos }: any) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-1">Promoções e destaque</p>
      </div>
      <div className="p-4 bg-white border border-gray-100 rounded-xl mb-4">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span className="text-sm font-semibold text-gray-800">Como funcionam as promoções?</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Pague uma taxa e o seu anúncio ganha prioridade no feed. Mais visibilidade significa mais cliques e mais vendas.
        </p>
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
        {produtos.filter((p: any) => p.estado === "activo").map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
              {p.tipo === "produto" ? <IcoProduto /> : <IcoServico />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
              <p className="text-xs text-gray-400">{p.vendas ?? 0} vendas · {fmt(p.preco)}</p>
            </div>
            <button className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg border-0 cursor-pointer hover:bg-amber-600 transition-colors flex-shrink-0">
              Promover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Estatísticas ────────────────────────────────────────────────────────
function TabStats({ produtos }: any) {
  const top = [...produtos].sort((a: any, b: any) => (b.vendas ?? 0) - (a.vendas ?? 0)).slice(0, 4);
  const max = top[0]?.vendas || 1;
  const RANK_CLS = ["bg-green-500", "bg-blue-500", "bg-gray-400", "bg-gray-300"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Desempenho detalhado</p>
        <div className="flex gap-1.5">
          <button className="px-2.5 py-1 text-xs border border-green-600 bg-green-600 text-white rounded-full cursor-pointer">Este mês</button>
          <button className="px-2.5 py-1 text-xs border border-gray-200 text-gray-500 rounded-full bg-transparent cursor-pointer">90 dias</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Taxa plataforma</div>
          <div className="text-lg font-semibold font-mono">10.5%</div>
          <div className="text-xs text-gray-400">sobre cada venda</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Comissões pagas</div>
          <div className="text-lg font-semibold font-mono">7.8k</div>
          <div className="text-xs text-gray-400">MZN este mês</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Cliques afiliados</div>
          <div className="text-lg font-semibold font-mono">244</div>
          <div className="text-xs text-gray-400">total acumulado</div>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Mais vendidos</p>
      <div className="flex flex-col gap-3 mb-5">
        {top.map((p: any, i: number) => (
          <div key={p.id} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${RANK_CLS[i]}`}>{i + 1}</div>
            <p className="text-sm font-medium text-gray-800 flex-1 truncate min-w-0">{p.nome}</p>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round((p.vendas ?? 0) / max * 100)}%` }} />
            </div>
            <span className="text-sm font-semibold text-gray-700 flex-shrink-0 font-mono w-8 text-right">{p.vendas ?? 0}</span>
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Sugestões de melhoria</p>
      <div className="flex flex-col gap-2">
        <div className="flex gap-3 p-3 rounded-xl border border-green-100 bg-green-50 items-start">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"><IcoTrend /></div>
          <div>
            <div className="text-xs font-semibold text-green-800">Produto com mais vendas: {top[0]?.nome ?? "—"}</div>
            <div className="text-xs text-green-700 mt-0.5">Considere aumentar o stock e activar promoção para maximizar receita.</div>
          </div>
        </div>
        <div className="flex gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50 items-start">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><IcoUsers /></div>
          <div>
            <div className="text-xs font-semibold text-blue-800">Produtos sem afiliados activos</div>
            <div className="text-xs text-blue-700 mt-0.5">Activar afiliados pode aumentar vendas para produtos de alto valor.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Publicar/Editar ────────────────────────────────────────────────────
function ModalPublicar({ item, onClose, onSalvar }: any) {
  const [tipo, setTipo] = useState(item?.tipo || "produto");
  const [nome, setNome] = useState(item?.nome || "");
  const [desc, setDesc] = useState(item?.descricao || "");
  const [cat, setCat] = useState(item?.cat || item?.categoria || "");
  const [preco, setPreco] = useState(item?.preco || "");
  const [stock, setStock] = useState(item?.stock || "");
  const [afiliados, setAfiliados] = useState(item?.afiliados ?? item?.aceitaAfiliados ?? false);
  const [comissao, setComissao] = useState(item?.comissao ?? item?.comissaoAfiliado ?? 5);
  const [entrega, setEntrega] = useState(item?.entrega ?? item?.temEntrega ?? false);
  const [atacado, setAtacado] = useState(item?.atacado ?? false);
  const [imagens, setImagens] = useState<FileList | null>(null);
  const [enviando, setEnviando] = useState(false);

  const taxa = preco ? Math.round(Number(preco) * 0.105) : 0;
  const liquido = preco ? Math.round(Number(preco) - taxa) : 0;

  async function handleSalvar() {
    if (!nome.trim() || !preco) { alert("Preenche o nome e o preço."); return; }
    setEnviando(true);
    try {
      await onSalvar({
        id: item?.id,
        nome: nome.trim(),
        descricao: desc,
        tipo,
        preco: Number(preco),
        stock: tipo === "produto" ? Number(stock) || 0 : undefined,
        aceitaAfiliados: afiliados,
        comissaoAfiliado: afiliados ? Number(comissao) : 0,
        temEntrega: entrega,
        atacado,
        categoria: cat || "Outro",
        imagens,
      });
      onClose();
    } catch (e: any) {
      alert("Erro ao guardar: " + e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
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
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Descreva com clareza..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Categoria *</label>
              <select value={cat} onChange={e => setCat(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                <option value="">Selecionar categoria...</option>
                {["Electrónica","Moda e Vestuário","Casa e Decoração","Serviços Profissionais","Educação e Formação","Saúde e Beleza","Alimentação","Veículos","Outro"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 block mb-1">Preço (MZN) *</label>
                <input type="number" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0.00"
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

            {/* Imagens — só para produtos novos */}
            {tipo === "produto" && (
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Imagens (máx. 12)</label>
                <input
                  type="file" accept="image/*" multiple
                  onChange={e => setImagens(e.target.files)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
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

// ─── Componente principal ─────────────────────────────────────────────────────
const TABS = [
  { id: "produtos",   label: "Produtos",     icon: IcoHome },
  { id: "pedidos",    label: "Pedidos",      icon: IcoBag },
  { id: "afiliados",  label: "Afiliados",    icon: IcoUsers },
  { id: "promos",     label: "Promoções",    icon: IcoStar },
  { id: "stats",      label: "Estatísticas", icon: IcoBar },
];

export function SecaoVendas() {
  const [tab, setTab] = useState("produtos");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "novo" | { item: any }>(null);

  // ── Carrega produtos do backend ao montar ──────────────────────
  useEffect(() => {
    api.meusProdutos()
      .then(res => {
        const lista = res.dados?.produtos ?? [];
        setProdutos(lista.map(mapearProduto));
      })
      .catch(e => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  // ── Salvar: criar ou editar ────────────────────────────────────
  async function handleSalvar(dadosModal: any) {
    const { id, imagens, ...resto } = dadosModal;

    if (id) {
      // EDITAR — PUT sem imagens
      const res = await api.atualizarProduto(id, resto);
      setProdutos(prev => prev.map(p => p.id === id ? mapearProduto(res.dados) : p));
    } else {
      // CRIAR — POST com FormData (para o multer receber as imagens)
      const form = new FormData();
      Object.entries(resto).forEach(([k, v]) => {
        if (v !== null && v !== undefined) form.append(k, String(v));
      });
      if (imagens) {
        Array.from(imagens as FileList).forEach((f: any) => form.append("imagens", f));
      }
      const res = await api.criarProduto(form);
      setProdutos(prev => [mapearProduto(res.dados), ...prev]);
    }
  }

  // ── Estados de loading e erro ──────────────────────────────────
  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        A carregar os seus produtos...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-red-500 text-sm font-medium">Erro ao carregar produtos</p>
        <p className="text-gray-400 text-xs">{erro}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg border-0 cursor-pointer hover:bg-green-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AM</div>
          <div>
            <div className="text-base font-semibold text-gray-900">Minhas Vendas</div>
            <div className="text-xs text-gray-400">Ana Machava · ana.machava@email.com</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Actualizado agora
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Vendas"          valor="47"     sub="este mês"   delta="+12%" />
        <StatCard label="Receita bruta"   valor="128.5k" sub="MZN" />
        <StatCard label="Receita líquida" valor="112.3k" sub="após taxas" />
        <StatCard label="Conversão"       valor="6.4%"   sub="dos cliques" />
      </div>

      {/* Tabs */}
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

      {/* Conteúdo */}
      {tab === "produtos"  && (
        <TabProdutos
          produtos={produtos}
          setProdutos={setProdutos}
          onPublicar={() => setModal("novo")}
          onEditar={(item: any) => setModal({ item })}
        />
      )}
      {tab === "pedidos"   && <TabPedidos />}
      {tab === "afiliados" && <TabAfiliados produtos={produtos} setProdutos={setProdutos} />}
      {tab === "promos"    && <TabPromocoes produtos={produtos} />}
      {tab === "stats"     && <TabStats produtos={produtos} />}

      {/* Modal */}
      {modal && (
        <ModalPublicar
          item={modal === "novo" ? null : (modal as any).item}
          onClose={() => setModal(null)}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}