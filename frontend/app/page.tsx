import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Body Piercing & Pinturas em Tecido
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Arte, personalidade e cuidado em cada detalhe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-100 transition"
            >
              Ver Catálogo
            </Link>
            <Link
              href="/scheduling"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-pink-600 transition"
            >
              Agendar Serviço
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nossos Serviços</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Pinturas em Tecido</h3>
              <p className="text-gray-600">
                Peças únicas e personalizadas com arte em tecido
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-2">Joias & Piercings</h3>
              <p className="text-gray-600">
                Joias de qualidade para suas perfurações
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Perfurações</h3>
              <p className="text-gray-600">
                Serviço profissional com acompanhamento pós-perfuração
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Por que nos escolher?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="font-semibold mb-2">Segurança</h3>
              <p className="text-gray-600 text-sm">
                Material esterilizado e procedimentos seguros
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-semibold mb-2">Acompanhamento IA</h3>
              <p className="text-gray-600 text-sm">
                Assistente inteligente para cuidados pós-perfuração
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="font-semibold mb-2">Pagamento Fácil</h3>
              <p className="text-gray-600 text-sm">
                Pix, cartão de crédito e parcelamento
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="font-semibold mb-2">Visitas Domiciliares</h3>
              <p className="text-gray-600 text-sm">
                Atendimento na sua casa com cálculo automático
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-xl mb-8">
            Agende sua perfuração ou confira nosso catálogo
          </p>
          <Link
            href="/scheduling"
            className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-100 transition inline-block"
          >
            Agendar Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Body Piercing Studio</h3>
              <p className="text-gray-400 text-sm">
                Arte e cuidado em cada perfuração
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/catalog" className="hover:text-white">Catálogo</Link></li>
                <li><Link href="/scheduling" className="hover:text-white">Agendamento</Link></li>
                <li><Link href="/aftercare" className="hover:text-white">Cuidados</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/contact" className="hover:text-white">Contato</Link></li>
                <li><Link href="/faq" className="hover:text-white">Perguntas Frequentes</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacidade</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>contato@bodypiercing.com</li>
                <li>(11) 99999-9999</li>
                <li>Instagram: @bodypiercing</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 Body Piercing Studio. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  )
}