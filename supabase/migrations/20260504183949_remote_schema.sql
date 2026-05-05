create type "public"."process_service_status" as enum ('pending', 'paid', 'in_progress', 'delivered', 'approved', 'denied');

create type "public"."process_service_type" as enum ('MAIN', 'RFE', 'MOTION');

create sequence "public"."visa_order_number_seq";

drop trigger if exists "set_notifications_updated_at" on "aplikei"."notifications";

drop trigger if exists "on_order_paid" on "aplikei"."orders";

drop trigger if exists "set_orders_updated_at" on "aplikei"."orders";

drop trigger if exists "set_users_accounts_updated_at" on "aplikei"."users_accounts";

drop trigger if exists "set_notifications_updated_at" on "public"."notifications";

drop trigger if exists "on_payment_status_change" on "public"."payments";

drop trigger if exists "set_payments_updated_at" on "public"."payments";

drop trigger if exists "set_product_steps_updated_at" on "public"."product_steps";

drop trigger if exists "set_products_updated_at" on "public"."products";

drop trigger if exists "set_upi_updated_at" on "public"."user_product_instances";

drop trigger if exists "on_user_step_status_change" on "public"."user_steps";

drop trigger if exists "set_user_steps_updated_at" on "public"."user_steps";

drop policy "notifications_delete_admin_only" on "aplikei"."notifications";

drop policy "notifications_insert_customer_or_admin" on "aplikei"."notifications";

drop policy "notifications_select_own_or_admin" on "aplikei"."notifications";

drop policy "notifications_update_own_or_admin" on "aplikei"."notifications";

drop policy "orders_insert_own_or_admin" on "aplikei"."orders";

drop policy "orders_select_own_or_admin" on "aplikei"."orders";

drop policy "orders_update_admin" on "aplikei"."orders";

drop policy "payment_events_admin_only" on "aplikei"."payment_events";

drop policy "users_accounts_delete_admin_only" on "aplikei"."users_accounts";

drop policy "users_accounts_insert_own_or_admin" on "aplikei"."users_accounts";

drop policy "users_accounts_select_own_or_admin" on "aplikei"."users_accounts";

drop policy "users_accounts_update_own_or_admin" on "aplikei"."users_accounts";

drop policy "order_items_insert_own_or_admin" on "public"."order_items";

drop policy "order_items_select_own_or_admin" on "public"."order_items";

drop policy "payments_insert_admin" on "public"."payments";

drop policy "payments_select_own_or_admin" on "public"."payments";

drop policy "payments_update_admin" on "public"."payments";

drop policy "product_prices_all_admin" on "public"."product_prices";

drop policy "product_prices_select_public" on "public"."product_prices";

drop policy "product_steps_select_public" on "public"."product_steps";

drop policy "product_steps_write_admin" on "public"."product_steps";

drop policy "products_all_admin" on "public"."products";

drop policy "products_select_public" on "public"."products";

drop policy "step_reviews_insert_admin" on "public"."step_reviews";

drop policy "step_reviews_select_own_or_admin" on "public"."step_reviews";

drop policy "upi_insert_own_or_admin" on "public"."user_product_instances";

drop policy "upi_select_own_or_admin" on "public"."user_product_instances";

drop policy "upi_update_own_or_admin" on "public"."user_product_instances";

drop policy "user_steps_modify_own_or_admin" on "public"."user_steps";

drop policy "user_steps_select_own_or_admin" on "public"."user_steps";

drop policy "authenticated_can_insert" on "public"."notifications";

drop policy "clients_can_update_own_notifications" on "public"."notifications";

drop policy "clients_see_own_notifications" on "public"."notifications";

revoke select on table "aplikei"."notifications" from "anon";

revoke delete on table "aplikei"."notifications" from "authenticated";

revoke insert on table "aplikei"."notifications" from "authenticated";

revoke select on table "aplikei"."notifications" from "authenticated";

revoke update on table "aplikei"."notifications" from "authenticated";

revoke delete on table "aplikei"."notifications" from "service_role";

revoke insert on table "aplikei"."notifications" from "service_role";

revoke select on table "aplikei"."notifications" from "service_role";

revoke update on table "aplikei"."notifications" from "service_role";

revoke select on table "aplikei"."orders" from "anon";

revoke delete on table "aplikei"."orders" from "authenticated";

revoke insert on table "aplikei"."orders" from "authenticated";

revoke select on table "aplikei"."orders" from "authenticated";

revoke update on table "aplikei"."orders" from "authenticated";

revoke delete on table "aplikei"."orders" from "service_role";

revoke insert on table "aplikei"."orders" from "service_role";

revoke select on table "aplikei"."orders" from "service_role";

revoke update on table "aplikei"."orders" from "service_role";

revoke select on table "aplikei"."payment_events" from "anon";

revoke delete on table "aplikei"."payment_events" from "authenticated";

revoke insert on table "aplikei"."payment_events" from "authenticated";

revoke select on table "aplikei"."payment_events" from "authenticated";

revoke update on table "aplikei"."payment_events" from "authenticated";

revoke delete on table "aplikei"."payment_events" from "service_role";

revoke insert on table "aplikei"."payment_events" from "service_role";

revoke select on table "aplikei"."payment_events" from "service_role";

revoke update on table "aplikei"."payment_events" from "service_role";

revoke select on table "aplikei"."users_accounts" from "anon";

revoke delete on table "aplikei"."users_accounts" from "authenticated";

revoke insert on table "aplikei"."users_accounts" from "authenticated";

revoke select on table "aplikei"."users_accounts" from "authenticated";

revoke update on table "aplikei"."users_accounts" from "authenticated";

revoke delete on table "aplikei"."users_accounts" from "service_role";

revoke insert on table "aplikei"."users_accounts" from "service_role";

revoke select on table "aplikei"."users_accounts" from "service_role";

revoke update on table "aplikei"."users_accounts" from "service_role";

revoke delete on table "public"."_legacy_aplikei_notifications_backup" from "anon";

revoke insert on table "public"."_legacy_aplikei_notifications_backup" from "anon";

revoke references on table "public"."_legacy_aplikei_notifications_backup" from "anon";

revoke select on table "public"."_legacy_aplikei_notifications_backup" from "anon";

revoke trigger on table "public"."_legacy_aplikei_notifications_backup" from "anon";

revoke truncate on table "public"."_legacy_aplikei_notifications_backup" from "anon";

revoke update on table "public"."_legacy_aplikei_notifications_backup" from "anon";

revoke delete on table "public"."_legacy_aplikei_notifications_backup" from "authenticated";

revoke insert on table "public"."_legacy_aplikei_notifications_backup" from "authenticated";

revoke references on table "public"."_legacy_aplikei_notifications_backup" from "authenticated";

revoke select on table "public"."_legacy_aplikei_notifications_backup" from "authenticated";

revoke trigger on table "public"."_legacy_aplikei_notifications_backup" from "authenticated";

revoke truncate on table "public"."_legacy_aplikei_notifications_backup" from "authenticated";

revoke update on table "public"."_legacy_aplikei_notifications_backup" from "authenticated";

revoke delete on table "public"."_legacy_aplikei_notifications_backup" from "service_role";

revoke insert on table "public"."_legacy_aplikei_notifications_backup" from "service_role";

revoke references on table "public"."_legacy_aplikei_notifications_backup" from "service_role";

revoke select on table "public"."_legacy_aplikei_notifications_backup" from "service_role";

revoke trigger on table "public"."_legacy_aplikei_notifications_backup" from "service_role";

revoke truncate on table "public"."_legacy_aplikei_notifications_backup" from "service_role";

revoke update on table "public"."_legacy_aplikei_notifications_backup" from "service_role";

revoke delete on table "public"."_legacy_aplikei_orders_backup" from "anon";

revoke insert on table "public"."_legacy_aplikei_orders_backup" from "anon";

revoke references on table "public"."_legacy_aplikei_orders_backup" from "anon";

revoke select on table "public"."_legacy_aplikei_orders_backup" from "anon";

revoke trigger on table "public"."_legacy_aplikei_orders_backup" from "anon";

revoke truncate on table "public"."_legacy_aplikei_orders_backup" from "anon";

revoke update on table "public"."_legacy_aplikei_orders_backup" from "anon";

revoke delete on table "public"."_legacy_aplikei_orders_backup" from "authenticated";

revoke insert on table "public"."_legacy_aplikei_orders_backup" from "authenticated";

revoke references on table "public"."_legacy_aplikei_orders_backup" from "authenticated";

revoke select on table "public"."_legacy_aplikei_orders_backup" from "authenticated";

revoke trigger on table "public"."_legacy_aplikei_orders_backup" from "authenticated";

revoke truncate on table "public"."_legacy_aplikei_orders_backup" from "authenticated";

revoke update on table "public"."_legacy_aplikei_orders_backup" from "authenticated";

revoke delete on table "public"."_legacy_aplikei_orders_backup" from "service_role";

revoke insert on table "public"."_legacy_aplikei_orders_backup" from "service_role";

revoke references on table "public"."_legacy_aplikei_orders_backup" from "service_role";

revoke select on table "public"."_legacy_aplikei_orders_backup" from "service_role";

revoke trigger on table "public"."_legacy_aplikei_orders_backup" from "service_role";

revoke truncate on table "public"."_legacy_aplikei_orders_backup" from "service_role";

revoke update on table "public"."_legacy_aplikei_orders_backup" from "service_role";

revoke delete on table "public"."_legacy_aplikei_payment_events_backup" from "anon";

revoke insert on table "public"."_legacy_aplikei_payment_events_backup" from "anon";

revoke references on table "public"."_legacy_aplikei_payment_events_backup" from "anon";

revoke select on table "public"."_legacy_aplikei_payment_events_backup" from "anon";

revoke trigger on table "public"."_legacy_aplikei_payment_events_backup" from "anon";

revoke truncate on table "public"."_legacy_aplikei_payment_events_backup" from "anon";

revoke update on table "public"."_legacy_aplikei_payment_events_backup" from "anon";

revoke delete on table "public"."_legacy_aplikei_payment_events_backup" from "authenticated";

revoke insert on table "public"."_legacy_aplikei_payment_events_backup" from "authenticated";

revoke references on table "public"."_legacy_aplikei_payment_events_backup" from "authenticated";

revoke select on table "public"."_legacy_aplikei_payment_events_backup" from "authenticated";

revoke trigger on table "public"."_legacy_aplikei_payment_events_backup" from "authenticated";

revoke truncate on table "public"."_legacy_aplikei_payment_events_backup" from "authenticated";

revoke update on table "public"."_legacy_aplikei_payment_events_backup" from "authenticated";

revoke delete on table "public"."_legacy_aplikei_payment_events_backup" from "service_role";

revoke insert on table "public"."_legacy_aplikei_payment_events_backup" from "service_role";

revoke references on table "public"."_legacy_aplikei_payment_events_backup" from "service_role";

revoke select on table "public"."_legacy_aplikei_payment_events_backup" from "service_role";

revoke trigger on table "public"."_legacy_aplikei_payment_events_backup" from "service_role";

revoke truncate on table "public"."_legacy_aplikei_payment_events_backup" from "service_role";

revoke update on table "public"."_legacy_aplikei_payment_events_backup" from "service_role";

revoke select on table "public"."order_items" from "anon";

revoke delete on table "public"."order_items" from "authenticated";

revoke insert on table "public"."order_items" from "authenticated";

revoke select on table "public"."order_items" from "authenticated";

revoke update on table "public"."order_items" from "authenticated";

revoke delete on table "public"."order_items" from "service_role";

revoke insert on table "public"."order_items" from "service_role";

revoke select on table "public"."order_items" from "service_role";

revoke update on table "public"."order_items" from "service_role";

revoke select on table "public"."payments" from "anon";

revoke delete on table "public"."payments" from "authenticated";

revoke insert on table "public"."payments" from "authenticated";

revoke select on table "public"."payments" from "authenticated";

revoke update on table "public"."payments" from "authenticated";

revoke delete on table "public"."payments" from "service_role";

revoke insert on table "public"."payments" from "service_role";

revoke select on table "public"."payments" from "service_role";

revoke update on table "public"."payments" from "service_role";

revoke select on table "public"."product_prices" from "anon";

revoke delete on table "public"."product_prices" from "authenticated";

revoke insert on table "public"."product_prices" from "authenticated";

revoke select on table "public"."product_prices" from "authenticated";

revoke update on table "public"."product_prices" from "authenticated";

revoke delete on table "public"."product_prices" from "service_role";

revoke insert on table "public"."product_prices" from "service_role";

revoke select on table "public"."product_prices" from "service_role";

revoke update on table "public"."product_prices" from "service_role";

revoke select on table "public"."product_steps" from "anon";

revoke delete on table "public"."product_steps" from "authenticated";

revoke insert on table "public"."product_steps" from "authenticated";

revoke select on table "public"."product_steps" from "authenticated";

revoke update on table "public"."product_steps" from "authenticated";

revoke delete on table "public"."product_steps" from "service_role";

revoke insert on table "public"."product_steps" from "service_role";

revoke select on table "public"."product_steps" from "service_role";

revoke update on table "public"."product_steps" from "service_role";

revoke select on table "public"."products" from "anon";

revoke delete on table "public"."products" from "authenticated";

revoke insert on table "public"."products" from "authenticated";

revoke select on table "public"."products" from "authenticated";

revoke update on table "public"."products" from "authenticated";

revoke delete on table "public"."products" from "service_role";

revoke insert on table "public"."products" from "service_role";

revoke select on table "public"."products" from "service_role";

revoke update on table "public"."products" from "service_role";

revoke select on table "public"."step_reviews" from "anon";

revoke delete on table "public"."step_reviews" from "authenticated";

revoke insert on table "public"."step_reviews" from "authenticated";

revoke select on table "public"."step_reviews" from "authenticated";

revoke update on table "public"."step_reviews" from "authenticated";

revoke delete on table "public"."step_reviews" from "service_role";

revoke insert on table "public"."step_reviews" from "service_role";

revoke select on table "public"."step_reviews" from "service_role";

revoke update on table "public"."step_reviews" from "service_role";

revoke select on table "public"."user_product_instances" from "anon";

revoke delete on table "public"."user_product_instances" from "authenticated";

revoke insert on table "public"."user_product_instances" from "authenticated";

revoke select on table "public"."user_product_instances" from "authenticated";

revoke update on table "public"."user_product_instances" from "authenticated";

revoke delete on table "public"."user_product_instances" from "service_role";

revoke insert on table "public"."user_product_instances" from "service_role";

revoke select on table "public"."user_product_instances" from "service_role";

revoke update on table "public"."user_product_instances" from "service_role";

revoke select on table "public"."user_steps" from "anon";

revoke delete on table "public"."user_steps" from "authenticated";

revoke insert on table "public"."user_steps" from "authenticated";

revoke select on table "public"."user_steps" from "authenticated";

revoke update on table "public"."user_steps" from "authenticated";

revoke delete on table "public"."user_steps" from "service_role";

revoke insert on table "public"."user_steps" from "service_role";

revoke select on table "public"."user_steps" from "service_role";

revoke update on table "public"."user_steps" from "service_role";

alter table "aplikei"."notifications" drop constraint "notifications_actor_user_id_fkey";

alter table "aplikei"."notifications" drop constraint "notifications_customer_target_user_check";

alter table "aplikei"."notifications" drop constraint "notifications_title_check";

alter table "aplikei"."notifications" drop constraint "notifications_user_id_fkey";

alter table "aplikei"."orders" drop constraint "orders_currency_check";

alter table "aplikei"."orders" drop constraint "orders_total_amount_check";

alter table "aplikei"."orders" drop constraint "orders_user_id_fkey";

alter table "aplikei"."payment_events" drop constraint "payment_events_payment_id_fkey";

alter table "aplikei"."users_accounts" drop constraint "users_accounts_id_fkey";

alter table "aplikei"."users_accounts" drop constraint "users_accounts_name_check";

alter table "public"."order_items" drop constraint "order_items_amount_check";

alter table "public"."order_items" drop constraint "order_items_order_id_fkey";

alter table "public"."order_items" drop constraint "order_items_quantity_check";

alter table "public"."payments" drop constraint "payments_amount_check";

alter table "public"."payments" drop constraint "payments_currency_check";

alter table "public"."payments" drop constraint "payments_order_id_fkey";

alter table "public"."product_prices" drop constraint "product_prices_amount_check";

alter table "public"."product_prices" drop constraint "product_prices_currency_check";

alter table "public"."product_prices" drop constraint "product_prices_dependent_amount_check";

alter table "public"."product_prices" drop constraint "product_prices_original_amount_check";

alter table "public"."product_prices" drop constraint "product_prices_product_id_fkey";

alter table "public"."product_prices" drop constraint "product_prices_valid_range";

alter table "public"."product_steps" drop constraint "product_steps_order_positive";

alter table "public"."product_steps" drop constraint "product_steps_product_id_fkey";

alter table "public"."product_steps" drop constraint "product_steps_product_id_order_key";

alter table "public"."products" drop constraint "products_name_check";

alter table "public"."products" drop constraint "products_slug_check";

alter table "public"."products" drop constraint "products_slug_key";

alter table "public"."step_reviews" drop constraint "step_reviews_admin_id_fkey";

alter table "public"."step_reviews" drop constraint "step_reviews_user_step_id_fkey";

alter table "public"."user_product_instances" drop constraint "user_product_instances_order_id_fkey";

alter table "public"."user_product_instances" drop constraint "user_product_instances_product_id_fkey";

alter table "public"."user_product_instances" drop constraint "user_product_instances_user_id_fkey";

alter table "public"."user_steps" drop constraint "user_steps_product_step_id_fkey";

alter table "public"."user_steps" drop constraint "user_steps_user_product_id_fkey";

alter table "public"."user_steps" drop constraint "user_steps_user_product_id_product_step_id_key";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

-- Keep legacy aplikei functions to avoid dependency failures with
-- historical triggers/policies during migration replay.

drop view if exists "public"."active_products";

drop function if exists "public"."add_dependent_slot"(p_instance_id uuid, p_order_id uuid);

drop function if exists "public"."fulfill_paid_order"(p_order_id uuid);

drop function if exists "public"."start_product_instance"(p_user_id uuid, p_product_id uuid, p_order_id uuid);

drop function if exists "public"."sync_instance_status"(p_instance_id uuid);

drop function if exists "public"."sync_order_status"(p_order_id uuid);

drop function if exists "public"."trigger_fulfill_paid_order"();

drop function if exists "public"."trigger_sync_instance_status"();

drop function if exists "public"."trigger_sync_order_status"();

alter table "aplikei"."notifications" drop constraint "notifications_pkey";

alter table "aplikei"."orders" drop constraint "orders_pkey";

alter table "aplikei"."payment_events" drop constraint "payment_events_pkey";

alter table "aplikei"."users_accounts" drop constraint "users_accounts_pkey";

alter table "public"."order_items" drop constraint "order_items_pkey";

alter table "public"."payments" drop constraint "payments_pkey";

alter table "public"."product_prices" drop constraint "product_prices_pkey";

alter table "public"."product_steps" drop constraint "product_steps_pkey";

alter table "public"."products" drop constraint "products_pkey";

alter table "public"."step_reviews" drop constraint "step_reviews_pkey";

alter table "public"."user_product_instances" drop constraint "user_product_instances_pkey";

alter table "public"."user_steps" drop constraint "user_steps_pkey";

drop index if exists "aplikei"."notifications_created_at_idx";

drop index if exists "aplikei"."notifications_is_read_idx";

drop index if exists "aplikei"."notifications_pkey";

drop index if exists "aplikei"."notifications_service_id_idx";

drop index if exists "aplikei"."notifications_target_role_idx";

drop index if exists "aplikei"."notifications_user_id_idx";

drop index if exists "aplikei"."orders_created_at_idx";

drop index if exists "aplikei"."orders_pkey";

drop index if exists "aplikei"."orders_status_idx";

drop index if exists "aplikei"."orders_user_id_idx";

drop index if exists "aplikei"."payment_events_created_at_idx";

drop index if exists "aplikei"."payment_events_event_type_idx";

drop index if exists "aplikei"."payment_events_payment_id_idx";

drop index if exists "aplikei"."payment_events_pkey";

drop index if exists "aplikei"."users_accounts_created_at_idx";

drop index if exists "aplikei"."users_accounts_email_unique_idx";

drop index if exists "aplikei"."users_accounts_pkey";

drop index if exists "aplikei"."users_accounts_role_idx";

drop index if exists "public"."order_items_item_id_idx";

drop index if exists "public"."order_items_order_id_idx";

drop index if exists "public"."order_items_pkey";

drop index if exists "public"."payments_created_at_idx";

drop index if exists "public"."payments_external_id_idx";

drop index if exists "public"."payments_order_id_idx";

drop index if exists "public"."payments_pkey";

drop index if exists "public"."payments_status_idx";

drop index if exists "public"."product_prices_default_idx";

drop index if exists "public"."product_prices_pkey";

drop index if exists "public"."product_prices_product_id_idx";

drop index if exists "public"."product_steps_order_idx";

drop index if exists "public"."product_steps_pkey";

drop index if exists "public"."product_steps_product_id_idx";

drop index if exists "public"."product_steps_product_id_order_key";

drop index if exists "public"."products_pkey";

drop index if exists "public"."products_slug_idx";

drop index if exists "public"."products_slug_key";

drop index if exists "public"."products_status_idx";

drop index if exists "public"."products_type_idx";

drop index if exists "public"."step_reviews_admin_idx";

drop index if exists "public"."step_reviews_pkey";

drop index if exists "public"."step_reviews_step_idx";

drop index if exists "public"."step_reviews_time_idx";

drop index if exists "public"."upi_order_id_idx";

drop index if exists "public"."upi_product_id_idx";

drop index if exists "public"."upi_status_idx";

drop index if exists "public"."upi_user_id_idx";

drop index if exists "public"."user_product_instances_pkey";

drop index if exists "public"."user_steps_pkey";

drop index if exists "public"."user_steps_status_idx";

drop index if exists "public"."user_steps_step_idx";

drop index if exists "public"."user_steps_upi_idx";

drop index if exists "public"."user_steps_user_product_id_product_step_id_key";

drop table "aplikei"."notifications";

drop table "aplikei"."orders";

drop table "aplikei"."payment_events";

drop table "aplikei"."users_accounts";

drop table "public"."_legacy_aplikei_notifications_backup";

drop table "public"."_legacy_aplikei_orders_backup";

drop table "public"."_legacy_aplikei_payment_events_backup";

drop table "public"."order_items";

drop table "public"."payments";

drop table "public"."product_prices";

drop table "public"."product_steps";

drop table "public"."products";

drop table "public"."step_reviews";

drop table "public"."user_product_instances";

drop table "public"."user_steps";

alter type "public"."user_account_role" rename to "user_account_role__old_version_to_be_dropped";

create type "public"."user_account_role" as enum ('customer', 'admin', 'seller', 'master');


  create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "order_number" text default ('APL-'::text || (nextval('public.visa_order_number_seq'::regclass))::text),
    "user_id" uuid,
    "client_name" text not null,
    "client_email" text not null,
    "product_slug" text not null,
    "total_price_usd" numeric(10,2) not null,
    "total_price_brl" numeric(10,2),
    "exchange_rate" numeric(10,3),
    "payment_status" text not null default 'pending'::text,
    "payment_method" text not null,
    "stripe_session_id" text,
    "payment_metadata" jsonb default '{}'::jsonb,
    "is_test" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "parcelow_order_id" text,
    "contract_selfie_url" text,
    "terms_accepted_at" timestamp with time zone,
    "client_ip" text,
    "contract_pdf_url" text,
    "coupon_code" text,
    "discount_amount" numeric default 0
      );


alter table "public"."orders" enable row level security;


  create table "public"."process_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_service_id" uuid,
    "service_id" uuid,
    "action" text,
    "previous_step" integer,
    "new_step" integer,
    "previous_status" text,
    "new_status" text,
    "details" jsonb,
    "metadata" jsonb,
    "changed_by" uuid,
    "created_by" uuid,
    "user_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "actor_id" uuid,
    "actor_name" text,
    "actor_email" text,
    "actor_role" text,
    "old_data" jsonb,
    "new_data" jsonb,
    "changes" jsonb,
    "message" text,
    "ip_address" text,
    "action_type" text,
    "old_status" text,
    "old_step" integer,
    "description" text,
    "comments" text
      );



  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "email" text,
    "whatsapp" text,
    "avatar_url" text,
    "updated_at" timestamp with time zone default now(),
    "phone" text,
    "passport_photo_url" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."services_prices" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "service_id" text not null,
    "name" text not null,
    "price" numeric(10,2) not null,
    "currency" text default 'USD'::text,
    "is_active" boolean not null default true
      );


alter table "public"."services_prices" enable row level security;


  create table "public"."user_services" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "service_slug" text not null,
    "status" text default 'active'::text,
    "created_at" timestamp with time zone default now(),
    "current_step" integer default 0,
    "application_id" text,
    "date_of_birth" text,
    "grandmother_name" text,
    "consular_login" text,
    "consular_password" text,
    "interview_date" date,
    "interview_time" time without time zone,
    "interview_location_casv" text,
    "interview_location_consulate" text,
    "specialist_training_data" jsonb,
    "consulate_interview_date" text,
    "consulate_interview_time" text,
    "same_location" boolean default true,
    "specialist_review_data" jsonb,
    "is_second_attempt" boolean default false,
    "admin_notes" text,
    "admin_review_data" jsonb default '{}'::jsonb,
    "service_metadata" jsonb default '{}'::jsonb,
    "data" jsonb default '{}'::jsonb,
    "step_data" jsonb default '{}'::jsonb,
    "chat_closed_at" timestamp with time zone
      );


alter table "public"."user_services" enable row level security;


  create table "public"."users_accounts" (
    "id" uuid not null,
    "role" public.user_account_role not null default 'customer'::public.user_account_role,
    "email" text,
    "name" text not null,
    "phone" text,
    "metadata" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "profile_url" text,
    "is_active" boolean default true,
    "terms_accepted_at" timestamp with time zone,
    "last_sign_in_at" timestamp with time zone,
    "passport_photo_url" text,
    "avatar_offset_x" integer not null default 0,
    "avatar_offset_y" integer not null default 0,
    "avatar_zoom" numeric(4,2) not null default 1.00
      );


alter table "public"."users_accounts" enable row level security;


  create table "public"."zelle_payments" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "amount" numeric(10,2) not null,
    "confirmation_code" text,
    "payment_date" date default CURRENT_DATE,
    "recipient_name" text,
    "recipient_email" text,
    "status" text not null default 'pending_verification'::text,
    "proof_path" text,
    "admin_notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "service_slug" text,
    "admin_approved_at" timestamp with time zone,
    "fee_type_global" text,
    "image_url" text,
    "processed_by_user_id" uuid,
    "n8n_confidence" double precision,
    "n8n_response" text,
    "guest_name" text,
    "guest_email" text,
    "payment_method" text default 'zelle'::text,
    "visa_order_id" uuid,
    "coupon_code" text,
    "discount_amount" numeric(10,2)
      );


alter table "public"."zelle_payments" enable row level security;

drop type "public"."user_account_role__old_version_to_be_dropped";

alter table "public"."chat_messages" add column "is_closed" boolean default false;

alter table "public"."chat_messages" add column "type" text default 'text'::text;

alter table "public"."chat_messages" add column "user_service_id" uuid;

alter table "public"."notifications" alter column "created_at" set not null;

alter table "public"."notifications" alter column "email_sent" set not null;

alter table "public"."notifications" alter column "is_read" set not null;

alter table "public"."notifications" alter column "send_email" set not null;

alter table "public"."notifications" alter column "type" set default 'system'::text;

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);

CREATE INDEX idx_chat_messages_sender_role ON public.chat_messages USING btree (sender_role);

CREATE INDEX idx_chat_messages_service ON public.chat_messages USING btree (user_service_id);

CREATE INDEX idx_chat_messages_service_created ON public.chat_messages USING btree (user_service_id, created_at);

CREATE INDEX idx_chat_messages_user_service ON public.chat_messages USING btree (user_service_id);

CREATE INDEX idx_orders_parcelow_id ON public.orders USING btree (parcelow_order_id) WHERE (parcelow_order_id IS NOT NULL);

CREATE INDEX idx_orders_stripe_session ON public.orders USING btree (stripe_session_id) WHERE (stripe_session_id IS NOT NULL);

CREATE INDEX idx_orders_user_slug_status_created ON public.orders USING btree (user_id, product_slug, payment_status, created_at DESC);

CREATE UNIQUE INDEX process_logs_pkey ON public.process_logs USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX services_prices_pkey ON public.services_prices USING btree (id);

CREATE UNIQUE INDEX services_prices_service_id_key ON public.services_prices USING btree (service_id);

CREATE UNIQUE INDEX user_services_pkey ON public.user_services USING btree (id);

CREATE INDEX users_accounts_created_at_idx ON public.users_accounts USING btree (created_at DESC);

CREATE UNIQUE INDEX users_accounts_email_unique_idx ON public.users_accounts USING btree (lower(email)) WHERE (email IS NOT NULL);

CREATE UNIQUE INDEX users_accounts_pkey ON public.users_accounts USING btree (id);

CREATE INDEX users_accounts_role_idx ON public.users_accounts USING btree (role);

CREATE UNIQUE INDEX visa_orders_order_number_key ON public.orders USING btree (order_number);

CREATE UNIQUE INDEX visa_orders_parcelow_order_id_key ON public.orders USING btree (parcelow_order_id);

CREATE UNIQUE INDEX visa_orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX visa_orders_stripe_session_id_key ON public.orders USING btree (stripe_session_id);

CREATE UNIQUE INDEX zelle_payments_confirmation_code_key ON public.zelle_payments USING btree (confirmation_code);

CREATE UNIQUE INDEX zelle_payments_pkey ON public.zelle_payments USING btree (id);

alter table "public"."orders" add constraint "visa_orders_pkey" PRIMARY KEY using index "visa_orders_pkey";

alter table "public"."process_logs" add constraint "process_logs_pkey" PRIMARY KEY using index "process_logs_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."services_prices" add constraint "services_prices_pkey" PRIMARY KEY using index "services_prices_pkey";

alter table "public"."user_services" add constraint "user_services_pkey" PRIMARY KEY using index "user_services_pkey";

alter table "public"."users_accounts" add constraint "users_accounts_pkey" PRIMARY KEY using index "users_accounts_pkey";

alter table "public"."zelle_payments" add constraint "zelle_payments_pkey" PRIMARY KEY using index "zelle_payments_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_process_id_fkey" FOREIGN KEY (process_id) REFERENCES public.user_services(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_process_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_user_service_fk" FOREIGN KEY (user_service_id) REFERENCES public.user_services(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_user_service_fk";

alter table "public"."notifications" add constraint "notifications_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public.user_services(id) ON DELETE SET NULL not valid;

alter table "public"."notifications" validate constraint "notifications_service_id_fkey";

alter table "public"."orders" add constraint "visa_orders_order_number_key" UNIQUE using index "visa_orders_order_number_key";

alter table "public"."orders" add constraint "visa_orders_parcelow_order_id_key" UNIQUE using index "visa_orders_parcelow_order_id_key";

alter table "public"."orders" add constraint "visa_orders_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text]))) not valid;

alter table "public"."orders" validate constraint "visa_orders_payment_status_check";

alter table "public"."orders" add constraint "visa_orders_stripe_session_id_key" UNIQUE using index "visa_orders_stripe_session_id_key";

alter table "public"."payment_events" add constraint "payment_events_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL not valid;

alter table "public"."payment_events" validate constraint "payment_events_order_id_fkey";

alter table "public"."process_logs" add constraint "process_logs_user_service_id_fkey" FOREIGN KEY (user_service_id) REFERENCES public.user_services(id) ON DELETE CASCADE not valid;

alter table "public"."process_logs" validate constraint "process_logs_user_service_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."services_prices" add constraint "services_prices_service_id_key" UNIQUE using index "services_prices_service_id_key";

alter table "public"."user_services" add constraint "user_services_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'awaiting_review'::text, 'completed'::text, 'cancelled'::text, 'casvPaymentPending'::text, 'awaitingInterview'::text, 'casvFeeProcessing'::text, 'approved'::text, 'rejected'::text, 'paid'::text, 'awaiting_payment'::text, 'COS_CASE_FORM'::text, 'EOS_CASE_FORM'::text, 'COS_MOTION_IN_PROGRESS'::text, 'EOS_MOTION_IN_PROGRESS'::text, 'COS_RFE_IN_PROGRESS'::text, 'EOS_RFE_IN_PROGRESS'::text, 'COS_MOTION_SUBMITTED'::text, 'EOS_MOTION_SUBMITTED'::text, 'COS_ANALISE_PENDENTE'::text, 'EOS_ANALISE_PENDENTE'::text, 'RFE_CASE_FORM'::text, 'MOTION_CASE_FORM'::text, 'RFE_MOTION_IN_PROGRESS'::text, 'MOTION_MOTION_IN_PROGRESS'::text]))) not valid;

alter table "public"."user_services" validate constraint "user_services_status_check";

alter table "public"."user_services" add constraint "user_services_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_services" validate constraint "user_services_user_id_fkey";

alter table "public"."users_accounts" add constraint "users_accounts_avatar_offset_x_check" CHECK (((avatar_offset_x >= '-50'::integer) AND (avatar_offset_x <= 50))) not valid;

alter table "public"."users_accounts" validate constraint "users_accounts_avatar_offset_x_check";

alter table "public"."users_accounts" add constraint "users_accounts_avatar_offset_y_check" CHECK (((avatar_offset_y >= '-50'::integer) AND (avatar_offset_y <= 50))) not valid;

alter table "public"."users_accounts" validate constraint "users_accounts_avatar_offset_y_check";

alter table "public"."users_accounts" add constraint "users_accounts_avatar_zoom_check" CHECK (((avatar_zoom >= 0.80) AND (avatar_zoom <= 2.50))) not valid;

alter table "public"."users_accounts" validate constraint "users_accounts_avatar_zoom_check";

alter table "public"."users_accounts" add constraint "users_accounts_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users_accounts" validate constraint "users_accounts_id_fkey";

alter table "public"."zelle_payments" add constraint "zelle_payments_confirmation_code_key" UNIQUE using index "zelle_payments_confirmation_code_key";

alter table "public"."zelle_payments" add constraint "zelle_payments_processed_by_user_id_fkey" FOREIGN KEY (processed_by_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."zelle_payments" validate constraint "zelle_payments_processed_by_user_id_fkey";

alter table "public"."zelle_payments" add constraint "zelle_payments_status_check" CHECK ((status = ANY (ARRAY['pending_verification'::text, 'approved'::text, 'rejected'::text]))) not valid;

alter table "public"."zelle_payments" validate constraint "zelle_payments_status_check";

alter table "public"."zelle_payments" add constraint "zelle_payments_visa_order_id_fkey" FOREIGN KEY (visa_order_id) REFERENCES public.orders(id) not valid;

alter table "public"."zelle_payments" validate constraint "zelle_payments_visa_order_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.user_accounts (id, full_name, phone_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone_number', '')
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_status_notification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Verifica se o user_id existe antes de tentar inserir a notificação
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, read)
        VALUES (
            NEW.user_id, 
            'Atualização de Status', 
            'Seu processo mudou para: ' || NEW.status, 
            'status_update', 
            false
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Silencia o erro para não travar a atualização principal do serviço
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_user_service_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_actor_id   UUID;
  v_actor_name TEXT;
  v_actor_role TEXT;
  v_message    TEXT;
  v_action     TEXT;
BEGIN
  -- SÓ LOGA SE HOUVER MUDANÇA REAL NO PASSO OU NO STATUS
  IF (OLD.current_step IS DISTINCT FROM NEW.current_step) OR (OLD.status IS DISTINCT FROM NEW.status) THEN

    -- 1. Captura o Ator (Quem fez a mudança)
    v_actor_id := auth.uid();
    
    SELECT full_name, role 
      INTO v_actor_name, v_actor_role 
      FROM public.user_accounts 
     WHERE id = v_actor_id;

    -- Fallback para Sistema ou Cliente
    IF v_actor_name IS NULL THEN
      IF v_actor_id IS NULL THEN
         v_actor_name := 'Sistema';
         v_actor_role := 'system';
      ELSE
         SELECT full_name INTO v_actor_name FROM public.user_accounts WHERE id = NEW.user_id;
         v_actor_name := COALESCE(v_actor_name, 'Cliente');
         v_actor_role := 'client';
      END IF;
    END IF;

    -- 2. Constrói a Mensagem Baseada na Ação
    v_action := 'Alteração de Estado';
    
    -- Lógica de Mensagens Humanas
    IF OLD.status != NEW.status THEN
      CASE NEW.status
        WHEN 'awaiting_review' THEN 
          v_message := 'Cliente concluiu o preenchimento e solicitou revisão da equipe.';
          v_action := 'Solicitação de Revisão';
        WHEN 'active' THEN
          IF OLD.status = 'awaiting_review' THEN
            v_message := 'Administrador aprovou a etapa anterior. O processo agora está ativo para a próxima fase.';
            v_action := 'Etapa Aprovada';
          ELSE
            v_message := 'O status do processo foi definido como Ativo.';
          END IF;
        WHEN 'completed' THEN
          v_message := 'Processo finalizado com sucesso! Todas as etapas foram concluídas.';
          v_action := 'Conclusão';
        WHEN 'rejected' THEN
          v_message := 'O processo foi marcado como rejeitado ou ajustes críticos são necessários.';
          v_action := 'Rejeição';
        ELSE
          v_message := 'O status do processo mudou de ' || OLD.status || ' para ' || NEW.status || '.';
      END CASE;
    ELSIF OLD.current_step != NEW.current_step THEN
        v_message := 'Avanço de etapa: de ' || OLD.current_step || ' para ' || NEW.current_step || '.';
        v_action := 'Avanço de Etapa';
    ELSE
        v_message := 'Atualização geral nos dados do processo.';
    END IF;

    -- 3. Inserção do Log Rico
    INSERT INTO public.process_logs (
      user_service_id,
      actor_id,
      actor_name,
      actor_role,
      action,
      message,
      previous_step,
      new_step,
      previous_status,
      new_status,
      details,
      created_at
    ) VALUES (
      NEW.id,
      v_actor_id,
      v_actor_name,
      v_actor_role,
      v_action,
      v_message,
      OLD.current_step,
      NEW.current_step,
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'service_slug', NEW.service_slug,
        'timestamp', NOW()
      ),
      NOW()
    );

  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_user_service_notification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Só tenta inserir se o user_id for um UUID válido e não nulo
  IF (NEW.user_id IS NOT NULL) THEN
    BEGIN
      -- Tenta inserir a notificação na tabela notifications
      -- Se a tabela de notificações tiver uma coluna de user_id que referencia auth.users,
      -- este bloco vai garantir que o erro de chave estrangeira não trave o sistema.
      INSERT INTO public.notifications (
        user_id, 
        title, 
        message, 
        type, 
        read
      )
      VALUES (
        NEW.user_id, 
        'Atualização do Processo', 
        'O status do seu visto foi alterado para: ' || NEW.status, 
        'status_update', 
        false
      );
    EXCEPTION 
      WHEN foreign_key_violation THEN
        -- Se o user_id não existir na tabela de usuários de destino, ignoramos silenciosamente
        -- para que o status do visto seja atualizado mesmo assim.
        RAISE WARNING 'Aviso: Notificação ignorada pois o user_id % não foi encontrado.', NEW.user_id;
        RETURN NEW;
      WHEN OTHERS THEN
        -- Captura qualquer outro erro inesperado e permite o progresso do sistema
        RETURN NEW;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_user_service_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_actor_name text;
BEGIN
  -- Only log if status actually changed
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    
    -- Try to get the name of the user making the change
    IF auth.uid() IS NOT NULL THEN
      SELECT full_name INTO v_actor_name FROM profiles WHERE id = auth.uid();
    END IF;
    
    IF v_actor_name IS NULL THEN
      v_actor_name := 'Sistema';
    END IF;

    -- Insert log entry
    INSERT INTO process_logs (
      user_service_id,
      actor_id,
      actor_name,
      action_type,
      previous_status,
      new_status
    ) VALUES (
      NEW.id,
      auth.uid(),
      v_actor_name,
      'status_change',
      OLD.status,
      NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_send_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.send_email = true THEN
    PERFORM net.http_post(
      url:='https://nkhblkilekfpqhyuhrrj.supabase.co/functions/v1/send-notification-email',
      body:=jsonb_build_object('type', TG_OP, 'table', TG_TABLE_NAME, 'record', row_to_json(NEW))
    );
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_process_services_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create or replace view "public"."user_accounts" as  SELECT id,
    (role)::text AS role,
    email,
    name AS full_name,
    phone AS phone_number,
    profile_url AS avatar_url,
    passport_photo_url,
    NULL::text AS preferred_language,
    is_active,
    terms_accepted_at,
    last_sign_in_at,
    created_at,
    updated_at,
    avatar_offset_x,
    avatar_offset_y,
    avatar_zoom
   FROM public.users_accounts;


CREATE OR REPLACE FUNCTION public.can_login_with_email(p_email text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.users_accounts ua
    where lower(ua.email) = lower(trim(p_email))
      and ua.is_active = true
  );
$function$
;

CREATE OR REPLACE FUNCTION public.chat_is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.user_accounts
    where id = auth.uid() and role = 'admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.chat_owns_process(p_process_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.user_services
    where id = p_process_id and user_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.current_user_role()
 RETURNS public.user_account_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select role from public.users_accounts where id = auth.uid() $function$
;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare inferred_name text;
begin
  inferred_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(new.email, 'user'), '@', 1)
  );

  insert into public.users_accounts (id, email, name, profile_url, phone, last_sign_in_at)
  values (
    new.id,
    new.email,
    inferred_name,
    coalesce(nullif(new.raw_user_meta_data ->> 'profile_url', ''), nullif(new.raw_user_meta_data ->> 'avatar_url', '')),
    coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), nullif(new.raw_user_meta_data ->> 'phone_number', '')),
    new.last_sign_in_at
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = excluded.name,
    profile_url = coalesce(excluded.profile_url, public.users_accounts.profile_url),
    phone = coalesce(excluded.phone, public.users_accounts.phone),
    last_sign_in_at = excluded.last_sign_in_at;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select coalesce(public.current_user_role() in ('admin', 'master'), false) $function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ begin new.updated_at = timezone('utc', now()); return new; end; $function$
;

CREATE OR REPLACE FUNCTION public.update_user_accounts_view()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  next_role public.user_account_role;
begin
  next_role := case
    when new.role is null or new.role = '' then old.role::public.user_account_role
    else new.role::public.user_account_role
  end;

  update public.users_accounts
     set role = next_role,
         is_active = coalesce(new.is_active, old.is_active),
         name = new.full_name,
         phone = new.phone_number,
         profile_url = new.avatar_url,
         avatar_offset_x = coalesce(new.avatar_offset_x, old.avatar_offset_x),
         avatar_offset_y = coalesce(new.avatar_offset_y, old.avatar_offset_y),
         avatar_zoom = coalesce(new.avatar_zoom, old.avatar_zoom),
         passport_photo_url = new.passport_photo_url,
         updated_at = now()
   where id = old.id;
  return new;
end;
$function$
;

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."process_logs" to "anon";

grant insert on table "public"."process_logs" to "anon";

grant references on table "public"."process_logs" to "anon";

grant select on table "public"."process_logs" to "anon";

grant trigger on table "public"."process_logs" to "anon";

grant truncate on table "public"."process_logs" to "anon";

grant update on table "public"."process_logs" to "anon";

grant delete on table "public"."process_logs" to "authenticated";

grant insert on table "public"."process_logs" to "authenticated";

grant references on table "public"."process_logs" to "authenticated";

grant select on table "public"."process_logs" to "authenticated";

grant trigger on table "public"."process_logs" to "authenticated";

grant truncate on table "public"."process_logs" to "authenticated";

grant update on table "public"."process_logs" to "authenticated";

grant delete on table "public"."process_logs" to "service_role";

grant insert on table "public"."process_logs" to "service_role";

grant references on table "public"."process_logs" to "service_role";

grant select on table "public"."process_logs" to "service_role";

grant trigger on table "public"."process_logs" to "service_role";

grant truncate on table "public"."process_logs" to "service_role";

grant update on table "public"."process_logs" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."services_prices" to "anon";

grant insert on table "public"."services_prices" to "anon";

grant references on table "public"."services_prices" to "anon";

grant select on table "public"."services_prices" to "anon";

grant trigger on table "public"."services_prices" to "anon";

grant truncate on table "public"."services_prices" to "anon";

grant update on table "public"."services_prices" to "anon";

grant delete on table "public"."services_prices" to "authenticated";

grant insert on table "public"."services_prices" to "authenticated";

grant references on table "public"."services_prices" to "authenticated";

grant select on table "public"."services_prices" to "authenticated";

grant trigger on table "public"."services_prices" to "authenticated";

grant truncate on table "public"."services_prices" to "authenticated";

grant update on table "public"."services_prices" to "authenticated";

grant delete on table "public"."services_prices" to "service_role";

grant insert on table "public"."services_prices" to "service_role";

grant references on table "public"."services_prices" to "service_role";

grant select on table "public"."services_prices" to "service_role";

grant trigger on table "public"."services_prices" to "service_role";

grant truncate on table "public"."services_prices" to "service_role";

grant update on table "public"."services_prices" to "service_role";

grant delete on table "public"."user_services" to "anon";

grant insert on table "public"."user_services" to "anon";

grant references on table "public"."user_services" to "anon";

grant select on table "public"."user_services" to "anon";

grant trigger on table "public"."user_services" to "anon";

grant truncate on table "public"."user_services" to "anon";

grant update on table "public"."user_services" to "anon";

grant delete on table "public"."user_services" to "authenticated";

grant insert on table "public"."user_services" to "authenticated";

grant references on table "public"."user_services" to "authenticated";

grant select on table "public"."user_services" to "authenticated";

grant trigger on table "public"."user_services" to "authenticated";

grant truncate on table "public"."user_services" to "authenticated";

grant update on table "public"."user_services" to "authenticated";

grant delete on table "public"."user_services" to "service_role";

grant insert on table "public"."user_services" to "service_role";

grant references on table "public"."user_services" to "service_role";

grant select on table "public"."user_services" to "service_role";

grant trigger on table "public"."user_services" to "service_role";

grant truncate on table "public"."user_services" to "service_role";

grant update on table "public"."user_services" to "service_role";

grant delete on table "public"."users_accounts" to "anon";

grant insert on table "public"."users_accounts" to "anon";

grant select on table "public"."users_accounts" to "anon";

grant update on table "public"."users_accounts" to "anon";

grant delete on table "public"."users_accounts" to "authenticated";

grant insert on table "public"."users_accounts" to "authenticated";

grant select on table "public"."users_accounts" to "authenticated";

grant update on table "public"."users_accounts" to "authenticated";

grant delete on table "public"."users_accounts" to "service_role";

grant insert on table "public"."users_accounts" to "service_role";

grant select on table "public"."users_accounts" to "service_role";

grant update on table "public"."users_accounts" to "service_role";

grant delete on table "public"."zelle_payments" to "anon";

grant insert on table "public"."zelle_payments" to "anon";

grant references on table "public"."zelle_payments" to "anon";

grant select on table "public"."zelle_payments" to "anon";

grant trigger on table "public"."zelle_payments" to "anon";

grant truncate on table "public"."zelle_payments" to "anon";

grant update on table "public"."zelle_payments" to "anon";

grant delete on table "public"."zelle_payments" to "authenticated";

grant insert on table "public"."zelle_payments" to "authenticated";

grant references on table "public"."zelle_payments" to "authenticated";

grant select on table "public"."zelle_payments" to "authenticated";

grant trigger on table "public"."zelle_payments" to "authenticated";

grant truncate on table "public"."zelle_payments" to "authenticated";

grant update on table "public"."zelle_payments" to "authenticated";

grant delete on table "public"."zelle_payments" to "service_role";

grant insert on table "public"."zelle_payments" to "service_role";

grant references on table "public"."zelle_payments" to "service_role";

grant select on table "public"."zelle_payments" to "service_role";

grant trigger on table "public"."zelle_payments" to "service_role";

grant truncate on table "public"."zelle_payments" to "service_role";

grant update on table "public"."zelle_payments" to "service_role";


  create policy "Admin full access"
  on "public"."discount_coupons"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.user_accounts
  WHERE ((user_accounts.id = auth.uid()) AND (user_accounts.role = 'admin'::text)))));



  create policy "Users can insert admin notifications"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check (((target_role = 'admin'::text) OR public.is_admin()));



  create policy "Users can update their own notifications or admins can update a"
  on "public"."notifications"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) OR ((target_role = 'admin'::text) AND public.is_admin())))
with check (((auth.uid() = user_id) OR ((target_role = 'admin'::text) AND public.is_admin())));



  create policy "Users can view their own notifications or admins can view admin"
  on "public"."notifications"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR ((target_role = 'admin'::text) AND public.is_admin())));



  create policy "admins_can_update_admin_notifications"
  on "public"."notifications"
  as permissive
  for update
  to authenticated
using (((target_role = 'admin'::text) AND public.is_admin()))
with check (((target_role = 'admin'::text) AND public.is_admin()));



  create policy "admins_see_admin_notifications"
  on "public"."notifications"
  as permissive
  for select
  to authenticated
using (((target_role = 'admin'::text) AND public.is_admin()));



  create policy "Admin e donos podem ver pedidos"
  on "public"."orders"
  as permissive
  for select
  to public
using (true);



  create policy "Customer can insert own visa_orders"
  on "public"."orders"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "Customer can update own visa_orders"
  on "public"."orders"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()));



  create policy "Permitir leitura pública por ID (para página de sucesso)"
  on "public"."orders"
  as permissive
  for select
  to public
using (true);



  create policy "Usuários podem atualizar seus próprios pedidos"
  on "public"."orders"
  as permissive
  for update
  to authenticated
using (((auth.uid() = user_id) OR (client_email = ( SELECT profiles.email
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))))
with check (((auth.uid() = user_id) OR (client_email = ( SELECT profiles.email
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))));



  create policy "Usuários podem criar seus próprios pedidos"
  on "public"."orders"
  as permissive
  for insert
  to authenticated
with check (((auth.uid() = user_id) OR (client_email = ( SELECT profiles.email
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))));



  create policy "admins can read visa_orders"
  on "public"."orders"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "Usuários podem atualizar o próprio perfil"
  on "public"."profiles"
  as permissive
  for update
  to public
using (((auth.uid() = id) OR public.is_admin()))
with check (((auth.uid() = id) OR public.is_admin()));



  create policy "Usuários podem ver o próprio perfil"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((auth.uid() = id) OR public.is_admin()));



  create policy "Leitura de preços por usuários autenticados"
  on "public"."services_prices"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Admins can update all user services"
  on "public"."user_services"
  as permissive
  for update
  to public
using ((public.is_admin() OR (auth.uid() = user_id)))
with check ((public.is_admin() OR (auth.uid() = user_id)));



  create policy "Admins can view all user services"
  on "public"."user_services"
  as permissive
  for select
  to public
using ((public.is_admin() OR (auth.uid() = user_id)));



  create policy "Usuários podem atualizar seus próprios serviços"
  on "public"."user_services"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) OR public.is_admin()))
with check (((auth.uid() = user_id) OR public.is_admin()));



  create policy "Usuários podem criar seus próprios serviços"
  on "public"."user_services"
  as permissive
  for insert
  to public
with check (((auth.uid() = user_id) OR public.is_admin()));



  create policy "Usuários podem inserir seus próprios serviços"
  on "public"."user_services"
  as permissive
  for insert
  to public
with check (((auth.uid() = user_id) OR public.is_admin()));



  create policy "Usuários podem ver seus próprios serviços"
  on "public"."user_services"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR public.is_admin()));



  create policy "n8n_node_read_access_services"
  on "public"."user_services"
  as permissive
  for select
  to anon
using (true);



  create policy "users can insert own services"
  on "public"."user_services"
  as permissive
  for insert
  to public
with check (((auth.uid() = user_id) OR public.is_admin()));



  create policy "users can read own services"
  on "public"."user_services"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR public.is_admin()));



  create policy "only active users can select"
  on "public"."users_accounts"
  as permissive
  for select
  to authenticated
using ((is_active = true));



  create policy "users_accounts_delete_admin_only"
  on "public"."users_accounts"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "users_accounts_insert_own_or_admin"
  on "public"."users_accounts"
  as permissive
  for insert
  to authenticated
with check (((auth.uid() = id) OR public.is_admin()));



  create policy "users_accounts_select_own_or_admin"
  on "public"."users_accounts"
  as permissive
  for select
  to authenticated
using (((auth.uid() = id) OR public.is_admin()));



  create policy "users_accounts_update_own_or_admin"
  on "public"."users_accounts"
  as permissive
  for update
  to authenticated
using (((auth.uid() = id) OR public.is_admin()))
with check ((public.is_admin() OR ((auth.uid() = id) AND (role = public.current_user_role()))));



  create policy "Admins and service role full access"
  on "public"."zelle_payments"
  as permissive
  for all
  to service_role, authenticated
using (((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text) OR (auth.role() = 'service_role'::text)));



  create policy "Enable insert for everyone"
  on "public"."zelle_payments"
  as permissive
  for insert
  to public
with check (true);



  create policy "Service role bypasses RLS on zelle payments"
  on "public"."zelle_payments"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "Users can view their own payments"
  on "public"."zelle_payments"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "Usuários podem ver seus próprios pagamentos Zelle"
  on "public"."zelle_payments"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "authenticated_can_insert"
  on "public"."notifications"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() IS NOT NULL));



  create policy "clients_can_update_own_notifications"
  on "public"."notifications"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "clients_see_own_notifications"
  on "public"."notifications"
  as permissive
  for select
  to authenticated
using (((target_role = 'client'::text) AND (user_id = auth.uid())));


CREATE TRIGGER tr_send_notification_email AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.notify_send_email();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_user_accounts INSTEAD OF UPDATE ON public.user_accounts FOR EACH ROW EXECUTE FUNCTION public.update_user_accounts_view();

CREATE TRIGGER tr_log_user_service_changes AFTER UPDATE ON public.user_services FOR EACH ROW EXECUTE FUNCTION public.log_user_service_changes();

CREATE TRIGGER tr_log_user_service_notification AFTER UPDATE OF status ON public.user_services FOR EACH ROW EXECUTE FUNCTION public.log_user_service_notification();

CREATE TRIGGER tr_log_user_service_status_change AFTER UPDATE ON public.user_services FOR EACH ROW EXECUTE FUNCTION public.log_user_service_status_change();

CREATE TRIGGER set_users_accounts_updated_at BEFORE UPDATE ON public.users_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_sync_profile_from_users_account AFTER INSERT OR UPDATE OF name, email, phone, profile_url, passport_photo_url, updated_at ON public.users_accounts FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_users_account();

drop schema if exists "aplikei";

drop trigger if exists "on_auth_user_created_users_accounts" on "auth"."users";

drop trigger if exists "on_auth_user_updated_users_accounts" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_users_accounts AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE TRIGGER on_auth_user_updated_users_accounts AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_users_accounts();

drop policy "aplikei_profiles_delete_own_or_admin" on "storage"."objects";

drop policy "aplikei_profiles_insert_own_or_admin" on "storage"."objects";

drop policy "aplikei_profiles_update_own_or_admin" on "storage"."objects";


  create policy "Admin download templates"
  on "storage"."objects"
  as permissive
  for select
  to service_role
using ((bucket_id = 'templates'::text));



  create policy "Admin update process documents"
  on "storage"."objects"
  as permissive
  for update
  to service_role
using ((bucket_id = 'process-documents'::text));



  create policy "Admin upload to documents"
  on "storage"."objects"
  as permissive
  for insert
  to service_role
with check (((bucket_id = 'documents'::text) OR (bucket_id = 'process-documents'::text)));



  create policy "Admins can manage process-documents objects"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
using (((bucket_id = 'process-documents'::text) AND public.is_admin()))
with check (((bucket_id = 'process-documents'::text) AND public.is_admin()));



  create policy "Admins podem ver documentos do processo"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'process-documents'::text) AND public.is_admin()));



  create policy "Allow insert on zelle_comprovantes"
  on "storage"."objects"
  as permissive
  for insert
  to anon, authenticated
with check ((bucket_id = 'zelle_comprovantes'::text));



  create policy "Allow public read zelle_comprovantes"
  on "storage"."objects"
  as permissive
  for select
  to anon, authenticated
using ((bucket_id = 'zelle_comprovantes'::text));



  create policy "Anon users can upload contract selfies"
  on "storage"."objects"
  as permissive
  for insert
  to anon
with check (((bucket_id = 'visa-documents'::text) AND ((storage.foldername(name))[1] = 'contracts'::text)));



  create policy "Authenticated Insert"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'zelle_comprovantes'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Authenticated users can upload visa documents"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'visa-documents'::text));



  create policy "Fotos de perfil são públicas"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profiles'::text));



  create policy "Owner Access"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'zelle_comprovantes'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Public Read Access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'zelle_comprovantes'::text));



  create policy "Public read access for visa documents"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'visa-documents'::text));



  create policy "Service role full access to visa documents"
  on "storage"."objects"
  as permissive
  for all
  to service_role
using ((bucket_id = 'visa-documents'::text))
with check ((bucket_id = 'visa-documents'::text));



  create policy "Users can manage their own process-documents"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'process-documents'::text) AND ((auth.uid() = owner) OR (auth.role() = 'authenticated'::text))))
with check (((bucket_id = 'process-documents'::text) AND ((auth.uid() = owner) OR (auth.role() = 'authenticated'::text))));



  create policy "Usuários podem atualizar a própria foto"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuários podem atualizar seus próprios documentos"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'documents'::text) AND (auth.role() = 'authenticated'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuários podem dar upload em documentos do processo"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'process-documents'::text));



  create policy "Usuários podem deletar a própria foto"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuários podem deletar seus próprios documentos"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'documents'::text) AND (auth.role() = 'authenticated'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuários podem enviar seus próprios documentos"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'documents'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuários podem fazer upload da própria foto"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuários podem fazer upload de seus próprios comprovantes"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'zelle_comprovantes'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuários podem ver seus documentos do processo"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'process-documents'::text) AND (EXISTS ( SELECT 1
   FROM public.user_services
  WHERE (((user_services.id)::text = (storage.foldername(objects.name))[1]) AND (user_services.user_id = auth.uid()))))));



  create policy "Usuários podem ver seus próprios comprovantes"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'zelle_comprovantes'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuários podem ver seus próprios documentos"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'documents'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "profiles_bucket_admin_manage_all"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
using (((bucket_id = 'profiles'::text) AND public.is_admin()))
with check (((bucket_id = 'profiles'::text) AND public.is_admin()));



  create policy "profiles_bucket_public_read"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profiles'::text));



  create policy "profiles_bucket_user_delete_own_folder"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'profiles'::text) AND (split_part(name, '/'::text, 1) = (auth.uid())::text)));



  create policy "profiles_bucket_user_insert_own_folder"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'profiles'::text) AND (split_part(name, '/'::text, 1) = (auth.uid())::text)));



  create policy "profiles_bucket_user_update_own_folder"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'profiles'::text) AND (split_part(name, '/'::text, 1) = (auth.uid())::text)))
with check (((bucket_id = 'profiles'::text) AND (split_part(name, '/'::text, 1) = (auth.uid())::text)));



  create policy "tmp_profiles_delete_all"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'profiles'::text));



  create policy "tmp_profiles_insert_all"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'profiles'::text));



  create policy "tmp_profiles_read_all"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profiles'::text));



  create policy "tmp_profiles_update_all"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'profiles'::text))
with check ((bucket_id = 'profiles'::text));



  create policy "aplikei_profiles_delete_own_or_admin"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'aplikei-profiles'::text) AND (public.is_admin() OR ((storage.foldername(name))[1] = (auth.uid())::text))));



  create policy "aplikei_profiles_insert_own_or_admin"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'aplikei-profiles'::text) AND (public.is_admin() OR ((storage.foldername(name))[1] = (auth.uid())::text))));



  create policy "aplikei_profiles_update_own_or_admin"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'aplikei-profiles'::text) AND (public.is_admin() OR ((storage.foldername(name))[1] = (auth.uid())::text))))
with check (((bucket_id = 'aplikei-profiles'::text) AND (public.is_admin() OR ((storage.foldername(name))[1] = (auth.uid())::text))));


