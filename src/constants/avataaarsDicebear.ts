/** DiceBear `avataaars` schema (API 9.x) — option values only, no URLs. */

export const AVATAAARS_TOP = [
  'bigHair',
  'bob',
  'bun',
  'curly',
  'curvy',
  'dreads',
  'dreads01',
  'dreads02',
  'frida',
  'frizzle',
  'fro',
  'froBand',
  'hat',
  'hijab',
  'longButNotTooLong',
  'miaWallace',
  'shaggy',
  'shaggyMullet',
  'shavedSides',
  'shortCurly',
  'shortFlat',
  'shortRound',
  'shortWaved',
  'sides',
  'straight01',
  'straight02',
  'straightAndStrand',
  'theCaesar',
  'theCaesarAndSidePart',
  'turban',
  'winterHat1',
  'winterHat02',
  'winterHat03',
  'winterHat04',
] as const

export const AVATAAARS_ACCESSORIES = [
  'eyepatch',
  'kurt',
  'prescription01',
  'prescription02',
  'round',
  'sunglasses',
  'wayfarers',
] as const

export const AVATAAARS_CLOTHING = [
  'blazerAndShirt',
  'blazerAndSweater',
  'collarAndSweater',
  'graphicShirt',
  'hoodie',
  'overall',
  'shirtCrewNeck',
  'shirtScoopNeck',
  'shirtVNeck',
] as const

export const AVATAAARS_CLOTHING_GRAPHIC = [
  'bat',
  'bear',
  'cumbia',
  'deer',
  'diamond',
  'hola',
  'pizza',
  'resist',
  'skull',
  'skullOutline',
] as const

export const AVATAAARS_EYEBROWS = [
  'angry',
  'angryNatural',
  'default',
  'defaultNatural',
  'flatNatural',
  'frownNatural',
  'raisedExcited',
  'raisedExcitedNatural',
  'sadConcerned',
  'sadConcernedNatural',
  'unibrowNatural',
  'upDown',
  'upDownNatural',
] as const

export const AVATAAARS_EYES = [
  'closed',
  'cry',
  'default',
  'eyeRoll',
  'happy',
  'hearts',
  'side',
  'squint',
  'surprised',
  'wink',
  'winkWacky',
  'xDizzy',
] as const

export const AVATAAARS_FACIAL_HAIR = [
  'beardLight',
  'beardMajestic',
  'beardMedium',
  'moustacheFancy',
  'moustacheMagnum',
] as const

export const AVATAAARS_MOUTH = [
  'concerned',
  'default',
  'disbelief',
  'eating',
  'grimace',
  'sad',
  'screamOpen',
  'serious',
  'smile',
  'tongue',
  'twinkle',
  'vomit',
] as const

export const AVATAAARS_SKIN_COLORS = [
  '614335',
  'ae5d29',
  'd08b5b',
  'edb98a',
  'f8d25c',
  'fd9841',
  'ffdbb4',
] as const

export const AVATAAARS_HAIR_COLORS = [
  '2c1b18',
  '4a312c',
  '724133',
  'a55728',
  'b58143',
  'c93305',
  'd6b370',
  'e8e1e1',
  'ecdcbf',
  'f59797',
] as const

export const AVATAAARS_CLOTHES_COLORS = [
  '3c4f5c',
  '65c9ff',
  '262e33',
  '5199e4',
  '25557c',
  '929598',
  'a7ffc4',
  'b1e2ff',
  'e6e6e6',
  'ff5c5c',
  'ff488e',
  'ffafb9',
  'ffdeb5',
  'ffffb1',
  'ffffff',
] as const

export const AVATAAARS_ACCESSORIES_COLORS = AVATAAARS_CLOTHES_COLORS
export const AVATAAARS_HAT_COLORS = AVATAAARS_CLOTHES_COLORS

export const AVATAAARS_BACKGROUNDS = ['transparent', 'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'] as const

export type AvataaarsFormState = {
  seed: string
  top: (typeof AVATAAARS_TOP)[number]
  hairColor: (typeof AVATAAARS_HAIR_COLORS)[number]
  hatColor: (typeof AVATAAARS_HAT_COLORS)[number]
  skinColor: (typeof AVATAAARS_SKIN_COLORS)[number]
  eyes: (typeof AVATAAARS_EYES)[number]
  eyebrows: (typeof AVATAAARS_EYEBROWS)[number]
  mouth: (typeof AVATAAARS_MOUTH)[number]
  clothing: (typeof AVATAAARS_CLOTHING)[number]
  clothesColor: (typeof AVATAAARS_CLOTHES_COLORS)[number]
  clothingGraphic: (typeof AVATAAARS_CLOTHING_GRAPHIC)[number]
  facialHair: (typeof AVATAAARS_FACIAL_HAIR)[number]
  facialHairColor: (typeof AVATAAARS_HAIR_COLORS)[number]
  facialHairProbability: number
  accessories: (typeof AVATAAARS_ACCESSORIES)[number]
  accessoriesColor: (typeof AVATAAARS_ACCESSORIES_COLORS)[number]
  accessoriesProbability: number
  backgroundColor: (typeof AVATAAARS_BACKGROUNDS)[number]
  frameStyle: 'default' | 'circle'
}

export function defaultAvataaarsForm(pseudoFallback: string): AvataaarsFormState {
  const seed = pseudoFallback.trim().slice(0, 128) || 'MCU'
  return {
    seed,
    top: 'shortFlat',
    hairColor: '2c1b18',
    hatColor: '262e33',
    skinColor: 'edb98a',
    eyes: 'default',
    eyebrows: 'default',
    mouth: 'smile',
    clothing: 'hoodie',
    clothesColor: '262e33',
    clothingGraphic: 'skull',
    facialHair: 'beardMedium',
    facialHairColor: '724133',
    facialHairProbability: 0,
    accessories: 'round',
    accessoriesColor: '262e33',
    accessoriesProbability: 0,
    backgroundColor: 'transparent',
    frameStyle: 'default',
  }
}

/** Options sent to DiceBear (excludes seed — passed separately). */
export function avataaarsFormToDicebearOptions(form: AvataaarsFormState): Record<string, string | number> {
  const opt: Record<string, string | number> = {
    top: form.top,
    hairColor: form.hairColor,
    hatColor: form.hatColor,
    skinColor: form.skinColor,
    eyes: form.eyes,
    eyebrows: form.eyebrows,
    mouth: form.mouth,
    clothing: form.clothing,
    clothesColor: form.clothesColor,
    facialHair: form.facialHair,
    facialHairColor: form.facialHairColor,
    facialHairProbability: form.facialHairProbability,
    accessories: form.accessories,
    accessoriesColor: form.accessoriesColor,
    accessoriesProbability: form.accessoriesProbability,
    backgroundColor: 'transparent',
    style: 'default',
  }
  if (form.clothing === 'graphicShirt') {
    opt.clothingGraphic = form.clothingGraphic
  }
  return opt
}

export function shallowEqualForm(a: AvataaarsFormState, b: AvataaarsFormState): boolean {
  return (Object.keys(a) as (keyof AvataaarsFormState)[]).every((k) => a[k] === b[k])
}
