import { useState } from "react";
import { Stars } from "./Stars";
import { GREEN } from "../data/constants";

/**
 * ProductCard — displays a single product with hover effects.
 *
 * Props:
 *   p           {object}   — product data object
 *   onAddToCart {function} — called when the cart button is clicked
 */
export function ProductCard({ p, onAddToCart }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="bg-white border border-gray-100 rounded overflow-hidden relative"
      style={{
        boxShadow: hovered ? "0 6px 24px rgba(0,0,0,.10)" : "none",
        transition: "box-shadow .2s",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge */}
      {p.badge && (
        <span
          className="absolute top-2 left-2 z-10 text-white text-[10px] font-bold px-2 py-0.5 rounded"
          style={{ background: GREEN }}
        >
          {p.badge}
        </span>
      )}

      {/* Tag */}
      {p.tag && (
        <span className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
          {p.tag}
        </span>
      )}

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1 / 1" }}>
        <img
          src={p.img}
          alt={p.name}
          className="w-full h-full object-cover"
          style={{
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform .5s",
          }}
        />

        {/* Overlay actions */}
        <div
          className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-2"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(10px)",
            transition: "opacity .3s, transform .3s",
            background: "linear-gradient(to top, rgba(0,0,0,.28), transparent)",
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(); }}
            className="text-white text-[11px] font-bold px-3 py-1.5 rounded whitespace-nowrap"
            style={{ background: GREEN }}
          >
            {p.btn || "Add to cart"}
          </button>

          {/* Wishlist */}
          <button className="bg-white text-gray-500 hover:text-red-500 p-1.5 rounded transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Quick view */}
          <button className="bg-white text-gray-500 hover:text-blue-500 p-1.5 rounded transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] text-gray-400 mb-0.5">{p.cat}</p>
        <p className="text-[13px] font-semibold text-gray-800 leading-snug mb-1.5 overflow-hidden whitespace-nowrap text-ellipsis">
          {p.name}
        </p>
        <div className="flex items-center gap-1 mb-1.5">
          <Stars count={p.rating} />
          <span className="text-[10px] text-gray-400">({p.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-gray-900">{p.price}</span>
          {p.oldPrice && (
            <span className="text-xs text-gray-400 line-through">{p.oldPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}