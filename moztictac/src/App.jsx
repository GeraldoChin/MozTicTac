import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MinhaConta from "./pages/Minhaconta";
import PaginaCarrinho from "./pages/Paginacarrinho";
import PaginaProdutoDetalhe from "./pages/Paginaprodutodetalhe";
import PaginaSobreNos from "./pages/Paginasobrenos";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/minha-conta" element={<MinhaConta />} />
         <Route path="/carrinho" element={<PaginaCarrinho />} />
      {/* <Route path="/comprar" element={<h1>Comprar</h1>} /> */}
      <Route path="/produto/:id" element={<PaginaProdutoDetalhe />} />
      <Route path="/sobre-nos" element={<PaginaSobreNos />} />
      {/* Resto das rotas... */}
    </Routes>
  );
}