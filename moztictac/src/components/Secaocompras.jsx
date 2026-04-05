import { Package, CheckCircle, Truck } from "lucide-react";
import { minhasCompras, VERDE } from "../components/Contaconstantes";
import { Badge } from "../components/Contaui";

export function SecaoCompras() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Minhas Compras</h2>
      <div className="space-y-3">
        {minhasCompras.map(c => {
          const corEstado   = c.estado === "Entregue" ? "verde" : c.estado === "Em trânsito" ? "amarelo" : "azul";
          const IconeEstado = c.estado === "Entregue" ? CheckCircle : c.estado === "Em trânsito" ? Truck : Package;
          const corIcone    = corEstado === "verde" ? VERDE : corEstado === "amarelo" ? "#f59e0b" : "#3b82f6";

          return (
            <div key={c.id}
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Package size={24} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{c.nome}</p>
                <p className="text-xs text-gray-500">Vendedor: {c.vendedor}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <IconeEstado size={12} style={{ color: corIcone }} />
                  <Badge cor={corEstado} texto={c.estado} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900">{c.preco.toLocaleString("pt-MZ")} MZN</p>
                <button className="text-xs mt-1 cursor-pointer font-medium" style={{ color: VERDE }}>
                  Ver detalhe
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}