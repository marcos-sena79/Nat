'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  type: 'product' | 'service'
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id)
      return
    }
    
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    )
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const removeFromCart = (id: number) => {
    const updatedCart = cart.filter((item) => item.id !== id)
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    toast.success('Item removido do carrinho')
  }

  const applyCoupon = async () => {
    if (!couponCode) return
    
    try {
      setLoading(true)
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      
      const response = await api.post('/orders/cart/validate', {
        items: cart.map((item) => ({
          product_id: item.type === 'product' ? item.id : null,
          service_id: item.type === 'service' ? item.id : null,
          quantity: item.quantity,
        })),
        coupon_code: couponCode,
      })
      
      setDiscount(response.data.discount_amount)
      toast.success('Cupom aplicado com sucesso!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Cupom inválido')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal - discount

  const handleCheckout = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Faça login para continuar')
      window.location.href = '/login'
      return
    }
    
    // Redirect to checkout
    toast.success('Redirecionando para checkout...')
  }

  if (cart.length === 0) {
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
                <Link href="/cart" className="text-pink-600 font-semibold">
                  Carrinho 🛒
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
          <p className="text-gray-600 mb-8">
            Adicione produtos ou agende serviços para continuar
          </p>
          <Link
            href="/catalog"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            Ver Catálogo
          </Link>
        </main>
      </div>
    )
  }

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
              <Link href="/cart" className="text-pink-600 font-semibold">
                Carrinho 🛒
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Carrinho</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border-b last:border-b-0"
                >
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    {item.type === 'product' ? '🎨' : '✨'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.type === 'product' ? 'Produto' : 'Serviço'}
                    </p>
                    <p className="text-pink-600 font-bold">
                      R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumo</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-pink-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cupom de desconto
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Digite o código"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={loading || !couponCode}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
                  >
                    {loading ? '...' : 'Aplicar'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
              >
                Finalizar Compra
              </button>

              <Link
                href="/catalog"
                className="block text-center mt-4 text-pink-600 hover:text-pink-700"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}