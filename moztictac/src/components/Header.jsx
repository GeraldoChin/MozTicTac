import { CATEGORIES, GREEN } from "../data/constants";

/**
 * Header — logo, search bar with category filter, and icon actions.
 *
 * Props:
 *   cartCount {number}   — badge count shown on Cart icon
 *   wishCount {number}   — badge count shown on Wishlist icon
 *   searchVal {string}   — controlled search input value
 *   onSearchChange {fn}  — called with new search string
 *   onAddToCart   {fn}   — increments cart (search button also triggers it)
 *   onAddToWish   {fn}   — increments wishlist
 */
export function Header({
  cartCount,
  wishCount,
  searchVal,
  onSearchChange,
  onAddToCart,
  onAddToWish,
}) {
  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">

        {/* Logo */}
        <div className="text-[22px] font-black text-gray-900 tracking-tight shrink-0 cursor-pointer select-none">
          PressMart<span style={{ color: GREEN }}>.</span>
        </div>

        {/* Search */}
        <div className="flex flex-1 max-w-lg border border-gray-300 rounded overflow-hidden">
          <input
            type="text"
            placeholder="Search for products, categories, sku..."
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 px-3 py-2 text-sm outline-none text-gray-700 placeholder-gray-400 border-none"
          />
          <select className="border-l border-gray-300 px-2 text-xs text-gray-600 bg-white outline-none cursor-pointer">
            <option>All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.label}>{c.label}</option>
            ))}
          </select>
          <button
            onClick={onAddToCart}
            className="px-4 text-white border-none cursor-pointer transition-colors"
            style={{ background: GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#009a5a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 ml-auto">

          {/* My Account */}
          <button className="flex flex-col items-center text-xs text-gray-600 hover:text-green-600 transition gap-0.5 border-none bg-transparent cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            My Account
          </button>

          {/* Wishlist */}
          <button
            onClick={onAddToWish}
            className="relative flex flex-col items-center text-xs text-gray-600 hover:text-green-600 transition gap-0.5 border-none bg-transparent cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            Wishlist
            {wishCount > 0 && (
              <span
                className="absolute -top-1 -right-3 w-4 h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white"
                style={{ background: GREEN }}
              >
                {wishCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={onAddToCart}
            className="relative flex flex-col items-center text-xs text-gray-600 hover:text-green-600 transition gap-0.5 border-none bg-transparent cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            Cart
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-3 w-4 h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white"
                style={{ background: GREEN }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}