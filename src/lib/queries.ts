import { supabase } from "./supabase";
import { Database } from "../types/supabase";

type Champion = Database["public"]["Tables"]["champions"]["Row"];

export async function getChampions() {
  const { data, error } = await supabase
    .from("champions")
    .select("*")
    .order("name");

  return { data: data as Champion[] | null, error };
}

export async function toggleChampion(id: string, isAvailable: boolean) {
  const { data, error } = await supabase
    .from("champions")
    .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
    .eq("id", id);

  return { data, error };
}
