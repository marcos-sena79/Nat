'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface Message {
  id: number
  author: 'client' | 'ai' | 'admin'
  content: string
  risk_level: string
  created_at: string
}

interface Conversation {
  id: number
  status: string
  consent_given: string | null
  messages: Message[]
}

export default function AftercarePage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'library'>('library')
  const [library, setLibrary] = useState<any[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const careLibrary = [
    {
      type: 'Lóbulo',
      icon: '👂',
      instructions: [
        'Lave as mãos antes de tocar na perfuração',
        'Use solução salina 2x ao dia',
        'Não gire a joia',
        'Evite dormir do lado da perfuração',
        'Cicatrização: 6-8 semanas',
      ],
    },
    {
      type: 'Cartilagem',
      icon: '💎',
      instructions: [
        'Lave as mãos antes de tocar',
        'Use spray de solução salina',
        'Não aperte nem gire a joia',
        'Evite fones de ouvido',
        'Cuidado ao pentear o cabelo',
        'Cicatrização: 3-12 meses',
      ],
    },
    {
      type: 'Nariz',
      icon: '👃',
      instructions: [
        'Use spray salino 2-3x ao dia',
        'Cuidado ao limpar o nariz',
        'Evite maquiagem na região',
        'Cicatrização: 2-4 meses',
      ],
    },
    {
      type: 'Umbigo',
      icon: '✨',
      instructions: [
        'Lave com sabão neutro e água morna',
        'Seque cuidadosamente',
        'Use roupas soltas',
        'Evite atividades físicas intensas',
        'Cicatrização: 6-12 meses',
      ],
    },
  ]

  useEffect(() => {
    if (activeTab === 'chat') {
      fetchConversations()
    }
  }, [activeTab])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const fetchConversations = async () => {
    try {
      const response = await api.get('/aftercare/conversations')
      setConversations(response.data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const createConversation = async () => {
    try {
      const response = await api.post('/aftercare/conversations', {
        appointment_id: 1,
      })
      setSelectedConversation(response.data)
    } catch (error) {
      toast.error('Erro ao criar conversa')
    }
  }

  const giveConsent = async () => {
    if (!selectedConversation) return
    try {
      await api.post(`/aftercare/conversations/${selectedConversation.id}/consent`)
      setConsentGiven(true)
      setSelectedConversation({
        ...selectedConversation,
        consent_given: new Date().toISOString(),
      })
      toast.success('Consentimento registrado')
    } catch (error) {
      toast.error('Erro ao registrar consentimento')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setLoading(true)
      const response = await api.post(
        `/aftercare/conversations/${selectedConversation.id}/messages`,
        { content: newMessage }
      )

      setSelectedConversation({
        ...selectedConversation,
        messages: [...(selectedConversation.messages || []), response.data],
      })
      setNewMessage('')
    } catch (error) {
      toast.error('Erro ao enviar mensagem')
    } finally {
      setLoading(false)
    }
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
              <Link href="/aftercare" className="text-pink-600 font-semibold">
                Cuidados
              </Link>
              <Link href="/cart" className="text-gray-600 hover:text-pink-600">
                Carrinho 🛒
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Cuidados Pós-Perfuração</h1>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'library'
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-600 hover:bg-pink-100'
            }`}
          >
            Biblioteca de Cuidados
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'chat'
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-600 hover:bg-pink-100'
            }`}
          >
            Assistente de Acompanhamento
          </button>
        </div>

        {activeTab === 'library' && (
          <div className="grid md:grid-cols-2 gap-6">
            {careLibrary.map((item) => (
              <div key={item.type} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <h2 className="text-xl font-semibold">{item.type}</h2>
                </div>
                <ul className="space-y-2">
                  {item.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <span className="text-pink-600 mt-1">•</span>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
            {!selectedConversation ? (
              <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-xl font-semibold mb-2">Assistente de Acompanhamento</h2>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Tire dúvidas sobre seus cuidados pós-perfuração. Nosso assistente usa IA para
                  orientar com base nas melhores práticas.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Aviso:</strong> O assistente de IA é um recurso informativo e não substitui
                    avaliação profissional. Em caso de sintomas graves, procure atendimento médico.
                  </p>
                </div>
                <button
                  onClick={createConversation}
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
                >
                  Iniciar Conversa
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="bg-pink-600 text-white p-4">
                  <h3 className="font-semibold">Assistente de Acompanhamento</h3>
                  <p className="text-sm text-pink-100">Resposta baseada em orientações aprovadas</p>
                </div>

                {!consentGiven && !selectedConversation.consent_given && (
                  <div className="p-4 bg-yellow-50 border-b">
                    <p className="text-sm text-yellow-800 mb-2">
                      Para usar o chat de acompanhamento, precisamos do seu consentimento para uso
                      de IA. Suas imagens e mensagens são tratadas com sigilo e não são usadas para
                      treinamento de modelos.
                    </p>
                    <button
                      onClick={giveConsent}
                      className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700"
                    >
                      Aceitar e Continuar
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.author === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.author === 'client'
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.author === 'ai' && (
                          <p className="text-xs mt-2 opacity-70 italic">
                            A IA é apoio informativo; não fornece diagnóstico.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Descreva sua situação..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      disabled={!consentGiven && !selectedConversation.consent_given}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !newMessage.trim()}
                      className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition disabled:bg-pink-300"
                    >
                      {loading ? '...' : 'Enviar'}
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-sm text-gray-500 hover:text-pink-600 mt-2"
                  >
                    ← Voltar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}