import { CHAMPION_LANE_ROLES } from "./championLaneRoles";

export const LANE_ROLE_IDS = new Set(["top", "jungle", "mid", "adc", "support"]);

export const ROLE_ALIASES: Record<string, string> = {
  top: "top",
  toplane: "top",
  jgl: "jungle",
  jungle: "jungle",
  mid: "mid",
  middle: "mid",
  adc: "adc",
  bot: "adc",
  bottom: "adc",
  supp: "support",
  support: "support",
};

export function normalizeLaneRole(role: string | null | undefined): string | null {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();
  return ROLE_ALIASES[normalized] ?? normalized;
}

export function isLaneRoleList(roles: string[]): boolean {
  return roles.some((role) => LANE_ROLE_IDS.has(normalizeLaneRole(role) ?? ""));
}

export function resolveChampionLaneRoles(
  championName: string,
  relationRoles: string[],
  directRoles: string[],
): string[] {
  if (relationRoles.length > 0) return relationRoles;
  if (directRoles.length > 0 && isLaneRoleList(directRoles)) return directRoles;
  return CHAMPION_LANE_ROLES[championName] ?? [];
}

export function championMatchesLaneFilter(
  championRoles: string[] | null | undefined,
  laneId: string,
): boolean {
  const normalizedLane = normalizeLaneRole(laneId);
  if (!normalizedLane) return true;

  const normalizedChampionRoles = (championRoles ?? [])
    .map((role) => normalizeLaneRole(role))
    .filter(Boolean) as string[];

  return normalizedChampionRoles.includes(normalizedLane);
}
