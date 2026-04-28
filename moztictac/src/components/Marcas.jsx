import { BRANDS } from "../data/constants";

/**
 * BrandsBar — barra de marcas com hover moderno
 */
export function BrandsBar() {
  return (
    <section className="py-10 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
          Principais Marcas
        </p>

        <div className="flex justify-center items-center gap-8 flex-wrap">
          {BRANDS.map((b) => (
            <span
              key={b}
              className="
                text-lg font-extrabold text-gray-300
                cursor-pointer
                transition-all duration-300 ease-in-out
                hover:text-green-500
                hover:scale-110
                hover:-translate-y-1
                hover:drop-shadow-md
              "
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
