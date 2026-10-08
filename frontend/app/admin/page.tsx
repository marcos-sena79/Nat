'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { isAxiosError } from 'axios'

type AdminTab = 'dashboard' | 'products' | 'services' | 'orders' | 'appointments' | 'inventory' | 'pricing' | 'finance' | 'reviews' | 'coupons'
type CreateDialog = 'product' | 'service' | 'supply' | 'movement' | 'coupon' | null

interface DashboardSummary {
  total_revenue: number
  total_expenses: number
  net_profit: number
  pending_orders: number
  pending_appointments: number
  low_stock_items: number
  pending_reviews: number
}

interface Product {
  id: number
  name: string
  category: string
  base_price: number
  stock: number
  is_active: boolean
}

interface Service {
  id: number
  name: string
  service_type: string
  duration_minutes: number
  price: number
  deposit_amount: number
  is_active: boolean
}

interface Order {
  id: number
  total: number
  status: string
  items_count: number
  created_at: string
}

interface Appointment {
  id: number
  service_name: string
  client_name: string
  start_time: string
  end_time: string
  status: string
}

interface Supply {
  id: number
  name: string
  category: string
  unit: string
  current_stock: number
  min_stock: number
  average_cost: number
}

interface CostSheet {
  id: number
  item_type: string
  product_name: string | null
  service_name: string | null
  total_cost: number | null
  suggested_price: number | null
}

interface Review {
  id: number
  priority: string
  reason: string
  decision: string
  created_at: string
}

interface FinancialMovement {
  id: number
  movement_type: 'income' | 'expense'
  category: string
  amount: number
  description: string | null
  movement_date: string
}

interface Coupon {
  id: number
  code: string
  name: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  status: 'draft' | 'active' | 'paused' | 'expired' | 'exhausted'
  start_date: string
  end_date: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [costSheets, setCostSheets] = useState<CostSheet[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [movements, setMovements] = useState<FinancialMovement[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)
  const [createDialog, setCreateDialog] = useState<CreateDialog>(null)
  const [creating, setCreating] = useState(false)

  const fetchData = useCallback(async (tab: AdminTab) => {
    setLoading(true)
    setLoadError('')
    try {
      switch (tab) {
        case 'dashboard':
          {
            const [summaryResponse, reviewsResponse] = await Promise.all([
              api.get<Omit<DashboardSummary, 'pending_reviews'>>('/finance/dashboard'),
              api.get<Review[]>('/aftercare/reviews', { params: { status: 'pending' } }),
            ])
            setDashboard({
              ...summaryResponse.data,
              pending_reviews: reviewsResponse.data.length,
            })
          }
          break
        case 'products':
          setProducts((await api.get<Product[]>('/catalog/products')).data)
          break
        case 'services':
          setServices((await api.get<Service[]>('/scheduling/services')).data)
          break
        case 'orders':
          setOrders((await api.get<Order[]>('/orders/orders')).data)
          break
        case 'appointments':
          setAppointments((await api.get<Appointment[]>('/scheduling/appointments')).data)
          break
        case 'inventory':
          setSupplies((await api.get<Supply[]>('/inventory/supplies')).data)
          break
        case 'pricing':
          setCostSheets((await api.get<CostSheet[]>('/pricing/cost-sheets')).data)
          break
        case 'reviews':
          setReviews((await api.get<Review[]>('/aftercare/reviews', { params: { status: 'pending' } })).data)
          break
        case 'finance':
          setMovements((await api.get<FinancialMovement[]>('/finance/movements')).data)
          break
        case 'coupons':
          setCoupons((await api.get<Coupon[]>('/coupons')).data)
          break
      }
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail || error.message
        : error instanceof Error ? error.message : 'Erro desconhecido'
      setLoadError(`Não foi possível carregar esta área: ${message}`)
      toast.error(`Erro ao carregar ${tab === 'dashboard' ? 'o painel' : `a aba ${tab}`}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData(activeTab)
  }, [activeTab, fetchData])

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setSavingId(orderId)
    try {
      await api.put(`/orders/orders/${orderId}/status`, null, { params: { new_status: newStatus } })
      toast.success(`Pedido #${orderId} atualizado`)
      await fetchData('orders')
    } catch (error) {
      toast.error(isAxiosError(error) ? error.response?.data?.detail || 'Não foi possível atualizar o pedido' : 'Não foi possível atualizar o pedido')
    } finally {
      setSavingId(null)
    }
  }

  const cancelAppointment = async (appointmentId: number) => {
    setSavingId(appointmentId)
    try {
      await api.put(`/scheduling/appointments/${appointmentId}/cancel`)
      toast.success('Agendamento cancelado')
      await fetchData('appointments')
    } catch (error) {
      toast.error(isAxiosError(error) ? error.response?.data?.detail || 'Não foi possível cancelar o agendamento' : 'Não foi possível cancelar o agendamento')
    } finally {
      setSavingId(null)
    }
  }

  const decideReview = async (reviewId: number, decision: 'approved' | 'needs_followup') => {
    const enteredNotes = decision === 'needs_followup'
      ? window.prompt('Observação para o acompanhamento (opcional):')
      : null
    if (decision === 'needs_followup' && enteredNotes === null) return
    const notes = enteredNotes?.trim() || undefined

    setSavingId(reviewId)
    try {
      await api.put(`/aftercare/reviews/${reviewId}`, null, {
        params: { decision, ...(notes ? { notes } : {}) },
      })
      toast.success(decision === 'approved' ? 'Revisão aprovada' : 'Acompanhamento solicitado')
      await fetchData(activeTab)
    } catch (error) {
      toast.error(isAxiosError(error) ? error.response?.data?.detail || 'Não foi possível atualizar a revisão' : 'Não foi possível atualizar a revisão')
    } finally {
      setSavingId(null)
    }
  }

  const deactivateProduct = async (productId: number) => {
    if (!window.confirm('Deseja desativar este produto?')) return

    setSavingId(productId)
    try {
      await api.delete(`/catalog/products/${productId}`)
      toast.success('Produto desativado')
      await fetchData('products')
    } catch (error) {
      toast.error(isAxiosError(error) ? error.response?.data?.detail || 'Não foi possível desativar o produto' : 'Não foi possível desativar o produto')
    } finally {
      setSavingId(null)
    }
  }

  const createEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!createDialog) return

    const formData = new FormData(event.currentTarget)
    let endpoint = ''
    let payload: Record<
      string,
      string | number | boolean | null | Array<Record<string, string | number | boolean | null>>
    > = {}
    let tab: AdminTab = activeTab

    if (createDialog === 'product') {
      endpoint = '/catalog/products'
      tab = 'products'
      payload = {
        name: String(formData.get('name')),
        category: String(formData.get('category')),
        description: String(formData.get('description') || ''),
        base_price: Number(formData.get('base_price')),
        stock: Number(formData.get('stock')),
        min_stock: Number(formData.get('min_stock')),
        is_active: true,
        is_eligible_for_piercing: false,
      }
    } else if (createDialog === 'service') {
      endpoint = '/scheduling/services'
      tab = 'services'
      payload = {
        name: String(formData.get('name')),
        service_type: String(formData.get('service_type')),
        description: String(formData.get('description') || ''),
        duration_minutes: Number(formData.get('duration_minutes')),
        price: Number(formData.get('price')),
        deposit_amount: Number(formData.get('deposit_amount')),
        payment_policy: String(formData.get('payment_policy')),
        is_active: true,
      }
    } else if (createDialog === 'supply') {
      endpoint = '/inventory/supplies'
      tab = 'inventory'
      payload = {
        name: String(formData.get('name')),
        category: String(formData.get('category')),
        unit: String(formData.get('unit')),
        current_stock: Number(formData.get('current_stock')),
        min_stock: Number(formData.get('min_stock')),
      }
    } else if (createDialog === 'coupon') {
      endpoint = '/coupons'
      tab = 'coupons'
      payload = {
        code: String(formData.get('code')).trim().toUpperCase(),
        name: String(formData.get('name')),
        discount_type: String(formData.get('discount_type')),
        discount_value: Number(formData.get('discount_value')),
        start_date: new Date(String(formData.get('start_date'))).toISOString(),
        end_date: new Date(String(formData.get('end_date'))).toISOString(),
        max_uses: Number(formData.get('max_uses')) || null,
        max_uses_per_client: Number(formData.get('max_uses_per_client')) || 1,
        minimum_order_value: Number(formData.get('minimum_order_value')) || 0,
        is_cumulative: false,
        status: String(formData.get('status')),
        notes: String(formData.get('notes') || ''),
        rules: [],
      }
    } else {
      endpoint = '/finance/movements'
      tab = 'finance'
      payload = {
        movement_type: String(formData.get('movement_type')),
        category: String(formData.get('category')),
        amount: Number(formData.get('amount')),
        description: String(formData.get('description') || ''),
        movement_date: new Date(String(formData.get('movement_date'))).toISOString(),
      }
    }

    setCreating(true)
    try {
      await api.post(endpoint, payload)
      toast.success('Cadastro realizado com sucesso')
      setCreateDialog(null)
      await fetchData(tab)
    } catch (error) {
      toast.error(isAxiosError(error) ? error.response?.data?.detail || 'Não foi possível salvar os dados' : 'Não foi possível salvar os dados')
    } finally {
      setCreating(false)
    }
  }

  const updateCouponStatus = async (couponId: number, newStatus: Coupon['status']) => {
    setSavingId(couponId)
    try {
      await api.put(`/coupons/${couponId}/status`, null, { params: { new_status: newStatus } })
      toast.success('Status do cupom atualizado')
      await fetchData('coupons')
    } catch (error) {
      toast.error(isAxiosError(error) ? error.response?.data?.detail || 'Não foi possível atualizar o cupom' : 'Não foi possível atualizar o cupom')
    } finally {
      setSavingId(null)
    }
  }

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Produtos', icon: '🎨' },
    { id: 'services', label: 'Serviços', icon: '✨' },
    { id: 'orders', label: 'Pedidos', icon: '📦' },
    { id: 'appointments', label: 'Agenda', icon: '📅' },
    { id: 'inventory', label: 'Estoque', icon: '📋' },
    { id: 'pricing', label: 'Custos', icon: '💰' },
    { id: 'finance', label: 'Financeiro', icon: '💵' },
    { id: 'reviews', label: 'Revisões IA', icon: '🤖' },
    { id: 'coupons', label: 'Cupons', icon: '🏷️' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              Painel Administrativo
            </Link>
            <Link href="/" className="text-gray-600 hover:text-pink-600">
              Voltar ao site
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-pink-100'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            </div>
          ) : loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">
              {loadError}
              {activeTab !== 'coupons' && (
                <button
                  onClick={() => void fetchData(activeTab)}
                  className="ml-3 font-semibold underline"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && dashboard && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Receita do Mês</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Number(dashboard.total_revenue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Despesas do Mês</p>
                      <p className="text-2xl font-bold text-red-600">
                        {Number(dashboard.total_expenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Lucro Líquido</p>
                      <p className="text-2xl font-bold text-pink-600">
                        {Number(dashboard.net_profit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Pedidos Pendentes</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {dashboard.pending_orders}
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Agendamentos Pendentes</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboard.pending_appointments}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Itens com Estoque Baixo</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {dashboard.low_stock_items}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Revisões Pendentes</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {dashboard.pending_reviews}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Produtos</h2>
                    <button
                      onClick={() => setCreateDialog('product')}
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700"
                    >+ Novo Produto</button>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Categoria</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Preço</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estoque</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {products.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">Nenhum produto ativo encontrado.</td></tr>
                      ) : products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{product.name}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">R$ {Number(product.base_price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">{product.stock}</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => void deactivateProduct(product.id)}
                              disabled={savingId === product.id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            >{savingId === product.id ? 'Desativando...' : 'Desativar'}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Pedidos</h2>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">#</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">Nenhum pedido encontrado.</td></tr>
                      ) : orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{order.id}</td>
                          <td className="px-4 py-3 text-sm">R$ {Number(order.total).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === 'paid' ? 'bg-green-100 text-green-700' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <select
                              value={order.status}
                              onChange={(event) => void updateOrderStatus(order.id, event.target.value)}
                              disabled={savingId === order.id}
                              aria-label={`Status do pedido ${order.id}`}
                              className="rounded border border-gray-200 bg-white px-2 py-1 text-xs disabled:opacity-50"
                            >
                              {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Agendamentos</h2>
                  </div>
                  <div className="p-4">
                    {appointments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Nenhum agendamento encontrado</p>
                    ) : (
                      <div className="space-y-3">
                        {appointments.map((appt) => (
                          <div key={appt.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{appt.service_name}</p>
                                <p className="text-sm text-gray-500">{appt.client_name}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {appt.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              {new Date(appt.start_time).toLocaleString('pt-BR')}
                            </p>
                            {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                              <button
                                onClick={() => void cancelAppointment(appt.id)}
                                disabled={savingId === appt.id}
                                className="mt-3 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                {savingId === appt.id ? 'Cancelando...' : 'Cancelar agendamento'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Insumos</h2>
                    <button
                      onClick={() => setCreateDialog('supply')}
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700"
                    >+ Novo Insumo</button>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Categoria</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estoque</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Custo Médio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {supplies.map((supply) => (
                        <tr key={supply.id} className={`hover:bg-gray-50 ${
                          supply.current_stock <= supply.min_stock ? 'bg-red-50' : ''
                        }`}>
                          <td className="px-4 py-3 text-sm">{supply.name}</td>
                          <td className="px-4 py-3 text-sm">{supply.category}</td>
                          <td className="px-4 py-3 text-sm">
                            {supply.current_stock} {supply.unit}
                            {supply.current_stock <= supply.min_stock && (
                              <span className="ml-2 text-red-500 text-xs">⚠ Baixo</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">R$ {Number(supply.average_cost).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Fila de Revisões - Assistente IA</h2>
                  </div>
                  <div className="p-4">
                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-5xl mb-4">✅</div>
                        <p className="text-gray-500">Nenhuma revisão pendente</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reviews.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  review.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                  review.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {review.priority}
                                </span>
                                <p className="mt-2 text-gray-700">{review.reason}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => void decideReview(review.id, 'approved')}
                                  disabled={savingId === review.id}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                >
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => void decideReview(review.id, 'needs_followup')}
                                  disabled={savingId === review.id}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                >
                                  Responder
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'finance' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Fluxo de Caixa</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-500">Receitas</p>
                        <p className="text-xl font-bold text-green-600">
                          R$ {movements
                            .filter((m) => m.movement_type === 'income')
                            .reduce((sum, m) => sum + Number(m.amount), 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-500">Despesas</p>
                        <p className="text-xl font-bold text-red-600">
                          R$ {movements
                            .filter((m) => m.movement_type === 'expense')
                            .reduce((sum, m) => sum + Number(m.amount), 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-pink-50 rounded-lg">
                        <p className="text-sm text-gray-500">Saldo</p>
                        <p className="text-xl font-bold text-pink-600">
                          R$ {(
                            movements
                              .filter((m) => m.movement_type === 'income')
                              .reduce((sum, m) => sum + Number(m.amount), 0) -
                            movements
                              .filter((m) => m.movement_type === 'expense')
                              .reduce((sum, m) => sum + Number(m.amount), 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Lançamentos</h2>
                      <button
                        onClick={() => setCreateDialog('movement')}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700"
                      >+ Novo Lançamento</button>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Categoria</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Valor</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {movements.slice(0, 10).map((movement) => (
                          <tr key={movement.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                movement.movement_type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {movement.movement_type === 'income' ? 'Receita' : 'Despesa'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{movement.category}</td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {movement.movement_type === 'income' ? '+' : '-'} R$ {Number(movement.amount).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(movement.movement_date).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'coupons' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Cupons de Desconto</h2>
                    <button
                      onClick={() => setCreateDialog('coupon')}
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700"
                    >+ Novo Cupom</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Código</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cupom</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Desconto</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Validade</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {coupons.length === 0 ? (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">Nenhum cupom cadastrado.</td></tr>
                        ) : coupons.map((coupon) => (
                          <tr key={coupon.id}>
                            <td className="px-4 py-3 text-sm font-semibold">{coupon.code}</td>
                            <td className="px-4 py-3 text-sm">{coupon.name}</td>
                            <td className="px-4 py-3 text-sm">
                              {coupon.discount_type === 'percentage'
                                ? `${Number(coupon.discount_value)}%`
                                : Number(coupon.discount_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(coupon.start_date).toLocaleDateString('pt-BR')} – {new Date(coupon.end_date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <select
                                value={coupon.status}
                                onChange={(event) => void updateCouponStatus(coupon.id, event.target.value as Coupon['status'])}
                                disabled={savingId === coupon.id}
                                aria-label={`Status do cupom ${coupon.code}`}
                                className="rounded border border-gray-200 bg-white px-2 py-1 text-xs disabled:opacity-50"
                              >
                                {(['draft', 'active', 'paused', 'expired', 'exhausted'] as const).map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Serviços</h2>
                    <button
                      onClick={() => setCreateDialog('service')}
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700"
                    >+ Novo Serviço</button>
                  </div>
                  <div className="p-4">
                    {services.length === 0 ? (
                      <p className="py-8 text-center text-gray-500">Nenhum serviço ativo encontrado.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Serviço</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Duração</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Preço</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sinal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {services.map((service) => (
                              <tr key={service.id}>
                                <td className="px-4 py-3 text-sm font-medium">{service.name}</td>
                                <td className="px-4 py-3 text-sm">{service.service_type}</td>
                                <td className="px-4 py-3 text-sm">{service.duration_minutes} min</td>
                                <td className="px-4 py-3 text-sm">{Number(service.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className="px-4 py-3 text-sm">{Number(service.deposit_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Fichas de Custo e Precificação</h2>
                  </div>
                  <div className="p-4">
                    {costSheets.length === 0 ? (
                      <p className="py-8 text-center text-gray-500">Nenhuma ficha de custo cadastrada.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Item</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Custo total</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Preço sugerido</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {costSheets.map((sheet) => (
                              <tr key={sheet.id}>
                                <td className="px-4 py-3 text-sm font-medium">{sheet.product_name || sheet.service_name || `Ficha #${sheet.id}`}</td>
                                <td className="px-4 py-3 text-sm">{sheet.item_type === 'product' ? 'Produto' : 'Serviço'}</td>
                                <td className="px-4 py-3 text-sm">{sheet.total_cost == null ? '—' : Number(sheet.total_cost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className="px-4 py-3 text-sm">{sheet.suggested_price == null ? '—' : Number(sheet.suggested_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {createDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-entry-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="create-entry-title" className="text-xl font-semibold">
                {createDialog === 'product' ? 'Novo produto' : createDialog === 'service' ? 'Novo serviço' : createDialog === 'supply' ? 'Novo insumo' : createDialog === 'coupon' ? 'Novo cupom' : 'Novo lançamento financeiro'}
              </h2>
              <button type="button" onClick={() => setCreateDialog(null)} className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100" aria-label="Fechar">✕</button>
            </div>
            <form onSubmit={createEntry} className="space-y-4">
              {(createDialog === 'product' || createDialog === 'service' || createDialog === 'supply' || createDialog === 'coupon') && (
                <label className="block text-sm">
                  <span className="mb-1 block text-gray-600">Nome</span>
                  <input name="name" required className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                </label>
              )}
              {createDialog === 'coupon' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Código</span><input name="code" required maxLength={40} className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Status inicial</span><select name="status" className="w-full rounded-lg border border-gray-300 px-3 py-2"><option value="draft">Rascunho</option><option value="active">Ativo</option></select></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Tipo de desconto</span><select name="discount_type" className="w-full rounded-lg border border-gray-300 px-3 py-2"><option value="percentage">Percentual (%)</option><option value="fixed">Valor fixo (R$)</option></select></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Desconto</span><input name="discount_value" type="number" min="0.01" step="0.01" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Início</span><input name="start_date" type="datetime-local" required defaultValue={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Término</span><input name="end_date" type="datetime-local" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Limite de usos (0 = sem limite)</span><input name="max_uses" type="number" min="0" defaultValue="0" className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Usos por cliente</span><input name="max_uses_per_client" type="number" min="1" defaultValue="1" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                  </div>
                  <label className="block text-sm"><span className="mb-1 block text-gray-600">Pedido mínimo (R$)</span><input name="minimum_order_value" type="number" min="0" step="0.01" defaultValue="0" className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                  <label className="block text-sm"><span className="mb-1 block text-gray-600">Observações</span><textarea name="notes" rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                </>
              )}
              {createDialog === 'product' && (
                <>
                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-600">Categoria</span>
                    <select name="category" required className="w-full rounded-lg border border-gray-300 px-3 py-2">
                      <option value="jewelry">Joias</option>
                      <option value="paintings">Pinturas</option>
                      <option value="aftercare">Cuidados</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-600">Descrição</span>
                    <textarea name="description" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Preço</span><input name="base_price" type="number" min="0" step="0.01" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Estoque</span><input name="stock" type="number" min="0" defaultValue="0" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Estoque mínimo</span><input name="min_stock" type="number" min="0" defaultValue="0" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                  </div>
                </>
              )}
              {createDialog === 'service' && (
                <>
                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-600">Tipo de serviço</span>
                    <select name="service_type" required className="w-full rounded-lg border border-gray-300 px-3 py-2">
                      <option value="piercing">Perfuração</option>
                      <option value="jewelry_change">Troca de joia</option>
                      <option value="evaluation">Avaliação</option>
                      <option value="aftercare">Pós-atendimento</option>
                      <option value="home_visit">Visita domiciliar</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-600">Descrição</span>
                    <textarea name="description" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Duração (minutos)</span><input name="duration_minutes" type="number" min="1" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Preço</span><input name="price" type="number" min="0" step="0.01" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Sinal</span><input name="deposit_amount" type="number" min="0" step="0.01" defaultValue="0" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm">
                      <span className="mb-1 block text-gray-600">Política de pagamento</span>
                      <select name="payment_policy" className="w-full rounded-lg border border-gray-300 px-3 py-2">
                        <option value="full">Pagamento integral</option>
                        <option value="deposit_only">Somente sinal</option>
                        <option value="free">Gratuito</option>
                      </select>
                    </label>
                  </div>
                </>
              )}
              {createDialog === 'supply' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Categoria</span><input name="category" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Unidade</span><input name="unit" placeholder="un, ml, g..." required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Estoque atual</span><input name="current_stock" type="number" min="0" defaultValue="0" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Estoque mínimo</span><input name="min_stock" type="number" min="0" defaultValue="0" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                  </div>
                </>
              )}
              {createDialog === 'movement' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="mb-1 block text-gray-600">Tipo</span>
                      <select name="movement_type" className="w-full rounded-lg border border-gray-300 px-3 py-2">
                        <option value="income">Receita</option>
                        <option value="expense">Despesa</option>
                      </select>
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block text-gray-600">Categoria</span>
                      <select name="category" className="w-full rounded-lg border border-gray-300 px-3 py-2">
                        <option value="sale">Venda</option>
                        <option value="deposit">Sinal</option>
                        <option value="service_payment">Pagamento de serviço</option>
                        <option value="refund">Reembolso</option>
                        <option value="adjustment_in">Ajuste de entrada</option>
                        <option value="supply_purchase">Compra de insumos</option>
                        <option value="rent">Aluguel</option>
                        <option value="utilities">Contas</option>
                        <option value="internet">Internet</option>
                        <option value="transport">Transporte</option>
                        <option value="marketing">Marketing</option>
                        <option value="fees">Taxas</option>
                        <option value="other_expense">Outra despesa</option>
                        <option value="adjustment_out">Ajuste de saída</option>
                      </select>
                    </label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Valor</span><input name="amount" type="number" min="0.01" step="0.01" required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm"><span className="mb-1 block text-gray-600">Data</span><input name="movement_date" type="datetime-local" defaultValue={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} required className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                  </div>
                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-600">Descrição</span>
                    <input name="description" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                  </label>
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setCreateDialog(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Cancelar</button>
                <button type="submit" disabled={creating} className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50">
                  {creating ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}