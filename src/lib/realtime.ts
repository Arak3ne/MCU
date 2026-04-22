import { supabase } from "./supabase";
import { Database } from "../types/supabase";

type Champion = Database["public"]["Tables"]["champions"]["Row"];

export function subscribeToChampions(
  callback: (payload: { new: Champion }) => void,
) {
  return supabase
    .channel("public:champions")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "champions",
      },
      (payload) => {
        // payload.new contains the updated row data
        callback(payload as any);
      },
    )
    .subscribe();
}
