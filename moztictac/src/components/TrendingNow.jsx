import { TRENDING, GREEN } from "../data/constants";
import { Stars } from "./Stars";
import { SectionHeader } from "./SectionHeader";

/**
 * TrendingNow — grade responsiva de produtos em tendência.
 *
 * Breakpoints:
 *   mobile  (< sm)  → 2 colunas
 *   sm      (640px) → 2 colunas
 *   md      (768px) → 3 colunas
 *   lg      (1024px)→ 4 colunas
 */
export function TrendingNow() {
  return (
    <section className="py-8 sm:py-10 bg-gray-50 border-t border-gray-100">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6">

        {/* Cabeçalho responsivo */}
        <SectionHeader title="Em Alta Agora">
          <a
            href="/trending"
            className="text-xs sm:text-sm font-semibold whitespace-nowrap"
            style={{ color: GREEN, textDecoration: "none" }}
          >
            Ver Todos →
          </a>
        </SectionHeader>

        {/* Grid: 2 → 3 → 4 colunas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {TRENDING.map((p, i) => (
            <div
              key={i}
              className="bg-white  border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Imagem */}
              <div className="overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="p-2.5 sm:p-3">
                {/* Categoria */}
                <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                  {p.cat}
                </p>

                {/* Nome — trunca numa linha */}
                <p className="text-[12px] sm:text-[13px] font-semibold text-gray-800 mt-0.5 truncate">
                  {p.name}
                </p>

                {/* Stars — esconde em ecrãs muito pequenos */}
                <div className="hidden xs:block sm:block">
                  <Stars count={p.rating} />
                </div>

                {/* Preço */}
                <p className="text-[12px] sm:text-[13px] font-bold text-gray-900 mt-1">
                  {p.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}