import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useUtilizador } from "../../hooks/useUtilizador"; // ← dados reais

import { VERDE } from "../../components/contaConstantes";
import { MENUS } from "../../components/SidebarConta";
import { Header } from "../../components/Header";
import { SecaoPerfil } from "../../components/SecaoPerfil";
import { SecaoCarteira } from "../../components/SecaoCarteira";
import { SecaoCompras } from "../../components/SecaoCompras";
import { SecaoVendas } from "../../components/SecaoVendas";
import { SecaoAfiliados } from "../../components/SecaoAfiliados";
import { SecaoHistorico } from "../../components/SecaoHistorico";
import { SecaoNotificacoes } from "../../components/SecaoNotificacoes";
import { SecaoSeguranca } from "../../components/SecaoSeguranca";
import ChatVendedorPage from "./ChatPageVendedor";

const SECCOES = {
  perfil:        <SecaoPerfil />,
  carteira:      <SecaoCarteira />,
  compras:       <SecaoCompras />,
  vendas:        <SecaoVendas />,
  afiliados:     <SecaoAfiliados />,
  historico:     <SecaoHistorico />,
  notificacoes:  <SecaoNotificacoes />,
  seguranca:     <SecaoSeguranca />,
  chat:          <ChatVendedorPage />,
};

export default function MinhaConta() {
  const [activo, setActivo]     = useState("perfil");
  const { cartCount, wishCount } = useCart();
  const [searchVal, setSearchVal] = useState("");

  // ── Dados reais do utilizador autenticado ──
  const { utilizador } = useUtilizador();

  // Calcula as iniciais a partir do nome real
  const nomeCompleto = utilizador?.nomeCompleto || utilizador?.nome || "";
  const iniciais = nomeCompleto
    .trim()
    .split(" ")
    .map(p => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  // Data de membro formatada
  const membroDesde = utilizador?.criadoEm
    ? new Date(utilizador.criadoEm).toLocaleDateString("pt-MZ", { month: "short", year: "numeric" })
    : utilizador?.membro || "—";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        contagemCarrinho={cartCount}
        contagemWishlist={wishCount}
        valorPesquisa={searchVal}
        aoMudarPesquisa={setSearchVal}
        aoNavegar={(id) => setActivo(id)}
      />

      {/* BREADCRUMB */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <button className="hover:text-green-600 cursor-pointer transition-colors bg-transparent border-none">
            Início
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Minha Conta</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span style={{ color: VERDE, fontWeight: 600 }}>
            {MENUS.find((m) => m.id === activo)?.rotulo}
          </span>
        </div>
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div className="max-w-[90%] mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">

          {/* ── SIDEBAR ── */}
          <aside className="w-56 shrink-0 sticky top-6">
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">

              {/* Mini-perfil com dados reais */}
              <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0"
                  style={{ background: VERDE }}
                >
                  {utilizador?.avatar ? (
                    <img
                      src={utilizador.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    iniciais
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {nomeCompleto || "Utilizador"}
                  </p>
                  <p className="text-xs text-gray-400">Desde {membroDesde}</p>
                </div>
              </div>

              {/* Navegação */}
              <nav className="p-2">
                {MENUS.map(({ id, Icone, rotulo }) => (
                  <button
                    key={id}
                    onClick={() => setActivo(id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer mb-0.5 border-none rounded-lg"
                    style={{
                      background: activo === id ? "#f0fdf4" : "transparent",
                      color:      activo === id ? VERDE    : "#6b7280",
                    }}>
                    <Icone size={15} style={{ color: activo === id ? VERDE : "#9ca3af", flexShrink: 0 }} />
                    {rotulo}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── CONTEÚDO ── */}
          <main className="flex-1 min-w-0">
            <div className="bg-white border border-gray-100 p-6 shadow-sm">
              {SECCOES[activo]}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}