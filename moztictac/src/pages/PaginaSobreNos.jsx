import { useState } from "react";
import {
  Shield,
  Wallet,
  Users,
  Store,
  Share2,
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  ArrowRight,
  Star,
  CheckCircle,
  Globe,
  Lock,
  TrendingUp,
  Heart,
  MessageCircle,
} from "lucide-react";

// ─── Cabecalho placeholder (substitui pelo teu import real) ──────────────────
// import { Cabecalho } from "../components/Cabecalho";
function Cabecalho({ valorPesquisa, aoMudarPesquisa }) {
  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontWeight: 900, fontSize: 20, color: "#00b96b" }}>
        MozTicTac
      </span>
      <input
        type="text"
        placeholder="Pesquisar..."
        value={valorPesquisa}
        onChange={(e) => aoMudarPesquisa(e.target.value)}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "6px 14px",
          fontSize: 13,
          outline: "none",
          width: 220,
        }}
      />
    </header>
  );
}

const VERDE = "#00b96b";
const VERDE_ESCURO = "#009a5a";

// ─── helpers ──────────────────────────────────────────────────────────────────
function BotaoVerde({
  children,
  onClick,
  variante = "solid",
  tamanho = "md",
}) {
  const pad = tamanho === "sm" ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm";
  const base = `${pad} flex items-center justify-center gap-2 font-semibold rounded-xl cursor-pointer transition-colors border-none`;
  if (variante === "outline") {
    return (
      <button
        onClick={onClick}
        className={base}
        style={{
          border: `2px solid ${VERDE}`,
          color: VERDE,
          background: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = VERDE;
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = VERDE;
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={base}
      style={{ background: VERDE, color: "white" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = VERDE_ESCURO)}
      onMouseLeave={(e) => (e.currentTarget.style.background = VERDE)}
    >
      {children}
    </button>
  );
}

// ─── ícone Facebook personalizado ─────────────────────────────────────────────
function IconeFacebook({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconeInstagram({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function IconeTwitter({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

// ─── secção hero ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative overflow-hidden py-20 px-4"
      style={{
        background: "linear-gradient(135deg, #004d2e 0%, #00b96b 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto text-center text-white relative z-10">
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          Mercado Moçambicano
        </span>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
          Uma plataforma feita
          <br />
          <span style={{ color: "#a7f3d0" }}>para Moçambique.</span>
        </h1>
        <p className="text-base text-green-100 max-w-xl mx-auto leading-relaxed">
          O MozTicTac nasceu para ligar compradores e vendedores de todo o país
          numa única plataforma segura, local e em Meticais.
        </p>
      </div>

      {/* círculos decorativos */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
        style={{ background: "white" }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
        style={{ background: "white" }}
      />
    </section>
  );
}

// ─── missão ───────────────────────────────────────────────────────────────────
function Missao() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* texto */}
          <div className="flex-1 space-y-5">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: VERDE }}
            >
              A Nossa Missão
            </span>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              Compra. Vende. Cresce.
              <br />
              <span style={{ color: VERDE }}>Tudo numa conta.</span>
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Criámos o MozTicTac para resolver um problema real: Moçambique
              precisava de um marketplace local, seguro, que falasse a língua
              dos moçambicanos e usasse os meios de pagamento que já conhecem —
              M-Pesa, E-Mola e mKesh.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Sem burocracia. Sem papéis separados. Uma única conta para
              comprar, vender e ganhar como afiliado — com pagamento retido em
              escrow para garantir a segurança de todos.
            </p>
            <BotaoVerde>
              Começar agora
              <ArrowRight size={15} />
            </BotaoVerde>
          </div>

          {/* cartões de valores */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              {
                Icone: Shield,
                titulo: "Segurança",
                desc: "Pagamento em escrow protegido até à entrega.",
              },
              {
                Icone: Wallet,
                titulo: "Pagamentos Locais",
                desc: "M-Pesa, E-Mola e mKesh. Tudo em Meticais.",
              },
              {
                Icone: Globe,
                titulo: "10 Províncias",
                desc: "Compra e vende em qualquer ponto do país.",
              },
              {
                Icone: Users,
                titulo: "3-em-1",
                desc: "Comprador, vendedor e afiliado numa só conta.",
              },
            ].map(({ Icone, titulo, desc }) => (
              <div
                key={titulo}
                className="p-4 rounded-2xl border border-gray-100 bg-gray-50 space-y-2 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#e6f9f0" }}
                >
                  <Icone size={18} style={{ color: VERDE }} />
                </div>
                <p className="text-sm font-bold text-gray-900">{titulo}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── números ──────────────────────────────────────────────────────────────────
function Numeros() {
  const stats = [
    { valor: "10+", label: "Províncias cobertas", Icone: MapPin },
    { valor: "5.000+", label: "Utilizadores activos", Icone: Users },
    { valor: "1.200+", label: "Produtos listados", Icone: Store },
    { valor: "98%", label: "Satisfação dos clientes", Icone: Star },
  ];

  return (
    <section className="py-14 px-4" style={{ background: VERDE }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stats.map(({ valor, label, Icone }) => (
          <div key={label} className="text-center text-white">
            <Icone size={22} className="mx-auto mb-2 opacity-80" />
            <p className="text-3xl font-black">{valor}</p>
            <p className="text-sm opacity-80 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── como funciona ────────────────────────────────────────────────────────────
function ComoFunciona() {
  const passos = [
    {
      num: "01",
      Icone: Users,
      titulo: "Cria a tua conta",
      desc: "Regista-te com email, confirma com OTP e já tens acesso a tudo — compra, venda e afiliados.",
    },
    {
      num: "02",
      Icone: Store,
      titulo: "Compra ou publica",
      desc: "Pesquisa produtos perto de ti, filtra por província, preço e entrega. Ou publica o teu produto em segundos.",
    },
    {
      num: "03",
      Icone: Wallet,
      titulo: "Paga com segurança",
      desc: "O pagamento fica retido em escrow. O vendedor só recebe depois de confirmares a entrega.",
    },
    {
      num: "04",
      Icone: Share2,
      titulo: "Ganha como afiliado",
      desc: "Partilha links de produtos e ganha comissão por cada venda gerada. Entre 5% e 20% por venda.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: VERDE }}
          >
            Como Funciona
          </span>
          <h2 className="text-3xl font-black text-gray-900 mt-2">
            Uma conta.{" "}
            <span style={{ color: VERDE }}>Três formas de ganhar.</span>
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm">
            Sem burocracia. Activa o papel que queres, quando quiseres — tudo
            na mesma conta e carteira digital.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {passos.map(({ num, Icone, titulo, desc }) => (
            <div
              key={num}
              className="relative p-5 rounded-2xl border border-gray-100 bg-gray-50 space-y-3 hover:shadow-md transition-shadow"
            >
              <span
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: VERDE }}
              >
                Passo {num}
              </span>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "#e6f9f0" }}
              >
                <Icone size={22} style={{ color: VERDE }} />
              </div>
              <p className="text-sm font-bold text-gray-900">{titulo}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── valores ──────────────────────────────────────────────────────────────────
function Valores() {
  const valores = [
    {
      Icone: Lock,
      titulo: "Segurança total",
      desc: "Todas as transacções são protegidas por escrow e autenticação reforçada com OTP por email.",
    },
    {
      Icone: Heart,
      titulo: "Confiança",
      desc: "Avaliações verificadas, histórico transparente e suporte humano para qualquer disputa.",
    },
    {
      Icone: TrendingUp,
      titulo: "Crescimento",
      desc: "Ferramentas de venda, afiliados e estatísticas para ajudar qualquer moçambicano a crescer.",
    },
    {
      Icone: Globe,
      titulo: "Alcance nacional",
      desc: "Filtra por província, cidade e bairro. Chegamos a todas as 10 províncias de Moçambique.",
    },
    {
      Icone: CheckCircle,
      titulo: "Transparência",
      desc: "Preços claros, taxas visíveis e trilha de auditoria completa para todas as operações.",
    },
    {
      Icone: Wallet,
      titulo: "Pagamentos locais",
      desc: "M-Pesa, E-Mola, mKesh — sem conversões, sem surpresas. Tudo em Meticais.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: VERDE }}
          >
            Os Nossos Valores
          </span>
          <h2 className="text-3xl font-black text-gray-900 mt-2">
            Construído com propósito
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {valores.map(({ Icone, titulo, desc }) => (
            <div
              key={titulo}
              className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow space-y-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#e6f9f0" }}
              >
                <Icone size={18} style={{ color: VERDE }} />
              </div>
              <p className="text-sm font-bold text-gray-900">{titulo}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── equipa ───────────────────────────────────────────────────────────────────
function Equipa() {
  const membros = [
    {
      iniciais: "AM",
      nome: "Ana Machava",
      cargo: "CEO & Co-fundadora",
      cor: VERDE,
    },
    {
      iniciais: "JM",
      nome: "João Machava",
      cargo: "CTO & Co-fundador",
      cor: "#3b82f6",
    },
    {
      iniciais: "FL",
      nome: "Fátima Langa",
      cargo: "Head de Produto",
      cor: "#f97316",
    },
    {
      iniciais: "CS",
      nome: "Carlos Sitoe",
      cargo: "Head de Operações",
      cor: "#8b5cf6",
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: VERDE }}
          >
            A Nossa Equipa
          </span>
          <h2 className="text-3xl font-black text-gray-900 mt-2">
            Pessoas reais, missão real
          </h2>
          <p className="text-gray-500 mt-3 text-sm max-w-md mx-auto">
            Moçambicanos que acreditam que a tecnologia pode transformar o
            comércio local.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {membros.map((m) => (
            <div key={m.nome} className="text-center space-y-3">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto"
                style={{ background: m.cor }}
              >
                {m.iniciais}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{m.nome}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.cargo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── contacto ─────────────────────────────────────────────────────────────────
function Contacto() {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* info */}
        <div className="flex-1 space-y-6">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: VERDE }}
          >
            Contacto
          </span>
          <h2 className="text-3xl font-black text-gray-900">Fala connosco</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Tens uma dúvida, sugestão ou queres saber mais sobre o MozTicTac? A
            nossa equipa está disponível para te ajudar.
          </p>

          <div className="space-y-4">
            {[
              { Icone: Mail, texto: "support@moztictac.com" },
              { Icone: Phone, texto: "+258 844 565 456" },
              { Icone: MapPin, texto: "Maputo, Moçambique" },
            ].map(({ Icone, texto }) => (
              <div key={texto} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#e6f9f0" }}
                >
                  <Icone size={16} style={{ color: VERDE }} />
                </div>
                <p className="text-sm text-gray-700">{texto}</p>
              </div>
            ))}
          </div>

          {/* redes sociais */}
          <div className="flex gap-3 pt-2">
            {[
              { Icone: IconeInstagram, label: "Instagram" },
              { Icone: IconeFacebook, label: "Facebook" },
              { Icone: IconeTwitter, label: "Twitter" },
            ].map(({ Icone, label }) => (
              <button
                key={label}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white hover:border-green-500 cursor-pointer transition-colors"
                aria-label={label}
              >
                <Icone size={16} className="text-gray-500" />
              </button>
            ))}
          </div>
        </div>

        {/* formulário */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Nome completo",
                key: "nome",
                type: "text",
                placeholder: "O teu nome",
              },
              {
                label: "Email",
                key: "email",
                type: "email",
                placeholder: "O teu email",
              },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 transition-colors"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Mensagem
            </label>
            <textarea
              rows={5}
              placeholder="Como podemos ajudar?"
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>
          <BotaoVerde onClick={() => {}} tamanho="md">
            <MessageCircle size={15} />
            Enviar Mensagem
          </BotaoVerde>
        </div>
      </div>
    </section>
  );
}

// ─── CTA final ────────────────────────────────────────────────────────────────
function CtaFinal() {
  return (
    <section
      className="py-16 px-4 text-white text-center"
      style={{ background: "linear-gradient(135deg, #004d2e 0%, #00b96b 100%)" }}
    >
      <div className="max-w-2xl mx-auto space-y-5">
        <h2 className="text-3xl font-black">Pronto para começar?</h2>
        <p className="text-green-100 text-sm leading-relaxed">
          Junta-te a milhares de moçambicanos que já compram, vendem e ganham no
          MozTicTac.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <BotaoVerde onClick={() => {}} variante="outline">
            Criar conta grátis
            <ArrowRight size={15} />
          </BotaoVerde>
          <button
            className="px-6 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
            }
          >
            Saber mais
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── página principal ─────────────────────────────────────────────────────────
export default function PaginaSobreNos() {
  const [pesquisa, setPesquisa] = useState("");

  return (
    <div className="min-h-screen bg-white">
      <Cabecalho
        utilizadorAutenticado
        valorPesquisa={pesquisa}
        aoMudarPesquisa={setPesquisa}
        aoClicarPesquisa={() => {}}
        aoClicarConta={() => {}}
        aoClicarCarteira={() => {}}
        aoClicarCarrinho={() => {}}
        aoClicarWishlist={() => {}}
        aoClicarNotificacoes={() => {}}
        aoClicarChat={() => {}}
      />

      {/* breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <button className="hover:text-green-600 cursor-pointer transition-colors">
            Início
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Sobre Nós</span>
        </div>
      </div>

      <Hero />
      <Missao />
      <Numeros />
      <ComoFunciona />
      <Valores />
      <Equipa />
      <Contacto />
      <CtaFinal />
    </div>
  );
}