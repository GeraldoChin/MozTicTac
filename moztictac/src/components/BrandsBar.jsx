import { BRANDS, GREEN } from "../data/constants";

/**
 * BrandsBar — horizontal row of brand name logos with hover highlight.
 */
export function BrandsBar() {
  return (
    <section className="py-8 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          Top Brands
        </p>
        <div className="flex justify-around items-center gap-4 flex-wrap">
          {BRANDS.map((b) => (
            <span
              key={b}
              className="text-xl font-black cursor-pointer transition-colors duration-200"
              style={{ color: "#d1d5db" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}