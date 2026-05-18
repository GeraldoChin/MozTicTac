// ─────────────────────────────────────────────────────────────────
// MOZTICTAC — ModalPromocao (drop-in replacement)
// Substitui o ModalPromocao inline de SecaoVendas.jsx
//
// MUDANÇA PRINCIPAL: quando o pagamento é confirmado (etapa 3),
// chama useAnunciosDestaque.promoverProduto() → o produto aparece
// IMEDIATAMENTE no TopTendencias sem precisar de recarregar a página.
//
// USO em SecaoVendas.jsx:
//   import ModalPromocao from "./ModalPromocao";
//   // substituir <ModalPromocao produto={...} onClose={...} onSucesso={...} />
//
// Props:
//   produto       — objecto do produto (mapearProduto)
//   onClose()     — fechar modal
//   onSucesso(p)  — callback após confirmação
// ─────────────────────────────────────────────────────────────────
import { useState } from "react";
import { useAnunciosDestaque } from "./useAnunciosDestaque";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const res   = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opcoes.headers ?? {}),
    },
  });
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.mensagem ?? dados.message ?? `Erro ${res.status}`);
  return dados;
}

export const PROMO_PLANOS = [
  {
    id:          "basico",
    nome:        "Básico",
    duracao:     "3 dias",
    duracaoDias: 3,
    preco:       250,
    desc:        "Destaque no feed geral",
    beneficios:  ["Posição destacada no feed", "Badge 'Em destaque'"],
  },
  {
    id:          "standard",
    nome:        "Standard",
    duracao:     "7 dias",
    duracaoDias: 7,
    preco:       500,
    desc:        "Destaque + notificações push",
    popular:     true,
    beneficios:  ["Tudo do Básico", "Notificações para utilizadores", "Destaque na categoria"],
  },
  {
    id:          "premium",
    nome:        "Premium",
    duracao:     "30 dias",
    duracaoDias: 30,
    preco:       1500,
    desc:        "Topo do feed + banner",
    beneficios:  ["Tudo do Standard", "Banner na homepage", "Relatório de desempenho", "Suporte prioritário"],
  },
];

const METODOS = ["MPESA", "EMOLA", "MKESH", "SALDO_INTERNO"];

// ── Ícones mínimos ────────────────────────────────────────────────
const IcoX     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoCheck = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoCred  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IcoPhone = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 9.81 19.79 19.79 0 01.01 1.18a2 2 0 011.95-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 6.83a16 16 0 006.29 6.29l.83-1.29a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.04z"/></svg>;

export default function ModalPromocao({ produto, onClose, onSucesso }) {
  const { promoverProduto } = useAnunciosDestaque();

  const [etapa,    setEtapa]    = useState(1);
  const [planoId,  setPlanoId]  = useState(null);
  const [metodo,   setMetodo]   = useState("MPESA");
  const [numero,   setNumero]   = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroMsg,  setErroMsg]  = useState("");

  const plano = PROMO_PLANOS.find(p => p.id === planoId);

  async function handlePagar() {
    if (!numero.trim() && metodo !== "SALDO_INTERNO") {
      setErroMsg("Introduz o número de telefone ou conta.");
      return;
    }
    setErroMsg("");
    setEnviando(true);
    try {
      // POST /promocoes/contratar → publicoControlador / endpoint a criar no backend
      await requisitar("/promocoes/contratar", {
        method: "POST",
        body: JSON.stringify({
          produtoId:        produto.id,
          planoId,
          metodoPagamento:  metodo,
          ...(numero ? { numeroCelular: numero } : {}),
        }),
      });

      // ── PONTO DE LIGAÇÃO ──────────────────────────────────────
      // Produto aparece IMEDIATAMENTE no TopTendencias (carrossel)
      promoverProduto(produto, plano);
      // ─────────────────────────────────────────────────────────

      setEtapa(3);
    } catch (e) {
      setErroMsg(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-screen overflow-y-auto">
        <div className="p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Promover anúncio</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{produto.nome}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-1">
              <IcoX />
            </button>
          </div>

          {/* Nota explicativa */}
          {etapa < 3 && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4 text-xs text-green-800">
              <span className="text-lg leading-none">⚡</span>
              <span>Após o pagamento, o produto aparece <strong>imediatamente</strong> no <em>Top Tendências</em> da página inicial.</span>
            </div>
          )}

          {/* Progresso */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${etapa >= s ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {etapa > s ? <IcoCheck /> : s}
                </div>
                <span className={`text-xs ${etapa >= s ? "text-gray-700" : "text-gray-400"}`}>
                  {s === 1 ? "Plano" : s === 2 ? "Pagamento" : "Confirmado"}
                </span>
                {s < 3 && <div className={`flex-1 h-px ${etapa > s ? "bg-green-300" : "bg-gray-100"}`} />}
              </div>
            ))}
          </div>

          {/* ── Etapa 1: Escolher plano ── */}
          {etapa === 1 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Escolhe um plano</p>
              <div className="flex flex-col gap-2 mb-5">
                {PROMO_PLANOS.map(pl => (
                  <button key={pl.id} onClick={() => setPlanoId(pl.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer bg-transparent
                      ${planoId === pl.id ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {pl.popular && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mr-2">POPULAR</span>}
                        <span className="text-sm font-semibold text-gray-900">{pl.nome}</span>
                        <span className="text-xs text-gray-400 ml-2">{pl.duracao}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600 font-mono flex-shrink-0">{pl.preco} MZN</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{pl.desc}</p>
                    <div className="flex flex-col gap-1">
                      {pl.beneficios.map(b => (
                        <div key={b} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span className="text-green-500"><IcoCheck /></span> {b}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 bg-transparent cursor-pointer hover:border-gray-300">
                  Cancelar
                </button>
                <button onClick={() => setEtapa(2)} disabled={!planoId}
                  className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium border-0 cursor-pointer disabled:opacity-50 transition-colors">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ── Etapa 2: Pagamento ── */}
          {etapa === 2 && plano && (
            <div>
              <div className="p-3 bg-gray-50 rounded-xl mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Plano selecionado</p>
                  <p className="text-sm font-semibold text-gray-900">{plano.nome} · {plano.duracao}</p>
                </div>
                <p className="text-base font-bold text-green-600 font-mono">{plano.preco} MZN</p>
              </div>

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Método de pagamento</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {METODOS.map(m => (
                  <button key={m} onClick={() => { setMetodo(m); setNumero(""); }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer bg-transparent
                      ${metodo === m ? "border-green-500 text-green-700 bg-green-50" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    {m === "SALDO_INTERNO" ? "Saldo da carteira" : m}
                  </button>
                ))}
              </div>

              {metodo !== "SALDO_INTERNO" && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    {metodo === "VISA" ? "Número do cartão" : "Número de telefone"}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-green-500">
                    <span className="px-3 py-2 text-gray-400">
                      {metodo === "VISA" ? <IcoCred /> : <IcoPhone />}
                    </span>
                    <input
                      type="tel"
                      value={numero}
                      onChange={e => setNumero(e.target.value)}
                      placeholder={metodo === "VISA" ? "4242 4242 4242 4242" : "84 XXX XXXX"}
                      className="flex-1 py-2 pr-3 text-sm border-0 outline-none bg-transparent"
                    />
                  </div>
                </div>
              )}

              {metodo === "SALDO_INTERNO" && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                  <p className="text-xs text-blue-800">O valor será debitado do seu saldo disponível na carteira MozTicTac.</p>
                </div>
              )}

              {erroMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
                  <p className="text-xs text-red-700">{erroMsg}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setEtapa(1); setErroMsg(""); }}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 bg-transparent cursor-pointer">
                  Voltar
                </button>
                <button onClick={handlePagar} disabled={enviando}
                  className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium border-0 cursor-pointer disabled:opacity-60 transition-colors">
                  {enviando ? "A processar..." : `Pagar ${plano.preco} MZN`}
                </button>
              </div>
            </div>
          )}

          {/* ── Etapa 3: Confirmado ── */}
          {etapa === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Promoção activada! ⚡</h3>
              <p className="text-sm text-gray-500 mb-1">
                <strong>{produto.nome}</strong> está agora no <strong>Top Tendências</strong>.
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Duração: {plano?.duracao} · Plano {plano?.nome}
              </p>
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-700">Já visível no carrossel de tendências</span>
              </div>
              <button onClick={() => { onSucesso && onSucesso(produto); onClose(); }}
                className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium border-0 cursor-pointer transition-colors">
                Fechar
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}