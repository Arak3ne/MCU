import { supabase } from "./supabase";
import type { Database } from "../types/supabase";

export function subscribeToTable(
  table: keyof Database["public"]["Tables"],
  callback: (payload: any) => void
) {
  return supabase
    .channel(`public:${table}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: table },
      (payload) => callback(payload)
    )
    .subscribe();
}
