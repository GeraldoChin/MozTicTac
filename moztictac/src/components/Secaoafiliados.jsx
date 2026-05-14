// src/components/SecaoAfiliados.jsx
// ─────────────────────────────────────────────────────────────────
// Integração completa com:
//   contaControlador    → GET /conta/resumo (cabeçalho, nível, stats)
//   contaControlador    → GET /conta/afiliados/resumo (links, comissões, stats agregados)
//   contaControlador    → GET /conta/afiliados/produtos-disponiveis (aba Explorar)
//   afiliadoControlador → GET /afiliados/meus, /afiliados/comissoes, /afiliados/estatisticas
//   rankingControlador  → GET /afiliados/ranking/minha-posicao
//   afiliadoControlador → POST /afiliados/:produtoId/link (gerar link)
//   afiliadoControlador → PUT  /produtos/:id (toggle afiliados — via produtoControlador)
//   carteiraControlador → POST /carteira/saque-otp + POST /carteira/saque
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";

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
  resumo:              ()              => req("/conta/resumo"),
  resumoAfiliado:      ()              => req("/conta/afiliados/resumo"),
  produtosDisponiveis: (pagina = 1, categoriaId, busca) => {
    const p = new URLSearchParams({ pagina });
    if (categoriaId) p.set("categoriaId", categoriaId);
    if (busca)       p.set("busca", busca);
    return req(`/conta/afiliados/produtos-disponiveis?${p}`);
  },
};

const apiAfiliados = {
  gerarLink:   (produtoId)            => req(`/afiliados/${produtoId}/link`, { method: "POST" }),
  comissoes:   (pagina = 1, estado)   => req(`/afiliados/comissoes?pagina=${pagina}${estado && estado !== "todos" ? `&estado=${estado}` : ""}`),
  estatisticas:()                     => req("/afiliados/estatisticas"),
  minhaPosicao:()                     => req("/afiliados/ranking/minha-posicao"),
};

const apiCarteira = {
  solicitarOtp: ()                    => req("/carteira/saque/otp", { method: "POST" }),
  saldo:        ()                    => req("/carteira/saldo"),
  saque:        (dados)               => req("/carteira/saque", { method: "POST", body: JSON.stringify(dados) }),
};

// ── Constantes ────────────────────────────────────────────────────
const NIVEIS = {
  bronze: { label: "Bronze", cor: "#CD7F32", bg: "#FFF3E8", icon: "🥉", min: 0,     max: 5000  },
  prata:  { label: "Prata",  cor: "#A8A9AD", bg: "#F4F4F6", icon: "🥈", min: 5000,  max: 20000 },
  ouro:   { label: "Ouro",   cor: "#FFD700", bg: "#FFFBEA", icon: "🥇", min: 20000, max: null  },
};

const TABS = [
  { id: "visao",     label: "Visão Geral", icon: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { id: "links",     label: "Meus Links",  icon: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> },
  { id: "explorar",  label: "Explorar",    icon: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { id: "comissoes", label: "Comissões",   icon: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8L4 7h16l-4-4z"/><circle cx="17" cy="13" r="1"/></svg> },
  { id: "seguranca", label: "Segurança",   icon: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
];

const ESTADO_COR_COMISSAO = {
  PENDENTE:     "bg-amber-100 text-amber-800",
  EM_VALIDACAO: "bg-blue-100 text-blue-700",
  DISPONIVEL:   "bg-green-100 text-green-800",
  PAGA:         "bg-gray-100 text-gray-500",
  CANCELADA:    "bg-red-100 text-red-700",
  // fallback lowercase
  disponivel:   "bg-green-100 text-green-800",
  pendente:     "bg-amber-100 text-amber-800",
  pago:         "bg-gray-100 text-gray-500",
  cancelado:    "bg-red-100 text-red-700",
};

const fmt     = (n) => Number(n || 0).toLocaleString("pt-MZ") + " MZN";
const fmtK    = (n) => { const v = Number(n || 0); return v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v); };
const fmtData = (d) => d ? new Date(d).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" }) : "—";

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
          className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg border-0 cursor-pointer hover:bg-green-700">
          Tentar novamente
        </button>
      )}
    </div>
  );
}

function Vazio({ texto }) {
  return <div className="text-center text-sm text-gray-400 py-12">{texto}</div>;
}

function Paginacao({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onChange(pagina - 1)} disabled={pagina <= 1}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-green-400 cursor-pointer bg-transparent text-sm">‹</button>
      <span className="text-xs text-gray-500 font-mono">{pagina} / {totalPaginas}</span>
      <button onClick={() => onChange(pagina + 1)} disabled={pagina >= totalPaginas}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-green-400 cursor-pointer bg-transparent text-sm">›</button>
    </div>
  );
}

function StatCard({ label, valor, sub, delta }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-xl font-semibold text-gray-900 font-mono tracking-tight">{valor}</div>
      <div className="text-xs text-gray-400 mt-1">
        {sub}{delta && <span className="text-green-600 font-medium ml-1">{delta}</span>}
      </div>
    </div>
  );
}

// ── Barra de nível ────────────────────────────────────────────────
function NivelBar({ nivel, totalGanho, posicao, proximoNivel }) {
  const info    = NIVEIS[nivel] ?? NIVEIS.bronze;
  const proximo = proximoNivel
    ? NIVEIS[proximoNivel.nome?.toLowerCase()] ?? null
    : nivel === "bronze" ? NIVEIS.prata : nivel === "prata" ? NIVEIS.ouro : null;

  const pct = proximo
    ? Math.min(100, Math.round(((totalGanho - info.min) / (proximo.min - info.min)) * 100))
    : 100;

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 22 }}>{info.icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">Nível {info.label}</p>
            <p className="text-xs text-gray-400">
              {posicao ? `#${posicao} no ranking · ` : ""}Afiliado MozTicTac
            </p>
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
            {pct}% completo · faltam {fmt(proximoNivel?.faltaParaProximo ?? (proximo.min - totalGanho))} para {proximo.icon} {proximo.label}
          </p>
        </>
      )}
      {!proximo && <p className="text-xs text-gray-400 mt-2">Nível máximo atingido 🏆</p>}
    </div>
  );
}

// ── ABA: Visão Geral ──────────────────────────────────────────────
function AbaVisaoGeral({ resumo, posicao, onSolicitarSaque }) {
  if (!resumo) return <div className="flex justify-center py-12"><Spinner /></div>;

  const { nivel, totalGanho, totalCliques, totalConversoes, taxaConversao,
          linksAtivos, ganhosDisponiveis, ganhosPendentes, links, comissoes } = resumo;

  return (
    <div className="space-y-4">
      <NivelBar
        nivel={nivel}
        totalGanho={totalGanho}
        posicao={posicao?.posicao}
        proximoNivel={posicao?.proximoNivel}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Total Ganho"   valor={fmtK(totalGanho)}    sub="MZN" />
        <StatCard label="Links Activos" valor={linksAtivos}         sub="criados" />
        <StatCard label="Cliques"       valor={totalCliques}        sub="total acumulado" />
        <StatCard label="Conversões"    valor={totalConversoes}     sub="vendas geradas" />
      </div>

      {/* Taxa de conversão */}
      <div className="p-4 bg-white border border-gray-100 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-800">Taxa de Conversão</p>
          <span className="text-lg font-semibold font-mono text-green-600">{taxaConversao}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, taxaConversao * 5)}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {totalConversoes} vendas de {totalCliques} cliques
        </p>
      </div>

      {/* Carteira */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Carteira de Comissões</p>
        </div>
        {[
          { label: "Disponível para saque", valor: ganhosDisponiveis, cor: "text-green-600" },
          { label: "Pendente",              valor: ganhosPendentes,   cor: "text-amber-500" },
        ].map(({ label, valor, cor }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="text-sm text-gray-600">{label}</p>
            <p className={`text-sm font-semibold font-mono ${cor}`}>{fmt(valor)}</p>
          </div>
        ))}
        <div className="p-3">
          <button onClick={onSolicitarSaque}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg border-0 cursor-pointer transition-colors">
            Levantar {fmt(ganhosDisponiveis)}
          </button>
        </div>
      </div>

      {/* Top produtos */}
      {links?.length > 0 && (
        <div className="flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl items-start">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-800">Dica de Performance</p>
            <p className="text-xs text-blue-700 mt-0.5">
              O link "{links[0]?.produto?.nome ?? links[0]?.codigoAfiliado}" tem {links[0]?.conversoes ?? 0} conversões. Partilha mais para escalar os ganhos!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABA: Meus Links ───────────────────────────────────────────────
function AbaMeusLinks({ links, carregando, erro, onRetry }) {
  const [copiado, setCopiado]       = useState(null);
  const [expandido, setExpandido]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  function copiar(codigo) {
    const link = `${window.location.origin}/r/${codigo}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  }

  if (carregando) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (erro)       return <ErroBloco mensagem={erro} onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">
          Os meus links <span className="text-xs text-gray-400 font-normal">({links.length})</span>
        </p>
      </div>

      {links.length === 0 && (
        <Vazio texto="Nenhum link activo. Explora produtos para criar o teu primeiro link!" />
      )}

      {links.map(l => {
        const codigo        = l.codigoAfiliado;
        const linkUrl       = `${window.location.origin}/r/${codigo}`;
        const aberto        = expandido === l.id;
        const preco         = Number(l.produto?.preco ?? 0);
        const comissaoPct   = Number(l.comissao ?? 0);
        const comissaoVenda = Math.round(preco * comissaoPct / 100);
        const cliques       = l.cliques ?? 0;
        const conversoes    = l.conversoes ?? 0;
        const ganho         = Number(l.ganho ?? 0);
        const imagem        = l.produto?.imagem;
        const nomeProduto   = l.produto?.nome ?? "Produto";
        const categoria     = l.produto?.categoria ?? "—";
        const ativo         = l.ativo !== false;

        return (
          <div key={l.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-green-200 transition-all">
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                {/* Imagem / emoji */}
                <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {imagem
                    ? <img src={imagem} alt="" className="w-full h-full object-cover" />
                    : <span style={{ fontSize: 24 }}>📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{nomeProduto}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{categoria} · Criado {fmtData(l.criadoEm)}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                      {ativo ? "activo" : "pausado"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
                      Comissão {comissaoPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Link box */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-gray-500 font-mono flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{linkUrl}</p>
                <button onClick={() => copiar(codigo)}
                  className="flex items-center gap-1 text-xs font-medium border-0 bg-transparent cursor-pointer flex-shrink-0"
                  style={{ color: copiado === codigo ? "#16a34a" : "#9CA3AF" }}>
                  {copiado === codigo
                    ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copiado!</>
                    : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copiar</>}
                </button>
              </div>

              {/* Stats rápidas */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Cliques",    val: cliques,                                                 green: false },
                  { label: "Vendas",     val: conversoes,                                              green: false },
                  { label: "Conversão",  val: cliques > 0 ? `${((conversoes / cliques) * 100).toFixed(1)}%` : "0%", green: true },
                  { label: "MZN Ganhos", val: ganho.toLocaleString("pt-MZ"),                           green: true },
                ].map(({ label, val, green }) => (
                  <div key={label}>
                    <p className={`text-sm font-semibold font-mono ${green ? "text-green-600" : "text-gray-900"}`}>{val}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => setExpandido(aberto ? null : l.id)}
                className="mt-3 flex items-center gap-1 text-xs text-green-600 font-medium border-0 bg-transparent cursor-pointer p-0">
                {aberto
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg> Ocultar detalhes</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg> Ver detalhes e partilhar</>}
              </button>
            </div>

            {/* Expandido */}
            {aberto && (
              <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                {preco > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                    {[
                      ["Preço do produto",   fmt(preco)],
                      ["Comissão",           `${comissaoPct}%`],
                      ["Ganho por venda",    fmt(comissaoVenda)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-gray-400">{k}</span>
                        <span className="font-semibold text-gray-800">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mb-2 font-medium">Partilhar via</p>
                <div className="flex gap-2">
                  {[
                    { label: "WhatsApp", url: `https://wa.me/?text=Vê este produto: ${encodeURIComponent(linkUrl)}` },
                    { label: "Facebook", url: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkUrl)}` },
                    { label: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(linkUrl)}` },
                  ].map(r => (
                    <a key={r.label} href={r.url} target="_blank" rel="noreferrer"
                      className="flex-1 py-2 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors cursor-pointer flex items-center justify-center gap-1 no-underline">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                      {r.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── ABA: Explorar ─────────────────────────────────────────────────
function AbaExplorar({ linksExistentes, onLinkGerado }) {
  const [busca, setBusca]           = useState("");
  const [buscaDebounced, setBuscaD] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina]         = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState(null);
  const [gerando, setGerando]       = useState(null);
  const [ordenar, setOrdenar]       = useState("popular");

  // Debounce busca
  useEffect(() => {
    const t = setTimeout(() => { setBuscaD(busca); setPagina(1); }, 400);
    return () => clearTimeout(t);
  }, [busca]);

  // Carregar categorias
  useEffect(() => {
    fetch(`${BASE_URL}/publico/categorias`)
      .then(r => r.json())
      .then(d => setCategorias(d.success ? d.data : d.dados ?? []))
      .catch(() => {});
  }, []);

  // Carregar produtos disponíveis
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiConta.produtosDisponiveis(pagina, categoriaId || undefined, buscaDebounced || undefined);
      const d = res.success ? res.data : res.dados ?? {};
      setProdutos(d.produtos ?? []);
      setTotal(d.total ?? 0);
      setTotalPaginas(d.totalPaginas ?? 1);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [pagina, categoriaId, buscaDebounced]);

  useEffect(() => { carregar(); }, [carregar]);

  const jaAfiliado = (id) => linksExistentes.some(l => l.produto?.id === id || l.produtoId === id);

  async function tornarAfiliado(p) {
    setGerando(p.id);
    try {
      const res = await apiAfiliados.gerarLink(p.id);
      const link = res.sucesso ? res.dados : res.data ?? {};
      onLinkGerado(link);
    } catch (e) {
      alert("Erro ao gerar link: " + e.message);
    } finally {
      setGerando(null);
    }
  }

  // Ordenação local
  const produtosOrdenados = [...produtos].sort((a, b) => {
    if (ordenar === "comissao") return Number(b.comissao ?? 0) - Number(a.comissao ?? 0);
    if (ordenar === "preco")    return Number(b.preco ?? 0)    - Number(a.preco ?? 0);
    return (b.vendas ?? b.totalVendas ?? 0) - (a.vendas ?? a.totalVendas ?? 0);
  });

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Procurar produtos para promover..."
          className="bg-transparent border-none outline-none text-sm flex-1 text-gray-800 placeholder-gray-400" />
      </div>

      {/* Categorias reais */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => { setCategoriaId(""); setPagina(1); }}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer flex-shrink-0
            ${!categoriaId ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 hover:border-green-400 bg-transparent"}`}>
          Todas
        </button>
        {categorias.map(c => (
          <button key={c.id} onClick={() => { setCategoriaId(c.id); setPagina(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer flex-shrink-0
              ${categoriaId === c.id ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 hover:border-green-400 bg-transparent"}`}>
            {c.icone && <span className="mr-1">{c.icone}</span>}{c.nome}
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

      {/* Lista */}
      {carregando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : erro ? (
        <ErroBloco mensagem={erro} onRetry={carregar} />
      ) : produtosOrdenados.length === 0 ? (
        <Vazio texto="Nenhum produto disponível para afiliação." />
      ) : (
        <div className="flex flex-col gap-3">
          {produtosOrdenados.map(p => {
            const jA        = jaAfiliado(p.id);
            const emGeracao = gerando === p.id;
            const preco     = Number(p.preco ?? 0);
            const comissao  = Number(p.comissao ?? 0);
            const vendas    = p.vendas ?? p.totalVendas ?? 0;
            const imagem    = p.imagem ?? p.imagens?.[0];
            const popular   = p.popular ?? p.destaque ?? false;

            return (
              <div key={p.id} className="p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imagem
                      ? <img src={imagem} alt="" className="w-full h-full object-cover" />
                      : <span style={{ fontSize: 24 }}>📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.nome}</p>
                      {popular && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">⭐ Popular</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{p.categoria}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-semibold font-mono text-green-600">{comissao}%</p>
                    <p className="text-xs text-gray-400">comissão</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  {[
                    { label: "Preço",         val: `${fmtK(preco)} MZN` },
                    { label: "Ganho/venda",   val: `${Math.round(preco * comissao / 100).toLocaleString("pt-MZ")} MZN` },
                    { label: "Vendas totais", val: vendas },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-gray-50 rounded-lg py-2">
                      <p className="text-xs font-semibold font-mono text-gray-800">{val}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>

                <button disabled={jA || emGeracao} onClick={() => tornarAfiliado(p)}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium border-0 transition-colors flex items-center justify-center gap-2
                    ${jA         ? "bg-green-50 text-green-700 cursor-default"
                    : emGeracao  ? "bg-gray-100 text-gray-400 cursor-default"
                    :              "bg-green-600 hover:bg-green-700 text-white cursor-pointer"}`}>
                  {emGeracao
                    ? <><Spinner small /> A gerar link...</>
                    : jA
                    ? <>✓ Já és afiliado</>
                    : <>🔗 Tornar-me afiliado</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onChange={p => { setPagina(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
    </div>
  );
}

// ── ABA: Comissões ────────────────────────────────────────────────
function AbaComissoes({ ganhosDisponiveis, ganhosPendentes }) {
  const [filtro, setFiltro]         = useState("todos");
  const [pagina, setPagina]         = useState(1);
  const [comissoes, setComissoes]   = useState([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState(null);
  const [modalSaque, setModalSaque] = useState(false);
  const [metodo, setMetodo]         = useState("MPESA");
  const [numero, setNumero]         = useState("");
  const [codigoOtp, setCodigoOtp]   = useState("");
  const [etapa, setEtapa]           = useState("form"); // "form" | "otp" | "sucesso"
  const [processando, setProcessando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiAfiliados.comissoes(pagina, filtro === "todos" ? undefined : filtro);
      const d = res.sucesso ? res.dados : res.data ?? {};
      setComissoes(d.comissoes ?? []);
      setTotalPaginas(d.totalPaginas ?? 1);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [pagina, filtro]);

  useEffect(() => { carregar(); }, [carregar]);

  async function solicitarOtp() {
    if (!numero) { alert("Preenche o número/conta."); return; }
    setProcessando(true);
    try {
      await apiCarteira.solicitarOtp();
      setEtapa("otp");
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setProcessando(false);
    }
  }

  async function confirmarSaque() {
    if (!codigoOtp || codigoOtp.length < 4) { alert("Introduz o código OTP."); return; }
    setProcessando(true);
    try {
      await apiCarteira.saque({
        valor:          ganhosDisponiveis,
        metodoPagamento: metodo,
        destinatario:   numero,
        codigoOtp,
      });
      setEtapa("sucesso");
      setTimeout(() => { setEtapa("form"); setModalSaque(false); setNumero(""); setCodigoOtp(""); }, 2500);
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setProcessando(false);
    }
  }

  const FILTROS = [
    { id: "todos",        label: "Todos"      },
    { id: "DISPONIVEL",   label: "Disponível" },
    { id: "PENDENTE",     label: "Pendente"   },
    { id: "PAGA",         label: "Pago"       },
    { id: "CANCELADA",    label: "Cancelado"  },
  ];

  return (
    <div className="space-y-4">
      {/* Cartão principal */}
      <div className="p-5 bg-green-600 rounded-xl text-white">
        <p className="text-xs opacity-75">Disponível para saque</p>
        <p className="text-3xl font-semibold font-mono mt-1">
          {Number(ganhosDisponiveis || 0).toLocaleString("pt-MZ")}
          <span className="text-base font-normal opacity-75 ml-1">MZN</span>
        </p>
        <div className="flex gap-6 mt-3">
          <div>
            <p className="text-xs opacity-70">Pendente</p>
            <p className="text-sm font-semibold font-mono">{fmt(ganhosPendentes)}</p>
          </div>
        </div>
        <button onClick={() => setModalSaque(true)}
          className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium border border-white/30 bg-white/15 hover:bg-white/25 text-white cursor-pointer transition-colors">
          Solicitar saque →
        </button>
      </div>

      {/* Info */}
      <div className="flex gap-2 items-start p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p className="text-xs text-amber-800">Saque mínimo: <strong>500 MZN</strong> · Taxa de levantamento: <strong>2%</strong> · Processamento em 1–2 dias úteis</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {FILTROS.map(f => (
          <button key={f.id} onClick={() => { setFiltro(f.id); setPagina(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${filtro === f.id ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 bg-transparent hover:border-green-400"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Histórico real */}
      {carregando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : erro ? (
        <ErroBloco mensagem={erro} onRetry={carregar} />
      ) : comissoes.length === 0 ? (
        <Vazio texto="Sem comissões nesta categoria." />
      ) : (
        <div className="flex flex-col gap-2">
          {comissoes.map(c => {
            const estadoCls = ESTADO_COR_COMISSAO[c.estado] ?? "bg-gray-100 text-gray-500";
            const cancelado = (c.estado ?? "").toLowerCase().includes("cancel");
            return (
              <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.produto}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    #{c.pedidoId?.substring(0, 8)} · {fmtData(c.data)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold font-mono ${cancelado ? "text-red-500" : "text-green-600"}`}>
                    {cancelado ? "−" : "+"}{fmt(c.valor)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${estadoCls}`}>
                    {(c.estado ?? "").charAt(0).toUpperCase() + (c.estado ?? "").slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />

      {/* Modal Saque */}
      {modalSaque && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => { if (!processando) { setModalSaque(false); setEtapa("form"); } }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            {etapa === "sucesso" ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-base font-semibold text-green-700">Saque solicitado com sucesso!</p>
                <p className="text-sm text-gray-500 mt-1">Processamento em 1–2 dias úteis.</p>
              </div>
            ) : etapa === "otp" ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-base font-semibold text-gray-900">Código OTP</p>
                  <button onClick={() => { setEtapa("form"); setCodigoOtp(""); }} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer text-xl leading-none">×</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Introduz o código enviado para o teu email para confirmar o saque.</p>
                <input value={codigoOtp} onChange={e => setCodigoOtp(e.target.value)}
                  placeholder="000000" maxLength={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-green-500 mb-4" />
                <div className="flex gap-2">
                  <button onClick={() => { setEtapa("form"); setCodigoOtp(""); }} disabled={processando}
                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-transparent cursor-pointer">Voltar</button>
                  <button onClick={confirmarSaque} disabled={processando || codigoOtp.length < 4}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg border-0 cursor-pointer disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                    {processando ? <><Spinner small /> A processar...</> : "Confirmar"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-base font-semibold text-gray-900">Solicitar Saque</p>
                  <button onClick={() => setModalSaque(false)} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer text-xl leading-none">×</button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg mb-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Valor disponível</span>
                  <span className="text-sm font-semibold font-mono text-green-600">{fmt(ganhosDisponiveis)}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Método de pagamento</label>
                    <div className="flex gap-2">
                      {[{ id: "MPESA", label: "M-Pesa" }, { id: "EMOLA", label: "e-Mola" }, { id: "MKESH", label: "mKesh" }].map(m => (
                        <button key={m.id} onClick={() => setMetodo(m.id)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer
                            ${metodo === m.id ? "border-green-500 text-green-700 bg-green-50" : "border-gray-200 text-gray-500 bg-transparent"}`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Número de telefone</label>
                    <input value={numero} onChange={e => setNumero(e.target.value)}
                      placeholder="84 XXX XXXX"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Valor solicitado</span><span className="font-mono">{fmt(ganhosDisponiveis)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Taxa (2%)</span><span className="font-mono text-red-500">−{fmt(Math.round(Number(ganhosDisponiveis) * 0.02))}</span></div>
                    <div className="flex justify-between pt-1.5 border-t border-gray-200 font-semibold">
                      <span>Você recebe</span>
                      <span className="font-mono text-green-600">{fmt(Math.round(Number(ganhosDisponiveis) * 0.98))}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => setModalSaque(false)} disabled={processando}
                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-transparent cursor-pointer">Cancelar</button>
                  <button onClick={solicitarOtp} disabled={processando || !numero}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg border-0 cursor-pointer disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                    {processando ? <><Spinner small /> A enviar OTP...</> : "Continuar"}
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

// ── ABA: Segurança (estática — política não muda) ─────────────────
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
      <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl items-start">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <p className="text-sm font-semibold text-red-700">Política de Uso Justo</p>
          <p className="text-xs text-red-700 mt-1 leading-relaxed">O sistema de afiliados é monitorizado 24h. Fraudes resultam em banimento e perda de todas as comissões acumuladas.</p>
        </div>
      </div>
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
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">Conta em Bom Estado</p>
          <p className="text-xs text-green-700 mt-0.5">Nenhuma violação detectada. Continua assim! ✅</p>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────
export function SecaoAfiliados() {
  const [tab, setTab]               = useState("visao");

  // Dados do utilizador
  const [resumoUtilizador, setResumoUtilizador] = useState(null);
  const [resumoAfiliado, setResumoAfiliado]     = useState(null);
  const [posicao, setPosicao]                   = useState(null);
  const [carregandoResumo, setCarregandoResumo] = useState(true);
  const [erroResumo, setErroResumo]             = useState(null);

  // Links (geridos aqui para partilhar entre abas)
  const [links, setLinks]           = useState([]);
  const [carregandoLinks, setCarregandoLinks] = useState(true);
  const [erroLinks, setErroLinks]   = useState(null);

  // Carregar dados iniciais
  const carregarTudo = useCallback(async () => {
    setCarregandoResumo(true);
    setErroResumo(null);
    try {
      const [resUtilizador, resAfiliado, resPosicao] = await Promise.all([
        apiConta.resumo(),
        apiConta.resumoAfiliado(),
        apiAfiliados.minhaPosicao(),
      ]);

      const du = resUtilizador.success ? resUtilizador.data : resUtilizador.dados ?? {};
      setResumoUtilizador(du);

      const da = resAfiliado.success ? resAfiliado.data : resAfiliado.dados ?? {};
      setResumoAfiliado(da);
      setLinks(da.links ?? []);
      setCarregandoLinks(false);

      const dp = resPosicao.success ? resPosicao.data : resPosicao.dados ?? {};
      setPosicao(dp);
    } catch (e) {
      setErroResumo(e.message);
    } finally {
      setCarregandoResumo(false);
    }
  }, []);

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  // Quando um novo link é gerado na aba Explorar
  function onLinkGerado(novoLink) {
    setLinks(prev => [novoLink, ...prev]);
    setTab("links"); // navegar para "Meus Links" após criação
  }

  // Dados derivados
  const nome       = resumoUtilizador?.nome ?? "—";
  const email      = resumoUtilizador?.email ?? "";
  const fotoPerfil = resumoUtilizador?.fotoPerfil ?? null;
  const iniciais   = nome.split(" ").map(p => p[0]).join("").substring(0, 2).toUpperCase();

  const nivel      = (resumoAfiliado?.resumo?.nivel ?? resumoUtilizador?.estatisticas?.nivelAfiliado ?? "bronze");
  const nivelInfo  = NIVEIS[nivel] ?? NIVEIS.bronze;

  const totalGanho       = resumoAfiliado?.resumo?.totalGanho       ?? 0;
  const totalCliques     = resumoAfiliado?.resumo?.totalCliques      ?? 0;
  const totalConversoes  = resumoAfiliado?.resumo?.totalConversoes   ?? 0;
  const taxaConversao    = resumoAfiliado?.resumo?.taxaConversao     ?? 0;
  const linksAtivos      = resumoAfiliado?.resumo?.linksAtivos       ?? links.filter(l => l.ativo !== false).length;
  const ganhosDisponiveis= resumoAfiliado?.resumo?.ganhosDisponiveis ?? 0;
  const ganhosPendentes  = resumoAfiliado?.resumo?.ganhosPendentes   ?? 0;

  // Objecto resumo formatado para AbaVisaoGeral
  const resumoFormatado = resumoAfiliado ? {
    nivel, totalGanho, totalCliques, totalConversoes,
    taxaConversao: Number(taxaConversao).toFixed(2),
    linksAtivos, ganhosDisponiveis, ganhosPendentes,
    links,
    comissoes: resumoAfiliado.comissoes ?? [],
  } : null;

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
            <div className="text-base font-semibold text-gray-900">Área de Afiliado</div>
            <div className="text-xs text-gray-400 truncate max-w-[180px]">
              {carregandoResumo ? "A carregar..." : `${nome} · Afiliado MozTicTac`}
            </div>
          </div>
        </div>
        {!carregandoResumo && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
            style={{ background: nivelInfo.bg, borderColor: `${nivelInfo.cor}40` }}>
            <span style={{ fontSize: 16 }}>{nivelInfo.icon}</span>
            <span className="text-xs font-semibold" style={{ color: nivelInfo.cor }}>{nivelInfo.label}</span>
          </div>
        )}
      </div>

      {/* StatCards reais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Total Ganho"    valor={carregandoResumo ? "..." : fmtK(totalGanho)}    sub="MZN" />
        <StatCard label="Links Activos"  valor={carregandoResumo ? "..." : linksAtivos}         sub="activos" />
        <StatCard label="Cliques Total"  valor={carregandoResumo ? "..." : totalCliques}        sub="acumulado" />
        <StatCard label="Taxa Conversão" valor={carregandoResumo ? "..." : `${Number(taxaConversao).toFixed(1)}%`} sub="das visitas" />
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

      {/* Erro global */}
      {erroResumo && tab === "visao" && (
        <ErroBloco mensagem={erroResumo} onRetry={carregarTudo} />
      )}

      {/* Conteúdo */}
      {tab === "visao"     && <AbaVisaoGeral resumo={resumoFormatado} posicao={posicao} onSolicitarSaque={() => setTab("comissoes")} />}
      {tab === "links"     && <AbaMeusLinks links={links} carregando={carregandoLinks} erro={erroLinks} onRetry={carregarTudo} />}
      {tab === "explorar"  && <AbaExplorar  linksExistentes={links} onLinkGerado={onLinkGerado} />}
      {tab === "comissoes" && <AbaComissoes ganhosDisponiveis={ganhosDisponiveis} ganhosPendentes={ganhosPendentes} />}
      {tab === "seguranca" && <AbaSeguranca />}
    </div>
  );
}

export default SecaoAfiliados;