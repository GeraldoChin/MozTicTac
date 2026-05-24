// src/components/SecaoVendas.jsx
// ─────────────────────────────────────────────────────────────────
// Versão corrigida e completa:
//  - TabPromocoes com ModalPromocao funcional (seleção de plano + produto + pagamento)
//  - TabStats com dados reais da API e gráfico de barras SVG
//  - TabAfiliados com debounce no slider de comissão + confirmação no toggle
//  - TabPedidos com distinção vendedor/comprador na disputa
//  - ModalPublicar sem campo `atacado` (não existe no schema do backend)
//  - Paginação de produtos com "carregar mais"
//  - Todos os outros bugs corrigidos
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";

// ── API BASE ──────────────────────────────────────────────────────
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const cabecalhos = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opcoes.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
  };
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: { ...cabecalhos, ...opcoes.headers },
  });
  const dados = await resposta.json();
  if (!resposta.ok)
    throw new Error(
      dados.mensagem || dados.message || `Erro ${resposta.status}`,
    );
  return dados;
}

//Relampago
const apiRelampago = {
  meusRelampagos: () => requisitar("/relampago/meus"),
  criar: (dados) =>
    requisitar("/relampago", {
      method: "POST",
      body: JSON.stringify(dados),
    }),
  atualizar: (id, dados) =>
    requisitar(`/relampago/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    }),
  desativar: (id) => requisitar(`/relampago/${id}`, { method: "DELETE" }),
};

// ── APIs ──────────────────────────────────────────────────────────
const apiProdutos = {
  meusProdutos: (pagina = 1, estado) =>
    requisitar(
      `/produtos/meus?pagina=${pagina}${estado ? `&estado=${estado}` : ""}`,
    ),
  categorias: () => requisitar("/produtos/categorias"),
  criarProduto: (form) =>
    requisitar("/produtos", { method: "POST", body: form }),
  atualizarProduto: (id, dados) =>
    requisitar(`/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    }),
  pausarProduto: (id) =>
    requisitar(`/produtos/${id}/pausar`, { method: "PATCH" }),
  reativarProduto: (id) =>
    requisitar(`/produtos/${id}/reativar`, { method: "PATCH" }),
  eliminarProduto: (id) => requisitar(`/produtos/${id}`, { method: "DELETE" }),
};

const apiPedidos = {
  listarVendas: (pagina = 1, estado) =>
    requisitar(
      `/pedidos/vendas?pagina=${pagina}${estado && estado !== "todos" ? `&estado=${estado}` : ""}`,
    ),
  marcarEnviado: (id) =>
    requisitar(`/pedidos/${id}/enviado`, { method: "PATCH" }),
  // Nota: abrirDisputa é para COMPRADORES — o vendedor não pode abrir disputa pela sua própria venda
  // Mantido aqui mas o botão só aparece na tab de compras, não de vendas
};

const apiAfiliados = {
  meusAfiliados: (pagina = 1) => requisitar(`/afiliados/meus?pagina=${pagina}`),
  comissoes: (pagina = 1, estado) =>
    requisitar(
      `/afiliados/comissoes?pagina=${pagina}${estado ? `&estado=${estado}` : ""}`,
    ),
  estatisticas: () => requisitar("/afiliados/estatisticas"),
  minhaPosicao: () => requisitar("/afiliados/ranking/minha-posicao"),
};

const apiConta = {
  resumo: () => requisitar("/conta/resumo"),
  minhasVendas: (pagina = 1) => requisitar(`/conta/vendas?pagina=${pagina}`),
  meusProdutos: (estado) =>
    requisitar(`/conta/produtos${estado ? `?estado=${estado}` : ""}`),
  saldo: () => requisitar("/carteira/saldo"),
  // Promoção: endpoint hipotético — adaptar ao real quando existir
  contratarPromocao: (produtoId, planoId, metodoPagamento, numeroCelular) =>
    requisitar("/promocoes/", {
      method: "POST",
      body: JSON.stringify({
        produtoId,
        planoId,
        metodoPagamento,
        numeroCelular,
      }),
    }),
};
// ── Mapper ────────────────────────────────────────────────────────
function mapearProduto(p) {
  return {
    id: p.id,
    nome: p.nome,
    preco: Number(p.preco),
    stock: p.stock ?? 0,
    estado: (p.estado ?? "").toLowerCase().replace(/_/g, " "),
    tipo:
      (p.tipo ?? "fisico").toLowerCase() === "servico" ? "servico" : "produto",
    vendas: p.totalVendas ?? 0,
    afiliados: p.aceitaAfiliados ?? false,
    comissao: Number(p.percentualAfiliado ?? p.comissao ?? 5),
    entrega: p.entregaDisponivel ?? false,
    descricao: p.descricao ?? "",
    imagens: p.imagens ?? [],
    cat: p.categoriaId ?? p.categoria?.id ?? "",
    catNome: p.categoria?.nome ?? "",
    motivoRejeicao: p.motivoRejeicao ?? null,
  };
}

// Tab Relampago
function TabRelampago({ produtos }) {
  const [relampagos, setRelampagos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modal, setModal] = useState(null); // null | "novo" | { item }
  const [acaoId, setAcaoId] = useState(null);

  const produtosAtivos = produtos.filter(
    (p) => p.estado === "ativo" || p.estado === "activo",
  );

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiRelampago.meusRelampagos();
      const d = res.success ? res.data : (res.dados ?? {});
      setRelampagos(d.vendas ?? d ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleDesativar(id) {
    if (
      !window.confirm(
        "Tens a certeza que queres cancelar esta venda relâmpago?",
      )
    )
      return;
    setAcaoId(id);
    try {
      await apiRelampago.desativar(id);
      setRelampagos((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setAcaoId(null);
    }
  }

  const agora = new Date();

  function estadoRelampago(r) {
    if (!r.ativo) return { label: "Inativa", cls: "bg-gray-100 text-gray-500" };
    if (new Date(r.inicioEm) > agora)
      return { label: "Futura", cls: "bg-blue-100 text-blue-700" };
    if (new Date(r.fimEm) < agora)
      return { label: "Expirada", cls: "bg-gray-100 text-gray-500" };
    return { label: "Activa", cls: "bg-green-100 text-green-700" };
  }

  function diasRestantes(fimEm) {
    const diff = new Date(fimEm) - agora;
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    if (h < 24) return `${h}h restantes`;
    return `${Math.ceil(h / 24)}d restantes`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Vendas Relâmpago
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Cria ofertas com desconto por tempo limitado para aumentar vendas
            rápidas
          </p>
        </div>
        <button
          onClick={() => setModal("novo")}
          disabled={produtosAtivos.length === 0}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Ico.Zap /> Nova oferta
        </button>
      </div>

      {/* Aviso se sem produtos activos */}
      {produtosAtivos.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-4 flex gap-2.5 items-start">
          <span className="text-amber-500 mt-0.5">
            <Ico.Alert />
          </span>
          <div>
            <p className="text-xs font-semibold text-amber-800">
              Sem produtos activos
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Precisas de ter pelo menos um produto activo para criar uma venda
              relâmpago.
            </p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-white border border-gray-100 rounded-xl mb-4 flex gap-2.5 items-start">
        <span className="text-blue-500 mt-0.5 flex-shrink-0">
          <Ico.Info />
        </span>
        <div>
          <p className="text-xs font-semibold text-gray-700">Como funciona?</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Define um preço com desconto e um período. Enquanto a oferta estiver
            activa, os compradores vêem o produto com o badge{" "}
            <strong>⚡ Flash Deal</strong> na página de tendências. Podes
            limitar o número de unidades disponíveis a esse preço.
          </p>
        </div>
      </div>

      {carregando ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : erro ? (
        <ErroBloco mensagem={erro} onRetry={carregar} />
      ) : relampagos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            Nenhuma venda relâmpago criada
          </p>
          <p className="text-xs text-gray-400">
            Cria a tua primeira oferta relâmpago para aumentar as vendas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {relampagos.map((r) => {
            const est = estadoRelampago(r);
            const restantes = r.fimEm ? diasRestantes(r.fimEm) : null;
            const desconto = r.precoOriginal
              ? Math.round((1 - r.precoRelampago / r.precoOriginal) * 100)
              : null;
            const podeDesativar = r.ativo && new Date(r.fimEm) > agora;

            return (
              <div
                key={r.id}
                className="p-4 bg-white border border-gray-100 rounded-xl hover:border-amber-100 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Imagem */}
                  <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {r.produto?.imagens?.[0] ? (
                      <img
                        src={r.produto.imagens[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">⚡</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {r.produto?.nome ?? "Produto"}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${est.cls}`}
                      >
                        {est.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-2">
                      <span className="line-through">
                        {Number(r.precoOriginal).toLocaleString("pt-MZ")} MZN
                      </span>
                      <span className="text-amber-600 font-bold text-sm">
                        {Number(r.precoRelampago).toLocaleString("pt-MZ")} MZN
                      </span>
                      {desconto && (
                        <span className="bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">
                          -{desconto}%
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span>Início: {fmtData(r.inicioEm)}</span>
                      <span>Fim: {fmtData(r.fimEm)}</span>
                      {r.quantidadeLimite != null && (
                        <span>
                          Vendidas: {r.quantidadeVendida ?? 0}/
                          {r.quantidadeLimite}
                        </span>
                      )}
                      {restantes && (
                        <span className="text-amber-500 font-medium">
                          ⏱ {restantes}
                        </span>
                      )}
                    </div>

                    {/* Barra de progresso de stock */}
                    {r.quantidadeLimite != null && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.round(((r.quantidadeVendida ?? 0) / r.quantidadeLimite) * 100))}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {r.quantidadeLimite - (r.quantidadeVendida ?? 0)}{" "}
                          restantes de {r.quantidadeLimite}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acção */}
                  {podeDesativar && (
                    <IconBtn
                      danger
                      title="Cancelar oferta"
                      onClick={() => handleDesativar(r.id)}
                      disabled={acaoId === r.id}
                    >
                      {acaoId === r.id ? <Spinner small /> : <Ico.X />}
                    </IconBtn>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar nova oferta */}
      {modal && (
        <ModalCriarRelampago
          produtos={produtosAtivos}
          onClose={() => setModal(null)}
          onSucesso={(novaVenda) => {
            setRelampagos((prev) => [novaVenda, ...prev]);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

//Criar Relampago
function ModalCriarRelampago({ produtos, onClose, onSucesso }) {
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [preco, setPreco] = useState("");
  const [limite, setLimite] = useState("");
  const [inicioEm, setInicioEm] = useState("");
  const [fimEm, setFimEm] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroMsg, setErroMsg] = useState("");

  const produtoSel = produtos.find((p) => p.id === produtoId);
  const precoOrig = produtoSel?.preco ?? 0;
  const desconto =
    preco && precoOrig ? Math.round((1 - Number(preco) / precoOrig) * 100) : 0;

  async function handleCriar() {
    setErroMsg("");
    if (!produtoId) {
      setErroMsg("Seleciona um produto.");
      return;
    }
    if (!preco || Number(preco) <= 0) {
      setErroMsg("Preço relâmpago inválido.");
      return;
    }
    if (Number(preco) >= precoOrig) {
      setErroMsg("O preço relâmpago deve ser inferior ao preço original.");
      return;
    }
    if (!inicioEm || !fimEm) {
      setErroMsg("Define as datas de início e fim.");
      return;
    }
    if (new Date(fimEm) <= new Date(inicioEm)) {
      setErroMsg("A data de fim deve ser posterior ao início.");
      return;
    }

    setEnviando(true);
    try {
      const res = await apiRelampago.criar({
        produtoId,
        precoRelampago: Number(preco),
        quantidadeLimite: limite ? Number(limite) : undefined,
        inicioEm: new Date(inicioEm).toISOString(),
        fimEm: new Date(fimEm).toISOString(),
      });
      onSucesso(res.success ? res.data : res.dados);
    } catch (e) {
      setErroMsg(e.message);
    } finally {
      setEnviando(false);
    }
  }

  // Sugestão de datas (hoje + 24h)
  function preencherHoje() {
    const agora = new Date();
    const amanha = new Date(agora.getTime() + 24 * 3600000);
    setInicioEm(agora.toISOString().slice(0, 16));
    setFimEm(amanha.toISOString().slice(0, 16));
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Nova venda relâmpago
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Oferta com desconto por tempo limitado
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-1"
            >
              <Ico.X />
            </button>
          </div>

          <div className="space-y-4">
            {/* Produto */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Produto *
              </label>
              <select
                value={produtoId}
                onChange={(e) => {
                  setProdutoId(e.target.value);
                  setPreco("");
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 bg-white"
              >
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {Number(p.preco).toLocaleString("pt-MZ")} MZN
                  </option>
                ))}
              </select>
            </div>

            {/* Preço relâmpago */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Preço relâmpago (MZN) *{" "}
                <span className="text-gray-300">
                  · original: {Number(precoOrig).toLocaleString("pt-MZ")} MZN
                </span>
              </label>
              <input
                type="number"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="ex: 350"
                min="1"
                max={precoOrig - 1}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
              {desconto > 0 && (
                <p className="text-xs mt-1">
                  <span className="text-red-500 font-bold">
                    -{desconto}% desconto
                  </span>
                  <span className="text-gray-400 ml-2">
                    · poupança de{" "}
                    {(precoOrig - Number(preco)).toLocaleString("pt-MZ")} MZN
                  </span>
                </p>
              )}
            </div>

            {/* Quantidade limite */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Quantidade limite{" "}
                <span className="text-gray-300">
                  (opcional — deixa vazio para ilimitado)
                </span>
              </label>
              <input
                type="number"
                value={limite}
                onChange={(e) => setLimite(e.target.value)}
                placeholder="ex: 10"
                min="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Datas */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-500">
                  Período *
                </label>
                <button
                  onClick={preencherHoje}
                  className="text-xs text-amber-600 hover:text-amber-700 bg-transparent border-0 cursor-pointer"
                >
                  Preencher agora → +24h
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Início</p>
                  <input
                    type="datetime-local"
                    value={inicioEm}
                    onChange={(e) => setInicioEm(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Fim</p>
                  <input
                    type="datetime-local"
                    value={fimEm}
                    onChange={(e) => setFimEm(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Resumo */}
            {preco && inicioEm && fimEm && desconto > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-amber-800">Resumo da oferta</p>
                <div className="flex justify-between text-amber-700">
                  <span>Produto</span>
                  <span className="font-medium">{produtoSel?.nome}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Preço original</span>
                  <span className="line-through">
                    {Number(precoOrig).toLocaleString("pt-MZ")} MZN
                  </span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Preço relâmpago</span>
                  <span className="font-bold text-amber-900">
                    {Number(preco).toLocaleString("pt-MZ")} MZN
                  </span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Desconto</span>
                  <span className="font-bold text-red-600">{desconto}%</span>
                </div>
                {limite && (
                  <div className="flex justify-between text-amber-700">
                    <span>Unidades disponíveis</span>
                    <span>{limite}</span>
                  </div>
                )}
              </div>
            )}

            {erroMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs text-red-700">{erroMsg}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              disabled={enviando}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 bg-transparent cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleCriar}
              disabled={enviando}
              className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium border-0 cursor-pointer disabled:opacity-60 transition-colors"
            >
              {enviando ? "A criar..." : "⚡ Criar oferta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Constantes ────────────────────────────────────────────────────
const ESTADO_LABEL = {
  AGUARDANDO_PAGAMENTO: "aguardando pagamento",
  PAGO: "pago",
  EM_PROCESSAMENTO: "em processamento",
  ENVIADO: "enviado",
  ENTREGUE: "entregue",
  CANCELADO: "cancelado",
  REEMBOLSADO: "reembolsado",
  EM_DISPUTA: "em disputa",
};

function normalizarEstadoPedido(e) {
  return ESTADO_LABEL[e] ?? (e ?? "").toLowerCase().replace(/_/g, " ");
}

const STATUS_CLS = {
  "aguardando pagamento": "bg-gray-100 text-gray-600",
  pago: "bg-blue-100 text-blue-800",
  "em processamento": "bg-amber-100 text-amber-700",
  enviado: "bg-amber-100 text-amber-800",
  entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-700",
  reembolsado: "bg-purple-100 text-purple-700",
  "em disputa": "bg-red-100 text-red-800",
};

const ESCROW_PCT = {
  AGUARDANDO_PAGAMENTO: 0,
  PAGO: 40,
  EM_PROCESSAMENTO: 50,
  ENVIADO: 70,
  ENTREGUE: 100,
  CANCELADO: 0,
  REEMBOLSADO: 0,
  EM_DISPUTA: 60,
};

const NIVEL_CLS = {
  ouro: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-300",
  },
  prata: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
  },
  bronze: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
  },
};

const PROMO_PLANOS = [
  {
    id: "basico",
    nome: "Básico",
    duracao: "3 dias",
    preco: 250,
    desc: "Destaque no feed geral",
    beneficios: ["Posição destacada no feed", "Badge 'Em destaque'"],
  },
  {
    id: "standard",
    nome: "Standard",
    duracao: "7 dias",
    preco: 500,
    desc: "Destaque + notificações push",
    popular: true,
    beneficios: [
      "Tudo do Básico",
      "Notificações para utilizadores",
      "Destaque na categoria",
    ],
  },
  {
    id: "premium",
    nome: "Premium",
    duracao: "30 dias",
    preco: 1500,
    desc: "Topo do feed + banner",
    beneficios: [
      "Tudo do Standard",
      "Banner na homepage",
      "Relatório de desempenho",
      "Suporte prioritário",
    ],
  },
];

const METODOS_PAGAMENTO_PROMO = ["MPESA", "EMOLA", "MKESH", "SALDO_INTERNO"];

// ── Helpers ───────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("pt-MZ") + " MZN";
const fmtK = (n) => {
  const v = Number(n || 0);
  return v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v);
};
const fmtData = (d) =>
  d
    ? new Date(d).toLocaleDateString("pt-MZ", {
        day: "numeric",
        month: "short",
      })
    : "—";

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}

// ── Ícones SVG ────────────────────────────────────────────────────
const Ico = {
  Home: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  ),
  Bag: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  Users: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Star: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Bar: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Pause: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  ),
  Play: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  Info: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Trend: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Truck: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  Alert: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Check: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronL: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronR: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Refresh: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  ),
  Produto: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    </svg>
  ),
  Servico: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    </svg>
  ),
  Trophy: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  ),
  Link: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  Copy: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  Megaphone: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  ),
  Zap: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  CreditCard: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Phone: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.08 9.81 19.79 19.79 0 01.01 1.18a2 2 0 011.95-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 6.83a16 16 0 006.29 6.29l.83-1.29a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.04z" />
    </svg>
  ),
  X: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChartBar: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="18" y="3" width="4" height="18" />
      <rect x="10" y="8" width="4" height="13" />
      <rect x="2" y="13" width="4" height="8" />
    </svg>
  ),
};

// ── Componentes base ──────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full border-0 transition-colors flex-shrink-0 cursor-pointer ${value ? "bg-green-600" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${value ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}

function IconBtn({ onClick, danger, title, children, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed
        ${
          danger
            ? "border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500"
            : "border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-600"
        }`}
    >
      {children}
    </button>
  );
}

function Spinner({ small }) {
  return (
    <div
      className={`border-2 border-gray-200 border-t-green-600 rounded-full animate-spin ${small ? "w-4 h-4" : "w-6 h-6"}`}
    />
  );
}

function Paginacao({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onChange(pagina - 1)}
        disabled={pagina <= 1}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-green-400 cursor-pointer bg-transparent"
      >
        <Ico.ChevronL />
      </button>
      <span className="text-xs text-gray-500 font-mono">
        {pagina} / {totalPaginas}
      </span>
      <button
        onClick={() => onChange(pagina + 1)}
        disabled={pagina >= totalPaginas}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 disabled:opacity-40 hover:border-green-400 cursor-pointer bg-transparent"
      >
        <Ico.ChevronR />
      </button>
    </div>
  );
}

function EstadoVazio({ texto }) {
  return <div className="text-center text-sm text-gray-400 py-12">{texto}</div>;
}

function ErroBloco({ mensagem, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <p className="text-red-500 text-sm font-medium">Erro ao carregar</p>
      <p className="text-gray-400 text-xs max-w-xs text-center">{mensagem}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-4 py-2 rounded-lg border-0 cursor-pointer hover:bg-green-700"
        >
          <Ico.Refresh /> Tentar novamente
        </button>
      )}
    </div>
  );
}

// ── MODAL PROMOÇÃO — funcional e completo ─────────────────────────
function ModalPromocao({ produto, onClose, onSucesso }) {
  const [etapa, setEtapa] = useState(1); // 1: escolher plano, 2: pagamento, 3: confirmado
  const [planoId, setPlanoId] = useState(null);
  const [metodo, setMetodo] = useState("MPESA");
  const [numero, setNumero] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroMsg, setErroMsg] = useState("");

  const planoSelecionado = PROMO_PLANOS.find((p) => p.id === planoId);

  async function handlePagar() {
    if (!numero.trim() && metodo !== "SALDO_INTERNO") {
      setErroMsg("Introduz o número de telefone ou conta.");
      return;
    }
    setErroMsg("");
    setEnviando(true);
    try {
      await apiConta.contratarPromocao(
        produto.id,
        planoId,
        metodo,
        numero || undefined,
      );

      setEtapa(3);
    } catch (e) {
      setErroMsg(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Promover anúncio
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                {produto.nome}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-1"
            >
              <Ico.X />
            </button>
          </div>

          {/* Progresso */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${etapa >= s ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}
                >
                  {etapa > s ? <Ico.Check /> : s}
                </div>
                <span
                  className={`text-xs ${etapa >= s ? "text-gray-700" : "text-gray-400"}`}
                >
                  {s === 1 ? "Plano" : s === 2 ? "Pagamento" : "Confirmado"}
                </span>
                {s < 3 && (
                  <div
                    className={`flex-1 h-px ${etapa > s ? "bg-green-300" : "bg-gray-100"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Etapa 1 — Escolher plano */}
          {etapa === 1 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Escolhe um plano
              </p>
              <div className="flex flex-col gap-2 mb-5">
                {PROMO_PLANOS.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => setPlanoId(pl.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer bg-transparent
                      ${
                        planoId === pl.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {pl.popular && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mr-2">
                            POPULAR
                          </span>
                        )}
                        <span className="text-sm font-semibold text-gray-900">
                          {pl.nome}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {pl.duracao}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-green-600 font-mono flex-shrink-0">
                        {pl.preco} MZN
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{pl.desc}</p>
                    <div className="flex flex-col gap-1">
                      {pl.beneficios.map((b) => (
                        <div
                          key={b}
                          className="flex items-center gap-1.5 text-xs text-gray-600"
                        >
                          <span className="text-green-500">
                            <Ico.Check />
                          </span>{" "}
                          {b}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 bg-transparent cursor-pointer hover:border-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setEtapa(2)}
                  disabled={!planoId}
                  className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium border-0 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Etapa 2 — Pagamento */}
          {etapa === 2 && planoSelecionado && (
            <div>
              <div className="p-3 bg-gray-50 rounded-xl mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Plano selecionado</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {planoSelecionado.nome} · {planoSelecionado.duracao}
                  </p>
                </div>
                <p className="text-base font-bold text-green-600 font-mono">
                  {planoSelecionado.preco} MZN
                </p>
              </div>

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Método de pagamento
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {METODOS_PAGAMENTO_PROMO.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMetodo(m);
                      setNumero("");
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer bg-transparent
                      ${metodo === m ? "border-green-500 text-green-700 bg-green-50" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                  >
                    {m === "SALDO_INTERNO" ? "Saldo da carteira" : m}
                  </button>
                ))}
              </div>

              {metodo !== "SALDO_INTERNO" && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    {metodo === "VISA"
                      ? "Número do cartão"
                      : "Número de telefone"}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-green-500">
                    <span className="px-3 py-2 text-gray-400">
                      {metodo === "VISA" ? <Ico.CreditCard /> : <Ico.Phone />}
                    </span>
                    <input
                      type="tel"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder={
                        metodo === "VISA"
                          ? "4242 4242 4242 4242"
                          : "84 XXX XXXX"
                      }
                      className="flex-1 py-2 pr-3 text-sm border-0 outline-none bg-transparent"
                    />
                  </div>
                </div>
              )}

              {metodo === "SALDO_INTERNO" && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                  <p className="text-xs text-blue-800">
                    O valor será debitado directamente do seu saldo disponível
                    na carteira MozTicTac.
                  </p>
                </div>
              )}

              {erroMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
                  <p className="text-xs text-red-700">{erroMsg}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEtapa(1);
                    setErroMsg("");
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 bg-transparent cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={handlePagar}
                  disabled={enviando}
                  className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium border-0 cursor-pointer disabled:opacity-60 transition-colors"
                >
                  {enviando
                    ? "A processar..."
                    : `Pagar ${planoSelecionado.preco} MZN`}
                </button>
              </div>
            </div>
          )}

          {/* Etapa 3 — Confirmado */}
          {etapa === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Promoção activada!
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                O teu anúncio <strong>{produto.nome}</strong> está agora em
                destaque.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Duração: {planoSelecionado?.duracao} · Plano{" "}
                {planoSelecionado?.nome}
              </p>
              <button
                onClick={() => {
                  onSucesso && onSucesso();
                  onClose();
                }}
                className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium border-0 cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TAB PEDIDOS — corrigida (vendedor não pode abrir disputa) ─────
function TabPedidos() {
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [pedidos, setPedidos] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [acaoId, setAcaoId] = useState(null);

  const FILTROS = [
    "todos",
    "PAGO",
    "ENVIADO",
    "ENTREGUE",
    "EM_DISPUTA",
    "CANCELADO",
  ];
  const FILTROS_LABEL = {
    todos: "Todos",
    PAGO: "Pagos",
    ENVIADO: "Enviados",
    ENTREGUE: "Entregues",
    EM_DISPUTA: "Em disputa",
    CANCELADO: "Cancelados",
  };

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await apiPedidos.listarVendas(
        pagina,
        filtro === "todos" ? null : filtro,
      );
      const d = res.sucesso ? res.dados : (res.data ?? {});
      setPedidos(d.pedidos ?? []);
      setTotal(d.total ?? 0);
      const paginas = d.totalPaginas ?? Math.ceil((d.total ?? 0) / 20);

      setTotalPaginas(paginas || 1);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [pagina, filtro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleMarcarEnviado(id) {
    setAcaoId(id);
    try {
      await apiPedidos.marcarEnviado(id);
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, estado: "ENVIADO", enviadoEm: new Date().toISOString() }
            : p,
        ),
      );
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setAcaoId(null);
    }
  }

  function mudarFiltro(f) {
    setFiltro(f);
    setPagina(1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Pedidos recebidos{" "}
          <span className="font-normal text-gray-400 text-xs">({total})</span>
        </p>
        <button
          onClick={carregar}
          disabled={carregando}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:border-gray-300 bg-transparent cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
        >
          <Ico.Refresh /> Actualizar
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => mudarFiltro(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${
                filtro === f
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-200 text-gray-500 hover:border-green-400 bg-transparent"
              }`}
          >
            {FILTROS_LABEL[f]}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : erro ? (
        <ErroBloco mensagem={erro} onRetry={carregar} />
      ) : pedidos.length === 0 ? (
        <EstadoVazio texto="Nenhum pedido encontrado." />
      ) : (
        <div className="flex flex-col gap-2">
          {pedidos.map((p) => {
            const estadoNorm = normalizarEstadoPedido(p.estado);
            const pct = ESCROW_PCT[p.estado] ?? 50;
            const podeEnviar = p.estado === "PAGO";
            const emAcao = acaoId === p.id;

            return (
              <div
                key={p.id}
                className="p-4 bg-white border border-gray-100 rounded-xl hover:border-green-100 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-400 font-mono">
                      #{p.id?.substring(0, 8)} ·{" "}
                      {p.comprador?.nomeCompleto ?? "—"} ·{" "}
                      {fmtData(p.criadoEm ?? p.data)}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                      {p.itens?.[0]?.nome ?? p.produto ?? "Produto"}
                      {p.itens?.length > 1 && ` +${p.itens.length - 1} mais`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">
                      {fmt(p.total ?? p.valor)}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ml-2 ${STATUS_CLS[estadoNorm] || "bg-gray-100 text-gray-500"}`}
                  >
                    {estadoNorm}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                  <Ico.Lock /> Escrow: {pct}% liberado
                </div>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {podeEnviar && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => handleMarcarEnviado(p.id)}
                      disabled={emAcao}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-60"
                    >
                      {emAcao ? <Spinner small /> : <Ico.Truck />}
                      Marcar como enviado
                    </button>
                  </div>
                )}

                {p.emDisputa && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50 text-xs text-red-600 font-medium">
                    <Ico.Alert /> Disputa aberta pelo comprador
                  </div>
                )}

                {p.estado === "CANCELADO" && p.motivoCancelamento && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400">
                      Motivo: {p.motivoCancelamento}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        onChange={setPagina}
      />

      {!carregando && !erro && (
        <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl flex gap-2.5 items-start">
          <Ico.Info />
          <div>
            <div className="text-xs font-semibold text-green-800">
              Sistema Escrow activo
            </div>
            <div className="text-xs text-green-700 mt-0.5">
              O dinheiro é retido até o comprador confirmar a entrega. Protege
              ambas as partes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB AFILIADOS — com debounce e confirmação ────────────────────
function TabAfiliados({ produtos, setProdutos }) {
  const [subTab, setSubTab] = useState("links");
  const [afiliados, setAfiliados] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [posicao, setPosicao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [paginaComissoes, setPaginaComissoes] = useState(1);
  const [totalComissoes, setTotalComissoes] = useState(0);
  const [totalPaginasCom, setTotalPaginasCom] = useState(1);
  const [copiadoId, setCopiadoId] = useState(null);
  const [salvandoId, setSalvandoId] = useState(null);

  // Estado local para sliders (evita lag)
  const [comissoesLocais, setComissoesLocais] = useState({});

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [resAfi, resPos, resStats] = await Promise.all([
        apiAfiliados.meusAfiliados(),
        apiAfiliados.minhaPosicao(),
        apiAfiliados.estatisticas(),
      ]);
      const d = resAfi.sucesso ? resAfi.dados : (resAfi.data ?? {});
      setAfiliados(d.afiliados ?? []);

      const dp = resPos.success ? resPos.data : (resPos.dados ?? {});
      setPosicao(dp);

      const ds = resStats.sucesso ? resStats.dados : (resStats.data ?? {});
      setEstatisticas(ds);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarComissoes = useCallback(async () => {
    try {
      const res = await apiAfiliados.comissoes(paginaComissoes);
      const d = res.sucesso ? res.dados : (res.data ?? {});
      setComissoes(d.comissoes ?? []);
      setTotalComissoes(d.total ?? 0);
      setTotalPaginasCom(d.totalPaginas ?? 1);
    } catch (error) {
      setErro(error?.message || "Erro ao carregar comissões");
    }
  }, [paginaComissoes]);

  useEffect(() => {
    carregar();
  }, [carregar]);
  useEffect(() => {
    if (subTab === "historico") carregarComissoes();
  }, [subTab, carregarComissoes]);

  // Debounce para actualização de comissão (evita N requests por movimento do slider)
  const enviarComissaoDebounced = useDebounce(async (id, val) => {
    setSalvandoId(id);
    try {
      await apiProdutos.atualizarProduto(id, { percentualAfiliado: val });
      setProdutos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, comissao: Number(val) } : p)),
      );
    } catch (e) {
      alert("Erro ao actualizar comissão: " + e.message);
    } finally {
      setSalvandoId(null);
    }
  }, 800);

  function handleSlider(id, val) {
    setComissoesLocais((prev) => ({ ...prev, [id]: Number(val) }));
    enviarComissaoDebounced(id, Number(val));
  }

  async function toggleAff(id, aceitaAtual) {
    const acao = aceitaAtual ? "desactivar" : "activar";
    if (
      !window.confirm(
        `Tens a certeza que queres ${acao} os afiliados para este produto?`,
      )
    )
      return;
    setSalvandoId(id);
    try {
      await apiProdutos.atualizarProduto(id, { aceitaAfiliados: !aceitaAtual });
      setProdutos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, afiliados: !aceitaAtual } : p)),
      );
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setSalvandoId(null);
    }
  }

  function copiarLink(codigo) {
    const link = `${window.location.origin}/r/${codigo}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiadoId(codigo);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  const totalGanhoAfiliados = afiliados.reduce(
    (s, a) => s + Number(a.totalGanho || 0),
    0,
  );
  const totalCliques = afiliados.reduce(
    (s, a) => s + Number(a.totalCliques || 0),
    0,
  );
  const totalConversoes = afiliados.reduce(
    (s, a) => s + Number(a.totalConversoes || 0),
    0,
  );
  const nivel = posicao?.nivel ?? "bronze";
  const nivelCls = NIVEL_CLS[nivel] ?? NIVEL_CLS.bronze;

  const SUBTABS = [
    { id: "links", label: "Os meus links" },
    { id: "produtos", label: "Gestão produtos" },
    { id: "historico", label: "Histórico" },
  ];

  if (carregando)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (erro) return <ErroBloco mensagem={erro} onRetry={carregar} />;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Total ganho
          </div>
          <div className="text-lg font-semibold font-mono text-gray-900">
            {fmtK(totalGanhoAfiliados)}
          </div>
          <div className="text-xs text-gray-400">MZN</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Cliques
          </div>
          <div className="text-lg font-semibold font-mono text-gray-900">
            {totalCliques}
          </div>
          <div className="text-xs text-gray-400">total</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Conversões
          </div>
          <div className="text-lg font-semibold font-mono text-gray-900">
            {totalConversoes}
          </div>
          <div className="text-xs text-gray-400">
            {totalCliques > 0
              ? ((totalConversoes / totalCliques) * 100).toFixed(1) + "%"
              : "0%"}{" "}
            taxa
          </div>
        </div>
        <div
          className={`rounded-xl p-3 border ${nivelCls.bg} ${nivelCls.border}`}
        >
          <div
            className={`text-xs uppercase tracking-wide mb-1 font-medium ${nivelCls.text}`}
          >
            Nível
          </div>
          <div className={`text-lg font-bold capitalize ${nivelCls.text}`}>
            {nivel}
          </div>
          {posicao?.posicao && (
            <div className={`text-xs ${nivelCls.text} opacity-70`}>
              #{posicao.posicao} no ranking
            </div>
          )}
          {posicao?.proximoNivel && (
            <div className={`text-xs mt-1 ${nivelCls.text} opacity-70`}>
              faltam {fmtK(posicao.proximoNivel.faltaParaProximo)} MZN →{" "}
              {posicao.proximoNivel.nome}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-0
              ${subTab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 bg-transparent"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "links" && (
        <div className="flex flex-col gap-2">
          {afiliados.length === 0 && (
            <EstadoVazio texto="Ainda não criaste nenhum link de afiliado." />
          )}
          {afiliados.map((a) => (
            <div
              key={a.id}
              className="p-4 bg-white border border-gray-100 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {a.produto?.imagem ? (
                    <img
                      src={a.produto.imagem}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Ico.Produto />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {a.produto?.nome ?? "Produto"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.cliques ?? 0} cliques · {a.conversoes ?? 0} conversões ·{" "}
                    {Number(a.comissao ?? 0)}% comissão
                  </p>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-sm font-semibold text-green-600 font-mono">
                    {fmt(a.ganho)}
                  </p>
                  <p className="text-xs text-gray-400">ganhos</p>
                </div>
                <button
                  onClick={() => copiarLink(a.codigoAfiliado)}
                  title="Copiar link"
                  className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors cursor-pointer bg-transparent flex-shrink-0
                    ${
                      copiadoId === a.codigoAfiliado
                        ? "border-green-400 text-green-600"
                        : "border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500"
                    }`}
                >
                  {copiadoId === a.codigoAfiliado ? (
                    <Ico.Check />
                  ) : (
                    <Ico.Copy />
                  )}
                </button>
              </div>
              <div className="mt-2 px-1">
                <p className="text-xs text-gray-300 font-mono truncate">
                  {window.location.origin}/r/{a.codigoAfiliado}
                </p>
              </div>
            </div>
          ))}

          {estatisticas?.maisLucrativos?.length > 0 && (
            <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-semibold text-blue-800 mb-3 uppercase tracking-wide">
                Top produtos afiliados
              </p>
              <div className="flex flex-col gap-2">
                {estatisticas.maisLucrativos.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-800 flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-xs font-medium text-blue-900 flex-1 truncate">
                      {t.produtoNome}
                    </p>
                    <span className="text-xs text-blue-700 font-mono">
                      {t.taxaConversao}%
                    </span>
                    <span className="text-xs text-blue-800 font-semibold font-mono">
                      {fmtK(t.ganho)} MZN
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === "produtos" && (
        <div className="flex flex-col gap-2">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-2 flex gap-2 items-start">
            <div className="mt-0.5 flex-shrink-0 text-blue-600">
              <Ico.Info />
            </div>
            <p className="text-xs text-blue-800">
              Afiliados promovem os seus produtos e recebem comissão apenas
              quando há venda. Você só paga quando vende.
            </p>
          </div>
          {produtos.length === 0 && (
            <EstadoVazio texto="Sem produtos para gerir." />
          )}
          {produtos.map((p) => {
            const comissaoLocal =
              comissoesLocais[p.id] !== undefined
                ? comissoesLocais[p.id]
                : p.comissao;
            const salvando = salvandoId === p.id;
            return (
              <div
                key={p.id}
                className="p-4 bg-white border border-gray-100 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    {p.tipo === "produto" ? <Ico.Produto /> : <Ico.Servico />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {p.nome}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.afiliados
                        ? `Comissão: ${comissaoLocal}% · activo`
                        : "Afiliados desactivados"}
                      {salvando && (
                        <span className="ml-2 text-amber-500">
                          A guardar...
                        </span>
                      )}
                    </p>
                  </div>
                  <Toggle
                    value={p.afiliados}
                    onChange={() => toggleAff(p.id, p.afiliados)}
                  />
                </div>
                {p.afiliados && (
                  <div className="mt-3 flex items-center gap-3 px-1 bg-gray-50 rounded-lg p-2">
                    <span className="text-xs text-gray-500 w-28 flex-shrink-0">
                      Comissão: {comissaoLocal}%
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={comissaoLocal}
                      onChange={(e) => handleSlider(p.id, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {subTab === "historico" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400">
              {totalComissoes} comissões no total
            </p>
          </div>
          {comissoes.length === 0 ? (
            <EstadoVazio texto="Nenhuma comissão registada ainda." />
          ) : (
            <div className="flex flex-col gap-2">
              {comissoes.map((c) => {
                const estadoCls =
                  {
                    PENDENTE: "bg-amber-100 text-amber-700",
                    EM_VALIDACAO: "bg-blue-100 text-blue-700",
                    DISPONIVEL: "bg-green-100 text-green-700",
                    PAGA: "bg-gray-100 text-gray-500",
                    CANCELADA: "bg-red-100 text-red-600",
                  }[c.estado] ?? "bg-gray-100 text-gray-500";

                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {c.produto}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Pedido #{c.pedidoId?.substring(0, 8)} ·{" "}
                        {fmtData(c.data)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-green-600 font-mono">
                        {fmt(c.valor)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoCls}`}
                      >
                        {c.estado?.toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Paginacao
            pagina={paginaComissoes}
            totalPaginas={totalPaginasCom}
            onChange={setPaginaComissoes}
          />
        </div>
      )}
    </div>
  );
}

// ── TAB PRODUTOS — com paginação e carregar mais ──────────────────
function TabProdutos({
  produtos,
  setProdutos,
  onPublicar,
  onEditar,
  paginaProdutos,
  totalProdutosPaginas,
  carregandoMais,
  onCarregarMais,
}) {
  const [filtro, setFiltro] = useState("todos");
  const [acaoId, setAcaoId] = useState(null);

  const FILTROS = [
    "todos",
    "activo",
    "pausado",
    "pendente aprovacao",
    "produto",
    "servico",
  ];

  const lista =
    filtro === "todos"
      ? produtos
      : produtos.filter((p) => p.estado === filtro || p.tipo === filtro);

  async function toggleEstado(id, estadoActual) {
    setAcaoId(id);
    try {
      if (estadoActual === "activo") {
        await apiProdutos.pausarProduto(id);
        setProdutos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, estado: "pausado" } : p)),
        );
      } else {
        await apiProdutos.reativarProduto(id);
        setProdutos((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, estado: "pendente aprovacao" } : p,
          ),
        );
      }
    } catch (e) {
      alert("Erro ao alterar estado: " + e.message);
    } finally {
      setAcaoId(null);
    }
  }

  async function eliminar(id) {
    if (
      !window.confirm(
        "Tens a certeza que queres eliminar este anúncio? Esta acção é irreversível.",
      )
    )
      return;
    setAcaoId(id);
    try {
      await apiProdutos.eliminarProduto(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert("Erro ao eliminar: " + e.message);
    } finally {
      setAcaoId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Os meus anúncios{" "}
          <span className="font-normal text-gray-400 text-xs">
            ({lista.length})
          </span>
        </p>
        <button
          onClick={onPublicar}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0"
        >
          <Ico.Plus /> Publicar
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
              ${
                filtro === f
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-200 text-gray-500 hover:border-green-400 bg-transparent"
              }`}
          >
            {f === "servico"
              ? "Serviço"
              : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {lista.length === 0 && (
          <EstadoVazio texto="Nenhum anúncio encontrado." />
        )}
        {lista.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition-all"
          >
            <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
              {p.imagens?.[0] ? (
                <img
                  src={p.imagens[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : p.tipo === "produto" ? (
                <Ico.Produto />
              ) : (
                <Ico.Servico />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {p.nome}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {p.vendas ?? 0} vendas ·{" "}
                {p.tipo === "produto" ? `Stock: ${p.stock ?? 0}` : "Serviço"}
              </p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.estado === "activo" ? "bg-green-100 text-green-800" : p.estado === "rejeitado" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {p.estado}
                </span>
                {p.afiliados && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
                    Afiliados {p.comissao}%
                  </span>
                )}
                {p.entrega && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                    Entrega
                  </span>
                )}
              </div>
              {p.motivoRejeicao && (
                <p className="text-xs text-red-500 mt-1 truncate">
                  Rejeitado: {p.motivoRejeicao}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0 hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 font-mono">
                {Number(p.preco).toLocaleString("pt-MZ")} MZN
              </p>
              <p className="text-xs text-gray-400">preço base</p>
              <p className="text-xs text-green-600 mt-0.5">
                recebe {Math.round(p.preco * 0.895).toLocaleString("pt-MZ")}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <IconBtn title="Editar" onClick={() => onEditar(p)}>
                <Ico.Edit />
              </IconBtn>
              <IconBtn
                title={p.estado === "activo" ? "Pausar" : "Activar"}
                onClick={() => toggleEstado(p.id, p.estado)}
                disabled={acaoId === p.id}
              >
                {p.estado === "activo" ? <Ico.Pause /> : <Ico.Play />}
              </IconBtn>
              <IconBtn
                danger
                title="Eliminar"
                onClick={() => eliminar(p.id)}
                disabled={acaoId === p.id}
              >
                <Ico.Trash />
              </IconBtn>
            </div>
          </div>
        ))}
      </div>

      {/* Carregar mais */}
      {paginaProdutos < totalProdutosPaginas && (
        <div className="mt-4 text-center">
          <button
            onClick={onCarregarMais}
            disabled={carregandoMais}
            className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-400 hover:text-green-700 bg-transparent cursor-pointer disabled:opacity-60 flex items-center gap-2 mx-auto"
          >
            {carregandoMais ? (
              <>
                <Spinner small /> A carregar...
              </>
            ) : (
              "Carregar mais"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── TAB PROMOÇÕES — completa com modal ───────────────────────────
function TabPromocoes({ produtos }) {
  const [modalProduto, setModalProduto] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  const produtosAtivos = produtos.filter(
    (p) => p.estado === "ativo" || p.estado === "activo",
  );

  function handleSucesso(prod) {
    setSucesso(prod.nome);
    setTimeout(() => setSucesso(null), 4000);
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-4">
        Promoções e destaque
      </p>

      {sucesso && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl mb-4 flex items-center gap-2">
          <span className="text-green-600">
            <Ico.Check />
          </span>
          <p className="text-xs text-green-800 font-medium">
            Promoção activada para "{sucesso}"!
          </p>
        </div>
      )}

      {/* Explicação */}
      <div className="p-4 bg-white border border-gray-100 rounded-xl mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-500">
            <Ico.Megaphone />
          </span>
          <span className="text-sm font-semibold text-gray-800">
            Como funcionam as promoções?
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Pague uma taxa e o seu anúncio ganha prioridade no feed. Mais
          visibilidade significa mais cliques e mais vendas.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PROMO_PLANOS.map((pl) => (
            <div
              key={pl.id}
              className={`p-3 rounded-xl border ${pl.popular ? "border-amber-300 bg-amber-50" : "border-gray-100 bg-gray-50"}`}
            >
              {pl.popular && (
                <div className="text-xs font-bold text-amber-700 mb-1">
                  POPULAR
                </div>
              )}
              <div className="text-sm font-bold text-gray-900">{pl.nome}</div>
              <div className="text-xs text-gray-500 mt-1">{pl.duracao}</div>
              <div className="text-sm font-bold text-green-600 mt-2 font-mono">
                {pl.preco} MZN
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de produtos elegíveis */}
      <p className="text-sm font-semibold text-gray-800 mb-3">
        Anúncios elegíveis{" "}
        <span className="font-normal text-gray-400 text-xs">
          ({produtosAtivos.length})
        </span>
      </p>

      {produtosAtivos.length === 0 ? (
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
          <p className="text-sm text-gray-400 mb-2">
            Nenhum produto activo para promover.
          </p>
          <p className="text-xs text-gray-300">
            Activa um produto primeiro para poder promovê-lo.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {produtosAtivos.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-amber-200 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
                {p.imagens?.[0] ? (
                  <img
                    src={p.imagens[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : p.tipo === "produto" ? (
                  <Ico.Produto />
                ) : (
                  <Ico.Servico />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {p.nome}
                </p>
                <p className="text-xs text-gray-400">
                  {p.vendas ?? 0} vendas · {fmt(p.preco)}
                </p>
              </div>
              <button
                onClick={() => setModalProduto(p)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg border-0 cursor-pointer transition-colors flex-shrink-0"
              >
                <Ico.Zap /> Promover
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Todos os outros produtos (pausados, pendentes) com aviso */}
      {produtos.filter((p) => p.estado !== "ativo" && p.estado !== "activo")
        .length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-2">Produtos não elegíveis</p>
          {produtos
            .filter((p) => p.estado !== "ativo" && p.estado !== "activo")
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl mb-1.5 opacity-60"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0">
                  {p.tipo === "produto" ? <Ico.Produto /> : <Ico.Servico />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-400">{p.estado}</p>
                </div>
                <span className="text-xs text-gray-400 px-2 py-1 border border-gray-200 rounded-lg">
                  Indisponível
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Modal de Promoção */}
      {modalProduto && (
        <ModalPromocao
          produto={modalProduto}
          onClose={() => setModalProduto(null)}
          onSucesso={() => handleSucesso(modalProduto)}
        />
      )}
    </div>
  );
}

// ── TAB ESTATÍSTICAS — com gráfico real ──────────────────────────
function TabStats({ produtos, statsVendas, resumo }) {
  const top = [...produtos]
    .sort((a, b) => (b.vendas ?? 0) - (a.vendas ?? 0))
    .slice(0, 5);
  const max = Math.max(1, top[0]?.vendas || 1);
  const RANK_CLS = [
    "bg-green-500",
    "bg-blue-500",
    "bg-amber-400",
    "bg-gray-400",
    "bg-gray-300",
  ];

  const totalComissoesPagas = produtos
    .filter((p) => p.afiliados)
    .reduce(
      (acc, p) => acc + (p.vendas ?? 0) * p.preco * (p.comissao / 100),
      0,
    );

  const totalReceita = resumo?.carteira?.ganhoVendas ?? null;
  const totalVendas = statsVendas?.totalVendas ?? null;
  const saldoDisp = resumo?.carteira?.saldoDisponivel ?? null;

  // Gráfico simples de barras (estado dos produtos)
  const estadosCounts = {
    Activo: produtos.filter((p) => p.estado === "activo").length,
    Pausado: produtos.filter((p) => p.estado === "pausado").length,
    Pendente: produtos.filter((p) => p.estado.includes("pendente")).length,
    Rejeitado: produtos.filter((p) => p.estado === "rejeitado").length,
  };
  const maxCount = Math.max(1, ...Object.values(estadosCounts));
  const barCls = {
    Activo: "bg-green-500",
    Pausado: "bg-amber-400",
    Pendente: "bg-blue-400",
    Rejeitado: "bg-red-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Desempenho detalhado
        </p>
      </div>

      {/* KPIs reais */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Receita total
          </div>
          <div className="text-lg font-semibold font-mono">
            {totalReceita !== null ? fmtK(totalReceita) : "—"}
          </div>
          <div className="text-xs text-gray-400">MZN líquido</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Saldo disponível
          </div>
          <div className="text-lg font-semibold font-mono">
            {saldoDisp !== null ? fmtK(saldoDisp) : "—"}
          </div>
          <div className="text-xs text-gray-400">MZN na carteira</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Total vendas
          </div>
          <div className="text-lg font-semibold font-mono">
            {totalVendas ?? "—"}
          </div>
          <div className="text-xs text-gray-400">pedidos</div>
        </div>
      </div>

      {/* Gráfico de barras — distribuição de estado dos produtos */}
      {produtos.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Distribuição de produtos
          </p>
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-end gap-4 h-28">
              {Object.entries(estadosCounts).map(([estado, count]) => (
                <div
                  key={estado}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-mono text-gray-600">
                    {count}
                  </span>
                  <div
                    className="w-full flex flex-col justify-end"
                    style={{ height: 80 }}
                  >
                    <div
                      className={`w-full rounded-t-md transition-all ${barCls[estado]}`}
                      style={{
                        height: `${Math.round((count / maxCount) * 80)}px`,
                        minHeight: count > 0 ? 4 : 0,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 text-center">
                    {estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top mais vendidos */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Mais vendidos
      </p>
      <div className="flex flex-col gap-3 mb-5">
        {top.length === 0 && (
          <EstadoVazio texto="Nenhum dado de vendas ainda." />
        )}
        {top.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${RANK_CLS[i] || "bg-gray-200"}`}
            >
              {i + 1}
            </div>
            <p className="text-sm font-medium text-gray-800 flex-1 truncate min-w-0">
              {p.nome}
            </p>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${Math.round(((p.vendas ?? 0) / max) * 100)}%`,
                }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 flex-shrink-0 font-mono w-8 text-right">
              {p.vendas ?? 0}
            </span>
          </div>
        ))}
      </div>

      {/* Informações de taxas */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Estrutura de taxas
      </p>
      <div className="p-4 bg-white border border-gray-100 rounded-xl text-xs text-gray-600 space-y-2">
        <div className="flex justify-between">
          <span>Taxa plataforma (produtos físicos)</span>
          <span className="font-mono font-semibold text-gray-800">10%</span>
        </div>
        <div className="flex justify-between">
          <span>Taxa plataforma (serviços)</span>
          <span className="font-mono font-semibold text-gray-800">15%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-700">Comissões afiliados (est.)</span>
          <span className="font-mono font-semibold text-amber-800">
            {fmtK(totalComissoesPagas)} MZN
          </span>
        </div>
        <div className="border-t border-gray-100 pt-2 flex justify-between text-green-700 font-semibold">
          <span>Você recebe por cada venda</span>
          <span className="font-mono">89.5% do preço</span>
        </div>
      </div>

      {/* Sugestões */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 mt-5">
        Sugestões
      </p>
      <div className="flex flex-col gap-2">
        {top[0] && (
          <div className="flex gap-3 p-3 rounded-xl border border-green-100 bg-green-50 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Ico.Trend />
            </div>
            <div>
              <div className="text-xs font-semibold text-green-800">
                Produto com mais vendas: {top[0]?.nome ?? "—"}
              </div>
              <div className="text-xs text-green-700 mt-0.5">
                Considera aumentar o stock e activar promoção para maximizar
                receita.
              </div>
            </div>
          </div>
        )}
        {produtos.some((p) => !p.afiliados && p.estado === "activo") && (
          <div className="flex gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Ico.Users />
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-800">
                Tens produtos sem afiliados
              </div>
              <div className="text-xs text-blue-700 mt-0.5">
                Activar afiliados pode aumentar vendas para produtos de alto
                valor.
              </div>
            </div>
          </div>
        )}
        {produtos.some((p) => p.estado === "rejeitado") && (
          <div className="flex gap-3 p-3 rounded-xl border border-red-100 bg-red-50 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <Ico.Alert />
            </div>
            <div>
              <div className="text-xs font-semibold text-red-800">
                Tens produtos rejeitados
              </div>
              <div className="text-xs text-red-700 mt-0.5">
                Verifica o motivo na tab Produtos e corrige para resubmeter.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MODAL PUBLICAR / EDITAR ───────────────────────────────────────
// ── MODAL PUBLICAR / EDITAR ───────────────────────────────────────
// Drop-in replacement para SecaoVendas.jsx
//
// v3 — correcções e melhorias:
//  • Imagens disponíveis para SERVIÇOS (etapa 1, igual a produtos)
//  • Novos campos exclusivos de serviço:
//    - Modalidade: presencial / remoto / ambos
//    - Idiomas disponíveis (multi-select)
//    - Tags / palavras-chave (até 5)
//    - Tempo de resposta estimado
//    - Portfolio / link externo
//    - Extras pagos por plano (urgência, ficheiro fonte, etc.)
//  • Resumo final expandido com todos os campos
// ─────────────────────────────────────────────────────────────────// src/components/ModalPublicar.jsx

// ── Constantes fora do componente (não recriadas em cada render) ──
const PROVINCES = [
  "Maputo Cidade", "Maputo Província", "Matola", "Sofala", "Nampula",
  "Gaza", "Inhambane", "Manica", "Tete", "Zambézia", "Cabo Delgado", "Niassa",
];

const IDIOMAS_DISPONIVEIS = [
  "Português", "Inglês", "Francês", "Espanhol", "Árabe",
  "Changana", "Sena", "Macua", "Ndau", "Tswa",
];

const TEMPOS_RESPOSTA = ["1h", "4h", "8h", "24h", "48h", "72h"];

const METODOS_DISP = ["MPESA", "EMOLA", "MKESH", "SALDO_INTERNO"];

const MODALIDADES = [
  { val: "remoto",     label: "Remoto",     icon: "🌐", desc: "Entregue online, em qualquer lugar" },
  { val: "presencial", label: "Presencial", icon: "📍", desc: "Encontro físico necessário" },
  { val: "ambos",      label: "Ambos",      icon: "🔀", desc: "Presencial ou remoto conforme o cliente" },
];

const PLANOS_DEFAULT = [
  { id: "basico",   nome: "Básico",   desc: "", preco: "", prazo: "3",  revisoes: "1",          extras: [] },
  { id: "standard", nome: "Standard", desc: "", preco: "", prazo: "7",  revisoes: "3",          extras: [] },
  { id: "premium",  nome: "Premium",  desc: "", preco: "", prazo: "14", revisoes: "ilimitadas", extras: [] },
];

// ── Helper: normaliza tipo vindo do backend ────────────────────────
// Backend guarda "FISICO"/"SERVICO", modal usa "produto"/"servico"
function normalizarTipo(tipo) {
  if (!tipo) return "produto";
  if (tipo === "FISICO")  return "produto";
  if (tipo === "SERVICO") return "servico";
  return tipo; // já normalizado ("produto" / "servico")
}

// ── Componente ─────────────────────────────────────────────────────
function ModalPublicar({ item, onClose, onSalvar }) {

  // BUG CORRIGIDO: tipo normalizado — backend retorna "FISICO"/"SERVICO"
  const [tipo, setTipo] = useState(() => normalizarTipo(item?.tipo));

  // ── Campos comuns ─────────────────────────────────────────────
  const [nome,     setNome]     = useState(item?.nome      || "");
  const [desc,     setDesc]     = useState(item?.descricao || "");
  // BUG CORRIGIDO: era item?.cat — backend retorna categoriaId
  const [cat,      setCat]      = useState(item?.categoriaId || item?.cat || "");
  const [provincia, setProvincia] = useState(item?.provincia || "");
  // BUG CORRIGIDO: era item?.afiliados — backend retorna aceitaAfiliados
  const [afiliados, setAfiliados] = useState(item?.aceitaAfiliados ?? false);
  // BUG CORRIGIDO: era item?.comissao — backend retorna percentualAfiliado
  const [comissao,  setComissao]  = useState(item?.percentualAfiliado ?? 5);
  // BUG CORRIGIDO: era item?.entrega — backend retorna entregaDisponivel
  const [entrega,   setEntrega]   = useState(item?.entregaDisponivel ?? true);
  // BUG CORRIGIDO: FileList substituído por Array para permitir remoção individual
  const [imagensArray, setImagensArray] = useState([]);
  const [previews,     setPreviews]     = useState(item?.imagens ?? []);
  const [enviando,  setEnviando]  = useState(false);
  const [cats,      setCats]      = useState([]);
  const [catsCarregando, setCatsCarregando] = useState(true);
  const [etapa,     setEtapa]     = useState(1);

  // ── Campos produto ────────────────────────────────────────────
  const [preco,      setPreco]      = useState(item?.preco      || "");
  const [stock,      setStock]      = useState(item?.stock      || "");
  const [estadoItem, setEstadoItem] = useState(item?.estadoItem || "NOVO");

  // ── Campos exclusivos de serviço ──────────────────────────────
  const [modalidade,    setModalidade]    = useState(item?.modalidade    || "remoto");
  const [idiomasSel,    setIdiomasSel]    = useState(item?.idiomas       || ["Português"]);
  const [tags,          setTags]          = useState(item?.tags          || []);
  const [tagInput,      setTagInput]      = useState("");
  const [tempoResposta, setTempoResposta] = useState(item?.tempoResposta || "24h");
  const [portfolio,     setPortfolio]     = useState(item?.portfolio     || "");
  // BUG CORRIGIDO: garante sempre um Array válido
  const [metodosPagamento, setMetodosPagamento] = useState(() =>
    Array.isArray(item?.metodosPagamento) && item.metodosPagamento.length
      ? item.metodosPagamento
      : ["MPESA", "EMOLA"]
  );

  // ── Planos de serviço ─────────────────────────────────────────
  // BUG CORRIGIDO: usa inicializador lazy — não recalcula em cada render
  const [planos, setPlanos] = useState(() =>
    item?.planos?.length ? item.planos : PLANOS_DEFAULT
  );

  // ── Cleanup de object URLs ao desmontar ───────────────────────
  // BUG CORRIGIDO: evita memory leak de object URLs não revogadas
  useEffect(() => {
    return () => {
      previews.forEach(url => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Carregar categorias ───────────────────────────────────────
  useEffect(() => {
    apiProdutos
      .categorias()
      .then((r) => setCats(r.dados ?? r.data ?? []))
      .catch(() => setCats([]))
      .finally(() => setCatsCarregando(false));
  }, []);

  // ── Imagens ───────────────────────────────────────────────────
  // BUG CORRIGIDO: acumula ficheiros em vez de substituir;
  // usa Array em vez de FileList para permitir remoção por índice
  function handleImagens(files) {
    if (!files?.length) return;
    const novos = Array.from(files);
    const novasUrls = novos.map(f => URL.createObjectURL(f));
    setImagensArray(prev => [...prev, ...novos]);
    setPreviews(prev => [...prev, ...novasUrls]);
  }

  // BUG CORRIGIDO: remove o File real e revoga a object URL
  function removerPreview(idx) {
    setPreviews(prev => {
      const url = prev[idx];
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
    setImagensArray(prev => prev.filter((_, i) => i !== idx));
  }

  // ── Tags ──────────────────────────────────────────────────────
  function adicionarTag(e) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const val = tagInput.trim().toLowerCase().replace(/[^a-záéíóúàâãêôçüñ0-9\s-]/gi, "");
    if (!val || tags.includes(val) || tags.length >= 5) return;
    setTags(prev => [...prev, val]);
    setTagInput("");
  }

  function removerTag(t) {
    setTags(prev => prev.filter(x => x !== t));
  }

  // ── Idiomas ───────────────────────────────────────────────────
  function toggleIdioma(idioma) {
    setIdiomasSel(prev =>
      prev.includes(idioma) ? prev.filter(i => i !== idioma) : [...prev, idioma]
    );
  }

  // ── Métodos de pagamento ──────────────────────────────────────
  function toggleMetodo(m) {
    setMetodosPagamento(prev =>
      prev.includes(m)
        ? prev.length > 1 ? prev.filter(x => x !== m) : prev
        : [...prev, m]
    );
  }

  // ── Planos ────────────────────────────────────────────────────
  function atualizarPlano(id, campo, valor) {
    setPlanos(prev => prev.map(p => p.id === id ? { ...p, [campo]: valor } : p));
  }

  function adicionarPlano() {
    if (planos.length >= 5) return;
    setPlanos(prev => [
      ...prev,
      { id: `plano_${Date.now()}`, nome: "Novo plano", desc: "", preco: "", prazo: "7", revisoes: "1", extras: [] },
    ]);
  }

  function removerPlano(id) {
    if (planos.length <= 1) return;
    setPlanos(prev => prev.filter(p => p.id !== id));
  }

  function adicionarExtra(planoId) {
    setPlanos(prev => prev.map(p =>
      p.id === planoId
        ? { ...p, extras: [...(p.extras || []), { id: Date.now(), nome: "", preco: "" }] }
        : p
    ));
  }

  function atualizarExtra(planoId, extraId, campo, valor) {
    setPlanos(prev => prev.map(p =>
      p.id === planoId
        ? { ...p, extras: p.extras.map(e => e.id === extraId ? { ...e, [campo]: valor } : e) }
        : p
    ));
  }

  function removerExtra(planoId, extraId) {
    setPlanos(prev => prev.map(p =>
      p.id === planoId
        ? { ...p, extras: p.extras.filter(e => e.id !== extraId) }
        : p
    ));
  }

  // ── Mudar tipo (reseta etapa para evitar etapa inválida) ──────
  // BUG CORRIGIDO: mudar tipo sem resetar etapa podia deixar em etapa 4 quando só há 3
  function mudarTipo(t) {
    setTipo(t);
    setEtapa(1);
  }

  // ── Taxas ─────────────────────────────────────────────────────
  const taxaPct = tipo === "servico" ? 0.15 : 0.105;
  const taxa    = preco ? Math.round(Number(preco) * taxaPct) : 0;
  const liquido = preco ? Math.round(Number(preco) - taxa) : 0;

  // ── Validações ────────────────────────────────────────────────
  function validarEtapa1() {
    if (!nome.trim())     { alert("Preenche o nome do anúncio.");                       return false; }
    if (desc.length < 10) { alert("Descrição deve ter pelo menos 10 caracteres.");      return false; }
    if (!cat)             { alert("Seleciona uma categoria.");                          return false; }
    if (!provincia)       { alert("Seleciona uma província.");                          return false; }
    return true;
  }

  function validarEtapa2() {
    if (tipo === "produto") {
      if (!preco || Number(preco) <= 0) { alert("Preenche o preço."); return false; }
    } else {
      const semPreco = planos.filter(p => !p.preco || Number(p.preco) <= 0);
      if (semPreco.length) { alert("Todos os planos precisam de ter um preço válido."); return false; }
      const semPrazo = planos.filter(p => !p.prazo || Number(p.prazo) <= 0);
      if (semPrazo.length) { alert("Todos os planos precisam de ter um prazo de entrega."); return false; }
    }
    return true;
  }

  // ── Guardar ───────────────────────────────────────────────────
  async function handleSalvar() {
    if (!validarEtapa2()) return;
    setEnviando(true);
    try {
      await onSalvar({
        id:                 item?.id,
        nome:               nome.trim(),
        descricao:          desc,
        // Envia no formato que o backend espera
        tipo:               tipo === "produto" ? "FISICO" : "SERVICO",
        categoriaId:        cat,
        provincia,
        aceitaAfiliados:    Boolean(afiliados),
        percentualAfiliado: afiliados ? Number(comissao) : 0,
        metodosPagamento,
        // BUG CORRIGIDO: envia Array de Files em vez do FileList original
        imagens:            imagensArray.length > 0 ? imagensArray : null,
        // Produto
        ...(tipo === "produto" && {
          preco:             Number(preco),
          stock:             Number(stock) || 0,
          estadoItem,
          entregaDisponivel: entrega,
        }),
        // Serviço
        ...(tipo === "servico" && {
          preco:         Math.min(...planos.map(p => Number(p.preco) || Infinity)),
          modalidade,
          idiomas:       idiomasSel,
          tags,
          tempoResposta,
          portfolio:     portfolio.trim() || undefined,
          planos: planos.map(p => ({
            id:           p.id,
            nome:         p.nome,
            descricao:    p.desc,
            preco:        Number(p.preco),
            prazoEntrega: Number(p.prazo),
            revisoes:     p.revisoes,
            extras:       (p.extras || [])
              .filter(e => e.nome && Number(e.preco) > 0)
              .map(e => ({ nome: e.nome, preco: Number(e.preco) })),
          })),
        }),
      });
      onClose();
    } catch (e) {
      alert("Erro ao guardar: " + e.message);
    } finally {
      setEnviando(false);
    }
  }

  // ── Etapas ────────────────────────────────────────────────────
  const ETAPAS = tipo === "servico"
    ? ["Informação", "Planos", "Detalhes", "Extras"]
    : ["Informação", "Preço", "Extras"];
  const totalEtapas = ETAPAS.length;

  // ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 50, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
        style={{ maxHeight: "93vh" }}
      >
        {/* ══ Cabeçalho ══ */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {item ? "Editar anúncio" : "Publicar anúncio"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Etapa {etapa} de {totalEtapas} — <span className="text-gray-600 font-medium">{ETAPAS[etapa - 1]}</span>
              </p>
            </div>
            <button onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-1 mt-0.5">
              <Ico.X />
            </button>
          </div>

          {/* Barra de progresso */}
          <div className="flex gap-1 mb-3">
            {ETAPAS.map((_, i) => (
              <div key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i + 1 <= etapa ? "bg-green-500" : "bg-gray-100"}`}
              />
            ))}
          </div>

          {/* Toggle produto / serviço — só na etapa 1 */}
          {etapa === 1 && (
            <div className="flex gap-2 mt-1">
              {["produto", "servico"].map(t => (
                <button key={t}
                  // BUG CORRIGIDO: mudarTipo() em vez de setTipo() — reseta a etapa
                  onClick={() => mudarTipo(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5
                    ${tipo === t ? "border-green-500 text-green-700 bg-green-50" : "border-gray-200 text-gray-500 bg-transparent hover:border-gray-300"}`}>
                  {t === "produto" ? <><Ico.Produto /> Produto físico</> : <><Ico.Servico /> Serviço</>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══ Corpo scrollável ══ */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* ════════ ETAPA 1 — Informação + Imagens ════════ */}
          {etapa === 1 && (
            <>
              {/* Nome */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Nome do anúncio *</label>
                <input value={nome} onChange={e => setNome(e.target.value)}
                  placeholder={tipo === "servico" ? "ex: Design de logótipos profissionais" : "ex: Smartphone Samsung A54"}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors" />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Descrição *</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
                  placeholder={
                    tipo === "servico"
                      ? "O que incluis, para quem é, o que o cliente recebe, requisitos necessários..."
                      : "Características, estado, dimensões, o que está incluído na caixa..."
                  }
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none transition-colors
                    ${desc.length > 0 && desc.length < 10 ? "border-red-300" : "border-gray-200 focus:border-green-500"}`}
                />
                <p className={`text-xs mt-0.5 text-right ${desc.length < 10 ? "text-red-400" : "text-gray-400"}`}>
                  {desc.length} car. {desc.length >= 10 ? "✓" : `(faltam ${10 - desc.length})`}
                </p>
              </div>

              {/* Categoria */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Categoria *</label>
                <select value={cat} onChange={e => setCat(e.target.value)} disabled={catsCarregando}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 disabled:opacity-60 bg-white">
                  <option value="">{catsCarregando ? "A carregar..." : "Selecionar categoria..."}</option>
                  {cats.map(c => (
                    <option key={c.id} value={c.id}>{c.icone ? `${c.icone} ` : ""}{c.nome}</option>
                  ))}
                </select>
              </div>

              {/* Província */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Província *</label>
                <select value={provincia} onChange={e => setProvincia(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white">
                  <option value="">Selecionar província...</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Estado do item — apenas produto */}
              {tipo === "produto" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-2">Estado do item *</label>
                  <div className="flex gap-2">
                    {[
                      { val: "NOVO",  label: "Novo",  desc: "Nunca usado / em caixa" },
                      { val: "USADO", label: "Usado", desc: "Já utilizado, bom estado" },
                    ].map(({ val, label, desc: d }) => (
                      <button key={val} onClick={() => setEstadoItem(val)}
                        className={`flex-1 p-3 rounded-xl border text-left cursor-pointer bg-transparent transition-all
                          ${estadoItem === val ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${estadoItem === val ? "border-green-500" : "border-gray-300"}`}>
                            {estadoItem === val && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          </div>
                          <span className={`text-sm font-semibold ${estadoItem === val ? "text-green-700" : "text-gray-600"}`}>{label}</span>
                        </div>
                        <p className="text-xs text-gray-400 pl-5">{d}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Imagens */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  {tipo === "servico" ? "Imagens do portfólio / trabalhos anteriores" : "Imagens do produto"}
                  <span className="font-normal text-gray-400 ml-1">(máx. 12)</span>
                </label>

                {previews.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        {/* BUG CORRIGIDO: remove o File real + revoga a URL */}
                        <button
                          onClick={() => removerPreview(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center border-0 cursor-pointer transition-opacity">
                          <Ico.X />
                        </button>
                      </div>
                    ))}
                    {previews.length < 12 && (
                      <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                        <Ico.Plus />
                        {/* BUG CORRIGIDO: acumula novas imagens sem substituir as anteriores */}
                        <input type="file" accept="image/*" multiple className="hidden"
                          onChange={e => handleImagens(e.target.files)} />
                      </label>
                    )}
                  </div>
                )}

                {previews.length === 0 && (
                  <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="text-xs text-gray-400 text-center">
                      {tipo === "servico"
                        ? "Adiciona exemplos do teu trabalho para atrair mais clientes"
                        : "Clica para adicionar fotos do produto"}
                    </span>
                    <span className="text-xs font-semibold text-green-600">Escolher imagens</span>
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={e => handleImagens(e.target.files)} />
                  </label>
                )}
              </div>
            </>
          )}

          {/* ════════ ETAPA 2 — Preço (produto) OU Planos (serviço) ════════ */}
          {etapa === 2 && tipo === "produto" && (
            <>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Preço (MZN) *</label>
                  <input type="number" value={preco} onChange={e => setPreco(e.target.value)}
                    placeholder="0.00" min="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
                </div>
                <div className="w-28">
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Stock (unid.)</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)}
                    placeholder="qtd." min="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
                </div>
              </div>

              {Number(preco) > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl text-xs space-y-2">
                  <p className="font-semibold text-gray-600 mb-1">Simulação de receita</p>
                  <div className="flex justify-between text-gray-500">
                    <span>Preço de venda</span>
                    <span className="font-mono font-semibold text-gray-800">{Number(preco).toLocaleString("pt-MZ")} MZN</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Taxa plataforma (10.5%)</span>
                    <span className="font-mono text-red-500">−{taxa.toLocaleString("pt-MZ")} MZN</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold text-green-700">Você recebe</span>
                    <span className="font-mono font-black text-green-600">{liquido.toLocaleString("pt-MZ")} MZN</span>
                  </div>
                </div>
              )}
            </>
          )}

          {etapa === 2 && tipo === "servico" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">Planos do serviço</p>
                  <p className="text-xs text-gray-400 mt-0.5">O cliente escolhe o plano que mais lhe convém</p>
                </div>
                <button onClick={adicionarPlano} disabled={planos.length >= 5}
                  className="flex items-center gap-1 text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg border-0 cursor-pointer hover:bg-green-700 disabled:opacity-40 transition-colors">
                  <Ico.Plus /> Plano
                </button>
              </div>

              {planos.map((plano, idx) => {
                const CORES = [
                  { borda: "border-gray-200",   fundo: "bg-gray-50",   badge: "bg-gray-100 text-gray-500",    linha: "border-gray-200" },
                  { borda: "border-blue-200",   fundo: "bg-blue-50",   badge: "bg-blue-100 text-blue-700",    linha: "border-blue-100" },
                  { borda: "border-amber-200",  fundo: "bg-amber-50",  badge: "bg-amber-100 text-amber-700",  linha: "border-amber-100" },
                  { borda: "border-purple-200", fundo: "bg-purple-50", badge: "bg-purple-100 text-purple-700", linha: "border-purple-100" },
                  { borda: "border-rose-200",   fundo: "bg-rose-50",   badge: "bg-rose-100 text-rose-700",    linha: "border-rose-100" },
                ];
                const cor = CORES[idx] ?? CORES[0];
                const liquidoPlano = plano.preco ? Math.round(Number(plano.preco) * 0.85) : 0;

                return (
                  <div key={plano.id} className={`border rounded-2xl p-4 ${cor.borda} ${cor.fundo}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cor.badge}`}>
                          Plano {idx + 1}
                        </span>
                        <input value={plano.nome}
                          onChange={e => atualizarPlano(plano.id, "nome", e.target.value)}
                          className="text-sm font-bold text-gray-900 bg-transparent border-0 border-b border-dashed border-gray-300 focus:outline-none focus:border-green-500 w-32 pb-0.5"
                          placeholder="Nome do plano" />
                      </div>
                      {planos.length > 1 && (
                        <button onClick={() => removerPlano(plano.id)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 bg-transparent border-0 cursor-pointer rounded hover:bg-red-50 transition-colors">
                          <Ico.X />
                        </button>
                      )}
                    </div>

                    <textarea value={plano.desc}
                      onChange={e => atualizarPlano(plano.id, "desc", e.target.value)}
                      rows={2} placeholder="O que está incluído: ex: 1 logótipo, 3 conceitos, ficheiros PNG + SVG"
                      className="w-full text-xs text-gray-600 bg-white/70 border border-white/60 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-green-400 mb-3 transition-colors" />

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Preço (MZN) *</label>
                        <input type="number" min="1" value={plano.preco}
                          onChange={e => atualizarPlano(plano.id, "preco", e.target.value)}
                          placeholder="0"
                          className="w-full border border-white/80 bg-white/80 rounded-lg px-2.5 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:border-green-400" />
                        {liquidoPlano > 0 && (
                          <p className="text-[10px] text-green-600 mt-0.5 font-medium">
                            rec. {liquidoPlano.toLocaleString("pt-MZ")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Prazo (dias) *</label>
                        <input type="number" min="1" max="365" value={plano.prazo}
                          onChange={e => atualizarPlano(plano.id, "prazo", e.target.value)}
                          placeholder="7"
                          className="w-full border border-white/80 bg-white/80 rounded-lg px-2.5 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:border-green-400" />
                        <p className="text-[10px] text-gray-400 mt-0.5">dias úteis</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Revisões</label>
                        <input type="text" value={plano.revisoes}
                          onChange={e => atualizarPlano(plano.id, "revisoes", e.target.value)}
                          placeholder="ex: 2"
                          className="w-full border border-white/80 bg-white/80 rounded-lg px-2.5 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:border-green-400" />
                        <p className="text-[10px] text-gray-400 mt-0.5">"ilimitadas" OK</p>
                      </div>
                    </div>

                    <div className={`pt-3 border-t ${cor.linha}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Extras opcionais</span>
                        <button onClick={() => adicionarExtra(plano.id)}
                          disabled={(plano.extras || []).length >= 4}
                          className="text-[10px] font-semibold text-green-600 bg-transparent border-0 cursor-pointer hover:underline disabled:opacity-40">
                          + Adicionar extra
                        </button>
                      </div>
                      {(plano.extras || []).length === 0 && (
                        <p className="text-[10px] text-gray-400 italic">
                          Ex: entrega urgente, ficheiro fonte editável, versão adicional...
                        </p>
                      )}
                      {(plano.extras || []).map(extra => (
                        <div key={extra.id} className="flex gap-2 mb-1.5 items-center">
                          <input value={extra.nome}
                            onChange={e => atualizarExtra(plano.id, extra.id, "nome", e.target.value)}
                            placeholder="Nome do extra (ex: Urgência 24h)"
                            className="flex-1 border border-white/80 bg-white/80 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-green-400" />
                          <input type="number" min="1" value={extra.preco}
                            onChange={e => atualizarExtra(plano.id, extra.id, "preco", e.target.value)}
                            placeholder="MZN"
                            className="w-20 border border-white/80 bg-white/80 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-green-400" />
                          <button onClick={() => removerExtra(plano.id, extra.id)}
                            className="text-gray-400 hover:text-red-500 bg-transparent border-0 cursor-pointer w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 transition-colors">
                            <Ico.X />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="p-3 bg-white border border-gray-100 rounded-xl text-xs text-gray-500 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5 flex-shrink-0"><Ico.Info /></span>
                <span>Taxa de plataforma: <strong>15%</strong> por serviço. Você recebe 85% do valor de cada plano (e dos extras).</span>
              </div>
            </>
          )}

          {/* ════════ ETAPA 3 — Detalhes do serviço ════════ */}
          {etapa === 3 && tipo === "servico" && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Modalidade de entrega *</label>
                <div className="grid grid-cols-3 gap-2">
                  {MODALIDADES.map(m => (
                    <button key={m.val} onClick={() => setModalidade(m.val)}
                      className={`p-3 rounded-xl border text-center cursor-pointer bg-transparent transition-all
                        ${modalidade === m.val ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="text-xl mb-1">{m.icon}</div>
                      <p className={`text-xs font-bold ${modalidade === m.val ? "text-green-700" : "text-gray-700"}`}>{m.label}</p>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Idiomas em que prestas serviço *</label>
                <div className="flex flex-wrap gap-1.5">
                  {IDIOMAS_DISPONIVEIS.map(idioma => (
                    <button key={idioma} onClick={() => toggleIdioma(idioma)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all
                        ${idiomasSel.includes(idioma)
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}>
                      {idioma}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Tempo de resposta estimado</label>
                <div className="flex gap-2 flex-wrap">
                  {TEMPOS_RESPOSTA.map(t => (
                    <button key={t} onClick={() => setTempoResposta(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all
                        ${tempoResposta === t
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  Palavras-chave / tags
                  <span className="font-normal text-gray-400 ml-1">(máx. 5, pressiona Enter ou vírgula)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 border border-gray-200 rounded-xl min-h-[42px] focus-within:border-green-500 transition-colors">
                  {tags.map(t => (
                    <span key={t} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {t}
                      <button onClick={() => removerTag(t)}
                        className="text-gray-400 hover:text-red-500 bg-transparent border-0 cursor-pointer leading-none">×</button>
                    </span>
                  ))}
                  {tags.length < 5 && (
                    <input value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={adicionarTag}
                      placeholder={tags.length === 0 ? "ex: design, logótipo, branding" : ""}
                      className="flex-1 min-w-[120px] text-xs focus:outline-none bg-transparent border-0" />
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  Link de portfólio <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-green-500 transition-colors">
                  <span className="px-3 py-2.5 text-gray-400 flex-shrink-0"><Ico.Link /></span>
                  <input value={portfolio} onChange={e => setPortfolio(e.target.value)}
                    placeholder="https://behance.net/o-teu-perfil"
                    className="flex-1 py-2.5 pr-3 text-sm border-0 outline-none bg-transparent" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Métodos de pagamento aceites *</label>
                <div className="grid grid-cols-2 gap-2">
                  {METODOS_DISP.map(m => (
                    <button key={m} onClick={() => toggleMetodo(m)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all
                        ${metodosPagamento.includes(m)
                          ? "border-green-500 text-green-700 bg-green-50"
                          : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}>
                      {m === "SALDO_INTERNO" ? "💳 Saldo carteira" : m}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════════ ETAPA 3 (produto) ou ETAPA 4 (serviço) — Extras finais ════════ */}
          {((etapa === 3 && tipo === "produto") || (etapa === 4 && tipo === "servico")) && (
            <>
              {tipo === "produto" && (
                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Entrega disponível</p>
                    <p className="text-xs text-gray-400 mt-0.5">Filtro "Com entrega" no marketplace</p>
                  </div>
                  <Toggle value={entrega} onChange={setEntrega} />
                </div>
              )}

              {tipo === "produto" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-2">Métodos de pagamento aceites *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {METODOS_DISP.map(m => (
                      <button key={m} onClick={() => toggleMetodo(m)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all
                          ${metodosPagamento.includes(m)
                            ? "border-green-500 text-green-700 bg-green-50"
                            : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}>
                        {m === "SALDO_INTERNO" ? "💳 Saldo carteira" : m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={`p-4 border rounded-xl transition-all ${afiliados ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-white"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Aceitar afiliados</p>
                    <p className="text-xs text-gray-400 mt-0.5">Afiliados promovem e ganham comissão por venda</p>
                  </div>
                  <Toggle value={afiliados} onChange={setAfiliados} />
                </div>
                {afiliados && (
                  <div className="mt-4 pt-3 border-t border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-800">Comissão do afiliado</span>
                      <span className="text-lg font-black text-blue-700 font-mono">{comissao}%</span>
                    </div>
                    <input type="range" min="1" max="30" step="1"
                      value={comissao} onChange={e => setComissao(Number(e.target.value))}
                      className="w-full accent-blue-500" />
                    <div className="flex justify-between text-[10px] text-blue-400 mt-1">
                      <span>1%</span><span>15%</span><span>30%</span>
                    </div>
                    {tipo === "produto" && Number(preco) > 0 && (
                      <p className="text-xs text-blue-700 mt-2 font-medium">
                        Afiliado recebe: <strong>{Math.round(Number(preco) * comissao / 100).toLocaleString("pt-MZ")} MZN</strong> por venda
                      </p>
                    )}
                    {tipo === "servico" && planos.some(p => Number(p.preco) > 0) && (
                      <p className="text-xs text-blue-700 mt-2 font-medium">
                        Plano mais caro: <strong>{Math.round(Math.max(...planos.map(p => Number(p.preco) || 0)) * comissao / 100).toLocaleString("pt-MZ")} MZN</strong> por conversão
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Resumo */}
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs font-bold text-green-800 mb-3 uppercase tracking-wide">Resumo antes de publicar</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600"><span>Nome</span><span className="font-semibold text-gray-800 max-w-[60%] text-right truncate">{nome || "—"}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Tipo</span><span className="font-medium">{tipo === "produto" ? "Produto físico" : "Serviço"}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Categoria</span><span className="font-medium">{cats.find(c => c.id === cat)?.nome || "—"}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Província</span><span className="font-medium">{provincia || "—"}</span></div>
                  {tipo === "produto" && (
                    <>
                      <div className="flex justify-between text-gray-600"><span>Estado</span><span className="font-medium">{estadoItem === "NOVO" ? "Novo" : "Usado"}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Preço</span><span className="font-bold text-green-700">{preco ? `${Number(preco).toLocaleString("pt-MZ")} MZN` : "—"}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Entrega</span><span className="font-medium">{entrega ? "Sim ✓" : "Não"}</span></div>
                    </>
                  )}
                  {tipo === "servico" && (
                    <>
                      <div className="flex justify-between text-gray-600"><span>Planos</span><span className="font-medium">{planos.length} plano(s) — {planos.map(p => `${p.nome} ${Number(p.preco) ? Number(p.preco).toLocaleString("pt-MZ") + " MZN" : "—"}`).join(" · ")}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Modalidade</span><span className="font-medium capitalize">{modalidade}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Idiomas</span><span className="font-medium">{idiomasSel.join(", ")}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Resposta</span><span className="font-medium">em {tempoResposta}</span></div>
                      {tags.length > 0 && <div className="flex justify-between text-gray-600"><span>Tags</span><span className="font-medium">{tags.join(", ")}</span></div>}
                    </>
                  )}
                  <div className="flex justify-between text-gray-600"><span>Afiliados</span><span className="font-medium">{afiliados ? `Sim · ${comissao}%` : "Não"}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Pagamentos</span><span className="font-medium">{metodosPagamento.join(", ")}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Imagens</span><span className="font-medium">{previews.length > 0 ? `${previews.length} imagem(ns)` : "Nenhuma"}</span></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ══ Rodapé ══ */}
        <div className="px-6 pb-5 pt-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-2">
            {etapa > 1 ? (
              <button onClick={() => setEtapa(e => e - 1)} disabled={enviando}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 bg-transparent cursor-pointer hover:border-gray-300 transition-colors">
                ← Voltar
              </button>
            ) : (
              <button onClick={onClose} disabled={enviando}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 bg-transparent cursor-pointer hover:border-gray-300 transition-colors">
                Cancelar
              </button>
            )}

            {etapa < totalEtapas ? (
              <button
                onClick={() => {
                  if (etapa === 1 && !validarEtapa1()) return;
                  if (etapa === 2 && !validarEtapa2()) return;
                  setEtapa(e => e + 1);
                }}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold border-0 cursor-pointer transition-colors">
                Continuar →
              </button>
            ) : (
              <button onClick={handleSalvar} disabled={enviando}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold border-0 cursor-pointer disabled:opacity-60 transition-colors">
                {enviando ? "A guardar..." : item ? "Guardar alterações" : "✓ Publicar anúncio"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────
const TABS = [
  { id: "produtos", label: "Produtos", icon: Ico.Home },
  { id: "pedidos", label: "Pedidos", icon: Ico.Bag },
  { id: "afiliados", label: "Afiliados", icon: Ico.Users },
  { id: "promos", label: "Promoções", icon: Ico.Star },
  { id: "relampago", label: "Relâmpago", icon: Ico.Zap },
  { id: "stats", label: "Estatísticas", icon: Ico.Bar },
];
export function SecaoVendas() {
  const [tab, setTab] = useState("produtos");
  const [produtos, setProdutos] = useState([]);
  const [paginaProdutos, setPaginaProdutos] = useState(1);
  const [totalProdutosPaginas, setTotalProdutosPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState(null);
  const [modal, setModal] = useState(null);

  const [resumo, setResumo] = useState(null);
  const [statsVendas, setStatsVendas] = useState(null);
  const [saldo, setSaldo] = useState(null);
  const [carregandoResumo, setCarregandoResumo] = useState(true);

  // Dados de cabeçalho e stats
  useEffect(() => {
    Promise.all([apiConta.resumo(), apiConta.minhasVendas(1), apiConta.saldo()])
      .then(([resResumo, resVendas, resSaldo]) => {
        const dr = resResumo.success ? resResumo.data : (resResumo.dados ?? {});
        setResumo(dr);
        const dv = resVendas.success ? resVendas.data : (resVendas.dados ?? {});
        setStatsVendas({
          totalVendas: dv.total ?? 0,
          totalPaginas: dv.totalPaginas ?? 1,
        });
        const ds = resSaldo.sucesso ? resSaldo.dados : (resSaldo.data ?? {});
        setSaldo(ds);
      })
      .catch(() => {})
      .finally(() => setCarregandoResumo(false));
  }, []);

  // Carregar produtos (primeira página)
  useEffect(() => {
    apiProdutos
      .meusProdutos(1)
      .then((res) => {
        const lista =
          res.dados?.produtos ??
          res.data?.produtos ??
          res.dados ??
          res.data ??
          [];
        const totalPag = res.dados?.totalPaginas ?? res.data?.totalPaginas ?? 1;
        setProdutos(lista.map(mapearProduto));
        setTotalProdutosPaginas(totalPag);
        setPaginaProdutos(1);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  // Carregar mais produtos
  async function handleCarregarMais() {
    const proximaPagina = paginaProdutos + 1;
    setCarregandoMais(true);
    try {
      const res = await apiProdutos.meusProdutos(proximaPagina);
      const lista = res.dados?.produtos ?? res.data?.produtos ?? [];
      setProdutos((prev) => [...prev, ...lista.map(mapearProduto)]);
      setPaginaProdutos(proximaPagina);
    } catch (e) {
      alert("Erro ao carregar mais produtos: " + e.message);
    } finally {
      setCarregandoMais(false);
    }
  }
  async function handleSalvar(dadosModal) {
    const { id, imagens, ...resto } = dadosModal;
    if (id) {
      const res = await apiProdutos.atualizarProduto(id, resto);
      const atualizado = mapearProduto(res.dados ?? res.data);
      setProdutos((prev) => prev.map((p) => (p.id === id ? atualizado : p)));
    } else {
      const form = new FormData();
      Object.entries(resto).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (Array.isArray(v)) v.forEach((item) => form.append(k, String(item)));
        else if (typeof v === "boolean") form.append(k, v ? "true" : "false");
        else if (typeof v === "number")
          form.append(k, String(v)); // continua string no FormData
        else form.append(k, String(v));
      });
      if (imagens)
        Array.from(imagens).forEach((f) => form.append("imagens", f));
      const res = await apiProdutos.criarProduto(form);
      const novo = mapearProduto(res.dados ?? res.data);
      setProdutos((prev) => [novo, ...prev]);
    }
  }

  const nomeUtilizador = resumo?.nome ?? "—";
  const emailUtilizador = resumo?.email ?? "";
  const iniciais = nomeUtilizador
    .split(" ")
    .map((p) => p[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const fotoPerfil = resumo?.fotoPerfil ?? null;
  const receitaLiquida = resumo?.carteira?.ganhoVendas ?? null;
  const saldoDisponivel =
    saldo?.saldoDisponivel ?? resumo?.carteira?.saldoDisponivel ?? null;
  const totalVendasMes = statsVendas?.totalVendas ?? null;
  const totalProdutos = resumo?.estatisticas?.totalProdutos ?? produtos.length;

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
        <Spinner /> A carregar os seus produtos...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-red-500 text-sm font-medium">
          Erro ao carregar produtos
        </p>
        <p className="text-gray-400 text-xs max-w-xs">{erro}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg border-0 cursor-pointer hover:bg-green-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
            {fotoPerfil ? (
              <img
                src={fotoPerfil}
                alt={iniciais}
                className="w-full h-full object-cover"
              />
            ) : carregandoResumo ? (
              <Spinner small />
            ) : (
              iniciais
            )}
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">
              Minhas Vendas
            </div>
            <div className="text-xs text-gray-400 truncate max-w-[200px]">
              {carregandoResumo
                ? "A carregar..."
                : `${nomeUtilizador} · ${emailUtilizador}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Actualizado agora
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Vendas
          </div>
          <div className="text-xl font-semibold text-gray-900 font-mono tracking-tight">
            {carregandoResumo ? (
              <span className="text-gray-300 text-base">...</span>
            ) : (
              (totalVendasMes ?? "—")
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">pedidos total</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Receita líquida
          </div>
          <div className="text-xl font-semibold text-gray-900 font-mono tracking-tight">
            {carregandoResumo ? (
              <span className="text-gray-300 text-base">...</span>
            ) : receitaLiquida !== null ? (
              fmtK(receitaLiquida)
            ) : (
              "—"
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">MZN</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Saldo disponível
          </div>
          <div className="text-xl font-semibold text-gray-900 font-mono tracking-tight">
            {carregandoResumo ? (
              <span className="text-gray-300 text-base">...</span>
            ) : saldoDisponivel !== null ? (
              fmtK(saldoDisponivel)
            ) : (
              "—"
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">MZN na carteira</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Produtos
          </div>
          <div className="text-xl font-semibold text-gray-900 font-mono tracking-tight">
            {totalProdutos}
          </div>
          <div className="text-xs text-gray-400 mt-1">publicados</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-0
                ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 bg-transparent"}`}
            >
              <Icon />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo das tabs */}
      {tab === "produtos" && (
        <TabProdutos
          produtos={produtos}
          setProdutos={setProdutos}
          onPublicar={() => setModal("novo")}
          onEditar={(item) => setModal({ item })}
          paginaProdutos={paginaProdutos}
          setPaginaProdutos={setPaginaProdutos}
          totalProdutosPaginas={totalProdutosPaginas}
          carregandoMais={carregandoMais}
          onCarregarMais={handleCarregarMais}
        />
      )}
      {tab === "pedidos" && <TabPedidos />}
      {tab === "afiliados" && (
        <TabAfiliados produtos={produtos} setProdutos={setProdutos} />
      )}
      {tab === "promos" && <TabPromocoes produtos={produtos} />}
      {tab === "stats" && (
        <TabStats
          produtos={produtos}
          statsVendas={statsVendas}
          resumo={resumo}
        />
      )}
      {tab === "relampago" && <TabRelampago produtos={produtos} />}

      {/* Modal publicar / editar */}
      {modal && (
        <ModalPublicar
          item={modal === "novo" ? null : modal.item}
          onClose={() => setModal(null)}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
