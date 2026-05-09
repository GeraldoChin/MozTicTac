import { useState } from "react";
import rodape from "./Rodape";

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
    <div className="bg-white border border-gray-100 rounded-2xl p-10"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <div className="grid lg:grid-cols-2 gap-10 items-center">

        {/* Left */}
        <div>
          <p className="text-[11px] font-black tracking-widest uppercase mb-3 text-gray-400">
            🇲🇿 Comunidade MozTicTac
          </p>
          <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ letterSpacing: "-0.5px" }}>
            Recebe as melhores<br />
            <span style={{ color: "#00b96b" }}>ofertas em primeira mão</span>
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">
            Junta-te a +12 000 compradores que nunca perdem uma promoção.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#e11d48","#7c3aed","#0369a1","#15803d"].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: c }}>
                  {["AM","JM","BN","CL"][i]}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              <span className="text-gray-700 font-bold">247 pessoas</span> subscreveram esta semana
            </p>
          </div>
        </div>

        {/* Right */}
        <div>
          {sent ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: "#e6f9f0" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b96b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-800">Subscrito com sucesso!</p>
              <p className="text-xs text-gray-400 mt-1">Bem-vindo à comunidade 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="email"
                placeholder="O teu email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 outline-none border border-gray-200 transition-all"
                style={{ background: "#f9fafb", fontFamily: "Manrope, sans-serif" }}
                onFocus={e => e.currentTarget.style.borderColor = "#00b96b"}
                onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"}
              />
              <button onClick={submit}
                className="w-full py-3 rounded-xl text-sm font-black text-white border-none cursor-pointer transition-all"
                style={{ background: "#00b96b" }}
                onMouseEnter={e => e.currentTarget.style.background = "#009a5a"}
                onMouseLeave={e => e.currentTarget.style.background = "#00b96b"}>
                Activar Alertas Grátis →
              </button>
              <p className="text-[10px] text-gray-400 text-center">
                Sem spam · Cancela quando quiseres · 100% grátis
              </p>
            </div>
          )}
        </div>

      </div>
  
    </div>
  );
}