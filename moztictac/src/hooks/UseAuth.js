// src/hooks/useAuth.js
export function useAuth() {
  const token      = localStorage.getItem("token");
  const utilizador = localStorage.getItem("utilizador");

  const autenticado = !!token && !!utilizador;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("utilizador");
    window.location.href = "/login";
  }

  return { autenticado, logout };
}