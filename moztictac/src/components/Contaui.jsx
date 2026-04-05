import { VERDE, VERDE_ESCURO } from "../components/Contaconstantes";

export function Badge({ cor, texto }) {
  const cores = {
    verde:    { bg: "#e6f9f0", text: VERDE     },
    amarelo:  { bg: "#fff8e1", text: "#f59e0b" },
    azul:     { bg: "#e3f0ff", text: "#3b82f6" },
    cinza:    { bg: "#f3f4f6", text: "#6b7280" },
    vermelho: { bg: "#fef2f2", text: "#ef4444" },
  };
  const c = cores[cor] || cores.cinza;
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}>
      {texto}
    </span>
  );
}

export function BotaoVerde({ children, onClick, variante = "solid", tamanho = "md" }) {
  const pad = tamanho === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm";
  if (variante === "outline") {
    return (
      <button onClick={onClick}
        className={`${pad} font-semibold rounded border-2 cursor-pointer transition-colors`}
        style={{ borderColor: VERDE, color: VERDE, background: "white" }}
        onMouseEnter={e => { e.currentTarget.style.background = VERDE; e.currentTarget.style.color = "white"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = VERDE; }}>
        {children}
      </button>
    );
  }
  return (
    <button onClick={onClick}
      className={`${pad} font-semibold rounded text-white cursor-pointer transition-colors`}
      style={{ background: VERDE }}
      onMouseEnter={e => (e.currentTarget.style.background = VERDE_ESCURO)}
      onMouseLeave={e => (e.currentTarget.style.background = VERDE)}>
      {children}
    </button>
  );
}