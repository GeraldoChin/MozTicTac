import { BLOG_POSTS, GREEN } from "../data/constants";
import { SectionHeader } from "./SectionHeader";

/**
 * BlogSection — pré-visualização de posts do blog.
 *
 * Breakpoints:
 *   mobile  (< sm)  → 1 coluna  (full width, fácil de ler)
 *   sm      (640px) → 2 colunas
 *   lg      (1024px)→ 3 colunas
 */
export function BlogSection() {
  return (
    <section className="py-8 sm:py-10 bg-white border-t border-gray-100">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6">

        {/* Cabeçalho */}
        <SectionHeader title="Do Blog">
          <a
            href="/blog"
            className="text-xs sm:text-sm font-semibold whitespace-nowrap"
            style={{ color: GREEN, textDecoration: "none" }}
          >
            Todos os Posts →
          </a>
        </SectionHeader>

        {/* Grid: 1 → 2 → 3 colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {BLOG_POSTS.map((post, i) => (
            <div key={i} className="group cursor-pointer">

              {/* Imagem */}
              <div
                className=" overflow-hidden mb-3"
                style={{ aspectRatio: "16/9" }}
              >
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Categoria */}
              <p
                className="text-[11px] font-bold uppercase tracking-wide mb-1"
                style={{ color: GREEN }}
              >
                {post.cat}
              </p>

              {/* Título — 2 linhas máx em mobile, 3 em desktop */}
              <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 mb-1.5 group-hover:text-green-600 transition-colors leading-snug line-clamp-2 sm:line-clamp-3">
                {post.title}
              </h3>

              {/* Excerpt — oculto em mobile para poupar espaço */}
              <p className="hidden sm:block text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">
                {post.excerpt}
              </p>

              {/* Data */}
              <p className="text-[11px] text-gray-400">
                {post.date}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}