'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useCartStore } from '@/store/cart'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  category: string
  description: string
  base_price: number
  stock: number
  is_eligible_for_piercing: boolean
  variations: Array<{
    id: number
    attribute: string
    value: string
    price: number | null
    stock: number
    is_eligible_for_piercing: boolean
  }>
  images: Array<{
    id: number
    url: string
    alt_text: string | null
    is_primary: boolean
  }>
}

interface Service {
  id: number
  name: string
  service_type: string
  duration_minutes: number
  price: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [product, setProduct] = useState<Product | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showPiercingOffer, setShowPiercingOffer] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/catalog/products/${params.id}`)
      setProduct(response.data)

      if (response.data.is_eligible_for_piercing) {
        const servicesResponse = await api.get('/scheduling/services', {
          params: { service_type: 'piercing' },
        })
        setServices(servicesResponse.data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Produto não encontrado')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    const variation = selectedVariation
      ? product.variations.find((v) => v.id === selectedVariation)
      : null

    const price = variation?.price ?? product.base_price

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: price,
        type: 'product',
        variation_id: variation?.id,
      })
    }

    toast.success('Produto adicionado ao carrinho!')

    if (product.is_eligible_for_piercing) {
      setShowPiercingOffer(true)
    }
  }

  const handleAddServiceAndProceed = (serviceId: number) => {
    if (!product) return

    const variation = selectedVariation
      ? product.variations.find((v) => v.id === selectedVariation)
      : null

    const price = variation?.price ?? product.base_price

    addItem({
      id: product.id,
      name: product.name,
      price: price,
      type: 'product',
      variation_id: variation?.id,
    })

    const service = services.find((s) => s.id === serviceId)
    if (service) {
      addItem({
        id: service.id,
        name: `Perfuração: ${service.name}`,
        price: service.price,
        type: 'service',
      })
    }

    toast.success('Joia e perfuração adicionados ao carrinho!')
    router.push('/scheduling')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Produto não encontrado.</p>
      </div>
    )
  }

  const currentPrice =
    selectedVariation
      ? product.variations.find((v) => v.id === selectedVariation)?.price ?? product.base_price
      : product.base_price

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              Body Piercing Studio
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/catalog" className="text-gray-600 hover:text-pink-600">
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
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/catalog" className="hover:text-pink-600">
            Catálogo
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {product.images.length > 0 ? (
              <img
                src={product.images.find((img) => img.is_primary)?.url || product.images[0].url}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-6xl text-gray-400">
                📷
              </div>
            )}
          </div>

          <div>
            <span className="text-xs text-pink-600 font-medium uppercase">
              {product.category === 'paintings' && 'Pintura em Tecido'}
              {product.category === 'jewelry' && 'Joia / Piercing'}
              {product.category === 'aftercare' && 'Cuidados Pós-Perfuração'}
            </span>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
            <p className="text-3xl font-bold text-pink-600 mt-4">
              R$ {currentPrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
            </p>

            {product.description && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {product.variations.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Variações</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variations.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariation(v.id)}
                      disabled={v.stock <= 0}
                      className={`px-4 py-2 rounded-lg text-sm border transition ${
                        selectedVariation === v.id
                          ? 'border-pink-600 bg-pink-50 text-pink-600'
                          : 'border-gray-300 hover:border-pink-300 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {v.attribute}: {v.value}
                      {v.price && ` - R$ ${v.price.toFixed(2)}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
              </button>
            </div>

            {product.is_eligible_for_piercing && services.length > 0 && (
              <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                <h3 className="font-semibold text-pink-700 mb-2">
                  Deseja agendar a perfuração com esta joia?
                </h3>
                <p className="text-sm text-pink-600 mb-3">
                  Esta joia é compatível com nossos serviços de perfuração.
                </p>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleAddServiceAndProceed(service.id)}
                      className="px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition"
                    >
                      {service.name} - R$ {service.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}