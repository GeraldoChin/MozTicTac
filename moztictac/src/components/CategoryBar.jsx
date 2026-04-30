import { useState } from "react";

/**
 * Categorias definidas no documento MozTicTac:
 * Todos, Roupa, Celulares, Cabelos, Sapatos, Electrónicos,
 * Acessórios, Alimentos, Serviços, Outros
 */
const CATEGORIES = [
  {
    label: "Todos",
    img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=120&q=80",
  },
  {
    label: "Roupa",
    img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=120&q=80",
  },
  {
    label: "Celulares",
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&q=80",
  },
  {
    label: "Cabelos",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=120&q=80",
  },
  {
    label: "Sapatos",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80",
  },
  {
    label: "Electrónicos",
    img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=120&q=80",
  },
  {
    label: "Acessórios",
    img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=120&q=80",
  },
  {
    label: "Alimentos",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&q=80",
  },
  {
    label: "Serviços",
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=120&q=80",
  },
  {
    label: "Outros",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80",
  },
];

/**
 * CategoryBar — horizontal row of circular category icons.
 *
 * Props:
 *   activeCategory {string}   — currently selected label
 *   onSelect       {function} — called with label on click
 */
export function CategoryBar({ activeCategory = "Todos", onSelect }) {
  const [active, setActive] = useState(activeCategory);

  const handleSelect = (label) => {
    setActive(label);
    onSelect?.(label);
  };

  return (
    <section className="bg-white py-7 border-b border-gray-100">
      <div className="max-w-[1450px] mx-auto px-4">
        <div className="flex justify-between gap-2">
          {CATEGORIES.map((c) => {
            const isActive = active === c.label;
            return (
              <button
                key={c.label}
                onClick={() => handleSelect(c.label)}
                className="flex flex-col items-center gap-2 shrink-0 border-none bg-transparent cursor-pointer group"
              >
                <div
                  className={[
                    "w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300",
                    isActive
                      ? "border-green-500 scale-105"
                      : "border-gray-200 group-hover:border-green-500",
                  ].join(" ")}
                >
                  <img
                    src={c.img}
                    alt={c.label}
                    className={[
                      "w-full h-full object-cover transition-transform duration-300",
                      isActive ? "scale-110" : "group-hover:scale-110",
                    ].join(" ")}
                  />
                </div>
                <span
                  className={[
                    "text-[11px] transition text-center font-medium",
                    isActive
                      ? "text-green-600 font-semibold"
                      : "text-gray-600 group-hover:text-green-600",
                  ].join(" ")}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}