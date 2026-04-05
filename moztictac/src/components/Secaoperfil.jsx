import { useState } from "react";
import { Edit, User, Phone, Mail, MapPin, Home } from "lucide-react";
import { utilizador, VERDE } from "../components/Contaconstantes";
import { BotaoVerde } from "../components/Contaui";

export function SecaoPerfil() {
  const [editando, setEditando] = useState(false);
  const [form, setForm]         = useState({ ...utilizador });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Meu Perfil</h2>
        <BotaoVerde variante={editando ? "solid" : "outline"} tamanho="sm"
          onClick={() => setEditando(!editando)}>
          <span className="flex items-center gap-1">
            <Edit size={12} />
            {editando ? "Guardar" : "Editar"}
          </span>
        </BotaoVerde>
      </div>

      {/* avatar */}
      <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shrink-0"
          style={{ background: VERDE }}>
          {utilizador.avatar}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-base">{form.nome}</p>
          <p className="text-sm text-gray-500">{form.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Membro desde {utilizador.membro}</p>
        </div>
      </div>

      {/* campos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Nome completo", key: "nome",      type: "text",  Icone: User   },
          { label: "Telefone",      key: "telefone",  type: "tel",   Icone: Phone  },
          { label: "Email",         key: "email",     type: "email", Icone: Mail   },
          { label: "Província",     key: "provincia", type: "text",  Icone: MapPin },
          { label: "Cidade",        key: "cidade",    type: "text",  Icone: Home   },
          { label: "Bairro",        key: "bairro",    type: "text",  Icone: MapPin },
        ].map(({ label, key, type, Icone }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
            {editando ? (
              <div className="relative">
                <Icone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={type} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-green-500 transition-colors" />
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Icone size={14} className="text-gray-400 shrink-0" />
                <p className="text-sm text-gray-800">{form[key]}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}