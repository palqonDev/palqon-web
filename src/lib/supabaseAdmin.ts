import { createClient } from "@supabase/supabase-js"

// Client amministrativo per operazioni server-side (webhook, cron, API routes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
