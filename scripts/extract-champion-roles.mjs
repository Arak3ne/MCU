import fs from "fs";

const sql = fs.readFileSync(
  new URL("../supabase/migrations/20260423000002_populate_champion_roles.sql", import.meta.url),
  "utf8",
);
const re = /\('([^']*(?:''[^']*)*)',\s*ARRAY\[([^\]]+)\]\)/g;
const map = {};
let m;
while ((m = re.exec(sql)) !== null) {
  const name = m[1].replace(/''/g, "'");
  const roles = m[2].split(",").map((r) => r.trim().replace(/^'|'$/g, ""));
  map[name] = roles;
}

const out = `// Generated from supabase/migrations/20260423000002_populate_champion_roles.sql\nexport const CHAMPION_LANE_ROLES: Record<string, string[]> = ${JSON.stringify(map, null, 2)};\n`;
fs.writeFileSync(new URL("../src/lib/championLaneRoles.ts", import.meta.url), out);
console.log(`Wrote ${Object.keys(map).length} champions`);
