import { NAV_LINKS, GREEN } from "../data/constants";

/**
 * Navbar — green navigation bar with category dropdown trigger and nav links.
 */
export function Navbar() {
  return (
    <nav className="text-white text-sm" style={{ background: GREEN }}>
      <div className="max-w-7xl mx-auto px-4 flex items-stretch">

        {/* Category button */}
        <button
          className="flex items-center gap-2 px-5 py-3 font-semibold text-sm shrink-0 border-none text-white cursor-pointer"
          style={{ background: "rgba(0,0,0,.12)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,.12)")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          Shopping By Categories ▾
        </button>

        {/* Nav links */}
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="flex items-center gap-1 px-4 py-3 font-medium text-white"
            style={{ textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {link}
            {link !== "Buy" && (
              <svg className="w-3 h-3 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </a>
        ))}
      </div>
    </nav>
  );
}