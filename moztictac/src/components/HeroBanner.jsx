import { useEffect, useRef, useState } from "react";

/**
 * HeroBanner — full-width hero section, pure Tailwind CSS.
 * Props:
 *   onShopNow {function} — called when "Comprar Agora" is clicked
 */
export function HeroBanner({ onShopNow }) {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const parallaxX = (mousePos.x - 0.5) * 18;
  const parallaxY = (mousePos.y - 0.5) * 10;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen overflow-hidden bg-[#fafaf7] font-sans"
    >
      {/* Ambient blobs */}
      <div className="absolute top-[-80px] left-[12%] w-80 h-80 rounded-full bg-[#1db954] opacity-[0.07] blur-[60px] pointer-events-none z-[1]" />
      <div className="absolute bottom-[-40px] left-[30%] w-48 h-48 rounded-full bg-[#2563eb] opacity-[0.07] blur-[50px] pointer-events-none z-[1]" />

      {/* Background image with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=88"
          alt="MozTicTac Collections"
          className="w-full h-full object-cover object-[center_30%] scale-[1.08] saturate-[1.05] transition-transform duration-100 ease-out"
          style={{
            transform: `scale(1.08) translate(${parallaxX * -0.4}px, ${parallaxY * -0.3}px)`,
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, #fafaf7 0%, rgba(250,250,247,0.97) 25%, rgba(250,250,247,0.88) 42%, rgba(250,250,247,0.45) 68%, rgba(250,250,247,0.10) 100%)",
        }}
      />

      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-r z-[2]"
        style={{ background: "linear-gradient(to bottom, #1db954, #2563eb)" }}
      />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sale tag — top center */}
      <div
        className={`absolute top-7 left-1/2 -translate-x-1/2 z-[6] px-[18px] py-2 rounded-full text-white font-extrabold text-[12px] uppercase tracking-[0.06em] shadow-lg transition-opacity duration-500 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(135deg, #f97316, #ef4444)",
          boxShadow: "0 4px 16px rgba(249,115,22,0.40)",
          transitionDelay: "0.9s",
        }}
      >
        ✦ Summer Sale — Até 65% Off
      </div>

      {/* Main content */}
      <div className="relative z-[5] h-full max-w-[1280px] mx-auto px-12 flex flex-col justify-center items-start box-border">
        <div className="max-w-[480px] text-left">

          {/* Live badge */}
          <div className="flex justify-start mb-[18px]">
            <div className="inline-flex items-center gap-1.5 bg-[rgba(29,185,84,0.10)] border border-[rgba(29,185,84,0.25)] rounded-full py-[5px] pr-[14px] pl-2 backdrop-blur-sm">
              <span
                className="w-[7px] h-[7px] rounded-full bg-[#1db954] flex-shrink-0"
                style={{ boxShadow: "0 0 0 3px rgba(29,185,84,0.2)", animation: "pulse-dot 2s ease-in-out infinite" }}
              />
              <span className="text-[11.5px] font-medium text-green-800 uppercase tracking-[0.04em]">
                Marketplace Moçambicano
              </span>
            </div>
          </div>

          {/* Eyebrow */}
          <p
            className={`font-light italic text-[15px] text-[#1db954] uppercase tracking-[0.12em] mb-[10px] transition-all duration-[550ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ transitionDelay: "0.1s" }}
          >
            Colecções de Verão
          </p>

          {/* Main heading */}
          <h1
            className={`font-black text-[clamp(28px,4.5vw,58px)] leading-[0.95] text-[#0f1a10] tracking-[-0.03em] mb-2 transition-all duration-[600ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.2s" }}
          >
            COMPRA.{" "}
            <span className="text-[#1db954] relative inline-block">
              VENDE.
              <span
                className="absolute left-0 bottom-[2px] right-0 h-[3px] rounded-sm transition-transform duration-[600ms] origin-left"
                style={{
                  background: "linear-gradient(to right, #1db954, #2563eb)",
                  transform: mounted ? "scaleX(1)" : "scaleX(0)",
                  transitionDelay: "0.75s",
                }}
              />
            </span>{" "}
            CRESCE.
          </h1>

          {/* Subheading */}
          <p
            className={`font-bold text-[clamp(15px,2vw,22px)] text-gray-700 tracking-[-0.01em] mb-1.5 transition-all duration-[600ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ transitionDelay: "0.3s" }}
          >
            Tudo numa única plataforma
          </p>

          {/* Description */}
          <p
            className={`text-[clamp(12px,1.1vw,14px)] font-normal text-gray-500 leading-relaxed max-w-[360px] mb-6 transition-all duration-[600ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            Produtos físicos, serviços e programa de afiliados — com pagamento via
            M-Pesa, E-Mola e mKesh, em Meticais.
          </p>

          {/* CTAs */}
          <div
            className={`flex gap-3 items-center flex-wrap mb-8 transition-all duration-[600ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ transitionDelay: "0.5s" }}
          >
            <button
              onClick={onShopNow}
              className="inline-flex items-center gap-2 bg-[#1db954] text-white font-bold text-[14px] tracking-[0.01em] px-7 py-[13px] rounded-xl border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#17a348] active:translate-y-0"
              style={{ boxShadow: "0 4px 20px rgba(29,185,84,0.30), 0 1px 3px rgba(29,185,84,0.15)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Comprar Agora
            </button>
            <button className="inline-flex items-center gap-2 bg-transparent text-gray-700 font-semibold text-[14px] px-[22px] py-3 rounded-xl border border-[1.5px] border-gray-300 cursor-pointer transition-all duration-200 hover:border-[#1db954] hover:text-[#1db954] hover:bg-[rgba(29,185,84,0.04)] hover:-translate-y-0.5">
              Saber Mais
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div
            className={`flex gap-7 transition-all duration-[600ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2.5"
            }`}
            style={{ transitionDelay: "0.65s" }}
          >
            <div className="flex flex-col gap-[1px]">
              <span className="font-extrabold text-[20px] text-gray-900 leading-none">10 Prov.</span>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.03em]">Cobertura Nacional</span>
            </div>
            <div className="w-px bg-gray-200 self-stretch my-[2px]" />
            <div className="flex flex-col gap-[1px]">
              <span className="font-extrabold text-[20px] text-gray-900 leading-none">3-em-1</span>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.03em]">Papéis Dinâmicos</span>
            </div>
            <div className="w-px bg-gray-200 self-stretch my-[2px]" />
            <div className="flex flex-col gap-[1px]">
              <span className="font-extrabold text-[20px] text-gray-900 leading-none">100% MZN</span>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.03em]">Pagamento Local</span>
            </div>
          </div>

        </div>
      </div>

      {/* Floating pill — bottom center */}
      <div
        className={`absolute bottom-9 left-1/2 z-[5] flex items-center gap-2.5 bg-white/90 backdrop-blur-[14px] border border-white rounded-full py-2.5 pr-5 pl-2.5 shadow-xl whitespace-nowrap transition-all duration-[600ms] sm:flex hidden ${
          mounted ? "opacity-100 -translate-x-1/2 translate-y-0" : "opacity-0 -translate-x-1/2 translate-y-2"
        }`}
        style={{ transitionDelay: "0.8s" }}
      >
        <div
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[15px] flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #1db954, #2563eb)" }}
        >
          🛍️
        </div>
        <div>
          <div className="font-bold text-[13px] text-gray-900">Venda Segura</div>
          <div className="text-[11px] text-gray-500">Pagamento em escrow protegido</div>
        </div>
      </div>

      {/* Keyframe for badge dot pulse — injected minimally */}
      <style>{`@keyframes pulse-dot{0%,100%{box-shadow:0 0 0 3px rgba(29,185,84,0.2)}50%{box-shadow:0 0 0 6px rgba(29,185,84,0.08)}}`}</style>
    </section>
  );
}