'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'

export default function Navbar() {
  const itemCount = useCartStore((s) => s.getItemCount())
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-pink-600">
            Body Piercing Studio
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/catalog" className="text-gray-600 hover:text-pink-600 transition">
              Catálogo
            </Link>
            <Link href="/scheduling" className="text-gray-600 hover:text-pink-600 transition">
              Agendamento
            </Link>
            <Link href="/aftercare" className="text-gray-600 hover:text-pink-600 transition">
              Cuidados
            </Link>
            <Link href="/cart" className="relative text-gray-600 hover:text-pink-600 transition">
              Carrinho
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {user?.role === 'admin' && (
                  <Link href="/admin" className="text-gray-600 hover:text-pink-600 transition">
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-pink-600 transition"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}