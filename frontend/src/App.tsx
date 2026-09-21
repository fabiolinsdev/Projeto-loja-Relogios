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
  categoryId: string
  category: Category
}

type CartItem = Product & {
  quantity: number
}

type OrderItem = {
  id: string
  productId: string
  quantity: number
  price: number
  product: Product
}

type Order = {
  id: string
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productStock, setProductStock] = useState('')
  const [productCategoryId, setProductCategoryId] = useState('')

  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const [token, setToken] = useState(localStorage.getItem('token'))


  useEffect(() => {
    fetch('http://localhost:3333/products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts(data)
      })
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [token])

  function getOrderStatusLabel(status: string) {
    switch (status) {
      case 'PENDENTE':
        return '🕐 Pendente'

      case 'PAGO':
        return '💳 Pago'

      case 'ENVIADO':
        return '📦 Enviado'

      case 'ENTREGUE':
        return '✅ Entregue'

      case 'CANCELADO':
        return '❌ Cancelado'

      default:
        return status
    }
  }

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
        item.id === productId && item.quantity < item.stock
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

  async function login() {
    const response = await fetch('http://localhost:3333/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.message)
      return
    }

    localStorage.setItem('token', data.token)
    setToken(data.token)

    alert('Login realizado com sucesso!')
  }

  async function createProduct() {
    const response = await fetch('http://localhost:3333/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: productName,
        description: productDescription,
        price: Number(productPrice),
        stock: Number(productStock),
        categoryId: productCategoryId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.message)
      return
    }

    alert('Produto criado com sucesso!')

    setProductName('')
    setProductDescription('')
    setProductPrice('')
    setProductStock('')
    setProductCategoryId('')

    setProducts((currentProducts) => [...currentProducts, data])
  }

  async function updateProduct() {


    if (!editingProductId) {
      return
    }

    const response = await fetch(
      `http://localhost:3333/products/${editingProductId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: productName,
          description: productDescription,
          price: Number(productPrice),
          stock: Number(productStock),
          categoryId: productCategoryId,
        }),
      }

    )


    const data = await response.json()

    if (!response.ok) {
      alert(data.message)
      return
    }

    alert('Produto atualizado com sucesso!')

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === editingProductId ? data : product
      )
    )

    setEditingProductId(null)
    setProductName('')
    setProductDescription('')
    setProductPrice('')
    setProductStock('')
    setProductCategoryId('')
  }

  async function createOrder() {
    if (!token) {
      alert('Você precisa estar logado para finalizar a compra.')
      return
    }

    if (cart.length === 0) {
      alert('O carrinho está vazio.')
      return
    }

    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }))

    const response = await fetch('http://localhost:3333/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    })

    if (!response.ok) {
      const data = await response.json()
      alert(data.message || 'Erro ao criar pedido.')
      return
    }

    setCart([])

    alert('Pedido criado com sucesso!')
  }

  async function fetchOrders() {
    if (!token) {
      return
    }

    const response = await fetch('http://localhost:3333/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return
    }

    const data = await response.json()

    setOrders(data)
  }

  function startEditingProduct(product: Product) {
    setEditingProductId(product.id)
    setProductName(product.name)
    setProductDescription(product.description)
    setProductPrice(String(product.price))
    setProductStock(String(product.stock))
    setProductCategoryId(product.categoryId)
  }

  async function deleteProduct(productId: string) {
    const response = await fetch(
      `http://localhost:3333/products/${productId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const data = await response.json()
      alert(data.message)
      return
    }

    alert('Produto excluído com sucesso!')

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId)
    )
  }

  async function register() {
    const response = await fetch('http://localhost:3333/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.message)
      return
    }

    alert('Usuário cadastrado com sucesso!')

    setRegisterName('')
    setRegisterEmail('')
    setRegisterPassword('')
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)

    alert('Logout realizado com sucesso!')
  }

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )



  return (
    <>
      <h2>Carrinho: {cart.length} produto(s)</h2>

      {token && (
        <div>
          <p>Voçê está autenticado!</p>
          <button type="button" onClick={logout}>
            sair
          </button>
        </div>
      )}

      <h1>Login</h1>

      <div>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="button" onClick={login}>
          Entrar
        </button>
      </div>

      <h1>Cadastro</h1>

      <div>
        <input
          type="text"
          placeholder="Nome"
          value={registerName}
          onChange={(event) => setRegisterName(event.target.value)}
        />

        <input
          type="email"
          placeholder="E-mail"
          value={registerEmail}
          onChange={(event) => setRegisterEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={registerPassword}
          onChange={(event) => setRegisterPassword(event.target.value)}
        />

        <button type="button" onClick={register}>
          Cadastrar
        </button>
      </div>

      {token && (
        <div>
          <h1>
            {editingProductId ? 'Editar produto' : 'Cadastrar produto'}
          </h1>

          <input
            type="text"
            placeholder="Nome do produto"
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
          />

          <input
            type="text"
            placeholder="Descrição"
            value={productDescription}
            onChange={(event) => setProductDescription(event.target.value)}
          />

          <input
            type="number"
            placeholder="Preço"
            value={productPrice}
            onChange={(event) => setProductPrice(event.target.value)}
          />

          <input
            type="number"
            placeholder="Estoque"
            value={productStock}
            onChange={(event) => setProductStock(event.target.value)}
          />

          <select
            value={productCategoryId}
            onChange={(event) => setProductCategoryId(event.target.value)}
          >
            <option value="">Selecione uma categoria</option>

            <option value="cmt4crivr000019d0hrzmyiuu">
              Casual
            </option>
          </select>

          <button
            type="button"
            onClick={editingProductId ? updateProduct : createProduct}
          >
            {editingProductId ? 'Salvar alterações' : 'Criar produto'}
          </button>
        </div>
      )}

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
              Preço:{' '}
              {product.price.toLocaleString('pt-BR', {
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

            <button
              type="button"
              onClick={() => startEditingProduct(product)}
            >
              Editar produto
            </button>

            <button
              type="button"
              onClick={() => deleteProduct(product.id)}
            >
              Excluir produto
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
              Total:{' '}
              {cartTotal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </strong>
          </p>

          <button
            type="button"
            onClick={createOrder}
          >
            Finalizar compra
          </button>
        </div>
      )}

      <section>
        <h2>Histórico de pedidos</h2>

        {orders.length === 0 ? (
          <p>Nenhum pedido encontrado.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3 className="order-title">
                Pedido {order.id}
              </h3>

              <p className="order-date">
                Data:{' '}
                {new Date(order.createdAt).toLocaleString('pt-BR')}
              </p>

              <p className={`order-status ${order.status.toLowerCase()}`}>
                Status: {getOrderStatusLabel(order.status)}
              </p>

              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <p>
                    {item.product.name}
                  </p>

                  <p>
                    Quantidade: {item.quantity}
                  </p>
                  <p>
                    Preço: {item.price.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
              ))}

              <strong className="order-total">
                Total:{' '}
                {order.total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>
            </div>
          ))
        )}
      </section>

    </>
  )
}

export default App