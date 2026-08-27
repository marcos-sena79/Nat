'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

type AdminTab = 'dashboard' | 'products' | 'services' | 'orders' | 'appointments' | 'inventory' | 'pricing' | 'finance' | 'reviews' | 'coupons'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [dashboard, setDashboard] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [supplies, setSupplies] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'dashboard':
          const dashRes = await api.get('/admin/dashboard')
          setDashboard(dashRes.data)
          break
        case 'products':
          const prodRes = await api.get('/catalog/products')
          setProducts(prodRes.data)
          break
        case 'orders':
          const ordRes = await api.get('/orders')
          setOrders(ordRes.data)
          break
        case 'appointments':
          const apptRes = await api.get('/scheduling/appointments')
          setAppointments(apptRes.data)
          break
        case 'inventory':
          const invRes = await api.get('/inventory/supplies')
          setSupplies(invRes.data)
          break
        case 'reviews':
          const revRes = await api.get('/aftercare/reviews')
          setReviews(revRes.data)
          break
        case 'finance':
          const finRes = await api.get('/finance/movements')
          setMovements(finRes.data)
          break
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
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
          ) : (
            <>
              {activeTab === 'dashboard' && dashboard && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Receita do Mês</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {Number(dashboard.total_revenue || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Despesas do Mês</p>
                      <p className="text-2xl font-bold text-red-600">
                        R$ {Number(dashboard.total_expenses || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Lucro Líquido</p>
                      <p className="text-2xl font-bold text-pink-600">
                        R$ {Number(dashboard.net_profit || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Pedidos Pendentes</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {dashboard.pending_orders || 0}
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Agendamentos Pendentes</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboard.pending_appointments || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Itens com Estoque Baixo</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {dashboard.low_stock_items || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <p className="text-sm text-gray-500">Revisões Pendentes</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {dashboard.pending_reviews || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Produtos</h2>
                    <button className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700">
                      + Novo Produto
                    </button>
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
                      {products.map((product) => (
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
                            <button className="text-pink-600 hover:text-pink-800 mr-2">Editar</button>
                            <button className="text-red-600 hover:text-red-800">Excluir</button>
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
                      {orders.map((order) => (
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
                            <button className="text-pink-600 hover:text-pink-800">Ver</button>
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
                    <button className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700">
                      + Novo Insumo
                    </button>
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
                                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                                  Aprovar
                                </button>
                                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
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
                      <button className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700">
                        + Novo Lançamento
                      </button>
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
                    <button className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700">
                      + Novo Cupom
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-500 text-center py-8">
                      Gerencie cupons de desconto para sua loja
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Serviços</h2>
                    <button className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700">
                      + Novo Serviço
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-500 text-center py-8">
                      Gerencie serviços de perfuração, troca e acompanhamento
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Fichas de Custo e Precificação</h2>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-500 text-center py-8">
                      Configure fichas de custo para produtos e serviços
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}