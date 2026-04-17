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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cos_recovery_cases: {
        Row: {
          admin_analysis: string | null
          admin_final_message: string | null
          admin_notes: string | null
          created_at: string | null
          document_urls: string[] | null
          explanation: string | null
          final_document_urls: string[] | null
          id: string
          last_payment_id: string | null
          proposal_sent_at: string | null
          proposal_value_usd: number | null
          recovery_type: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          user_service_id: string
        }
        Insert: {
          admin_analysis?: string | null
          admin_final_message?: string | null
          admin_notes?: string | null
          created_at?: string | null
          document_urls?: string[] | null
          explanation?: string | null
          final_document_urls?: string[] | null
          id?: string
          last_payment_id?: string | null
          proposal_sent_at?: string | null
          proposal_value_usd?: number | null
          recovery_type?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          user_service_id: string
        }
        Update: {
          admin_analysis?: string | null
          admin_final_message?: string | null
          admin_notes?: string | null
          created_at?: string | null
          document_urls?: string[] | null
          explanation?: string | null
          final_document_urls?: string[] | null
          id?: string
          last_payment_id?: string | null
          proposal_sent_at?: string | null
          proposal_value_usd?: number | null
          recovery_type?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          user_service_id?: string
        }
        Relationships: []
      }
      discount_coupons: {
        Row: {
          applicable_slugs: string[] | null
          code: string
          created_at: string
          created_by: string | null
          discount_type: string
          discount_value: number
          expires_at: string
          id: string
          is_active: boolean
          max_uses: number | null
          min_purchase_usd: number | null
          uses_count: number
        }
        Insert: {
          applicable_slugs?: string[] | null
          code: string
          created_at?: string
          created_by?: string | null
          discount_type: string
          discount_value: number
          expires_at: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase_usd?: number | null
          uses_count?: number
        }
        Update: {
          applicable_slugs?: string[] | null
          code?: string
          created_at?: string
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase_usd?: number | null
          uses_count?: number
        }
        Relationships: []
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
          target_role: string
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
          target_role: string
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
          target_role?: string
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
      process_logs: {
        Row: {
          action: string | null
          action_type: string | null
          actor_email: string | null
          actor_id: string | null
          actor_name: string | null
          actor_role: string | null
          changed_by: string | null
          changes: Json | null
          comments: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          details: Json | null
          id: string
          ip_address: string | null
          message: string | null
          metadata: Json | null
          new_data: Json | null
          new_status: string | null
          new_step: number | null
          old_data: Json | null
          old_status: string | null
          old_step: number | null
          previous_status: string | null
          previous_step: number | null
          service_id: string | null
          updated_at: string | null
          user_id: string | null
          user_service_id: string | null
        }
        Insert: {
          action?: string | null
          action_type?: string | null
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: string | null
          changed_by?: string | null
          changes?: Json | null
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          message?: string | null
          metadata?: Json | null
          new_data?: Json | null
          new_status?: string | null
          new_step?: number | null
          old_data?: Json | null
          old_status?: string | null
          old_step?: number | null
          previous_status?: string | null
          previous_step?: number | null
          service_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_service_id?: string | null
        }
        Update: {
          action?: string | null
          action_type?: string | null
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: string | null
          changed_by?: string | null
          changes?: Json | null
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          message?: string | null
          metadata?: Json | null
          new_data?: Json | null
          new_status?: string | null
          new_step?: number | null
          old_data?: Json | null
          old_status?: string | null
          old_step?: number | null
          previous_status?: string | null
          previous_step?: number | null
          service_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_service_id?: string | null
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
      services_prices: {
        Row: {
          currency: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          service_id: string
        }
        Insert: {
          currency?: string | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          service_id: string
        }
        Update: {
          currency?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          service_id?: string
        }
        Relationships: []
      }
      user_accounts: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          passport_photo_url: string | null
          phone_number: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          passport_photo_url?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          passport_photo_url?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_services: {
        Row: {
          admin_notes: string | null
          admin_review_data: Json | null
          application_id: string | null
          consular_login: string | null
          consular_password: string | null
          consulate_interview_date: string | null
          consulate_interview_time: string | null
          created_at: string | null
          current_step: number | null
          data: Json | null
          date_of_birth: string | null
          grandmother_name: string | null
          id: string
          interview_date: string | null
          interview_location_casv: string | null
          interview_location_consulate: string | null
          interview_time: string | null
          is_second_attempt: boolean | null
          same_location: boolean | null
          service_metadata: Json | null
          service_slug: string
          specialist_review_data: Json | null
          specialist_training_data: Json | null
          status: string | null
          step_data: Json | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          admin_review_data?: Json | null
          application_id?: string | null
          consular_login?: string | null
          consular_password?: string | null
          consulate_interview_date?: string | null
          consulate_interview_time?: string | null
          created_at?: string | null
          current_step?: number | null
          data?: Json | null
          date_of_birth?: string | null
          grandmother_name?: string | null
          id?: string
          interview_date?: string | null
          interview_location_casv?: string | null
          interview_location_consulate?: string | null
          interview_time?: string | null
          is_second_attempt?: boolean | null
          same_location?: boolean | null
          service_metadata?: Json | null
          service_slug: string
          specialist_review_data?: Json | null
          specialist_training_data?: Json | null
          status?: string | null
          step_data?: Json | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          admin_review_data?: Json | null
          application_id?: string | null
          consular_login?: string | null
          consular_password?: string | null
          consulate_interview_date?: string | null
          consulate_interview_time?: string | null
          created_at?: string | null
          current_step?: number | null
          data?: Json | null
          date_of_birth?: string | null
          grandmother_name?: string | null
          id?: string
          interview_date?: string | null
          interview_location_casv?: string | null
          interview_location_consulate?: string | null
          interview_time?: string | null
          is_second_attempt?: boolean | null
          same_location?: boolean | null
          service_metadata?: Json | null
          service_slug?: string
          specialist_review_data?: Json | null
          specialist_training_data?: Json | null
          status?: string | null
          step_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_services_account_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_accounts"
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
          coupon_code: string | null
          created_at: string | null
          discount_amount: number | null
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
          coupon_code?: string | null
          created_at?: string | null
          discount_amount?: number | null
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
          coupon_code?: string | null
          created_at?: string | null
          discount_amount?: number | null
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
            referencedRelation: "user_accounts"
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
          coupon_code: string | null
          created_at: string | null
          discount_amount: number | null
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
          coupon_code?: string | null
          created_at?: string | null
          discount_amount?: number | null
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
          coupon_code?: string | null
          created_at?: string | null
          discount_amount?: number | null
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
            referencedRelation: "user_accounts"
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
      validate_coupon: {
        Args: { p_code: string; p_slug?: string }
        Returns: Json
      }
    }
    Enums: {
      process_service_status:
        | "pending"
        | "paid"
        | "in_progress"
        | "delivered"
        | "approved"
        | "denied"
      process_service_type: "MAIN" | "RFE" | "MOTION"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      process_service_status: [
        "pending",
        "paid",
        "in_progress",
        "delivered",
        "approved",
        "denied",
      ],
      process_service_type: ["MAIN", "RFE", "MOTION"],
    },
  },
} as const
