/**
 * SectionHeader — section title with optional right-side slot.
 *
 * Props:
 *   title    {string}    — section heading text
 *   children {ReactNode} — content rendered to the right of the title
 */
export function SectionHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}