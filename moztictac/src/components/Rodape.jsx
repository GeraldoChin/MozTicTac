import {
  Bird,
  MessageCircle,
  MapPin,
  Play,
  Camera,
} from "lucide-react";

export default function Rodape() {
  const GREEN = "#22c55e";

  const cols = [
    {
      title: "Comprar",
      links: [
        "Todos os Produtos",
        "Promoções",
        "Novidades",
        "Mais Vendidos",
      ],
    },
    {
      title: "Vender",
      links: [
        "Criar Loja",
        "Afiliados",
        "Publicar Anúncio",
        "Painel Vendedor",
      ],
    },
    {
      title: "Suporte",
      links: [
        "Central de Ajuda",
        "Política de Devoluções",
        "Contacto",
        "Segurança",
      ],
    },
  ];

  const socials = [
    { icon: <Bird size={15} />, label: "Twitter" },
    { icon: <Camera size={15} />, label: "Instagram" },
    { icon: <MessageCircle size={15} />, label: "WhatsApp" },
    { icon: <Play size={15} />, label: "YouTube" },
  ];

  return (
    <footer
      className="bg-gray-900 text-gray-400 pt-14"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div
              className="text-xl font-black mb-3"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: GREEN,
              }}
            >
              Moz<span className="text-white">TicTac</span>
            </div>

            <p className="text-sm leading-relaxed text-gray-500 max-w-[220px]">
              O marketplace de confiança de Moçambique.
              Compra, vende e conecta com facilidade.
            </p>

            <div className="flex gap-2 mt-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  title={s.label}
                  className="w-8 h-8 rounded-lg border border-gray-800 bg-gray-900 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-500 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <p
                className="text-[11px] font-black uppercase tracking-widest text-white mb-4"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {col.title}
              </p>

              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-green-500 transition-colors flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-700 inline-block" />
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-600">
              © 2026 MozTicTac. Todos os direitos reservados.
            </p>

            <p
              className="text-xs text-green-500 font-bold mt-1 flex items-center gap-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <MapPin size={11} />
              Feito em Moçambique
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {["M-Pesa", "E-Mola", "mKesh", "Visa", "Mastercard"].map(
              (p) => (
                <span
                  key={p}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-md border border-gray-800 text-gray-600 bg-gray-950 hover:border-green-900 hover:text-green-500 transition-all cursor-default"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {p}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}