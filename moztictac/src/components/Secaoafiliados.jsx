import { useState } from "react";
import {
  CreditCard, MousePointerClick, CheckCircle, Link, Copy, TrendingUp,
  Search, Filter, Star, Shield, AlertTriangle, ChevronDown, ChevronUp,
  Share2, ExternalLink, Award, Zap, BarChart2, Clock, XCircle,
  CheckSquare, Package, RefreshCw, ArrowUpRight, Info
} from "lucide-react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const VERDE = "#00A86B";
const VERDE_DARK = "#007A4D";
const VERDE_LIGHT = "#E6F7F0";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const NIVEIS = {
  bronze: { label: "Bronze", cor: "#CD7F32", bg: "#FFF3E8", icon: "🥉", min: 0,    max: 5000  },
  prata:  { label: "Prata",  cor: "#A8A9AD", bg: "#F4F4F6", icon: "🥈", min: 5000, max: 20000 },
  ouro:   { label: "Ouro",   cor: "#FFD700", bg: "#FFFBEA", icon: "🥇", min: 20000, max: null },
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

const LINKS = [
  {
    id: "L001",
    produto: "Smartphone Samsung A55",
    produtoId: "P123",
    categoria: "Electrónica",
    comissao: 8,
    preco: 28500,
    cliques: 142,
    conversoes: 7,
    ganho: 3300,
    estado: "activo",
    imagem: "📱",
    criadoEm: "12 Mar 2025",
  },
  {
    id: "L002",
    produto: "Mochila Escolar ProMax",
    produtoId: "P456",
    categoria: "Acessórios",
    comissao: 12,
    preco: 2800,
    cliques: 89,
    conversoes: 4,
    ganho: 1800,
    estado: "activo",
    imagem: "🎒",
    criadoEm: "28 Mar 2025",
  },
];

const PRODUTOS_DISPONIVEIS = [
  { id: "P789", nome: "Laptop Lenovo IdeaPad", categoria: "Electrónica", comissao: 6,  preco: 65000, vendas: 312, imagem: "💻", popular: true  },
  { id: "P012", nome: "Fone Bluetooth JBL",    categoria: "Electrónica", comissao: 10, preco: 4500,  vendas: 189, imagem: "🎧", popular: false },
  { id: "P345", nome: "Bicicleta City Tour",   categoria: "Desporto",    comissao: 9,  preco: 18000, vendas: 54,  imagem: "🚲", popular: false },
  { id: "P678", nome: "Máquina de Costura",    categoria: "Casa",        comissao: 7,  preco: 12000, vendas: 98,  imagem: "🪡", popular: true  },
];

const HISTORICO_COMISSOES = [
  { id: "C001", produto: "Samsung A55",   data: "10 Abr 2025", valor: 456,  estado: "disponivel" },
  { id: "C002", produto: "Mochila Pro",   data: "08 Abr 2025", valor: 336,  estado: "disponivel" },
  { id: "C003", produto: "Samsung A55",   data: "05 Abr 2025", valor: 228,  estado: "pago"       },
  { id: "C004", produto: "Samsung A55",   data: "01 Abr 2025", valor: 228,  estado: "pendente"   },
  { id: "C005", produto: "Mochila Pro",   data: "28 Mar 2025", valor: 168,  estado: "cancelado"  },
];

const CATEGORIAS = ["Todas", "Electrónica", "Acessórios", "Desporto", "Casa", "Moda"];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Badge({ texto, cor = "verde" }) {
  const estilos = {
    verde:    { background: VERDE_LIGHT,  color: VERDE_DARK },
    cinza:    { background: "#F3F4F6",    color: "#6B7280"  },
    amarelo:  { background: "#FFFBEA",    color: "#B45309"  },
    vermelho: { background: "#FEF2F2",    color: "#DC2626"  },
    azul:     { background: "#EFF6FF",    color: "#1D4ED8"  },
  };
  return (
    <span style={{ ...estilos[cor], borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
      {texto}
    </span>
  );
}

function EstadoBadge({ estado }) {
  const map = {
    disponivel: { cor: "verde",    texto: "Disponível" },
    pendente:   { cor: "amarelo",  texto: "Pendente"   },
    pago:       { cor: "cinza",    texto: "Pago"       },
    cancelado:  { cor: "vermelho", texto: "Cancelado"  },
    activo:     { cor: "verde",    texto: "Activo"     },
  };
  const { cor, texto } = map[estado] || { cor: "cinza", texto: estado };
  return <Badge cor={cor} texto={texto} />;
}

function StatCard({ label, valor, Icone, destaque }) {
  return (
    <div style={{
      background: destaque ? VERDE : "#F9FAFB",
      borderRadius: 16,
      padding: "16px 12px",
      textAlign: "center",
      border: destaque ? "none" : "1px solid #F0F0F0",
    }}>
      <Icone size={20} style={{ color: destaque ? "#fff" : VERDE, margin: "0 auto" }} />
      <p style={{ fontSize: 17, fontWeight: 800, color: destaque ? "#fff" : "#111", marginTop: 6 }}>{valor}</p>
      <p style={{ fontSize: 11, color: destaque ? "rgba(255,255,255,0.8)" : "#9CA3AF", marginTop: 2 }}>{label}</p>
    </div>
  );
}

function NivelBar({ nivel, totalGanho }) {
  const info = NIVEIS[nivel];
  const proximo = nivel === "bronze" ? NIVEIS.prata : nivel === "prata" ? NIVEIS.ouro : null;
  const pct = proximo ? Math.min(100, ((totalGanho - info.min) / (proximo.min - info.min)) * 100) : 100;

  return (
    <div style={{
      background: info.bg,
      border: `1.5px solid ${info.cor}30`,
      borderRadius: 16,
      padding: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>{info.icon}</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: 14, color: "#111" }}>Nível {info.label}</p>
            <p style={{ fontSize: 11, color: "#777" }}>Afiliado MozTicTac</p>
          </div>
        </div>
        <Award size={20} style={{ color: info.cor }} />
      </div>
      {proximo && (
        <>
          <div style={{ height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: info.cor, borderRadius: 99, transition: "width 1s ease" }} />
          </div>
          <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
            {(proximo.min - totalGanho).toLocaleString("pt-MZ")} MZN até {NIVEIS[nivel === "bronze" ? "prata" : "ouro"].icon} {NIVEIS[nivel === "bronze" ? "prata" : "ouro"].label}
          </p>
        </>
      )}
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "visao",     label: "Visão Geral",  icon: BarChart2   },
  { id: "links",     label: "Meus Links",   icon: Link        },
  { id: "explorar",  label: "Explorar",     icon: Search      },
  { id: "comissoes", label: "Comissões",    icon: CreditCard  },
  { id: "seguranca", label: "Segurança",    icon: Shield      },
];

// ─── VISÃO GERAL ──────────────────────────────────────────────────────────────
function AbaVisaoGeral() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <NivelBar nivel={AFILIADO.nivel} totalGanho={AFILIADO.totalGanho} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatCard label="Total Ganho"   valor={`${AFILIADO.totalGanho.toLocaleString("pt-MZ")} MZN`} Icone={CreditCard}        destaque />
        <StatCard label="Links Activos" valor={AFILIADO.linksAtivos}                                  Icone={Link}              />
        <StatCard label="Cliques"       valor={AFILIADO.cliquesTotal}                                 Icone={MousePointerClick} />
        <StatCard label="Conversões"    valor={AFILIADO.conversoesTotal}                              Icone={CheckCircle}       />
      </div>

      {/* Conversão */}
      <div style={{ background: "#F9FAFB", borderRadius: 16, padding: 16, border: "1px solid #F0F0F0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontWeight: 700, fontSize: 13 }}>Taxa de Conversão</p>
          <span style={{ fontWeight: 800, fontSize: 18, color: VERDE }}>{AFILIADO.taxaConversao}%</span>
        </div>
        <div style={{ height: 8, background: "#E5E7EB", borderRadius: 99, overflow: "hidden", marginTop: 10 }}>
          <div style={{ height: "100%", width: `${AFILIADO.taxaConversao * 5}%`, background: VERDE, borderRadius: 99 }} />
        </div>
        <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
          {AFILIADO.conversoesTotal} vendas de {AFILIADO.cliquesTotal} cliques
        </p>
      </div>

      {/* Carteira de comissões */}
      <div style={{ borderRadius: 16, border: "1px solid #F0F0F0", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", background: "#F9FAFB", borderBottom: "1px solid #F0F0F0" }}>
          <p style={{ fontWeight: 700, fontSize: 13 }}>Carteira de Comissões</p>
        </div>
        {[
          { label: "Disponível para saque", valor: AFILIADO.ganhosDisponiveis, cor: VERDE,   Icone: CheckCircle },
          { label: "Pendente",              valor: AFILIADO.ganhosPendentes,   cor: "#F59E0B", Icone: Clock      },
          { label: "Total pago",            valor: AFILIADO.ganhosPagos,       cor: "#9CA3AF", Icone: CreditCard },
        ].map(({ label, valor, cor, Icone }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #F9FAFB" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icone size={16} style={{ color: cor }} />
              <p style={{ fontSize: 13, color: "#555" }}>{label}</p>
            </div>
            <p style={{ fontWeight: 700, color: cor }}>{valor.toLocaleString("pt-MZ")} MZN</p>
          </div>
        ))}
        <div style={{ padding: 12 }}>
          <button style={{
            width: "100%", padding: "10px 0", background: VERDE, color: "#fff",
            borderRadius: 10, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer"
          }}>
            Levantar {AFILIADO.ganhosDisponiveis.toLocaleString("pt-MZ")} MZN
          </button>
        </div>
      </div>

      {/* Insights */}
      <div style={{ background: "#EFF6FF", borderRadius: 16, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Zap size={16} style={{ color: "#1D4ED8" }} />
          <p style={{ fontWeight: 700, fontSize: 13, color: "#1D4ED8" }}>Dica de Performance</p>
        </div>
        <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
          O teu link do <strong>Samsung A55</strong> tem 7 conversões. Partilha mais em grupos de tecnologia para escalar os ganhos!
        </p>
      </div>
    </div>
  );
}

// ─── MEUS LINKS ───────────────────────────────────────────────────────────────
function AbaMeusLinks() {
  const [copiado, setCopiado] = useState(null);
  const [expandido, setExpandido] = useState(null);

  const copiar = (id, link) => {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>Os Meus Links Activos</p>
        <Badge texto={`${LINKS.length} links`} />
      </div>

      {LINKS.map(l => {
        const link = `moztictac.mz/p/${l.produtoId}?ref=${l.produto.slice(0,4).replace(/ /g,"")}ANA`;
        const aberto = expandido === l.id;
        return (
          <div key={l.id} style={{
            background: "#fff",
            border: "1.5px solid #F0F0F0",
            borderRadius: 16,
            overflow: "hidden",
            transition: "all .2s",
          }}>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{l.imagem}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{l.produto}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>{l.categoria} · Criado {l.criadoEm}</p>
                  </div>
                </div>
                <EstadoBadge estado={l.estado} />
              </div>

              {/* Link box */}
              <div style={{
                background: "#F9FAFB", borderRadius: 10,
                padding: "8px 12px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 12,
              }}>
                <p style={{ fontSize: 11, color: "#6B7280", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {link}
                </p>
                <button
                  onClick={() => copiar(l.id, link)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 11, fontWeight: 700,
                    color: copiado === l.id ? VERDE : "#6B7280",
                    background: "none", border: "none", cursor: "pointer",
                    marginLeft: 8, flexShrink: 0,
                  }}
                >
                  {copiado === l.id ? <><CheckCircle size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                </button>
              </div>

              {/* Stats rápidas */}
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{l.cliques}</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF" }}>Cliques</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{l.conversoes}</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF" }}>Vendas</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: VERDE }}>{((l.conversoes / l.cliques) * 100).toFixed(1)}%</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF" }}>Conversão</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: VERDE }}>{l.ganho.toLocaleString("pt-MZ")}</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF" }}>MZN Ganhos</p>
                </div>
              </div>

              {/* Toggle detalhes */}
              <button
                onClick={() => setExpandido(aberto ? null : l.id)}
                style={{
                  marginTop: 12, display: "flex", alignItems: "center", gap: 4,
                  fontSize: 12, color: VERDE, fontWeight: 600,
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                }}
              >
                {aberto ? <><ChevronUp size={14} /> Ocultar detalhes</> : <><ChevronDown size={14} /> Ver detalhes</>}
              </button>
            </div>

            {/* Detalhes expandidos */}
            {aberto && (
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Detalhes do Produto</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      ["Comissão",     `${l.comissao}%`],
                      ["Preço produto", `${l.preco.toLocaleString("pt-MZ")} MZN`],
                      ["Comissão/venda", `${Math.round(l.preco * l.comissao / 100).toLocaleString("pt-MZ")} MZN`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 12, color: "#9CA3AF" }}>{k}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Partilhar */}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {["WhatsApp", "Facebook", "Telegram"].map(r => (
                    <button key={r} style={{
                      flex: 1, padding: "8px 0",
                      background: VERDE_LIGHT, color: VERDE_DARK,
                      borderRadius: 10, fontWeight: 700, fontSize: 11,
                      border: `1px solid ${VERDE}30`, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}>
                      <Share2 size={11} /> {r}
                    </button>
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

// ─── EXPLORAR PRODUTOS ────────────────────────────────────────────────────────
function AbaExplorar() {
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState("Todas");
  const [afiliados, setAfiliados] = useState([]);
  const [confirmando, setConfirmando] = useState(null);

  const filtrados = PRODUTOS_DISPONIVEIS.filter(p =>
    (cat === "Todas" || p.categoria === cat) &&
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const tornarAfiliado = (id) => {
    setConfirmando(id);
    setTimeout(() => {
      setAfiliados(prev => [...prev, id]);
      setConfirmando(null);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Busca */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#F9FAFB", borderRadius: 12, padding: "10px 14px",
        border: "1.5px solid #F0F0F0"
      }}>
        <Search size={16} style={{ color: "#9CA3AF" }} />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Procurar produtos..."
          style={{ background: "none", border: "none", outline: "none", fontSize: 13, width: "100%", color: "#111" }}
        />
      </div>

      {/* Categorias */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {CATEGORIAS.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              padding: "6px 14px", borderRadius: 20,
              fontWeight: 600, fontSize: 12, cursor: "pointer",
              border: `1.5px solid ${cat === c ? VERDE : "#E5E7EB"}`,
              background: cat === c ? VERDE : "#fff",
              color: cat === c ? "#fff" : "#6B7280",
              flexShrink: 0, whiteSpace: "nowrap",
            }}
          >{c}</button>
        ))}
      </div>

      {/* Produtos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtrados.map(p => {
          const jaAfiliado = afiliados.includes(p.id) || LINKS.some(l => l.produtoId === p.id);
          const a_confirmar = confirmando === p.id;
          return (
            <div key={p.id} style={{
              background: "#fff", border: "1.5px solid #F0F0F0",
              borderRadius: 16, padding: 16,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{p.imagem}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{p.nome}</p>
                      {p.popular && <Badge texto="⭐ Popular" cor="amarelo" />}
                    </div>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>{p.categoria}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 800, fontSize: 16, color: VERDE }}>{p.comissao}%</p>
                  <p style={{ fontSize: 10, color: "#9CA3AF" }}>comissão</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700 }}>{p.preco.toLocaleString("pt-MZ")} MZN</p>
                    <p style={{ fontSize: 10, color: "#9CA3AF" }}>Preço</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700 }}>{Math.round(p.preco * p.comissao / 100).toLocaleString("pt-MZ")} MZN</p>
                    <p style={{ fontSize: 10, color: "#9CA3AF" }}>Ganho/venda</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700 }}>{p.vendas}</p>
                    <p style={{ fontSize: 10, color: "#9CA3AF" }}>Vendas totais</p>
                  </div>
                </div>
              </div>
              <button
                disabled={jaAfiliado || a_confirmar}
                onClick={() => tornarAfiliado(p.id)}
                style={{
                  padding: "10px 0",
                  background: jaAfiliado ? VERDE_LIGHT : a_confirmar ? "#E5E7EB" : VERDE,
                  color: jaAfiliado ? VERDE_DARK : a_confirmar ? "#9CA3AF" : "#fff",
                  borderRadius: 10, fontWeight: 700, fontSize: 13,
                  border: "none", cursor: jaAfiliado ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {a_confirmar ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> A gerar link...</> :
                 jaAfiliado ? <><CheckCircle size={14} /> Já és afiliado</> :
                 <><Link size={14} /> Tornar-me afiliado</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── COMISSÕES ────────────────────────────────────────────────────────────────
function AbaComissoes() {
  const [filtro, setFiltro] = useState("todos");

  const filtrados = HISTORICO_COMISSOES.filter(c =>
    filtro === "todos" || c.estado === filtro
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Resumo carteira */}
      <div style={{
        background: `linear-gradient(135deg, ${VERDE}, ${VERDE_DARK})`,
        borderRadius: 16, padding: 20, color: "#fff"
      }}>
        <p style={{ fontSize: 12, opacity: 0.8 }}>Disponível para Saque</p>
        <p style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>
          {AFILIADO.ganhosDisponiveis.toLocaleString("pt-MZ")} <span style={{ fontSize: 14, fontWeight: 500 }}>MZN</span>
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div>
            <p style={{ fontSize: 11, opacity: 0.7 }}>Pendente</p>
            <p style={{ fontWeight: 700 }}>{AFILIADO.ganhosPendentes.toLocaleString("pt-MZ")} MZN</p>
          </div>
          <div>
            <p style={{ fontSize: 11, opacity: 0.7 }}>Total pago</p>
            <p style={{ fontWeight: 700 }}>{AFILIADO.ganhosPagos.toLocaleString("pt-MZ")} MZN</p>
          </div>
        </div>
        <button style={{
          marginTop: 16, width: "100%", padding: "10px 0",
          background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
          borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 13,
          border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer",
        }}>
          Solicitar Saque →
        </button>
      </div>

      {/* Info mínimo */}
      <div style={{
        background: "#FFFBEA", border: "1px solid #FCD34D40",
        borderRadius: 12, padding: 12,
        display: "flex", alignItems: "center", gap: 10
      }}>
        <Info size={14} style={{ color: "#B45309", flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: "#92400E" }}>
          Saque mínimo: <strong>500 MZN</strong> · Taxa de levantamento: <strong>2%</strong>
        </p>
      </div>

      {/* Filtro */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          { id: "todos",      label: "Todos"      },
          { id: "disponivel", label: "Disponível" },
          { id: "pendente",   label: "Pendente"   },
          { id: "pago",       label: "Pago"       },
          { id: "cancelado",  label: "Cancelado"  },
        ].map(f => (
          <button key={f.id} onClick={() => setFiltro(f.id)} style={{
            padding: "6px 12px", borderRadius: 20, fontWeight: 600, fontSize: 12,
            border: `1.5px solid ${filtro === f.id ? VERDE : "#E5E7EB"}`,
            background: filtro === f.id ? VERDE : "#fff",
            color: filtro === f.id ? "#fff" : "#6B7280",
            cursor: "pointer",
          }}>{f.label}</button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtrados.map(c => (
          <div key={c.id} style={{
            background: "#fff", border: "1.5px solid #F0F0F0",
            borderRadius: 14, padding: "12px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{c.produto}</p>
              <p style={{ fontSize: 11, color: "#9CA3AF" }}>{c.data}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: c.estado === "cancelado" ? "#DC2626" : VERDE }}>
                {c.estado === "cancelado" ? "-" : "+"}{c.valor.toLocaleString("pt-MZ")} MZN
              </p>
              <EstadoBadge estado={c.estado} />
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <div style={{ textAlign: "center", padding: 32, color: "#9CA3AF" }}>
            <p style={{ fontSize: 13 }}>Sem comissões nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SEGURANÇA ────────────────────────────────────────────────────────────────
function AbaSeguranca() {
  const REGRAS = [
    { icon: "🚫", titulo: "Auto-referência proibida",         desc: "Não podes usar o teu próprio link para comprar produtos."                             },
    { icon: "🤖", titulo: "Sem tráfego artificial",           desc: "Geração de cliques falsos ou bots resulta em banimento imediato."                     },
    { icon: "🔒", titulo: "Links validados no servidor",      desc: "Todos os links são verificados no backend. Falsificações são detectadas."             },
    { icon: "👁",  titulo: "Monitorização contínua",           desc: "O sistema analisa padrões suspeitos em tempo real 24/7."                              },
    { icon: "⚖️", titulo: "Comissões por confirmação",        desc: "A comissão só é creditada após confirmação definitiva da compra."                     },
    { icon: "🔄", titulo: "Cancelamentos anulam comissão",    desc: "Se a compra for cancelada, a comissão é automaticamente removida."                    },
  ];

  const PENALIDADES = [
    { acao: "Comprar com próprio link",  penalidade: "Comissão cancelada"  },
    { acao: "Cliques falsos detectados", penalidade: "Conta suspensa"      },
    { acao: "Fraude confirmada",         penalidade: "Banimento permanente" },
    { acao: "Métodos ilegais",           penalidade: "Acção legal"          },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Aviso */}
      <div style={{
        background: "#FEF2F2", border: "1px solid #FECACA",
        borderRadius: 16, padding: 16,
        display: "flex", gap: 12,
      }}>
        <AlertTriangle size={20} style={{ color: "#DC2626", flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#DC2626" }}>Política de Uso Justo</p>
          <p style={{ fontSize: 12, color: "#7F1D1D", lineHeight: 1.6, marginTop: 4 }}>
            O sistema de afiliados é monitorizado 24h. Fraudes resultam em banimento e perda de todas as comissões acumuladas.
          </p>
        </div>
      </div>

      {/* Regras */}
      <div style={{ borderRadius: 16, border: "1px solid #F0F0F0", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", background: "#F9FAFB", borderBottom: "1px solid #F0F0F0" }}>
          <p style={{ fontWeight: 700, fontSize: 13 }}>Regras do Programa</p>
        </div>
        {REGRAS.map((r, i) => (
          <div key={i} style={{
            padding: "12px 16px",
            borderBottom: i < REGRAS.length - 1 ? "1px solid #F9FAFB" : "none",
            display: "flex", gap: 12,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{r.titulo}</p>
              <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2, lineHeight: 1.5 }}>{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Penalidades */}
      <div style={{ borderRadius: 16, border: "1px solid #F0F0F0", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", background: "#FEF2F2", borderBottom: "1px solid #FECACA" }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#DC2626" }}>Tabela de Penalidades</p>
        </div>
        {PENALIDADES.map((p, i) => (
          <div key={i} style={{
            padding: "10px 16px",
            borderBottom: i < PENALIDADES.length - 1 ? "1px solid #F9FAFB" : "none",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <p style={{ fontSize: 13, color: "#374151" }}>{p.acao}</p>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", background: "#FEF2F2", padding: "3px 8px", borderRadius: 8 }}>
              {p.penalidade}
            </span>
          </div>
        ))}
      </div>

      {/* Estado conta */}
      <div style={{
        background: VERDE_LIGHT, border: `1px solid ${VERDE}30`,
        borderRadius: 16, padding: 16,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Shield size={24} style={{ color: VERDE }} />
        <div>
          <p style={{ fontWeight: 700, fontSize: 13, color: VERDE_DARK }}>Conta em Bom Estado</p>
          <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Nenhuma violação detectada. Continua assim! ✅</p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function SecaoAfiliados() {
  const [tabActiva, setTabActiva] = useState("visao");

  const conteudo = {
    visao:     <AbaVisaoGeral />,
    links:     <AbaMeusLinks />,
    explorar:  <AbaExplorar />,
    comissoes: <AbaComissoes />,
    seguranca: <AbaSeguranca />,
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 480, margin: "0 auto", background: "#fff" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111", margin: 0 }}>Programa de Afiliados</h2>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Ganha comissões partilhando produtos</p>
          </div>
          <div style={{
            background: NIVEIS[AFILIADO.nivel].bg,
            border: `1.5px solid ${NIVEIS[AFILIADO.nivel].cor}50`,
            borderRadius: 12, padding: "6px 10px", textAlign: "center"
          }}>
            <p style={{ fontSize: 18 }}>{NIVEIS[AFILIADO.nivel].icon}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: NIVEIS[AFILIADO.nivel].cor }}>
              {NIVEIS[AFILIADO.nivel].label}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 14, borderBottom: "1.5px solid #F0F0F0" }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const activa = tabActiva === id;
            return (
              <button
                key={id}
                onClick={() => setTabActiva(id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 4, padding: "8px 14px",
                  borderRadius: 12,
                  background: activa ? VERDE : "transparent",
                  border: activa ? "none" : "1.5px solid #F0F0F0",
                  cursor: "pointer", flexShrink: 0,
                  transition: "all .15s",
                }}
              >
                <Icon size={15} style={{ color: activa ? "#fff" : "#9CA3AF" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: activa ? "#fff" : "#9CA3AF", whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        {conteudo[tabActiva]}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        input { font-family: inherit; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default SecaoAfiliados;