import type { Metadata } from 'next'
import { Inter, Unbounded } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-unbounded',
  display: 'swap',
  weight: ['400', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Тріумф — Judo Club',
  description: 'Система управління клубом дзюдо Тріумф',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${inter.variable} ${unbounded.variable}`}>
      <body className="bg-tr-bg text-text1 min-h-screen antialiased font-sans">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#120B08',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '14px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#19C45A', secondary: '#050505' } },
              error:   { iconTheme: { primary: '#FF3D00', secondary: '#050505' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
