/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_FUNCTIONS_URL?: string;
  readonly VITE_SITE_IS_PROD?: string;
  readonly VITE_HOMOLOGATION_AUTOFILL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
