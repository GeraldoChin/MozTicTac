import { CreditCard, Truck, Star, Share2, ShieldCheck } from "lucide-react";
import { VERDE } from "../components/Contaconstantes";

const notifs = [
  { Icone: CreditCard,  titulo: "Pagamento confirmado",           desc: "Relógio Premium Swiss Made — 4.200 MZN", lida: false, data: "Hoje 20:10"  },
  { Icone: Truck,       titulo: "Pedido em trânsito",             desc: "Perfume Importado está a caminho",        lida: false, data: "Hoje 14:30"  },
  { Icone: Star,        titulo: "Nova avaliação recebida",        desc: "João M. avaliou a tua publicação ★★★★★", lida: true,  data: "Ontem 10:00" },
  { Icone: Share2,      titulo: "Comissão de afiliado creditada", desc: "+320 MZN — Tênis Nike Air Max",           lida: true,  data: "01/04 09:15" },
  { Icone: ShieldCheck, titulo: "Alerta de segurança",            desc: "Novo início de sessão detectado",         lida: true,  data: "30/03 19:55" },
];

export function SecaoNotificacoes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Notificações</h2>
        <button className="text-xs font-semibold cursor-pointer" style={{ color: VERDE }}>
          Marcar todas como lidas
        </button>
      </div>
      <div className="space-y-2">
        {notifs.map((n, i) => (
          <div key={i}
            className="flex items-start gap-3 p-4 rounded-xl border transition-colors"
            style={{ background: n.lida ? "white" : "#f0fdf7", borderColor: n.lida ? "#f3f4f6" : "#bbf7d0" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: n.lida ? "#f3f4f6" : "#e6f9f0" }}>
              <n.Icone size={16} style={{ color: n.lida ? "#9ca3af" : VERDE }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{n.titulo}</p>
                {!n.lida && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: VERDE }} />}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
              <p className="text-xs text-gray-400 mt-0.5">{n.data}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}