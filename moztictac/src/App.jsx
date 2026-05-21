import { Routes, Route } from "react-router-dom";
import { RotaProtegida } from "./components/RotaProtegida";
import Home from "./pages/Site/Home";
import MinhaConta from "./pages/Site/Minhaconta";
import PaginaCarrinho from "./pages/Site/Paginacarrinho";
import PaginaProdutoDetalhe from "./pages/Site/Paginaprodutodetalhe";
import PaginaSobreNos from "./pages/Site/PaginaSobreNos";
import AdminPanel from "./pages/Admin/AdminPage";
import PaginaDesejos from "./pages/Site/Paginadesejos";
import ShopPage from "./pages/Site/ProductPage";
import ChatPage from "./pages/Site/ChatPage";
import TrendingPage from "./pages/Site/TrendingPage";
import BlogPage from "./pages/Site/Blogpage";
import PromoBannersPage from "./pages/Site/PromobannerPage";
import PaginaFAQ from "./pages/Site/PaginaFacs";
import LoginPage from "./pages/Site/Loginpage";

export default function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/admin"    element={<AdminPanel />} />
      <Route path="/produto/:id" element={<PaginaProdutoDetalhe />} />
      <Route path="/sobre-nos"   element={<PaginaSobreNos />} />
      <Route path="/produtos"    element={<ShopPage />} />
      <Route path="/trending"    element={<TrendingPage />} />
      <Route path="/blog"        element={<BlogPage />} />
      <Route path="/promos"      element={<PromoBannersPage />} />
      <Route path="/faq"         element={<PaginaFAQ />} />

      {/* Rotas protegidas */}
      <Route path="/minha-conta" element={<RotaProtegida><MinhaConta /></RotaProtegida>} />
      <Route path="/carrinho"    element={<RotaProtegida><PaginaCarrinho /></RotaProtegida>} />
      <Route path="/desejos"     element={<RotaProtegida><PaginaDesejos /></RotaProtegida>} />
      <Route path="/chat"        element={<RotaProtegida><ChatPage /></RotaProtegida>} />
    </Routes>
  );
}