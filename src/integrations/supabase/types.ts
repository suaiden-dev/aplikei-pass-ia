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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      application_terms: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          term_type: string
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          term_type: string
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          term_type?: string
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      billing_installments: {
        Row: {
          amount: number
          checkout_token: string | null
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          notified_at: string | null
          payment_id: string | null
          schedule_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          checkout_token?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          notified_at?: string | null
          payment_id?: string | null
          schedule_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          checkout_token?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          notified_at?: string | null
          payment_id?: string | null
          schedule_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_installments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_installments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "recurring_billing_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      book_a_call_submissions: {
        Row: {
          challenges: string | null
          company_name: string
          confirmation_accepted: boolean
          contact_name: string
          country: string
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          lead_volume: string
          phone: string
          type_of_business: string
          website: string | null
        }
        Insert: {
          challenges?: string | null
          company_name: string
          confirmation_accepted?: boolean
          contact_name: string
          country: string
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          lead_volume: string
          phone: string
          type_of_business: string
          website?: string | null
        }
        Update: {
          challenges?: string | null
          company_name?: string
          confirmation_accepted?: boolean
          contact_name?: string
          country?: string
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          lead_volume?: string
          phone?: string
          type_of_business?: string
          website?: string | null
        }
        Relationships: []
      }
      checkout_prefill_tokens: {
        Row: {
          client_data: Json
          created_at: string | null
          expires_at: string
          id: string
          product_slug: string
          seller_id: string | null
          token: string
          used_at: string | null
        }
        Insert: {
          client_data: Json
          created_at?: string | null
          expires_at: string
          id?: string
          product_slug: string
          seller_id?: string | null
          token: string
          used_at?: string | null
        }
        Update: {
          client_data?: Json
          created_at?: string | null
          expires_at?: string
          id?: string
          product_slug?: string
          seller_id?: string | null
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      client_financial_processes: {
        Row: {
          client_id: string
          completed_steps: number
          created_at: string | null
          id: string
          process_type: string
          status: string
          total_steps: number
          updated_at: string | null
        }
        Insert: {
          client_id: string
          completed_steps?: number
          created_at?: string | null
          id?: string
          process_type: string
          status?: string
          total_steps: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          completed_steps?: number
          created_at?: string | null
          id?: string
          process_type?: string
          status?: string
          total_steps?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_financial_processes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          document_number: string | null
          document_type: string | null
          email: string
          full_name: string
          id: string
          marital_status: string | null
          nationality: string | null
          phone: string
          postal_code: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          document_number?: string | null
          document_type?: string | null
          email: string
          full_name: string
          id?: string
          marital_status?: string | null
          nationality?: string | null
          phone: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address_line?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string
          full_name?: string
          id?: string
          marital_status?: string | null
          nationality?: string | null
          phone?: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comprehensive_term_acceptance: {
        Row: {
          accepted_at: string
          id: string
          ip_address: string | null
          term_id: string
          term_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          term_id: string
          term_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          term_id?: string
          term_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comprehensive_term_acceptance_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "active_terms_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comprehensive_term_acceptance_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "application_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_message_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_id: string
          read_by_admin: boolean | null
          read_by_user: boolean | null
          sender_email: string
          sender_name: string
          sender_type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_id: string
          read_by_admin?: boolean | null
          read_by_user?: boolean | null
          sender_email: string
          sender_name: string
          sender_type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_id?: string
          read_by_admin?: boolean | null
          read_by_user?: boolean | null
          sender_email?: string
          sender_name?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_message_replies_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "contact_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          access_token: string | null
          assigned_to: string | null
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          last_reply_at: string | null
          message: string
          name: string
          priority: string | null
          status: string | null
          subject: string
          tags: string[] | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          access_token?: string | null
          assigned_to?: string | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          last_reply_at?: string | null
          message: string
          name: string
          priority?: string | null
          status?: string | null
          subject: string
          tags?: string[] | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          access_token?: string | null
          assigned_to?: string | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          last_reply_at?: string | null
          message?: string
          name?: string
          priority?: string | null
          status?: string | null
          subject?: string
          tags?: string[] | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      contract_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          product_slug: string | null
          template_type:
            | Database["public"]["Enums"]["contract_template_type"]
            | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          product_slug?: string | null
          template_type?:
            | Database["public"]["Enums"]["contract_template_type"]
            | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          product_slug?: string | null
          template_type?:
            | Database["public"]["Enums"]["contract_template_type"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      eb3_email_logs: {
        Row: {
          client_id: string
          created_at: string | null
          email_type: string
          id: string
          metadata: Json | null
          recipient_email: string
          schedule_id: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          email_type: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          schedule_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          email_type?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          schedule_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eb3_email_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eb3_email_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "eb3_recurrence_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      eb3_recurrence_control: {
        Row: {
          activation_date: string
          activation_order_id: string
          client_id: string
          created_at: string | null
          id: string
          installments_paid: number | null
          manual_activation: boolean | null
          notes: string | null
          program_status: string | null
          recurrence_start_date: string
          seller_commission_percent: number | null
          seller_id: string | null
          total_installments: number | null
          updated_at: string | null
        }
        Insert: {
          activation_date: string
          activation_order_id: string
          client_id: string
          created_at?: string | null
          id?: string
          installments_paid?: number | null
          manual_activation?: boolean | null
          notes?: string | null
          program_status?: string | null
          recurrence_start_date: string
          seller_commission_percent?: number | null
          seller_id?: string | null
          total_installments?: number | null
          updated_at?: string | null
        }
        Update: {
          activation_date?: string
          activation_order_id?: string
          client_id?: string
          created_at?: string | null
          id?: string
          installments_paid?: number | null
          manual_activation?: boolean | null
          notes?: string | null
          program_status?: string | null
          recurrence_start_date?: string
          seller_commission_percent?: number | null
          seller_id?: string | null
          total_installments?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eb3_recurrence_control_activation_order_id_fkey"
            columns: ["activation_order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eb3_recurrence_control_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eb3_recurrence_control_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      eb3_recurrence_schedules: {
        Row: {
          amount_usd: number | null
          annex_pdf_url: string | null
          client_id: string
          created_at: string | null
          due_date: string
          email_reminder_count: number | null
          email_sent_at: string | null
          id: string
          installment_number: number
          invoice_pdf_url: string | null
          late_fee_usd: number | null
          order_id: string
          paid_at: string | null
          payment_id: string | null
          seller_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_usd?: number | null
          annex_pdf_url?: string | null
          client_id: string
          created_at?: string | null
          due_date: string
          email_reminder_count?: number | null
          email_sent_at?: string | null
          id?: string
          installment_number: number
          invoice_pdf_url?: string | null
          late_fee_usd?: number | null
          order_id: string
          paid_at?: string | null
          payment_id?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_usd?: number | null
          annex_pdf_url?: string | null
          client_id?: string
          created_at?: string | null
          due_date?: string
          email_reminder_count?: number | null
          email_sent_at?: string | null
          id?: string
          installment_number?: number
          invoice_pdf_url?: string | null
          late_fee_usd?: number | null
          order_id?: string
          paid_at?: string | null
          payment_id?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eb3_recurrence_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eb3_recurrence_schedules_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eb3_recurrence_schedules_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eb3_recurrence_schedules_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      financial_process_steps: {
        Row: {
          amount_per_dependent: number | null
          base_amount: number
          created_at: string | null
          id: string
          order_id: string | null
          payment_metadata: Json | null
          process_id: string
          product_slug: string
          status: string
          step_name: string
          step_number: number
          updated_at: string | null
        }
        Insert: {
          amount_per_dependent?: number | null
          base_amount: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_metadata?: Json | null
          process_id: string
          product_slug: string
          status?: string
          step_name: string
          step_number: number
          updated_at?: string | null
        }
        Update: {
          amount_per_dependent?: number | null
          base_amount?: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_metadata?: Json | null
          process_id?: string
          product_slug?: string
          status?: string
          step_name?: string
          step_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_process_steps_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_process_steps_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "client_financial_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      global_partner_applications: {
        Row: {
          area_of_expertise: string[]
          business_id: string | null
          business_name: string | null
          city: string | null
          client_experience: string
          client_experience_description: string | null
          comfortable_model: boolean
          country: string
          created_at: string | null
          current_occupation: string | null
          cv_file_name: string | null
          cv_file_path: string | null
          email: string
          english_level: string
          full_name: string
          has_business_registration: string
          id: string
          info_accurate: boolean
          interested_roles: string[] | null
          ip_address: unknown
          linkedin_url: string | null
          marketing_consent: boolean | null
          meeting_date: string | null
          meeting_link: string | null
          meeting_scheduled_at: string | null
          meeting_scheduled_by: string | null
          meeting_time: string | null
          other_links: string | null
          phone: string
          registration_type: string | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          visa_experience: string | null
          weekly_availability: string
          why_migma: string
          years_of_experience: string
        }
        Insert: {
          area_of_expertise: string[]
          business_id?: string | null
          business_name?: string | null
          city?: string | null
          client_experience: string
          client_experience_description?: string | null
          comfortable_model?: boolean
          country: string
          created_at?: string | null
          current_occupation?: string | null
          cv_file_name?: string | null
          cv_file_path?: string | null
          email: string
          english_level: string
          full_name: string
          has_business_registration: string
          id?: string
          info_accurate?: boolean
          interested_roles?: string[] | null
          ip_address?: unknown
          linkedin_url?: string | null
          marketing_consent?: boolean | null
          meeting_date?: string | null
          meeting_link?: string | null
          meeting_scheduled_at?: string | null
          meeting_scheduled_by?: string | null
          meeting_time?: string | null
          other_links?: string | null
          phone: string
          registration_type?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          visa_experience?: string | null
          weekly_availability: string
          why_migma: string
          years_of_experience: string
        }
        Update: {
          area_of_expertise?: string[]
          business_id?: string | null
          business_name?: string | null
          city?: string | null
          client_experience?: string
          client_experience_description?: string | null
          comfortable_model?: boolean
          country?: string
          created_at?: string | null
          current_occupation?: string | null
          cv_file_name?: string | null
          cv_file_path?: string | null
          email?: string
          english_level?: string
          full_name?: string
          has_business_registration?: string
          id?: string
          info_accurate?: boolean
          interested_roles?: string[] | null
          ip_address?: unknown
          linkedin_url?: string | null
          marketing_consent?: boolean | null
          meeting_date?: string | null
          meeting_link?: string | null
          meeting_scheduled_at?: string | null
          meeting_scheduled_by?: string | null
          meeting_time?: string | null
          other_links?: string | null
          phone?: string
          registration_type?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          visa_experience?: string | null
          weekly_availability?: string
          why_migma?: string
          years_of_experience?: string
        }
        Relationships: []
      }
      identity_files: {
        Row: {
          created_at: string | null
          created_ip: string | null
          file_name: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          service_request_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          created_ip?: string | null
          file_name?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          service_request_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          created_ip?: string | null
          file_name?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          service_request_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_files_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      loads: {
        Row: {
          commission_percentage: number
          commission_value: number | null
          created_at: string | null
          destination: string
          end_date: string | null
          id: string
          origin: string
          start_date: string
          total_value: number
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          commission_percentage?: number
          commission_value?: number | null
          created_at?: string | null
          destination: string
          end_date?: string | null
          id?: string
          origin: string
          start_date: string
          total_value?: number
          updated_at?: string | null
          user_id: string
          year?: number
        }
        Update: {
          commission_percentage?: number
          commission_value?: number | null
          created_at?: string | null
          destination?: string
          end_date?: string | null
          id?: string
          origin?: string
          start_date?: string
          total_value?: number
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      meetings: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          id: string
          meeting_date: string
          meeting_link: string | null
          meeting_time: string
          notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          meeting_date: string
          meeting_link?: string | null
          meeting_time: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          meeting_date?: string
          meeting_link?: string | null
          meeting_time?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      migma_payments: {
        Row: {
          admin_notes: string | null
          amount: number | null
          confirmation_code: string | null
          fee_type_global: string
          id: string
          image_url: string | null
          processed_by_user_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount?: number | null
          confirmation_code?: string | null
          fee_type_global: string
          id?: string
          image_url?: string | null
          processed_by_user_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number | null
          confirmation_code?: string | null
          fee_type_global?: string
          id?: string
          image_url?: string | null
          processed_by_user_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partner_contract_view_tokens: {
        Row: {
          acceptance_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          token: string
        }
        Insert: {
          acceptance_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          token: string
        }
        Update: {
          acceptance_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_contract_view_tokens_acceptance_id_fkey"
            columns: ["acceptance_id"]
            isOneToOne: false
            referencedRelation: "partner_terms_acceptances"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_terms_acceptances: {
        Row: {
          accepted_at: string | null
          address_city: string | null
          address_country: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          admin_email_sent: boolean | null
          admin_email_sent_at: string | null
          application_id: string | null
          business_type: string | null
          company_legal_name: string | null
          contract_hash: string | null
          contract_pdf_path: string | null
          contract_pdf_url: string | null
          contract_template_id: string | null
          contract_version: string | null
          country_of_residence: string | null
          created_at: string | null
          date_of_birth: string | null
          document_back_url: string | null
          document_front_url: string | null
          email: string | null
          expires_at: string
          full_legal_name: string | null
          geolocation_city: string | null
          geolocation_country: string | null
          id: string
          identity_photo_name: string | null
          identity_photo_path: string | null
          ip_address: unknown
          nationality: string | null
          payout_details: string | null
          phone_whatsapp: string | null
          preferred_payout_method: string | null
          signature_image_url: string | null
          signature_name: string | null
          tax_id_number: string | null
          tax_id_type: string | null
          token: string
          user_agent: string | null
          verification_rejection_reason: string | null
          verification_reviewed_at: string | null
          verification_reviewed_by: string | null
          verification_status: string | null
        }
        Insert: {
          accepted_at?: string | null
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          admin_email_sent?: boolean | null
          admin_email_sent_at?: string | null
          application_id?: string | null
          business_type?: string | null
          company_legal_name?: string | null
          contract_hash?: string | null
          contract_pdf_path?: string | null
          contract_pdf_url?: string | null
          contract_template_id?: string | null
          contract_version?: string | null
          country_of_residence?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          email?: string | null
          expires_at: string
          full_legal_name?: string | null
          geolocation_city?: string | null
          geolocation_country?: string | null
          id?: string
          identity_photo_name?: string | null
          identity_photo_path?: string | null
          ip_address?: unknown
          nationality?: string | null
          payout_details?: string | null
          phone_whatsapp?: string | null
          preferred_payout_method?: string | null
          signature_image_url?: string | null
          signature_name?: string | null
          tax_id_number?: string | null
          tax_id_type?: string | null
          token: string
          user_agent?: string | null
          verification_rejection_reason?: string | null
          verification_reviewed_at?: string | null
          verification_reviewed_by?: string | null
          verification_status?: string | null
        }
        Update: {
          accepted_at?: string | null
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          admin_email_sent?: boolean | null
          admin_email_sent_at?: string | null
          application_id?: string | null
          business_type?: string | null
          company_legal_name?: string | null
          contract_hash?: string | null
          contract_pdf_path?: string | null
          contract_pdf_url?: string | null
          contract_template_id?: string | null
          contract_version?: string | null
          country_of_residence?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          email?: string | null
          expires_at?: string
          full_legal_name?: string | null
          geolocation_city?: string | null
          geolocation_country?: string | null
          id?: string
          identity_photo_name?: string | null
          identity_photo_path?: string | null
          ip_address?: unknown
          nationality?: string | null
          payout_details?: string | null
          phone_whatsapp?: string | null
          preferred_payout_method?: string | null
          signature_image_url?: string | null
          signature_name?: string | null
          tax_id_number?: string | null
          tax_id_type?: string | null
          token?: string
          user_agent?: string | null
          verification_rejection_reason?: string | null
          verification_reviewed_at?: string | null
          verification_reviewed_by?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_terms_acceptances_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "global_partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_terms_acceptances_contract_template_id_fkey"
            columns: ["contract_template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          external_payment_id: string | null
          id: string
          raw_webhook_log: Json | null
          service_request_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          external_payment_id?: string | null
          id?: string
          raw_webhook_log?: Json | null
          service_request_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          external_payment_id?: string | null
          id?: string
          raw_webhook_log?: Json | null
          service_request_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_coupons: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          valid_from: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      recurring_billing_schedules: {
        Row: {
          amount_per_installment: number
          created_at: string | null
          currency: string
          id: string
          installments_paid: number
          metadata: Json | null
          next_billing_date: string | null
          order_id: string | null
          product_slug: string
          status: string
          total_installments: number
          updated_at: string | null
        }
        Insert: {
          amount_per_installment: number
          created_at?: string | null
          currency?: string
          id?: string
          installments_paid?: number
          metadata?: Json | null
          next_billing_date?: string | null
          order_id?: string | null
          product_slug: string
          status?: string
          total_installments: number
          updated_at?: string | null
        }
        Update: {
          amount_per_installment?: number
          created_at?: string | null
          currency?: string
          id?: string
          installments_paid?: number
          metadata?: Json | null
          next_billing_date?: string | null
          order_id?: string | null
          product_slug?: string
          status?: string
          total_installments?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_billing_schedules_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_meetings: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          meeting_date: string
          meeting_link: string
          meeting_scheduled_at: string
          meeting_time: string
          notes: string | null
          scheduled_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          meeting_date: string
          meeting_link: string
          meeting_scheduled_at?: string
          meeting_time: string
          notes?: string | null
          scheduled_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          meeting_date?: string
          meeting_link?: string
          meeting_scheduled_at?: string
          meeting_time?: string
          notes?: string | null
          scheduled_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scholarship_email_logs: {
        Row: {
          client_id: string
          created_at: string | null
          email_type: string
          id: string
          metadata: Json | null
          recipient_email: string
          schedule_id: string | null
          status: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          email_type: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          schedule_id?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          email_type?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          schedule_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_email_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_email_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "scholarship_recurrence_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_recurrence_control: {
        Row: {
          activation_date: string | null
          activation_order_id: string | null
          client_id: string
          created_at: string | null
          id: string
          installments_paid: number | null
          manual_activation: boolean | null
          notes: string | null
          program_status: string | null
          recurrence_start_date: string
          seller_commission_percent: number | null
          seller_id: string | null
          updated_at: string | null
        }
        Insert: {
          activation_date?: string | null
          activation_order_id?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          installments_paid?: number | null
          manual_activation?: boolean | null
          notes?: string | null
          program_status?: string | null
          recurrence_start_date: string
          seller_commission_percent?: number | null
          seller_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activation_date?: string | null
          activation_order_id?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          installments_paid?: number | null
          manual_activation?: boolean | null
          notes?: string | null
          program_status?: string | null
          recurrence_start_date?: string
          seller_commission_percent?: number | null
          seller_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_recurrence_control_activation_order_id_fkey"
            columns: ["activation_order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_recurrence_control_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_recurrence_schedules: {
        Row: {
          amount_usd: number
          client_id: string
          control_id: string
          created_at: string | null
          due_date: string
          email_reminder_count: number | null
          email_sent_at: string | null
          id: string
          installment_number: number
          late_fee_usd: number | null
          order_id: string | null
          paid_at: string | null
          payment_id: string | null
          seller_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_usd?: number
          client_id: string
          control_id: string
          created_at?: string | null
          due_date: string
          email_reminder_count?: number | null
          email_sent_at?: string | null
          id?: string
          installment_number: number
          late_fee_usd?: number | null
          order_id?: string | null
          paid_at?: string | null
          payment_id?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_usd?: number
          client_id?: string
          control_id?: string
          created_at?: string | null
          due_date?: string
          email_reminder_count?: number | null
          email_sent_at?: string | null
          id?: string
          installment_number?: number
          late_fee_usd?: number | null
          order_id?: string | null
          paid_at?: string | null
          payment_id?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_recurrence_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_recurrence_schedules_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "scholarship_recurrence_control"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_recurrence_schedules_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_recurrence_schedules_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_recurrence_schedules_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      seller_commissions: {
        Row: {
          available_for_withdrawal_at: string | null
          calculation_method: string
          commission_amount_usd: number
          commission_percentage: number
          created_at: string
          id: string
          net_amount_usd: number
          order_id: string
          original_available_for_withdrawal_at: string | null
          reserved_amount: number
          seller_id: string
          updated_at: string
          withdrawn_amount: number
        }
        Insert: {
          available_for_withdrawal_at?: string | null
          calculation_method?: string
          commission_amount_usd: number
          commission_percentage: number
          created_at?: string
          id?: string
          net_amount_usd: number
          order_id: string
          original_available_for_withdrawal_at?: string | null
          reserved_amount?: number
          seller_id: string
          updated_at?: string
          withdrawn_amount?: number
        }
        Update: {
          available_for_withdrawal_at?: string | null
          calculation_method?: string
          commission_amount_usd?: number
          commission_percentage?: number
          created_at?: string
          id?: string
          net_amount_usd?: number
          order_id?: string
          original_available_for_withdrawal_at?: string | null
          reserved_amount?: number
          seller_id?: string
          updated_at?: string
          withdrawn_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_seller_commissions_order_id"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_funnel_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          product_slug: string | null
          referer: string | null
          seller_id: string
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          product_slug?: string | null
          referer?: string | null
          seller_id: string
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          product_slug?: string | null
          referer?: string | null
          seller_id?: string
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      seller_payment_request_commissions: {
        Row: {
          commission_id: string
          created_at: string
          id: string
          payment_request_id: string
        }
        Insert: {
          commission_id: string
          created_at?: string
          id?: string
          payment_request_id: string
        }
        Update: {
          commission_id?: string
          created_at?: string
          id?: string
          payment_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_payment_request_commissions_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: true
            referencedRelation: "seller_commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_payment_request_commissions_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "seller_payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_payment_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          id: string
          paid_at: string | null
          payment_details: Json | null
          payment_method: string | null
          payment_proof_file_path: string | null
          payment_proof_url: string | null
          processed_by: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          request_month: string
          requested_at: string
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          payment_proof_file_path?: string | null
          payment_proof_url?: string | null
          processed_by?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          request_month: string
          requested_at?: string
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          payment_proof_file_path?: string | null
          payment_proof_url?: string | null
          processed_by?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          request_month?: string
          requested_at?: string
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_seller_payment_requests_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["seller_id_public"]
          },
        ]
      }
      sellers: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          seller_id_public: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          seller_id_public: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          seller_id_public?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          client_id: string | null
          created_at: string | null
          dependents_count: number | null
          id: string
          payment_method: string | null
          seller_id: string | null
          service_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          dependents_count?: number | null
          id?: string
          payment_method?: string | null
          seller_id?: string | null
          service_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          dependents_count?: number | null
          id?: string
          payment_method?: string | null
          seller_id?: string | null
          service_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      slack_activity_reports: {
        Row: {
          created_at: string | null
          date: string
          id: string
          report_data: Json
          total_events: number
          unique_users: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          report_data: Json
          total_events: number
          unique_users: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          report_data?: Json
          total_events?: number
          unique_users?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      slack_raw_events: {
        Row: {
          channel_id: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          slack_timestamp: string | null
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          slack_timestamp?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          slack_timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      split_payments: {
        Row: {
          created_at: string
          id: string
          order_id: string
          overall_status: string | null
          part1_amount_usd: number
          part1_completed_at: string | null
          part1_parcelow_checkout_url: string | null
          part1_parcelow_order_id: string | null
          part1_parcelow_status: string | null
          part1_payment_metadata: Json | null
          part1_payment_method: string
          part1_payment_status: string | null
          part2_amount_usd: number
          part2_completed_at: string | null
          part2_parcelow_checkout_url: string | null
          part2_parcelow_order_id: string | null
          part2_parcelow_status: string | null
          part2_payment_metadata: Json | null
          part2_payment_method: string
          part2_payment_status: string | null
          split_count: number
          total_amount_usd: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          overall_status?: string | null
          part1_amount_usd: number
          part1_completed_at?: string | null
          part1_parcelow_checkout_url?: string | null
          part1_parcelow_order_id?: string | null
          part1_parcelow_status?: string | null
          part1_payment_metadata?: Json | null
          part1_payment_method: string
          part1_payment_status?: string | null
          part2_amount_usd: number
          part2_completed_at?: string | null
          part2_parcelow_checkout_url?: string | null
          part2_parcelow_order_id?: string | null
          part2_parcelow_status?: string | null
          part2_payment_metadata?: Json | null
          part2_payment_method: string
          part2_payment_status?: string | null
          split_count?: number
          total_amount_usd: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          overall_status?: string | null
          part1_amount_usd?: number
          part1_completed_at?: string | null
          part1_parcelow_checkout_url?: string | null
          part1_parcelow_order_id?: string | null
          part1_parcelow_status?: string | null
          part1_payment_metadata?: Json | null
          part1_payment_method?: string
          part1_payment_status?: string | null
          part2_amount_usd?: number
          part2_completed_at?: string | null
          part2_parcelow_checkout_url?: string | null
          part2_parcelow_order_id?: string | null
          part2_parcelow_status?: string | null
          part2_payment_metadata?: Json | null
          part2_payment_method?: string
          part2_payment_status?: string | null
          split_count?: number
          total_amount_usd?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "split_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      terms_acceptance: {
        Row: {
          accepted: boolean | null
          accepted_at: string | null
          accepted_ip: string | null
          contract_template_id: string | null
          created_at: string | null
          data_authorization: boolean | null
          id: string
          service_request_id: string | null
          terms_version: string | null
          user_agent: string | null
        }
        Insert: {
          accepted?: boolean | null
          accepted_at?: string | null
          accepted_ip?: string | null
          contract_template_id?: string | null
          created_at?: string | null
          data_authorization?: boolean | null
          id?: string
          service_request_id?: string | null
          terms_version?: string | null
          user_agent?: string | null
        }
        Update: {
          accepted?: boolean | null
          accepted_at?: string | null
          accepted_ip?: string | null
          contract_template_id?: string | null
          created_at?: string | null
          data_authorization?: boolean | null
          id?: string
          service_request_id?: string | null
          terms_version?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terms_acceptance_contract_template_id_fkey"
            columns: ["contract_template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_acceptance_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_contract_resubmission_tokens: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          order_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          order_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          order_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visa_contract_resubmission_tokens_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_contract_view_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          order_id: string
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          order_id: string
          token: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "visa_contract_view_tokens_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_orders: {
        Row: {
          admin_email_sent: boolean | null
          admin_email_sent_at: string | null
          annex_approval_reviewed_at: string | null
          annex_approval_reviewed_by: string | null
          annex_approval_status: string | null
          annex_pdf_url: string | null
          annex_rejection_reason: string | null
          base_price_usd: number
          calculation_type: string | null
          client_country: string | null
          client_email: string
          client_name: string
          client_nationality: string | null
          client_observations: string | null
          client_whatsapp: string | null
          contract_accepted: boolean | null
          contract_approval_reviewed_at: string | null
          contract_approval_reviewed_by: string | null
          contract_approval_status: string | null
          contract_document_url: string | null
          contract_pdf_url: string | null
          contract_rejection_reason: string | null
          contract_selfie_url: string | null
          contract_signed_at: string | null
          contract_template_id: string | null
          coupon_code: string | null
          created_at: string | null
          dependent_names: string[] | null
          discount_amount: number | null
          extra_unit_label: string | null
          extra_unit_price_usd: number | null
          extra_units: number | null
          id: string
          ip_address: string | null
          is_hidden: boolean | null
          is_split_payment: boolean | null
          is_test: boolean | null
          number_of_dependents: number | null
          order_number: string
          parcelow_checkout_url: string | null
          parcelow_order_id: string | null
          parcelow_status: string | null
          parcelow_status_code: number | null
          payment_metadata: Json | null
          payment_method: string | null
          payment_status: string | null
          price_per_dependent_usd: number
          product_slug: string
          seller_id: string | null
          service_request_id: string | null
          signature_image_url: string | null
          split_payment_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          total_price_usd: number
          updated_at: string | null
          upsell_annex_approval_reviewed_at: string | null
          upsell_annex_approval_reviewed_by: string | null
          upsell_annex_approval_status: string | null
          upsell_annex_pdf_url: string | null
          upsell_annex_rejection_reason: string | null
          upsell_contract_approval_reviewed_at: string | null
          upsell_contract_approval_reviewed_by: string | null
          upsell_contract_approval_status: string | null
          upsell_contract_pdf_url: string | null
          upsell_contract_rejection_reason: string | null
          upsell_contract_template_id: string | null
          upsell_price_usd: number | null
          upsell_product_slug: string | null
          wise_payment_status: string | null
          wise_quote_uuid: string | null
          wise_recipient_id: string | null
          wise_transfer_id: string | null
          zelle_proof_uploaded_at: string | null
          zelle_proof_url: string | null
        }
        Insert: {
          admin_email_sent?: boolean | null
          admin_email_sent_at?: string | null
          annex_approval_reviewed_at?: string | null
          annex_approval_reviewed_by?: string | null
          annex_approval_status?: string | null
          annex_pdf_url?: string | null
          annex_rejection_reason?: string | null
          base_price_usd: number
          calculation_type?: string | null
          client_country?: string | null
          client_email: string
          client_name: string
          client_nationality?: string | null
          client_observations?: string | null
          client_whatsapp?: string | null
          contract_accepted?: boolean | null
          contract_approval_reviewed_at?: string | null
          contract_approval_reviewed_by?: string | null
          contract_approval_status?: string | null
          contract_document_url?: string | null
          contract_pdf_url?: string | null
          contract_rejection_reason?: string | null
          contract_selfie_url?: string | null
          contract_signed_at?: string | null
          contract_template_id?: string | null
          coupon_code?: string | null
          created_at?: string | null
          dependent_names?: string[] | null
          discount_amount?: number | null
          extra_unit_label?: string | null
          extra_unit_price_usd?: number | null
          extra_units?: number | null
          id?: string
          ip_address?: string | null
          is_hidden?: boolean | null
          is_split_payment?: boolean | null
          is_test?: boolean | null
          number_of_dependents?: number | null
          order_number: string
          parcelow_checkout_url?: string | null
          parcelow_order_id?: string | null
          parcelow_status?: string | null
          parcelow_status_code?: number | null
          payment_metadata?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          price_per_dependent_usd: number
          product_slug: string
          seller_id?: string | null
          service_request_id?: string | null
          signature_image_url?: string | null
          split_payment_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          total_price_usd: number
          updated_at?: string | null
          upsell_annex_approval_reviewed_at?: string | null
          upsell_annex_approval_reviewed_by?: string | null
          upsell_annex_approval_status?: string | null
          upsell_annex_pdf_url?: string | null
          upsell_annex_rejection_reason?: string | null
          upsell_contract_approval_reviewed_at?: string | null
          upsell_contract_approval_reviewed_by?: string | null
          upsell_contract_approval_status?: string | null
          upsell_contract_pdf_url?: string | null
          upsell_contract_rejection_reason?: string | null
          upsell_contract_template_id?: string | null
          upsell_price_usd?: number | null
          upsell_product_slug?: string | null
          wise_payment_status?: string | null
          wise_quote_uuid?: string | null
          wise_recipient_id?: string | null
          wise_transfer_id?: string | null
          zelle_proof_uploaded_at?: string | null
          zelle_proof_url?: string | null
        }
        Update: {
          admin_email_sent?: boolean | null
          admin_email_sent_at?: string | null
          annex_approval_reviewed_at?: string | null
          annex_approval_reviewed_by?: string | null
          annex_approval_status?: string | null
          annex_pdf_url?: string | null
          annex_rejection_reason?: string | null
          base_price_usd?: number
          calculation_type?: string | null
          client_country?: string | null
          client_email?: string
          client_name?: string
          client_nationality?: string | null
          client_observations?: string | null
          client_whatsapp?: string | null
          contract_accepted?: boolean | null
          contract_approval_reviewed_at?: string | null
          contract_approval_reviewed_by?: string | null
          contract_approval_status?: string | null
          contract_document_url?: string | null
          contract_pdf_url?: string | null
          contract_rejection_reason?: string | null
          contract_selfie_url?: string | null
          contract_signed_at?: string | null
          contract_template_id?: string | null
          coupon_code?: string | null
          created_at?: string | null
          dependent_names?: string[] | null
          discount_amount?: number | null
          extra_unit_label?: string | null
          extra_unit_price_usd?: number | null
          extra_units?: number | null
          id?: string
          ip_address?: string | null
          is_hidden?: boolean | null
          is_split_payment?: boolean | null
          is_test?: boolean | null
          number_of_dependents?: number | null
          order_number?: string
          parcelow_checkout_url?: string | null
          parcelow_order_id?: string | null
          parcelow_status?: string | null
          parcelow_status_code?: number | null
          payment_metadata?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          price_per_dependent_usd?: number
          product_slug?: string
          seller_id?: string | null
          service_request_id?: string | null
          signature_image_url?: string | null
          split_payment_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          total_price_usd?: number
          updated_at?: string | null
          upsell_annex_approval_reviewed_at?: string | null
          upsell_annex_approval_reviewed_by?: string | null
          upsell_annex_approval_status?: string | null
          upsell_annex_pdf_url?: string | null
          upsell_annex_rejection_reason?: string | null
          upsell_contract_approval_reviewed_at?: string | null
          upsell_contract_approval_reviewed_by?: string | null
          upsell_contract_approval_status?: string | null
          upsell_contract_pdf_url?: string | null
          upsell_contract_rejection_reason?: string | null
          upsell_contract_template_id?: string | null
          upsell_price_usd?: number | null
          upsell_product_slug?: string | null
          wise_payment_status?: string | null
          wise_quote_uuid?: string | null
          wise_recipient_id?: string | null
          wise_transfer_id?: string | null
          zelle_proof_uploaded_at?: string | null
          zelle_proof_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visa_orders_contract_template_id_fkey"
            columns: ["contract_template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_orders_product_slug_fkey"
            columns: ["product_slug"]
            isOneToOne: false
            referencedRelation: "visa_products"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "visa_orders_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_orders_split_payment_id_fkey"
            columns: ["split_payment_id"]
            isOneToOne: false
            referencedRelation: "split_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_orders_split_payment_id_fkey"
            columns: ["split_payment_id"]
            isOneToOne: false
            referencedRelation: "split_payments_with_order_details"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_products: {
        Row: {
          allow_extra_units: boolean | null
          base_price_usd: number
          calculation_type: string | null
          created_at: string | null
          description: string | null
          extra_unit_label: string | null
          extra_unit_price: number | null
          id: string
          is_active: boolean | null
          name: string
          price_per_dependent_usd: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          allow_extra_units?: boolean | null
          base_price_usd: number
          calculation_type?: string | null
          created_at?: string | null
          description?: string | null
          extra_unit_label?: string | null
          extra_unit_price?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price_per_dependent_usd?: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          allow_extra_units?: boolean | null
          base_price_usd?: number
          calculation_type?: string | null
          created_at?: string | null
          description?: string | null
          extra_unit_label?: string | null
          extra_unit_price?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_per_dependent_usd?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      wise_transfers: {
        Row: {
          created_at: string
          exchange_rate: number | null
          fee_amount: number | null
          id: string
          source_amount: number
          source_currency: string
          status: string
          status_details: Json | null
          target_amount: number | null
          target_currency: string
          updated_at: string
          visa_order_id: string | null
          wise_quote_uuid: string | null
          wise_recipient_id: string | null
          wise_transfer_id: string
        }
        Insert: {
          created_at?: string
          exchange_rate?: number | null
          fee_amount?: number | null
          id?: string
          source_amount: number
          source_currency?: string
          status?: string
          status_details?: Json | null
          target_amount?: number | null
          target_currency: string
          updated_at?: string
          visa_order_id?: string | null
          wise_quote_uuid?: string | null
          wise_recipient_id?: string | null
          wise_transfer_id: string
        }
        Update: {
          created_at?: string
          exchange_rate?: number | null
          fee_amount?: number | null
          id?: string
          source_amount?: number
          source_currency?: string
          status?: string
          status_details?: Json | null
          target_amount?: number | null
          target_currency?: string
          updated_at?: string
          visa_order_id?: string | null
          wise_quote_uuid?: string | null
          wise_recipient_id?: string | null
          wise_transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wise_transfers_visa_order_id_fkey"
            columns: ["visa_order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      zelle_payments: {
        Row: {
          admin_approved_at: string | null
          admin_notes: string | null
          amount: number
          created_at: string | null
          currency: string | null
          fee_type: string | null
          id: string
          image_path: string | null
          metadata: Json | null
          n8n_confidence: number | null
          n8n_response: Json | null
          n8n_validated_at: string | null
          order_id: string | null
          payment_id: string
          processed_by_user_id: string | null
          screenshot_url: string
          service_request_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_approved_at?: string | null
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          currency?: string | null
          fee_type?: string | null
          id?: string
          image_path?: string | null
          metadata?: Json | null
          n8n_confidence?: number | null
          n8n_response?: Json | null
          n8n_validated_at?: string | null
          order_id?: string | null
          payment_id: string
          processed_by_user_id?: string | null
          screenshot_url: string
          service_request_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_approved_at?: string | null
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          fee_type?: string | null
          id?: string
          image_path?: string | null
          metadata?: Json | null
          n8n_confidence?: number | null
          n8n_response?: Json | null
          n8n_validated_at?: string | null
          order_id?: string | null
          payment_id?: string
          processed_by_user_id?: string | null
          screenshot_url?: string
          service_request_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zelle_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zelle_payments_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_terms_view: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          term_type: string | null
          title: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          term_type?: string | null
          title?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          term_type?: string | null
          title?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      split_payments_with_order_details: {
        Row: {
          client_email: string | null
          client_name: string | null
          created_at: string | null
          id: string | null
          order_id: string | null
          order_number: string | null
          order_payment_status: string | null
          overall_status: string | null
          part1_amount_usd: number | null
          part1_completed_at: string | null
          part1_parcelow_checkout_url: string | null
          part1_parcelow_order_id: string | null
          part1_parcelow_status: string | null
          part1_payment_metadata: Json | null
          part1_payment_method: string | null
          part1_payment_status: string | null
          part2_amount_usd: number | null
          part2_completed_at: string | null
          part2_parcelow_checkout_url: string | null
          part2_parcelow_order_id: string | null
          part2_parcelow_status: string | null
          part2_payment_metadata: Json | null
          part2_payment_method: string | null
          part2_payment_status: string | null
          product_slug: string | null
          seller_id: string | null
          split_count: number | null
          total_amount_usd: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "split_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "visa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_orders_product_slug_fkey"
            columns: ["product_slug"]
            isOneToOne: false
            referencedRelation: "visa_products"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Functions: {
      activate_eb3_recurrence: {
        Args: {
          p_activation_order_id: string
          p_client_id: string
          p_manual_activation?: boolean
          p_seller_commission_percent?: number
          p_seller_id?: string
        }
        Returns: string
      }
      activate_scholarship_recurrence: {
        Args: {
          p_activation_order_id: string
          p_client_id: string
          p_manual_activation?: boolean
          p_seller_commission_percent?: number
          p_seller_id?: string
        }
        Returns: string
      }
      approve_migma_zelle_payment: {
        Args: { p_admin_user_id: string; p_payment_id: string }
        Returns: Json
      }
      approve_payment_request: {
        Args: {
          p_admin_notes?: string
          p_approved_by: string
          p_request_id: string
        }
        Returns: boolean
      }
      calculate_idle_gaps: {
        Args: { end_date: string; min_gap_minutes?: number; start_date: string }
        Returns: {
          gap_end: string
          gap_minutes: number
          gap_start: string
          user_id: string
        }[]
      }
      calculate_net_amount: { Args: { order_record: Json }; Returns: number }
      calculate_seller_commission: {
        Args: { p_calculation_method?: string; p_order_id: string }
        Returns: string
      }
      can_seller_request_payment: {
        Args: { p_seller_id: string }
        Returns: boolean
      }
      check_eb3_overdue: { Args: never; Returns: number }
      check_scholarship_overdue: { Args: never; Returns: number }
      check_user_term_acceptance: {
        Args: { p_term_type: string; p_user_id: string }
        Returns: boolean
      }
      complete_payment_request: {
        Args: {
          p_proof_file_path: string
          p_proof_url: string
          p_request_id: string
        }
        Returns: undefined
      }
      create_payment_request: {
        Args: {
          p_amount_usd: number
          p_payment_details?: Json
          p_payment_method?: string
          p_seller_id: string
        }
        Returns: string
      }
      create_seller_payment_request: {
        Args: {
          p_amount: number
          p_payment_details: Json
          p_payment_method: string
          p_seller_id: string
        }
        Returns: string
      }
      decrement_coupon_usage: { Args: { p_code: string }; Returns: undefined }
      generate_access_token: { Args: never; Returns: string }
      get_active_term_json: { Args: { p_term_type: string }; Returns: Json }
      get_admin_emails: { Args: never; Returns: string[] }
      get_commission_percentage: {
        Args: { net_amount: number }
        Returns: number
      }
      get_eb3_dashboard_stats: { Args: never; Returns: Json }
      get_eb3_email_history: {
        Args: { p_client_id: string }
        Returns: {
          email_type: string
          id: string
          installment_number: number
          metadata: Json
          recipient_email: string
          sent_at: string
          status: string
        }[]
      }
      get_eb3_program_detail: { Args: { p_client_id: string }; Returns: Json }
      get_eb3_program_summaries: {
        Args: never
        Returns: {
          client_email: string
          client_id: string
          client_name: string
          control_id: string
          installments_paid: number
          next_amount: number
          next_due_date: string
          next_installment_number: number
          next_status: string
          program_status: string
          seller_name: string
          total_installments: number
        }[]
      }
      get_latest_active_term: {
        Args: { p_term_type: string }
        Returns: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          term_type: string
          title: string
          updated_at: string | null
          version: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "application_terms"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_products_with_contracts: {
        Args: never
        Returns: {
          product_slug: string
        }[]
      }
      get_scholarship_dashboard_stats: { Args: never; Returns: Json }
      get_scholarship_email_history: {
        Args: { p_client_id: string }
        Returns: {
          email_type: string
          id: string
          installment_number: number
          metadata: Json
          recipient_email: string
          sent_at: string
          status: string
        }[]
      }
      get_scholarship_program_detail: {
        Args: { p_client_id: string }
        Returns: Json
      }
      get_scholarship_program_summaries: {
        Args: never
        Returns: {
          client_email: string
          client_id: string
          client_name: string
          control_id: string
          installments_paid: number
          next_amount: number
          next_due_date: string
          next_installment_number: number
          next_status: string
          program_status: string
          seller_name: string
          total_installments: number
        }[]
      }
      get_seller_available_balance: {
        Args: { p_seller_id: string }
        Returns: {
          available_balance: number
          can_request: boolean
          is_in_request_window: boolean
          last_request_date: string
          next_request_window_end: string
          next_request_window_start: string
          next_withdrawal_date: string
          pending_balance: number
        }[]
      }
      increment_coupon_usage: { Args: { p_code: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_seller: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_commission_blacklisted_product: {
        Args: { p_product_slug: string }
        Returns: boolean
      }
      is_seller: { Args: never; Returns: boolean }
      mark_eb3_installment_paid: {
        Args: { p_payment_id: string; p_schedule_id: string }
        Returns: boolean
      }
      mark_eb3_installment_paid_manual: {
        Args: { p_notes?: string; p_schedule_id: string }
        Returns: Json
      }
      mark_payment_request_paid: {
        Args: { p_payment_proof_url?: string; p_request_id: string }
        Returns: boolean
      }
      mark_scholarship_installment_paid: {
        Args: { p_payment_id: string; p_schedule_id: string }
        Returns: boolean
      }
      mark_scholarship_installment_paid_manual: {
        Args: { p_notes?: string; p_schedule_id: string }
        Returns: Json
      }
      process_payment_request_approval: {
        Args: { p_admin_id: string; p_request_id: string }
        Returns: undefined
      }
      process_payment_request_rejection: {
        Args: { p_admin_id: string; p_reason: string; p_request_id: string }
        Returns: undefined
      }
      recalculate_monthly_commissions: {
        Args: { p_month_date?: string; p_seller_id: string }
        Returns: undefined
      }
      record_term_acceptance: {
        Args: {
          p_ip_address: string
          p_term_id: string
          p_term_type: string
          p_user_agent: string
          p_user_id: string
        }
        Returns: boolean
      }
      register_visa_order_intent: {
        Args: {
          p_client_email: string
          p_client_name: string
          p_coupon_code: string
          p_discount_amount: number
          p_product_slug: string
          p_service_request_id: string
        }
        Returns: undefined
      }
      reject_payment_request: {
        Args: {
          p_rejected_by: string
          p_rejection_reason: string
          p_request_id: string
        }
        Returns: boolean
      }
      toggle_eb3_recurrence_status: {
        Args: { p_control_id: string; p_reason?: string; p_status: string }
        Returns: Json
      }
      toggle_scholarship_recurrence_status: {
        Args: { p_control_id: string; p_reason?: string; p_status: string }
        Returns: Json
      }
      validate_promotional_coupon: { Args: { p_code: string }; Returns: Json }
      validate_split_payment: {
        Args: {
          p_part1_amount: number
          p_part1_method: string
          p_part2_amount: number
          p_part2_method: string
          p_total_amount: number
        }
        Returns: {
          error_message: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      contract_template_type:
        | "global_partner"
        | "visa_service"
        | "chargeback_annex"
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
    Enums: {
      contract_template_type: [
        "global_partner",
        "visa_service",
        "chargeback_annex",
      ],
    },
  },
} as const
