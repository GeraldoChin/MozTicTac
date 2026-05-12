const BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL)
  || "http://localhost:3000/api/v1";

async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem("token");
  const cabecalhos = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: cabecalhos,
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(dados.mensagem || dados.message || `Erro ${resposta.status}`);
  }
  return dados;
}

export const apiAuth = {
  login:    (email, senha) => requisitar("/auth/login",    { method: "POST", body: JSON.stringify({ email, senha }) }),
  registar: (dados)        => requisitar("/auth/registar", { method: "POST", body: JSON.stringify(dados) }),
};