'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Service {
  id: number
  name: string
  service_type: string
  duration_minutes: number
  price: number
  deposit_amount: number
  description: string
}

interface AvailableSlot {
  start_time: string
  end_time: string
}

export default function SchedulingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedService, selectedDate])

  const fetchServices = async () => {
    try {
      const response = await api.get('/scheduling/services')
      setServices(response.data)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    if (!selectedService || !selectedDate) return
    
    try {
      setLoadingSlots(true)
      const response = await api.get('/scheduling/availability', {
        params: {
          service_id: selectedService.id,
          date: selectedDate,
        },
      })
      setAvailableSlots(response.data)
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedService || !selectedSlot) return
    
    // Redirect to login or booking confirmation
    alert('Por favor, faça login para confirmar o agendamento.')
  }

  const getServiceTypeName = (type: string) => {
    const types: Record<string, string> = {
      piercing: 'Perfuração',
      jewelry_change: 'Troca de Joia',
      evaluation: 'Avaliação',
      aftercare: 'Acompanhamento',
      home_visit: 'Visita Domiciliar',
    }
    return types[type] || type
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              Atelier Corpo & Cor
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/catalog" className="text-gray-600 hover:text-pink-600">
                Catálogo
              </Link>
              <Link href="/scheduling" className="text-pink-600 font-semibold">
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
        <h1 className="text-3xl font-bold mb-8">Agendar Serviço</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step 1: Select Service */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">1. Selecione o Serviço</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        selectedService?.id === service.id
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-pink-600 bg-pink-100 px-2 py-1 rounded">
                          {getServiceTypeName(service.service_type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {service.duration_minutes} min
                        </span>
                      </div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-lg font-bold text-pink-600">
                          R$ {service.price.toFixed(2)}
                        </span>
                        {service.deposit_amount > 0 && (
                          <span className="text-xs text-gray-500">
                            Sinal: R$ {service.deposit_amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Select Date */}
            {selectedService && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">2. Selecione a Data</h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}

            {/* Step 3: Select Time */}
            {selectedService && selectedDate && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">3. Selecione o Horário</h2>
                
                {loadingSlots ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando horários...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    Nenhum horário disponível para esta data.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedSlot?.start_time === slot.start_time
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-pink-100'
                        }`}
                      >
                        {format(new Date(slot.start_time), 'HH:mm')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumo</h2>
              
              {selectedService ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Serviço</p>
                    <p className="font-medium">{selectedService.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duração</p>
                    <p className="font-medium">{selectedService.duration_minutes} minutos</p>
                  </div>
                  {selectedDate && (
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="font-medium">
                        {format(new Date(selectedDate), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  )}
                  {selectedSlot && (
                    <div>
                      <p className="text-sm text-gray-600">Horário</p>
                      <p className="font-medium">
                        {format(new Date(selectedSlot.start_time), 'HH:mm')} -{' '}
                        {format(new Date(selectedSlot.end_time), 'HH:mm')}
                      </p>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold text-pink-600">
                        R$ {selectedService.price.toFixed(2)}
                      </span>
                    </div>
                    {selectedService.deposit_amount > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Sinal: R$ {selectedService.deposit_amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={!selectedSlot}
                    className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Agendar
                  </button>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  Selecione um serviço para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}