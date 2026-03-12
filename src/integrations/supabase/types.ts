export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          feedback: string | null
          id: string
          name: string
          status: string | null
          storage_path: string
          user_id: string
          user_service_id: string
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          name: string
          status?: string | null
          storage_path: string
          user_id: string
          user_service_id: string
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          name?: string
          status?: string | null
          storage_path?: string
          user_id?: string
          user_service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_service_id_fkey"
            columns: ["user_service_id"]
            isOneToOne: false
            referencedRelation: "user_services"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_fee_payments: {
        Row: {
          amount: number
          created_at: string | null
          fee_type: string
          id: string
          payment_id: string | null
          payment_method: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          fee_type: string
          id?: string
          payment_id?: string | null
          payment_method: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          fee_type?: string
          id?: string
          payment_id?: string | null
          payment_method?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_fee_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          email_sent: boolean
          id: string
          is_read: boolean
          link: string | null
          message: string
          send_email: boolean
          target_type: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_sent?: boolean
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          send_email?: boolean
          target_type: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_sent?: boolean
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          send_email?: boolean
          target_type?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_responses: {
        Row: {
          data: Json
          id: string
          step_slug: string
          updated_at: string | null
          user_service_id: string
        }
        Insert: {
          data?: Json
          id?: string
          step_slug: string
          updated_at?: string | null
          user_service_id: string
        }
        Update: {
          data?: Json
          id?: string
          step_slug?: string
          updated_at?: string | null
          user_service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_user_service_id_fkey"
            columns: ["user_service_id"]
            isOneToOne: false
            referencedRelation: "user_services"
            referencedColumns: ["id"]
          },
        ]
      }
      process_logs: {
        Row: {
          action_type: string
          actor_id: string | null
          actor_name: string
          created_at: string
          id: string
          metadata: Json | null
          new_status: string | null
          note: string | null
          previous_status: string | null
          user_service_id: string
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          note?: string | null
          previous_status?: string | null
          user_service_id: string
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          note?: string | null
          previous_status?: string | null
          user_service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_logs_user_service_id_fkey"
            columns: ["user_service_id"]
            isOneToOne: false
            referencedRelation: "user_services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_services: {
        Row: {
          application_id: string | null
          consular_login: string | null
          consular_password: string | null
          consulate_interview_date: string | null
          consulate_interview_time: string | null
          created_at: string | null
          current_step: number | null
          date_of_birth: string | null
          grandmother_name: string | null
          id: string
          interview_date: string | null
          interview_location_casv: string | null
          interview_location_consulate: string | null
          interview_time: string | null
          is_second_attempt: boolean | null
          same_location: boolean | null
          service_slug: string
          specialist_review_data: Json | null
          specialist_training_data: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          consular_login?: string | null
          consular_password?: string | null
          consulate_interview_date?: string | null
          consulate_interview_time?: string | null
          created_at?: string | null
          current_step?: number | null
          date_of_birth?: string | null
          grandmother_name?: string | null
          id?: string
          interview_date?: string | null
          interview_location_casv?: string | null
          interview_location_consulate?: string | null
          interview_time?: string | null
          is_second_attempt?: boolean | null
          same_location?: boolean | null
          service_slug: string
          specialist_review_data?: Json | null
          specialist_training_data?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          consular_login?: string | null
          consular_password?: string | null
          consulate_interview_date?: string | null
          consulate_interview_time?: string | null
          created_at?: string | null
          current_step?: number | null
          date_of_birth?: string | null
          grandmother_name?: string | null
          id?: string
          interview_date?: string | null
          interview_location_casv?: string | null
          interview_location_consulate?: string | null
          interview_time?: string | null
          is_second_attempt?: boolean | null
          same_location?: boolean | null
          service_slug?: string
          specialist_review_data?: Json | null
          specialist_training_data?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_orders: {
        Row: {
          client_email: string
          client_ip: string | null
          client_name: string
          contract_pdf_url: string | null
          contract_selfie_url: string | null
          created_at: string | null
          exchange_rate: number | null
          id: string
          is_test: boolean | null
          order_number: string | null
          parcelow_order_id: string | null
          payment_metadata: Json | null
          payment_method: string
          payment_status: string
          product_slug: string
          stripe_session_id: string | null
          terms_accepted_at: string | null
          total_price_brl: number | null
          total_price_usd: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_email: string
          client_ip?: string | null
          client_name: string
          contract_pdf_url?: string | null
          contract_selfie_url?: string | null
          created_at?: string | null
          exchange_rate?: number | null
          id?: string
          is_test?: boolean | null
          order_number?: string | null
          parcelow_order_id?: string | null
          payment_metadata?: Json | null
          payment_method: string
          payment_status?: string
          product_slug: string
          stripe_session_id?: string | null
          terms_accepted_at?: string | null
          total_price_brl?: number | null
          total_price_usd: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_email?: string
          client_ip?: string | null
          client_name?: string
          contract_pdf_url?: string | null
          contract_selfie_url?: string | null
          created_at?: string | null
          exchange_rate?: number | null
          id?: string
          is_test?: boolean | null
          order_number?: string | null
          parcelow_order_id?: string | null
          payment_metadata?: Json | null
          payment_method?: string
          payment_status?: string
          product_slug?: string
          stripe_session_id?: string | null
          terms_accepted_at?: string | null
          total_price_brl?: number | null
          total_price_usd?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visa_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zelle_payments: {
        Row: {
          admin_approved_at: string | null
          admin_notes: string | null
          amount: number
          confirmation_code: string | null
          created_at: string | null
          fee_type_global: string | null
          guest_email: string | null
          guest_name: string | null
          id: string
          image_url: string | null
          n8n_confidence: number | null
          n8n_response: string | null
          payment_date: string | null
          payment_method: string | null
          processed_by_user_id: string | null
          proof_path: string | null
          recipient_email: string | null
          recipient_name: string | null
          service_slug: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          visa_order_id: string | null
        }
        Insert: {
          admin_approved_at?: string | null
          admin_notes?: string | null
          amount: number
          confirmation_code?: string | null
          created_at?: string | null
          fee_type_global?: string | null
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          image_url?: string | null
          n8n_confidence?: number | null
          n8n_response?: string | null
          payment_date?: string | null
          payment_method?: string | null
          processed_by_user_id?: string | null
          proof_path?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          service_slug?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          visa_order_id?: string | null
        }
        Update: {
          admin_approved_at?: string | null
          admin_notes?: string | null
          amount?: number
          confirmation_code?: string | null
          created_at?: string | null
          fee_type_global?: string | null
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          image_url?: string | null
          n8n_confidence?: number | null
          n8n_response?: string | null
          payment_date?: string | null
          payment_method?: string | null
          processed_by_user_id?: string | null
          proof_path?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          service_slug?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          visa_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zelle_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zelle_payments_visa_order_id_fkey"
            columns: ["visa_order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
