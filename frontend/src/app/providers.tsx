'use client'

import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="zenith-theme"
    >
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
          success: {
            duration: 2500,
            iconTheme: {
              primary: '#10B981',
              secondary: 'hsl(var(--card))',
            },
          },
          error: {
            duration: 3500,
            iconTheme: {
              primary: '#EF4444',
              secondary: 'hsl(var(--card))',
            },
          },
        }}
      />
    </ThemeProvider>
  )
}