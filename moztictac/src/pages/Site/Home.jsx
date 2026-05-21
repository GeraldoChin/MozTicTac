import { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { TopBar } from "../../components/TopBar";
import { Header } from "../../components/Header";
import { Navbar } from "../../components/Navbar";
import { HeroBanner } from "../../components/HeroBanner";
import { CategoryBar } from "../../components/CategoryBar";
import { DealsSection } from "../../components/DealsSection";
import { PromoBanners } from "../../components/PromoBanners";
import { FashionProducts } from "../../components/FashionProducts";
import { TrendingNow } from "../../components/TrendingNow";
import { BlogSection } from "../../components/BlogSection";
import { BrandsBar } from "../../components/Marcas";
import { Newsletter } from "../../components/Newsletter";
import Rodape from "../../components/Rodape";
import TopTendencias from "../../components/Trendinghero";
import PromoBannersSlider from "../../components/PromoBannerSlider";
import { useContagens } from "../../hooks/useContagens";

export default function Home() {
  const { contagemCarrinho, contagemWishlist, contagemNotificacoes, contagemMensagens } = useContagens();
  const { cartCount, wishCount, addToCart, addToWish } = useCart();
  const [searchVal, setSearchVal] = useState("");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* <TopBar /> */}
      <Header
        contagemCarrinho={cartCount}
        contagemWishlist={wishCount}
        valorPesquisa={searchVal}
        aoMudarPesquisa={setSearchVal}
        contagemCarrinho={contagemCarrinho}
        contagemWishlist={contagemWishlist}
        contagemNotificacoes={contagemNotificacoes}
        contagemMensagens={contagemMensagens}
        valorPesquisa={searchVal}
        aoMudarPesquisa={setSearchVal}
      />
      <Navbar />
      <HeroBanner onShopNow={addToCart} />
      <CategoryBar />
      {/* <DealsSection onAddToCart={addToCart} /> */}
      <TopTendencias/>
      <PromoBannersSlider />
      <FashionProducts onAddToCart={addToCart} />
      <TrendingNow />
      <BlogSection />
      {/* <BrandsBar /> */}
      <Newsletter />
      <Rodape />
    </div>
  );
}
