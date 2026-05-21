// src/components/RotaProtegida.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RotaProtegida({ children }) {
  const { autenticado } = useAuth();
  const location = useLocation();

  if (!autenticado) {
    // Guarda a rota actual para redirecionar depois do login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}