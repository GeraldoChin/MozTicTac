import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid, Home, ShoppingBag, Store,
  Share2, HelpCircle, Info, ChevronDown,
} from "lucide-react";

const VERDE = "#00b96b";

const LINKS_NAV = [
  { rotulo: "Início",    Icone: Home,        temSeta: false, para: "/" },
  { rotulo: "Comprar",   Icone: ShoppingBag, temSeta: true,  para: "/comprar" },
  { rotulo: "Vender",    Icone: Store,       temSeta: true,  para: "/vender" },
  { rotulo: "Afiliados", Icone: Share2,      temSeta: true,  para: "/afiliados" },
  { rotulo: "Ajuda",     Icone: HelpCircle,  temSeta: false, para: "/ajuda" },
  { rotulo: "Sobre Nós", Icone: Info,        temSeta: false, para: "/sobre-nos" },
];

export function Navbar({ aoClicarCategorias }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="text-white text-sm" style={{ background: VERDE }}>
      <div className="max-w-7xl mx-auto px-4 flex items-stretch">

        {/* Categorias */}
        <button
          onClick={aoClicarCategorias}
          className="flex items-center gap-2 px-5 py-3 font-semibold text-sm"
          style={{ background: "rgba(0,0,0,.15)" }}
        >
          <LayoutGrid size={16} />
          Categorias
          <ChevronDown size={13} />
        </button>

        {/* LINKS */}
        {LINKS_NAV.map(({ rotulo, Icone, temSeta, para }) => {
          const activo = location.pathname === para;

          return (
            <button
              key={rotulo}
              onClick={() => navigate(para)}
              className="flex items-center gap-1.5 px-4 py-3 font-medium relative transition-colors"
              style={{
                color: "white",
                background: activo ? "rgba(0,0,0,.2)" : "transparent"
              }}
              onMouseEnter={e => {
                if (!activo) e.currentTarget.style.background = "rgba(0,0,0,.15)";
              }}
              onMouseLeave={e => {
                if (!activo) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icone size={15} />
              {rotulo}
              {temSeta && <ChevronDown size={13} className="opacity-70" />}

              {activo && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          );
        })}

      </div>
    </nav>
  );
}