import { useState, useRef } from "react";

const CATEGORIES = [
  { label: "Todos",        img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=120&q=80" },
  { label: "Roupa",        img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=120&q=80" },
  { label: "Celulares",    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&q=80" },
  { label: "Cabelos",      img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=120&q=80" },
  { label: "Sapatos",      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80" },
  { label: "Electrónicos", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=120&q=80" },
  { label: "Acessórios",   img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=120&q=80" },
  { label: "Alimentos",    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&q=80" },
  { label: "Serviços",     img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=120&q=80" },
  { label: "Outros",       img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80" },
];

const VERDE = "#00b96b";

export function CategoryBar({ activeCategory = "Todos", onSelect }) {
  const [active, setActive] = useState(activeCategory);
  const scrollRef  = useRef(null);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollLeft = useRef(0);

  const handleSelect = (label) => {
    if (isDragging.current) return;
    setActive(label);
    onSelect?.(label);
  };

  const onMouseDown = (e) => {
    isDragging.current = false;
    startX.current    = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
  };
  const onMouseMove = (e) => {
    const walk = e.pageX - scrollRef.current.offsetLeft - startX.current;
    if (Math.abs(walk) > 4) isDragging.current = true;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const onMouseUp = () => {
    scrollRef.current.style.cursor = "grab";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup",   onMouseUp);
    setTimeout(() => { isDragging.current = false; }, 50);
  };

  const Item = ({ c }) => {
    const isActive = active === c.label;
    return (
      <button
        onClick={() => handleSelect(c.label)}
        className="flex flex-col items-center gap-1.5 border-none bg-transparent cursor-pointer group shrink-0"
        style={{ minWidth: 64 }}
      >
        <div className="relative" style={{ width: isActive ? 58 : 54, height: isActive ? 58 : 54, transition: "all 0.25s ease" }}>
          {isActive && (
            <div style={{
              position: "absolute", inset: -3, borderRadius: "50%",
              border: `2.5px solid ${VERDE}`,
              boxShadow: `0 0 0 2px ${VERDE}25`,
            }} />
          )}
          <div
            className="w-full h-full rounded-full overflow-hidden"
            style={{
              border: isActive ? `2px solid ${VERDE}` : "2px solid #e5e7eb",
              transform: isActive ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.25s ease, border-color 0.2s",
            }}
          >
            <img
              src={c.img} alt={c.label} draggable={false}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              style={{ transform: isActive ? "scale(1.12)" : undefined }}
            />
          </div>
          {isActive && (
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `${VERDE}18` }} />
          )}
        </div>

        <span style={{
          fontSize: 11, fontWeight: isActive ? 700 : 500,
          color: isActive ? VERDE : "#6b7280",
          transition: "color 0.2s",
          whiteSpace: "nowrap",
        }}>
          {c.label}
        </span>

        <div style={{
          width: 4, height: 4, borderRadius: "50%",
          background: isActive ? VERDE : "transparent",
          transition: "background 0.2s",
        }} />
      </button>
    );
  };

  return (
    <section className="bg-white border-b border-gray-100">

      {/* ── Desktop: distribuído uniformemente, sem scroll ── */}
      <div className="hidden md:flex max-w-[1450px] mx-auto px-6 py-5 justify-between items-start">
        {CATEGORIES.map((c) => <Item key={c.label} c={c} />)}
      </div>

      {/* ── Mobile: scroll horizontal ── */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        className="md:hidden flex gap-3 overflow-x-auto py-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", cursor: "grab", WebkitOverflowScrolling: "touch" }}
      >
        {CATEGORIES.map((c) => <Item key={c.label} c={c} />)}
      </div>

      <style>{`
        section div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}