// src/components/FashionProducts.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adicionarAoCarrinho } from "../utils/carrinho";

// ── API BASE ──────────────────────────────────────────────────────
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

// ── API pública ───────────────────────────────────────────────────
const apiPublico = {
  produtos: (params = {}) => {
    const {
      tab = "novos", pagina = 1, limite = 20,
      categoriaId, busca,
      provincia, priceMin, priceMax,
      estado, tipo, comEntrega, comAfiliado,
      modalidade, tempoResposta,
    } = params;
    const p = new URLSearchParams({ tab, pagina, limite });
    if (categoriaId)                       p.set("categoriaId",  categoriaId);
    if (busca)                             p.set("busca",        busca);
    if (provincia)                         p.set("provincia",    provincia);
    if (priceMin)                          p.set("precoMin",     priceMin);
    if (priceMax)                          p.set("precoMax",     priceMax);
    if (estado && estado !== "todos")      p.set("estadoItem",   estado.toUpperCase());
    if (tipo   && tipo   !== "todos")      p.set("tipo",         tipo === "produto" ? "FISICO" : "SERVICO");
    if (comEntrega)                        p.set("comEntrega",   "true");
    if (comAfiliado)                       p.set("comAfiliado",  "true");
    if (modalidade && modalidade !== "todos")           p.set("modalidade",    modalidade);
    if (tempoResposta && tempoResposta !== "todos")     p.set("tempoResposta", tempoResposta);
    return req(`/publico/produtos?${p.toString()}`);
  },
  categorias: () => req("/publico/categorias"),
};

const apiDesejos = {
  listar:    ()   => reqAuth("/desejos"),
  adicionar: (id) => reqAuth(`/desejos/${id}`, { method: "POST" }),
  remover:   (id) => reqAuth(`/desejos/${id}`, { method: "DELETE" }),
};

// ── Constantes ────────────────────────────────────────────────────
// BUG CORRIGIDO: "Todos" e "Novos" apontavam para o mesmo endpoint.
// "Todos" agora usa tab "todos" (sem filtro de ordenação).
const TAB_MAP = {
  "Todos":            "todos",
  "Novos":            "novos",
  "Mais Vendidos":    "melhores",
  "Melhor Avaliados": "topRated",
  "Promoções":        "deals",
};
const TABS = ["Todos", "Novos", "Mais Vendidos", "Melhor Avaliados", "Promoções"];

// Lista de províncias (inline — sem import externo)
// Para centralizar: cria src/constants/provincias.js e importa de lá
const PROVINCES = [
  "Todas",
  "Maputo Cidade", "Maputo Província", "Matola", "Sofala", "Nampula",
  "Gaza", "Inhambane", "Manica", "Tete", "Zambézia", "Cabo Delgado", "Niassa",
];

const TEMPOS_RESPOSTA = [
  { val: "todos", label: "Qualquer" },
  { val: "1h",    label: "1 hora" },
  { val: "4h",    label: "4 horas" },
  { val: "8h",    label: "8 horas" },
  { val: "24h",   label: "24 horas" },
  { val: "48h",   label: "48 horas" },
  { val: "72h",   label: "72 horas" },
];

const MODALIDADES = [
  { val: "todos",      label: "Todas" },
  { val: "remoto",     label: "Remoto" },
  { val: "presencial", label: "Presencial" },
  { val: "ambos",      label: "Ambos" },
];

const GREEN = "#1db954";

// ── Helpers ───────────────────────────────────────────────────────
const fmtPreco = (n) => Number(n || 0).toLocaleString("pt-MZ");

// BUG CORRIGIDO: normalização consistente do campo província
function getProvinciaItem(p) {
  return (
    p.vendedor?.provincia ??
    p.vendedor?.localidade ??
    p.vendedor?.cidade ??
    p.provincia ??
    p.province ??
    ""
  );
}

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Spinner ───────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
    </div>
  );
}

// ── Paginação ─────────────────────────────────────────────────────
function Paginacao({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;

  const delta = 2;
  const start = Math.max(1, pagina - delta);
  const end   = Math.min(totalPaginas, pagina + delta);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <PageBtn onClick={() => onChange(pagina - 1)} disabled={pagina <= 1}>‹</PageBtn>

      {start > 1 && (
        <>
          <PageBtn onClick={() => onChange(1)} active={pagina === 1}>1</PageBtn>
          {start > 2 && <span className="text-gray-400 text-xs px-1">…</span>}
        </>
      )}

      {pages.map(p => (
        <PageBtn key={p} onClick={() => onChange(p)} active={p === pagina}>{p}</PageBtn>
      ))}

      {end < totalPaginas && (
        <>
          {end < totalPaginas - 1 && <span className="text-gray-400 text-xs px-1">…</span>}
          <PageBtn onClick={() => onChange(totalPaginas)} active={pagina === totalPaginas}>
            {totalPaginas}
          </PageBtn>
        </>
      )}

      <PageBtn onClick={() => onChange(pagina + 1)} disabled={pagina >= totalPaginas}>›</PageBtn>
    </div>
  );
}

function PageBtn({ onClick, disabled, active, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border cursor-pointer transition-all disabled:opacity-40
        ${active ? "text-white border-transparent" : "border-gray-200 text-gray-500 bg-white hover:border-green-400"}`}
      style={active ? { background: GREEN, borderColor: GREEN } : {}}
    >
      {children}
    </button>
  );
}

// ── Radio option reutilizável ─────────────────────────────────────
function RadioOpt({ label, checked, onClick }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group" onClick={onClick}>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
        ${checked ? "border-green-500" : "border-gray-300 group-hover:border-gray-400"}`}>
        {checked && <div className="w-2 h-2 rounded-full bg-green-500" />}
      </div>
      <span className={`text-sm transition-colors ${checked ? "text-gray-800 font-medium" : "text-gray-500"}`}>
        {label}
      </span>
    </label>
  );
}

// ── Toggle reutilizável ───────────────────────────────────────────
function SidebarToggle({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-600">{label}</span>
      <div
        onClick={onChange}
        className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer flex-shrink-0 ${value ? "bg-green-500" : "bg-gray-200"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
    </label>
  );
}

// ── ProductCard ───────────────────────────────────────────────────
// BUG CORRIGIDO: recebe desejosIds para inicializar o estado correcto
function ProductCardInterno({ p, desejosIds = [] }) {
  const navigate = useNavigate();
  // BUG CORRIGIDO: estado inicializado com base na lista de desejos carregada
  const [noDesejo,   setNoDesejo]   = useState(() => desejosIds.includes(p.id));
  const [salvando,   setSalvando]   = useState(false);
  const [erroDesejo, setErroDesejo] = useState(null);
  const [adicionado, setAdicionado] = useState(false);

  // Atualiza se desejosIds mudar após montagem (ex: carregamento assíncrono)
  useEffect(() => {
    setNoDesejo(desejosIds.includes(p.id));
  }, [desejosIds, p.id]);

  async function toggleDesejo(e) {
    e.stopPropagation();
    if (salvando) return;
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    setSalvando(true);
    setErroDesejo(null);
    try {
      if (noDesejo) { await apiDesejos.remover(p.id);   setNoDesejo(false); }
      else          { await apiDesejos.adicionar(p.id); setNoDesejo(true);  }
    } catch (err) {
      setErroDesejo(err.message);
      setTimeout(() => setErroDesejo(null), 3000);
    } finally {
      setSalvando(false);
    }
  }

  function handleAddToCart(e) {
    e.stopPropagation();
    adicionarAoCarrinho({
      id:           p.id,
      nome:         p.nome      ?? p.name      ?? "Produto",
      preco:        Number(p.preco ?? p.price ?? 0),
      imagem:       p.imagens?.[0] ?? p.img   ?? null,
      quantidade:   1,
      vendedorId:   p.vendedor?.id   ?? null,
      vendedorNome: p.vendedor?.nome ?? p.vendedor?.nomeCompleto ?? "",
      localidade:   p.vendedor?.cidade ?? p.city ?? "",
      estado:       p.estadoItem === "NOVO" || p.isNew ? "Novo" : "Usado",
      entrega:      p.entregaDisponivel ?? p.hasDelivery  ?? false,
      afiliado:     p.aceitaAfiliados  ?? p.hasAffiliate ?? false,
      atacado:      false,
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  }

  const nome            = p.nome      ?? p.name ?? "Produto";
  const preco           = Number(p.preco ?? p.price ?? 0);
  const precoOriginal   = p.originalPrice ?? p.precoOriginal ?? null;
  const avaliacao       = Number(p.mediaAvaliacoes ?? p.rating ?? 0);
  const totalAvaliacoes = p.totalAvaliacoes ?? p.reviews ?? 0;
  const cidade          = p.vendedor?.cidade ?? p.vendedor?.localidade ?? p.city ?? "";
  const imagem          = p.imagens?.[0] ?? p.img ?? "";
  // BUG CORRIGIDO: categoria pode vir aninhada ou como string directa
  const categoria       = p.categoria?.nome ?? p.categorias?.nome ?? p.category ?? "";
  const temEntrega      = p.entregaDisponivel ?? p.hasDelivery ?? false;
  const temAfiliado     = p.aceitaAfiliados ?? p.hasAffiliate ?? false;
  const pctAfiliado     = Number(p.percentualAfiliado ?? p.affiliatePct ?? 0);
  const isNovo          = p.estadoItem === "NOVO" || p.isNew || false;
  const tipoItem        = (p.tipo ?? p.type ?? "produto").toLowerCase();
  const destaque        = p.destaque ?? false;
  const temPlanos       = p.planos?.length > 0;

  const badge = destaque       ? "Anúncio"
    : tipoItem === "servico"   ? "Serviço"
    : p.badge ?? null;

  const precoExibido = temPlanos
    ? Math.min(...p.planos.map((pl) => Number(pl.preco) || Infinity))
    : preco;
  const prefixoPreco = temPlanos ? "a partir de " : "";

  return (
    <div
      onClick={() => navigate(`/produto/${p.id}`)}
      className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {imagem ? (
          <img src={imagem} alt={nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3 gap-2">
          <button onClick={handleAddToCart}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded shadow-sm transition-all duration-150"
            style={{ background: adicionado ? "#16a34a" : "white", color: adicionado ? "white" : "#1f2937" }}>
            {adicionado ? (
              <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Adicionado!</>
            ) : (
              <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> Adicionar</>
            )}
          </button>

          <button onClick={toggleDesejo} disabled={salvando}
            title={noDesejo ? "Remover dos desejos" : "Guardar nos desejos"}
            className="w-6 h-6 rounded bg-white flex items-center justify-center shadow-sm hover:bg-red-50 transition-all disabled:opacity-50">
            {salvando
              ? <div className="w-3 h-3 border border-gray-300 border-t-red-400 rounded-full animate-spin" />
              : <svg width="14" height="14" viewBox="0 0 24 24" fill={noDesejo ? "#ef4444" : "none"} stroke={noDesejo ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
            }
          </button>

          <button onClick={e => { e.stopPropagation(); navigate(`/produto/${p.id}`); }}
            className="w-6 h-6 rounded bg-white flex items-center justify-center shadow-sm hover:bg-green-50 hover:text-green-600 text-gray-600 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        {/* Badges */}
        {badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: badge === "Anúncio" ? "#e3f0ff" : badge === "Serviço" ? "#e6f9f0" : "#f3f4f6",
              color:      badge === "Anúncio" ? "#3b82f6" : badge === "Serviço" ? "#00b96b" : "#6b7280",
            }}>
            {badge}
          </span>
        )}
        {isNovo && !noDesejo && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">
            Novo
          </span>
        )}
        {temAfiliado && pctAfiliado > 0 && (
          <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            +{pctAfiliado}% afiliado
          </span>
        )}
        {noDesejo && !erroDesejo && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </div>
        )}
        {erroDesejo && (
          <div className="absolute bottom-2 left-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded text-center">
            {erroDesejo}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] text-gray-400 font-medium mb-0.5">{categoria}</p>
        <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-2">{nome}</p>

        {avaliacao > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-xs font-semibold text-gray-700">{avaliacao.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({totalAvaliacoes})</span>
          </div>
        )}

        {temPlanos && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {p.planos.slice(0, 3).map((pl) => (
              <span key={pl.id ?? pl.nome}
                className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                {pl.nome}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between gap-1">
          <div>
            {prefixoPreco && (
              <p className="text-[10px] text-gray-400">{prefixoPreco}</p>
            )}
            <p className="text-base font-black text-gray-900">
              {fmtPreco(precoExibido)}
              <span className="text-[10px] font-normal text-gray-400 ml-1">MZN</span>
            </p>
            {precoOriginal && !temPlanos && (
              <p className="text-[11px] text-gray-400 line-through">{fmtPreco(precoOriginal)} MZN</p>
            )}
          </div>
          {temEntrega && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-green-50 text-green-600 rounded">
              Entrega
            </span>
          )}
        </div>

        {cidade && (
          <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {cidade}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Secção do sidebar ─────────────────────────────────────────────
function SidebarSection({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      {children}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────
export function FashionProducts() {
  // ── Estado dos filtros ─────────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState("Todos");
  const [pagina,        setPagina]        = useState(1);
  const [categoriaId,   setCategoriaId]   = useState("");
  const [buscaInput,    setBuscaInput]    = useState("");
  const busca = useDebounce(buscaInput, 400);

  // Filtros do sidebar
  const [provincia,     setProvincia]     = useState("Todas");
  const [priceMin,      setPriceMin]      = useState("");
  const [priceMax,      setPriceMax]      = useState("");
  const [estado,        setEstado]        = useState("todos");
  const [tipo,          setTipo]          = useState("todos");
  const [comEntrega,    setComEntrega]    = useState(false);
  const [comAfiliado,   setComAfiliado]   = useState(false);
  const [modalidade,    setModalidade]    = useState("todos");
  const [tempoResposta, setTempoResposta] = useState("todos");
  const [filtersOpen,   setFiltersOpen]   = useState(true);

  // ── Estado dos dados ───────────────────────────────────────────
  const [produtos,      setProdutos]      = useState([]);
  const [categorias,    setCategorias]    = useState([]);
  const [total,         setTotal]         = useState(0);
  const [totalPaginas,  setTotalPaginas]  = useState(1);
  const [carregando,    setCarregando]    = useState(true);
  const [erro,          setErro]          = useState(null);
  // BUG CORRIGIDO: lista de IDs de desejos carregada do backend
  const [desejosIds,    setDesejosIds]    = useState([]);

  const priceMinDb = useDebounce(priceMin, 600);
  const priceMaxDb = useDebounce(priceMax, 600);

  // ── Carregar categorias (uma vez) ──────────────────────────────
  useEffect(() => {
    apiPublico.categorias()
      .then(res => setCategorias(res.success ? res.data : res.dados ?? []))
      .catch(() => setCategorias([]));
  }, []);

  // ── Carregar desejos do utilizador (uma vez, se autenticado) ───
  // BUG CORRIGIDO: wishlist carregada para inicializar os cards correctamente
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    apiDesejos.listar()
      .then(res => {
        const lista = res.success ? res.data : res.dados ?? [];
        // API pode retornar [{produtoId: ...}] ou [{produto: {id:...}}] ou [id, ...]
        const ids = lista.map(d =>
          typeof d === "string" ? d :
          d.produtoId ?? d.produto?.id ?? d.id ?? null
        ).filter(Boolean);
        setDesejosIds(ids);
      })
      .catch(() => setDesejosIds([]));
  }, []);

  // ── Fetch produtos ─────────────────────────────────────────────
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiPublico.produtos({
        tab:           TAB_MAP[activeTab] ?? "todos",
        pagina,
        limite:        20,
        categoriaId:   categoriaId || undefined,
        busca:         busca       || undefined,
        provincia:     provincia !== "Todas" ? provincia : undefined,
        priceMin:      priceMinDb  || undefined,
        priceMax:      priceMaxDb  || undefined,
        estado:        estado      !== "todos" ? estado      : undefined,
        tipo:          tipo        !== "todos" ? tipo        : undefined,
        comEntrega:    comEntrega  || undefined,
        comAfiliado:   comAfiliado || undefined,
        modalidade:    modalidade  !== "todos" ? modalidade  : undefined,
        tempoResposta: tempoResposta !== "todos" ? tempoResposta : undefined,
      });
      const d = res.success ? res.data : res.dados ?? {};
      setProdutos(d.produtos ?? []);
      setTotal(d.total ?? 0);
      // BUG CORRIGIDO: sintaxe ?? e || misturada sem parênteses
      setTotalPaginas((d.totalPaginas ?? Math.ceil((d.total ?? 0) / 20)) || 1);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [activeTab, pagina, categoriaId, busca, provincia, priceMinDb, priceMaxDb, estado, tipo, comEntrega, comAfiliado, modalidade, tempoResposta]);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Filtros locais — apenas como fallback ──────────────────────
  // BUG CORRIGIDO: filtro de província usa igualdade exacta em vez de includes()
  // para evitar matches parciais incorrectos (ex: "Maputo" matching "Maputo Cidade")
  const filtered = useMemo(() => {
    let list = [...produtos];

    // Província — igualdade exacta (case-insensitive)
    if (provincia !== "Todas") {
      list = list.filter(p => {
        const prov = getProvinciaItem(p).toLowerCase().trim();
        return prov === provincia.toLowerCase().trim();
      });
    }

    // Preço
    if (priceMin !== "")
      list = list.filter(p => Number(p.preco ?? p.price ?? 0) >= Number(priceMin));
    if (priceMax !== "")
      list = list.filter(p => Number(p.preco ?? p.price ?? 0) <= Number(priceMax));

    // Estado item
    if (estado === "novo")
      list = list.filter(p => p.estadoItem === "NOVO" || p.isNew);
    else if (estado === "usado")
      list = list.filter(p => p.estadoItem === "USADO" || (p.estadoItem && p.estadoItem !== "NOVO"));

    // Tipo
    if (tipo === "produto")
      list = list.filter(p => (p.tipo ?? p.type ?? "produto").toLowerCase() !== "servico");
    else if (tipo === "servico")
      list = list.filter(p => (p.tipo ?? p.type ?? "").toLowerCase() === "servico");

    // Entrega e afiliados
    if (comEntrega)  list = list.filter(p => p.entregaDisponivel ?? p.hasDelivery);
    if (comAfiliado) list = list.filter(p => p.aceitaAfiliados   ?? p.hasAffiliate);

    // Modalidade (serviços)
    if (modalidade !== "todos")
      list = list.filter(p => (p.modalidade ?? "").toLowerCase() === modalidade);

    // Tempo de resposta (serviços)
    if (tempoResposta !== "todos")
      list = list.filter(p => p.tempoResposta === tempoResposta);

    return list;
  }, [produtos, provincia, priceMin, priceMax, estado, tipo, comEntrega, comAfiliado, modalidade, tempoResposta]);

  // BUG CORRIGIDO: totalPaginas recalculado com base em filtered para manter
  // consistência quando o filtro local remove itens da página actual
  const totalPaginasExibido = useMemo(() => {
    // Se o backend filtrou correctamente, filtered.length ≈ produtos.length
    // Se o filtro local removeu itens, recalcula para não mostrar páginas vazias
    if (filtered.length < produtos.length && produtos.length > 0) {
      return Math.max(1, Math.ceil(total / 20));
    }
    return totalPaginas;
  }, [filtered.length, produtos.length, total, totalPaginas]);

  // ── Helpers de navegação ───────────────────────────────────────
  // BUG CORRIGIDO: mudarFiltro centralizado — todos os filtros passam por aqui
  function mudarFiltro(setter) {
    return (val) => {
      setter(val);
      setPagina(1); // sempre reset a página ao mudar qualquer filtro
    };
  }

  function mudarTab(tab)      { setActiveTab(tab);  setPagina(1); }
  function mudarCategoria(id) { setCategoriaId(id); setPagina(1); }

  function clearFilters() {
    setProvincia("Todas");
    setPriceMin(""); setPriceMax("");
    setEstado("todos"); setTipo("todos");
    setComEntrega(false); setComAfiliado(false);
    setModalidade("todos"); setTempoResposta("todos");
    setPagina(1);
  }

  const hasActiveFilters =
    provincia !== "Todas" || priceMin || priceMax ||
    estado !== "todos" || tipo !== "todos" ||
    comEntrega || comAfiliado ||
    modalidade !== "todos" || tempoResposta !== "todos";

  const mostrarFiltrosServico = tipo === "servico" || tipo === "todos";

  // ── Render ─────────────────────────────────────────────────────
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-[1450px] mx-auto px-4">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Manrope, sans-serif" }}>
              Todos os Produtos
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {carregando ? "A carregar..." : `${total} resultado${total !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tabs */}
            <div className="flex bg-white border border-gray-200 p-1 gap-0.5">
              {TABS.map(tab => (
                <button key={tab} onClick={() => mudarTab(tab)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border-none transition-all duration-200
                    ${activeTab === tab ? "text-white shadow-sm" : "text-gray-500 bg-transparent hover:text-gray-700"}`}
                  style={activeTab === tab ? { background: GREEN } : {}}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Toggle sidebar */}
            <button onClick={() => setFiltersOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-2 border text-xs font-semibold transition-all cursor-pointer
                ${filtersOpen ? "border-green-500 text-green-600 bg-green-50" : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filtros
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Barra de pesquisa + categorias */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={buscaInput} onChange={e => { setBuscaInput(e.target.value); setPagina(1); }}
              placeholder="Pesquisar produtos e serviços..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-white transition-colors" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => mudarCategoria("")}
              className={`px-3 py-1.5 border text-xs font-semibold cursor-pointer transition-all
                ${!categoriaId ? "text-white border-transparent" : "border-gray-200 text-gray-500 bg-white hover:border-green-400"}`}
              style={!categoriaId ? { background: GREEN } : {}}>
              Todas
            </button>
            {categorias.map(c => (
              <button key={c.id} onClick={() => mudarCategoria(c.id)}
                className={`px-3 py-1.5 border text-xs font-semibold cursor-pointer transition-all
                  ${categoriaId === c.id ? "text-white border-transparent" : "border-gray-200 text-gray-500 bg-white hover:border-green-400"}`}
                style={categoriaId === c.id ? { background: GREEN } : {}}>
                {c.icone && <span className="mr-1">{c.icone}</span>}
                {c.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Body: sidebar + grid */}
        <div className="flex gap-5 items-start">

          {/* ══ Sidebar ══ */}
          {filtersOpen && (
            // BUG CORRIGIDO: max-height + overflow-y para não ultrapassar o viewport
            <aside className="w-60 flex-shrink-0 bg-white border border-gray-100 shadow-sm p-5 sticky top-4"
              style={{ maxHeight: "calc(100vh - 2rem)", overflowY: "auto" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-800" style={{ fontFamily: "Manrope, sans-serif" }}>Filtros</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="text-[11px] text-green-600 font-semibold cursor-pointer border-none bg-transparent hover:underline">
                    Limpar tudo
                  </button>
                )}
              </div>
              <hr className="border-gray-100 mb-4" />

              {/* Província */}
              <SidebarSection title="Província">
                <div className="relative">
                  <select value={provincia} onChange={e => mudarFiltro(setProvincia)(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 appearance-none cursor-pointer focus:outline-none focus:border-green-400 transition-colors">
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </SidebarSection>

              {/* Preço */}
              <SidebarSection title="Preço (MZN)">
                <div className="flex gap-2">
                  <input type="number" placeholder="Mín" value={priceMin}
                    onChange={e => mudarFiltro(setPriceMin)(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400 transition-colors" />
                  <input type="number" placeholder="Máx" value={priceMax}
                    onChange={e => mudarFiltro(setPriceMax)(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-400 transition-colors" />
                </div>
              </SidebarSection>

              {/* Tipo */}
              <SidebarSection title="Tipo">
                <div className="flex flex-col gap-2">
                  {[["todos", "Todos"], ["produto", "Produto físico"], ["servico", "Serviço"]].map(([val, label]) => (
                    <RadioOpt key={val} label={label} checked={tipo === val} onClick={() => mudarFiltro(setTipo)(val)} />
                  ))}
                </div>
              </SidebarSection>

              {/* Estado — escondido quando tipo = serviço */}
              {tipo !== "servico" && (
                <SidebarSection title="Estado do item">
                  <div className="flex flex-col gap-2">
                    {[["todos", "Todos"], ["novo", "Novo"], ["usado", "Usado"]].map(([val, label]) => (
                      <RadioOpt key={val} label={label} checked={estado === val} onClick={() => mudarFiltro(setEstado)(val)} />
                    ))}
                  </div>
                </SidebarSection>
              )}

              {/* Toggles gerais */}
              <SidebarSection title="Características">
                <div className="flex flex-col gap-3">
                  {tipo !== "servico" && (
                    <SidebarToggle label="Com entrega" value={comEntrega}
                      onChange={() => mudarFiltro(setComEntrega)(!comEntrega)} />
                  )}
                  <SidebarToggle label="Aceita afiliados" value={comAfiliado}
                    onChange={() => mudarFiltro(setComAfiliado)(!comAfiliado)} />
                </div>
              </SidebarSection>

              {/* Filtros de serviço */}
              {mostrarFiltrosServico && (
                <>
                  <hr className="border-gray-100 mb-4" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Exclusivo · Serviços</p>

                  <SidebarSection title="Modalidade">
                    <div className="flex flex-col gap-2">
                      {MODALIDADES.map(({ val, label }) => (
                        <RadioOpt key={val} label={label} checked={modalidade === val} onClick={() => mudarFiltro(setModalidade)(val)} />
                      ))}
                    </div>
                  </SidebarSection>

                  <SidebarSection title="Tempo de resposta">
                    <div className="flex flex-col gap-2">
                      {TEMPOS_RESPOSTA.map(({ val, label }) => (
                        <RadioOpt key={val} label={label} checked={tempoResposta === val} onClick={() => mudarFiltro(setTempoResposta)(val)} />
                      ))}
                    </div>
                  </SidebarSection>
                </>
              )}
            </aside>
          )}

          {/* ══ Grid ══ */}
          <div className="flex-1 min-w-0">
            {erro ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <p className="text-red-500 text-sm font-medium">Erro ao carregar produtos</p>
                <p className="text-gray-400 text-xs">{erro}</p>
                <button onClick={carregar}
                  className="text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer border-none text-white"
                  style={{ background: GREEN }}>
                  Tentar novamente
                </button>
              </div>
            ) : carregando ? (
              <Spinner />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <p className="text-gray-500 font-medium text-sm">Nenhum resultado encontrado</p>
                <p className="text-gray-400 text-xs mt-1">
                  {hasActiveFilters ? "Tenta ajustar ou limpar os filtros" : "Tenta outra pesquisa"}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="mt-4 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer border-none text-white"
                    style={{ background: GREEN }}>
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${filtersOpen
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"}`}>
                  {/* BUG CORRIGIDO: desejosIds passado para cada card */}
                  {filtered.map(p => (
                    <ProductCardInterno key={p.id} p={p} desejosIds={desejosIds} />
                  ))}
                </div>

                <Paginacao
                  pagina={pagina}
                  totalPaginas={totalPaginasExibido}
                  onChange={p => { setPagina(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export { FashionProducts as DealsSection };