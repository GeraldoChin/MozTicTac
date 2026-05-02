import {
  User,
  Wallet,
  ShoppingBag,
  Store,
  Share2,
  History,
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { utilizador, VERDE } from "./contaConstantes";

const VERDE_ESCURO = "#009a5a";

export const MENUS = [
  { id: "perfil",       Icone: User,          rotulo: "Meu Perfil"       },
  { id: "chat",         Icone: MessageCircle, rotulo: "Chat"             },
  { id: "carteira",     Icone: Wallet,        rotulo: "Carteira Digital" },
  { id: "compras",      Icone: ShoppingBag,   rotulo: "Minhas Compras"   },
  { id: "vendas",       Icone: Store,         rotulo: "Minhas Vendas"    },
  { id: "afiliados",    Icone: Share2,        rotulo: "Afiliados"        },
  { id: "historico",    Icone: History,       rotulo: "Histórico"        },
  { id: "notificacoes", Icone: Bell,          rotulo: "Notificações"     },
  { id: "seguranca",    Icone: Lock,          rotulo: "Segurança"        },
];

const GRUPOS = [
  { titulo: "Conta",      ids: ["perfil", "carteira", "chat"] },
  { titulo: "Actividade", ids: ["compras", "vendas", "afiliados", "historico"] },
  { titulo: "Sistema",    ids: ["notificacoes", "seguranca"] },
];

export function SidebarConta({ activo, aoMudar }) {
  const menuPorId = Object.fromEntries(MENUS.map((m) => [m.id, m]));

  return (
    <aside className="w-64 fixed left-0 top-20 h-[calc(100vh-4rem)] z-40 hidden md:flex flex-col gap-3">
      {/* Card utilizador */}
      <div
        className=" p-4 flex items-center gap-3 overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #0f1923 0%, #162032 100%)",
          border: "1px solid rgba(0,185,107,0.15)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${VERDE}30 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div
          className="w-11 h-11  flex items-center justify-center text-white text-base font-black shrink-0 relative"
          style={{
            background: `linear-gradient(135deg, ${VERDE}, ${VERDE_ESCURO})`,
            boxShadow: `0 4px 12px ${VERDE}50`,
          }}
        >
          {utilizador.avatar}
          <span
            style={{
              position: "absolute",
              bottom: -1,
              right: -1,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid #0f1923",
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold truncate" style={{ color: "#f1f5f9", fontSize: 13, letterSpacing: "-0.2px" }}>
            {utilizador.nome}
          </p>
          <p className="truncate mt-0.5" style={{ color: "#64748b", fontSize: 11 }}>
            {utilizador.email}
          </p>
        </div>
      </div>

      {/* Navegação agrupada */}
      <nav
        className=" overflow-hidden flex-1"
        style={{
          background: "#fff",
          border: "1px solid #e8f5ee",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {GRUPOS.map((grupo, gi) => (
          <div key={grupo.titulo}>
            <div
              className="px-4 pt-3 pb-1.5"
              style={{ borderTop: gi > 0 ? "1px solid #f0fdf4" : "none" }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                {grupo.titulo}
              </span>
            </div>

            {grupo.ids.map((id) => {
              const { Icone, rotulo } = menuPorId[id];
              const eActivo = activo === id;
              return (
                <button
                  key={id}
                  onClick={() => aoMudar(id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium cursor-pointer transition-all duration-150 text-left"
                  style={{
                    background: eActivo ? "#f0fdf7" : "transparent",
                    color: eActivo ? VERDE : "#475569",
                    border: "none",
                    borderLeftStyle: "solid",
                    borderLeftWidth: 3,
                    borderLeftColor: eActivo ? VERDE : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!eActivo) {
                      e.currentTarget.style.background = "#f8fffe";
                      e.currentTarget.style.color = "#1a2e22";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!eActivo) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#475569";
                    }
                  }}
                >
                  <div
                    className="w-7 h-7  flex items-center justify-center shrink-0 transition-all duration-150"
                    style={{ background: eActivo ? `${VERDE}18` : "#f1f5f9" }}
                  >
                    <Icone size={14} style={{ color: eActivo ? VERDE : "#94a3b8" }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13 }}>{rotulo}</span>
                  {eActivo && (
                    <ChevronRight size={13} style={{ color: VERDE, opacity: 0.6, flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Sair */}
        <div style={{ borderTop: "1px solid #fee2e2", margin: "4px 0 0" }}>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium cursor-pointer transition-all duration-150"
            style={{
              background: "transparent",
              border: "none",
              borderLeft: "3px solid transparent",
              color: "#ef4444",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div
              className="w-7 h-7  flex items-center justify-center shrink-0"
              style={{ background: "#fee2e2" }}
            >
              <LogOut size={14} color="#ef4444" />
            </div>
            <span style={{ fontSize: 13 }}>Sair da Conta</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}