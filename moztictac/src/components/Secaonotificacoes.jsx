import { CreditCard, Truck, Star, Share2, ShieldCheck, Bell, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { VERDE } from "../components/Contaconstantes";

const BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "http://localhost:3000/api/v1";

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
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || dados.message || `Erro ${resposta.status}`);
  return dados;
}

// Mapeia tipo do backend para ícone
const ICONE_POR_TIPO = {
  PAGAMENTO_CONFIRMADO:  CreditCard,
  NOVA_VENDA:            CreditCard,
  PEDIDO_ENVIADO:        Truck,
  PEDIDO_ENTREGUE:       Truck,
  COMISSAO_RECEBIDA:     Share2,
  NIVEL_AFILIADO_SUBIU:  Share2,
  SAQUE_APROVADO:        CreditCard,
  SAQUE_REJEITADO:       CreditCard,
  NOVA_MENSAGEM:         Bell,
  ALERTA_SEGURANCA:      ShieldCheck,
  DISPUTA_ABERTA:        ShieldCheck,
  DISPUTA_RESOLVIDA:     ShieldCheck,
  CONTA_BLOQUEADA:       ShieldCheck,
  KYC_APROVADO:          ShieldCheck,
  KYC_REJEITADO:         ShieldCheck,
  PRODUTO_APROVADO:      Star,
  PRODUTO_REJEITADO:     Star,
  OTP_ENVIADO:           ShieldCheck,
};

function formatarData(dataStr) {
  if (!dataStr) return "—";
  const data = new Date(dataStr);
  const agora = new Date();
  const diff  = agora - data;
  const mins  = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias  = Math.floor(diff / 86400000);

  if (mins < 1)   return "Agora";
  if (mins < 60)  return `Há ${mins}min`;
  if (horas < 24) return `Hoje ${data.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}`;
  if (dias === 1) return `Ontem ${data.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}`;
  return data.toLocaleDateString("pt-MZ", { day: "2-digit", month: "2-digit" });
}

export function SecaoNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas]         = useState(0);
  const [carregando, setCarregando]     = useState(true);
  const [erro, setErro]                 = useState(null);
  const [marcando, setMarcando]         = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await requisitar("/usuarios/notificacoes");
      const d   = res.dados ?? res.data ?? {};
      setNotificacoes(d.notificacoes ?? []);
      setNaoLidas(d.naoLidas ?? 0);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function marcarUmaLida(id) {
    try {
      await requisitar(`/usuarios/notificacoes/${id}/lida`, { method: "PATCH" });
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (_) {}
  }

  async function marcarTodasLidas() {
    setMarcando(true);
    try {
      await requisitar("/usuarios/notificacoes/lidas", { method: "PATCH" });
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setMarcando(false);
    }
  }

  if (carregando) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: VERDE }} />
    </div>
  );

  if (erro) return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-red-500 text-sm font-medium">Erro ao carregar notificações</p>
      <p className="text-gray-400 text-xs">{erro}</p>
      <button onClick={carregar} className="flex items-center gap-1.5 text-xs text-white px-4 py-2 rounded-lg border-0 cursor-pointer" style={{ background: VERDE }}>
        <RefreshCw size={12} /> Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">Notificações</h2>
          {naoLidas > 0 && (
            <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: VERDE }}>
              {naoLidas}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={carregar} className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-0 p-1">
            <RefreshCw size={14} />
          </button>
          {naoLidas > 0 && (
            <button onClick={marcarTodasLidas} disabled={marcando}
              className="text-xs font-semibold cursor-pointer bg-transparent border-0 disabled:opacity-50"
              style={{ color: VERDE }}>
              {marcando ? "A marcar..." : "Marcar todas como lidas"}
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      {notificacoes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell size={24} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">Não tens notificações ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificacoes.map(n => {
            const Icone = ICONE_POR_TIPO[n.tipo] ?? Bell;
            return (
              <div key={n.id}
                onClick={() => !n.lida && marcarUmaLida(n.id)}
                className="flex items-start gap-3 p-4 rounded-xl border transition-colors"
                style={{
                  background:   n.lida ? "white" : "#f0fdf7",
                  borderColor:  n.lida ? "#f3f4f6" : "#bbf7d0",
                  cursor:       n.lida ? "default" : "pointer",
                }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: n.lida ? "#f3f4f6" : "#e6f9f0" }}>
                  <Icone size={16} style={{ color: n.lida ? "#9ca3af" : VERDE }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{n.titulo}</p>
                    {!n.lida && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: VERDE }} />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{n.mensagem}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatarData(n.criadoEm)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}