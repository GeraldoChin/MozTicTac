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
  CheckCircle,
  Globe,
  Lock,
  TrendingUp,
  Heart,
  MessageCircle,
  Star,
} from "lucide-react";
import { Header } from "../../components/Header";
import { Navbar } from "../../components/Navbar";
// ─── import real do teu Cabecalho ─────────────────────────────────────────────
// import { Cabecalho } from "../components/Cabecalho";
function Cabecalho({ valorPesquisa, aoMudarPesquisa }) {
  return (
    <header style={{
      background: "#fff", borderBottom: "1px solid #e5e7eb",
      padding: "14px 32px", display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    }}>
      <span style={{ fontWeight: 900, fontSize: 22, color: "#00b96b", letterSpacing: -1 }}>MozTicTac</span>
      <input type="text" placeholder="Pesquisar produtos..."
        value={valorPesquisa} onChange={(e) => aoMudarPesquisa(e.target.value)}
        style={{ border: "1px solid #e5e7eb", padding: "7px 16px", fontSize: 13, outline: "none", width: 240 }} />
    </header>
  );
}

const V  = "#00b96b";
const VD = "#009a5a";
const V2 = "#004d2e";

function IcFacebook({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
}
function IcInstagram({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IcTwitter({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}

function Btn({ children, onClick, outline = false, light = false }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "13px 28px", fontWeight: 700,
    fontSize: 13, cursor: "pointer", transition: "all .2s",
    letterSpacing: 0.5, textTransform: "uppercase",
  };
  if (light) return (
    <button onClick={onClick} style={{ ...base, background: "rgba(255,255,255,0.12)", color: "#fff", border: "2px solid rgba(255,255,255,0.35)" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}>
      {children}
    </button>
  );
  if (outline) return (
    <button onClick={onClick} style={{ ...base, background: "transparent", color: V, border: `2px solid ${V}` }}
      onMouseEnter={e => { e.currentTarget.style.background = V; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = V; }}>
      {children}
    </button>
  );
  return (
    <button onClick={onClick} style={{ ...base, background: V, color: "#fff", border: "none" }}
      onMouseEnter={e => e.currentTarget.style.background = VD}
      onMouseLeave={e => e.currentTarget.style.background = V}>
      {children}
    </button>
  );
}

function Hero() {
  return (
    <section style={{ position: "relative", minHeight: 380, overflow: "hidden" }}>
      <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1400&q=80" alt="Equipa"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,77,46,.92) 0%, rgba(0,185,107,.75) 100%)" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto", padding: "100px 24px 80px", textAlign: "center", color: "#fff" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", opacity: .8, marginBottom: 16 }}>Mercado Moçambicano</p>
        <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 900, lineHeight: 1.15, margin: "0 0 20px" }}>Sobre Nós</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, opacity: .85 }}>
          <span style={{ cursor: "pointer" }}>Início</span>
          <ChevronRight size={14} />
          <span style={{ fontWeight: 700 }}>Sobre Nós</span>
        </div>
      </div>
    </section>
  );
}

function Sobre() {
  return (
    <section style={{ background: "#fff", padding: "80px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 64, alignItems: "center" }}>
        <div style={{ flex: "1 1 380px", position: "relative", minHeight: 380 }}>
          <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80" alt="Equipa"
            style={{ width: "75%", boxShadow: "0 12px 40px rgba(0,0,0,.12)", display: "block" }} />
          <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80" alt="Pessoa"
            style={{ width: "50%", position: "absolute", bottom: 0, right: 0,
              boxShadow: "0 12px 40px rgba(0,0,0,.15)", border: "4px solid #fff" }} />
          <div style={{ position: "absolute", top: 24, right: "26%", background: V2, color: "#fff",
            padding: "18px 22px", textAlign: "center", boxShadow: "0 8px 24px rgba(0,77,46,.35)" }}>
            <p style={{ fontSize: 32, fontWeight: 900, margin: 0, lineHeight: 1 }}>5+</p>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4, opacity: .85 }}>Anos de<br/>Experiência</p>
          </div>
        </div>
        <div style={{ flex: "1 1 360px" }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: V, marginBottom: 14 }}>Sobre a Empresa</p>
          <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: 900, lineHeight: 1.2, color: "#0f1a12", margin: "0 0 20px" }}>
            A forma mais rápida de ter<br/><em style={{ fontStyle: "italic", color: V }}>sucesso comercial em Moçambique</em>
          </h2>
          <p style={{ color: "#64748b", lineHeight: 1.75, marginBottom: 16, fontSize: 14 }}>
            Criámos o MozTicTac para resolver um problema real: Moçambique precisava de um marketplace local, seguro, que falasse a língua dos moçambicanos e usasse os meios de pagamento que já conhecem — M-Pesa, E-Mola e mKesh.
          </p>
          <p style={{ color: "#64748b", lineHeight: 1.75, marginBottom: 28, fontSize: 14 }}>
            Sem burocracia. Uma única conta para comprar, vender e ganhar como afiliado — com pagamento retido em escrow para garantir a segurança de todos.
          </p>
          <p style={{ fontWeight: 700, color: "#0f1a12", marginBottom: 14, fontSize: 13 }}>Serviços Especiais:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 32 }}>
            {["Escrow garantido", "M-Pesa, E-Mola, mKesh", "Afiliados 5–20%", "Equipa de suporte local"].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                <CheckCircle size={15} style={{ color: V, flexShrink: 0 }} />{s}
              </div>
            ))}
          </div>
          <Btn onClick={() => {}}>Criar conta grátis <ArrowRight size={15} /></Btn>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { Ic: MapPin, val: "10+",    label: "Províncias cobertas"    },
    { Ic: Store,  val: "1.200+", label: "Produtos listados"      },
    { Ic: Users,  val: "5.000+", label: "Utilizadores activos"   },
    { Ic: Star,   val: "98%",    label: "Satisfação dos clientes" },
  ];
  return (
    <section style={{ background: V, padding: "50px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 32, textAlign: "center" }}>
        {items.map(({ Ic, val, label }) => (
          <div key={label} style={{ color: "#fff" }}>
            <div style={{ width: 52, height: 52,  border: "2px solid rgba(255,255,255,.3)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Ic size={22} />
            </div>
            <p style={{ fontSize: 36, fontWeight: 900, margin: 0, lineHeight: 1 }}>{val}</p>
            <p style={{ fontSize: 12, opacity: .85, marginTop: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Missao() {
  const [tab, setTab] = useState(0);
  const tabs = [
    { label: "A Nossa Missão", titulo: "Missão da Empresa",
      texto: "Nascemos para democratizar o comércio em Moçambique. Queremos que qualquer cidadão — em Maputo, Nampula ou Niassa — consiga vender os seus produtos online com segurança, receber em Meticais e crescer o seu negócio sem burocracia." },
    { label: "A Nossa Visão", titulo: "Visão para o Futuro",
      texto: "Ser a plataforma de comércio electrónico de referência em Moçambique e na África Austral até 2030, conectando milhões de compradores e vendedores numa economia digital inclusiva e segura." },
    { label: "O Nosso Objetivo", titulo: "Objetivo Estratégico",
      texto: "Criar um ecossistema de confiança onde compradores, vendedores e afiliados prosperam juntos — com ferramentas de pagamento locais, escrow automático e comissões transparentes em cada transacção." },
  ];
  const t = tabs[tab];
  return (
    <section style={{ padding: "80px 24px", background: "#f8faf9" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 64, alignItems: "center" }}>
        <div style={{ flex: "1 1 380px" }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: V, marginBottom: 14 }}>Sobre a Missão</p>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.3rem)", fontWeight: 900, lineHeight: 1.2, color: "#0f1a12", margin: "0 0 28px" }}>
            O nosso principal objetivo é<br/><em style={{ fontStyle: "italic", color: V }}>satisfazer clientes locais &amp; globais</em>
          </h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {tabs.map((tb, i) => (
              <button key={i} onClick={() => setTab(i)} style={{
                padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: "none", transition: "all .2s",
                background: tab === i ? V : "#fff", color: tab === i ? "#fff" : "#64748b",
                boxShadow: tab === i ? "0 4px 14px rgba(0,185,107,.3)" : "0 1px 4px rgba(0,0,0,.08)",
              }}>{tb.label}</button>
            ))}
          </div>
          <h3 style={{ fontWeight: 800, color: "#0f1a12", fontSize: 16, marginBottom: 12 }}>{t.titulo}</h3>
          <p style={{ color: "#64748b", lineHeight: 1.8, fontSize: 14 }}>{t.texto}</p>
        </div>
        <div style={{ flex: "1 1 380px" }}>
          <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&q=80" alt="Missão"
            style={{ width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.12)", display: "block" }} />
        </div>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const passos = [
    { num: "01", Ic: Users,  titulo: "Cria a tua conta",    desc: "Regista-te com email, confirma com OTP e já tens acesso a compra, venda e afiliados." },
    { num: "02", Ic: Store,  titulo: "Compra ou publica",   desc: "Pesquisa produtos perto de ti ou publica o teu produto em segundos." },
    { num: "03", Ic: Wallet, titulo: "Paga com segurança",  desc: "Pagamento em escrow. O vendedor recebe apenas após confirmares a entrega." },
    { num: "04", Ic: Share2, titulo: "Ganha como afiliado", desc: "Partilha links e ganha entre 5% e 20% de comissão por cada venda gerada." },
  ];
  return (
    <section style={{ padding: "80px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: V, marginBottom: 12 }}>Como Funciona</p>
          <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: 900, color: "#0f1a12", margin: 0 }}>
            Uma conta. <span style={{ color: V }}>Três formas de ganhar.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
          {passos.map(({ num, Ic, titulo, desc }) => (
            <div key={num} style={{ padding: 28, border: "1px solid #e9f5f0",  background: "#f9fffe", transition: "box-shadow .2s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,185,107,.15)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: V, textTransform: "uppercase", marginBottom: 16 }}>Passo {num}</p>
              <div style={{ width: 48, height: 48, background: "#e6f9f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Ic size={22} style={{ color: V }} />
              </div>
              <p style={{ fontWeight: 800, color: "#0f1a12", fontSize: 15, marginBottom: 10 }}>{titulo}</p>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Valores() {
  const vals = [
    { Ic: Lock,        t: "Segurança total",   d: "Transacções protegidas por escrow e autenticação reforçada com OTP." },
    { Ic: Heart,       t: "Confiança",         d: "Avaliações verificadas, histórico transparente e suporte humano." },
    { Ic: TrendingUp,  t: "Crescimento",       d: "Ferramentas de venda, afiliados e estatísticas para crescer." },
    { Ic: Globe,       t: "Alcance nacional",  d: "Chegamos a todas as 10 províncias de Moçambique." },
    { Ic: CheckCircle, t: "Transparência",     d: "Preços claros, taxas visíveis e trilha de auditoria completa." },
    { Ic: Wallet,      t: "Pagamentos locais", d: "M-Pesa, E-Mola, mKesh — tudo em Meticais, sem surpresas." },
  ];
  return (
    <section style={{ padding: "80px 24px", background: "#f8faf9" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: V, marginBottom: 12 }}>Os Nossos Valores</p>
          <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: 900, color: "#0f1a12", margin: 0 }}>Construído com propósito</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {vals.map(({ Ic, t, d }) => (
            <div key={t} style={{ background: "#fff",  padding: 24, border: "1px solid #e9f5f0", transition: "box-shadow .2s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,185,107,.12)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              <div style={{ width: 44, height: 44, background: "#e6f9f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Ic size={20} style={{ color: V }} />
              </div>
              <p style={{ fontWeight: 800, color: "#0f1a12", fontSize: 15, marginBottom: 8 }}>{t}</p>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Equipa() {
  const membros = [
    { nome: "Ana Machava",  cargo: "CEO & Co-fundadora", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", cor: V },
    { nome: "João Machava", cargo: "CTO & Co-fundador",  img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80", cor: "#3b82f6" },
    { nome: "Fátima Langa", cargo: "Head de Produto",    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80", cor: "#f97316" },
    { nome: "Carlos Sitoe", cargo: "Head de Operações",  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80", cor: "#8b5cf6" },
  ];
  return (
    <section style={{ padding: "80px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: V, marginBottom: 12 }}>A Nossa Equipa</p>
          <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.2rem)", fontWeight: 900, color: "#0f1a12", margin: "0 0 8px" }}>
            Servimos com paixão porque<br/><em style={{ fontStyle: "italic", color: V }}>Moçambique é a nossa missão</em>
          </h2>
          <div style={{ width: 48, height: 3, background: V, margin: "16px auto 0" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 28, marginTop: 48 }}>
          {membros.map(m => (
            <div key={m.nome} style={{ textAlign: "center" }}>
              <div style={{ position: "relative", paddingBottom: "110%",  overflow: "hidden", marginBottom: 16, boxShadow: "0 8px 24px rgba(0,0,0,.1)" }}
                onMouseEnter={e => { const ov = e.currentTarget.querySelector(".ov"); if (ov) ov.style.opacity = "1"; }}
                onMouseLeave={e => { const ov = e.currentTarget.querySelector(".ov"); if (ov) ov.style.opacity = "0"; }}>
                <img src={m.img} alt={m.nome}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <div className="ov" style={{ position: "absolute", inset: 0, background: "rgba(0,77,46,.75)",
                  display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16, opacity: 0, transition: "opacity .3s" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[IcFacebook, IcTwitter, IcInstagram].map((Ic, i) => (
                      <div key={i} style={{ width: 32, height: 32, background: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Ic size={14} style={{ color: V2 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p style={{ fontWeight: 800, color: "#0f1a12", fontSize: 15, marginBottom: 4 }}>{m.nome}</p>
              <p style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{m.cargo}</p>
              <div style={{ width: 32, height: 3, background: m.cor, margin: "10px auto 0", borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Depoimentos() {
  const deps = [
    { texto: "O MozTicTac transformou o meu negócio! Comecei a vender online e em 3 meses triplicei as minhas vendas. O pagamento em escrow deu-me confiança para comprar de vendedores que não conhecia.",
      nome: "Maria José Cossa", cargo: "Vendedora, Maputo", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80" },
    { texto: "Excelente plataforma! Uso como afiliado e já ganhei mais de 15.000 MT em comissões. A interface é simples e os pagamentos chegam sempre no prazo. Recomendo a todos os moçambicanos!",
      nome: "Eduardo Nhantumbo", cargo: "Afiliado, Beira", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80" },
    { texto: "Finalmente uma plataforma que aceita M-Pesa! Comprei um computador de um vendedor em Nampula sem sair de casa. O escrow garantiu que o produto chegou em perfeitas condições.",
      nome: "Glória Tembe", cargo: "Compradora, Quelimane", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80" },
  ];
  return (
    <section style={{ padding: "80px 24px", background: "#f8faf9" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: V, marginBottom: 12 }}>As Nossas Experiências</p>
          <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.2rem)", fontWeight: 900, color: "#0f1a12", margin: 0 }}>Confiado por clientes de todo o país</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
          {deps.map((d, i) => (
            <div key={i} style={{ background: "#fff", padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,.06)", border: "1px solid #e9f5f0" }}>
              <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}>"{d.texto}"</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={d.img} alt={d.nome} style={{ width: 46, height: 46,  objectFit: "cover" }} />
                  <div>
                    <p style={{ fontWeight: 800, color: "#0f1a12", fontSize: 14, marginBottom: 2 }}>{d.nome}</p>
                    <p style={{ fontSize: 12, color: "#64748b" }}>{d.cargo}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#f59e0b" style={{ color: "#f59e0b" }} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contacto() {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
  return (
    <section style={{ padding: "80px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 64 }}>
        <div style={{ flex: "1 1 320px" }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: V, marginBottom: 14 }}>Contacto</p>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color: "#0f1a12", margin: "0 0 16px" }}>Fala connosco</h2>
          <p style={{ color: "#64748b", lineHeight: 1.8, fontSize: 14, marginBottom: 32 }}>
            Tens uma dúvida, sugestão ou queres saber mais sobre o MozTicTac? A nossa equipa está disponível para te ajudar.
          </p>
          {[{ Ic: Mail, t: "support@moztictac.com" }, { Ic: Phone, t: "+258 844 565 456" }, { Ic: MapPin, t: "Maputo, Moçambique" }].map(({ Ic, t }) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 42, height: 42, background: "#e6f9f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ic size={17} style={{ color: V }} />
              </div>
              <p style={{ fontSize: 14, color: "#374151" }}>{t}</p>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {[IcInstagram, IcFacebook, IcTwitter].map((Ic, i) => (
              <button key={i} style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid #e5e7eb",
                background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", color: "#6b7280" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = V; e.currentTarget.style.color = V; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}>
                <Ic size={16} />
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 380px", background: "#f8faf9", borderRadius: 20, padding: 36, border: "1px solid #e9f5f0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {[{ label: "Nome completo", key: "nome", type: "text", ph: "O teu nome" },
              { label: "Email", key: "email", type: "email", ph: "O teu email" }].map(({ label, key, type, ph }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</label>
                <input type={type} placeholder={ph} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: "100%", border: "1px solid #d1fae5", borderRadius: 8, padding: "11px 14px", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fff" }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Mensagem</label>
            <textarea rows={5} placeholder="Como podemos ajudar?" value={form.mensagem}
              onChange={e => setForm({ ...form, mensagem: e.target.value })}
              style={{ width: "100%", border: "1px solid #d1fae5", borderRadius: 8, padding: "11px 14px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", background: "#fff" }} />
          </div>
          <Btn onClick={() => {}}><MessageCircle size={15} /> Enviar Mensagem</Btn>
        </div>
      </div>
    </section>
  );
}

function CtaFinal() {
  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "80px 24px", textAlign: "center" }}>
      <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80" alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,77,46,.94) 0%, rgba(0,185,107,.85) 100%)" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 680, margin: "0 auto", color: "#fff" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", opacity: .8, marginBottom: 16 }}>Começa hoje</p>
        <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 16px" }}>Pronto para começar?</h2>
        <p style={{ color: "rgba(255,255,255,.82)", lineHeight: 1.8, fontSize: 15, marginBottom: 36 }}>
          Junta-te a milhares de moçambicanos que já compram, vendem e ganham no MozTicTac.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          <Btn outline onClick={() => {}}>Criar conta grátis <ArrowRight size={15} /></Btn>
          <Btn light onClick={() => {}}>Saber mais</Btn>
        </div>
      </div>
    </section>
  );
}

export default function PaginaSobreNos() {
  const [pesquisa, setPesquisa] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* <Cabecalho
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
      /> */}
      <Header />
      <Navbar />
      <Hero />
      <Sobre />
      <Stats />
      <Missao />
      <ComoFunciona />
      <Valores />
      <Equipa />
      <Depoimentos />
      <Contacto />
      <CtaFinal />
    </div>
  );
}