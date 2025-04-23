
import { supabase } from "@/integrations/supabase/client";

/**
 * Extracted access token fetch to avoid cross-file mutations and repetition.
 */
export async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  // Fix: In supabase-js v2, the current session is at data.session NOT data.session.session
  return data?.session?.access_token || "";
}
