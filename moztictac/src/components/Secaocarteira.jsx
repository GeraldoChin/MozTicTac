import { Wallet, AlertTriangle, BarChart2, Plus, ArrowUp, Send, FileText, ArrowDown } from "lucide-react";
import { resumoCarteira, transacoes, VERDE } from "../components/Contaconstantes";

export function SecaoCarteira() {
  const r = resumoCarteira;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Carteira Digital</h2>

      {/* saldos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Saldo Disponível", valor: r.saldoDisponivel, cor: VERDE,     Icone: Wallet        },
          { label: "Saldo Pendente",   valor: r.saldoPendente,   cor: "#f59e0b", Icone: AlertTriangle },
          { label: "Saldo Total",      valor: r.saldoTotal,      cor: "#3b82f6", Icone: BarChart2     },
        ].map(({ label, valor, cor, Icone }) => (
          <div key={label} className="rounded-xl p-4 border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Icone size={16} style={{ color: cor }} />
              <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
            </div>
            <p className="text-2xl font-black" style={{ color: cor }}>
              {valor.toLocaleString("pt-MZ")}
              <span className="text-sm font-normal text-gray-400 ml-1">MZN</span>
            </p>
          </div>
        ))}
      </div>

      {/* acções */}
      <div className="flex flex-wrap gap-3">
        {[
          { Icone: Plus,     texto: "Depositar" },
          { Icone: ArrowUp,  texto: "Levantar"  },
          { Icone: Send,     texto: "Enviar"    },
          { Icone: FileText, texto: "Relatório" },
        ].map(({ Icone, texto }) => (
          <button key={texto}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-green-500 hover:text-green-600 transition-colors cursor-pointer">
            <Icone size={14} style={{ color: VERDE }} />
            {texto}
          </button>
        ))}
      </div>

      {/* resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Ganho Vendas",    valor: r.ganhoVendas     },
          { label: "Ganho Afiliados", valor: r.ganhoAfiliados  },
          { label: "Depositado",      valor: r.totalDepositado },
          { label: "Levantado",       valor: r.totalLevantado  },
        ].map(({ label, valor }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-base font-bold text-gray-800">
              {valor.toLocaleString("pt-MZ")}
              <span className="text-xs font-normal text-gray-400 ml-1">MZN</span>
            </p>
          </div>
        ))}
      </div>

      {/* transacções */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Transacções Recentes</h3>
        <div className="space-y-2">
          {transacoes.map(t => {
            const positivo = t.valor > 0;
            return (
              <div key={t.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: positivo ? "#e6f9f0" : "#fef2f2" }}>
                    {positivo
                      ? <ArrowDown size={16} style={{ color: VERDE }} />
                      : <ArrowUp   size={16} color="#ef4444" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.descricao}</p>
                    <p className="text-xs text-gray-400">{t.data}</p>
                  </div>
                </div>
                <p className="text-sm font-bold" style={{ color: positivo ? VERDE : "#ef4444" }}>
                  {positivo ? "+" : ""}{t.valor.toLocaleString("pt-MZ")} MZN
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}