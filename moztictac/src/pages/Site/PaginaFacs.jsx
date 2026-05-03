import { useState, useMemo } from "react";
import {
  HelpCircle, User, ShoppingBag, Store, Wallet, Share2, Shield,
  LayoutGrid, UserPlus, LogIn, LockKeyhole, Users, Settings,
  ShoppingCart, SlidersHorizontal, Truck, FileText, Star,
  PlusSquare, Percent, Megaphone, CreditCard, Smartphone,
  ArrowDownLeft, Gavel, Network, Link, PiggyBank, ToggleRight,
  BadgeCheck, MailCheck, MapPinOff, Ban, Plus, Search, X,
  ChevronLeft, ChevronRight, MessageCircle, Ticket, Info,
  Globe, HeadphonesIcon, SearchX,
} from "lucide-react";
import { Header } from "../../components/Header";
import { Navbar } from "../../components/Navbar";

const GREEN = "#1db954";
const PER_PAGE = 5;

const ICON_MAP = {
  person_add: UserPlus, login: LogIn, lock_reset: LockKeyhole,
  switch_account: Users, manage_accounts: Settings,
  shopping_cart: ShoppingCart, tune: SlidersHorizontal,
  local_shipping: Truck, receipt_long: FileText, star_rate: Star,
  add_business: PlusSquare, percent: Percent, campaign: Megaphone,
  payments: CreditCard, mobile_friendly: Smartphone,
  account_balance_wallet: Wallet, south_west: ArrowDownLeft,
  gavel: Gavel, hub: Network, link: Link, savings: PiggyBank,
  toggle_on: ToggleRight, verified_user: BadgeCheck,
  mark_email_read: MailCheck, location_off: MapPinOff, block: Ban,
  apps: LayoutGrid, person: User, shopping_bag: ShoppingBag,
  storefront: Store, share: Share2, shield: Shield,
  help_outline: HelpCircle, search: Search, close: X,
  add: Plus, info: Info, chat: MessageCircle,
  confirmation_number: Ticket, public: Globe,
  support_agent: HeadphonesIcon, search_off: SearchX,
  chevron_left: ChevronLeft, chevron_right: ChevronRight,
};

function Icon({ name, size = 16, color, style }) {
  const Comp = ICON_MAP[name] || HelpCircle;
  return <Comp size={size} color={color} style={style} strokeWidth={1.8} />;
}

const FAQS = [
  { id: 1, cat: "conta", icon: "person_add", q: "Como criar uma conta no MozTicTac?", a: "Para criar a sua conta clique em \"Entrar\" e depois em \"Criar conta\". Preencha: nome completo, número de telefone, email, palavra-passe e a sua localização (província, cidade e bairro). Após submeter, receberá um código OTP no seu email para confirmar a conta.", nota: "A verificação é feita apenas por email — sem SMS." },
  { id: 2, cat: "conta", icon: "login", q: "Como faço login na plataforma?", a: "Pode entrar com o seu email ou número de telefone juntamente com a sua palavra-passe. Existe também a opção de \"entrar como convidado\" para explorar a plataforma com funcionalidades limitadas." },
  { id: 3, cat: "conta", icon: "lock_reset", q: "Esqueci-me da palavra-passe. Como recupero?", a: "Na página de login, clique em \"Esqueci a palavra-passe\". Introduza o seu email e receberá um código OTP para redefinir a senha. O código expira em poucos minutos por motivos de segurança." },
  { id: 4, cat: "conta", icon: "switch_account", q: "Preciso de contas separadas para comprar, vender e ser afiliado?", a: "Não. O MozTicTac usa uma única conta para tudo. Com a mesma conta pode comprar produtos, publicar como vendedor e participar no programa de afiliados — sem papéis visíveis e complicados." },
  { id: 5, cat: "conta", icon: "manage_accounts", q: "Como editar o meu perfil?", a: "No seu perfil pode: alterar dados pessoais (nome, telefone, localização), actualizar a foto de perfil, mudar a palavra-passe, ver o histórico de actividade e gerir preferências de notificação." },
  { id: 6, cat: "compras", icon: "shopping_cart", q: "Como comprar um produto ou serviço?", a: "Pesquise ou navegue pelas categorias disponíveis. Ao encontrar o que procura, converse com o vendedor via chat, adicione ao carrinho e pague dentro da plataforma. Após receber, confirme a entrega e avalie o vendedor." },
  { id: 7, cat: "compras", icon: "tune", q: "Que filtros estão disponíveis para pesquisar?", a: "Pode filtrar por: província, cidade e bairro, distância em quilómetros, preço mínimo e máximo (MZN), estado (novo ou usado), tipo (produto ou serviço), entrega disponível e categoria." },
  { id: 8, cat: "compras", icon: "local_shipping", q: "Como acompanhar o meu pedido?", a: "Aceda a \"Minhas Compras\" no seu perfil para ver todos os pedidos. Receberá notificações automáticas sobre o estado. Após receber, confirme a entrega para que o pagamento seja libertado ao vendedor." },
  { id: 9, cat: "compras", icon: "receipt_long", q: "Posso obter recibos e comprovativos das minhas compras?", a: "Sim. O MozTicTac permite descarregar recibos e comprovativos em PDF. Aceda ao histórico de compras, seleccione a transacção e clique em \"Imprimir recibo\"." },
  { id: 10, cat: "compras", icon: "star_rate", q: "Como avaliar um vendedor após a compra?", a: "Após confirmar a recepção do produto ou serviço, poderá atribuir uma avaliação ao vendedor. Esta avaliação ajuda outros compradores a tomar decisões informadas e contribui para a confiança na plataforma." },
  { id: 11, cat: "vendas", icon: "add_business", q: "Como publicar um produto ou serviço para vender?", a: "Aceda a \"Minhas Vendas\" e clique em \"Publicar\". Preencha: tipo (produto ou serviço), fotos, nome, descrição, categoria, estado, preço, quantidade, opção de entrega, formas de pagamento aceites e dados da conta de recebimento." },
  { id: 12, cat: "vendas", icon: "percent", q: "Existe alguma taxa para vender na plataforma?", a: "O MozTicTac pode aplicar taxas de processamento e de plataforma, definidas pela administração. O comprador vê apenas o preço final. Como vendedor, verá sempre um resumo financeiro claro com a sua parte após as deduções." },
  { id: 13, cat: "vendas", icon: "campaign", q: "Como promover o meu produto para aparecer no topo?", a: "No formulário de publicação, active \"Promover anúncio\" e efectue o pagamento correspondente. O item aparece no topo da listagem como destaque pelo período que escolher. Regras e preços são definidos pela administração." },
  { id: 14, cat: "vendas", icon: "payments", q: "Quando é que recebo o pagamento das minhas vendas?", a: "O MozTicTac usa sistema escrow: o comprador paga, o dinheiro fica retido e só é libertado para a sua carteira após confirmação de entrega pelo comprador. Em caso de disputa, a administração pode intervir.", nota: "Este sistema protege tanto o comprador como o vendedor." },
  { id: 15, cat: "pagamentos", icon: "mobile_friendly", q: "Que métodos de pagamento estão disponíveis?", a: "Pode pagar com M-Pesa, E-Mola, mKesh e Visa. Todos os pagamentos são feitos em Meticais (MZN). Outros métodos poderão ser adicionados no futuro." },
  { id: 16, cat: "pagamentos", icon: "account_balance_wallet", q: "O que é a Carteira Digital e como funciona?", a: "A Carteira Digital é o seu centro financeiro dentro da plataforma. Mostra o saldo total, disponível e pendente. Com ela pode depositar, levantar para M-Pesa/E-Mola/mKesh, pagar compras, receber pagamentos e ver o histórico completo." },
  { id: 17, cat: "pagamentos", icon: "south_west", q: "Como faço para levantar dinheiro da minha carteira?", a: "Em \"Carteira\", clique em \"Levantar\", introduza o valor e a conta de destino (M-Pesa, E-Mola ou mKesh). O sistema pede confirmação por segurança antes de processar. O histórico de levantamentos fica sempre registado." },
  { id: 18, cat: "pagamentos", icon: "gavel", q: "O que acontece se houver um problema com o pagamento ou entrega?", a: "Em caso de disputa, a administração pode intervir e forçar a resolução. O sistema escrow garante que o dinheiro não é libertado sem confirmação de entrega. Abra um ticket de suporte para reportar qualquer problema." },
  { id: 19, cat: "afiliados", icon: "hub", q: "Como funciona o programa de afiliados?", a: "Gere um link único para qualquer produto elegível e partilhe-o onde quiser (WhatsApp, redes sociais, etc.). Cada venda feita através do seu link gera uma comissão. Acompanhe cliques, conversões e ganhos na secção \"Afiliados\"." },
  { id: 20, cat: "afiliados", icon: "link", q: "Como gerar e partilhar um link de afiliado?", a: "Em \"Afiliados\" encontre o produto, clique em \"Gerar link\", copie e partilhe. Quando alguém abrir o link, será redirecionado para o produto e o sistema identifica automaticamente que a venda veio através de si." },
  { id: 21, cat: "afiliados", icon: "savings", q: "Quanto posso ganhar como afiliado?", a: "A comissão é definida pelo vendedor, dentro dos limites permitidos pela plataforma. Verifique a percentagem de cada produto na lista de afiliados. Os ganhos acumulam na sua Carteira Digital e pode levantar quando quiser." },
  { id: 22, cat: "afiliados", icon: "toggle_on", q: "Como activar afiliados nos meus produtos (como vendedor)?", a: "No formulário de publicação, active a opção \"Permitir afiliados\" e defina a percentagem de comissão dentro dos limites do sistema. Pode gerir esta opção a qualquer momento nas suas publicações." },
  { id: 23, cat: "seguranca", icon: "verified_user", q: "O MozTicTac é seguro para fazer transacções?", a: "Sim. A plataforma usa encriptação de dados, autenticação JWT, protecção contra SQL injection, XSS e CSRF, rate limiting, sistema escrow e histórico imutável de todas as operações financeiras." },
  { id: 24, cat: "seguranca", icon: "mark_email_read", q: "O que é o código OTP e para que serve?", a: "O OTP é um código temporário enviado ao seu email para confirmar a conta, recuperar senha e validar operações sensíveis. A verificação é feita exclusivamente por email — nunca por SMS.", nota: "Nunca partilhe o seu código OTP com ninguém." },
  { id: 25, cat: "seguranca", icon: "location_off", q: "A minha localização exacta é partilhada com outros utilizadores?", a: "Não. O MozTicTac mostra apenas a distância em quilómetros entre utilizadores e produtos. Coordenadas exactas nunca são expostas, protegendo a privacidade de todos." },
  { id: 26, cat: "seguranca", icon: "block", q: "A minha conta foi suspensa. O que devo fazer?", a: "Se a sua conta foi suspensa, contacte o suporte via chat ou abra um ticket explicando a situação. A administração analisa os casos e pode reverter a suspensão. As suspensões são aplicadas em caso de violação das regras da plataforma." },
];

const CATS = [
  { id: "todos",      label: "Todos",      icon: "apps" },
  { id: "conta",      label: "Conta",      icon: "person" },
  { id: "compras",    label: "Compras",    icon: "shopping_bag" },
  { id: "vendas",     label: "Vendas",     icon: "storefront" },
  { id: "pagamentos", label: "Pagamentos", icon: "account_balance_wallet" },
  { id: "afiliados",  label: "Afiliados",  icon: "share" },
  { id: "seguranca",  label: "Segurança",  icon: "shield" },
];

const STATS = [
  { icon: "verified_user", strong: "100% Seguro",   sub: "Pagamentos protegidos" },
  { icon: "public",        strong: "10 Províncias", sub: "Cobertura nacional" },
  { icon: "payments",      strong: "100% MZN",      sub: "M-Pesa, E-Mola, mKesh" },
  { icon: "support_agent", strong: "Suporte activo",sub: "Chat e tickets" },
];

/* ── Accordion item ── */
function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className="bg-white border overflow-hidden cursor-pointer mb-3 transition-all duration-200"
      style={{
        borderColor: isOpen ? GREEN : "#e5e7eb",
        boxShadow: isOpen ? `0 0 0 3px rgba(29,185,84,0.08)` : "none",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-4 transition-colors duration-150"
        style={{ background: isOpen ? "#f0fdf4" : "white" }}
      >
        <div
          className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors duration-150"
          style={{ background: isOpen ? GREEN : "#f0fdf4" }}
        >
          <Icon name={item.icon} size={16} color={isOpen ? "white" : GREEN} />
        </div>
        <span className="flex-1 font-semibold text-gray-900 text-sm leading-snug">{item.q}</span>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            background: isOpen ? GREEN : "#f3f4f6",
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <Icon name="add" size={16} color={isOpen ? "white" : "#6b7280"} />
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          maxHeight: isOpen ? "400px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="px-5 pb-5 pt-1 pl-[68px]">
          <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
          {item.nota && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
              <Icon name="info" size={13} color="#15803d" />
              {item.nota}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Paginação ── */
function Pagination({ page, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  function pageNumbers() {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const nums = [1];
    if (page > 3) nums.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) nums.push(i);
    if (page < pages - 2) nums.push("...");
    nums.push(pages);
    return nums;
  }

  const startItem = (page - 1) * PER_PAGE + 1;
  const endItem   = Math.min(page * PER_PAGE, total);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-8">
      <span className="text-xs text-gray-400">
        {startItem}–{endItem} de {total} pergunta{total !== 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white text-gray-500 rounded-md disabled:opacity-30 hover:border-green-500 hover:text-green-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className="w-8 h-8 flex items-center justify-center border rounded-md text-xs font-bold transition-all cursor-pointer"
              style={{
                background:   page === p ? GREEN : "white",
                borderColor:  page === p ? GREEN : "#e5e7eb",
                color:        page === p ? "white" : "#6b7280",
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={page === pages}
          onClick={() => onChange(page + 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white text-gray-500 rounded-md disabled:opacity-30 hover:border-green-500 hover:text-green-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Página principal ── */
export default function PaginaFAQ() {
  const [activeCat, setActiveCat] = useState("todos");
  const [openId,    setOpenId]    = useState(null);
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);

  const filtered = useMemo(() => {
    let list = activeCat === "todos" ? FAQS : FAQS.filter((f) => f.cat === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
    }
    return list;
  }, [activeCat, search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage    = Math.min(page, totalPages);
  const pageItems   = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function handleSearch(val) {
    setSearch(val);
    if (val) setActiveCat("todos");
    setOpenId(null);
    setPage(1);
  }

  function handleCat(id) {
    setActiveCat(id);
    setSearch("");
    setOpenId(null);
    setPage(1);
  }

  function handlePage(p) {
    setPage(p);
    setOpenId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans"> 
      <Header />
      <Navbar />
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">

        {/* Imagem de fundo — substitua o src pela sua imagem */}
        <img
          src="img/img3.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlay escuro degradê para manter legibilidade do texto */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(5,46,22,0.93) 0%, rgba(20,83,45,0.88) 50%, rgba(22,101,52,0.85) 100%)" }}
        />

        {/* Brilho verde subtil na base */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 110%, rgba(29,185,84,0.22) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-center">

          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-green-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <HelpCircle size={14} />
            Central de Ajuda
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Como podemos <span style={{ color: GREEN }}>ajudar?</span>
          </h1>
          <p className="text-white/60 text-base mb-8 max-w-md mx-auto">
            Encontre respostas rápidas sobre compras, vendas, pagamentos, afiliados e muito mais.
          </p>

          {/* Search */}
          <div className="flex bg-white overflow-hidden shadow-2xl max-w-lg mx-auto">
            <div className="flex items-center pl-4 text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Pesquise uma questão..."
              className="flex-1 px-3 py-4 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent"
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="px-3 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer flex items-center"
              >
                <X size={17} />
              </button>
            )}
            <button
              className="px-6 text-sm font-bold text-white border-none cursor-pointer"
              style={{ background: GREEN }}
            >
              Pesquisar
            </button>
          </div>

          {/* Quick cat pills */}
          <div className="flex gap-2 flex-wrap justify-center mt-5">
            {["conta", "compras", "vendas", "pagamentos", "afiliados"].map((c) => (
              <button
                key={c}
                onClick={() => handleCat(c)}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg border transition-all capitalize cursor-pointer"
                style={{
                  borderColor: activeCat === c && !search ? GREEN : "rgba(255,255,255,0.2)",
                  color:       activeCat === c && !search ? "white" : "rgba(255,255,255,0.7)",
                  background:  activeCat === c && !search ? GREEN : "transparent",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex gap-6 flex-wrap">
          {STATS.map((s) => (
            <div key={s.strong} className="flex items-center gap-2.5">
              <Icon name={s.icon} size={18} color={GREEN} />
              <div className="leading-tight">
                <div className="text-sm font-bold" style={{ color: GREEN }}>{s.strong}</div>
                <div className="text-xs text-gray-400">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className="max-w-4xl mx-auto px-6 py-12">

        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Perguntas Frequentes</p>
        <h2 className="text-xl font-bold text-gray-900 mb-8">Tudo o que precisa de saber</h2>

        {/* Tabs */}
        {!search && (
          <div className="flex gap-2 flex-wrap mb-8 pb-5 border-b border-gray-100">
            {CATS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCat(c.id)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border transition-all cursor-pointer"
                style={{
                  borderColor: activeCat === c.id ? GREEN : "#e5e7eb",
                  color:       activeCat === c.id ? "white" : "#6b7280",
                  background:  activeCat === c.id ? GREEN : "white",
                  borderRadius: "0",
                }}
              >
                <Icon name={c.icon} size={15} color={activeCat === c.id ? "white" : "#6b7280"} />
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Search info */}
        {search && (
          <div className="mb-5 flex items-center gap-2 text-sm text-gray-400">
            <Search size={14} color={GREEN} />
            <span>
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para{" "}
              <strong className="text-gray-700">"{search}"</strong>
            </span>
            <button
              onClick={() => handleSearch("")}
              className="ml-2 font-semibold border-none bg-transparent cursor-pointer text-sm"
              style={{ color: GREEN }}
            >
              Limpar
            </button>
          </div>
        )}

        {/* FAQ list */}
        {filtered.length > 0 ? (
          <>
            {pageItems.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              />
            ))}
            <Pagination
              page={safePage}
              total={filtered.length}
              onChange={handlePage}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <SearchX size={26} color="#d1d5db" />
            </div>
            <p className="text-gray-600 font-semibold text-sm">Nenhuma pergunta encontrada</p>
            <p className="text-gray-400 text-xs mt-1 mb-4">Tente palavras diferentes ou contacte o suporte.</p>
            <button
              onClick={() => handleSearch("")}
              className="text-sm font-bold px-5 py-2 text-white border-none cursor-pointer"
              style={{ background: GREEN }}
            >
              Limpar pesquisa
            </button>
          </div>
        )}

        {/* ── CTA ── */}
        <div
          className="mt-12 p-10 text-center text-white"
          style={{ background: "linear-gradient(135deg,#052e16,#166534)" }}
        >
          <h3 className="text-2xl font-black text-white mb-2">Ainda tem dúvidas?</h3>
          <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">
            A nossa equipa de suporte está disponível. Fale via chat ou abra um ticket.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              className="flex items-center gap-2 font-bold text-sm px-6 py-3 border-none cursor-pointer"
              style={{ background: "white", color: GREEN }}
            >
              <MessageCircle size={17} />
              Falar com Suporte
            </button>
            <button
              className="flex items-center gap-2 font-semibold text-sm px-6 py-3 cursor-pointer"
              style={{ background: "transparent", color: "white", border: "1.5px solid rgba(255,255,255,0.3)" }}
            >
              <Ticket size={17} />
              Abrir Ticket
            </button>
          </div>
        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-500 text-center py-6 text-xs">
        <span className="text-white font-bold">MozTicTac.</span> — Marketplace Moçambicano &nbsp;|&nbsp;
        support@moztictac.com &nbsp;|&nbsp; +258 844565456
      </footer>
    </div>
  );
}