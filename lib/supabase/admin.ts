import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/** service role キーで RLS を回避するサーバー専用クライアント（ブラウザに公開しないこと） */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
