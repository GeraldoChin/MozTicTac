import { Store, Plus, Edit, Pause } from "lucide-react";
import { minhasVendas } from "./contaConstantes";
import { Badge, BotaoVerde } from "./contaUI";

export function SecaoVendas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Minhas Vendas</h2>
        <BotaoVerde tamanho="sm">
          <span className="flex items-center gap-1"><Plus size={12} /> Publicar</span>
        </BotaoVerde>
      </div>

      <div className="space-y-3">
        {minhasVendas.map(v => (
          <div key={v.id}
            className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <Store size={24} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{v.nome}</p>
              <p className="text-xs text-gray-500">{v.vendas} vendas · {v.preco.toLocaleString("pt-MZ")} MZN</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge cor={v.estado === "Activo" ? "verde" : "cinza"} texto={v.estado} />
                {v.afiliados && <Badge cor="azul" texto="Aceita Afiliados" />}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="p-2 rounded-lg border border-gray-200 hover:border-green-500 cursor-pointer transition-colors">
                <Edit size={14} className="text-gray-500" />
              </button>
              <button className="p-2 rounded-lg border border-gray-200 hover:border-red-400 cursor-pointer transition-colors">
                <Pause size={14} className="text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}