// src/utils/carrinho.js
// Utilitário centralizado para gestão do carrinho (localStorage)

const CHAVE = "moztictac_cart";

/** Lê todos os itens do carrinho */
export function lerCarrinho() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) || "[]");
  } catch {
    return [];
  }
}

/** Grava o array de itens e dispara evento global */
export function gravarCarrinho(itens) {
  localStorage.setItem(CHAVE, JSON.stringify(itens));
  window.dispatchEvent(new Event("carrinho-atualizado"));
}

/**
 * Adiciona ou incrementa um item no carrinho.
 * O objeto `item` deve conter pelo menos: id, nome, preco
 * Campos opcionais: quantidade, vendedorId, vendedorNome,
 *   localidade, estado, entrega, afiliado, atacado, imagem
 */
export function adicionarAoCarrinho(item) {
  const cart = lerCarrinho();
  const idx  = cart.findIndex((i) => i.id === item.id);

  if (idx >= 0) {
    cart[idx].quantidade = (cart[idx].quantidade ?? 1) + (item.quantidade ?? 1);
  } else {
    cart.push({
      id:           item.id,
      nome:         item.nome         ?? "Produto",
      preco:        Number(item.preco ?? 0),
      quantidade:   item.quantidade   ?? 1,
      vendedorId:   item.vendedorId   ?? null,
      vendedorNome: item.vendedorNome ?? "",
      localidade:   item.localidade   ?? "",
      estado:       item.estado       ?? "Novo",
      entrega:      item.entrega      ?? false,
      afiliado:     item.afiliado     ?? false,
      atacado:      item.atacado      ?? false,
      imagem:       item.imagem       ?? null,
    });
  }

  gravarCarrinho(cart);
}

/** Remove um item pelo id */
export function removerDoCarrinho(id) {
  gravarCarrinho(lerCarrinho().filter((i) => i.id !== id));
}

/** Altera a quantidade de um item (remove se qty < 1) */
export function alterarQuantidade(id, qty) {
  if (qty < 1) {
    removerDoCarrinho(id);
    return;
  }
  gravarCarrinho(
    lerCarrinho().map((i) => (i.id === id ? { ...i, quantidade: qty } : i))
  );
}

/** Limpa todo o carrinho */
export function limparCarrinho() {
  gravarCarrinho([]);
}

/** Devolve o total de unidades no carrinho */
export function contarItens() {
  return lerCarrinho().reduce((a, i) => a + (i.quantidade ?? 1), 0);
}