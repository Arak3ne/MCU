import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Accès admin si :
 * - Dashboard Supabase → Authentication → utilisateur → `app_metadata` : `{ "role": "admin" }`, ou
 * - `.env` : `VITE_MCU_ADMIN_EMAIL` = email exact du compte Auth (pratique sans toucher aux métadonnées).
 */
export function isMcuAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.app_metadata?.role === "admin") return true;
  const allow = import.meta.env.VITE_MCU_ADMIN_EMAIL as string | undefined;
  if (allow?.trim()) {
    const normalized = allow.trim().toLowerCase();
    const email = user.email?.trim().toLowerCase();
    if (email && email === normalized) return true;
  }
  return false;
}

export async function getMcuAdminSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user || !isMcuAdminUser(session.user)) return null;
  return session;
}
