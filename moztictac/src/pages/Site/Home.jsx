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
import { Rodape } from "../../components/Rodape";
import TopTendencias from "../../components/Trendinghero";

export default function Home() {
  const { cartCount, wishCount, addToCart, addToWish } = useCart();
  const [searchVal, setSearchVal] = useState("");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* <TopBar /> */}
      <Header
        cartCount={cartCount}
        wishCount={wishCount}
        searchVal={searchVal}
        onSearchChange={setSearchVal}
        onAddToCart={addToCart}
        onAddToWish={addToWish}
      />
      <Navbar />
      <HeroBanner onShopNow={addToCart} />
      <CategoryBar />
      {/* <DealsSection onAddToCart={addToCart} /> */}
      <TopTendencias/>
      <PromoBanners />
      <FashionProducts onAddToCart={addToCart} />
      <TrendingNow />
      <BlogSection />
      {/* <BrandsBar /> */}
      <Newsletter />
      <Rodape />
    </div>
  );
}
