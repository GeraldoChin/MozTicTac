import { useState, useEffect, useCallback } from "react";
import {
  Wallet, AlertTriangle, BarChart2, Plus, ArrowUp, Send,
  FileText, ArrowDown, RefreshCw, X, Eye, EyeOff, CheckCircle,
  Smartphone, CreditCard, AlertCircle, ChevronRight, Clock,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

const VERDE = "#16a34a";

// Números da plataforma para depósitos (define VITE_CONTA_MPESA, etc. no .env do frontend)
const CONTA_MPESA = import.meta.env?.VITE_CONTA_MPESA || "Contacta o suporte";
const CONTA_EMOLA = import.meta.env?.VITE_CONTA_EMOLA || "Contacta o suporte";
const CONTA_MKESH = import.meta.env?.VITE_CONTA_MKESH || "Contacta o suporte";
// Valor mínimo de levantamento — espelha VALOR_MINIMO_SAQUE=500 do backend
const VALOR_MINIMO_SAQUE = Number(import.meta.env?.VITE_VALOR_MINIMO_SAQUE) || 500;

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

// ─── Formatadores ─────────────────────────────────────────────────────────────
function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 });
}

function formatarData(dataStr) {
  if (!dataStr) return "—";
  const d = new Date(dataStr);
  const agora = new Date();
  const diff = agora - d;
  const mins = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (mins < 1)   return "Agora";
  if (mins < 60)  return `Há ${mins}min`;
  if (horas < 24) return `Hoje ${d.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}`;
  if (dias === 1) return "Ontem";
  return d.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short" });
}

const LABELS_TIPO = {
  DEPOSITO: "Depósito", COMPRA: "Compra efectuada", VENDA: "Venda confirmada",
  SAQUE: "Levantamento", COMISSAO_AFILIADO: "Comissão afiliado",
  TAXA_PLATAFORMA: "Taxa plataforma", REEMBOLSO: "Reembolso",
  TRANSFERENCIA: "Transferência", AJUSTE_ADMIN: "Ajuste administrativo", ESTORNO: "Estorno",
};

const TIPOS_ENTRADA = new Set(["DEPOSITO","VENDA","COMISSAO_AFILIADO","REEMBOLSO","ESTORNO","AJUSTE_ADMIN"]);
const ehEntrada = (tipo) => TIPOS_ENTRADA.has(tipo?.toUpperCase?.());

// ─── Utilitários de UI ────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-100 rounded ${className}`} />;
}

function Spinner({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
  );
}

function BotaoMetodo({ id, label, sub, icone: Icone, cor, selecionado, onClick }) {
  return (
    <button onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer bg-white
        ${selecionado ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold"
        style={{ background: cor }}>{Icone ? <Icone size={16} /> : label[0]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      {selecionado && <CheckCircle size={16} className="text-green-500 shrink-0" />}
    </button>
  );
}

// ─── Modal base ───────────────────────────────────────────────────────────────
function Modal({ titulo, onFechar, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onFechar}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <p className="font-semibold text-gray-900">{titulo}</p>
          <button onClick={onFechar}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 border-0 bg-transparent cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function MensagemErro({ texto }) {
  if (!texto) return null;
  return (
    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
      <AlertCircle size={14} className="shrink-0 mt-0.5" />
      {texto}
    </div>
  );
}

function MensagemSucesso({ texto }) {
  if (!texto) return null;
  return (
    <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
      <CheckCircle size={14} className="shrink-0 mt-0.5" />
      {texto}
    </div>
  );
}

// ─── MODAL: LEVANTAR ──────────────────────────────────────────────────────────
// Fluxo: valor + método + destinatário → pedir OTP → confirmar saque
function ModalLevantar({ saldoDisponivel, onFechar, onSucesso }) {
  const [etapa, setEtapa] = useState(1); // 1=dados, 2=otp, 3=sucesso
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState("MPESA");
  const [destinatario, setDestinatario] = useState("");
  const [otp, setOtp] = useState("");
  const [a, setA] = useState(false); // a aguardar
  const [erro, setErro] = useState("");
  const [otpEnviado, setOtpEnviado] = useState(false);

  const METODOS = [
    { id: "MPESA",   label: "M-Pesa",   sub: "Carteira móvel Vodacom",  cor: "#e11d48" },
    { id: "EMOLA",   label: "E-Mola",   sub: "Carteira móvel Emtel",    cor: "#f59e0b" },
    { id: "MKESH",   label: "mKesh",    sub: "Carteira móvel MCel",     cor: "#2563eb" },
  ];

  const valorNum = parseFloat(valor) || 0;
  const MIN = VALOR_MINIMO_SAQUE;

  async function pedirOtp() {
    setErro("");
    if (valorNum < MIN) { setErro(`Valor mínimo de levantamento: ${MIN} MZN`); return; }
    if (valorNum > saldoDisponivel) { setErro("Saldo insuficiente."); return; }
    if (!destinatario.trim()) { setErro("Indica o número de destino."); return; }
    setA(true);
    try {
      await requisitar("/carteira/saque/otp", { method: "POST" });
      setOtpEnviado(true);
      setEtapa(2);
    } catch (e) { setErro(e.message); }
    finally { setA(false); }
  }

  async function confirmarSaque() {
    setErro("");
    if (otp.trim().length < 4) { setErro("Introduz o código OTP recebido."); return; }
    setA(true);
    try {
      await requisitar("/carteira/saque", {
        method: "POST",
        body: JSON.stringify({
          valor: valorNum,
          metodoPagamento: metodo,
          destinatario: destinatario.trim(),
          codigoOtp: otp.trim(),
        }),
      });
      setEtapa(3);
      onSucesso?.();
    } catch (e) { setErro(e.message); }
    finally { setA(false); }
  }

  if (etapa === 3) return (
    <Modal titulo="Levantamento solicitado" onFechar={onFechar}>
      <div className="text-center py-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">Pedido enviado!</p>
          <p className="text-sm text-gray-500 mt-1">
            O teu levantamento de <strong>{formatarMoeda(valorNum)} MZN</strong> está em análise.<br/>
            Receberás uma notificação quando for processado.
          </p>
        </div>
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
          <Clock size={13} className="shrink-0" />
          Processamento em até 24h úteis
        </div>
        <button onClick={onFechar}
          className="w-full py-2.5 rounded-xl text-sm font-semibold border-0 bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors">
          Fechar
        </button>
      </div>
    </Modal>
  );

  return (
    <Modal titulo="Solicitar Levantamento" onFechar={onFechar}>
      <div className="space-y-4">
        {/* Saldo disponível */}
        <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
          <span className="text-xs text-gray-500">Saldo disponível</span>
          <span className="text-sm font-bold text-green-600">{formatarMoeda(saldoDisponivel)} MZN</span>
        </div>

        {etapa === 1 && (
          <>
            {/* Valor */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Valor a levantar (MZN)</label>
              <div className="relative">
                <input type="number" min={MIN} max={saldoDisponivel} value={valor}
                  onChange={e => setValor(e.target.value)} placeholder={`Mínimo ${MIN} MZN`}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 pr-16" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MZN</span>
              </div>
              {valorNum > 0 && valorNum < MIN && (
                <p className="text-xs text-red-500 mt-1">Mínimo {MIN} MZN</p>
              )}
            </div>

            {/* Método */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-2">Método de levantamento</label>
              <div className="space-y-2">
                {METODOS.map(m => (
                  <BotaoMetodo key={m.id} {...m} selecionado={metodo === m.id} onClick={setMetodo} />
                ))}
              </div>
            </div>

            {/* Número */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Número {metodo === "MPESA" ? "M-Pesa" : metodo === "EMOLA" ? "E-Mola" : "mKesh"}
              </label>
              <input type="tel" value={destinatario} onChange={e => setDestinatario(e.target.value)}
                placeholder="8x xxx xxxx"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
            </div>

            <MensagemErro texto={erro} />

            {/* Resumo */}
            {valorNum >= MIN && (
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Valor solicitado</span>
                  <span className="font-semibold text-gray-800">{formatarMoeda(valorNum)} MZN</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa estimada</span>
                  <span className="text-gray-400">Calculada pelo banco</span>
                </div>
              </div>
            )}

            <button onClick={pedirOtp} disabled={a}
              className={`w-full py-3 rounded-xl text-sm font-semibold border-0 transition-colors flex items-center justify-center gap-2
                ${a ? "bg-gray-200 text-gray-400 cursor-default" : "bg-green-600 text-white cursor-pointer hover:bg-green-700"}`}>
              {a ? <><Spinner /> A processar...</> : "Continuar"}
            </button>
          </>
        )}

        {etapa === 2 && (
          <>
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <Smartphone size={22} className="text-blue-600" />
              </div>
              <p className="text-sm text-gray-700 font-medium">Código enviado para o teu email</p>
              <p className="text-xs text-gray-400 mt-1">Introduz o código de 6 dígitos para confirmar o levantamento</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Código OTP</label>
              <input type="text" inputMode="numeric" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-green-500" />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 space-y-1">
              <p className="font-semibold">Resumo do levantamento</p>
              <div className="flex justify-between"><span>Valor</span><span className="font-semibold">{formatarMoeda(valorNum)} MZN</span></div>
              <div className="flex justify-between"><span>Método</span><span>{metodo}</span></div>
              <div className="flex justify-between"><span>Destino</span><span>{destinatario}</span></div>
            </div>

            <MensagemErro texto={erro} />

            <div className="flex gap-2">
              <button onClick={() => { setEtapa(1); setErro(""); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                Voltar
              </button>
              <button onClick={confirmarSaque} disabled={a || otp.length < 4}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border-0 transition-colors flex items-center justify-center gap-2
                  ${a || otp.length < 4 ? "bg-gray-200 text-gray-400 cursor-default" : "bg-green-600 text-white cursor-pointer hover:bg-green-700"}`}>
                {a ? <><Spinner /> A confirmar...</> : "Confirmar"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── MODAL: DEPOSITAR ─────────────────────────────────────────────────────────
// O backend (pagamentoServico) inicia pagamentos via M-Pesa/eMôla/mKesh/Visa
// Para depósito directo na carteira, o fluxo mais comum é referência manual
// ou STK push — mostramos instruções claras ao utilizador
function ModalDepositar({ onFechar }) {
  const [metodo, setMetodo] = useState("MPESA");
  const [valor, setValor] = useState("");
  const [etapa, setEtapa] = useState(1); // 1=form, 2=instrucoes
  const [erro, setErro] = useState("");

  const MIN = 10;

  const METODOS = [
    { id: "MPESA", label: "M-Pesa",  sub: "Vodacom",  cor: "#e11d48", numero: CONTA_MPESA  },
    { id: "EMOLA", label: "E-Mola",  sub: "Emtel",    cor: "#f59e0b", numero: CONTA_EMOLA  },
    { id: "MKESH", label: "mKesh",   sub: "MCel",     cor: "#2563eb", numero: CONTA_MKESH  },
    { id: "BANCO", label: "Banco",   sub: "Referência bancária", cor: "#6b7280", numero: null },
  ];

  const metodoInfo = METODOS.find(m => m.id === metodo);
  const valorNum   = parseFloat(valor) || 0;
  const referencia = `DEP-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  function continuar() {
    setErro("");
    if (valorNum < MIN) { setErro(`Valor mínimo: ${MIN} MZN`); return; }
    setEtapa(2);
  }

  if (etapa === 2) return (
    <Modal titulo="Instruções de Depósito" onFechar={onFechar}>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
            {metodo === "BANCO" ? "Transferência Bancária" : `Enviar via ${metodoInfo?.label}`}
          </p>

          {metodo !== "BANCO" ? (
            <div className="space-y-2 text-sm text-blue-900">
              <div className="flex justify-between items-center bg-white rounded-lg p-2.5">
                <span className="text-xs text-gray-500">Número destino</span>
                <span className="font-mono font-bold">{metodoInfo?.numero}</span>
              </div>
              <div className="flex justify-between items-center bg-white rounded-lg p-2.5">
                <span className="text-xs text-gray-500">Valor exacto</span>
                <span className="font-bold text-green-600">{formatarMoeda(valorNum)} MZN</span>
              </div>
              <div className="flex justify-between items-center bg-white rounded-lg p-2.5">
                <span className="text-xs text-gray-500">Referência</span>
                <span className="font-mono text-xs font-bold">{referencia}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-blue-900">
              <p className="text-xs text-gray-600">Transfere para a conta abaixo e envia o comprovativo para o suporte.</p>
              <div className="bg-white rounded-lg p-2.5 space-y-1">
                <div className="flex justify-between"><span className="text-xs text-gray-500">Banco</span><span className="font-semibold text-xs">Millennium BIM</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">NIB</span><span className="font-mono text-xs font-bold">0000 0000 0000 0000 000 00</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Referência</span><span className="font-mono text-xs font-bold">{referencia}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 space-y-1">
          <p className="font-semibold flex items-center gap-1"><AlertCircle size={12}/> Importante</p>
          <p>Usa sempre a referência <strong>{referencia}</strong> para que o depósito seja associado à tua conta automaticamente.</p>
          <p className="mt-1">O saldo é creditado em até 30 minutos após a confirmação.</p>
        </div>

        <button onClick={onFechar}
          className="w-full py-3 rounded-xl text-sm font-semibold border-0 bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors">
          Já enviei o pagamento
        </button>
      </div>
    </Modal>
  );

  return (
    <Modal titulo="Depositar Fundos" onFechar={onFechar}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Valor a depositar (MZN)</label>
          <div className="relative">
            <input type="number" min={MIN} value={valor} onChange={e => setValor(e.target.value)}
              placeholder={`Mínimo ${MIN} MZN`}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 pr-16" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MZN</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-2">Método de pagamento</label>
          <div className="space-y-2">
            {METODOS.map(m => (
              <BotaoMetodo key={m.id} {...m} selecionado={metodo === m.id} onClick={setMetodo} />
            ))}
          </div>
        </div>

        <MensagemErro texto={erro} />

        <button onClick={continuar}
          className="w-full py-3 rounded-xl text-sm font-semibold border-0 bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
          Ver instruções <ChevronRight size={14} />
        </button>
      </div>
    </Modal>
  );
}

// ─── MODAL: ENVIAR ────────────────────────────────────────────────────────────
// Transferência interna entre carteiras da plataforma
function ModalEnviar({ saldoDisponivel, onFechar, onSucesso }) {
  const [valor, setValor]         = useState("");
  const [email, setEmail]         = useState("");
  const [descricao, setDescricao] = useState("");
  const [a, setA]                 = useState(false);
  const [erro, setErro]           = useState("");
  const [sucesso, setSucesso]     = useState("");

  const valorNum = parseFloat(valor) || 0;

  async function enviar() {
    setErro(""); setSucesso("");
    if (valorNum <= 0)          { setErro("Indica um valor válido."); return; }
    if (valorNum > saldoDisponivel) { setErro("Saldo insuficiente."); return; }
    if (!email.trim())          { setErro("Indica o email do destinatário."); return; }
    setA(true);
    try {
      await requisitar("/carteira/transferencia", {
        method: "POST",
        body: JSON.stringify({ valor: valorNum, emailDestinatario: email.trim(), descricao }),
      });
      setSucesso(`${formatarMoeda(valorNum)} MZN enviados com sucesso.`);
      onSucesso?.();
    } catch (e) { setErro(e.message); }
    finally { setA(false); }
  }

  return (
    <Modal titulo="Enviar Fundos" onFechar={onFechar}>
      <div className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
          <span className="text-xs text-gray-500">Saldo disponível</span>
          <span className="text-sm font-bold text-green-600">{formatarMoeda(saldoDisponivel)} MZN</span>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Valor (MZN)</label>
          <div className="relative">
            <input type="number" min={1} value={valor} onChange={e => setValor(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 pr-16" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MZN</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Email do destinatário</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="utilizador@exemplo.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Descrição (opcional)</label>
          <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)}
            placeholder="Ex: Pagamento de serviço"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
        </div>

        <MensagemErro texto={erro} />
        <MensagemSucesso texto={sucesso} />

        {!sucesso && (
          <button onClick={enviar} disabled={a}
            className={`w-full py-3 rounded-xl text-sm font-semibold border-0 transition-colors flex items-center justify-center gap-2
              ${a ? "bg-gray-200 text-gray-400 cursor-default" : "bg-green-600 text-white cursor-pointer hover:bg-green-700"}`}>
            {a ? <><Spinner /> A enviar...</> : "Enviar Fundos"}
          </button>
        )}
        {sucesso && (
          <button onClick={onFechar}
            className="w-full py-3 rounded-xl text-sm font-semibold border-0 bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors">
            Fechar
          </button>
        )}
      </div>
    </Modal>
  );
}

// ─── MODAL: RELATÓRIO ─────────────────────────────────────────────────────────
function ModalRelatorio({ onFechar }) {
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().slice(0, 10));
  const [tipo, setTipo]       = useState("");
  const [a, setA]             = useState(false);
  const [erro, setErro]       = useState("");

  async function exportar() {
    setErro(""); setA(true);
    try {
      const params = new URLSearchParams({ dataInicio, dataFim, ...(tipo && { tipo }) });
      // Abre o endpoint de exportação numa nova aba (o backend devolve CSV ou PDF)
      const token = localStorage.getItem("token");
      const url   = `${BASE_URL}/carteira/relatorio?${params}`;
      const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.mensagem || "Erro ao gerar relatório"); }
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = href;
      a.download = `relatorio-carteira-${dataInicio}-${dataFim}.csv`;
      a.click();
      URL.revokeObjectURL(href);
      onFechar();
    } catch (e) { setErro(e.message); }
    finally { setA(false); }
  }

  return (
    <Modal titulo="Relatório de Transacções" onFechar={onFechar}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Data início</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Data fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Tipo de transacção</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white">
            <option value="">Todas</option>
            <option value="DEPOSITO">Depósitos</option>
            <option value="SAQUE">Levantamentos</option>
            <option value="VENDA">Vendas</option>
            <option value="COMPRA">Compras</option>
            <option value="COMISSAO_AFILIADO">Comissões Afiliado</option>
            <option value="REEMBOLSO">Reembolsos</option>
          </select>
        </div>

        <MensagemErro texto={erro} />

        <button onClick={exportar} disabled={a}
          className={`w-full py-3 rounded-xl text-sm font-semibold border-0 transition-colors flex items-center justify-center gap-2
            ${a ? "bg-gray-200 text-gray-400 cursor-default" : "bg-green-600 text-white cursor-pointer hover:bg-green-700"}`}>
          {a ? <><Spinner /> A gerar...</> : "Exportar CSV"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          O ficheiro CSV pode ser aberto no Excel ou Google Sheets
        </p>
      </div>
    </Modal>
  );
}

// ─── Filtros de transacções ───────────────────────────────────────────────────
const FILTROS = [
  { valor: "",                  label: "Todas"        },
  { valor: "DEPOSITO",          label: "Depósitos"    },
  { valor: "SAQUE",             label: "Levantamentos"},
  { valor: "VENDA",             label: "Vendas"       },
  { valor: "COMPRA",            label: "Compras"      },
  { valor: "COMISSAO_AFILIADO", label: "Comissões"    },
];

// ─── Item de transacção ───────────────────────────────────────────────────────
function ItemTransacao({ t }) {
  const entrada = ehEntrada(t.tipo);
  const label   = LABELS_TIPO[t.tipo?.toUpperCase?.()] || t.tipo || "Transacção";
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: entrada ? "#e6f9f0" : "#fef2f2" }}>
          {entrada ? <ArrowDown size={16} style={{ color: VERDE }} /> : <ArrowUp size={16} color="#ef4444" />}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{t.descricao || label}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-gray-400">{formatarData(t.criadoEm || t.data)}</p>
            {t.estado && t.estado !== "CONCLUIDA" && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                ${t.estado === "PENDENTE" ? "bg-amber-100 text-amber-700"
                : t.estado === "FALHADA"  ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"}`}>
                {t.estado}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm font-bold shrink-0" style={{ color: entrada ? VERDE : "#ef4444" }}>
        {entrada ? "+" : "-"}{formatarMoeda(Math.abs(t.valor))} MZN
      </p>
    </div>
  );
}

function CardSaldo({ label, valor, cor, Icone, carregando }) {
  return (
    <div className="rounded-xl p-4 border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icone size={16} style={{ color: cor }} />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      {carregando
        ? <Skeleton className="h-8 w-32 mt-1" />
        : <p className="text-2xl font-black" style={{ color: cor }}>
            {formatarMoeda(valor)}<span className="text-sm font-normal text-gray-400 ml-1">MZN</span>
          </p>}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function SecaoCarteira() {
  const [saldo,           setSaldo]           = useState(null);
  const [transacoes,      setTransacoes]      = useState([]);
  const [totalTrans,      setTotalTrans]      = useState(0);
  const [pagina,          setPagina]          = useState(1);
  const [filtroTipo,      setFiltroTipo]      = useState("");
  const [carregandoSaldo, setCarregandoSaldo] = useState(true);
  const [carregandoTrans, setCarregandoTrans] = useState(true);
  const [erroSaldo,       setErroSaldo]       = useState(null);
  const [erroTrans,       setErroTrans]       = useState(null);
  const [modal,           setModal]           = useState(null); // "Depositar"|"Levantar"|"Enviar"|"Relatório"

  const carregarSaldo = useCallback(async () => {
    setCarregandoSaldo(true); setErroSaldo(null);
    try {
      const res = await requisitar("/carteira/saldo");
      const d   = res.dados ?? res.data ?? res;
      setSaldo({
        saldoDisponivel:     Number(d.saldoDisponivel     || 0),
        saldoPendente:       Number(d.saldoPendente       || 0),
        saldoTotal:          Number(d.saldoDisponivel || 0) + Number(d.saldoPendente || 0),
        totalGanhoVendas:    Number(d.totalGanhoVendas    || 0),
        totalGanhoAfiliados: Number(d.totalGanhoAfiliados || 0),
        totalDepositado:     Number(d.totalDepositado     || 0),
        totalLevantado:      Number(d.totalLevantado      || 0),
      });
    } catch (e) { setErroSaldo(e.message); }
    finally { setCarregandoSaldo(false); }
  }, []);

  const carregarTransacoes = useCallback(async (pg = 1, tipo = "") => {
    setCarregandoTrans(true); setErroTrans(null);
    try {
      const params = new URLSearchParams({ pagina: pg, itensPorPagina: 10 });
      if (tipo) params.set("tipo", tipo);
      const res = await requisitar(`/carteira/historico?${params}`);
      const d   = res.dados ?? res.data ?? {};
      const lista = d.transacoes ?? d.registos ?? d.items ?? [];
      setTransacoes(lista);
      setTotalTrans(d.total ?? lista.length);
    } catch (e) { setErroTrans(e.message); }
    finally { setCarregandoTrans(false); }
  }, []);

  useEffect(() => { carregarSaldo(); }, [carregarSaldo]);
  useEffect(() => { carregarTransacoes(pagina, filtroTipo); }, [carregarTransacoes, pagina, filtroTipo]);

  const totalPaginas = Math.ceil(totalTrans / 10);

  function aposAcao() {
    // Recarregar saldo e transacções após qualquer operação
    carregarSaldo();
    carregarTransacoes(1, filtroTipo);
    setPagina(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Carteira Digital</h2>
        <button onClick={() => { carregarSaldo(); carregarTransacoes(pagina, filtroTipo); }}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 border-0 bg-transparent cursor-pointer transition-colors">
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* Saldos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CardSaldo label="Saldo Disponível" valor={saldo?.saldoDisponivel} cor={VERDE}   Icone={Wallet}        carregando={carregandoSaldo} />
        <CardSaldo label="Saldo Pendente"   valor={saldo?.saldoPendente}   cor="#f59e0b" Icone={AlertTriangle} carregando={carregandoSaldo} />
        <CardSaldo label="Saldo Total"      valor={saldo?.saldoTotal}      cor="#3b82f6" Icone={BarChart2}     carregando={carregandoSaldo} />
      </div>

      {erroSaldo && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          Erro ao carregar saldo: {erroSaldo}
        </div>
      )}

      {/* Acções */}
      <div className="flex flex-wrap gap-3">
        {[
          { Icone: Plus,     texto: "Depositar" },
          { Icone: ArrowUp,  texto: "Levantar"  },
          { Icone: Send,     texto: "Enviar"    },
          { Icone: FileText, texto: "Relatório" },
        ].map(({ Icone, texto }) => (
          <button key={texto} onClick={() => setModal(texto)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-green-500 hover:text-green-600 transition-colors cursor-pointer">
            <Icone size={14} style={{ color: VERDE }} />
            {texto}
          </button>
        ))}
      </div>

      {/* Resumo */}
      {carregandoSaldo
        ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}</div>
        : saldo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Ganho Vendas",    valor: saldo.totalGanhoVendas    },
              { label: "Ganho Afiliados", valor: saldo.totalGanhoAfiliados },
              { label: "Depositado",      valor: saldo.totalDepositado     },
              { label: "Levantado",       valor: saldo.totalLevantado      },
            ].map(({ label, valor }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-base font-bold text-gray-800">
                  {formatarMoeda(valor)}<span className="text-xs font-normal text-gray-400 ml-1">MZN</span>
                </p>
              </div>
            ))}
          </div>
        )}

      {/* Transacções */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-700">Transacções Recentes</h3>
          <span className="text-xs text-gray-400">{totalTrans} no total</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          {FILTROS.map(f => (
            <button key={f.valor} onClick={() => { setFiltroTipo(f.valor); setPagina(1); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer transition-colors
                ${filtroTipo === f.valor ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {carregandoTrans
          ? <div className="space-y-2">{[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-2/5" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-20" />
              </div>
            ))}</div>
          : erroTrans
          ? <div className="p-4 text-center text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">{erroTrans}</div>
          : transacoes.length === 0
          ? <div className="p-8 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">Nenhuma transacção encontrada.</div>
          : <div className="space-y-2">{transacoes.map(t => <ItemTransacao key={t.id} t={t} />)}</div>
        }

        {totalPaginas > 1 && !carregandoTrans && !erroTrans && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-0 transition-colors
                ${pagina === 1 ? "bg-gray-100 text-gray-300 cursor-default" : "bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200"}`}>
              ← Anterior
            </button>
            <span className="text-xs text-gray-500">{pagina} / {totalPaginas}</span>
            <button disabled={pagina >= totalPaginas} onClick={() => setPagina(p => p + 1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-0 transition-colors
                ${pagina >= totalPaginas ? "bg-gray-100 text-gray-300 cursor-default" : "bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200"}`}>
              Seguinte →
            </button>
          </div>
        )}
      </div>

      {/* Modais */}
      {modal === "Depositar" && <ModalDepositar onFechar={() => setModal(null)} />}
      {modal === "Levantar"  && <ModalLevantar  saldoDisponivel={saldo?.saldoDisponivel || 0} onFechar={() => setModal(null)} onSucesso={aposAcao} />}
      {modal === "Enviar"    && <ModalEnviar    saldoDisponivel={saldo?.saldoDisponivel || 0} onFechar={() => setModal(null)} onSucesso={aposAcao} />}
      {modal === "Relatório" && <ModalRelatorio onFechar={() => setModal(null)} />}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default SecaoCarteira;