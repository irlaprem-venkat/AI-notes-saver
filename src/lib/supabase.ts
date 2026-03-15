import { createBrowserClient } from '@supabase/ssr'

// This browser client stores sessions in COOKIES (not localStorage)
// so that the server-side middleware can read the session correctly.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
