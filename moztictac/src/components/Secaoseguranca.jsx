import { useState } from "react";

// ─── Ícones SVG inline ────────────────────────────────────────────────────────
const IcoLock     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoEye      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoMonitor  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IcoPhone    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IcoMail     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoShield   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoMapPin   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoCheck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoX        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoAlert    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoSpin     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>;
const IcoLogin    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const IcoKey      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const IcoQR       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="18" y1="14" x2="18" y2="14"/><line x1="21" y1="17" x2="21" y2="17"/><line x1="18" y1="20" x2="21" y2="20"/><line x1="21" y1="14" x2="21" y2="14"/></svg>;
const IcoChevD    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoChevU    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>;

// ─── Dados mock ───────────────────────────────────────────────────────────────
const SESSOES_INICIAIS = [
  { id: "S1", dispositivo: "Chrome · Windows 11", tipo: "desktop", local: "Beira, Sofala",   ip: "196.46.12.34", data: "Agora",        atual: true  },
  { id: "S2", dispositivo: "Chrome · Android 13", tipo: "mobile",  local: "Maputo, MZ",      ip: "196.46.88.12", data: "Há 2 dias",    atual: false },
  { id: "S3", dispositivo: "Safari · iPhone 14",  tipo: "mobile",  local: "Nampula, MZ",     ip: "41.220.14.9",  data: "Há 5 dias",    atual: false },
];

const LOGINS_RECENTES = [
  { data: "17 Abr · 08:14", ip: "196.46.12.34", dispositivo: "Chrome · Windows",  local: "Beira, MZ",   resultado: "sucesso" },
  { data: "14 Abr · 09:03", ip: "102.89.34.11", dispositivo: "Safari · iPhone",   local: "Desconhecido",resultado: "falha"   },
  { data: "12 Abr · 07:30", ip: "196.46.12.34", dispositivo: "Chrome · Windows",  local: "Beira, MZ",   resultado: "sucesso" },
  { data: "10 Abr · 18:55", ip: "196.46.88.12", dispositivo: "Chrome · Android",  local: "Maputo, MZ",  resultado: "sucesso" },
  { data: "08 Abr · 22:10", ip: "102.89.34.11", dispositivo: "Firefox · Windows", local: "Desconhecido",resultado: "falha"   },
];

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full border-0 transition-colors flex-shrink-0 ${value ? "bg-green-600" : "bg-gray-200"} ${disabled ? "opacity-50 cursor-default" : "cursor-pointer"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

// ─── Campo de senha com toggle visibilidade ───────────────────────────────────
function CampoSenha({ label, value, onChange, erro, placeholder = "••••••••" }) {
  const [vis, setVis] = useState(false);
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><IcoLock /></span>
        <input
          type={vis ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border rounded-lg pl-8 pr-9 py-2 text-sm focus:outline-none transition-colors
            ${erro ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
        />
        <button type="button" onClick={() => setVis(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer p-0">
          {vis ? <IcoEyeOff /> : <IcoEye />}
        </button>
      </div>
      {erro && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><IcoAlert /> {erro}</p>}
    </div>
  );
}

// ─── Força da senha ───────────────────────────────────────────────────────────
function ForcaSenha({ senha }) {
  if (!senha) return null;
  const checks = [
    senha.length >= 8,
    /[A-Z]/.test(senha),
    /[0-9]/.test(senha),
    /[^A-Za-z0-9]/.test(senha),
  ];
  const score = checks.filter(Boolean).length;
  const info = [
    { label: "Muito fraca", cor: "bg-red-500",    text: "text-red-600"    },
    { label: "Fraca",       cor: "bg-orange-400",  text: "text-orange-600" },
    { label: "Média",       cor: "bg-amber-400",   text: "text-amber-600"  },
    { label: "Forte",       cor: "bg-green-400",   text: "text-green-600"  },
    { label: "Muito forte", cor: "bg-green-600",   text: "text-green-700"  },
  ][score];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? info.cor : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <p className={`text-xs font-medium ${info.text}`}>{info.label}</p>
        <div className="flex gap-2">
          {[
            { ok: checks[0], label: "8+ chars"   },
            { ok: checks[1], label: "Maiúscula"  },
            { ok: checks[2], label: "Número"     },
            { ok: checks[3], label: "Símbolo"    },
          ].map(({ ok, label }) => (
            <span key={label} className={`text-xs flex items-center gap-0.5 ${ok ? "text-green-600" : "text-gray-300"}`}>
              {ok ? <IcoCheck /> : <IcoX />} {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Secção: Alterar Senha ────────────────────────────────────────────────────
function SecaoAlterarSenha() {
  const [atual,    setAtual]    = useState("");
  const [nova,     setNova]     = useState("");
  const [confirma, setConfirma] = useState("");
  const [erros,    setErros]    = useState({});
  const [salvando, setSalvando] = useState(false);
  const [sucesso,  setSucesso]  = useState(false);

  const validar = () => {
    const e = {};
    if (!atual)           e.atual    = "Introduz a tua senha actual.";
    if (nova.length < 8)  e.nova     = "A senha deve ter pelo menos 8 caracteres.";
    if (nova === atual)   e.nova     = "A nova senha não pode ser igual à actual.";
    if (nova !== confirma) e.confirma = "As senhas não coincidem.";
    return e;
  };

  const handleSubmit = () => {
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return;
    setSalvando(true);
    setTimeout(() => {
      setSalvando(false);
      setSucesso(true);
      setAtual(""); setNova(""); setConfirma("");
      setTimeout(() => setSucesso(false), 3000);
    }, 1400);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-green-600"><IcoLock /></span>
        <p className="text-sm font-semibold text-gray-800">Alterar Palavra-passe</p>
      </div>
      <div className="p-4 space-y-3">
        {sucesso && (
          <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-100 rounded-lg text-green-700 text-xs font-medium">
            <IcoCheck /> Senha actualizada com sucesso!
          </div>
        )}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-2 items-start">
          <span className="text-blue-600 flex-shrink-0 mt-0.5"><IcoShield /></span>
          <p className="text-xs text-blue-800">As senhas são protegidas com <strong>bcrypt</strong>. Nunca armazenamos a tua senha em texto simples.</p>
        </div>
        <CampoSenha label="Senha actual"                 value={atual}    onChange={setAtual}    erro={erros.atual}    />
        <CampoSenha label="Nova senha"                   value={nova}     onChange={setNova}     erro={erros.nova}     />
        <ForcaSenha senha={nova} />
        <CampoSenha label="Confirmar nova senha"         value={confirma} onChange={setConfirma} erro={erros.confirma} />
        <button onClick={handleSubmit} disabled={salvando}
          className={`w-full py-2.5 rounded-lg text-sm font-medium border-0 transition-colors flex items-center justify-center gap-2
            ${salvando ? "bg-gray-200 text-gray-400 cursor-default" : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"}`}>
          {salvando ? <><IcoSpin /> A actualizar...</> : "Actualizar Palavra-passe"}
        </button>
      </div>
    </div>
  );
}

// ─── Secção: 2FA ──────────────────────────────────────────────────────────────
function Secao2FA() {
  const [emailAtivo,  setEmailAtivo]  = useState(true);
  const [appAtivo,    setAppAtivo]    = useState(false);
  const [setupApp,    setSetupApp]    = useState(false);
  const [codigoOTP,   setCodigoOTP]   = useState("");
  const [erroOTP,     setErroOTP]     = useState("");
  const [verificando, setVerificando] = useState(false);
  const [confirmado,  setConfirmado]  = useState(false);

  const verificarOTP = () => {
    if (codigoOTP.length !== 6) { setErroOTP("Introduz os 6 dígitos."); return; }
    setVerificando(true);
    setTimeout(() => {
      setVerificando(false);
      setAppAtivo(true);
      setSetupApp(false);
      setConfirmado(true);
      setCodigoOTP("");
      setTimeout(() => setConfirmado(false), 3000);
    }, 1200);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-green-600"><IcoShield /></span>
        <p className="text-sm font-semibold text-gray-800">Autenticação em Dois Factores (2FA)</p>
      </div>
      <div className="p-4 space-y-3">
        {confirmado && (
          <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-100 rounded-lg text-green-700 text-xs font-medium">
            <IcoCheck /> App autenticadora activada!
          </div>
        )}

        {/* OTP por email */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${emailAtivo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
              <IcoMail />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Verificação por Email</p>
              <p className="text-xs text-gray-400">OTP enviado para ana.machava@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {emailAtivo && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Activo</span>}
            <Toggle value={emailAtivo} onChange={setEmailAtivo} />
          </div>
        </div>

        {/* App autenticadora */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${appAtivo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                <IcoQR />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">App Autenticadora</p>
                <p className="text-xs text-gray-400">Google Authenticator, Authy, etc.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {appAtivo && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Activo</span>}
              <Toggle value={appAtivo} onChange={(v) => { if (!v) { setAppAtivo(false); } else { setSetupApp(true); } }} />
            </div>
          </div>

          {/* Setup app — QR code */}
          {setupApp && !appAtivo && (
            <div className="p-4 border-t border-gray-100 space-y-3">
              <p className="text-xs text-gray-500">1. Abre a tua app autenticadora e digitaliza o QR code abaixo:</p>
              {/* QR placeholder */}
              <div className="flex justify-center">
                <div className="w-28 h-28 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <div className="grid grid-cols-7 gap-0.5 p-2">
                    {Array.from({ length: 49 }, (_, i) =>
                      <div key={i} className={`w-2.5 h-2.5 rounded-sm ${Math.random() > 0.45 ? "bg-gray-900" : "bg-white"}`} />
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-gray-400 mb-1">Ou introduz manualmente:</p>
                <p className="text-xs font-mono font-semibold text-gray-700 tracking-widest">JBSWY3DP EHPK3PXP</p>
              </div>
              <p className="text-xs text-gray-500">2. Introduz o código de 6 dígitos gerado pela app:</p>
              <div>
                <input
                  maxLength={6}
                  value={codigoOTP}
                  onChange={e => { setCodigoOTP(e.target.value.replace(/\D/g, "")); setErroOTP(""); }}
                  placeholder="000000"
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-center font-mono tracking-[0.3em] focus:outline-none transition-colors
                    ${erroOTP ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                />
                {erroOTP && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><IcoAlert /> {erroOTP}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSetupApp(false); setCodigoOTP(""); }} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 bg-transparent cursor-pointer">Cancelar</button>
                <button onClick={verificarOTP} disabled={verificando}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border-0 flex items-center justify-center gap-1.5
                    ${verificando ? "bg-gray-200 text-gray-400 cursor-default" : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"}`}>
                  {verificando ? <><IcoSpin /> A verificar...</> : "Verificar e activar"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info brute force */}
        <div className="flex gap-2 items-start p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <span className="text-amber-600 flex-shrink-0 mt-0.5"><IcoAlert /></span>
          <div>
            <p className="text-xs font-semibold text-amber-800">Protecção contra ataques</p>
            <p className="text-xs text-amber-700 mt-0.5">Após 5 tentativas falhadas, a conta é bloqueada automaticamente por 30 minutos. Tokens são invalidados com <strong>JWT + rotação</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Secção: Sessões ──────────────────────────────────────────────────────────
function SecaoSessoes() {
  const [sessoes,    setSessoes]    = useState(SESSOES_INICIAIS);
  const [encerrando, setEncerrando] = useState(null);
  const [confirma,   setConfirma]   = useState(null);

  const encerrar = (id) => {
    setEncerrando(id);
    setTimeout(() => {
      setSessoes(prev => prev.filter(s => s.id !== id));
      setEncerrando(null);
      setConfirma(null);
    }, 900);
  };

  const encerrarTodas = () => {
    const outras = sessoes.filter(s => !s.atual).map(s => s.id);
    outras.forEach(id => {
      setEncerrando(id);
      setTimeout(() => setSessoes(prev => prev.filter(s => s.atual || s.id === id ? (s.atual ? true : false) : true)), 900);
    });
    setTimeout(() => setSessoes(prev => prev.filter(s => s.atual)), 1000);
  };

  const outrasAtivas = sessoes.filter(s => !s.atual).length;

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-green-600"><IcoMonitor /></span>
          <p className="text-sm font-semibold text-gray-800">Sessões Activas</p>
        </div>
        {outrasAtivas > 0 && (
          <button onClick={encerrarTodas} className="text-xs text-red-500 font-semibold border-0 bg-transparent cursor-pointer hover:text-red-700">
            Terminar todas
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-50">
        {sessoes.map(s => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.atual ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
              {s.tipo === "mobile" ? <IcoPhone /> : <IcoMonitor />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold text-gray-900">{s.dispositivo}</p>
                {s.atual && <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Esta sessão</span>}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-gray-400 flex items-center gap-1"><IcoMapPin /> {s.local}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 font-mono">{s.ip}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">{s.data}</span>
              </div>
            </div>
            {!s.atual && (
              confirma === s.id ? (
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setConfirma(null)} className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-500 bg-transparent cursor-pointer">Não</button>
                  <button onClick={() => encerrar(s.id)} disabled={encerrando === s.id}
                    className={`px-2 py-1 rounded-lg text-xs font-medium border-0 flex items-center gap-1
                      ${encerrando === s.id ? "bg-gray-200 text-gray-400 cursor-default" : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"}`}>
                    {encerrando === s.id ? <IcoSpin /> : "Sim"}
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirma(s.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 border-0 bg-transparent cursor-pointer flex-shrink-0">
                  Terminar
                </button>
              )
            )}
          </div>
        ))}
        {sessoes.length === 1 && (
          <div className="px-4 py-3 text-xs text-gray-400 text-center">Só a sessão actual está activa.</div>
        )}
      </div>
    </div>
  );
}

// ─── Secção: Histórico de Logins ──────────────────────────────────────────────
function SecaoHistoricoLogins() {
  const [aberto, setAberto] = useState(false);
  const visiveis = aberto ? LOGINS_RECENTES : LOGINS_RECENTES.slice(0, 3);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-green-600"><IcoLogin /></span>
        <p className="text-sm font-semibold text-gray-800">Histórico de Logins</p>
      </div>
      <div className="divide-y divide-gray-50">
        {visiveis.map((l, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold
              ${l.resultado === "sucesso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {l.resultado === "sucesso" ? <IcoCheck /> : <IcoX />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-semibold text-gray-800">{l.dispositivo}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                  ${l.resultado === "sucesso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {l.resultado}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-400">{l.data}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 font-mono">{l.ip}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400 flex items-center gap-0.5"><IcoMapPin /> {l.local}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setAberto(v => !v)}
        className="w-full py-2.5 text-xs text-green-600 font-medium border-t border-gray-100 bg-transparent cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors">
        {aberto ? <><IcoChevU /> Ver menos</> : <><IcoChevD /> Ver todos ({LOGINS_RECENTES.length} logins)</>}
      </button>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function SecaoSeguranca() {
  const score2fa = 2; // email + (app se ativo)

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <p className="text-base font-semibold text-gray-900">Segurança da Conta</p>
          <p className="text-xs text-gray-400">Última actualização: 14 Abr 2025</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 border border-green-100 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-green-700">Conta segura</span>
        </div>
      </div>

      {/* Score de segurança */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Nível</p>
          <p className="text-xl font-semibold text-green-600">Alto</p>
          <p className="text-xs text-gray-400 mt-1">protecção activa</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">2FA</p>
          <p className="text-xl font-semibold font-mono text-gray-900">{score2fa}<span className="text-sm text-gray-400">/2</span></p>
          <p className="text-xs text-gray-400 mt-1">métodos activos</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Sessões</p>
          <p className="text-xl font-semibold font-mono text-gray-900">3</p>
          <p className="text-xs text-gray-400 mt-1">dispositivos</p>
        </div>
      </div>

      <SecaoAlterarSenha />
      <Secao2FA />
      <SecaoSessoes />
      <SecaoHistoricoLogins />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        input, button, select { font-family: inherit; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default SecaoSeguranca;