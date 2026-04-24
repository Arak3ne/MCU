import { supabase } from "./supabase";
import type { Database } from "../types/supabase";

export async function registerPlayer(playerData: Database["public"]["Tables"]["players"]["Insert"]) {
  const { data, error } = await supabase
    .from("players")
    .insert(playerData)
    .select()
    .single();

  return { data, error };
}
