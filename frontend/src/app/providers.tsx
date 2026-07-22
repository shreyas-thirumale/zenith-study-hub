'use client'

import { ReactNode, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queries'
import { useAuthStore } from '@/store/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})

// Supabase Realtime — invalidates TanStack Query cache on any DB change
// This is what makes the app real-time: any insert/update/delete anywhere
// automatically refreshes the relevant data across all open tabs
function RealtimeSync() {
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, () => {
        qc.invalidateQueries({ queryKey: queryKeys.events })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        qc.invalidateQueries({ queryKey: queryKeys.projects })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        qc.invalidateQueries({ queryKey: queryKeys.courses })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'focus_sessions' }, () => {
        qc.invalidateQueries({ queryKey: queryKeys.focusSessions })
        qc.invalidateQueries({ queryKey: queryKeys.focusStats })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload: any) => {
        const projectId = payload.new?.project_id ?? payload.old?.project_id
        if (projectId) qc.invalidateQueries({ queryKey: queryKeys.tasks(projectId) })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [qc])

  return null
}

// Initialize auth session on app load
function AuthInit() {
  const { initializeSession } = useAuthStore()
  useEffect(() => { initializeSession() }, [])
  return null
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        storageKey="zenith-theme"
      >
        <AuthInit />
        <RealtimeSync />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
            success: {
              duration: 2500,
              iconTheme: { primary: '#10B981', secondary: 'hsl(var(--card))' },
            },
            error: {
              duration: 3500,
              iconTheme: { primary: '#EF4444', secondary: 'hsl(var(--card))' },
            },
          }}
        />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}