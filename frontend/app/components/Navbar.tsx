'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'

export default function Navbar() {
  const itemCount = useCartStore((s) => s.getItemCount())
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fff8f3]/95 backdrop-blur">
      <div className="border-b border-black/5 bg-[#f6ece1] py-2 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-[#51484d]">
        ✦ Joias em titânio ASTM F-136 · Atendimento presencial e domiciliar em São Paulo
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <Link href="/" className="shrink-0 leading-tight text-[#221b25]">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a4b59]">Atelier</span>
          <span className="font-serif text-xl tracking-tight">Corpo &amp; Cor</span>
        </Link>
        <nav className="hidden items-center gap-7 text-xs text-[#51484d] md:flex">
          <Link href="/" className="transition hover:text-[#8a4b59]">Início</Link>
          <Link href="/catalog" className="transition hover:text-[#8a4b59]">Joias &amp; Coleções</Link>
          <Link href="/scheduling" className="transition hover:text-[#8a4b59]">Agendamento</Link>
          <Link href="/aftercare" className="transition hover:text-[#8a4b59]">Pós-perfuração &amp; IA</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/cart" aria-label={`Carrinho${itemCount ? `, ${itemCount} itens` : ''}`} className="relative rounded-full border border-black/10 px-3 py-2 text-xs transition hover:bg-[#f6ece1]">
            <span className="hidden sm:inline">Sacola</span><span className="sm:hidden">♡</span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8a4b59] px-1 text-[9px] text-white">
                {itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && <Link href="/admin" className="hidden text-xs text-[#51484d] hover:text-[#8a4b59] sm:block">Painel</Link>}
              <button onClick={logout} className="text-xs text-[#51484d] transition hover:text-[#8a4b59]">Sair</button>
            </div>
          ) : (
            <Link href="/login" className="hidden text-xs text-[#51484d] transition hover:text-[#8a4b59] sm:block">Área do cliente</Link>
          )}
          <Link href="/scheduling" className="rounded-full bg-[#8a4b59] px-4 py-2.5 text-[11px] font-medium text-white transition hover:bg-[#6f3542] sm:px-5">
            Agendar horário
          </Link>
        </div>
      </div>
    </header>
  )
}