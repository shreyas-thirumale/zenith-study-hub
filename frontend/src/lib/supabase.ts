import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          user_id: string
          name: string
          code: string
          color: string
          days: string[]
          start_time: string | null
          end_time: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          title: string
          description: string | null
          date: string
          time: string | null
          type: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['calendar_events']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['calendar_events']['Insert']>
      }
      projects: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          name: string
          description: string | null
          status: string
          progress: number
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          task_id: string | null
          duration: number
          started_at: string
          ended_at: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['focus_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['focus_sessions']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          assigned_to: string | null
          title: string
          description: string | null
          status: string
          priority: string
          due_date: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
    }
  }
}
