import { CreditCard, MousePointerClick, CheckCircle, Link, Copy } from "lucide-react";
import { linksAfiliados, VERDE } from "../components/Contaconstantes";
import { Badge } from "../components/Contaui";

export function SecaoAfiliados() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Programa de Afiliados</h2>

      {/* resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Ganho",   valor: "5.100 MZN", Icone: CreditCard        },
          { label: "Cliques",       valor: "231",       Icone: MousePointerClick },
          { label: "Conversões",    valor: "11",        Icone: CheckCircle       },
          { label: "Links Activos", valor: "2",         Icone: Link              },
        ].map(({ label, valor, Icone }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
            <Icone size={20} style={{ color: VERDE }} className="mx-auto" />
            <p className="text-base font-bold text-gray-900 mt-1">{valor}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* links */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Os Meus Links de Afiliado</h3>
        <div className="space-y-3">
          {linksAfiliados.map(l => (
            <div key={l.id} className="p-4 bg-white border border-gray-100 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">{l.produto}</p>
                <Badge cor="verde" texto={`${l.comissao}% comissão`} />
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 font-mono truncate">
                  moztictac.mz/p/ref?={l.produto.slice(0, 8).replace(/ /g, "")}ANA
                </p>
                <button className="flex items-center gap-1 text-xs font-semibold cursor-pointer ml-2 shrink-0"
                  style={{ color: VERDE }}>
                  <Copy size={12} /> Copiar
                </button>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span><b className="text-gray-700">{l.cliques}</b> cliques</span>
                <span><b className="text-gray-700">{l.conversoes}</b> conversões</span>
                <span><b style={{ color: VERDE }}>{l.ganho.toLocaleString("pt-MZ")} MZN</b> ganho</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}