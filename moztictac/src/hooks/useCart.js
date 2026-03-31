import { useState } from "react";

/**
 * useCart — manages cart and wishlist counts.
 * Returns counts and increment functions.
 */
export function useCart() {
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);

  const addToCart = () => setCartCount((c) => c + 1);
  const addToWish = () => setWishCount((w) => w + 1);

  return { cartCount, wishCount, addToCart, addToWish };
}