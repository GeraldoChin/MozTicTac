// ─────────────────────────────────────────────
// MOZTICTAC — api.js  (React puro, sem TypeScript)
// Coloca este ficheiro em: src/api.js
// ─────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// ─── Helper central de fetch ──────────────────────────────────────────────────
async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");

  const cabecalhos = {
    ...(opcoes.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opcoes.cabecalhos,
  };

  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: cabecalhos,
  });

  // Token expirado → limpa sessão e redireciona para login
  if (resposta.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("utilizador");
    window.location.href = "/login";
    throw new Error("Sessão expirada. Faz login novamente.");
  }

  const dados = await resposta.json();

  if (!resposta.ok) {
    // O backend devolve { success: false, message: "..." }
    throw new Error(dados.message || `Erro ${resposta.status}`);
  }

  return dados; // { success: true, dados: { ... } }
}

// ─── Mapeador: backend → formato que o frontend usa ──────────────────────────
// O backend pode devolver campos em camelCase ligeiramente diferentes.
// Este mapeador normaliza tudo para o formato usado nas tabs.
export function mapearProduto(p) {
  return {
    id:             p._id || p.id,
    nome:           p.nome || p.titulo || "",
    tipo:           p.tipo || "produto",          // "produto" | "servico"
    estado:         p.estado || "pendente_aprovacao",
    preco:          Number(p.preco) || 0,
    stock:          p.stock ?? p.quantidade ?? null,
    vendas:         p.totalVendas ?? p.vendas ?? 0,
    cat:            p.categoria || p.cat || "Outro",
    afiliados:      p.aceitaAfiliados ?? p.afiliados ?? false,
    comissao:       p.comissaoAfiliado ?? p.comissao ?? 0,
    entrega:        p.temEntrega ?? p.entrega ?? false,
    atacado:        p.atacado ?? false,
    descricao:      p.descricao || "",
    imagens:        p.imagens || [],
    novo:           p.condicao === "novo" || p.novo || false,
  };
}

// ─── API: Autenticação ────────────────────────────────────────────────────────
export const apiAuth = {
  login: (email, senha) =>
    requisitar("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),

  registar: (dados) =>
    requisitar("/auth/registar", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  sair: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilizador");
  },
};

// ─── API: Produtos ────────────────────────────────────────────────────────────
export const api = {
  // GET /api/v1/produtos/meus/produtos  (rota protegida)
  meusProdutos: () => requisitar("/produtos/meus/produtos"),

  // GET /api/v1/produtos?categoria=...&pagina=1
  listar: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    return requisitar(`/produtos${params ? "?" + params : ""}`);
  },

  // GET /api/v1/produtos/:id
  obterPorId: (id) => requisitar(`/produtos/${id}`),

  // POST /api/v1/produtos  (FormData com imagens)
  criarProduto: (formData) =>
    requisitar("/produtos", {
      method: "POST",
      body: formData, // FormData — o helper já remove Content-Type para deixar o browser definir boundary
    }),

  // PUT /api/v1/produtos/:id
  atualizarProduto: (id, dados) =>
    requisitar(`/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    }),

  // PUT /api/v1/produtos/:id/pausar
  pausarProduto: (id) =>
    requisitar(`/produtos/${id}/pausar`, { method: "PUT" }),

  // PUT /api/v1/produtos/:id/reativar
  reativarProduto: (id) =>
    requisitar(`/produtos/${id}/reativar`, { method: "PUT" }),

  // DELETE /api/v1/produtos/:id
  eliminarProduto: (id) =>
    requisitar(`/produtos/${id}`, { method: "DELETE" }),
};

// ─── API: Pedidos ─────────────────────────────────────────────────────────────
export const apiPedidos = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    return requisitar(`/pedidos${params ? "?" + params : ""}`);
  },

  obterPorId: (id) => requisitar(`/pedidos/${id}`),

  confirmarEntrega: (id) =>
    requisitar(`/pedidos/${id}/confirmar`, { method: "PUT" }),
};

// ─── API: Afiliados ───────────────────────────────────────────────────────────
export const apiAfiliados = {
  meuLink: (produtoId) => requisitar(`/afiliados/link/${produtoId}`),
  estatisticas: () => requisitar("/afiliados/estatisticas"),
};

// ─── API: Carteira ────────────────────────────────────────────────────────────
export const apiCarteira = {
  saldo: () => requisitar("/carteira/saldo"),
  historico: () => requisitar("/carteira/historico"),
  levantar: (valor, metodo) =>
    requisitar("/carteira/levantar", {
      method: "POST",
      body: JSON.stringify({ valor, metodo }),
    }),
};