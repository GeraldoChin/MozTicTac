import { useState, useEffect } from "react";

// ─── Dados completos ───────────────────────────────────────────────────────────
const CATEGORIES = ["Todos", "Tecnologia", "Negócios", "Finanças", "Marketing", "Tutoriais"];

const BLOG_POSTS = [
  {
    id: 1,
    cat: "Tecnologia",
    title: "Como o MozTicTac usa IA para proteger vendedores contra fraudes em tempo real",
    excerpt: "Exploramos a arquitectura de inteligência artificial que analisa milhares de transacções por segundo e bloqueia automaticamente padrões suspeitos antes que causem danos.",
    date: "18 Abr 2025",
    readTime: "6 min",
    author: { name: "Ana Lopes", initials: "AL" },
    featured: true,
    tag: "Em destaque",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80",
    body: `A fraude online é um dos maiores desafios do comércio electrónico em Moçambique. No MozTicTac, desenvolvemos um sistema de IA que analisa em tempo real cada transacção realizada na plataforma, usando um modelo de scoring de risco que considera mais de 40 variáveis diferentes.

## Como funciona o sistema

Cada vez que uma venda é iniciada, o nosso motor de IA avalia o IP do comprador, o histórico de comportamento, o padrão de navegação e os dados do dispositivo. Em menos de 200 milissegundos, o sistema atribui um score de risco de 0 a 100.

Transacções com score acima de 70 são automaticamente bloqueadas e enviadas para revisão manual. Entre 40 e 70, o sistema pede verificação adicional ao utilizador. Abaixo de 40, a transacção avança normalmente.

## Resultados reais

Desde a implementação, reduzimos os casos de fraude em 94% e os chargebacks caíram de 3,2% para apenas 0,18% do volume total de transacções. Isto representa uma poupança de mais de 2 milhões de meticais por mês para os nossos vendedores.

## O que vem a seguir

Estamos a trabalhar numa segunda fase do sistema que incluirá análise biométrica comportamental — a forma como um utilizador move o rato, o ritmo de digitação e os padrões de scroll são únicos para cada pessoa, tal como uma impressão digital digital.

Este sistema estará disponível para todos os vendedores Premium ainda este ano.`,
  },
  {
    id: 2,
    cat: "Negócios",
    title: "Do zero a 10 000 vendas: a história de Carlos Nhaca no MozTicTac",
    excerpt: "Carlos começou a vender capulanas artesanais na sua aldeia em Inhambane. Hoje fatura mais de 80 000 MZN por mês através da plataforma.",
    date: "15 Abr 2025",
    readTime: "8 min",
    author: { name: "João Matos", initials: "JM" },
    featured: true,
    tag: "Caso de sucesso",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80",
    body: `Em 2023, Carlos Nhaca tinha um problema simples: as suas capulanas artesanais eram as mais bonitas da região de Inhambane, mas o mercado local era pequeno demais para sustentar o seu negócio familiar.

## O começo no MozTicTac

"Ouvi falar da plataforma através de um amigo em Maputo," conta Carlos. "No início tinha medo — nunca tinha vendido online. Mas o processo de criar a loja foi surpreendentemente simples. Em duas horas já tinha os primeiros produtos publicados."

Nas primeiras duas semanas, Carlos vendeu apenas 3 peças. Mas persistiu, melhorou as fotografias dos produtos e começou a usar o programa de afiliados para ter mais visibilidade.

## A virada

Três meses depois de entrar na plataforma, um influencer de moda de Maputo partilhou um dos seus produtos. Em 48 horas, Carlos recebeu mais de 200 encomendas — mais do que vendera em toda a sua vida até então.

"Fui obrigado a contratar quatro pessoas da minha aldeia para ajudar com a produção. Hoje somos uma equipa de sete pessoas."

## Os números de hoje

- **10 847 vendas** concluídas na plataforma
- **82 400 MZN** de facturação média mensal
- **4.9/5** de avaliação pelos compradores
- **7 empregos** criados na comunidade local

"O MozTicTac não mudou só a minha vida. Mudou a vida de toda a minha família e dos meus vizinhos," diz Carlos, emocionado.`,
  },
  {
    id: 3,
    cat: "Finanças",
    title: "Split automático de pagamentos: como funciona a distribuição de receitas",
    excerpt: "Cada venda que acontece no MozTicTac passa por um processo atómico de distribuição. Descubra como o dinheiro chega até si em segurança.",
    date: "12 Abr 2025",
    readTime: "5 min",
    author: { name: "Fátima Dique", initials: "FD" },
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=80",
    body: `Uma das funcionalidades mais importantes — e menos faladas — do MozTicTac é o sistema de split automático de pagamentos. Quando um comprador paga, o dinheiro não vai primeiro para uma conta central e depois é redistribuído. O processo acontece de forma atómica, em milissegundos.

## O que é o split automático?

Imagine que um comprador paga 1 100 MZN por um produto. O sistema divide automaticamente esse valor em três partes:

- **Vendedor**: 900 MZN (produto)
- **Plataforma**: 89 MZN (taxa de serviço)
- **Afiliado**: 11 MZN (comissão de referência)

Tudo isto acontece numa única transacção ACID — ou tudo é processado, ou nada é. Não existe risco de o dinheiro ficar "perdido" algures no processo.

## Segurança e rastreabilidade

Cada split tem um ID único, um timestamp preciso ao milissegundo e o IP de origem registado. Isto garante rastreabilidade total para fins de auditoria e conformidade com a Autoridade Tributária de Moçambique.

## Quando recebo o meu dinheiro?

O saldo fica disponível na sua carteira digital assim que a transacção é confirmada (geralmente em menos de 30 segundos para M-Pesa e E-Mola). O levantamento pode ser solicitado a qualquer momento, com processamento de 1 a 3 dias úteis.`,
  },
  {
    id: 4,
    cat: "Marketing",
    title: "Programa de afiliados: ganhe comissões promovendo produtos em que acredita",
    excerpt: "O sistema de afiliados do MozTicTac permite que qualquer pessoa ganhe dinheiro partilhando links. Saiba como maximizar os seus ganhos.",
    date: "10 Abr 2025",
    readTime: "4 min",
    author: { name: "Pedro Mabunda", initials: "PM" },
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80",
    body: `O programa de afiliados do MozTicTac é uma das formas mais acessíveis de gerar rendimento online em Moçambique — sem precisar de ter um produto, uma loja ou capital inicial.

## Como funciona

Depois de criar uma conta gratuita no MozTicTac, pode candidatar-se ao programa de afiliados. Após aprovação (normalmente em 24 horas), terá acesso ao painel de afiliados onde pode gerar links personalizados para qualquer produto da plataforma.

Quando alguém compra através do seu link, recebe uma comissão automática. Simples assim.

## Níveis de comissão

O programa tem três níveis, baseados no volume de vendas geradas:

- **Bronze** (início): 5% a 10% de comissão
- **Prata** (após 5 000 MZN em vendas): 11% a 20%
- **Ouro** (após 20 000 MZN em vendas): 21% a 30%

## Estratégias que funcionam

Os afiliados mais bem-sucedidos partilham produtos que realmente usam e recomendam. Autenticidade converte muito mais do que publicidade genérica. Use as redes sociais, grupos de WhatsApp e o seu círculo de confiança para começar.

Crie conteúdo útil sobre os produtos — recensões honestas, comparações, tutoriais de uso. Este tipo de conteúdo tem uma vida útil muito maior do que um simples post promocional.`,
  },
  {
    id: 5,
    cat: "Tutoriais",
    title: "Guia completo: configure a sua loja em menos de 30 minutos",
    excerpt: "Passo a passo detalhado para criar uma loja profissional no MozTicTac, desde o registo até à primeira venda, com dicas de fotografia de produto.",
    date: "8 Abr 2025",
    readTime: "10 min",
    author: { name: "Luísa Tembe", initials: "LT" },
    img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&q=80",
    body: `Criar uma loja no MozTicTac é mais simples do que parece. Neste guia passo a passo, vamos desde o registo até publicar o seu primeiro produto, com dicas práticas de fotografia e descrição que realmente vendem.

## Passo 1 — Criar a sua conta (2 minutos)

Aceda ao MozTicTac e clique em "Criar conta". Preencha o seu nome, email e número de telefone. Receberá um código OTP por SMS para confirmar a sua identidade. Pronto — conta criada.

## Passo 2 — Configurar o perfil da loja (5 minutos)

Após o login, vá a "A minha loja" e preencha o nome da loja, uma descrição curta, foto de perfil ou logótipo e os métodos de pagamento aceites (M-Pesa, E-Mola, Banco).

## Passo 3 — Adicionar o primeiro produto (10 minutos)

Clique em "Adicionar produto" e preencha todos os campos. A parte mais importante são as fotografias — use luz natural, fundo neutro e tire pelo menos 4 fotos de ângulos diferentes.

**Dica de ouro**: o título do produto deve incluir palavras que os compradores pesquisariam. Em vez de "Saco bonito", escreva "Mala de couro genuíno artesanal — bege — tamanho médio".

## Passo 4 — Definir preços e stock (5 minutos)

Pesquise produtos semelhantes na plataforma para ter uma referência de preço. Não comece com o preço mais baixo — isso desvaloriza o seu trabalho.

## Passo 5 — Publicar e promover (8 minutos)

Antes de publicar, reveja tudo. Depois, partilhe o link da sua loja nas suas redes sociais e considere o programa de afiliados para ganhar mais visibilidade rapidamente.`,
  },
  {
    id: 6,
    cat: "Tecnologia",
    title: "M-Pesa, E-Mola e Banco: integramos tudo para que não perca nenhuma venda",
    excerpt: "A nossa infraestrutura de pagamentos suporta todos os principais métodos de pagamento em Moçambique. Veja como configurar e aceitar pagamentos.",
    date: "5 Abr 2025",
    readTime: "5 min",
    author: { name: "Rogério Sitoe", initials: "RS" },
    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=700&q=80",
    body: `Em Moçambique, o pagamento digital é fragmentado: alguns clientes preferem M-Pesa, outros E-Mola, outros ainda transferência bancária. Cada gateway recusado é uma venda perdida. Por isso, o MozTicTac integra todos os principais métodos numa única experiência fluida.

## Os gateways disponíveis

**M-Pesa** — O mais usado em Moçambique. A integração é directa: o comprador recebe um push no telefone e aprova o pagamento em segundos. Taxa de sucesso: 97,3%.

**E-Mola** — Segundo mais popular, especialmente nas províncias do norte. Funciona de forma idêntica ao M-Pesa. Taxa de sucesso: 95,8%.

**mKesh** — Disponível para utilizadores do Millennium BIM. Integrado recentemente na plataforma.

**Transferência bancária** — Para vendas de maior volume, suportamos transferências para contas BCI, BIM, BancABC e Standard Bank.

## Como configurar na sua loja

Aceda às definições da sua loja e clique em "Métodos de pagamento". Active os gateways que pretende aceitar e introduza o número de telemóvel ou IBAN associado. O MozTicTac trata do resto — incluindo reconciliação automática e notificações de pagamento.

## Segurança dos pagamentos

Todos os pagamentos passam por encriptação AES-256 e são tokenizados — os seus dados bancários nunca são armazenados nos nossos servidores. Cumprimos as normas do Banco de Moçambique para pagamentos electrónicos.`,
  },
  {
    id: 7,
    cat: "Negócios",
    title: "Precificação estratégica: como definir o preço certo para os seus produtos",
    excerpt: "Preço baixo não significa mais vendas. Descubra como usar dados de mercado e psicologia de preços para aumentar as suas margens de lucro.",
    date: "2 Abr 2025",
    readTime: "7 min",
    author: { name: "Ana Lopes", initials: "AL" },
    img: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=700&q=80",
    body: `Um dos erros mais comuns dos novos vendedores no MozTicTac é competir por preço. A lógica parece fazer sentido: preço mais baixo, mais vendas. Na prática, o que acontece é o oposto — preços demasiado baixos geram desconfiança e destroem as margens.

## Comece pelos custos reais

Antes de definir um preço, calcule o custo total do produto: matéria-prima, tempo de produção, embalagem, transporte e a taxa da plataforma (10%). Esse é o seu custo base. O preço de venda deve ser pelo menos 40% acima disso para ser sustentável.

## Pesquise a concorrência

Use a barra de pesquisa do MozTicTac para encontrar produtos similares. Não copie o preço — use-o como referência. Se o seu produto tem melhor qualidade, fotografias mais profissionais ou uma história de marca mais forte, pode cobrar mais.

## A psicologia dos preços

Preços terminados em 9 (como 99 MZN em vez de 100 MZN) têm taxas de conversão 15% mais altas em média. Ofereça sempre três opções de produto: básico, intermédio e premium. A maioria das pessoas escolhe a opção do meio.

## Reveja os preços regularmente

O mercado muda. Reveja os seus preços a cada três meses e ajuste com base nas suas taxas de conversão. O painel de vendas do MozTicTac mostra exactamente quantas pessoas viram cada produto mas não compraram — um sinal claro de que o preço pode estar alto demais.`,
  },
  {
    id: 8,
    cat: "Finanças",
    title: "IVA, IRPS e conformidade fiscal: o que todo vendedor moçambicano precisa saber",
    excerpt: "Navegar pela legislação fiscal pode ser complexo. Preparamos um guia prático e actualizado sobre as obrigações dos vendedores digitais em Moçambique.",
    date: "28 Mar 2025",
    readTime: "9 min",
    author: { name: "Fátima Dique", initials: "FD" },
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=700&q=80",
    body: `O comércio digital em Moçambique está a crescer rapidamente, e com isso vêm responsabilidades fiscais que muitos vendedores desconhecem. Este guia não substitui aconselhamento jurídico profissional, mas dá-lhe uma visão clara das suas obrigações mais comuns.

## IVA — Imposto sobre o Valor Acrescentado

Em Moçambique, o IVA é de 17% e aplica-se à maioria das vendas de produtos e serviços. Se o seu volume anual de vendas for superior a 2 500 000 MZN, é obrigado a registar-se como sujeito passivo de IVA e a emitir facturas com IVA incluído.

O MozTicTac calcula e retém automaticamente o IVA nas transacções elegíveis, facilitando o cumprimento desta obrigação.

## IRPS — Imposto sobre o Rendimento das Pessoas Singulares

Os rendimentos obtidos através de actividades comerciais online estão sujeitos a IRPS. A taxa varia conforme o escalão de rendimento anual, começando em 10% para rendimentos entre 42 001 e 168 000 MZN.

## Como o MozTicTac ajuda

O nosso sistema gera automaticamente relatórios fiscais mensais e anuais que pode exportar em formato PDF ou Excel. Aceda ao painel de Gestão Financeira e clique em "Relatórios Fiscais" para gerar o seu relatório actualizado a qualquer momento.

**Importante**: Mantenha sempre os registos das suas transacções por um mínimo de 5 anos, conforme exigido pela legislação moçambicana.`,
  },
];

const TRENDING = [
  { num: "01", title: "Como aumentar conversões com fotos de produto profissionais", views: "12k" },
  { num: "02", title: "Os 10 produtos mais vendidos no MozTicTac em 2025", views: "9.4k" },
  { num: "03", title: "Como usar o painel de afiliados para crescer mais rápido", views: "7.1k" },
  { num: "04", title: "Estratégias de precificação que funcionam em Moçambique", views: "5.8k" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function catColor(cat) {
  const m = {
    Tecnologia: "bg-blue-100 text-blue-700",
    Negócios:   "bg-amber-100 text-amber-700",
    Finanças:   "bg-emerald-100 text-emerald-800",
    Marketing:  "bg-purple-100 text-purple-700",
    Tutoriais:  "bg-rose-100 text-rose-700",
  };
  return m[cat] || "bg-gray-100 text-gray-600";
}

// Renderiza markdown simples: ## headings, **bold**, listas com -, parágrafos
function RenderBody({ body }) {
  const blocks = body.split("\n\n").filter(Boolean);
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-1 border-l-4 border-green-500 pl-4 leading-snug">
              {block.replace("## ", "")}
            </h2>
          );
        }
        if (block.startsWith("- ")) {
          const items = block.split("\n").filter(l => l.startsWith("- "));
          return (
            <ul key={i} className="list-none space-y-2 pl-0">
              {items.map((item, j) => {
                const text = item.replace("- ", "");
                const parts = text.split(/(\*\*[^*]+\*\*)/g);
                return (
                  <li key={j} className="flex gap-2 items-start text-[15px] text-gray-700 leading-relaxed">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <span>
                      {parts.map((p, k) =>
                        p.startsWith("**") && p.endsWith("**")
                          ? <strong key={k} className="font-bold text-gray-900">{p.slice(2, -2)}</strong>
                          : p
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }
        const parts = block.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-[15px] text-gray-700 leading-relaxed">
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j} className="font-bold text-gray-900">{p.slice(2, -2)}</strong>
                : p
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─── Componentes base ─────────────────────────────────────────────────────────
function Avatar({ initials, cls = "w-7 h-7 text-xs" }) {
  return (
    <div className={`${cls} rounded-full bg-green-700 flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

function ReadBadge({ time }) {
  return (
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 whitespace-nowrap">
      {time} leitura
    </span>
  );
}

// ─── CARD vertical ────────────────────────────────────────────────────────────
function PostCard({ post, onClick }) {
  return (
    <article
      onClick={() => onClick(post)}
      className="group cursor-pointer flex flex-col bg-white  border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-video overflow-hidden relative">
        <img
          src={post.img} alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {post.tag && (
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-green-600 text-white shadow">
            {post.tag}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full self-start mb-3 ${catColor(post.cat)}`}>
          {post.cat}
        </span>
        <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-green-700 transition-colors duration-200 flex-1"
          style={{ fontFamily: "'Georgia', serif" }}>
          {post.title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <Avatar initials={post.author.initials} />
            <span className="text-xs font-semibold text-gray-700">{post.author.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <ReadBadge time={post.readTime} />
            <span className="text-[10px] text-gray-400">{post.date}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── CARD horizontal ──────────────────────────────────────────────────────────
function PostCardHorizontal({ post, onClick }) {
  return (
    <article
      onClick={() => onClick(post)}
      className="group flex gap-4 py-4 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-colors duration-150"
    >
      <div className="w-20 h-16 overflow-hidden shrink-0">
        <img src={post.img} alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${catColor(post.cat)}`}>
          {post.cat}
        </span>
        <p className="text-[13px] font-bold text-gray-800 leading-snug mt-1 group-hover:text-green-700 transition-colors line-clamp-2">
          {post.title}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">{post.date} · {post.readTime} leitura</p>
      </div>
    </article>
  );
}

// ─── HERO banner ─────────────────────────────────────────────────────────────
function FeaturedHero({ post, onClick }) {
  return (
    <article
      onClick={() => onClick(post)}
      className="group relative  overflow-hidden cursor-pointer shadow-xl"
      style={{ height: 420 }}
    >
      <img src={post.img} alt={post.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-transparent" />
      <span className="absolute top-5 left-6 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-green-600 text-white shadow-lg">
        Em Destaque
      </span>
      <div className="absolute bottom-0 left-0 right-0 p-7">
        <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-2">{post.cat}</p>
        <h2 className="text-[22px] font-black text-white leading-snug mb-3 max-w-xl drop-shadow-md"
          style={{ fontFamily: "'Georgia', serif" }}>
          {post.title}
        </h2>
        <p className="text-sm text-white/75 leading-relaxed max-w-lg mb-4 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <Avatar initials={post.author.initials} cls="w-8 h-8 text-xs" />
          <span className="text-sm font-semibold text-white/90">{post.author.name}</span>
          <span className="text-white/40">·</span>
          <span className="text-xs text-white/60">{post.date}</span>
          <span className="text-white/40">·</span>
          <ReadBadge time={post.readTime} />
        </div>
      </div>
    </article>
  );
}

// ─── LEITOR DE POST ───────────────────────────────────────────────────────────
function PostReader({ post, onBack, onOpenPost }) {
  useEffect(() => { window.scrollTo(0, 0); }, [post.id]);
  const related = BLOG_POSTS.filter(p => p.id !== post.id && p.cat === post.cat).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Barra topo */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-700 transition-colors group"
          >
            <span className="text-lg group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
            Voltar ao blog
          </button>
          <div className="flex-1 h-px bg-gray-100" />
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${catColor(post.cat)}`}>{post.cat}</span>
          <ReadBadge time={post.readTime} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Cabeçalho */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-[36px] font-black text-gray-900 leading-tight mb-5"
            style={{ fontFamily: "'Georgia', serif" }}>
            {post.title}
          </h1>
          <p className="text-[17px] text-gray-500 leading-relaxed mb-7 border-l-4 border-green-400 pl-5 italic">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 py-4 border-y border-gray-100 flex-wrap">
            <Avatar initials={post.author.initials} cls="w-11 h-11 text-sm" />
            <div>
              <p className="text-sm font-bold text-gray-900">{post.author.name}</p>
              <p className="text-xs text-gray-400">{post.date} · {post.readTime} de leitura</p>
            </div>
            <div className="ml-auto flex gap-2 flex-wrap">
              <button className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-700 transition-colors">
                Partilhar
              </button>
              <button className="text-xs font-semibold px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors">
                Subscrever
              </button>
            </div>
          </div>
        </header>

        {/* Imagem principal */}
        <div className=" overflow-hidden mb-10 shadow-lg" style={{ aspectRatio: "16/9" }}>
          <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Corpo do artigo */}
        <RenderBody body={post.body} />

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tópicos</p>
          <div className="flex gap-2 flex-wrap">
            {[post.cat, "MozTicTac", "Moçambique", "E-commerce"].map((tag, i) => (
              <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 cursor-pointer hover:border-green-500 hover:text-green-700 hover:bg-green-50 transition-all">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Caixa do autor */}
        <div className="mt-10 p-6 bg-green-50  border border-green-100 flex gap-5 items-start">
          <Avatar initials={post.author.initials} cls="w-14 h-14 text-lg" />
          <div>
            <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Escrito por</p>
            <p className="text-base font-black text-gray-900 mb-1">{post.author.name}</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Especialista em comércio digital e membro da equipa editorial do MozTicTac. Apaixonado por ajudar empreendedores moçambicanos a crescer online.
            </p>
          </div>
        </div>

        {/* Artigos relacionados */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 rounded-full bg-green-600" />
              <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Artigos relacionados</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(p => (
                <article
                  key={p.id}
                  onClick={() => onOpenPost(p)}
                  className="group cursor-pointer bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    <img src={p.img} alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                  </div>
                  <div className="p-3">
                    <p className="text-[12px] font-bold text-gray-800 leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
                      {p.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{p.readTime} leitura</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-10 bg-gradient-to-br from-green-900 to-green-700 py-14 px-6 text-center">
        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">Comece hoje</p>
        <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Georgia', serif" }}>
          Pronto para vender em Moçambique?
        </h3>
        <p className="text-sm text-white/70 mb-7 max-w-md mx-auto leading-relaxed">
          Crie a sua loja gratuita no MozTicTac e comece a vender para todo o país ainda hoje.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button className="px-7 py-3 rounded-full bg-white text-green-900 font-bold text-sm hover:bg-green-50 transition-colors">
            Criar loja grátis →
          </button>
          <button className="px-7 py-3 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
            Ver como funciona
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ onSelectPost }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <aside className="flex flex-col gap-6">
      {/* Newsletter */}
      <div className=" p-6 bg-gradient-to-br from-green-900 to-green-700 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-2">Newsletter</p>
        <h3 className="text-[17px] font-black leading-snug mb-2" style={{ fontFamily: "'Georgia', serif" }}>
          Receba os melhores artigos na sua caixa de entrada
        </h3>
        <p className="text-xs text-white/65 leading-relaxed mb-4">
          Semanalmente. Sem spam. Só conteúdo útil.
        </p>
        {subscribed ? (
          <div className="bg-green-400/20 p-4 text-center">
            <p className="text-sm font-bold text-green-300">✓ Subscrito com sucesso!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="O seu email..."
              className="w-full px-4 py-2.5 text-sm font-medium bg-white/15 text-white placeholder-white/50 outline-none border border-white/20 focus:border-white/50 transition-colors"
            />
            <button
              onClick={() => email && setSubscribed(true)}
              className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition-colors"
            >
              Subscrever →
            </button>
          </div>
        )}
      </div>

      {/* Em tendência */}
      <div className=" bg-white border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-green-600" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-800">Em tendência</p>
        </div>
        {TRENDING.map((t, i) => (
          <div key={i} className="flex gap-3 items-start py-3 border-b border-gray-50 last:border-0 cursor-pointer group">
            <span className="text-2xl font-black text-gray-100 leading-none shrink-0 w-7"
              style={{ fontFamily: "'Georgia', serif" }}>{t.num}</span>
            <div>
              <p className="text-[13px] font-bold text-gray-800 leading-snug group-hover:text-green-700 transition-colors">
                {t.title}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">{t.views} visualizações</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tópicos */}
      <div className=" bg-white border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-green-600" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-800">Tópicos populares</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Vendas", "Afiliados", "M-Pesa", "Logística", "Fotografia", "SEO", "Finanças", "IA", "Startup", "Moçambique"].map((tag, i) => (
            <span key={i}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 cursor-pointer hover:border-green-500 hover:text-green-700 hover:bg-green-50 transition-all duration-150">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Recentes */}
      <div className=" bg-white border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-green-600" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-800">Recentes</p>
        </div>
        {BLOG_POSTS.slice(0, 4).map(p => (
          <PostCardHorizontal key={p.id} post={p} onClick={onSelectPost} />
        ))}
      </div>
    </aside>
  );
}

// ─── PÁGINA BLOG (listagem) ───────────────────────────────────────────────────
function BlogListPage({ onOpenPost }) {
  const [catAtiva, setCatAtiva] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [pagina, setPagina] = useState(1);
  const POR_PAG = 4;

  const heroPost = BLOG_POSTS.find(p => p.featured);
  const secondFeatured = BLOG_POSTS.filter(p => p.featured)[1];

  const filtered = BLOG_POSTS.filter(p => {
    const okCat = catAtiva === "Todos" || p.cat === catAtiva;
    const okBusca = !busca
      || p.title.toLowerCase().includes(busca.toLowerCase())
      || p.excerpt.toLowerCase().includes(busca.toLowerCase());
    return okCat && okBusca && !p.featured;
  });

  const totalPags = Math.ceil(filtered.length / POR_PAG);
  const paginados = filtered.slice((pagina - 1) * POR_PAG, pagina * POR_PAG);
  const extras = filtered.slice(POR_PAG);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-black text-base">M</span>
            </div>
            <span className="text-[15px] font-black text-gray-900 tracking-tight">
              Moz<span className="text-green-600">TicTac</span>
              <span className="text-xs font-bold text-gray-400 ml-1.5">Blog</span>
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {buscaAberta ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={busca}
                  onChange={e => { setBusca(e.target.value); setPagina(1); }}
                  placeholder="Pesquisar artigos..."
                  className="w-64 px-4 py-2 rounded-full border-2 border-green-500 text-sm font-medium text-gray-900 outline-none"
                />
                <button
                  onClick={() => { setBuscaAberta(false); setBusca(""); }}
                  className="text-gray-400 hover:text-gray-700 text-lg"
                >✕</button>
              </div>
            ) : (
              <>
                {["Início", "Categorias", "Autores", "Sobre"].map((item, i) => (
                  <a key={i} href="#"
                    className="text-sm font-semibold text-gray-500 hover:text-green-700 px-3 py-2 rounded-lg transition-colors">
                    {item}
                  </a>
                ))}
                <button
                  onClick={() => setBuscaAberta(true)}
                  className="ml-2 flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  🔍 Pesquisar
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-b from-green-50/60 to-gray-50 border-b border-gray-100 pt-10 pb-0">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-green-600" />
            <p className="text-[11px] font-black text-green-700 uppercase tracking-widest">Blog Oficial MozTicTac</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
            <div className="lg:col-span-2">
              {heroPost && <FeaturedHero post={heroPost} onClick={onOpenPost} />}
            </div>

            <div className="flex flex-col gap-4">
              {secondFeatured && (
                <article
                  onClick={() => onOpenPost(secondFeatured)}
                  className="group cursor-pointer bg-white  border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex-1"
                >
                  <div className="overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    <img src={secondFeatured.img} alt={secondFeatured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                      {secondFeatured.tag}
                    </span>
                    <h3 className="text-[15px] font-black text-gray-900 leading-snug mt-2 mb-2 group-hover:text-green-700 transition-colors"
                      style={{ fontFamily: "'Georgia', serif" }}>
                      {secondFeatured.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{secondFeatured.excerpt}</p>
                    <div className="flex items-center gap-2">
                      <Avatar initials={secondFeatured.author.initials} cls="w-6 h-6 text-[10px]" />
                      <span className="text-xs font-semibold text-gray-700">{secondFeatured.author.name}</span>
                      <ReadBadge time={secondFeatured.readTime} />
                    </div>
                  </div>
                </article>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "48",  label: "Artigos" },
                  { val: "12k", label: "Leitores/mês" },
                  { val: "6",   label: "Categorias" },
                  { val: "9",   label: "Autores" },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-gray-100 p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-green-600 leading-none">{s.val}</p>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => { setCatAtiva(cat); setPagina(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-150 ${
                catAtiva === cat
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-transparent text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-700"
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 shrink-0">
            {filtered.length} artigo{filtered.length !== 1 ? "s" : ""}
            {catAtiva !== "Todos" ? ` em "${catAtiva}"` : ""}
          </span>
        </div>
      </div>

      {/* CORPO */}
      <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 items-start">
        <div>
          {busca && (
            <div className="mb-6 px-4 py-3 bg-green-50 text-sm font-semibold text-green-800">
              🔍 Resultados para "<strong>{busca}</strong>" — {filtered.length} encontrado{filtered.length !== 1 ? "s" : ""}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-lg font-bold text-gray-700">Nenhum artigo encontrado</p>
              <p className="text-sm mt-2">Tente outra categoria ou termo de pesquisa.</p>
            </div>
          ) : (
            <>
              {/* Grid 2×2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {paginados.slice(0, 4).map(post => (
                  <PostCard key={post.id} post={post} onClick={onOpenPost} />
                ))}
              </div>

              {/* Lista compacta (restantes da página 1) */}
              {pagina === 1 && extras.length > 0 && (
                <>
                  <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Mais artigos</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="bg-white  border border-gray-100 px-5 py-1 shadow-sm mb-8">
                    {extras.map(post => (
                      <PostCardHorizontal key={post.id} post={post} onClick={onOpenPost} />
                    ))}
                  </div>
                </>
              )}

              {/* Paginação */}
              {totalPags > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    className="px-4 h-9 rounded-lg border border-gray-200 text-sm font-bold text-gray-500 disabled:opacity-40 hover:border-green-500 hover:text-green-700 transition-colors"
                  >
                    ← Anterior
                  </button>
                  {Array.from({ length: totalPags }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPagina(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                        p === pagina
                          ? "bg-green-600 text-white"
                          : "border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPagina(p => Math.min(totalPags, p + 1))}
                    disabled={pagina === totalPags}
                    className="px-4 h-9 rounded-lg border border-gray-200 text-sm font-bold text-gray-500 disabled:opacity-40 hover:border-green-500 hover:text-green-700 transition-colors"
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <Sidebar onSelectPost={onOpenPost} />
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-16 px-6 text-center">
        <p className="text-[11px] font-black text-green-400 uppercase tracking-widest mb-3">Comece hoje</p>
        <h2 className="text-3xl font-black text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>
          Pronto para vender em Moçambique?
        </h2>
        <p className="text-sm text-white/70 leading-relaxed mb-8 max-w-md mx-auto">
          Crie a sua loja gratuita no MozTicTac e comece a vender para todo o país ainda hoje.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button className="px-8 py-3 rounded-full bg-white text-green-900 font-bold text-sm hover:bg-green-50 transition-colors">
            Criar loja grátis →
          </button>
          <button className="px-8 py-3 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
            Ver como funciona
          </button>
        </div>
      </div>

      <footer className="bg-gray-900 py-7 px-6 text-center">
        <p className="text-xs text-gray-500">
          © 2025 MozTicTac · Blog ·{" "}
          <a href="#" className="text-green-500 hover:text-green-400 transition-colors">Privacidade</a>
          {" · "}
          <a href="#" className="text-green-500 hover:text-green-400 transition-colors">Termos</a>
        </p>
      </footer>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [postAberto, setPostAberto] = useState(null);

  const abrirPost = (post) => {
    setPostAberto(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const voltarLista = () => {
    setPostAberto(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (postAberto) {
    return (
      <PostReader
        post={postAberto}
        onBack={voltarLista}
        onOpenPost={abrirPost}
      />
    );
  }

  return <BlogListPage onOpenPost={abrirPost} />;
}