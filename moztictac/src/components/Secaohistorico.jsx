import { ShoppingBag, User, Share2, Store, ArrowUp, ArrowDown, Settings } from "lucide-react";
import { VERDE } from "../components/Contaconstantes";

const itens = [
  { Icone: ShoppingBag, texto: "Compra confirmada — Relógio Premium Swiss Made",  data: "02/04/2026 20:10" },
  { Icone: User,        texto: "Início de sessão — Chrome · Windows",             data: "02/04/2026 19:55" },
  { Icone: Share2,      texto: "Link de afiliado gerado — Tênis Nike Air Max",    data: "01/04/2026 14:30" },
  { Icone: Store,       texto: "Publicação criada — Capulana Bordada Artesanal",  data: "30/03/2026 10:15" },
  { Icone: ArrowUp,     texto: "Levantamento realizado — 2.350 MZN via M-Pesa",  data: "30/03/2026 09:00" },
  { Icone: ArrowDown,   texto: "Depósito recebido — 5.000 MZN via E-Mola",       data: "25/03/2026 16:45" },
  { Icone: Settings,    texto: "Perfil actualizado — email alterado",             data: "20/03/2026 11:20" },
];

export function SecaoHistorico() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Histórico de Actividade</h2>
      <div className="space-y-2">
        {itens.map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
              <item.Icone size={15} style={{ color: VERDE }} />
            </div>
            <div>
              <p className="text-sm text-gray-800">{item.texto}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.data}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}