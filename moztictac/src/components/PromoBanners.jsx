import { PROMOS } from "../data/constants";

/**
 * PromoBanners — three side-by-side promotional image banners.
 */
export function PromoBanners() {
  return (
    <section className="py-6 bg-gray-50">
      <div className="max-w-[1450px] mx-auto px-4">
        <div className="grid grid-cols-3 gap-4">
          {PROMOS.map((promo, i) => (
            <div
              key={i}
              className="relative rounded overflow-hidden group cursor-pointer"
              style={{ height: 176 }}
            >
              <img
                src={promo.img}
                alt={promo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                style={{ filter: "brightness(.68)" }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to right, rgba(0,0,0,.62), transparent)" }}
              />
              <div className="absolute inset-0 flex flex-col justify-center px-6">
                <h3 className="text-white text-xl font-black leading-tight">{promo.title}</h3>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,.8)" }}>{promo.sub}</p>
                <a href="#" className="mt-3 text-white text-xs font-bold flex items-center gap-1" style={{ textDecoration: "none" }}>
                  Shop Now ›
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}