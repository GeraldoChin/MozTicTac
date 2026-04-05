import { Lock, Laptop, Mail } from "lucide-react";
import { utilizador, VERDE } from "../components/Contaconstantes";
import { Badge, BotaoVerde } from "../components/Contaui";

const sessoes = [
  { dispositivo: "Chrome · Windows", local: "Maputo, MZ", actual: true,  data: "Agora"     },
  { dispositivo: "Chrome · Android", local: "Beira, MZ",  actual: false, data: "Há 2 dias" },
];

export function SecaoSeguranca() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Segurança da Conta</h2>

      {/* alterar senha */}
      <div className="p-5 bg-white border border-gray-100 rounded-xl space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={16} style={{ color: VERDE }} />
          <h3 className="text-sm font-bold text-gray-800">Alterar Palavra-passe</h3>
        </div>
        {["Palavra-passe actual", "Nova palavra-passe", "Confirmar nova palavra-passe"].map(label => (
          <div key={label}>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
            <input type="password" placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 transition-colors" />
          </div>
        ))}
        <BotaoVerde tamanho="sm">Actualizar Palavra-passe</BotaoVerde>
      </div>

      {/* sessões */}
      <div className="p-5 bg-white border border-gray-100 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Laptop size={16} style={{ color: VERDE }} />
          <h3 className="text-sm font-bold text-gray-800">Sessões Activas</h3>
        </div>
        {sessoes.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <Laptop size={16} className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-800">{s.dispositivo}</p>
                <p className="text-xs text-gray-400">{s.local} · {s.data}</p>
              </div>
            </div>
            {s.actual
              ? <Badge cor="verde" texto="Esta sessão" />
              : <button className="text-xs font-semibold text-red-500 cursor-pointer">Terminar</button>}
          </div>
        ))}
      </div>

      {/* OTP */}
      <div className="p-5 bg-white border border-gray-100 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={16} style={{ color: VERDE }} />
            <div>
              <p className="text-sm font-bold text-gray-800">Verificação por Email (OTP)</p>
              <p className="text-xs text-gray-500">Activo · {utilizador.email}</p>
            </div>
          </div>
          <Badge cor="verde" texto="Activo" />
        </div>
      </div>
    </div>
  );
}