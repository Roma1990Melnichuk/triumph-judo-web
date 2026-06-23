import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Тріумф — Judo Club',
  description: 'Система управління клубом дзюдо Тріумф',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={inter.className}>
      <body className="bg-[#030303] text-[#F7F5F2] min-h-screen antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1B0A08', color: '#F7F5F2', border: '1px solid #2A1410' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
