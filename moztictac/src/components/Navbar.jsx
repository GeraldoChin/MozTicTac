import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid, Home, ShoppingBag,
  HelpCircle, Info, ChevronDown, X, Menu,
} from "lucide-react";

const VERDE = "#00b96b";
const VERDE_ESCURO = "#009a5a";

const LINKS_NAV = [
  { rotulo: "Home",     Icone: Home,        para: "/" },
  { rotulo: "Shop",     Icone: ShoppingBag, para: "/produtos", temSeta: true },
  { rotulo: "Ajuda",    Icone: HelpCircle,  para: "/faq" },
  { rotulo: "Sobre Nós",Icone: Info,        para: "/sobre-nos" },
];

export function Navbar({ aoClicarCategorias }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        style={{
          background: `linear-gradient(90deg, ${VERDE_ESCURO} 0%, ${VERDE} 100%)`,
          boxShadow: "0 2px 12px rgba(0,185,107,0.25)",
        }}
        className="relative "
      >
        <div className="max-w-[1450px] mx-auto px-3 sm:px-4 flex items-stretch">

          {/* ── Categorias ── */}
          <button
            onClick={aoClicarCategorias}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-bold text-white shrink-0 transition-all duration-200"
            style={{ background: "rgba(0,0,0,0.18)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.28)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.18)"}
          >
            <LayoutGrid size={15} />
            <span className="hidden xs:inline">Categorias</span>
            <ChevronDown size={13} className="opacity-75" />
          </button>

          {/* ── Divisor ── */}
          <div className="w-px my-2.5" style={{ background: "rgba(255,255,255,0.18)" }} />

          {/* ── Links desktop ── */}
          <div className="hidden md:flex flex-1">
            {LINKS_NAV.map(({ rotulo, Icone, para, temSeta }) => {
              const activo = location.pathname === para;
              return (
                <button
                  key={rotulo}
                  onClick={() => navigate(para)}
                  className="relative flex items-center gap-1.5 px-4 lg:px-5 py-3 text-sm font-medium text-white/90 hover:text-white transition-all duration-200 group overflow-hidden"
                  style={{ background: activo ? "rgba(0,0,0,0.15)" : "transparent" }}
                  onMouseEnter={e => { if (!activo) e.currentTarget.style.background = "rgba(0,0,0,0.10)"; }}
                  onMouseLeave={e => { if (!activo) e.currentTarget.style.background = "transparent"; }}
                >
                  <Icone size={14} style={{ opacity: activo ? 1 : 0.75 }} />
                  <span style={{ fontWeight: activo ? 700 : 500 }}>{rotulo}</span>
                  {temSeta && <ChevronDown size={12} className="opacity-60" />}

                  {/* Linha activo/hover */}
                  <span
                    className="absolute bottom-0 left-0 h-[2.5px] rounded-t-full transition-all duration-300"
                    style={{
                      width: activo ? "100%" : "0%",
                      background: "rgba(255,255,255,0.90)",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* ── Spacer desktop ── */}
          <div className="hidden md:flex flex-1" />

          {/* ── Badge "Novo" desktop ── */}
          <div className="hidden md:flex items-center px-4">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.90)", border: "1px solid rgba(255,255,255,0.20)" }}
            >
              ✦ Novo: Programa de Afiliados
            </span>
          </div>

          {/* ── Hamburger mobile ── */}
          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden ml-auto flex items-center justify-center w-10 h-10 my-1.5 rounded-lg text-white transition-all duration-200"
            style={{ background: open ? "rgba(0,0,0,0.25)" : "transparent" }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>

        {/* ── Progress bar decorativa ── */}
        <div className="h-[1.5px]" style={{ background: "rgba(255,255,255,0.10)" }} />
      </nav>

      {/* ══ Drawer mobile ══ */}
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-30 md:hidden transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          backdropFilter: open ? "blur(2px)" : "none",
        }}
      />

      {/* Drawer */}
      <div
        className="fixed left-0 right-0 z-40 md:hidden transition-all duration-300 ease-in-out"
        style={{
          top: 0,
          transform: open ? "translateY(0)" : "translateY(-105%)",
          background: `linear-gradient(160deg, ${VERDE_ESCURO} 0%, ${VERDE} 100%)`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          borderRadius: "0 0 20px 20px",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Header drawer */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.20)" }}>
              <LayoutGrid size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">Menu</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
            style={{ background: "rgba(0,0,0,0.15)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Links drawer */}
        <div className="px-4 py-3 space-y-1">
          {/* Categorias */}
          <button
            onClick={() => { aoClicarCategorias(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150"
            style={{ background: "rgba(0,0,0,0.18)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.28)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.18)"}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <LayoutGrid size={15} className="text-white" />
            </div>
            Categorias
            <ChevronDown size={14} className="ml-auto opacity-60" />
          </button>

          {LINKS_NAV.map(({ rotulo, Icone, para, temSeta }) => {
            const activo = location.pathname === para;
            return (
              <button
                key={rotulo}
                onClick={() => { navigate(para); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-150"
                style={{
                  background: activo ? "rgba(255,255,255,0.18)" : "transparent",
                  color: "white",
                  fontWeight: activo ? 700 : 500,
                  border: activo ? "1px solid rgba(255,255,255,0.20)" : "1px solid transparent",
                }}
                onMouseEnter={e => { if (!activo) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { if (!activo) e.currentTarget.style.background = "transparent"; }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: activo ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.10)" }}
                >
                  <Icone size={15} className="text-white" />
                </div>
                {rotulo}
                {temSeta && <ChevronDown size={13} className="ml-auto opacity-60" />}
                {activo && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "white" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Badge no drawer */}
        <div className="px-5 pb-5 pt-2">
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-white/90"
            style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <span>✦</span>
            <span>Novo: Programa de Afiliados está disponível!</span>
          </div>
        </div>
      </div>
    </>
  );
}