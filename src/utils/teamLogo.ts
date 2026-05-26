const STATIC_ASSET_SLUGS = new Set([
  'adc',
  'top',
  'jgl',
  'mid',
  'support',
  'mcu_logo',
  'mcu_coins',
  'hero',
  'vite',
  'vue',
]);

const logoModules = import.meta.glob<string>('../assets/*.{png,webp}', {
  eager: true,
  import: 'default',
});

const logoBySlug = new Map<string, string>();
for (const [path, url] of Object.entries(logoModules)) {
  const match = path.match(/\/([^/]+)\.(png|webp)$/i);
  if (!match) continue;
  const slug = match[1];
  if (!STATIC_ASSET_SLUGS.has(slug)) {
    logoBySlug.set(slug, url);
  }
}

export function slugifyTeamName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getTeamLogoUrl(teamName: string | null | undefined): string | null {
  if (!teamName?.trim()) return null;
  return logoBySlug.get(slugifyTeamName(teamName)) ?? null;
}

export function hasTeamLogo(teamName: string | null | undefined): boolean {
  return !!getTeamLogoUrl(teamName);
}

export function getTeamInitials(
  teamName: string | null | undefined,
  length: 1 | 2 = 2,
): string {
  if (!teamName?.trim()) return length === 1 ? '?' : '??';
  return teamName.trim().substring(0, length).toUpperCase();
}
