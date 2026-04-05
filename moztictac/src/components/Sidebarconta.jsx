import {
  User, Wallet, ShoppingBag, Store, Share2,
  History, Bell, Lock, LogOut,
} from "lucide-react";
import { utilizador, VERDE } from "./contaConstantes";

export const MENUS = [
  { id: "perfil",       Icone: User,        rotulo: "Meu Perfil"       },
  { id: "carteira",     Icone: Wallet,      rotulo: "Carteira Digital" },
  { id: "compras",      Icone: ShoppingBag, rotulo: "Minhas Compras"   },
  { id: "vendas",       Icone: Store,       rotulo: "Minhas Vendas"    },
  { id: "afiliados",    Icone: Share2,      rotulo: "Afiliados"        },
  { id: "historico",    Icone: History,     rotulo: "Histórico"        },
  { id: "notificacoes", Icone: Bell,        rotulo: "Notificações"     },
  { id: "seguranca",    Icone: Lock,        rotulo: "Segurança"        },
];

/**
 * SidebarConta — sidebar de navegação da área de conta.
 *
 * Props:
 *   activo    {string} — id da secção activa
 *   aoMudar   {fn}     — chamado com o id ao clicar num item
 */
export function SidebarConta({ activo, aoMudar }) {
  return (
    <aside className="w-64 shrink-0 hidden md:block">

      {/* card utilizador */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-black shrink-0"
          style={{ background: VERDE }}>
          {utilizador.avatar}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{utilizador.nome}</p>
          <p className="text-xs text-gray-400 truncate">{utilizador.email}</p>
        </div>
      </div>

      {/* nav */}
      <nav className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {MENUS.map(({ id, Icone, rotulo }) => (
          <button
            key={id}
            onClick={() => aoMudar(id)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-gray-50 last:border-0 cursor-pointer transition-colors text-left"
            style={{
              background: activo === id ? "#f0fdf7" : "white",
              color:      activo === id ? VERDE     : "#374151",
              borderLeft: activo === id ? `3px solid ${VERDE}` : "3px solid transparent",
            }}>
            <Icone size={16} style={{ color: activo === id ? VERDE : "#9ca3af" }} />
            {rotulo}
          </button>
        ))}

        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium cursor-pointer text-red-500 hover:bg-red-50 border-t border-gray-100 transition-colors">
          <LogOut size={16} color="#ef4444" />
          Sair
        </button>
      </nav>

    </aside>
  );
}