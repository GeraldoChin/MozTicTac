import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

export function RedirecionarAfiliado() {
  const { codigoAfiliado } = useParams();
  const navigate = useNavigate();
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function registar() {
      try {
        const res = await fetch(`${BASE_URL}/afiliados/clique/${codigoAfiliado}`, { method: "POST" });

        if (res.status === 404) {
          if (!cancelado) setErro("Link inválido ou expirado.");
          return;
        }

        const dados = await res.json();
        const produtoId = dados?.dados?.produtoId ?? dados?.data?.produtoId;

        if (!cancelado) {
          produtoId ? navigate(`/produto/${produtoId}`, { replace: true })
                    : navigate("/", { replace: true });
        }
      } catch {
        if (!cancelado) setErro("Não foi possível processar o link.");
      }
    }

    registar();
    return () => { cancelado = true; };
  }, [codigoAfiliado, navigate]);

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-red-500 text-sm font-medium">{erro}</p>
        <a href="/" className="text-green-600 text-sm underline">Voltar à loja</a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin" />
    </div>
  );
}

export default RedirecionarAfiliado;