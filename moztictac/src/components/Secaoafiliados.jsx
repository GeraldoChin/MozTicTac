import { useState } from "react";

// ─── Ícones SVG inline ────────────────────────────────────────────────────────
const IcoBar     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoLink    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
const IcoSearch  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoWallet  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8L4 7h16l-4-4z"/><circle cx="17" cy="13" r="1"/></svg>;
const IcoShield  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoAward   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoCopy    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
const IcoCheck   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoShare   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IcoChevD   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoChevU   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoInfo    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoAlert   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoSpin    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>;
const IcoTrend   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoX       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ─── Dados ────────────────────────────────────────────────────────────────────
const NIVEIS = {
  bronze: { label: "Bronze", cor: "#CD7F32", bg: "#FFF3E8", icon: "🥉", min: 0,     max: 5000  },
  prata:  { label: "Prata",  cor: "#A8A9AD", bg: "#F4F4F6", icon: "🥈", min: 5000,  max: 20000 },
  ouro:   { label: "Ouro",   cor: "#FFD700", bg: "#FFFBEA", icon: "🥇", min: 20000, max: null  },
};

const AFILIADO = {
  nome: "Ana Machava",
  nivel: "prata",
  totalGanho: 5100,
  cliquesTotal: 231,
  conversoesTotal: 11,
  taxaConversao: 4.76,
  linksAtivos: 2,
  ganhosPendentes: 850,
  ganhosDisponiveis: 4250,
  ganhosPagos: 0,
};

const LINKS_INICIAIS = [
  { id: "L001", produto: "Smartphone Samsung A55", produtoId: "P123", categoria: "Electrónica", comissao: 8, preco: 28500, cliques: 142, conversoes: 7, ganho: 3300, estado: "activo",  imagem: "📱", criadoEm: "12 Mar 2025" },
  { id: "L002", produto: "Mochila Escolar ProMax",  produtoId: "P456", categoria: "Acessórios",  comissao: 12, preco: 2800, cliques: 89,  conversoes: 4, ganho: 1800, estado: "activo",  imagem: "🎒", criadoEm: "28 Mar 2025" },
];

const PRODUTOS_DISPONIVEIS = [
  { id: "P789", nome: "Laptop Lenovo IdeaPad",  categoria: "Electrónica", comissao: 6,  preco: 65000, vendas: 312, imagem: "💻", popular: true  },
  { id: "P012", nome: "Fone Bluetooth JBL",     categoria: "Electrónica", comissao: 10, preco: 4500,  vendas: 189, imagem: "🎧", popular: false },
  { id: "P345", nome: "Bicicleta City Tour",    categoria: "Desporto",    comissao: 9,  preco: 18000, vendas: 54,  imagem: "🚲", popular: false },
  { id: "P678", nome: "Máquina de Costura",     categoria: "Casa",        comissao: 7,  preco: 12000, vendas: 98,  imagem: "🪡", popular: true  },
  { id: "P901", nome: "Cadeira de Escritório",  categoria: "Casa",        comissao: 11, preco: 22000, vendas: 41,  imagem: "🪑", popular: false },
  { id: "P234", nome: "Tênis Nike Air Max",     categoria: "Moda",        comissao: 13, preco: 9500,  vendas: 207, imagem: "👟", popular: true  },
];

const HISTORICO_COMISSOES = [
  { id: "C001", produto: "Samsung A55",  data: "10 Abr 2025", valor: 456, estado: "disponivel" },
  { id: "C002", produto: "Mochila Pro",  data: "08 Abr 2025", valor: 336, estado: "disponivel" },
  { id: "C003", produto: "Samsung A55",  data: "05 Abr 2025", valor: 228, estado: "pago"       },
  { id: "C004", produto: "Samsung A55",  data: "01 Abr 2025", valor: 228, estado: "pendente"   },
  { id: "C005", produto: "Mochila Pro",  data: "28 Mar 2025", valor: 168, estado: "cancelado"  },
  { id: "C006", produto: "Mochila Pro",  data: "20 Mar 2025", valor: 168, estado: "pago"       },
];

const CATEGORIAS = ["Todas", "Electrónica", "Acessórios", "Desporto", "Casa", "Moda"];

const TABS = [
  { id: "visao",     label: "Visão Geral", icon: IcoBar    },
  { id: "links",     label: "Meus Links",  icon: IcoLink   },
  { id: "explorar",  label: "Explorar",    icon: IcoSearch },
  { id: "comissoes", label: "Comissões",   icon: IcoWallet },
  { id: "seguranca", label: "Segurança",   icon: IcoShield },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString("pt-MZ") + " MZN";

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, valor, sub, delta }) {
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

// ─── NivelBar ─────────────────────────────────────────────────────────────────
function NivelBar({ nivel, totalGanho }) {
  const info = NIVEIS[nivel];
  const proximo = nivel === "bronze" ? NIVEIS.prata : nivel === "prata" ? NIVEIS.ouro : null;
  const pct = proximo ? Math.min(100, Math.round(((totalGanho - info.min) / (proximo.min - info.min)) * 100)) : 100;

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 22 }}>{info.icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">Nível {info.label}</p>
            <p className="text-xs text-gray-400">Afiliado MozTicTac</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total acumulado</p>
          <p className="text-sm font-semibold font-mono" style={{ color: info.cor }}>{fmt(totalGanho)}</p>
        </div>
      </div>
      {proximo && (
        <>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: info.cor }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {pct}% completo · faltam {fmt(proximo.min - totalGanho)} para {nivel === "bronze" ? "🥈 Prata" : "🥇 Ouro"}
          </p>
        </>
      )}
      {!proximo && <p className="text-xs text-gray-400 mt-2">Nível máximo atingido 🏆</p>}
    </div>
  );
}

// ─── ABA VISÃO GERAL ──────────────────────────────────────────────────────────
function AbaVisaoGeral() {
  return (
    <div className="space-y-4">
      <NivelBar nivel={AFILIADO.nivel} totalGanho={AFILIADO.totalGanho} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Total Ganho"   valor="5.1k"   sub="MZN"       delta="+18%" />
        <StatCard label="Links Activos" valor={AFILIADO.linksAtivos}   sub="criados" />
        <StatCard label="Cliques"       valor={AFILIADO.cliquesTotal}  sub="total acumulado" />
        <StatCard label="Conversões"    valor={AFILIADO.conversoesTotal} sub="vendas geradas" />
      </div>

      {/* Taxa de conversão */}
      <div className="p-4 bg-white border border-gray-100 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-800">Taxa de Conversão</p>
          <span className="text-lg font-semibold font-mono text-green-600">{AFILIADO.taxaConversao}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, AFILIADO.taxaConversao * 5)}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">{AFILIADO.conversoesTotal} vendas de {AFILIADO.cliquesTotal} cliques</p>
      </div>

      {/* Carteira */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Carteira de Comissões</p>
        </div>
        {[
          { label: "Disponível para saque", valor: AFILIADO.ganhosDisponiveis, cor: "text-green-600" },
          { label: "Pendente",              valor: AFILIADO.ganhosPendentes,   cor: "text-amber-500" },
          { label: "Total pago",            valor: AFILIADO.ganhosPagos,       cor: "text-gray-400"  },
        ].map(({ label, valor, cor }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="text-sm text-gray-600">{label}</p>
            <p className={`text-sm font-semibold font-mono ${cor}`}>{fmt(valor)}</p>
          </div>
        ))}
        <div className="p-3">
          <button className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg border-0 cursor-pointer transition-colors">
            Levantar {fmt(AFILIADO.ganhosDisponiveis)}
          </button>
        </div>
      </div>

      {/* Dica */}
      <div className="flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl items-start">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700"><IcoTrend /></div>
        <div>
          <p className="text-xs font-semibold text-blue-800">Dica de Performance</p>
          <p className="text-xs text-blue-700 mt-0.5">O link do Samsung A55 tem 7 conversões. Partilha mais em grupos de tecnologia para escalar os ganhos!</p>
        </div>
      </div>
    </div>
  );
}

// ─── ABA MEUS LINKS ───────────────────────────────────────────────────────────
function AbaMeusLinks({ links, setLinks }) {
  const [copiado, setCopiado]     = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [pausando, setPausando]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const copiar = (id, link) => {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const toggleEstado = (id) => {
    setPausando(id);
    setTimeout(() => {
      setLinks(prev => prev.map(l => l.id === id ? { ...l, estado: l.estado === "activo" ? "pausado" : "activo" } : l));
      setPausando(null);
    }, 800);
  };

  const removerLink = (id) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    setConfirmDel(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">Os meus links <span className="text-xs text-gray-400 font-normal">({links.length})</span></p>
      </div>

      {links.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Nenhum link activo. Explora produtos para criar o teu primeiro link!</p>
        </div>
      )}

      {links.map(l => {
        const link = `moztictac.mz/p/${l.produtoId}?ref=ANA${l.id}`;
        const aberto = expandido === l.id;
        const comissaoVenda = Math.round(l.preco * l.comissao / 100);
        return (
          <div key={l.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-green-200 transition-all">
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <span style={{ fontSize: 28 }}>{l.imagem}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{l.produto}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l.categoria} · Criado {l.criadoEm}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>{l.estado}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">Comissão {l.comissao}%</span>
                  </div>
                </div>
                {/* Ações */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleEstado(l.id)}
                    disabled={pausando === l.id}
                    title={l.estado === "activo" ? "Pausar link" : "Activar link"}
                    className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors cursor-pointer bg-transparent text-xs font-bold
                      ${l.estado === "activo" ? "border-gray-200 text-gray-400 hover:border-amber-400 hover:text-amber-500" : "border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-600"}`}
                  >
                    {pausando === l.id ? "…" : l.estado === "activo" ? "⏸" : "▶"}
                  </button>
                  <button
                    onClick={() => setConfirmDel(l.id)}
                    title="Remover link"
                    className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent"
                  >
                    <IcoX />
                  </button>
                </div>
              </div>

              {/* Link box */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-gray-500 font-mono flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{link}</p>
                <button onClick={() => copiar(l.id, link)} className="flex items-center gap-1 text-xs font-medium border-0 bg-transparent cursor-pointer flex-shrink-0" style={{ color: copiado === l.id ? "#16a34a" : "#9CA3AF" }}>
                  {copiado === l.id ? <><IcoCheck /> Copiado!</> : <><IcoCopy /> Copiar</>}
                </button>
              </div>

              {/* Stats rápidas */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Cliques",    val: l.cliques },
                  { label: "Vendas",     val: l.conversoes },
                  { label: "Conversão",  val: `${((l.conversoes / l.cliques) * 100).toFixed(1)}%`, green: true },
                  { label: "MZN Ganhos", val: l.ganho.toLocaleString("pt-MZ"), green: true },
                ].map(({ label, val, green }) => (
                  <div key={label}>
                    <p className={`text-sm font-semibold font-mono ${green ? "text-green-600" : "text-gray-900"}`}>{val}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => setExpandido(aberto ? null : l.id)} className="mt-3 flex items-center gap-1 text-xs text-green-600 font-medium border-0 bg-transparent cursor-pointer p-0">
                {aberto ? <><IcoChevU /> Ocultar detalhes</> : <><IcoChevD /> Ver detalhes e partilhar</>}
              </button>
            </div>

            {/* Expandido */}
            {aberto && (
              <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                  {[
                    ["Preço do produto",   fmt(l.preco)],
                    ["Comissão",           `${l.comissao}%`],
                    ["Ganho por venda",    fmt(comissaoVenda)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-semibold text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mb-2 font-medium">Partilhar via</p>
                <div className="flex gap-2">
                  {["WhatsApp", "Facebook", "Telegram"].map(r => (
                    <button key={r} className="flex-1 py-2 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors cursor-pointer flex items-center justify-center gap-1">
                      <IcoShare /> {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal confirmar remoção */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDel(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <p className="text-base font-semibold text-gray-900 mb-2">Remover link?</p>
            <p className="text-sm text-gray-500 mb-5">Este link será removido. Perderás o rastreamento de cliques e conversões associados.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-transparent cursor-pointer hover:border-gray-300">Cancelar</button>
              <button onClick={() => removerLink(confirmDel)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg border-0 cursor-pointer transition-colors">Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ABA EXPLORAR ─────────────────────────────────────────────────────────────
function AbaExplorar({ links, setLinks }) {
  const [busca, setBusca]         = useState("");
  const [cat, setCat]             = useState("Todas");
  const [afiliados, setAfiliados] = useState([]);
  const [gerando, setGerando]     = useState(null);
  const [ordenar, setOrdenar]     = useState("popular");

  const jaAfiliado = (id) => afiliados.includes(id) || links.some(l => l.produtoId === id);

  const tornarAfiliado = (p) => {
    setGerando(p.id);
    setTimeout(() => {
      const novoLink = {
        id: `L${Date.now()}`,
        produto: p.nome,
        produtoId: p.id,
        categoria: p.categoria,
        comissao: p.comissao,
        preco: p.preco,
        cliques: 0,
        conversoes: 0,
        ganho: 0,
        estado: "activo",
        imagem: p.imagem,
        criadoEm: new Date().toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" }),
      };
      setLinks(prev => [novoLink, ...prev]);
      setAfiliados(prev => [...prev, p.id]);
      setGerando(null);
    }, 1200);
  };

  let filtrados = PRODUTOS_DISPONIVEIS.filter(p =>
    (cat === "Todas" || p.categoria === cat) &&
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (ordenar === "comissao") filtrados = [...filtrados].sort((a, b) => b.comissao - a.comissao);
  else if (ordenar === "preco")    filtrados = [...filtrados].sort((a, b) => b.preco - a.preco);
  else                             filtrados = [...filtrados].sort((a, b) => b.vendas - a.vendas);

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <IcoSearch />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Procurar produtos para promover..."
          className="bg-transparent border-none outline-none text-sm flex-1 text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Categorias */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer flex-shrink-0
              ${cat === c ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 hover:border-green-400 bg-transparent"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Ordenar */}
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-400 flex-shrink-0">Ordenar por:</p>
        <div className="flex gap-2">
          {[{ id: "popular", label: "Mais vendidos" }, { id: "comissao", label: "Comissão" }, { id: "preco", label: "Preço" }].map(o => (
            <button key={o.id} onClick={() => setOrdenar(o.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all
                ${ordenar === o.id ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 bg-transparent hover:border-green-400"}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Produtos */}
      <div className="flex flex-col gap-3">
        {filtrados.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Nenhum produto encontrado.</p>}
        {filtrados.map(p => {
          const jA = jaAfiliado(p.id);
          const emGeracao = gerando === p.id;
          return (
            <div key={p.id} className="p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <span style={{ fontSize: 28 }}>{p.imagem}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{p.nome}</p>
                    {p.popular && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">⭐ Popular</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{p.categoria}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-semibold font-mono text-green-600">{p.comissao}%</p>
                  <p className="text-xs text-gray-400">comissão</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                {[
                  { label: "Preço",       val: `${(p.preco / 1000).toFixed(0)}k MZN` },
                  { label: "Ganho/venda", val: `${Math.round(p.preco * p.comissao / 100).toLocaleString("pt-MZ")} MZN` },
                  { label: "Vendas totais", val: p.vendas },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-gray-50 rounded-lg py-2">
                    <p className="text-xs font-semibold font-mono text-gray-800">{val}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
              <button
                disabled={jA || emGeracao}
                onClick={() => tornarAfiliado(p)}
                className={`w-full py-2.5 rounded-lg text-sm font-medium border-0 transition-colors flex items-center justify-center gap-2
                  ${jA ? "bg-green-50 text-green-700 cursor-default" : emGeracao ? "bg-gray-100 text-gray-400 cursor-default" : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"}`}
              >
                {emGeracao ? <><IcoSpin /> A gerar link...</> :
                 jA ? <><IcoCheck /> Já és afiliado</> :
                 <><IcoLink /> Tornar-me afiliado</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ABA COMISSÕES ────────────────────────────────────────────────────────────
function AbaComissoes() {
  const [filtro, setFiltro] = useState("todos");
  const [modalSaque, setModalSaque] = useState(false);
  const [metodo, setMetodo] = useState("mpesa");
  const [numero, setNumero] = useState("");
  const [sacando, setSacando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const filtrados = HISTORICO_COMISSOES.filter(c => filtro === "todos" || c.estado === filtro);

  const estadoCor = {
    disponivel: "bg-green-100 text-green-800",
    pendente:   "bg-amber-100 text-amber-800",
    pago:       "bg-gray-100 text-gray-500",
    cancelado:  "bg-red-100 text-red-700",
  };

  const handleSaque = () => {
    if (!numero) return;
    setSacando(true);
    setTimeout(() => {
      setSacando(false);
      setSucesso(true);
      setTimeout(() => { setSucesso(false); setModalSaque(false); setNumero(""); }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Cartão principal */}
      <div className="p-5 bg-green-600 rounded-xl text-white">
        <p className="text-xs opacity-75">Disponível para saque</p>
        <p className="text-3xl font-semibold font-mono mt-1">{AFILIADO.ganhosDisponiveis.toLocaleString("pt-MZ")} <span className="text-base font-normal opacity-75">MZN</span></p>
        <div className="flex gap-6 mt-3">
          <div>
            <p className="text-xs opacity-70">Pendente</p>
            <p className="text-sm font-semibold font-mono">{fmt(AFILIADO.ganhosPendentes)}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Total pago</p>
            <p className="text-sm font-semibold font-mono">{fmt(AFILIADO.ganhosPagos)}</p>
          </div>
        </div>
        <button onClick={() => setModalSaque(true)} className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium border border-white/30 bg-white/15 hover:bg-white/25 text-white cursor-pointer transition-colors">
          Solicitar saque →
        </button>
      </div>

      {/* Info mínimo */}
      <div className="flex gap-2 items-start p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <div style={{ flexShrink: 0, marginTop: 1, color: "#B45309" }}><IcoInfo /></div>
        <p className="text-xs text-amber-800">Saque mínimo: <strong>500 MZN</strong> · Taxa de levantamento: <strong>2%</strong> · Processamento em 1-2 dias úteis</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "todos",      label: "Todos" },
          { id: "disponivel", label: "Disponível" },
          { id: "pendente",   label: "Pendente" },
          { id: "pago",       label: "Pago" },
          { id: "cancelado",  label: "Cancelado" },
        ].map(f => (
          <button key={f.id} onClick={() => setFiltro(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${filtro === f.id ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 bg-transparent hover:border-green-400"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Histórico */}
      <div className="flex flex-col gap-2">
        {filtrados.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Sem comissões nesta categoria.</p>}
        {filtrados.map(c => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">{c.produto}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.data}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold font-mono ${c.estado === "cancelado" ? "text-red-500" : "text-green-600"}`}>
                {c.estado === "cancelado" ? "−" : "+"}{fmt(c.valor)}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${estadoCor[c.estado]}`}>
                {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Saque */}
      {modalSaque && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalSaque(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            {sucesso ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-base font-semibold text-green-700">Saque solicitado com sucesso!</p>
                <p className="text-sm text-gray-500 mt-1">Processamento em 1-2 dias úteis.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-base font-semibold text-gray-900">Solicitar Saque</p>
                  <button onClick={() => setModalSaque(false)} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"><IcoX /></button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg mb-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Valor disponível</span>
                  <span className="text-sm font-semibold font-mono text-green-600">{fmt(AFILIADO.ganhosDisponiveis)}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Método de pagamento</label>
                    <div className="flex gap-2">
                      {[{ id: "mpesa", label: "M-Pesa" }, { id: "emola", label: "e-Mola" }, { id: "banco", label: "Banco" }].map(m => (
                        <button key={m.id} onClick={() => setMetodo(m.id)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer
                            ${metodo === m.id ? "border-green-500 text-green-700 bg-green-50" : "border-gray-200 text-gray-500 bg-transparent"}`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      {metodo === "banco" ? "Número da conta" : "Número de telefone"}
                    </label>
                    <input value={numero} onChange={e => setNumero(e.target.value)}
                      placeholder={metodo === "banco" ? "0000 0000 0000 0000" : "84 XXX XXXX"}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Valor solicitado</span><span className="font-mono">{fmt(AFILIADO.ganhosDisponiveis)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Taxa (2%)</span><span className="font-mono text-red-500">−{fmt(Math.round(AFILIADO.ganhosDisponiveis * 0.02))}</span></div>
                    <div className="flex justify-between pt-1.5 border-t border-gray-200 font-semibold"><span>Você recebe</span><span className="font-mono text-green-600">{fmt(Math.round(AFILIADO.ganhosDisponiveis * 0.98))}</span></div>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => setModalSaque(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-transparent cursor-pointer">Cancelar</button>
                  <button onClick={handleSaque} disabled={sacando || !numero}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-0 transition-colors flex items-center justify-center gap-2
                      ${sacando || !numero ? "bg-gray-200 text-gray-400 cursor-default" : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"}`}>
                    {sacando ? <><IcoSpin /> A processar...</> : "Confirmar saque"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ABA SEGURANÇA ────────────────────────────────────────────────────────────
function AbaSeguranca() {
  const REGRAS = [
    { icon: "🚫", titulo: "Auto-referência proibida",      desc: "Não podes usar o teu próprio link para comprar produtos." },
    { icon: "🤖", titulo: "Sem tráfego artificial",        desc: "Cliques falsos ou bots resultam em banimento imediato." },
    { icon: "🔒", titulo: "Links validados no servidor",   desc: "Todos os links são verificados no backend. Falsificações são detectadas." },
    { icon: "👁",  titulo: "Monitorização 24/7",            desc: "O sistema analisa padrões suspeitos em tempo real." },
    { icon: "⚖️", titulo: "Comissões por confirmação",     desc: "Comissão só é creditada após confirmação definitiva da compra." },
    { icon: "🔄", titulo: "Cancelamentos anulam comissão", desc: "Se a compra for cancelada, a comissão é automaticamente removida." },
  ];

  const PENALIDADES = [
    { acao: "Comprar com próprio link",   penalidade: "Comissão cancelada"   },
    { acao: "Cliques falsos detectados",  penalidade: "Conta suspensa"       },
    { acao: "Fraude confirmada",          penalidade: "Banimento permanente" },
    { acao: "Métodos ilegais",            penalidade: "Acção legal"          },
  ];

  return (
    <div className="space-y-4">
      {/* Aviso */}
      <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl items-start">
        <div className="flex-shrink-0 mt-0.5" style={{ color: "#DC2626" }}><IcoAlert /></div>
        <div>
          <p className="text-sm font-semibold text-red-700">Política de Uso Justo</p>
          <p className="text-xs text-red-700 mt-1 leading-relaxed">O sistema de afiliados é monitorizado 24h. Fraudes resultam em banimento e perda de todas as comissões acumuladas.</p>
        </div>
      </div>

      {/* Regras */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Regras do Programa</p>
        </div>
        {REGRAS.map((r, i) => (
          <div key={i} className={`flex gap-3 px-4 py-3 ${i < REGRAS.length - 1 ? "border-b border-gray-50" : ""}`}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{r.titulo}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Penalidades */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-red-50 border-b border-red-100">
          <p className="text-sm font-semibold text-red-700">Tabela de Penalidades</p>
        </div>
        {PENALIDADES.map((p, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < PENALIDADES.length - 1 ? "border-b border-gray-50" : ""}`}>
            <p className="text-sm text-gray-700">{p.acao}</p>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg">{p.penalidade}</span>
          </div>
        ))}
      </div>

      {/* Estado da conta */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0" style={{ color: "#16a34a" }}>
          <IcoShield />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">Conta em Bom Estado</p>
          <p className="text-xs text-green-700 mt-0.5">Nenhuma violação detectada. Continua assim! ✅</p>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function SecaoAfiliados() {
  const [tab, setTab]     = useState("visao");
  const [links, setLinks] = useState(LINKS_INICIAIS);
  const nivel = NIVEIS[AFILIADO.nivel];

  const conteudo = {
    visao:     <AbaVisaoGeral />,
    links:     <AbaMeusLinks links={links} setLinks={setLinks} />,
    explorar:  <AbaExplorar links={links} setLinks={setLinks} />,
    comissoes: <AbaComissoes />,
    seguranca: <AbaSeguranca />,
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AM</div>
          <div>
            <div className="text-base font-semibold text-gray-900">Área de Afiliado</div>
            <div className="text-xs text-gray-400">{AFILIADO.nome} · Afiliado MozTicTac</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border" style={{ background: nivel.bg, borderColor: `${nivel.cor}40` }}>
          <span style={{ fontSize: 16 }}>{nivel.icon}</span>
          <span className="text-xs font-semibold" style={{ color: nivel.cor }}>{nivel.label}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Total Ganho"    valor="5.1k"  sub="MZN" delta="+18%" />
        <StatCard label="Links Activos"  valor={links.filter(l => l.estado === "activo").length} sub="activos" />
        <StatCard label="Cliques Total"  valor={AFILIADO.cliquesTotal} sub="acumulado" />
        <StatCard label="Taxa Conversão" valor={`${AFILIADO.taxaConversao}%`} sub="das visitas" />
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
      {conteudo[tab]}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        input, select, textarea { font-family: inherit; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default SecaoAfiliados;