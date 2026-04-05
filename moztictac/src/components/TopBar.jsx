/**
 * TopBar — thin utility bar with contact info and language/currency selectors.
 */
export function TopBar() {
  return (
    <div className="bg-gray-100 border-b border-gray-200 py-1.5 text-xs text-gray-600">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex gap-5">
          <span>✉ support@moztictac.com</span>
          <span>📞 +258 844565456</span>
        </div>
        <div className="flex gap-5 items-center">
          <span>Welcome to Our Store!</span>
          <button className="hover:text-gray-900 transition bg-transparent border-none cursor-pointer text-gray-600 text-xs">
            English ▾
          </button>
          <button className="hover:text-gray-900 transition bg-transparent border-none cursor-pointer text-gray-600 text-xs">
             Mt (MZ) ▾
          </button>
        </div>
      </div>
    </div>
  );
}