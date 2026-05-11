import { useState } from "react";
import { Gift, Lock, Mail, CheckCircle, Bell } from "lucide-react";

const G  = "#00b96b";
const GD = "#009a5a";
const GL = "#e6f9f0";

export function Newsletter2() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!email.trim()) return;
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section className="bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-whiteborder border-gray-100 overflow-hidden shadow-sm grid lg:grid-cols-2">

          {/* ── Left ── */}
          <div className="p-10 border-b lg:border-b-0 lg:border-r border-gray-100">

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5"
              style={{ background: GL, border: `1px solid ${G}33` }}>
              <Gift size={11} color={G} />
              <span className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: G, fontFamily: "Syne, sans-serif" }}>
                Comunidade MozTicTac
              </span>
            </div>

            {/* Título */}
            <h2 className="text-2xl font-black text-gray-900 leading-snug mb-3"
              style={{ letterSpacing: "-0.5px", fontFamily: "Syne, sans-serif" }}>
              Recebe as melhores<br />
              <span style={{ color: G }}>ofertas em primeira mão</span>
            </h2>

            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Junta-te a +12 000 compradores que nunca perdem uma promoção.
            </p>

            {/* Avatares */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {["#e11d48","#7c3aed","#0369a1","#15803d"].map((c, i) => (
                  <div key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white"
                    style={{ background: c, marginLeft: i === 0 ? 0 : -8 }}>
                    {["AM","JM","BN","CL"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                <span className="text-gray-800 font-bold">247 pessoas</span> esta semana
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-7 pt-6 border-t border-gray-100">
              {[
                { value: "+12k",  label: "Subscritores"         },
                { value: "20%",   label: "Desconto boas-vindas" },
                { value: "Diário",label: "Frequência"           },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-base font-black text-gray-900"
                    style={{ fontFamily: "Syne, sans-serif" }}>{value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right ── */}
          <div className="p-10 flex flex-col justify-center bg-gray-50/50">
            {sent ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: GL }}>
                  <CheckCircle size={26} color={G} />
                </div>
                <p className="text-base font-black text-gray-900 mb-1"
                  style={{ fontFamily: "Syne, sans-serif" }}>
                  Subscrito com sucesso!
                </p>
                <p className="text-sm text-gray-400">Bem-vindo à comunidade 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700 mb-4"
                  style={{ fontFamily: "Syne, sans-serif" }}>
                  Entra na lista e recebe o teu cupão de 20% agora
                </p>

                {/* Input */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-0.5 transition-all focus-within:border-green-400">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="O teu email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submit()}
                    className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-gray-800 placeholder-gray-400"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  />
                </div>

                {/* Botão */}
                <button onClick={submit}
                  className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 border-none cursor-pointer transition-all"
                  style={{ background: G, fontFamily: "Syne, sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.background = GD}
                  onMouseLeave={e => e.currentTarget.style.background = G}>
                  <Bell size={14} />
                  Activar Alertas Grátis →
                </button>

                {/* Trust */}
                <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-2">
                  <span className="flex items-center gap-1">
                    <Lock size={9} /> Sem spam
                  </span>
                  <span>·</span>
                  <span>Cancela quando quiseres</span>
                  <span>·</span>
                  <span>100% grátis</span>
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

export default Newsletter2;