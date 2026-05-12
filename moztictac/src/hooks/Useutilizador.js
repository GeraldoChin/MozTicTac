// src/hooks/useUtilizador.js
import { useState, useEffect } from "react";

export function useUtilizador() {
  const [utilizador, setUtilizador] = useState(null);

  useEffect(() => {
    const dados = localStorage.getItem("utilizador");
    if (dados) setUtilizador(JSON.parse(dados));
  }, []);

  // Função para atualizar os dados (ex: após editar perfil)
  function atualizarUtilizador(novosDados) {
    const atualizado = { ...utilizador, ...novosDados };
    localStorage.setItem("utilizador", JSON.stringify(atualizado));
    setUtilizador(atualizado);
  }

  return { utilizador, atualizarUtilizador };
}