import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key to bypass RLS, or fallback to anon key for testing
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

// Bypass RLS using service role key (if provided)
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Fetching champions from Data Dragon...");
  const versionRes = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json",
  );
  const versions = await versionRes.json();
  const latestVersion = versions[0];

  console.log(`Using LoL Patch Version: ${latestVersion}`);

  const champsRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`,
  );
  const champsData = await champsRes.json();
  const champions = champsData.data;

  const insertData = Object.values(champions).map((champ: any) => ({
    name: champ.name,
    image_url: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.image.full}`,
    is_available: true,
    roles: champ.tags,
  }));

  console.log(`Found ${insertData.length} champions. Inserting...`);

  // Split into chunks of 50 to avoid request limits
  const chunkSize = 50;
  for (let i = 0; i < insertData.length; i += chunkSize) {
    const chunk = insertData.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("champions")
      .upsert(chunk, { onConflict: "name" }); // Prevent duplicates if ran multiple times

    if (error) {
      console.error("Error inserting chunk:", error);
      console.error(
        "If this is an RLS error, make sure to add SUPABASE_SERVICE_ROLE_KEY to your .env file",
      );
      process.exit(1);
    }
  }

  console.log("Successfully seeded all champions!");
}

seed();
