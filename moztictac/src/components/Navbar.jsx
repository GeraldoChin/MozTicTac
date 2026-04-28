import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid, Home, ShoppingBag,
  HelpCircle, Info, ChevronDown,
} from "lucide-react";

const VERDE = "#00b96b";

const LINKS_NAV = [
  { rotulo: "Home", Icone: Home, para: "/" },
  { rotulo: "Shop", Icone: ShoppingBag, para: "/produtos", temSeta: true },
  { rotulo: "Ajuda", Icone: HelpCircle, para: "/ajuda" },
  { rotulo: "Sobre Nós", Icone: Info, para: "/sobre-nos" },
];

export function Navbar({ aoClicarCategorias }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="text-white text-sm shadow-md" style={{ background: VERDE }}>
      <div className="max-w-7xl mx-auto px-4 flex items-stretch">

        {/* Categorias */}
        <button
          onClick={aoClicarCategorias}
          className="
            flex items-center gap-2 px-5 py-3 font-semibold
            bg-black/20
            hover:bg-black/30
            transition-all duration-300
          "
        >
          <LayoutGrid size={16} />
          Categorias
          <ChevronDown size={14} className="opacity-80" />
        </button>

        {/* Links */}
        <div className="flex">
          {LINKS_NAV.map(({ rotulo, Icone, para, temSeta }) => {
            const activo = location.pathname === para;

            return (
              <button
                key={rotulo}
                onClick={() => navigate(para)}
                className={`
                  relative flex items-center gap-1.5 px-5 py-3 font-medium
                  transition-all duration-300
                  ${activo ? "text-white" : "text-white/90 hover:text-white"}
                `}
              >
                <Icone size={16} />
                {rotulo}

                {temSeta && (
                  <ChevronDown size={13} className="opacity-70" />
                )}

                {/* Hover background suave */}
                <span
                  className="
                    absolute inset-0 bg-black/10 opacity-0
                    hover:opacity-100
                    transition-opacity duration-300
                    rounded-sm
                  "
                />

                {/* Linha animada (ativo + hover) */}
                <span
                  className={`
                    absolute bottom-0 left-0 h-[2px] bg-white
                    transition-all duration-300
                    ${activo ? "w-full" : "w-0 group-hover:w-full"}
                  `}
                />
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
}
