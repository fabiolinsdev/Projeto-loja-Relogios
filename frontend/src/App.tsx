import { useEffect, useState } from 'react'
import './App.css'

type Category = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string | null
  category: Category
}

type CartItem = Product & {
  quantity: number
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    fetch('http://localhost:3333/products')
      .then((response) => response.json())
      .then((data) => {
        setProducts(data)
      })
  }, [])

  function addToCart(product: Product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      )
      

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  function increaseQuantity(productId: string) {
        setCart((currentCart) =>
          currentCart.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        )
      }

      function decreaseQuantity(productId: string) {
        setCart((currentCart) =>
          currentCart
            .map((item) =>
              item.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0)
        )
      }

      function removeFromCart(productId: string) {
        setCart((currentCart) =>
          currentCart.filter((item) => item.id !== productId)
        )
      }

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  return (
    <>
      <h2>Carrinho: {cart.length} produto(s)</h2>

      <h1>Produtos</h1>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h2>{product.name}</h2>

            <p>Categoria: {product.category.name}</p>

            <p>{product.description}</p>

            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                width="200"
              />
            )}

            <p>
              Preço: {product.price.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}


            </p>

            <p>
              {product.stock > 0
                ? `Estoque: ${product.stock}`
                : 'Produto sem estoque'}
            </p>
            <button
              type="button"
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
            >
              Adicionar ao carrinho
            </button>
          </div>
        ))}


      </div>
      <h2>Carrinho</h2>

      {cart.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id}>
              <strong>{item.name}</strong>

              <div>
                <button
                  type="button"
                  onClick={() => decreaseQuantity(item.id)}
                >
                  −
                </button>

                <span> {item.quantity} </span>

                <button
                  type="button"
                  onClick={() => increaseQuantity(item.id)}
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}


          <p>
            <strong>
              Total: {cartTotal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </strong>
          </p>
        </div>
      )}
    </>
  )
}

export default App