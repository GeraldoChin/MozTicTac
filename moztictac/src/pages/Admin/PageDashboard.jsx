/**
 * MozTicTac — Admin Dashboard
 * React + Tailwind CSS v3
 *
 * 1. Adicionar ao index.html (no <head>):
 *    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
 *
 * 2. tailwind.config.js:
 *    theme: { extend: { fontFamily: { sans: ['DM Sans', 'sans-serif'], mono: ['DM Mono', 'monospace'] } } }
 *
 * 3. Usar: import Dashboard from './Dashboard'
 */

import { useState } from "react";

/* ═══════════════════════════════════════════
   DADOS ESTÁTICOS
═══════════════════════════════════════════ */
const KPI_DATA = [
  { label: "Total de Utilizadores", value: "12 480", trend: "+8.2%",  up: true,  icon: "👥", color: "#3b82f6",  spark: [80,95,88,102,99,115,108,120,125,130,128,145] },
  { label: "Receita Total (MZN)",   value: "2.4M",   trend: "+18.7%", up: true,  icon: "💰", color: "#10b981",  spark: [120,145,160,175,190,210,200,215,230,245,260,300] },
  { label: "Pedidos Hoje",          value: "314",    trend: "+3.2%",  up: true,  icon: "📦", color: "#3b82f6",  spark: [200,230,210,280,260,290,310,295,314,300,314,320] },
  { label: "Taxa de Conversão",     value: "3.8%",   trend: "+0.6%",  up: true,  icon: "📈", color: "#10b981",  spark: [3.0,3.1,3.3,3.2,3.5,3.4,3.6,3.7,3.8,3.7,3.8,3.9] },
  { label: "Vendedores Ativos",     value: "1 340",  trend: "+5.1%",  up: true,  icon: "🛍️", color: "#10b981",  spark: [900,950,1000,1050,1100,1150,1200,1250,1280,1300,1320,1340] },
  { label: "Afiliados",             value: "892",    trend: "+12.4%", up: true,  icon: "🔗", color: "#f59e0b",  spark: [500,550,580,620,660,700,730,770,800,830,860,892] },
  { label: "Comissões Pagas",       value: "148k",   trend: "-1.4%",  up: false, icon: "💳", color: "#f59e0b",  spark: [160,155,158,150,152,148,149,147,150,148,146,148] },
  { label: "Ticket Médio (MZN)",    value: "4 200",  trend: "+2.1%",  up: true,  icon: "🎫", color: "#3b82f6",  spark: [3800,3900,3950,4000,4050,4100,4080,4120,4150,4180,4190,4200] },
];

const REVENUE_DATA = [
  { m: "Jan", v: 120 }, { m: "Fev", v: 145 }, { m: "Mar", v: 160 },
  { m: "Abr", v: 175 }, { m: "Mai", v: 190 }, { m: "Jun", v: 210 },
  { m: "Jul", v: 200 }, { m: "Ago", v: 215 }, { m: "Set", v: 230 },
  { m: "Out", v: 245 }, { m: "Nov", v: 260 }, { m: "Dez", v: 300 },
];

const DONUT_DATA = [
  { label: "Compradores", value: 8248, pct: 66, color: "#3b82f6" },
  { label: "Vendedores",  value: 1340, pct: 11, color: "#10b981" },
  { label: "Afiliados",   value: 892,  pct: 7,  color: "#f59e0b" },
  { label: "Outros",      value: 2000, pct: 16, color: "#3f3f46" },
];

const PRODUCTS = [
  { name: "Ténis Nike Air Max 2024",   sales: 214, pct: 100, color: "#10b981" },
  { name: "Conjunto Capulana Bordada", sales: 189, pct: 88,  color: "#10b981" },
  { name: "Perfume Importado Chanel",  sales: 156, pct: 73,  color: "#3b82f6" },
  { name: "Auscultadores Sony WH",     sales: 134, pct: 63,  color: "#3b82f6" },
  { name: "Castanha de Caju 1kg",      sales: 120, pct: 56,  color: "#f59e0b" },
];

const AFFILIATES = [
  { initials: "JM", name: "João Matos",    sales: 312, commission: "18 400 MZN", badge: "Ouro",   bt: "gold"   },
  { initials: "AL", name: "Ana Lopes",     sales: 278, commission: "15 200 MZN", badge: "Ouro",   bt: "gold"   },
  { initials: "CN", name: "Carlos Nhaca",  sales: 201, commission: "11 800 MZN", badge: "Prata",  bt: "silver" },
  { initials: "FD", name: "Fátima Dique",  sales: 164, commission: "9 100 MZN",  badge: "Prata",  bt: "silver" },
  { initials: "PM", name: "Pedro Mabunda", sales: 98,  commission: "5 400 MZN",  badge: "Bronze", bt: "bronze" },
];

const ACTIVITY = [
  { icon: "📦", bg: "#f59e0b14", action: "Novo produto submetido",  user: "vendedor@mztictac.mz",  mod: "Produtos",   time: "14:32", badge: "Pendente",    bt: "warn"    },
  { icon: "💸", bg: "#f59e0b14", action: "Saque solicitado",         user: "afil@mztictac.mz",      mod: "Financeiro", time: "14:18", badge: "Pendente",    bt: "warn"    },
  { icon: "🔒", bg: "#ef444414", action: "Conta bloqueada",          user: "spam@test.com",          mod: "Segurança",  time: "13:55", badge: "Ação tomada", bt: "danger"  },
  { icon: "✅", bg: "#10b98114", action: "Pedido #4821 concluído",   user: "comprador@gmail.com",    mod: "Pedidos",    time: "13:40", badge: "Concluído",   bt: "success" },
  { icon: "🙋", bg: "#10b98114", action: "Novo afiliado registado",  user: "novo@mztictac.mz",       mod: "Afiliados",  time: "13:12", badge: "Ativo",       bt: "success" },
];

const NAV_GROUPS = [
  { section: "Principal", items: [
    { icon: "📊", label: "Dashboard" },
    { icon: "👥", label: "Utilizadores" },
    { icon: "🛍️", label: "Produtos", badge: "3" },
    { icon: "📦", label: "Pedidos" },
  ]},
  { section: "Financeiro", items: [
    { icon: "💰", label: "Receita" },
    { icon: "💸", label: "Saques", badge: "2" },
    { icon: "🔗", label: "Afiliados" },
    { icon: "💳", label: "Comissões" },
  ]},
  { section: "Sistema", items: [
    { icon: "🔒", label: "Segurança" },
    { icon: "📋", label: "Auditoria" },
    { icon: "⚙️", label: "Configurações" },
  ]},
];

const AVATAR_COLORS = [
  "bg-amber-500/15 text-amber-400",
  "bg-amber-500/15 text-amber-400",
  "bg-zinc-600/30 text-zinc-300",
  "bg-zinc-600/30 text-zinc-300",
  "bg-orange-700/15 text-orange-400",
];

const BADGE_STYLES = {
  gold:    "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  silver:  "bg-zinc-500/10 text-zinc-300 ring-1 ring-zinc-500/20",
  bronze:  "bg-orange-700/10 text-orange-400 ring-1 ring-orange-700/20",
  success: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  warn:    "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  danger:  "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
  info:    "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
};

/* ═══════════════════════════════════════════
   COMPONENTES PRIMITIVOS
═══════════════════════════════════════════ */

function Badge({ label, type = "info" }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${BADGE_STYLES[type]}`}>
      {label}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-[13px] font-semibold text-white tracking-tight">{children}</h3>
      {action && <div>{action}</div>}
    </div>
  );
}

function NavLabel({ children }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-700 px-3 pt-4 pb-1 select-none">
      {children}
    </p>
  );
}

function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left
        ${active
          ? "bg-emerald-500/10 text-emerald-400"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
        }`}
    >
      <span className="w-5 text-center text-[15px] leading-none select-none">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════
   SPARKLINE SVG
═══════════════════════════════════════════ */
function Sparkline({ data, color }) {
  const W = 80, H = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`
  );
  const line = pts.join(" ");
  const area = `0,${H} ${line} ${W},${H}`;
  const gid = `sg${color.replace("#", "")}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════ */
function KpiCard({ label, value, trend, up, icon, color, spark }) {
  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 cursor-default overflow-hidden">
      {/* subtle background glow */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}1a` }}
        >
          {icon}
        </div>
        <span className={`text-xs font-semibold font-mono flex items-center gap-0.5 ${up ? "text-emerald-400" : "text-red-400"}`}>
          {up ? "▲" : "▼"} {trend.replace(/[+-]/, "")}
        </span>
      </div>

      <div className="relative">
        <p className="text-2xl font-bold tracking-tight text-white leading-none">{value}</p>
        <p className="text-[11px] text-zinc-500 mt-1.5 font-medium leading-none">{label}</p>
      </div>

      <div className="relative">
        <Sparkline data={spark} color={color} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   REVENUE LINE CHART (SVG puro)
═══════════════════════════════════════════ */
function RevenueChart({ data }) {
  const W = 520, H = 130, PX = 20, PY = 12;
  const innerW = W - PX * 2;
  const innerH = H - PY * 2;
  const vals = data.map(d => d.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min;

  const pts = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * innerW,
    y: PY + innerH - ((d.v - min) / range) * innerH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    `M${pts[0].x.toFixed(1)},${PY + innerH} ` +
    pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") +
    ` L${pts[pts.length - 1].x.toFixed(1)},${PY + innerH} Z`;

  const yLines = [0, 0.5, 1].map(f => ({
    y: PY + innerH - f * innerH,
    label: Math.round(min + f * range) + "k",
  }));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ height: 130, overflow: "visible" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* horizontal grid */}
        {yLines.map((t, i) => (
          <line
            key={i}
            x1={PX} y1={t.y} x2={W - PX} y2={t.y}
            stroke="#27272a" strokeWidth="0.5" strokeDasharray="3 5"
          />
        ))}

        <path d={areaPath} fill="url(#revGrad)" />
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10b981" stroke="#09090b" strokeWidth="2" />
        ))}
      </svg>

      <div className="flex justify-between px-5 mt-2">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-zinc-600 font-mono">{d.m}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DONUT CHART (SVG puro)
═══════════════════════════════════════════ */
function DonutChart({ segments }) {
  const R = 50, CX = 68, CY = 68, STROKE = 18;
  const circ = 2 * Math.PI * R;
  const total = segments.reduce((s, d) => s + d.value, 0);
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={136} height={136} viewBox="0 0 136 136" className="flex-shrink-0">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#27272a" strokeWidth={STROKE} />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const el = (
            <circle
              key={i} cx={CX} cy={CY} r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={`${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`}
              strokeDashoffset={(-offset).toFixed(2)}
              style={{ transform: "rotate(-90deg)", transformOrigin: `${CX}px ${CY}px`, transition: "all 0.6s ease" }}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={CX} y={CY - 7} textAnchor="middle" fill="#f4f4f5" fontSize="17" fontWeight="700" fontFamily="DM Sans, sans-serif">12 480</text>
        <text x={CX} y={CY + 9} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="DM Sans, sans-serif">utilizadores</text>
      </svg>

      <div className="flex flex-col gap-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <div>
              <p className="text-[11px] text-zinc-300 font-medium leading-none">{seg.label}</p>
              <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{seg.pct}% · {seg.value.toLocaleString("pt-PT")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════ */
export default function Dashboard() {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div
      className="flex h-screen bg-zinc-950 overflow-hidden text-white"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >

      {/* ──────────── SIDEBAR ──────────── */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-zinc-800/60 overflow-y-auto">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-800/60">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0"
            style={{ boxShadow: "0 0 18px rgba(16,185,129,0.35)" }}>
            MT
          </div>
          <div>
            <p className="text-[13px] font-bold text-white tracking-tight leading-none">MozTicTac</p>
            <p className="text-[9px] text-zinc-600 mt-0.5">Painel Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.section}>
              <NavLabel>{group.section}</NavLabel>
              {group.items.map((item) => (
                <NavItem
                  key={item.label}
                  {...item}
                  active={activePage === item.label}
                  onClick={() => setActivePage(item.label)}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Profile */}
        <div className="px-3 py-4 border-t border-zinc-800/60">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-zinc-800/40 cursor-pointer transition-colors group">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px] font-bold text-emerald-400 flex-shrink-0">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-zinc-200 truncate leading-none">Super Admin</p>
              <p className="text-[10px] text-zinc-600 truncate mt-0.5">admin@mztictac.mz</p>
            </div>
            <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors text-xs">⋯</span>
          </div>
        </div>
      </aside>

      {/* ──────────── MAIN ──────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header sticky */}
        <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-sm z-10">
          <div>
            <h1 className="text-[18px] font-bold text-white tracking-tight leading-none">Dashboard Geral</h1>
            <p className="text-[12px] text-zinc-500 mt-1">Visão geral da plataforma em tempo real</p>
          </div>
          <div className="flex items-center gap-2.5">
            {/* live dot */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="text-[11px] font-medium text-emerald-400">Ao vivo</span>
            </div>
            <button className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 text-[12px] font-medium hover:border-zinc-600 hover:text-white transition-all">
              ⬇ Exportar
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-[12px] font-semibold hover:bg-emerald-400 transition-colors"
              style={{ boxShadow: "0 0 16px rgba(16,185,129,0.3)" }}
            >
              ↻ Atualizar
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {/* ── KPIs: 4 colunas × 2 linhas ── */}
          <div className="grid grid-cols-4 gap-4">
            {KPI_DATA.map((k, i) => <KpiCard key={i} {...k} />)}
          </div>

          {/* ── Receita + Donut ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Gráfico de receita */}
            <Card className="col-span-2 p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-[13px] font-semibold text-white tracking-tight">Receita Mensal</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">MZN (milhares) · 2024</p>
                </div>
                <div className="flex items-center gap-6">
                  {[
                    { l: "Total",       v: "2.4M",   c: "text-emerald-400" },
                    { l: "Média/mês",   v: "200k",   c: "text-white"       },
                    { l: "Crescimento", v: "+18.7%",  c: "text-emerald-400" },
                  ].map((s) => (
                    <div key={s.l} className="text-right">
                      <p className="text-[10px] text-zinc-500 font-medium leading-none">{s.l}</p>
                      <p className={`text-base font-bold tracking-tight mt-0.5 ${s.c}`}>{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <RevenueChart data={REVENUE_DATA} />
            </Card>

            {/* Donut */}
            <Card className="p-6">
              <CardTitle>Utilizadores por tipo</CardTitle>
              <DonutChart segments={DONUT_DATA} />
            </Card>
          </div>

          {/* ── Produtos + Afiliados ── */}
          <div className="grid grid-cols-5 gap-4">

            {/* Produtos */}
            <Card className="col-span-3 p-6">
              <CardTitle action={<span className="text-[10px] text-zinc-600 font-mono">últimos 30 dias</span>}>
                🔥 Produtos mais vendidos
              </CardTitle>
              <div className="space-y-4">
                {PRODUCTS.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-zinc-300 font-medium truncate max-w-[220px]">{p.name}</span>
                      <span className="text-[11px] font-semibold font-mono flex-shrink-0 ml-2" style={{ color: p.color }}>
                        {p.sales} vendas
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.pct}%`, background: p.color, transition: "width 0.8s ease" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Afiliados */}
            <Card className="col-span-2 p-6">
              <CardTitle action={
                <button className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">Ver todos →</button>
              }>
                ⭐ Top Afiliados
              </CardTitle>
              <div className="space-y-0.5">
                {AFFILIATES.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 rounded-xl px-2 -mx-2 transition-colors cursor-default"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${AVATAR_COLORS[i]}`}>
                      {a.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-zinc-200 truncate leading-none">{a.name}</p>
                      <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{a.sales} vendas</p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <p className="text-[11px] font-semibold text-zinc-300 font-mono">{a.commission}</p>
                      <Badge label={a.badge} type={a.bt} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Atividade Recente ── */}
          <Card className="p-6">
            <CardTitle action={
              <button className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">Ver tudo →</button>
            }>
              📋 Atividade Recente
            </CardTitle>
            <div className="space-y-0.5">
              {ACTIVITY.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 rounded-xl px-2 -mx-2 transition-colors cursor-default"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] flex-shrink-0"
                    style={{ background: a.bg }}
                  >
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-200 leading-none">{a.action}</p>
                    <p className="text-[11px] text-zinc-500 mt-1 truncate">
                      <span className="text-zinc-400">{a.user}</span>
                      <span className="text-zinc-700 mx-1.5">·</span>
                      {a.mod}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] text-zinc-600 font-mono tabular-nums">{a.time}</span>
                    <Badge label={a.badge} type={a.bt} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* breathing room */}
          <div className="h-4" />
        </div>
      </main>
    </div>
  );
}