# Banco de Dados (Supabase)

Este documento descreve o schema atual do banco com base em `src/types/supabase.ts`.

## Visão Geral

- Banco: PostgreSQL (Supabase)
- Schema principal: `public`
- Schema auxiliar: `graphql_public` (função `graphql`)
- Tabelas em `public`: 10
- Views em `public`: nenhuma tipada atualmente
- RPCs em `public`: `is_admin()`, `validate_coupon(p_code, p_slug)`

## Enums (`public`)

### `process_service_status`
- `pending`
- `paid`
- `in_progress`
- `delivered`
- `approved`
- `denied`

### `process_service_type`
- `MAIN`
- `RFE`
- `MOTION`

## Tabelas (`public`)

### `cos_recovery_cases`
Casos de recuperação/atendimento complementar vinculados a um serviço do usuário.

Colunas:
- `id: string`
- `user_id: string`
- `user_service_id: string`
- `admin_analysis: string | null`
- `admin_final_message: string | null`
- `admin_notes: string | null`
- `created_at: string | null`
- `document_urls: string[] | null`
- `explanation: string | null`
- `final_document_urls: string[] | null`
- `last_payment_id: string | null`
- `proposal_sent_at: string | null`
- `proposal_value_usd: number | null`
- `recovery_type: string | null`
- `status: string | null`
- `submitted_at: string | null`
- `updated_at: string | null`

Relacionamentos:
- Nenhum FK tipado em `supabase.ts`.

### `discount_coupons`
Cupons de desconto aplicáveis em checkout.

Colunas:
- `id: string`
- `code: string`
- `discount_type: string`
- `discount_value: number`
- `expires_at: string`
- `is_active: boolean`
- `uses_count: number`
- `created_at: string`
- `created_by: string | null`
- `applicable_slugs: string[] | null`
- `max_uses: number | null`
- `min_purchase_usd: number | null`

Relacionamentos:
- Nenhum FK tipado em `supabase.ts`.

### `notifications`
Notificações para usuários e fluxos internos.

Colunas:
- `id: string`
- `title: string`
- `message: string`
- `target_role: string`
- `user_id: string | null`
- `link: string | null`
- `is_read: boolean`
- `send_email: boolean`
- `email_sent: boolean`
- `created_at: string`

Relacionamentos:
- `notifications.user_id -> profiles.id` (`notifications_user_id_fkey`)

### `process_logs`
Auditoria e trilha de eventos de processos/serviços.

Colunas:
- `id: string`
- `user_service_id: string | null`
- `service_id: string | null`
- `user_id: string | null`
- `action: string | null`
- `action_type: string | null`
- `message: string | null`
- `description: string | null`
- `comments: string | null`
- `actor_id: string | null`
- `actor_name: string | null`
- `actor_email: string | null`
- `actor_role: string | null`
- `created_by: string | null`
- `changed_by: string | null`
- `previous_step: number | null`
- `new_step: number | null`
- `old_step: number | null`
- `previous_status: string | null`
- `new_status: string | null`
- `old_status: string | null`
- `changes: Json | null`
- `details: Json | null`
- `metadata: Json | null`
- `old_data: Json | null`
- `new_data: Json | null`
- `ip_address: string | null`
- `created_at: string | null`
- `updated_at: string | null`

Relacionamentos:
- `process_logs.user_service_id -> user_services.id` (`process_logs_user_service_id_fkey`)

### `profiles`
Perfil básico de usuário.

Colunas:
- `id: string`
- `full_name: string | null`
- `email: string | null`
- `phone: string | null`
- `whatsapp: string | null`
- `avatar_url: string | null`
- `updated_at: string | null`

Relacionamentos:
- Nenhum FK tipado em `supabase.ts`.

### `services_prices`
Catálogo de preços por serviço.

Colunas:
- `id: string`
- `service_id: string`
- `name: string`
- `price: number`
- `currency: string | null`
- `is_active: boolean`

Relacionamentos:
- Nenhum FK tipado em `supabase.ts`.

### `user_accounts`
Conta principal do usuário na aplicação.

Colunas:
- `id: string`
- `full_name: string`
- `email: string | null`
- `phone_number: string | null`
- `avatar_url: string | null`
- `passport_photo_url: string | null`
- `role: string`
- `created_at: string`
- `updated_at: string`

Relacionamentos:
- Nenhum FK tipado em `supabase.ts`.

### `user_services`
Instâncias de serviços contratados por usuário (pipeline/processo).

Colunas:
- `id: string`
- `user_id: string`
- `service_slug: string`
- `status: string | null`
- `current_step: number | null`
- `created_at: string | null`
- `data: Json | null`
- `step_data: Json | null`
- `service_metadata: Json | null`
- `admin_notes: string | null`
- `admin_review_data: Json | null`
- `specialist_review_data: Json | null`
- `specialist_training_data: Json | null`
- `application_id: string | null`
- `consular_login: string | null`
- `consular_password: string | null`
- `date_of_birth: string | null`
- `grandmother_name: string | null`
- `interview_date: string | null`
- `interview_time: string | null`
- `interview_location_casv: string | null`
- `interview_location_consulate: string | null`
- `consulate_interview_date: string | null`
- `consulate_interview_time: string | null`
- `is_second_attempt: boolean | null`
- `same_location: boolean | null`

Relacionamentos:
- `user_services.user_id -> user_accounts.id` (`user_services_account_id_fkey`)

### `orders`
Pedidos de checkout/pagamento.

Colunas:
- `id: string`
- `user_id: string | null`
- `product_slug: string`
- `payment_method: string`
- `payment_status: string`
- `total_price_usd: number`
- `total_price_brl: number | null`
- `discount_amount: number | null`
- `coupon_code: string | null`
- `exchange_rate: number | null`
- `client_name: string`
- `client_email: string`
- `client_ip: string | null`
- `terms_accepted_at: string | null`
- `contract_pdf_url: string | null`
- `contract_selfie_url: string | null`
- `stripe_session_id: string | null`
- `parcelow_order_id: string | null`
- `order_number: string | null`
- `payment_metadata: Json | null`
- `is_test: boolean | null`
- `created_at: string | null`
- `updated_at: string | null`

Relacionamentos:
- `orders.user_id -> user_accounts.id` (`orders_user_id_fkey`)

### `zelle_payments`
Pagamentos por Zelle e processamento administrativo.

Colunas:
- `id: string`
- `amount: number`
- `status: string`
- `user_id: string | null`
- `visa_order_id: string | null`
- `service_slug: string | null`
- `payment_method: string | null`
- `payment_date: string | null`
- `confirmation_code: string | null`
- `proof_path: string | null`
- `image_url: string | null`
- `recipient_name: string | null`
- `recipient_email: string | null`
- `guest_name: string | null`
- `guest_email: string | null`
- `fee_type_global: string | null`
- `coupon_code: string | null`
- `discount_amount: number | null`
- `n8n_confidence: number | null`
- `n8n_response: string | null`
- `admin_notes: string | null`
- `admin_approved_at: string | null`
- `processed_by_user_id: string | null`
- `created_at: string | null`
- `updated_at: string | null`

Relacionamentos:
- `zelle_payments.user_id -> user_accounts.id` (`zelle_payments_user_id_fkey`)
- `zelle_payments.visa_order_id -> orders.id` (`zelle_payments_visa_order_id_fkey`)

## Funções RPC (`public`)

### `is_admin()`
- Args: nenhum
- Retorno: `boolean`
- Uso: validação de papel/permissão administrativa em regras e chamadas de negócio.

### `validate_coupon(p_code text, p_slug text default null)`
- Args:
  - `p_code: string`
  - `p_slug?: string`
- Retorno: `Json`
- Uso: validação de cupom por código e, opcionalmente, por slug de serviço/produto.

## Funções (`graphql_public`)

### `graphql(operationName?, query?, variables?, extensions?)`
- Retorno: `Json`
- Observação: endpoint GraphQL exposto pelo Supabase/PostgREST.

## Mapa de Relacionamentos (FK)

- `notifications.user_id -> profiles.id`
- `process_logs.user_service_id -> user_services.id`
- `user_services.user_id -> user_accounts.id`
- `orders.user_id -> user_accounts.id`
- `zelle_payments.user_id -> user_accounts.id`
- `zelle_payments.visa_order_id -> orders.id`

## Observações

- A tipagem mostra o contrato de aplicação atual. Algumas constraints/regras adicionais (RLS, índices, checks, triggers e storage policies) existem nas migrations e podem não aparecer neste arquivo de tipos.
- Para manter esta documentação sincronizada, atualize após cada alteração relevante no schema/migrations.
