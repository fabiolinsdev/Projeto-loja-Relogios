export type AssistantProduct = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: { name: string }
}

export type AssistantCartItem = AssistantProduct & {
  quantity: number
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function cartTotal(cart: AssistantCartItem[]) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0)
}

function describeProduct(product: AssistantProduct) {
  const stock =
    product.stock > 0
      ? `${product.stock} unidade(s) em estoque`
      : 'sem estoque no momento'

  return [
    product.name,
    `Categoria: ${product.category.name}`,
    product.description,
    `Preço: ${formatBRL(product.price)}`,
    stock,
  ].join('\n')
}

function findProducts(question: string, products: AssistantProduct[]) {
  const q = normalize(question)

  const direct = products.filter((product) =>
    q.includes(normalize(product.name)),
  )

  if (direct.length > 0) {
    return direct
  }

  const words = q
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4)

  return products.filter((product) => {
    const name = normalize(product.name)
    const description = normalize(product.description)
    const category = normalize(product.category.name)

    return words.some(
      (word) =>
        name.includes(word) ||
        description.includes(word) ||
        category.includes(word),
    )
  })
}

function describeCart(cart: AssistantCartItem[]) {
  if (cart.length === 0) {
    return 'Seu carrinho está vazio. Escolha um relógio em Produtos e clique em Adicionar ao carrinho.'
  }

  const lines = cart.map(
    (item) =>
      `• ${item.name} — ${item.quantity} un. × ${formatBRL(item.price)} = ${formatBRL(item.price * item.quantity)}`,
  )

  return [
    'Itens no seu carrinho:',
    ...lines,
    `Total: ${formatBRL(cartTotal(cart))}`,
    'Para concluir, role até Carrinho e clique em Finalizar compra (é preciso estar logado).',
  ].join('\n')
}

export function answerStoreQuestion(
  question: string,
  products: AssistantProduct[],
  cart: AssistantCartItem[],
  loggedIn: boolean,
) {
  const q = normalize(question)

  if (!q) {
    return 'Pode perguntar sobre um relógio ou sobre o que está no carrinho.'
  }

  if (
    /^(oi|ola|hey|e ai|eai|bom dia|boa tarde|boa noite|tudo bem)\b/.test(q)
  ) {
    return 'Olá! Sou o assistente da Loja Relógios. Posso falar dos modelos, preços, estoque e do seu carrinho. O que você quer saber?'
  }

  const asksCart =
    q.includes('carrinho') ||
    q.includes('cesta') ||
    q.includes('total da compra') ||
    q.includes('quanto vou pagar') ||
    q.includes('finalizar') ||
    q.includes('checkout')

  const asksProductsList =
    /\b(produtos|relogios|catalogo|vitrine|quais|o que voces tem|o que tem na loja)\b/.test(
      q,
    ) && !asksCart

  const matchedProducts = findProducts(question, products)

  if (asksCart) {
    if (q.includes('finalizar') || q.includes('checkout')) {
      if (cart.length === 0) {
        return 'Ainda não há itens no carrinho para finalizar. Adicione um relógio primeiro.'
      }

      if (!loggedIn) {
        return `${describeCart(cart)}\n\nPara finalizar a compra, faça login (ou cadastre-se) no topo da página.`
      }

      return `${describeCart(cart)}\n\nVocê já está logado. É só clicar em Finalizar compra na seção Carrinho.`
    }

    return describeCart(cart)
  }

  if (matchedProducts.length === 1) {
    return describeProduct(matchedProducts[0])
  }

  if (matchedProducts.length > 1) {
    const names = matchedProducts
      .map((product) => `• ${product.name} (${formatBRL(product.price)})`)
      .join('\n')

    return `Encontrei estes relógios:\n${names}\n\nDiga o nome de um para ver os detalhes.`
  }

  if (asksProductsList) {
    if (products.length === 0) {
      return 'Ainda não há relógios cadastrados na vitrine.'
    }

    const names = products
      .map((product) => `• ${product.name} — ${formatBRL(product.price)}`)
      .join('\n')

    return `Estes são os relógios da loja agora:\n${names}\n\nPergunte pelo nome para ver descrição, preço e estoque.`
  }

  if (q.includes('preco') || q.includes('estoque') || q.includes('detalhe')) {
    return 'Me diga o nome do relógio que você quer consultar (preço, estoque ou descrição).'
  }

  return 'Consigo ajudar com detalhes dos relógios (nome, preço, estoque, categoria) e com o seu carrinho. Experimente: “o que tem no carrinho?” ou o nome de um modelo.'
}

export const assistantWelcome =
  'Olá! Sou o assistente da Loja Relógios. Estou aqui para tirar dúvidas sobre os produtos e o seu carrinho. Pode perguntar, por exemplo: “quais relógios vocês têm?” ou “o que tem no meu carrinho?”.'
