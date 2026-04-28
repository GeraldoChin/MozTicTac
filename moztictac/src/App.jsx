import { Routes, Route } from "react-router-dom";
import Home from "./pages/Site/Home";
import MinhaConta from "./pages/Site/Minhaconta";
import PaginaCarrinho from "./pages/Site/Paginacarrinho";
import PaginaProdutoDetalhe from "./pages/Site/Paginaprodutodetalhe";
import PaginaSobreNos from "./pages/Site/PaginaSobreNos";
import AdminPanel from "./pages/Admin/AdminPage";
import PaginaDesejos from "./pages/Site/Paginadesejos";
import ShopPage from "./pages/Site/ProductPage";
import ChatPage from "./pages/Site/ChatPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/minha-conta" element={<MinhaConta />} />
      <Route path="/carrinho" element={<PaginaCarrinho />} />
      {/* <Route path="/comprar" element={<h1>Comprar</h1>} /> */}
      <Route path="/produto/:id" element={<PaginaProdutoDetalhe />} />
      <Route path="/sobre-nos" element={<PaginaSobreNos />} />
      <Route path="/desejos" element={<PaginaDesejos />} />
      <Route path="/produtos" element={<ShopPage />} />
      <Route path="/chat" element={<ChatPage />} />
      {/* Resto das rotas... */}
    </Routes>
  );
}
