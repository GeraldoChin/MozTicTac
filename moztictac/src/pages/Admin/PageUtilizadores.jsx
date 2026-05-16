import { useState, useEffect, useCallback, useRef } from "react";

// ── API ───────────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const cabecalhos = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opcoes.headers,
  };
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: cabecalhos,
  });
  const dados = await resposta.json();
  if (!resposta.ok)
    throw new Error(dados.mensagem || dados.message || `Erro ${resposta.status}`);
  return dados;
}

const apiAdmin = {
  listarUtilizadores: ({ pagina, busca, estado, nivelVerificacao, scoreMin, scoreMax, dataInicio, dataFim }) => {
    const qs = new URLSearchParams();
    if (pagina) qs.set("pagina", pagina);
    if (busca)  qs.set("busca", busca);
    if (estado && estado !== "todos") {
      const mapa = { ativo: "ATIVA", bloqueado: "BLOQUEADA", pendente: "PENDENTE" };
      qs.set("estado", mapa[estado] || estado);
    }
    if (nivelVerificacao && nivelVerificacao !== "todos") qs.set("nivelVerificacao", nivelVerificacao);
    if (scoreMin) qs.set("scoreMin", scoreMin);
    if (scoreMax) qs.set("scoreMax", scoreMax);
    if (dataInicio) qs.set("dataInicio", dataInicio);
    if (dataFim)    qs.set("dataFim", dataFim);
    return requisitar(`/admin/utilizadores?${qs.toString()}`);
  },
  bloquear:    (id, motivo) => requisitar(`/admin/utilizadores/${id}/bloquear`,    { method: "POST", body: JSON.stringify({ motivo }) }),
  desbloquear: (id)         => requisitar(`/admin/utilizadores/${id}/desbloquear`, { method: "POST" }),
  eliminar:    (id, motivo) => requisitar(`/admin/utilizadores/${id}`,             { method: "DELETE", body: JSON.stringify({ motivo }) }),
  aprovarKyc:  (id)         => requisitar(`/admin/kyc/${id}/aprovar`,              { method: "POST" }),
  rejeitarKyc: (id, motivo) => requisitar(`/admin/kyc/${id}/rejeitar`,             { method: "POST", body: JSON.stringify({ motivo }) }),
  ajustarSaldo:(usuarioId, valor, tipo, descricao) =>
    requisitar(`/admin/financeiro/ajustar-saldo`, { method: "POST", body: JSON.stringify({ usuarioId, valor, tipo, descricao }) }),
  obterPerfil: (id)         => requisitar(`/admin/utilizadores/${id}`),
  obterLogs:   (id)         => requisitar(`/admin/auditoria?usuarioId=${id}&pagina=1`),
  enviarNotificacao: (usuarioId, titulo, mensagem, tipo) =>
    requisitar(`/admin/notificacoes`, { method: "POST", body: JSON.stringify({ usuarioId, titulo, mensagem, tipo }) }),
};

// ── Helpers ───────────────────────────────────────────────────────
const fmtData = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtMZN = (v) =>
  Number(v || 0).toLocaleString("pt-MZ", { style: "currency", currency: "MZN", maximumFractionDigits: 0 });

const ESTADO_MAP = {
  ATIVA:     { label: "Ativo",     cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  BLOQUEADA: { label: "Bloqueado", cls: "bg-red-50 text-red-700 border border-red-200" },
  PENDENTE:  { label: "Pendente",  cls: "bg-amber-50 text-amber-700 border border-amber-200" },
};
const KYC_MAP = {
  KYC_COMPLETO:    { label: "KYC Completo",    cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  EMAIL_VERIFICADO:{ label: "Email OK",         cls: "bg-sky-50 text-sky-700 border border-sky-200" },
  NAO_VERIFICADO:  { label: "Não verificado",  cls: "bg-zinc-100 text-zinc-500 border border-zinc-200" },
};

const scoreClass = (s) =>
  s >= 70 ? "text-emerald-600 font-semibold" :
  s >= 40 ? "text-amber-600 font-semibold"   :
            "text-red-600 font-semibold";

const AVATAR_BG = [
  "bg-blue-500","bg-violet-500","bg-emerald-500",
  "bg-amber-500","bg-pink-500","bg-teal-500",
];

function Avatar({ name = "", idx = 0, size = "md" }) {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const sz = size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 ${AVATAR_BG[idx % AVATAR_BG.length]}`}>
      {initials}
    </div>
  );
}

function Badge({ label, cls }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {label}
    </span>
  );
}

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ items, remove }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {items.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium shadow-lg border pointer-events-auto animate-in slide-in-from-bottom-2
          ${t.type === "error"
            ? "bg-red-50 border-red-200 text-red-700"
            : t.type === "warning"
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          <span>{t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "✓"}</span>
          {t.msg}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-50 hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Modal genérico ────────────────────────────────────────────────
function Modal({ title, subtitle, icon, iconBg, children, onClose, maxW = "max-w-md" }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxW} overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconBg}`}>{icon}</div>
            <div>
              <div className="font-semibold text-zinc-900 text-sm">{title}</div>
              {subtitle && <div className="text-xs text-zinc-400 mt-0.5">{subtitle}</div>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors text-sm">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Btn({ label, icon, variant = "secondary", size = "md", onClick, loading, disabled, className = "" }) {
  const base = `inline-flex items-center gap-2 font-medium transition-all rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`;
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary:   "bg-zinc-900 text-white hover:bg-zinc-700",
    secondary: "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50",
    danger:    "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100",
    ghost:     "text-zinc-500 hover:bg-zinc-100",
    success:   "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    warning:   "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled || loading}>
      {loading
        ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : icon && <span className="text-xs">{icon}</span>
      }
      {label}
    </button>
  );
}

// ── Modal Bloquear ────────────────────────────────────────────────
function ModalBloquear({ user, onConfirm, onClose, loading }) {
  const [motivo, setMotivo] = useState("");
  return (
    <Modal title="Bloquear utilizador" subtitle={user?.nomeCompleto} icon="🚫" iconBg="bg-red-50 text-red-500" onClose={onClose}>
      <p className="text-sm text-zinc-500 mb-4">O utilizador perderá acesso à plataforma. Indica o motivo:</p>
      <textarea
        value={motivo} onChange={e => setMotivo(e.target.value)}
        placeholder="Ex: Comportamento suspeito, spam, violação de termos..."
        rows={3}
        className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10 bg-zinc-50"
      />
      <div className="flex justify-end gap-2 mt-4">
        <Btn label="Cancelar" variant="secondary" onClick={onClose} disabled={loading} />
        <Btn label="Bloquear" variant="danger" onClick={() => onConfirm(motivo || "Sem motivo")} loading={loading} disabled={!motivo.trim()} />
      </div>
    </Modal>
  );
}

// ── Modal Eliminar ────────────────────────────────────────────────
function ModalEliminar({ user, onConfirm, onClose, loading }) {
  const [motivo, setMotivo] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const nomeEsperado = user?.nomeCompleto?.split(" ")[0] || "";
  return (
    <Modal title="Eliminar conta" subtitle={user?.nomeCompleto} icon="🗑" iconBg="bg-red-50 text-red-500" onClose={onClose}>
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
        <p className="text-xs text-red-600 font-medium">⚠ Esta acção é irreversível. Todos os dados do utilizador serão eliminados permanentemente.</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Motivo da eliminação</label>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={2}
            placeholder="Motivo detalhado..."
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-zinc-50" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">
            Escreve <span className="font-bold text-zinc-700">"{nomeEsperado}"</span> para confirmar
          </label>
          <input value={confirmacao} onChange={e => setConfirmacao(e.target.value)}
            placeholder={nomeEsperado}
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-zinc-50" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Btn label="Cancelar" variant="secondary" onClick={onClose} disabled={loading} />
        <Btn label="Eliminar permanentemente" variant="danger"
          onClick={() => onConfirm(motivo)} loading={loading}
          disabled={confirmacao !== nomeEsperado || !motivo.trim()} />
      </div>
    </Modal>
  );
}

// ── Modal KYC ─────────────────────────────────────────────────────
function ModalKyc({ user, onAprovar, onRejeitar, onClose, loading }) {
  const [motivo, setMotivo] = useState("");
  const [aba, setAba] = useState("aprovar");
  return (
    <Modal title="Gestão KYC" subtitle={user?.nomeCompleto} icon="🛡" iconBg="bg-blue-50 text-blue-500" onClose={onClose}>
      <div className="flex gap-2 mb-4">
        {["aprovar","rejeitar"].map(a => (
          <button key={a} onClick={() => setAba(a)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${aba===a ? (a==="aprovar"?"bg-emerald-600 text-white":"bg-red-600 text-white") : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
            {a === "aprovar" ? "✓ Aprovar KYC" : "✕ Rejeitar KYC"}
          </button>
        ))}
      </div>
      {aba === "aprovar" ? (
        <div>
          <p className="text-sm text-zinc-500 mb-4">O utilizador receberá nível <strong>KYC_COMPLETO</strong> e poderá efectuar saques.</p>
          <div className="flex justify-end gap-2">
            <Btn label="Cancelar" variant="secondary" onClick={onClose} disabled={loading} />
            <Btn label="Aprovar KYC" variant="success" onClick={onAprovar} loading={loading} />
          </div>
        </div>
      ) : (
        <div>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
            placeholder="Motivo da rejeição (ex: documento ilegível, dados inconsistentes...)"
            className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-zinc-50 mb-4" />
          <div className="flex justify-end gap-2">
            <Btn label="Cancelar" variant="secondary" onClick={onClose} disabled={loading} />
            <Btn label="Rejeitar" variant="danger" onClick={() => onRejeitar(motivo)} loading={loading} disabled={!motivo.trim()} />
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Modal Ajustar Saldo ───────────────────────────────────────────
function ModalAjustarSaldo({ user, onConfirm, onClose, loading }) {
  const [tipo, setTipo] = useState("CREDITO");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const valOk = Number(valor) > 0 && descricao.length >= 10;
  return (
    <Modal title="Ajustar saldo" subtitle={user?.nomeCompleto} icon="💰" iconBg="bg-amber-50 text-amber-500" onClose={onClose}>
      <div className="bg-zinc-50 rounded-xl p-3 mb-4 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Saldo disponível</span>
        <span className="font-semibold text-zinc-900 text-sm">{fmtMZN(user?.carteira?.saldoDisponivel)}</span>
      </div>
      <div className="flex gap-2 mb-4">
        {["CREDITO","DEBITO"].map(t => (
          <button key={t} onClick={() => setTipo(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tipo===t ? (t==="CREDITO"?"bg-emerald-600 text-white":"bg-red-600 text-white") : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
            {t === "CREDITO" ? "+ Crédito" : "− Débito"}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Valor (MZN)</label>
          <input type="number" value={valor} onChange={e => setValor(e.target.value)} min="1"
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 bg-zinc-50" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Descrição <span className="text-zinc-400">(mín. 10 caracteres)</span></label>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2}
            placeholder="Ex: Compensação por falha no pagamento de pedido #..."
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10 bg-zinc-50" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Btn label="Cancelar" variant="secondary" onClick={onClose} disabled={loading} />
        <Btn label="Confirmar ajuste" variant="primary" onClick={() => onConfirm(Number(valor), tipo, descricao)} loading={loading} disabled={!valOk} />
      </div>
    </Modal>
  );
}

// ── Modal Notificação ─────────────────────────────────────────────
function ModalNotificacao({ user, onConfirm, onClose, loading }) {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("INFO");
  const TIPOS = ["INFO","AVISO","URGENTE"];
  return (
    <Modal title="Enviar notificação" subtitle={user?.nomeCompleto} icon="🔔" iconBg="bg-violet-50 text-violet-500" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Tipo</label>
          <div className="flex gap-2">
            {TIPOS.map(t => (
              <button key={t} onClick={() => setTipo(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${tipo===t?"bg-violet-600 text-white":"bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Título</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título da notificação"
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-zinc-50" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Mensagem</label>
          <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} rows={3}
            placeholder="Conteúdo da mensagem..."
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-zinc-50" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Btn label="Cancelar" variant="secondary" onClick={onClose} disabled={loading} />
        <Btn label="Enviar" variant="primary" onClick={() => onConfirm(titulo, mensagem, tipo)}
          loading={loading} disabled={!titulo.trim() || !mensagem.trim()} />
      </div>
    </Modal>
  );
}

// ── Drawer Perfil ─────────────────────────────────────────────────
function DrawerPerfil({ user, idx, onClose, onAbrirKyc, onAbrirSaldo, onAbrirNotif, onBloquear, onDesbloquear, onEliminar }) {
  const [logs, setLogs] = useState([]);
  const [logsLoad, setLogsLoad] = useState(false);

  useEffect(() => {
    setLogsLoad(true);
    apiAdmin.obterLogs(user.id)
      .then(r => setLogs(r.dados?.logs || r.data?.logs || []))
      .catch(() => {})
      .finally(() => setLogsLoad(false));
  }, [user.id]);

  const bloqueado = user.estadoConta === "BLOQUEADA";
  const estado = ESTADO_MAP[user.estadoConta] || { label: user.estadoConta, cls: "bg-zinc-100 text-zinc-500" };
  const kyc    = KYC_MAP[user.nivelVerificacao]  || { label: user.nivelVerificacao, cls: "bg-zinc-100 text-zinc-500" };

  return (
    <div className="fixed inset-0 z-30 flex" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right-4 duration-200">

        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <span className="text-sm font-semibold text-zinc-700">Perfil do utilizador</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors text-sm">✕</button>
        </div>

        {/* Identidade */}
        <div className="p-5 border-b border-zinc-100">
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={user.nomeCompleto} idx={idx} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-zinc-900 truncate">{user.nomeCompleto}</div>
              <div className="text-xs text-zinc-400 truncate">{user.email}</div>
              {user.telefone && <div className="text-xs text-zinc-400 font-mono">{user.telefone}</div>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={estado.label} cls={estado.cls} />
            <Badge label={kyc.label}    cls={kyc.cls} />
            {user.cidade && <span className="text-xs text-zinc-400 flex items-center gap-1">📍 {user.cidade}</span>}
          </div>
        </div>

        {/* Score de confiança */}
        <div className="p-5 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Score de confiança</span>
            <span className={`text-sm ${scoreClass(user.scoreConfianca || 0)}`}>{user.scoreConfianca || 0}/100</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${(user.scoreConfianca||0) >= 70 ? "bg-emerald-500" : (user.scoreConfianca||0) >= 40 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${user.scoreConfianca || 0}%` }}
            />
          </div>
        </div>

        {/* Carteira */}
        <div className="p-5 border-b border-zinc-100">
          <div className="text-xs font-medium text-zinc-500 mb-3">Carteira</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Disponível",  v: user.carteira?.saldoDisponivel, color: "text-emerald-600" },
              { label: "Pendente",    v: user.carteira?.saldoPendente,    color: "text-amber-600" },
            ].map(({ label, v, color }) => (
              <div key={label} className="bg-zinc-50 rounded-xl p-3">
                <div className="text-xs text-zinc-400 mb-1">{label}</div>
                <div className={`text-sm font-semibold ${color}`}>{fmtMZN(v)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Datas */}
        <div className="p-5 border-b border-zinc-100">
          <div className="space-y-2">
            {[
              { label: "Registado em", v: fmtData(user.criadoEm) },
              { label: "Último login", v: user.ultimoLogin ? fmtData(user.ultimoLogin) : "Nunca" },
            ].map(({ label, v }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 text-xs">{label}</span>
                <span className="text-zinc-700 text-xs font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logs recentes */}
        <div className="p-5 border-b border-zinc-100">
          <div className="text-xs font-medium text-zinc-500 mb-3">Actividade recente</div>
          {logsLoad ? (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              A carregar...
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-zinc-400">Sem registos de auditoria.</p>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md font-mono">{log.acao}</span>
                  <span className="text-xs text-zinc-400 whitespace-nowrap">{fmtData(log.criadoEm)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acções */}
        <div className="p-5 space-y-2 mt-auto">
          <div className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">Acções</div>
          <div className="grid grid-cols-2 gap-2">
            <Btn label="Ajustar saldo"   icon="💰" variant="secondary" size="sm" onClick={onAbrirSaldo}   className="justify-center" />
            <Btn label="Notificação"      icon="🔔" variant="secondary" size="sm" onClick={onAbrirNotif}   className="justify-center" />
            <Btn label="Gerir KYC"        icon="🛡" variant="secondary" size="sm" onClick={onAbrirKyc}     className="justify-center" />
            {bloqueado
              ? <Btn label="Desbloquear" icon="✓" variant="success"   size="sm" onClick={onDesbloquear}  className="justify-center" />
              : <Btn label="Bloquear"    icon="🚫" variant="warning"   size="sm" onClick={onBloquear}     className="justify-center" />
            }
          </div>
          <Btn label="Eliminar conta permanentemente" icon="🗑" variant="danger" size="sm" onClick={onEliminar} className="w-full justify-center mt-1" />
        </div>

      </div>
    </div>
  );
}

// ── Filtros avançados ─────────────────────────────────────────────
function PainelFiltros({ filtros, setFiltros, onLimpar, show }) {
  if (!show) return null;
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <label className="text-xs font-medium text-zinc-500 mb-1 block">Nível verificação</label>
        <select value={filtros.nivelVerificacao} onChange={e => setFiltros(f => ({ ...f, nivelVerificacao: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
          <option value="todos">Todos</option>
          <option value="KYC_COMPLETO">KYC Completo</option>
          <option value="EMAIL_VERIFICADO">Email verificado</option>
          <option value="NAO_VERIFICADO">Não verificado</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500 mb-1 block">Score mín.</label>
        <input type="number" min="0" max="100" value={filtros.scoreMin} onChange={e => setFiltros(f => ({ ...f, scoreMin: e.target.value }))}
          placeholder="0" className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500 mb-1 block">Score máx.</label>
        <input type="number" min="0" max="100" value={filtros.scoreMax} onChange={e => setFiltros(f => ({ ...f, scoreMax: e.target.value }))}
          placeholder="100" className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500 mb-1 block">Registado desde</label>
        <input type="date" value={filtros.dataInicio} onChange={e => setFiltros(f => ({ ...f, dataInicio: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
      </div>
      <div className="col-span-2 md:col-span-4 flex justify-end">
        <Btn label="Limpar filtros avançados" variant="ghost" size="sm" onClick={onLimpar} />
      </div>
    </div>
  );
}

// ── Paginação ─────────────────────────────────────────────────────
const POR_PAGINA = 20;

function Paginacao({ page, total, onChange }) {
  const totalPags = Math.max(1, Math.ceil(total / POR_PAGINA));
  if (totalPags <= 1) return null;

  const pages = [];
  if (totalPags <= 7) {
    for (let i = 1; i <= totalPags; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPags - 1, page + 1); i++) pages.push(i);
    if (page < totalPags - 2) pages.push("…");
    pages.push(totalPags);
  }

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
      <span className="text-xs text-zinc-400">
        Página {page} de {totalPags} — {total.toLocaleString("pt-MZ")} utilizadores
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="h-8 px-3 rounded-lg border border-zinc-200 text-xs text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          ‹
        </button>
        {pages.map((p, i) => (
          <button key={i} onClick={() => typeof p === "number" && onChange(p)} disabled={p === "…"}
            className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${p === page ? "bg-zinc-900 text-white border-zinc-900" : p === "…" ? "text-zinc-300 cursor-default" : "border border-zinc-200 text-zinc-500 hover:bg-zinc-50"} border`}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPags}
          className="h-8 px-3 rounded-lg border border-zinc-200 text-xs text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          ›
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────
export default function PageUtilizadores() {
  const [users, setUsers]             = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [estado, setEstado]           = useState("todos");
  const [loading, setLoading]         = useState(false);
  const [actionId, setActionId]       = useState(null);
  const [selected, setSelected]       = useState([]);
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros]         = useState({ nivelVerificacao: "todos", scoreMin: "", scoreMax: "", dataInicio: "", dataFim: "" });

  const [drawer, setDrawer]           = useState(null); // { user, idx }
  const [modal, setModal]             = useState(null); // { type, user, idx }
  const [toasts, setToasts]           = useState([]);

  // ── Toast helpers ─────────────────────────────────────────────
  const addToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  // ── Carregar ──────────────────────────────────────────────────
  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res   = await apiAdmin.listarUtilizadores({ pagina: page, busca: search, estado, ...filtros });
      const lista = res.dados?.utilizadores || res.data?.utilizadores || [];
      const tot   = res.dados?.total        || res.data?.total        || 0;
      setUsers(lista);
      setTotal(tot);
    } catch (err) {
      addToast(err.message || "Erro ao carregar", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, estado, filtros, addToast]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Selecção ──────────────────────────────────────────────────
  const allSel    = users.length > 0 && users.every(u => selected.includes(u.id));
  const toggleAll = () => setSelected(allSel ? [] : users.map(u => u.id));
  const toggleOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // ── Limpar filtros ─────────────────────────────────────────────
  const limparTudo = () => {
    setSearchInput(""); setSearch(""); setEstado("todos"); setPage(1);
    setFiltros({ nivelVerificacao: "todos", scoreMin: "", scoreMax: "", dataInicio: "", dataFim: "" });
  };
  const limparFiltrosAvancados = () =>
    setFiltros({ nivelVerificacao: "todos", scoreMin: "", scoreMax: "", dataInicio: "", dataFim: "" });

  // ── Acções ────────────────────────────────────────────────────
  const fecharModal  = () => setModal(null);

  async function handleBloquear(user, motivo) {
    setActionId(user.id);
    try {
      await apiAdmin.bloquear(user.id, motivo);
      addToast(`${user.nomeCompleto} bloqueado`);
      fecharModal(); setDrawer(null); carregar();
    } catch (e) { addToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  async function handleDesbloquear(user) {
    setActionId(user.id);
    try {
      await apiAdmin.desbloquear(user.id);
      addToast(`${user.nomeCompleto} desbloqueado`);
      setDrawer(null); carregar();
    } catch (e) { addToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  async function handleEliminar(user, motivo) {
    setActionId(user.id);
    try {
      await apiAdmin.eliminar(user.id, motivo);
      addToast(`Conta de ${user.nomeCompleto} eliminada`, "warning");
      fecharModal(); setDrawer(null); carregar();
    } catch (e) { addToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  async function handleAprovarKyc(user) {
    setActionId(user.id);
    try {
      await apiAdmin.aprovarKyc(user.id);
      addToast(`KYC de ${user.nomeCompleto} aprovado`);
      fecharModal(); carregar();
    } catch (e) { addToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  async function handleRejeitarKyc(user, motivo) {
    setActionId(user.id);
    try {
      await apiAdmin.rejeitarKyc(user.id, motivo);
      addToast(`KYC de ${user.nomeCompleto} rejeitado`);
      fecharModal(); carregar();
    } catch (e) { addToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  async function handleAjustarSaldo(user, valor, tipo, descricao) {
    setActionId(user.id);
    try {
      await apiAdmin.ajustarSaldo(user.id, valor, tipo, descricao);
      addToast(`Saldo de ${user.nomeCompleto} ajustado (${tipo === "CREDITO" ? "+" : "-"}${fmtMZN(valor)})`);
      fecharModal(); carregar();
    } catch (e) { addToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  async function handleNotificacao(user, titulo, mensagem, tipo) {
    setActionId(user.id);
    try {
      await apiAdmin.enviarNotificacao(user.id, titulo, mensagem, tipo);
      addToast(`Notificação enviada a ${user.nomeCompleto}`);
      fecharModal();
    } catch (e) { addToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  // ── Acções em massa ───────────────────────────────────────────
  async function handleBloquearMassa() {
    for (const id of selected) {
      const u = users.find(x => x.id === id);
      if (u && u.estadoConta !== "BLOQUEADA") await apiAdmin.bloquear(id, "Acção em massa").catch(() => {});
    }
    addToast(`${selected.length} utilizadores bloqueados`);
    setSelected([]); carregar();
  }

  async function handleDesbloquearMassa() {
    for (const id of selected) await apiAdmin.desbloquear(id).catch(() => {});
    addToast(`${selected.length} utilizadores desbloqueados`);
    setSelected([]); carregar();
  }

  function exportarCSV() {
    const cabecalho = ["ID","Nome","Email","Telefone","Estado","Verificação","Score","Saldo","Registado"];
    const linhas = users
      .filter(u => selected.length === 0 || selected.includes(u.id))
      .map(u => [u.id, u.nomeCompleto, u.email, u.telefone||"", u.estadoConta, u.nivelVerificacao, u.scoreConfianca||0, u.carteira?.saldoDisponivel||0, fmtData(u.criadoEm)]);
    const csv = [cabecalho, ...linhas].map(r => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `utilizadores-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    addToast("CSV exportado");
  }

  // ── Modal helpers ─────────────────────────────────────────────
  const abrirModal = (type, user, idx) => setModal({ type, user, idx });
  const abrirDrawer = (user, idx) => setDrawer({ user, idx });

  const filtrosAtivos = Object.values(filtros).some(v => v && v !== "todos");

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 font-sans">

      {/* Modais */}
      {modal?.type === "bloquear" && (
        <ModalBloquear user={modal.user} loading={actionId === modal.user?.id}
          onConfirm={m => handleBloquear(modal.user, m)} onClose={fecharModal} />
      )}
      {modal?.type === "eliminar" && (
        <ModalEliminar user={modal.user} loading={actionId === modal.user?.id}
          onConfirm={m => handleEliminar(modal.user, m)} onClose={fecharModal} />
      )}
      {modal?.type === "kyc" && (
        <ModalKyc user={modal.user} loading={actionId === modal.user?.id}
          onAprovar={() => handleAprovarKyc(modal.user)}
          onRejeitar={m => handleRejeitarKyc(modal.user, m)}
          onClose={fecharModal} />
      )}
      {modal?.type === "saldo" && (
        <ModalAjustarSaldo user={modal.user} loading={actionId === modal.user?.id}
          onConfirm={(v, t, d) => handleAjustarSaldo(modal.user, v, t, d)} onClose={fecharModal} />
      )}
      {modal?.type === "notif" && (
        <ModalNotificacao user={modal.user} loading={actionId === modal.user?.id}
          onConfirm={(ti, me, tp) => handleNotificacao(modal.user, ti, me, tp)} onClose={fecharModal} />
      )}

      {/* Drawer */}
      {drawer && (
        <DrawerPerfil
          user={drawer.user} idx={drawer.idx}
          onClose={() => setDrawer(null)}
          onAbrirKyc={()   => { setDrawer(null); abrirModal("kyc",    drawer.user, drawer.idx); }}
          onAbrirSaldo={()  => { setDrawer(null); abrirModal("saldo",  drawer.user, drawer.idx); }}
          onAbrirNotif={()  => { setDrawer(null); abrirModal("notif",  drawer.user, drawer.idx); }}
          onBloquear={()    => { setDrawer(null); abrirModal("bloquear",drawer.user, drawer.idx); }}
          onDesbloquear={() => handleDesbloquear(drawer.user)}
          onEliminar={()    => { setDrawer(null); abrirModal("eliminar",drawer.user, drawer.idx); }}
        />
      )}

      <Toast items={toasts} remove={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Gestão de Utilizadores</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {total > 0 ? `${total.toLocaleString("pt-MZ")} utilizadores registados` : "Ver, filtrar e gerir todos os utilizadores"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn label="Exportar CSV" icon="⬇" variant="secondary" size="sm" onClick={exportarCSV} />
          <Btn label="Atualizar" icon="↻" variant="secondary" size="sm" onClick={carregar} loading={loading} />
        </div>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">

        {/* Filtros */}
        <div className="p-4 border-b border-zinc-100">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Pesquisa */}
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔍</span>
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="Pesquisar por nome, email ou telefone..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all" />
            </div>
            {/* Estado */}
            <select value={estado} onChange={e => { setEstado(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 text-zinc-700">
              <option value="todos">Todos os estados</option>
              <option value="ativo">Ativo</option>
              <option value="bloqueado">Bloqueado</option>
              <option value="pendente">Pendente</option>
            </select>
            {/* Filtros avançados toggle */}
            <button onClick={() => setShowFiltros(s => !s)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition-all font-medium ${showFiltros || filtrosAtivos ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}>
              ⚙ Filtros {filtrosAtivos && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
            <Btn label="Limpar" icon="↺" variant="ghost" size="md" onClick={limparTudo} />
          </div>

          {/* Filtros avançados */}
          <div className={`overflow-hidden transition-all duration-200 ${showFiltros ? "mt-3 max-h-96" : "max-h-0"}`}>
            <PainelFiltros filtros={filtros} setFiltros={setFiltros} onLimpar={limparFiltrosAvancados} show={showFiltros} />
          </div>
        </div>

        {/* Barra de selecção em massa */}
        {selected.length > 0 && (
          <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-blue-700">{selected.length} selecionado(s)</span>
            <Btn label="Bloquear todos"   icon="🚫" variant="warning"   size="sm" onClick={handleBloquearMassa} />
            <Btn label="Desbloquear todos" icon="✓" variant="success"   size="sm" onClick={handleDesbloquearMassa} />
            <Btn label="Exportar seleção" icon="⬇" variant="secondary" size="sm" onClick={exportarCSV} />
            <button onClick={() => setSelected([])} className="text-xs text-blue-500 hover:text-blue-700 ml-auto">Limpar selecção</button>
          </div>
        )}

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSel} onChange={toggleAll}
                    className="w-4 h-4 accent-zinc-900 cursor-pointer rounded" />
                </th>
                {["Utilizador","Verificação","Score","Registado","Último login","Saldo","Estado","Acções"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">

              {/* Loading */}
              {loading && users.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="w-7 h-7 border-3 border-zinc-200 border-t-zinc-700 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-zinc-400">A carregar utilizadores...</p>
                  </td>
                </tr>
              )}

              {/* Vazio */}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <p className="text-zinc-400 text-sm">Nenhum utilizador encontrado.</p>
                    <button onClick={limparTudo} className="mt-2 text-xs text-zinc-500 hover:text-zinc-700 underline">Limpar filtros</button>
                  </td>
                </tr>
              )}

              {/* Linhas */}
              {users.map((u, i) => {
                const estado_ = ESTADO_MAP[u.estadoConta] || { label: u.estadoConta, cls: "bg-zinc-100 text-zinc-500" };
                const kyc_    = KYC_MAP[u.nivelVerificacao] || { label: u.nivelVerificacao, cls: "bg-zinc-100 text-zinc-500" };
                const bloq    = u.estadoConta === "BLOQUEADA";
                const emAcao  = actionId === u.id;
                const saldo   = Number(u.carteira?.saldoDisponivel || 0);
                const score   = u.scoreConfianca || 0;
                const isSel   = selected.includes(u.id);

                return (
                  <tr key={u.id}
                    className={`hover:bg-zinc-50 transition-colors cursor-pointer ${bloq ? "opacity-60" : ""} ${isSel ? "bg-blue-50/60" : ""}`}
                    onClick={() => abrirDrawer(u, i)}>
                    <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleOne(u.id); }}>
                      <input type="checkbox" checked={isSel} onChange={() => toggleOne(u.id)}
                        className="w-4 h-4 accent-zinc-900 cursor-pointer rounded" />
                    </td>

                    {/* Utilizador */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.nomeCompleto} idx={i} />
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-900 text-sm truncate max-w-[160px]">{u.nomeCompleto}</div>
                          <div className="text-xs text-zinc-400 truncate max-w-[160px]">{u.email}</div>
                          {u.telefone && <div className="text-[10px] text-zinc-400 font-mono">{u.telefone}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Verificação */}
                    <td className="px-4 py-3"><Badge label={kyc_.label} cls={kyc_.cls} /></td>

                    {/* Score */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-zinc-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${score>=70?"bg-emerald-500":score>=40?"bg-amber-500":"bg-red-500"}`} style={{ width: `${score}%` }} />
                        </div>
                        <span className={`text-xs ${scoreClass(score)}`}>{score}</span>
                      </div>
                    </td>

                    {/* Datas */}
                    <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">{fmtData(u.criadoEm)}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {u.ultimoLogin ? <span className="text-zinc-500">{fmtData(u.ultimoLogin)}</span> : <span className="text-zinc-300">Nunca</span>}
                    </td>

                    {/* Saldo */}
                    <td className="px-4 py-3 font-mono text-xs">
                      {saldo > 0
                        ? <span className="text-emerald-600 font-semibold">{fmtMZN(saldo)}</span>
                        : <span className="text-zinc-300">0 MZN</span>}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3"><Badge label={estado_.label} cls={estado_.cls} /></td>

                    {/* Acções */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button title="Ver perfil" onClick={() => abrirDrawer(u, i)}
                          className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors text-xs">👤</button>
                        <button title="Gerir KYC" onClick={() => abrirModal("kyc", u, i)}
                          className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-zinc-400 hover:text-blue-600 transition-colors text-xs">🛡</button>
                        <button title="Ajustar saldo" onClick={() => abrirModal("saldo", u, i)}
                          className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-zinc-400 hover:text-amber-600 transition-colors text-xs">💰</button>
                        {bloq
                          ? <button title="Desbloquear" onClick={() => handleDesbloquear(u)} disabled={emAcao}
                              className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-zinc-400 hover:text-emerald-600 transition-colors text-xs disabled:opacity-40">
                              {emAcao ? <span className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" /> : "✓"}
                            </button>
                          : <button title="Bloquear" onClick={() => abrirModal("bloquear", u, i)}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-600 transition-colors text-xs">🚫</button>
                        }
                        <button title="Eliminar conta" onClick={() => abrirModal("eliminar", u, i)}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-zinc-300 hover:text-red-500 transition-colors text-xs">🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé: contagem + paginação */}
        <div className="px-4 pb-4">
          <Paginacao page={page} total={total} onChange={p => { setPage(p); setSelected([]); }} />
          {!loading && users.length > 0 && (
            <p className="text-xs text-zinc-400 mt-2 text-right">
              A mostrar {users.length} de {total.toLocaleString("pt-MZ")} utilizadores
            </p>
          )}
        </div>

      </div>
    </div>
  );
}