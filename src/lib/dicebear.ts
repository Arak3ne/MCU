import {
  AVATAAARS_ACCESSORIES,
  AVATAAARS_CLOTHING,
  AVATAAARS_CLOTHING_GRAPHIC,
  AVATAAARS_EYEBROWS,
  AVATAAARS_EYES,
  AVATAAARS_FACIAL_HAIR,
  AVATAAARS_HAIR_COLORS,
  AVATAAARS_CLOTHES_COLORS,
  AVATAAARS_TOP,
  AVATAAARS_MOUTH,
  AVATAAARS_SKIN_COLORS,
  AVATAAARS_BACKGROUNDS,
  type AvataaarsFormState,
  avataaarsFormToDicebearOptions,
  defaultAvataaarsForm,
} from '../constants/avataaarsDicebear'

export const DIEBEAR_VERSION = '9.x'

export function buildDicebearAvataaarsUrl(seed: string, dicebearOpts: Record<string, string | number>): string {
  const base = `https://api.dicebear.com/${DIEBEAR_VERSION}/avataaars/svg`
  const params = new URLSearchParams()
  params.set('seed', seed)
  for (const [key, raw] of Object.entries(dicebearOpts)) {
    if (raw === '' || raw === undefined || raw === null) continue
    params.set(key, typeof raw === 'number' ? String(raw) : raw)
  }
  return `${base}?${params.toString()}`
}

/** Legacy look: seed-only + transparent BG (DiceBear chooses details from seed). */
export function defaultSeedOnlyAvatarUrl(fallbackSeed: string): string {
  const seed = fallbackSeed.trim() || 'MCU'
  return buildDicebearAvataaarsUrl(seed, { backgroundColor: 'transparent' })
}

function coerceString(v: unknown, allowed: readonly string[], fallback: string): string {
  if (typeof v === 'string' && (allowed as readonly string[]).includes(v)) return v
  return fallback
}

function coerceNumber(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.min(100, Math.max(0, Math.round(v)))
  if (typeof v === 'string' && /^-?\d+$/.test(v)) {
    return Math.min(100, Math.max(0, parseInt(v, 10)))
  }
  return fallback
}

/** Merge unknown DB JSON into a safe editable form state. */
export function formStateFromStoredOptions(seedFromDb: string, options: Record<string, unknown>, pseudoFallback: string): AvataaarsFormState {
  const base = defaultAvataaarsForm(pseudoFallback)
  const seed = typeof seedFromDb === 'string' && seedFromDb.trim() ? seedFromDb.trim().slice(0, 128) : base.seed

  const styleRaw = options.style
  const frameStyle =
    styleRaw === 'circle' ? 'circle' : 'default'

  return {
    seed,
    top: coerceString(options.top, AVATAAARS_TOP, base.top) as AvataaarsFormState['top'],
    hairColor: coerceString(options.hairColor, AVATAAARS_HAIR_COLORS, base.hairColor) as AvataaarsFormState['hairColor'],
    hatColor: coerceString(options.hatColor, AVATAAARS_CLOTHES_COLORS, base.hatColor) as AvataaarsFormState['hatColor'],
    skinColor: coerceString(options.skinColor, AVATAAARS_SKIN_COLORS, base.skinColor) as AvataaarsFormState['skinColor'],
    eyes: coerceString(options.eyes, AVATAAARS_EYES, base.eyes) as AvataaarsFormState['eyes'],
    eyebrows: coerceString(options.eyebrows, AVATAAARS_EYEBROWS, base.eyebrows) as AvataaarsFormState['eyebrows'],
    mouth: coerceString(options.mouth, AVATAAARS_MOUTH, base.mouth) as AvataaarsFormState['mouth'],
    clothing: coerceString(options.clothing, AVATAAARS_CLOTHING, base.clothing) as AvataaarsFormState['clothing'],
    clothesColor: coerceString(options.clothesColor, AVATAAARS_CLOTHES_COLORS, base.clothesColor) as AvataaarsFormState['clothesColor'],
    clothingGraphic: coerceString(
      options.clothingGraphic,
      AVATAAARS_CLOTHING_GRAPHIC,
      base.clothingGraphic
    ) as AvataaarsFormState['clothingGraphic'],
    facialHair: coerceString(options.facialHair, AVATAAARS_FACIAL_HAIR, base.facialHair) as AvataaarsFormState['facialHair'],
    facialHairColor: coerceString(
      options.facialHairColor,
      AVATAAARS_HAIR_COLORS,
      base.facialHairColor
    ) as AvataaarsFormState['facialHairColor'],
    facialHairProbability: coerceNumber(options.facialHairProbability, base.facialHairProbability),
    accessories: coerceString(options.accessories, AVATAAARS_ACCESSORIES, base.accessories) as AvataaarsFormState['accessories'],
    accessoriesColor: coerceString(
      options.accessoriesColor,
      AVATAAARS_CLOTHES_COLORS,
      base.accessoriesColor
    ) as AvataaarsFormState['accessoriesColor'],
    accessoriesProbability: coerceNumber(options.accessoriesProbability, base.accessoriesProbability),
    backgroundColor: coerceString(options.backgroundColor, AVATAAARS_BACKGROUNDS, base.backgroundColor) as AvataaarsFormState['backgroundColor'],
    frameStyle,
  }
}

/** Full portrait URL from a DB row + fallback pseudo if row missing/bad. */
export function dicebearPortraitUrl(
  row: { seed: string; options?: Record<string, unknown> | null } | null | undefined,
  playerPseudoOrName: string
): string {
  if (!row?.seed?.trim()) {
    return defaultSeedOnlyAvatarUrl(playerPseudoOrName)
  }
  const optsObj = row.options && typeof row.options === 'object' && !Array.isArray(row.options) ? (row.options as Record<string, unknown>) : {}
  const form = formStateFromStoredOptions(row.seed.trim(), optsObj, playerPseudoOrName)
  return buildDicebearAvataaarsUrl(form.seed.trim(), avataaarsFormToDicebearOptions(form))
}
