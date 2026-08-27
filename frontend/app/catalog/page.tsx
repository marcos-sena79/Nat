'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Product {
  id: number
  name: string
  category: string
  base_price: number
  stock: number
  primary_image?: string
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [category, search])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (search) params.append('search', search)
      
      const response = await api.get(`/catalog/products?${params.toString()}`)
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: '', label: 'Todos' },
    { value: 'paintings', label: 'Pinturas' },
    { value: 'jewelry', label: 'Joias & Piercings' },
    { value: 'aftercare', label: 'Cuidados' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              Body Piercing Studio
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/catalog" className="text-pink-600 font-semibold">
                Catálogo
              </Link>
              <Link href="/scheduling" className="text-gray-600 hover:text-pink-600">
                Agendamento
              </Link>
              <Link href="/cart" className="text-gray-600 hover:text-pink-600">
                Carrinho 🛒
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Catálogo</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  category === cat.value
                    ? 'bg-pink-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-pink-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/catalog/${product.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="aspect-square bg-gray-200">
                  {product.primary_image ? (
                    <img
                      src={product.primary_image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📷
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs text-pink-600 font-medium uppercase">
                    {product.category === 'paintings' && 'Pintura'}
                    {product.category === 'jewelry' && 'Joia'}
                    {product.category === 'aftercare' && 'Cuidado'}
                  </span>
                  <h3 className="font-semibold mt-1">{product.name}</h3>
                  <p className="text-lg font-bold text-pink-600 mt-2">
                    R$ {product.base_price.toFixed(2)}
                  </p>
                  {product.stock <= 0 && (
                    <span className="text-xs text-red-500">Esgotado</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}