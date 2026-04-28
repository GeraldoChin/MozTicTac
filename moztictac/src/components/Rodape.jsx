import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, Heart, Share2, Wallet, Shield,
  MessageCircle, HelpCircle, Star,
  ChevronRight, Send, CheckCircle, MapPin,
  Phone, Mail, ArrowUpRight,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";

// ─── tokens (idênticos ao restante da plataforma) ─────────────────────────────
const V       = "#00b96b";
const V_ESC   = "#009a5a";
const V_LIGHT = "#e6f9f0";

// ─── secções de links ─────────────────────────────────────────────────────────
const LINKS = [
  {
    titulo: "Comprar",
    icone: ShoppingBag,
    items: [
      { label: "Explorar Produtos",    rota: "/" },
      { label: "Categorias",           rota: "/" },
      { label: "Produtos em Destaque", rota: "/" },
      { label: "Novidades",            rota: "/" },
      { label: "Meu Carrinho",         rota: "/carrinho" },
      { label: "Minhas Compras",       rota: "/minhas-compras" },
    ],
  },
  {
    titulo: "Vender",
    icone: ArrowUpRight,
    items: [
      { label: "Começar a Vender",     rota: "/minhas-vendas" },
      { label: "Publicar Produto",     rota: "/minhas-vendas" },
      { label: "Publicar Serviço",     rota: "/minhas-vendas" },
      { label: "Gerir Publicações",    rota: "/minhas-vendas" },
      { label: "As Minhas Vendas",     rota: "/minhas-vendas" },
      { label: "Estatísticas",         rota: "/minhas-vendas" },
    ],
  },
  {
    titulo: "Afiliados",
    icone: Share2,
    items: [
      { label: "Como Funciona",        rota: "/afiliados" },
      { label: "Produtos Elegíveis",   rota: "/afiliados" },
      { label: "Os Meus Links",        rota: "/afiliados" },
      { label: "Os Meus Ganhos",       rota: "/afiliados" },
      { label: "Estatísticas",         rota: "/afiliados" },
      { label: "Histórico",            rota: "/historico" },
    ],
  },
  {
    titulo: "Conta & Ajuda",
    icone: HelpCircle,
    items: [
      { label: "O Meu Perfil",         rota: "/perfil" },
      { label: "Carteira Digital",     rota: "/minha-carteira" },
      { label: "Notificações",         rota: "/notificacoes" },
      { label: "Centro de Ajuda",      rota: "/ajuda" },
      { label: "FAQs",                 rota: "/ajuda" },
      { label: "Suporte / Chat",       rota: "/chat" },
    ],
  },
];

const PAGAMENTOS = ["M-Pesa", "E-Mola", "mKesh", "Visa"];

const REDES = [
  { Icone: FaFacebook,  href: "#", label: "Facebook"  },
  { Icone: FaInstagram, href: "#", label: "Instagram" },
  { Icone: FaXTwitter,  href: "#", label: "Twitter"   },
  { Icone: FaYoutube,   href: "#", label: "YouTube"   },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function LinkItem({ label, rota, navigate }) {
  return (
    <li>
      <button
        onClick={() => navigate(rota)}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent group"
      >
        <ChevronRight
          size={11}
          className="text-gray-600 group-hover:text-green-400 transition-colors shrink-0"
        />
        {label}
      </button>
    </li>
  );
}

// ─── newsletter ───────────────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail]     = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro]       = useState(false);

  function submeter() {
    if (!email.includes("@")) { setErro(true); return; }
    setErro(false);
    setEnviado(true);
    setEmail("");
    setTimeout(() => setEnviado(false), 4000);
  }

  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
        Newsletter
      </p>
      <p className="text-sm text-gray-400 mb-3 leading-relaxed">
        Recebe ofertas, novidades e dicas directamente no teu email.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setErro(false); }}
          onKeyDown={e => e.key === "Enter" && submeter()}
          placeholder="o.teu@email.com"
          className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-colors bg-white/5 text-white placeholder-gray-500"
          style={{ borderColor: erro ? "#ef4444" : "#374151" }}
        />
        <button
          onClick={submeter}
          className="w-11 h-10 flex items-center justify-center rounded-xl cursor-pointer border-none transition-colors shrink-0"
          style={{ background: V }}
          onMouseEnter={e => (e.currentTarget.style.background = V_ESC)}
          onMouseLeave={e => (e.currentTarget.style.background = V)}
        >
          {enviado ? <CheckCircle size={16} className="text-white" /> : <Send size={15} className="text-white" />}
        </button>
      </div>
      {erro && <p className="text-xs text-red-400 mt-1.5">Introduz um email válido.</p>}
      {enviado && (
        <p className="text-xs mt-1.5 font-semibold" style={{ color: V }}>
          ✓ Subscrito com sucesso!
        </p>
      )}
    </div>
  );
}

// ─── componente principal ─────────────────────────────────────────────────────
export function Rodape() {
  const navigate = useNavigate();
  const ano      = new Date().getFullYear();

  return (
    <footer style={{ background: "#0d1117" }} className="mt-auto">

      {/* ── faixa de confiança ── */}
      {/* <div style={{ background: "#111827", borderBottom: "1px solid #1f2937" }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { Icone: Shield,         titulo: "Compra Protegida",    desc: "Escrow em todas as compras"   },
              { Icone: Wallet,         titulo: "Pagamento Local",      desc: "M-Pesa, E-Mola, mKesh, Visa" },
              { Icone: Star,           titulo: "Vendedores Avaliados", desc: "Classificações verificadas"   },
              { Icone: MessageCircle,  titulo: "Suporte Activo",       desc: "Chat em tempo real"           },
            ].map(({ Icone, titulo, desc }) => (
              <div key={titulo} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: V_LIGHT }}
                >
                  <Icone size={16} style={{ color: V }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{titulo}</p>
                  <p className="text-[11px] text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* ── corpo principal ── */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">

          {/* coluna da marca */}
          <div className="lg:col-span-2 space-y-5">

            {/* logo */}
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: V }}
              >
                <ShoppingBag size={18} className="text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Moz<span style={{ color: V }}>TicTac</span>
              </span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              O mercado que Moçambique merecia. Compra, vende e ganha comissões — tudo numa conta única, com pagamento em Meticais.
            </p>

            {/* contactos */}
            <div className="space-y-2">
              {[
                { Icone: MapPin, texto: "Maputo, Moçambique"         },
                { Icone: Mail,   texto: "suporte@moztictac.mz"       },
                { Icone: Phone,  texto: "+258 84 000 0000"           },
              ].map(({ Icone, texto }) => (
                <div key={texto} className="flex items-center gap-2">
                  <Icone size={13} style={{ color: V }} className="shrink-0" />
                  <span className="text-xs text-gray-400">{texto}</span>
                </div>
              ))}
            </div>

            {/* redes sociais */}
            <div className="flex items-center gap-2">
              {REDES.map(({ Icone, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: "#1f2937" }}
                  onMouseEnter={e => (e.currentTarget.style.background = V)}
                  onMouseLeave={e => (e.currentTarget.style.background = "#1f2937")}>
                  <Icone size={15} className="text-gray-400 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* colunas de links */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {LINKS.map(({ titulo, icone: Icone, items }) => (
              <div key={titulo}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Icone size={11} style={{ color: V }} />
                  {titulo}
                </p>
                <ul className="space-y-2">
                  {items.map(item => (
                    <LinkItem key={item.label} {...item} navigate={navigate} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* newsletter */}
        {/* <div
          className="mt-10 p-6 rounded-2xl"
          style={{ background: "#111827", border: "1px solid #1f2937" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-base font-black text-white mb-1">
                Fica sempre à frente das ofertas 🎯
              </p>
              <p className="text-sm text-gray-400">
                Os melhores negócios do MozTicTac directamente na tua caixa de entrada.
              </p>
            </div>
            <Newsletter />
          </div>
        </div> */}
      </div>

      {/* ── rodapé inferior ── */}
      <div style={{ borderTop: "1px solid #1f2937" }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

            {/* copyright */}
            <p className="text-xs text-gray-500 text-center sm:text-left">
              © {ano} MozTicTac. Todos os direitos reservados.
              {" "}Feito com{" "}
              <Heart size={10} fill="#ef4444" stroke="#ef4444" className="inline -mt-0.5" />
              {" "}em Moçambique.
            </p>

            {/* formas de pagamento */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-medium">Pagamentos:</span>
              {PAGAMENTOS.map(p => (
                <span
                  key={p}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg text-gray-300"
                  style={{ background: "#1f2937" }}
                >
                  {p}
                </span>
              ))}
            </div>

            {/* links legais */}
            <div className="flex items-center gap-4">
              {["Privacidade", "Termos", "Cookies"].map(l => (
                <button key={l}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer border-none bg-transparent">
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}