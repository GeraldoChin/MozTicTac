import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { VERDE } from "../components/contaConstantes";
import { SidebarConta, MENUS } from "../components/SidebarConta";
import { Cabecalho }           from "../components/Cabecalho";
import { SecaoPerfil }         from "../components/SecaoPerfil";
import { SecaoCarteira }       from "../components/SecaoCarteira";
import { SecaoCompras }        from "../components/SecaoCompras";
import { SecaoVendas }         from "../components/SecaoVendas";
import { SecaoAfiliados }      from "../components/SecaoAfiliados";
import { SecaoHistorico }      from "../components/SecaoHistorico";
import { SecaoNotificacoes }   from "../components/SecaoNotificacoes";
import { SecaoSeguranca }      from "../components/SecaoSeguranca";

const SECCOES = {
  perfil:       <SecaoPerfil />,
  carteira:     <SecaoCarteira />,
  compras:      <SecaoCompras />,
  vendas:       <SecaoVendas />,
  afiliados:    <SecaoAfiliados />,
  historico:    <SecaoHistorico />,
  notificacoes: <SecaoNotificacoes />,
  seguranca:    <SecaoSeguranca />,
};

export default function MinhaConta() {
  const [activo, setActivo]         = useState("perfil");
  const [pesquisa, setPesquisa]     = useState("");

  return (
    <div className="min-h-screen bg-gray-50">

      {/* header */}
      <Cabecalho
        utilizadorAutenticado
        valorPesquisa={pesquisa}
        aoMudarPesquisa={setPesquisa}
        aoClicarPesquisa={() => {}}
        aoClicarConta={() => {}}
        aoClicarCarteira={() => setActivo("carteira")}
        aoClicarCarrinho={() => {}}
        aoClicarWishlist={() => {}}
        aoClicarNotificacoes={() => setActivo("notificacoes")}
        aoClicarChat={() => {}}
      />

      {/* breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <button className="hover:text-green-600 cursor-pointer transition-colors">Início</button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Minha Conta</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">

        {/* sidebar — desktop */}
        <SidebarConta activo={activo} aoMudar={setActivo} />

        <main className="flex-1 min-w-0">

          {/* nav chips — mobile */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4">
            {MENUS.map(({ id, Icone, rotulo }) => (
              <button key={id} onClick={() => setActivo(id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shrink-0 border cursor-pointer transition-colors"
                style={{
                  background:  activo === id ? VERDE   : "white",
                  color:       activo === id ? "white" : "#374151",
                  borderColor: activo === id ? VERDE   : "#e5e7eb",
                }}>
                <Icone size={13} style={{ color: activo === id ? "white" : "#9ca3af" }} />
                {rotulo}
              </button>
            ))}
          </div>

          {/* secção activa */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            {SECCOES[activo]}
          </div>

        </main>
      </div>
    </div>
  );
}