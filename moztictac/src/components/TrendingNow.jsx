import { TRENDING, GREEN } from "../data/constants";
import { Stars } from "./Stars";
import { SectionHeader } from "./SectionHeader";

/**
 * TrendingNow — grade de 4 colunas com produtos em tendência.
 */
export function TrendingNow() {
  return (
    <section className="py-10 bg-gray-50 border-t border-gray-100">
      <div className="max-w-[1450px] mx-auto px-4">
        <SectionHeader title="Em Alta Agora">
          <a
            href="/trending"
            className="text-sm font-semibold"
            style={{ color: GREEN, textDecoration: "none" }}
          >
            Ver Todos →
          </a>
        </SectionHeader>

        <div className="grid grid-cols-4 gap-4">
          {TRENDING.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-3">
                <p className="text-[10px] text-gray-400">{p.cat}</p>

                <p className="text-[13px] font-semibold text-gray-800 mt-0.5 overflow-hidden whitespace-nowrap text-ellipsis">
                  {p.name}
                </p>

                <Stars count={p.rating} />

                <p className="text-[13px] font-bold text-gray-900 mt-1">
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
