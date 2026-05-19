export type PowerRankingCategoryId =
  | 'skill'
  | 'champion_pool'
  | 'teamplay'
  | 'mental'
  | 'global';

export const POWER_RANKING_CATEGORIES: {
  id: PowerRankingCategoryId;
  label: string;
  column: string;
}[] = [
  { id: 'skill', label: 'Skill', column: 'tier_skill' },
  { id: 'champion_pool', label: 'Champion Pool', column: 'tier_champion_pool' },
  { id: 'teamplay', label: 'Teamplay', column: 'tier_teamplay' },
  { id: 'mental', label: 'Mental', column: 'tier_mental' },
  { id: 'global', label: 'Global', column: 'fantasy_tier' },
];

export const POWER_RANKING_TIERS = [
  { id: 'S', color: '#f97316' },
  { id: 'A', color: '#eab308' },
  { id: 'B', color: '#22c55e' },
  { id: 'C', color: '#3b82f6' },
  { id: 'D', color: '#8b5cf6' },
] as const;

export type PowerRankingTierId = (typeof POWER_RANKING_TIERS)[number]['id'] | 'Unranked';

export function getPowerRankingColumn(categoryId: PowerRankingCategoryId): string {
  return POWER_RANKING_CATEGORIES.find((c) => c.id === categoryId)?.column ?? 'fantasy_tier';
}

export type PowerRankingLetterTier = Exclude<PowerRankingTierId, 'Unranked'>;

export function normalizePowerRankingTier(
  raw: string | null | undefined
): PowerRankingLetterTier | null {
  const val = String(raw ?? '').toUpperCase().trim();
  if (!val) return null;
  if (val === 'G') return 'S';
  if (val === 'S' || val === 'A' || val === 'B' || val === 'C' || val === 'D') {
    return val;
  }
  return null;
}

export function getPowerRankingTierColor(tier: string | null | undefined): string {
  const normalized = normalizePowerRankingTier(tier);
  if (!normalized) return '#6b7280';
  return POWER_RANKING_TIERS.find((t) => t.id === normalized)?.color ?? '#6b7280';
}

export function getPlayerTierForCategory(
  player: Record<string, unknown>,
  categoryId: PowerRankingCategoryId
): PowerRankingLetterTier | null {
  const col = getPowerRankingColumn(categoryId);
  return normalizePowerRankingTier(String(player[col] ?? ''));
}

export function distributePlayersByTier<T extends Record<string, unknown>>(
  players: T[],
  categoryId: PowerRankingCategoryId
): Record<PowerRankingTierId, T[]> {
  const col = getPowerRankingColumn(categoryId);
  const groups: Record<PowerRankingTierId, T[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    Unranked: [],
  };

  for (const p of players) {
    let tierVal = String((p as Record<string, unknown>)[col] ?? '')
      .toUpperCase()
      .trim();
    if (tierVal === 'G') tierVal = 'S';
    if (tierVal && tierVal in groups && tierVal !== 'Unranked') {
      groups[tierVal as PowerRankingTierId].push(p);
    } else {
      groups.Unranked.push(p);
    }
  }

  for (const tier of POWER_RANKING_TIERS) {
    groups[tier.id].sort((a, b) =>
      String((a as { pseudo?: string }).pseudo ?? '').localeCompare(
        String((b as { pseudo?: string }).pseudo ?? '')
      )
    );
  }
  groups.Unranked.sort((a, b) =>
    String((a as { pseudo?: string }).pseudo ?? '').localeCompare(
      String((b as { pseudo?: string }).pseudo ?? '')
    )
  );

  return groups;
}
