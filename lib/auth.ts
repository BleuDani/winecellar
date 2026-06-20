import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Deduped per-request: every Server Component/Server Action in the same render
// that calls this reuses one Supabase Auth round trip instead of making its own.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getUserId = cache(async () => {
  const user = await getCurrentUser();
  return user?.id ?? null;
});
