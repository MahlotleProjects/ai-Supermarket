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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          cost_price: number
          quantity: number
          expiry_date: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          cost_price: number
          quantity: number
          expiry_date: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          cost_price?: number
          quantity?: number
          expiry_date?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          product_id: string
          quantity: number
          sale_price: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity: number
          sale_price: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          sale_price?: number
          created_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          type: string
          product_id: string
          message: string
          suggested_action: string
          priority: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          product_id: string
          message: string
          suggested_action: string
          priority: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          product_id?: string
          message?: string
          suggested_action?: string
          priority?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}