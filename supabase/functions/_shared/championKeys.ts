/** Data Dragon–style IDs expected by api.drafter.lol — keep in sync with generate-draft */

export function nameToDrafterChampionId(name: string): string {
  if (name === "Wukong") return "MonkeyKing"
  if (name === "Renata Glasc") return "Renata"
  if (name === "Nunu & Willump") return "Nunu"
  if (name === "Kog'Maw") return "KogMaw"
  if (name === "Rek'Sai") return "RekSai"
  if (name === "K'Sante") return "KSante"
  if (name === "Bel'Veth") return "Belveth"
  if (name === "Kai'Sa") return "Kaisa"
  if (name === "Kha'Zix") return "Khazix"
  if (name === "Cho'Gath") return "Chogath"
  if (name === "Vel'Koz") return "Velkoz"
  if (name === "LeBlanc") return "Leblanc"
  return name.replace(/[^a-zA-Z0-9]/g, "")
}

export type ChampionPickRow = {
  id: string
  name: string
  ddragon_key?: string | null
  image_url?: string | null
}

/** All aliases that might appear in Drafter `draftData.bluePick*` / picks arrays */
export function collectKeyAliases(row: ChampionPickRow): Set<string> {
  const aliases = new Set<string>()

  if (row.ddragon_key?.trim()) {
    aliases.add(row.ddragon_key.trim())
  }

  aliases.add(nameToDrafterChampionId(row.name))

  const stripped = row.name.replace(/[^a-zA-Z0-9]/g, "")
  if (stripped) aliases.add(stripped)

  aliases.add(row.name)

  if (row.image_url) {
    try {
      const parts = row.image_url.split("/")
      const file = parts[parts.length - 1] ?? ""
      const base = file.replace(/\.(png|jpg|webp)$/i, "")
      if (base) aliases.add(base)
    } catch {
      /* ignore */
    }
  }

  return aliases
}

export function rowMatchesAnyPick(row: ChampionPickRow, picks: Set<string>): boolean {
  const aliases = collectKeyAliases(row)
  for (const p of picks) {
    if (!p) continue
    if (aliases.has(p)) return true
  }
  return false
}

export function picksWithNoChampionRow(
  picks: string[],
  allRows: ChampionPickRow[],
): string[] {
  const set = new Set(picks.filter(Boolean))
  const unmatched: string[] = []
  for (const p of set) {
    const found = allRows.some((r) => rowMatchesAnyPick(r, new Set([p])))
    if (!found) unmatched.push(p)
  }
  return unmatched
}
