// src/pages/Site/LoginPage.jsx
import { useState } from "react";

// ── API ───────────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const cabecalhos = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opcoes.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
  };
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: { ...cabecalhos, ...opcoes.headers },
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(dados.mensagem || dados.message || `Erro ${resposta.status}`);
  }
  return dados;
}

const apiAuth = {
  login:              (email, senha)             => requisitar("/auth/login",                 { method: "POST", body: JSON.stringify({ email, senha }) }),
  registar:           (dados)                    => requisitar("/auth/registar",              { method: "POST", body: JSON.stringify(dados) }),
  verificarEmail:     (email, codigo)            => requisitar("/auth/verificar-email",       { method: "POST", body: JSON.stringify({ email, codigo, tipo: "VERIFICACAO_EMAIL" }) }),
  reenviarOtp:        (email)                    => requisitar("/auth/reenviar-otp",          { method: "POST", body: JSON.stringify({ email }) }),
  solicitarRecuperar: (email)                    => requisitar("/auth/solicitar-recuperacao", { method: "POST", body: JSON.stringify({ email }) }),
  redefinirSenha:     (email, codigo, novaSenha) => requisitar("/auth/redefinir-senha",       { method: "POST", body: JSON.stringify({ email, codigo, novaSenha }) }),
};

// ── Constantes ────────────────────────────────────────────────────
const GREEN       = "#1db954";
const GREEN_LIGHT = "#e6f9ee";

// ── Componentes auxiliares ────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-500">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function BannerErro({ mensagem }) {
  if (!mensagem) return null;
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 mb-4">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e03131" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span className="text-xs text-red-700 font-semibold">{mensagem}</span>
    </div>
  );
}

function BannerSucesso({ mensagem }) {
  if (!mensagem) return null;
  return (
    <div className="flex items-center gap-2 border rounded-xl px-3.5 py-2.5 mb-4"
      style={{ background: GREEN_LIGHT, borderColor: GREEN }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span className="text-xs font-semibold text-green-800">{mensagem}</span>
    </div>
  );
}

function BotaoSubmit({ loading, label }) {
  return (
    <button
      type="submit" disabled={loading}
      className="mt-1 w-full py-3.5 text-white text-sm font-extrabold rounded-xl border-none flex items-center justify-center gap-2 transition-all duration-200"
      style={{ background: loading ? "#a8d5b7" : GREEN, cursor: loading ? "default" : "pointer" }}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
          A processar...
        </>
      ) : label}
    </button>
  );
}

// ── Ecrã OTP (verificação de email após registo) ──────────────────
function EcrãOtp({ email, onSucesso, onVoltar }) {
  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 focus:outline-none focus:border-[#1db954] focus:ring-2 focus:ring-[#e6f9ee] transition";
  const [codigo, setCodigo]   = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState("");
  const [sucesso, setSucesso] = useState("");
  const [reenviar, setReenviar] = useState(false);

  async function handleVerificar(e) {
    e.preventDefault();
    if (codigo.trim().length < 4) { setErro("Introduz o código completo."); return; }
    setErro(""); setLoading(true);
    try {
      await apiAuth.verificarEmail(email, codigo.trim());
      setSucesso("Email verificado! A redirecionar para o login...");
      setTimeout(onSucesso, 2000);
    } catch (err) {
      setErro(err.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    setReenviar(true); setErro(""); setSucesso("");
    try {
      await apiAuth.reenviarOtp(email);
      setSucesso("Novo código enviado para o teu email.");
    } catch (err) {
      setErro(err.message || "Erro ao reenviar código.");
    } finally {
      setReenviar(false);
    }
  }

  return (
    <>
      {/* Ícone e título */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: GREEN_LIGHT }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Verifica o teu email</h1>
        <p className="text-xs text-gray-400 mt-1 text-center">
          Enviámos um código para <span className="font-semibold text-gray-600">{email}</span>
        </p>
      </div>

      <BannerErro mensagem={erro} />
      <BannerSucesso mensagem={sucesso} />

      <form onSubmit={handleVerificar} className="flex flex-col gap-3">
        <Field label="Código de verificação" hint="Introduz o código de 6 dígitos enviado para o teu email">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            required
            className={`${inputCls} text-center text-2xl tracking-[0.5em] font-bold`}
          />
        </Field>

        <BotaoSubmit loading={loading} label="Verificar email" />
      </form>

      <div className="flex flex-col items-center gap-2 mt-4">
        <button
          onClick={handleReenviar} disabled={reenviar}
          className="text-xs font-semibold border-none bg-transparent cursor-pointer"
          style={{ color: GREEN }}
        >
          {reenviar ? "A reenviar..." : "Não recebi o código — reenviar"}
        </button>
        <button
          onClick={onVoltar}
          className="text-xs text-gray-400 border-none bg-transparent cursor-pointer hover:text-gray-600"
        >
          ← Voltar ao registo
        </button>
      </div>
    </>
  );
}

// ── Ecrã Recuperação de Senha ─────────────────────────────────────
function EcrãRecuperarSenha({ onVoltar }) {
  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 focus:outline-none focus:border-[#1db954] focus:ring-2 focus:ring-[#e6f9ee] transition";

  // passo 1 = pedir email | passo 2 = inserir código + nova senha
  const [passo, setPasso]           = useState(1);
  const [email, setEmail]           = useState("");
  const [codigo, setCodigo]         = useState("");
  const [novaSenha, setNovaSenha]   = useState("");
  const [confirmar, setConfirmar]   = useState("");
  const [showNova, setShowNova]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState("");
  const [sucesso, setSucesso]       = useState("");

  async function handleSolicitarCodigo(e) {
    e.preventDefault();
    setErro(""); setLoading(true);
    try {
      await apiAuth.solicitarRecuperar(email);
      setSucesso("Se o email existir, receberás um código em breve.");
      setPasso(2);
    } catch (err) {
      setErro(err.message || "Erro ao enviar o código.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRedefinir(e) {
    e.preventDefault();
    setErro("");
    if (novaSenha !== confirmar) { setErro("As palavras-passe não coincidem."); return; }
    if (novaSenha.length < 8)    { setErro("A senha deve ter pelo menos 8 caracteres."); return; }
    setLoading(true);
    try {
      await apiAuth.redefinirSenha(email, codigo.trim(), novaSenha);
      setSucesso("Senha redefinida com sucesso! A redirecionar para o login...");
      setTimeout(onVoltar, 2500);
    } catch (err) {
      setErro(err.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Ícone e título */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#fff7ed" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
          {passo === 1 ? "Recuperar palavra-passe" : "Nova palavra-passe"}
        </h1>
        <p className="text-xs text-gray-400 mt-1 text-center">
          {passo === 1
            ? "Introduz o teu email e enviamos um código de recuperação"
            : `Introduz o código enviado para ${email} e define uma nova senha`}
        </p>
      </div>

      {/* Indicador de passos */}
      <div className="flex items-center gap-2 mb-5">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
              style={{
                background: passo >= n ? GREEN : "#f3f4f6",
                color: passo >= n ? "white" : "#9ca3af",
              }}>
              {passo > n ? "✓" : n}
            </div>
            <span className="text-xs" style={{ color: passo >= n ? GREEN : "#9ca3af" }}>
              {n === 1 ? "Email" : "Nova senha"}
            </span>
            {n < 2 && <div className="flex-1 h-px" style={{ background: passo > n ? GREEN : "#e5e7eb" }} />}
          </div>
        ))}
      </div>

      <BannerErro mensagem={erro} />
      <BannerSucesso mensagem={sucesso} />

      {/* Passo 1: Email */}
      {passo === 1 && (
        <form onSubmit={handleSolicitarCodigo} className="flex flex-col gap-3">
          <Field label="Email">
            <input
              type="email" placeholder="exemplo@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className={inputCls}
            />
          </Field>
          <BotaoSubmit loading={loading} label="Enviar código de recuperação" />
        </form>
      )}

      {/* Passo 2: Código + nova senha */}
      {passo === 2 && (
        <form onSubmit={handleRedefinir} className="flex flex-col gap-3">
          <Field label="Código de recuperação" hint="Código de 6 dígitos enviado para o teu email">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              required
              className={`${inputCls} text-center text-2xl tracking-[0.5em] font-bold`}
            />
          </Field>

          <Field label="Nova palavra-passe" hint="Mínimo 8 caracteres, uma maiúscula e um caractere especial">
            <div className="relative">
              <input
                type={showNova ? "text" : "password"} placeholder="••••••••"
                value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required
                className={`${inputCls} pr-11`}
              />
              <button type="button" onClick={() => setShowNova(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-transparent border-none cursor-pointer p-0">
                <EyeIcon open={showNova} />
              </button>
            </div>
          </Field>

          <Field label="Confirmar nova palavra-passe">
            <div className="relative">
              <input
                type={showConf ? "text" : "password"} placeholder="••••••••"
                value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required
                className={`${inputCls} pr-11`}
              />
              <button type="button" onClick={() => setShowConf(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-transparent border-none cursor-pointer p-0">
                <EyeIcon open={showConf} />
              </button>
            </div>
          </Field>

          <BotaoSubmit loading={loading} label="Redefinir palavra-passe" />

          <button type="button" onClick={() => { setPasso(1); setErro(""); setSucesso(""); }}
            className="text-xs text-gray-400 border-none bg-transparent cursor-pointer hover:text-gray-600 text-center mt-1">
            ← Voltar e usar outro email
          </button>
        </form>
      )}

      <button
        onClick={onVoltar}
        className="w-full text-center text-xs text-gray-400 border-none bg-transparent cursor-pointer hover:text-gray-600 mt-4"
      >
        ← Voltar ao login
      </button>
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────
export default function LoginPage() {
  // "login" | "register" | "otp" | "recuperar"
  const [activeTab, setActiveTab]             = useState("login");
  const [showPass, setShowPass]               = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [name, setName]                       = useState("");
  const [telefone, setTelefone]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]                 = useState(false);
  const [erro, setErro]                       = useState("");
  const [sucesso, setSucesso]                 = useState("");
  const [emailOtp, setEmailOtp]               = useState(""); // email guardado para o ecrã OTP

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 focus:outline-none focus:border-[#1db954] focus:ring-2 focus:ring-[#e6f9ee] transition";

  function mudarTab(tab) {
    setActiveTab(tab);
    setErro("");
    setSucesso("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(""); setSucesso("");

    if (activeTab === "register" && password !== confirmPassword) {
      setErro("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);
    try {
      if (activeTab === "login") {
        const res = await apiAuth.login(email, password);
        const token      = res.dados?.token || res.dados?.tokenAcesso;
        const utilizador = res.dados?.utilizador || res.dados?.usuario;
     // DEPOIS
if (token) {
  localStorage.setItem("token", token);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.usuarioId) localStorage.setItem("usuarioId", payload.usuarioId);
  } catch {}
}
if (utilizador) localStorage.setItem("utilizador", JSON.stringify(utilizador));
        setSucesso("Login bem-sucedido! A redirecionar...");
        setTimeout(() => { window.location.href = "/"; }, 1000);
      } else {
        await apiAuth.registar({ nomeCompleto: name, email, senha: password, telefone });
        // Guarda o email e vai para o ecrã OTP
        setEmailOtp(email);
        setActiveTab("otp");
      }
    } catch (err) {
      setErro(err.message || "Erro ao comunicar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  // Conteúdo do painel esquerdo muda conforme o ecrã
  const painelEsquerdoInfo = {
    login:     { titulo: "Bem-vindo de volta!",           sub: "Entre na sua conta MozTicTac" },
    register:  { titulo: "Crie a sua conta",              sub: "Junte-se à maior plataforma de comércio de Moçambique" },
    otp:       { titulo: "Quase lá!",                     sub: "Verifica o teu email para activar a conta" },
    recuperar: { titulo: "Recuperar acesso",              sub: "Redefine a tua palavra-passe em segundos" },
  };
  const info = painelEsquerdoInfo[activeTab] || painelEsquerdoInfo.login;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-[Manrope,sans-serif]">
      <div className="flex w-full max-w-4xl min-h-[580px] rounded-2xl overflow-hidden shadow-2xl bg-white">

        {/* ── Painel esquerdo ── */}
        <div
          className="hidden md:flex flex-col justify-between flex-[0_0_42%] p-12 relative overflow-hidden"
          style={{ background: GREEN }}
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute bottom-24 right-5 w-20 h-20 rounded-full bg-white/5" />

          <div>
            <div className="flex items-center gap-2.5 mb-12">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6" stroke={GREEN} strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 10a4 4 0 01-8 0" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">MozTicTac</span>
            </div>

            <h2 className="text-white text-2xl font-extrabold leading-snug mb-4 tracking-tight">
              {info.titulo}
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">{info.sub}</p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { icon: "🛍️", label: "+12 000 produtos",     sub: "em todo Moçambique" },
              { icon: "🚚", label: "Entrega rápida",        sub: "para todas as províncias" },
              { icon: "🤝", label: "Programa de afiliados", sub: "ganhe comissões a vender" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-base shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-bold m-0">{item.label}</p>
                  <p className="text-white/70 text-xs m-0">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Painel direito ── */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10 overflow-y-auto">

          {/* ── Ecrã OTP ── */}
          {activeTab === "otp" && (
            <EcrãOtp
              email={emailOtp}
              onSucesso={() => {
                mudarTab("login");
                setSucesso("Conta verificada! Podes agora fazer login.");
              }}
              onVoltar={() => mudarTab("register")}
            />
          )}

          {/* ── Ecrã Recuperar Senha ── */}
          {activeTab === "recuperar" && (
            <EcrãRecuperarSenha onVoltar={() => mudarTab("login")} />
          )}

          {/* ── Ecrã Login / Registo ── */}
          {(activeTab === "login" || activeTab === "register") && (
            <>
              {/* Tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                {[{ key: "login", label: "Entrar" }, { key: "register", label: "Criar conta" }].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => mudarTab(key)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 border-none cursor-pointer
                      ${activeTab === key ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-400"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <h1 className="text-xl font-extrabold text-gray-900 mb-1 tracking-tight">
                {activeTab === "login" ? "Bem-vindo de volta!" : "Crie a sua conta"}
              </h1>
              <p className="text-sm text-gray-400 mb-4">
                {activeTab === "login"
                  ? "Entre na sua conta MozTicTac"
                  : "Junte-se à maior plataforma de comércio de Moçambique"}
              </p>

              <BannerErro mensagem={erro} />
              <BannerSucesso mensagem={sucesso} />

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {activeTab === "register" && (
                  <Field label="Nome completo">
                    <input
                      type="text" placeholder="Ex: João Machava" value={name}
                      onChange={(e) => setName(e.target.value)} required
                      className={inputCls}
                    />
                  </Field>
                )}

                {activeTab === "register" && (
                  <Field label="Telefone">
                    <input
                      type="tel" placeholder="Ex: +258 84 000 0000" value={telefone}
                      onChange={(e) => setTelefone(e.target.value)} required
                      className={inputCls}
                    />
                  </Field>
                )}

                <Field label="Email">
                  <input
                    type="email" placeholder="exemplo@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className={inputCls}
                  />
                </Field>

                <Field
                  label="Palavra-passe"
                  hint={activeTab === "register" ? "Mínimo 8 caracteres, uma maiúscula e um caractere especial (ex: @#$%)" : undefined}
                >
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)} required
                      className={`${inputCls} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-transparent border-none cursor-pointer p-0">
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                </Field>

                {activeTab === "register" && (
                  <Field label="Confirmar palavra-passe">
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"} placeholder="••••••••"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                        className={`${inputCls} pr-11`}
                      />
                      <button type="button" onClick={() => setShowConfirmPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-transparent border-none cursor-pointer p-0">
                        <EyeIcon open={showConfirmPass} />
                      </button>
                    </div>
                  </Field>
                )}

                {activeTab === "login" && (
                  <div className="text-right -mt-1">
                    <button
                      type="button"
                      onClick={() => mudarTab("recuperar")}
                      className="text-xs font-semibold bg-transparent border-none cursor-pointer"
                      style={{ color: GREEN }}
                    >
                      Esqueceu a palavra-passe?
                    </button>
                  </div>
                )}

                {activeTab === "register" && (
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 w-3.5 h-3.5 accent-[#1db954]" />
                    <span className="text-xs text-gray-400 leading-relaxed">
                      Concordo com os{" "}
                      <a href="/termos" className="font-semibold no-underline" style={{ color: GREEN }}>Termos de Serviço</a>
                      {" "}e a{" "}
                      <a href="/privacidade" className="font-semibold no-underline" style={{ color: GREEN }}>Política de Privacidade</a>
                    </span>
                  </label>
                )}

                <BotaoSubmit loading={loading} label={activeTab === "login" ? "Entrar na conta" : "Criar conta"} />
              </form>

              {/* Separador */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 whitespace-nowrap">ou continue com</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Botões sociais */}
              <div className="flex gap-2.5">
                {[
                  {
                    label: "Google",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    ),
                  },
                  {
                    label: "Facebook",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    ),
                  },
                ].map(({ label, icon }) => (
                  <button key={label}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700 cursor-pointer transition hover:border-gray-300 hover:bg-gray-50">
                    {icon} {label}
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-gray-400 mt-5">
                {activeTab === "login" ? "Não tem conta? " : "Já tem conta? "}
                <button
                  onClick={() => mudarTab(activeTab === "login" ? "register" : "login")}
                  className="bg-transparent border-none font-bold cursor-pointer text-xs"
                  style={{ color: GREEN }}
                >
                  {activeTab === "login" ? "Criar conta" : "Entrar"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
      `}</style>
    </div>
  );
}