export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          amount: number
          strk_amount: number
          status: string
          created_at: string
          updated_at: string
          user_email: string | null
          user_name: string | null
          user_phone: string | null
          payment_method: string | null
          payment_reference: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          amount: number
          strk_amount: number
          status: string
          created_at?: string
          updated_at?: string
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          amount?: number
          strk_amount?: number
          status?: string
          created_at?: string
          updated_at?: string
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          error_message?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 