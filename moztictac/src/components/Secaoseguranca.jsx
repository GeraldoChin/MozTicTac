import { useState, useEffect, useCallback } from "react";

// ─── Config ────────────────────────────────────────────────────────────────
const BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "http://localhost:3000/api/v1";

// ⚠️ Confirma este path com o ficheiro de rotas — assumido a partir do authControlador
const ROTA_ALTERAR_SENHA = "/auth/alterar-senha";
const ROTA_SESSOES = "/conta/seguranca/sessoes";

async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.mensagem || dados.message || `Erro ${resposta.status}`);
  return dados;
}

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
const IcoLockClosed = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoChevD    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoChevU    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>;

// ─── Helpers de formatação ─────────────────────────────────────────────────
function formatarData(dataStr) {
  if (!dataStr) return "—";
  const data = new Date(dataStr);
  const agora = new Date();
  const diff  = agora - data;
  const mins  = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Agora mesmo";
  if (mins < 60)  return `Há ${mins} min`;
  if (horas < 24) return `Hoje · ${data.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}`;
  if (dias === 1) return `Ontem · ${data.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}`;
  return data.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short" });
}

function ehMobile(dispositivoStr = "") {
  return /android|iphone|mobile|ipad/i.test(dispositivoStr);
}

function nomeAmigavelDispositivo(uaOuTexto) {
  if (!uaOuTexto) return "Dispositivo desconhecido";
  // Tenta extrair algo legível de um user-agent bruto; senão devolve como está
  if (uaOuTexto.length > 60) {
    if (/chrome/i.test(uaOuTexto)) return ehMobile(uaOuTexto) ? "Chrome · Mobile" : "Chrome · Desktop";
    if (/firefox/i.test(uaOuTexto)) return "Firefox";
    if (/safari/i.test(uaOuTexto)) return ehMobile(uaOuTexto) ? "Safari · Mobile" : "Safari · Desktop";
    return "Dispositivo desconhecido";
  }
  return uaOuTexto;
}

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

// ─── Secção: Alterar Senha (LIGADO AO BACKEND) ────────────────────────────────
function SecaoAlterarSenha() {
  const [atual,    setAtual]    = useState("");
  const [nova,     setNova]     = useState("");
  const [confirma, setConfirma] = useState("");
  const [erros,    setErros]    = useState({});
  const [salvando, setSalvando] = useState(false);
  const [sucesso,  setSucesso]  = useState(false);

  const validar = () => {
    const e = {};
    if (!atual)            e.atual    = "Introduz a tua senha actual.";
    if (nova.length < 8)   e.nova     = "A senha deve ter pelo menos 8 caracteres.";
    if (nova === atual)    e.nova     = "A nova senha não pode ser igual à actual.";
    if (nova !== confirma) e.confirma = "As senhas não coincidem.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return;

    setSalvando(true);
    try {
      await requisitar(ROTA_ALTERAR_SENHA, {
        method: "POST",
        body: JSON.stringify({ senhaAtual: atual, novaSenha: nova }),
      });
      setSucesso(true);
      setAtual(""); setNova(""); setConfirma(""); setErros({});
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      // Backend devolve "Senha atual incorreta" quando aplicável
      setErros({ atual: err.message });
    } finally {
      setSalvando(false);
    }
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
            <IcoCheck /> Senha actualizada com sucesso! As outras sessões foram terminadas.
          </div>
        )}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-2 items-start">
          <span className="text-blue-600 flex-shrink-0 mt-0.5"><IcoShield /></span>
          <p className="text-xs text-blue-800">As senhas são protegidas com <strong>bcrypt</strong>. Nunca armazenamos a tua senha em texto simples.</p>
        </div>
        <CampoSenha label="Senha actual"         value={atual}    onChange={setAtual}    erro={erros.atual}    />
        <CampoSenha label="Nova senha"            value={nova}     onChange={setNova}     erro={erros.nova}     />
        <ForcaSenha senha={nova} />
        <CampoSenha label="Confirmar nova senha"  value={confirma} onChange={setConfirma} erro={erros.confirma} />
        <button onClick={handleSubmit} disabled={salvando}
          className={`w-full py-2.5 rounded-lg text-sm font-medium border-0 transition-colors flex items-center justify-center gap-2
            ${salvando ? "bg-gray-200 text-gray-400 cursor-default" : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"}`}>
          {salvando ? <><IcoSpin /> A actualizar...</> : "Actualizar Palavra-passe"}
        </button>
      </div>
    </div>
  );
}

// ─── Secção: 2FA (SEM BACKEND — UI desactivada de propósito) ─────────────────
function Secao2FA() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-green-600"><IcoShield /></span>
        <p className="text-sm font-semibold text-gray-800">Autenticação em Dois Factores (2FA)</p>
      </div>
      <div className="p-4 space-y-3">
        {/* OTP por email — sempre activo nas acções críticas (login de risco, recuperação, saques) */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-100 text-green-700">
              <IcoMail />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Verificação por Email</p>
              <p className="text-xs text-gray-400">Código OTP usado em recuperação de senha e saques</p>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Sempre activo</span>
        </div>

        {/* App autenticadora — sem endpoint no backend ainda */}
        <div className="relative border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-gray-50 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 text-gray-400">
                <IcoLockClosed />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">App Autenticadora</p>
                <p className="text-xs text-gray-400">Google Authenticator, Authy, etc.</p>
              </div>
            </div>
            <Toggle value={false} onChange={() => {}} disabled />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
            <span className="text-xs font-semibold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
              Em breve
            </span>
          </div>
        </div>

        <div className="flex gap-2 items-start p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <span className="text-amber-600 flex-shrink-0 mt-0.5"><IcoAlert /></span>
          <div>
            <p className="text-xs font-semibold text-amber-800">Protecção contra ataques</p>
            <p className="text-xs text-amber-700 mt-0.5">Após 5 tentativas falhadas, a conta é bloqueada automaticamente. Tokens são invalidados com <strong>JWT + rotação</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Secção: Sessões (LIGADO AO BACKEND) ──────────────────────────────────────
function SecaoSessoes({ sessoes, carregando, erro, onTerminar, onTerminarTodas, terminandoId }) {
  const [confirma, setConfirma] = useState(null);
  const [confirmaTodas, setConfirmaTodas] = useState(false);

  const handleTerminar = (id) => {
    onTerminar(id);
    setConfirma(null);
  };

  const handleTerminarTodas = () => {
    onTerminarTodas();
    setConfirmaTodas(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-green-600"><IcoMonitor /></span>
          <p className="text-sm font-semibold text-gray-800">Sessões Activas</p>
        </div>
        {sessoes.length > 1 && !confirmaTodas && (
          <button onClick={() => setConfirmaTodas(true)} className="text-xs text-red-500 font-semibold border-0 bg-transparent cursor-pointer hover:text-red-700">
            Terminar todas
          </button>
        )}
        {confirmaTodas && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Isto também vai desconectar-te. Confirmas?</span>
            <button onClick={() => setConfirmaTodas(false)} className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-500 bg-transparent cursor-pointer">Não</button>
            <button onClick={handleTerminarTodas} className="px-2 py-1 rounded-lg text-xs font-medium border-0 bg-red-500 hover:bg-red-600 text-white cursor-pointer">Sim, terminar</button>
          </div>
        )}
      </div>

      {carregando ? (
        <div className="p-4 space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : erro ? (
        <div className="p-4 text-xs text-red-500 text-center">{erro}</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {sessoes.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-400">
                {ehMobile(s.dispositivo) ? <IcoPhone /> : <IcoMonitor />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{nomeAmigavelDispositivo(s.dispositivo)}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400 font-mono">{s.ip || "IP desconhecido"}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">Última actividade: {formatarData(s.ultimoAcesso)}</span>
                </div>
              </div>
              {confirma === s.id ? (
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setConfirma(null)} className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-500 bg-transparent cursor-pointer">Não</button>
                  <button onClick={() => handleTerminar(s.id)} disabled={terminandoId === s.id}
                    className={`px-2 py-1 rounded-lg text-xs font-medium border-0 flex items-center gap-1
                      ${terminandoId === s.id ? "bg-gray-200 text-gray-400 cursor-default" : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"}`}>
                    {terminandoId === s.id ? <IcoSpin /> : "Sim"}
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirma(s.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 border-0 bg-transparent cursor-pointer flex-shrink-0">
                  Terminar
                </button>
              )}
            </div>
          ))}
          {sessoes.length === 0 && (
            <div className="px-4 py-3 text-xs text-gray-400 text-center">Nenhuma sessão activa encontrada.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Secção: Histórico de Logins (LIGADO AO BACKEND) ─────────────────────────
function SecaoHistoricoLogins({ logins, carregando, erro }) {
  const [aberto, setAberto] = useState(false);
  const visiveis = aberto ? logins : logins.slice(0, 3);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-green-600"><IcoLogin /></span>
        <p className="text-sm font-semibold text-gray-800">Histórico de Logins</p>
      </div>

      {carregando ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : erro ? (
        <div className="p-4 text-xs text-red-500 text-center">{erro}</div>
      ) : (
        <>
          <div className="divide-y divide-gray-50">
            {visiveis.map((l) => {
              const sucesso = (l.resultado || "").toLowerCase() === "sucesso";
              return (
                <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold
                    ${sucesso ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {sucesso ? <IcoCheck /> : <IcoX />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-semibold text-gray-800">{l.acao === "LOGIN" ? "Login" : "Logout"}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                        ${sucesso ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {l.resultado || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">{formatarData(l.data)}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400 font-mono">{l.ip || "—"}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{nomeAmigavelDispositivo(l.dispositivo)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {logins.length === 0 && (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">Sem registos de login.</div>
            )}
          </div>
          {logins.length > 3 && (
            <button onClick={() => setAberto(v => !v)}
              className="w-full py-2.5 text-xs text-green-600 font-medium border-t border-gray-100 bg-transparent cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors">
              {aberto ? <><IcoChevU /> Ver menos</> : <><IcoChevD /> Ver todos ({logins.length} logins)</>}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function SecaoSeguranca() {
  const [sessoes,      setSessoes]      = useState([]);
  const [logins,       setLogins]       = useState([]);
  const [carregando,   setCarregando]   = useState(true);
  const [erro,         setErro]         = useState(null);
  const [terminandoId, setTerminandoId] = useState(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    requisitar(ROTA_SESSOES)
      .then(res => {
        const d = res.data ?? res.dados ?? {};
        setSessoes(d.sessoesAtivas ?? []);
        setLogins(d.loginsRecentes ?? []);
      })
      .catch(e => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function terminarSessao(id) {
    setTerminandoId(id);
    try {
      await requisitar(`${ROTA_SESSOES}/${id}`, { method: "DELETE" });
      setSessoes(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert("Erro ao terminar sessão: " + e.message);
    } finally {
      setTerminandoId(null);
    }
  }

  async function terminarTodasSessoes() {
    try {
      await requisitar(ROTA_SESSOES, { method: "DELETE" });
      // Backend revoga TODOS os tokens, incluindo o desta sessão — força logout
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (e) {
      alert("Erro: " + e.message);
    }
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <p className="text-base font-semibold text-gray-900">Segurança da Conta</p>
          <p className="text-xs text-gray-400">Mantém a tua conta protegida</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 border border-green-100 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-green-700">Conta segura</span>
        </div>
      </div>

      {/* Resumo dinâmico */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">2FA Email</p>
          <p className="text-xl font-semibold text-green-600">Activo</p>
          <p className="text-xs text-gray-400 mt-1">acções críticas protegidas</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Sessões</p>
          <p className="text-xl font-semibold font-mono text-gray-900">
            {carregando ? "—" : sessoes.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">dispositivos activos</p>
        </div>
      </div>

      <SecaoAlterarSenha />
      <Secao2FA />
      <SecaoSessoes
        sessoes={sessoes}
        carregando={carregando}
        erro={erro}
        onTerminar={terminarSessao}
        onTerminarTodas={terminarTodasSessoes}
        terminandoId={terminandoId}
      />
      <SecaoHistoricoLogins logins={logins} carregando={carregando} erro={erro} />

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