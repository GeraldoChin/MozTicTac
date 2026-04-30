import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useCart } from "../../hooks/useCart"; // ou o caminho correto


import { VERDE } from "../../components/contaConstantes";
import { MENUS } from "../../components/SidebarConta"; // só os dados, sem renderizar o sidebar
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
  perfil: <SecaoPerfil />,
  carteira: <SecaoCarteira />,
  compras: <SecaoCompras />,
  vendas: <SecaoVendas />,
  afiliados: <SecaoAfiliados />,
  historico: <SecaoHistorico />,
  notificacoes: <SecaoNotificacoes />,
  seguranca: <ChatVendedorPage />,
  chat: <ChatVendedorPage />,
};

export default function MinhaConta() {
  const [activo, setActivo] = useState("perfil");
  const { cartCount, wishCount, addToCart, addToWish } = useCart();
  const [searchVal, setSearchVal] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER — aoNavegar liga o dropdown directamente a setActivo */}
      <Header
        cartCount={cartCount}
        wishCount={wishCount}
        searchVal={searchVal}
        onSearchChange={setSearchVal}
        onAddToCart={addToCart}
        onAddToWish={addToWish}
      />

      {/* BREADCRUMB */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <button className="hover:text-green-600 cursor-pointer transition-colors">
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

      {/* CONTEÚDO */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <main>
          {/* TABS — navegação horizontal (substitui o sidebar) */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
            {MENUS.map(({ id, Icone, rotulo }) => (
              <button
                key={id}
                onClick={() => setActivo(id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shrink-0 border cursor-pointer transition-all duration-150"
                style={{
                  background: activo === id ? VERDE : "white",
                  color: activo === id ? "white" : "#374151",
                  borderColor: activo === id ? VERDE : "#e5e7eb",
                  boxShadow: activo === id ? `0 2px 8px ${VERDE}40` : "none",
                }}
              >
                <Icone
                  size={13}
                  style={{ color: activo === id ? "white" : "#9ca3af" }}
                />
                {rotulo}
              </button>
            ))}
          </div>

          {/* SECÇÃO ACTIVA */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            {SECCOES[activo]}
          </div>
        </main>
      </div>
    </div>
  );
}
