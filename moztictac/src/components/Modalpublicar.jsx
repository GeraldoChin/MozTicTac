// ── Cole este componente em substituição do ModalPublicar existente
// no ficheiro SecaoVendas.jsx

const PROVINCIAS_MZ = [
  "Maputo Cidade", "Maputo Província", "Gaza", "Inhambane",
  "Sofala", "Manica", "Tete", "Zambézia",
  "Nampula", "Cabo Delgado", "Niassa",
];

function ModalPublicar({ item, onClose, onSalvar }) {
  // ── Campos base ──────────────────────────────────────────────
  const [tipo,      setTipo]      = useState(item?.tipo      || "produto");
  const [nome,      setNome]      = useState(item?.nome      || "");
  const [desc,      setDesc]      = useState(item?.descricao || "");
  const [cat,       setCat]       = useState(item?.cat       || "");
  const [preco,     setPreco]     = useState(item?.preco     || "");
  const [stock,     setStock]     = useState(item?.stock     || "");
  const [imagens,   setImagens]   = useState(null);

  // ── Campos novos (alinhados com filtros FashionProducts) ─────
  const [estadoItem,      setEstadoItem]      = useState(item?.estadoItem      || "NOVO");      // Novo / Usado
  const [precoOriginal,   setPrecoOriginal]   = useState(item?.precoOriginal   || "");          // Preço riscado
  const [provincia,       setProvincia]       = useState(item?.provincia       || "");          // Localização
  const [cidade,          setCidade]          = useState(item?.cidade          || "");
  const [entrega,         setEntrega]         = useState(item?.entrega         ?? true);        // Entrega
  const [metodosPagamento,setMetodosPagamento]= useState(item?.metodosPagamento || ["MPESA", "EMOLA"]);

  // ── Afiliados ────────────────────────────────────────────────
  const [afiliados, setAfiliados] = useState(item?.afiliados || false);
  const [comissao,  setComissao]  = useState(item?.comissao  || 5);

  // ── Controlo ─────────────────────────────────────────────────
  const [enviando,       setEnviando]       = useState(false);
  const [cats,           setCats]           = useState([]);
  const [catsCarregando, setCatsCarregando] = useState(true);
  const [step,           setStep]           = useState(1); // 1: info base | 2: detalhes | 3: monetização

  useEffect(() => {
    apiProdutos.categorias()
      .then(r => setCats(r.dados ?? r.data ?? []))
      .catch(() => setCats([]))
      .finally(() => setCatsCarregando(false));
  }, []);

  // ── Cálculo de taxas ─────────────────────────────────────────
  const taxa    = preco ? Math.round(Number(preco) * (tipo === "servico" ? 0.15 : 0.105)) : 0;
  const liquido = preco ? Math.round(Number(preco) - taxa) : 0;
  const desconto = (preco && precoOriginal && Number(precoOriginal) > Number(preco))
    ? Math.round((1 - Number(preco) / Number(precoOriginal)) * 100)
    : 0;

  // ── Métodos de pagamento ─────────────────────────────────────
  const METODOS = ["MPESA", "EMOLA", "MKESH", "TRANSFERENCIA"];
  function toggleMetodo(m) {
    setMetodosPagamento(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  }

  // ── Validação por step ───────────────────────────────────────
  function validarStep1() {
    if (!nome.trim())     { alert("Preenche o nome do anúncio."); return false; }
    if (desc.length < 10) { alert("A descrição deve ter pelo menos 10 caracteres."); return false; }
    if (!cat)             { alert("Seleciona uma categoria."); return false; }
    return true;
  }
  function validarStep2() {
    if (!preco)           { alert("Preenche o preço."); return false; }
    if (!provincia)       { alert("Seleciona a província."); return false; }
    return true;
  }

  async function handleSalvar() {
    if (!validarStep2()) return;
    if (metodosPagamento.length === 0) { alert("Seleciona pelo menos um método de pagamento."); return; }

    setEnviando(true);
    try {
      await onSalvar({
        id:                  item?.id,
        nome:                nome.trim(),
        descricao:           desc,
        tipo:                tipo === "produto" ? "FISICO" : "SERVICO",
        preco:               Number(preco),
        precoOriginal:       precoOriginal ? Number(precoOriginal) : undefined,
        stock:               tipo === "produto" ? Number(stock) || 0 : undefined,
        categoriaId:         cat,
        estadoItem:          estadoItem,          // "NOVO" | "USADO"
        provincia:           provincia,
        cidade:              cidade || undefined,
        aceitaAfiliados:     Boolean(afiliados),
        percentualAfiliado:  afiliados ? Number(comissao) : 0,
        entregaDisponivel:   entrega,
        metodosPagamento:    metodosPagamento,
        imagens,
      });
      onClose();
    } catch (e) {
      alert("Erro ao guardar: " + e.message);
    } finally {
      setEnviando(false);
    }
  }

  // ── Estilo partilhado ────────────────────────────────────────
  const input = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors";
  const labelCls = "text-xs font-medium text-gray-500 block mb-1";

  const STEPS = ["Informação", "Localização & Preço", "Monetização"];

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col" style={{ maxHeight: "90vh" }}>

        {/* ── Cabeçalho ── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              {item ? "Editar anúncio" : "Publicar anúncio"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-1">
              <Ico.X />
            </button>
          </div>

          {/* Indicador de passos */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer transition-all
                    ${step > i + 1 ? "bg-green-600 text-white" : step === i + 1 ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}
                  onClick={() => { if (i + 1 < step) setStep(i + 1); }}
                >
                  {step > i + 1 ? <Ico.Check /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${step >= i + 1 ? "text-gray-700 font-medium" : "text-gray-400"}`}>{s}</span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${step > i + 1 ? "bg-green-300" : "bg-gray-100"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Conteúdo com scroll ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ════ STEP 1 — Informação base ════ */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Tipo */}
              <div className="flex gap-2">
                {["produto", "servico"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer
                      ${tipo === t ? "border-green-500 text-green-700 bg-green-50" : "border-gray-200 text-gray-500 bg-transparent hover:border-gray-300"}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {t === "produto" ? <Ico.Produto /> : <Ico.Servico />}
                      {t === "produto" ? "Produto" : "Serviço"}
                    </div>
                  </button>
                ))}
              </div>

              {/* Nome */}
              <div>
                <label className={labelCls}>Nome do anúncio *</label>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder={tipo === "produto" ? "ex: Smartphone Samsung A54" : "ex: Aulas de inglês online"}
                  className={input}
                />
              </div>

              {/* Descrição */}
              <div>
                <label className={labelCls}>Descrição *</label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  rows={4}
                  placeholder="Descreva com clareza o produto ou serviço... (mínimo 10 caracteres)"
                  className={`${input} resize-none ${desc.length > 0 && desc.length < 10 ? "border-red-300 focus:border-red-400" : ""}`}
                />
                <p className={`text-xs mt-0.5 text-right ${desc.length < 10 ? "text-red-400" : "text-gray-400"}`}>
                  {desc.length} car. {desc.length < 10 ? `(faltam ${10 - desc.length})` : "✓"}
                </p>
              </div>

              {/* Categoria */}
              <div>
                <label className={labelCls}>Categoria *</label>
                <select
                  value={cat}
                  onChange={e => setCat(e.target.value)}
                  disabled={catsCarregando}
                  className={`${input} disabled:opacity-60 bg-white`}
                >
                  <option value="">{catsCarregando ? "A carregar..." : "Selecionar categoria..."}</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              {/* Estado do item (Novo / Usado) — só para produtos físicos */}
              {tipo === "produto" && (
                <div>
                  <label className={labelCls}>Estado do item *</label>
                  <div className="flex gap-2">
                    {[["NOVO", "✨ Novo"], ["USADO", "♻️ Usado"]].map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setEstadoItem(val)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer
                          ${estadoItem === val ? "border-green-500 text-green-700 bg-green-50" : "border-gray-200 text-gray-500 bg-transparent hover:border-gray-300"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {estadoItem === "USADO" && (
                    <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                      <Ico.Alert /> Descreve bem o estado real do produto na descrição.
                    </p>
                  )}
                </div>
              )}

              {/* Imagens — só para produtos */}
              {tipo === "produto" && (
                <div>
                  <label className={labelCls}>
                    Imagens <span className="text-gray-300">(máx. 12 · primeira é a principal)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => setImagens(e.target.files)}
                    className={input}
                  />
                  {imagens && imagens.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">{imagens.length} imagem{imagens.length > 1 ? "s" : ""} seleccionada{imagens.length > 1 ? "s" : ""}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════ STEP 2 — Localização & Preço ════ */}
          {step === 2 && (
            <div className="space-y-4">

              {/* Localização */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  Localização
                </p>
                <div>
                  <label className={labelCls}>Província *</label>
                  <select
                    value={provincia}
                    onChange={e => setProvincia(e.target.value)}
                    className={`${input} bg-white`}
                  >
                    <option value="">Selecionar província...</option>
                    {PROVINCIAS_MZ.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Cidade / Bairro <span className="text-gray-300">(opcional)</span></label>
                  <input
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    placeholder="ex: Maputo, Sommerschield"
                    className={input}
                  />
                </div>
              </div>

              {/* Preços */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preços</p>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={labelCls}>Preço de venda (MZN) *</label>
                    <input
                      type="number"
                      value={preco}
                      onChange={e => setPreco(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      className={input}
                    />
                  </div>
                  {tipo === "produto" && (
                    <div className="w-28">
                      <label className={labelCls}>Stock</label>
                      <input
                        type="number"
                        value={stock}
                        onChange={e => setStock(e.target.value)}
                        placeholder="qtd"
                        min="0"
                        className={input}
                      />
                    </div>
                  )}
                </div>

                {/* Preço original (para mostrar desconto) */}
                <div>
                  <label className={labelCls}>
                    Preço original / antes do desconto <span className="text-gray-300">(opcional)</span>
                  </label>
                  <input
                    type="number"
                    value={precoOriginal}
                    onChange={e => setPrecoOriginal(e.target.value)}
                    placeholder="ex: 5000 — aparece riscado"
                    min="0"
                    className={input}
                  />
                  {desconto > 0 && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      ✓ Desconto de {desconto}% — os compradores vêem o preço riscado
                    </p>
                  )}
                </div>

                {/* Resumo de taxas */}
                {Number(preco) > 0 && (
                  <div className="p-3 bg-white border border-gray-100 rounded-lg text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Preço de venda</span>
                      <span className="font-mono">{Number(preco).toLocaleString("pt-MZ")} MZN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taxa plataforma ({tipo === "servico" ? "15%" : "10.5%"})</span>
                      <span className="font-mono text-red-500">−{taxa.toLocaleString("pt-MZ")} MZN</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-gray-100">
                      <span className="font-semibold text-gray-700">Você recebe</span>
                      <span className="font-mono font-bold text-green-600">{liquido.toLocaleString("pt-MZ")} MZN</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Entrega */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Entrega e pagamento</p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Entrega disponível</p>
                    <p className="text-xs text-gray-400">Permite que os compradores filtrem por entrega</p>
                  </div>
                  <Toggle value={entrega} onChange={setEntrega} />
                </div>

                <div>
                  <label className={labelCls}>Métodos de pagamento aceites *</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {METODOS.map(m => (
                      <button
                        key={m}
                        onClick={() => toggleMetodo(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                          ${metodosPagamento.includes(m)
                            ? "border-green-500 text-green-700 bg-green-50"
                            : "border-gray-200 text-gray-500 bg-transparent hover:border-gray-300"}`}
                      >
                        {m === "TRANSFERENCIA" ? "Transferência" : m}
                      </button>
                    ))}
                  </div>
                  {metodosPagamento.length === 0 && (
                    <p className="text-xs text-red-400 mt-1">Seleciona pelo menos um método</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════ STEP 3 — Monetização ════ */}
          {step === 3 && (
            <div className="space-y-4">

              {/* Afiliados */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Aceitar afiliados</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      Afiliados promovem o teu anúncio e recebem comissão por cada venda gerada. Só pagas quando vendes.
                    </p>
                  </div>
                  <Toggle value={afiliados} onChange={setAfiliados} />
                </div>

                {afiliados && (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Comissão de afiliado</span>
                      <span className="text-sm font-bold text-green-600 font-mono">{comissao}%</span>
                    </div>
                    <input
                      type="range" min="1" max="30" step="1"
                      value={comissao}
                      onChange={e => setComissao(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>1% (mínimo)</span>
                      <span>30% (máximo)</span>
                    </div>
                    {Number(preco) > 0 && (
                      <div className="p-3 bg-white border border-gray-100 rounded-lg text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-500">Comissão por venda</span>
                          <span className="font-mono text-blue-600">
                            {Math.round(Number(preco) * comissao / 100).toLocaleString("pt-MZ")} MZN
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Você recebe (após comissão + taxa)</span>
                          <span className="font-mono font-bold text-green-600">
                            {Math.round(liquido - Number(preco) * comissao / 100).toLocaleString("pt-MZ")} MZN
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-1">
                      {[5, 10, 15, 20].map(v => (
                        <button
                          key={v}
                          onClick={() => setComissao(v)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all
                            ${comissao === v ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-400 bg-transparent"}`}
                        >
                          {v}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resumo final */}
              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resumo do anúncio</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo</span>
                    <span className="font-medium text-gray-800">{tipo === "produto" ? "Produto físico" : "Serviço"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nome</span>
                    <span className="font-medium text-gray-800 text-right max-w-[200px] truncate">{nome || "—"}</span>
                  </div>
                  {tipo === "produto" && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estado</span>
                      <span className="font-medium text-gray-800">{estadoItem === "NOVO" ? "✨ Novo" : "♻️ Usado"}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Localização</span>
                    <span className="font-medium text-gray-800">{[cidade, provincia].filter(Boolean).join(", ") || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Preço</span>
                    <span className="font-mono font-bold text-gray-900">{preco ? `${Number(preco).toLocaleString("pt-MZ")} MZN` : "—"}</span>
                  </div>
                  {desconto > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Desconto</span>
                      <span className="font-semibold text-red-500">-{desconto}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entrega</span>
                    <span className={`font-medium ${entrega ? "text-green-600" : "text-gray-400"}`}>{entrega ? "Sim" : "Não"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Afiliados</span>
                    <span className={`font-medium ${afiliados ? "text-green-600" : "text-gray-400"}`}>
                      {afiliados ? `Sim · ${comissao}% comissão` : "Não"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pagamentos</span>
                    <span className="font-medium text-gray-800 text-right">{metodosPagamento.join(", ") || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2 items-start">
                <div className="text-blue-500 mt-0.5 flex-shrink-0"><Ico.Info /></div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  O anúncio será revisto pela equipa MozTicTac antes de ficar visível. O processo demora normalmente até 24 horas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Rodapé com navegação ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={enviando}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 bg-transparent cursor-pointer hover:border-gray-300 transition-colors"
            >
              ← Voltar
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={enviando}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 bg-transparent cursor-pointer hover:border-gray-300 transition-colors"
            >
              Cancelar
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !validarStep1()) return;
                if (step === 2 && !validarStep2()) return;
                setStep(s => s + 1);
              }}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold border-0 cursor-pointer transition-colors"
            >
              Continuar →
            </button>
          ) : (
            <button
              onClick={handleSalvar}
              disabled={enviando}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold border-0 cursor-pointer transition-colors disabled:opacity-60"
            >
              {enviando ? "A guardar..." : item ? "Guardar alterações" : "Publicar anúncio"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}