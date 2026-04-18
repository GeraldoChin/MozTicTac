import { useState } from "react";

// ─── Ícones SVG inline ────────────────────────────────────────────────────────
const IcoLogin    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const IcoUser     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoBag      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IcoTag      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IcoLink     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
const IcoDeposit  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IcoWithdraw = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const IcoTransfer = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>;
const IcoChat     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IcoShield   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoFilter   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoSearch   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoChevD    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const IcoChevU    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>;
const IcoLock     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoMonitor  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IcoPhone    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IcoInfo     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoDown     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

// ─── Dados de histórico ───────────────────────────────────────────────────────
const HISTORICO = [
  { id: "H001", tipo: "login",      titulo: "Login realizado",                desc: "Sessão iniciada com sucesso",              resultado: "sucesso", data: "17 Abr 2025 · 08:14", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: null    },
  { id: "H002", tipo: "compra",     titulo: "Compra efectuada",               desc: "Relógio Premium Swiss — #4821",            resultado: "sucesso", data: "16 Abr 2025 · 20:10", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: -4200   },
  { id: "H003", tipo: "deposito",   titulo: "Depósito M-Pesa",                desc: "Saldo adicionado via M-Pesa",              resultado: "sucesso", data: "16 Abr 2025 · 18:55", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: +10000  },
  { id: "H004", tipo: "afiliado",   titulo: "Comissão de afiliado",           desc: "Tênis Nike Air Max — ref=ANA_L002",        resultado: "sucesso", data: "15 Abr 2025 · 16:32", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: +456    },
  { id: "H005", tipo: "venda",      titulo: "Venda confirmada",               desc: "Samsung A55 — João Cossa #4807",           resultado: "sucesso", data: "15 Abr 2025 · 14:00", ip: "196.46.12.12",  dispositivo: "Windows · Firefox",  valor: +25500  },
  { id: "H006", tipo: "perfil",     titulo: "Perfil actualizado",             desc: "Email alterado · Confirmação por senha",   resultado: "sucesso", data: "14 Abr 2025 · 11:20", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: null    },
  { id: "H007", tipo: "login",      titulo: "Tentativa de login falhada",     desc: "Senha incorrecta (tentativa 1/5)",         resultado: "falha",   data: "14 Abr 2025 · 09:03", ip: "102.89.34.11",  dispositivo: "iPhone · Safari",    valor: null    },
  { id: "H008", tipo: "levantamento", titulo: "Levantamento processado",     desc: "Saque via M-Pesa · 84 321 4567",           resultado: "sucesso", data: "13 Abr 2025 · 17:45", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: -4165   },
  { id: "H009", tipo: "chat",       titulo: "Conversa iniciada",              desc: "Chat com João Cossa — Pedido #4807",       resultado: "sucesso", data: "13 Abr 2025 · 15:10", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: null    },
  { id: "H010", tipo: "transferencia", titulo: "Transferência enviada",      desc: "Para: Fátima Bila · carteira interna",     resultado: "sucesso", data: "12 Abr 2025 · 10:05", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: -500    },
  { id: "H011", tipo: "compra",     titulo: "Compra cancelada",               desc: "Colchão King Size — reembolso pendente",  resultado: "falha",   data: "11 Abr 2025 · 08:50", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: null    },
  { id: "H012", tipo: "login",      titulo: "Login realizado",                desc: "Sessão iniciada com sucesso",              resultado: "sucesso", data: "10 Abr 2025 · 07:30", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: null    },
  { id: "H013", tipo: "afiliado",   titulo: "Novo link de afiliado criado",   desc: "Produto: Mochila Escolar ProMax",          resultado: "sucesso", data: "09 Abr 2025 · 19:15", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: null    },
  { id: "H014", tipo: "deposito",   titulo: "Depósito recusado",              desc: "Saldo insuficiente na conta M-Pesa",       resultado: "falha",   data: "08 Abr 2025 · 13:40", ip: "196.46.12.34",  dispositivo: "Android · Chrome",   valor: null    },
  { id: "H015", tipo: "venda",      titulo: "Venda em disputa",               desc: "Smartphone Samsung A54 — Hélio Filipe",   resultado: "falha",   data: "08 Abr 2025 · 08:00", ip: "196.46.12.34",  dispositivo: "Windows · Firefox",  valor: null    },
];

// ─── Config por tipo ──────────────────────────────────────────────────────────
const TIPO_CONFIG = {
  login:         { label: "Login",         Ico: IcoLogin,    bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-100"   },
  perfil:        { label: "Perfil",        Ico: IcoUser,     bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-100" },
  compra:        { label: "Compra",        Ico: IcoBag,      bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-100"  },
  venda:         { label: "Venda",         Ico: IcoTag,      bg: "bg-green-100",  text: "text-green-700",  border: "border-green-100"  },
  afiliado:      { label: "Afiliado",      Ico: IcoLink,     bg: "bg-cyan-100",   text: "text-cyan-700",   border: "border-cyan-100"   },
  deposito:      { label: "Depósito",      Ico: IcoDeposit,  bg: "bg-green-100",  text: "text-green-700",  border: "border-green-100"  },
  levantamento:  { label: "Levantamento",  Ico: IcoWithdraw, bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-100" },
  transferencia: { label: "Transferência", Ico: IcoTransfer, bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-100" },
  chat:          { label: "Chat",          Ico: IcoChat,     bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-100"   },
};

const FILTROS_TIPO = [
  { id: "todos",         label: "Todos"         },
  { id: "login",         label: "Logins"        },
  { id: "compra",        label: "Compras"       },
  { id: "venda",         label: "Vendas"        },
  { id: "afiliado",      label: "Afiliados"     },
  { id: "deposito",      label: "Depósitos"     },
  { id: "levantamento",  label: "Levantamentos" },
  { id: "transferencia", label: "Transferências"},
  { id: "perfil",        label: "Perfil"        },
  { id: "chat",          label: "Chat"          },
];

// ─── Componente de linha ──────────────────────────────────────────────────────
function LinhaHistorico({ item }) {
  const [aberto, setAberto] = useState(false);
  const cfg = TIPO_CONFIG[item.tipo] || TIPO_CONFIG.chat;
  const Ico = cfg.Ico;
  const isMobile = item.dispositivo.toLowerCase().includes("android") || item.dispositivo.toLowerCase().includes("iphone");

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${item.resultado === "falha" ? "border-red-100" : "border-gray-100"}`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setAberto(!aberto)}
      >
        {/* Ícone tipo */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
          <Ico />
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.titulo}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0
              ${item.resultado === "sucesso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {item.resultado === "sucesso" ? "✓" : "✗"} {item.resultado}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.desc}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400">{item.data}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              {isMobile ? <IcoPhone /> : <IcoMonitor />} {item.dispositivo.split(" · ")[0]}
            </span>
          </div>
        </div>

        {/* Valor (se houver) */}
        {item.valor !== null && (
          <div className="text-right flex-shrink-0 mr-1">
            <p className={`text-sm font-semibold font-mono ${item.valor > 0 ? "text-green-600" : "text-gray-700"}`}>
              {item.valor > 0 ? "+" : ""}{item.valor.toLocaleString("pt-MZ")} MZN
            </p>
          </div>
        )}

        {/* Toggle */}
        <span className="text-gray-300 flex-shrink-0">
          {aberto ? <IcoChevU /> : <IcoChevD />}
        </span>
      </div>

      {/* Detalhes expandidos */}
      {aberto && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Detalhes do evento</p>
            {[
              { label: "ID do evento",  val: item.id,         Ico: IcoInfo    },
              { label: "IP de origem",  val: item.ip,         Ico: IcoShield  },
              { label: "Dispositivo",   val: item.dispositivo,Ico: isMobile ? IcoPhone : IcoMonitor },
              { label: "Data e hora",   val: item.data,       Ico: null       },
            ].map(({ label, val, Ico: RowIco }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  {RowIco && <RowIco />} {label}
                </span>
                <span className="font-mono text-gray-700 font-medium">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2 p-2 bg-amber-50 rounded-lg">
            <IcoLock />
            <p className="text-xs text-amber-700">Este registo não pode ser alterado ou eliminado.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function SecaoHistorico() {
  const [filtroTipo,    setFiltroTipo]    = useState("todos");
  const [filtroResult,  setFiltroResult]  = useState("todos");
  const [busca,         setBusca]         = useState("");
  const [pagina,        setPagina]        = useState(1);
  const POR_PAGINA = 6;

  const filtrados = HISTORICO.filter(h => {
    const matchTipo   = filtroTipo   === "todos" || h.tipo      === filtroTipo;
    const matchResult = filtroResult === "todos" || h.resultado === filtroResult;
    const matchBusca  = busca === "" ||
      h.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      h.desc.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchResult && matchBusca;
  });

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginated    = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const totalSucessos = HISTORICO.filter(h => h.resultado === "sucesso").length;
  const totalFalhas   = HISTORICO.filter(h => h.resultado === "falha").length;
  const totalFinanceiro = HISTORICO.filter(h => h.valor !== null).reduce((acc, h) => acc + h.valor, 0);

  const handleFiltroTipo = (v) => { setFiltroTipo(v); setPagina(1); };
  const handleFiltroResult = (v) => { setFiltroResult(v); setPagina(1); };
  const handleBusca = (v) => { setBusca(v); setPagina(1); };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <p className="text-base font-semibold text-gray-900">Histórico de Actividade</p>
          <p className="text-xs text-gray-400">{HISTORICO.length} eventos registados</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 bg-transparent cursor-pointer hover:border-gray-300 transition-colors">
          <IcoDown /> Exportar CSV
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total eventos</p>
          <p className="text-xl font-semibold font-mono text-gray-900">{HISTORICO.length}</p>
          <p className="text-xs text-gray-400 mt-1">registos</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Sucesso / Falha</p>
          <p className="text-xl font-semibold font-mono text-gray-900">{totalSucessos}<span className="text-sm text-red-400 font-mono"> / {totalFalhas}</span></p>
          <p className="text-xs text-gray-400 mt-1">operações</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Saldo net</p>
          <p className={`text-xl font-semibold font-mono ${totalFinanceiro >= 0 ? "text-green-600" : "text-red-500"}`}>
            {totalFinanceiro >= 0 ? "+" : ""}{(totalFinanceiro / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-gray-400 mt-1">MZN</p>
        </div>
      </div>

      {/* Aviso auditoria */}
      <div className="flex gap-2 items-start p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <div className="flex-shrink-0 mt-0.5 text-amber-600"><IcoLock /></div>
        <p className="text-xs text-amber-800">
          O histórico é <strong>imutável</strong> — não pode ser editado ou apagado pelo utilizador.
          Apenas administradores têm acesso à auditoria completa com dados de IP.
        </p>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <span className="text-gray-400"><IcoSearch /></span>
        <input
          value={busca}
          onChange={e => handleBusca(e.target.value)}
          placeholder="Pesquisar no histórico..."
          className="bg-transparent border-none outline-none text-sm flex-1 text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Filtro por tipo (scroll horizontal) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <IcoFilter /> Filtrar por tipo
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTROS_TIPO.map(f => (
            <button key={f.id} onClick={() => handleFiltroTipo(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer flex-shrink-0
                ${filtroTipo === f.id ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 bg-transparent hover:border-green-400"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por resultado */}
      <div className="flex gap-2">
        {[
          { id: "todos",   label: "Todos os resultados" },
          { id: "sucesso", label: "✓ Sucesso" },
          { id: "falha",   label: "✗ Falha" },
        ].map(f => (
          <button key={f.id} onClick={() => handleFiltroResult(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${filtroResult === f.id ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 bg-transparent hover:border-green-400"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}</p>
        {filtrados.length !== HISTORICO.length && (
          <button onClick={() => { setFiltroTipo("todos"); setFiltroResult("todos"); setBusca(""); setPagina(1); }}
            className="text-xs text-green-600 font-medium border-0 bg-transparent cursor-pointer hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Nenhum evento encontrado com os filtros actuais.</p>
          </div>
        ) : (
          paginated.map(item => <LinhaHistorico key={item.id} item={item} />)
        )}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer
              ${pagina === 1 ? "border-gray-100 text-gray-300 bg-transparent cursor-default" : "border-gray-200 text-gray-600 bg-transparent hover:border-green-400"}`}>
            ← Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPagina(p)}
                className={`w-7 h-7 rounded-lg text-xs font-medium border transition-all cursor-pointer
                  ${pagina === p ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-500 bg-transparent hover:border-green-400"}`}>
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer
              ${pagina === totalPaginas ? "border-gray-100 text-gray-300 bg-transparent cursor-default" : "border-gray-200 text-gray-600 bg-transparent hover:border-green-400"}`}>
            Seguinte →
          </button>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        input, button { font-family: inherit; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default SecaoHistorico;