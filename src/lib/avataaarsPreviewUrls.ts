import {
  defaultAvataaarsForm,
  avataaarsFormToDicebearOptions,
  type AvataaarsFormState,
} from '../constants/avataaarsDicebear'
import { buildDicebearAvataaarsUrl } from './dicebear'

/** Seed fixe pour les miniatures catalogue (sans lien avec la graine utilisateur). */
const PREVIEW_SEED = 'mcu-catalog'

function previewBase(): AvataaarsFormState {
  const f = defaultAvataaarsForm(PREVIEW_SEED)
  f.facialHairProbability = 0
  f.accessoriesProbability = 0
  f.backgroundColor = 'transparent'
  return f
}

function toUrl(patch: Partial<AvataaarsFormState>): string {
  const merged = { ...previewBase(), ...patch, seed: PREVIEW_SEED }
  return buildDicebearAvataaarsUrl(PREVIEW_SEED, avataaarsFormToDicebearOptions(merged))
}

export function previewTop(value: AvataaarsFormState['top']): string {
  return toUrl({ top: value })
}

export function previewEyes(value: AvataaarsFormState['eyes']): string {
  return toUrl({ eyes: value })
}

export function previewEyebrows(value: AvataaarsFormState['eyebrows']): string {
  return toUrl({ eyebrows: value })
}

export function previewMouth(value: AvataaarsFormState['mouth']): string {
  return toUrl({ mouth: value })
}

export function previewClothing(value: AvataaarsFormState['clothing']): string {
  const extra: Partial<AvataaarsFormState> = { clothing: value }
  if (value === 'graphicShirt') {
    extra.clothingGraphic = 'skull'
  }
  return toUrl(extra)
}

export function previewClothingGraphic(value: AvataaarsFormState['clothingGraphic']): string {
  return toUrl({ clothing: 'graphicShirt', clothingGraphic: value })
}

export function previewFacialHair(value: AvataaarsFormState['facialHair']): string {
  return toUrl({
    facialHair: value,
    facialHairProbability: 100,
  })
}

export function previewAccessories(value: AvataaarsFormState['accessories']): string {
  return toUrl({
    accessories: value,
    accessoriesProbability: 100,
  })
}

export function previewHairColor(value: AvataaarsFormState['hairColor']): string {
  return toUrl({ hairColor: value })
}

export function previewSkinColor(value: AvataaarsFormState['skinColor']): string {
  return toUrl({ skinColor: value })
}

export function previewClothesColor(value: AvataaarsFormState['clothesColor']): string {
  return toUrl({ clothesColor: value })
}

export function previewHatColor(value: AvataaarsFormState['hatColor']): string {
  return toUrl({ top: 'winterHat1', hatColor: value })
}

export function previewFacialHairColor(value: AvataaarsFormState['facialHairColor']): string {
  return toUrl({
    facialHair: 'beardMedium',
    facialHairColor: value,
    facialHairProbability: 100,
  })
}

export function previewAccessoriesColor(value: AvataaarsFormState['accessoriesColor']): string {
  return toUrl({
    accessories: 'round',
    accessoriesColor: value,
    accessoriesProbability: 100,
  })
}

export function previewBackground(value: AvataaarsFormState['backgroundColor']): string {
  return toUrl({ backgroundColor: value })
}

export function previewFrameStyle(frame: 'default' | 'circle'): string {
  return toUrl({ frameStyle: frame })
}
