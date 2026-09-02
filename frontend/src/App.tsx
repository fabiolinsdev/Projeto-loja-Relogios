import { useEffect, useState } from 'react'
import './App.css'

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string | null
}

function App() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('http://localhost:3333/products')
      .then((response) => response.json())
      .then((data) => {
        setProducts(data)
      })
  }, [])

  return (
    <>
      <h1>Produtos</h1>

      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>Preço: R$ {product.price}</p>
          <p>Estoque: {product.stock}</p>
        </div>
      ))}
    </>
  )
}

export default App
