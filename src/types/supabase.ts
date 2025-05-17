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
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          amount: number
          stark_amount: number | null
          status: string
          created_at: string
          updated_at: string | null
          user_email: string | null
          user_name: string | null
          user_phone: string | null
          payment_method: string | null
          payment_reference: string | null
          error_message: string | null
          txn_type: string
          wallet_address: string
          hash: string
          refcode: string
          phone_number: string | null
          iuc_number: string | null
          meter_number: string | null
          network: string | null
          refunded: boolean
        }
        Insert: {
          id?: string
          amount: number
          strk_amount?: number | null
          status: string
          created_at?: string
          updated_at?: string | null
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          error_message?: string | null
          txn_type: string
          wallet_address: string
        hash: string
        refcode: string
          phone_number?: string | null
          iuc_number?: string | null
          meter_number?: string | null
          network?: string | null
          refunded?: boolean
        }
        Update: {
          id?: string
          amount?: number
          strk_amount?: number | null
          status?: string
          created_at?: string
          updated_at?: string | null
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          error_message?: string | null
          txn_type?: string
          wallet_address?: string
          hash?: string
          refcode?: string
          phone_number?: string | null
          iuc_number?: string | null
          meter_number?: string | null
          network?: string | null
          refunded?: boolean
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