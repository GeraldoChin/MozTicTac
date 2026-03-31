import { BLOG_POSTS, GREEN } from "../data/constants";
import { SectionHeader } from "./SectionHeader";

/**
 * BlogSection — 3-column blog post previews.
 */
export function BlogSection() {
  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeader title="From The Blog">
          <a href="#" className="text-sm font-semibold" style={{ color: GREEN, textDecoration: "none" }}>
            All Posts →
          </a>
        </SectionHeader>

        <div className="grid grid-cols-3 gap-6">
          {BLOG_POSTS.map((post, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="rounded overflow-hidden mb-3" style={{ aspectRatio: "16/9" }}>
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: GREEN }}>
                {post.cat}
              </p>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5 group-hover:text-green-600 transition leading-snug">
                {post.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">{post.excerpt}</p>
              <p className="text-[11px] text-gray-400">{post.date}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}