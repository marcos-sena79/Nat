'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useCartStore } from '@/store/cart'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, couponCode, getSubtotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [couponInput, setCouponInput] = useState(couponCode || '')
  const [discount, setDiscount] = useState(0)
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix')

  const subtotal = getSubtotal()
  const total = subtotal - discount

  const applyCoupon = async () => {
    if (!couponInput) return
    try {
      const response = await api.post('/orders/cart/validate', {
        items: items.map((item) => ({
          product_id: item.type === 'product' ? item.id : null,
          service_id: item.type === 'service' ? item.id : null,
          quantity: item.quantity,
        })),
        coupon_code: couponInput,
      })
      setDiscount(response.data.discount_amount)
      useCartStore.getState().setCoupon(couponInput)
      toast.success('Cupom aplicado!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Cupom inválido')
    }
  }

  const handleCheckout = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Faça login para continuar')
      router.push('/login')
      return
    }

    try {
      setLoading(true)

      const orderResponse = await api.post('/orders', {
        items: items.map((item) => ({
          product_id: item.type === 'product' ? item.id : null,
          variation_id: item.variation_id || null,
          service_id: item.type === 'service' ? item.id : null,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        shipping_address: shippingAddress,
        coupon_code: couponCode,
      })

      const checkoutResponse = await api.post('/payments/checkout', {
        order_id: orderResponse.data.id,
        payment_method: paymentMethod,
        return_url: `${window.location.origin}/orders/${orderResponse.data.id}`,
      })

      if (checkoutResponse.data.checkout_url) {
        window.location.href = checkoutResponse.data.checkout_url
      } else {
        toast.success('Pedido criado com sucesso!')
        clearCart()
        router.push(`/orders/${orderResponse.data.id}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao processar pedido')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-4">Carrinho vazio</h1>
          <Link href="/catalog" className="text-pink-600 hover:text-pink-700">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-pink-600">
            Atelier Corpo & Cor
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Itens do Pedido</h2>
              {items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.type === 'product' ? 'Produto' : 'Serviço'} x{item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Digite o endereço completo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 h-24"
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Forma de Pagamento</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex-1 py-3 rounded-lg border-2 font-semibold transition ${
                    paymentMethod === 'pix'
                      ? 'border-pink-600 bg-pink-50 text-pink-600'
                      : 'border-gray-300 hover:border-pink-300'
                  }`}
                >
                  Pix
                </button>
                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex-1 py-3 rounded-lg border-2 font-semibold transition ${
                    paymentMethod === 'credit_card'
                      ? 'border-pink-600 bg-pink-50 text-pink-600'
                      : 'border-gray-300 hover:border-pink-300'
                  }`}
                >
                  Cartão de Crédito
                </button>
              </div>
            </div>
          </div>

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

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cupom de desconto
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Código"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:bg-pink-300"
              >
                {loading ? 'Processando...' : 'Finalizar Pedido'}
              </button>

              <Link
                href="/cart"
                className="block text-center mt-4 text-pink-600 hover:text-pink-700 text-sm"
              >
                Voltar ao carrinho
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}