import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Atelier Corpo & Cor',
  description: 'Piercing consciente, joias em titânio e arte têxtil autoral em São Paulo.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}