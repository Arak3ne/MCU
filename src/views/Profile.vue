<template>
  <div class="min-h-screen bg-[#0B0F0C] text-[#F0FDF4] font-sans pb-20 lg:pb-10 selection:bg-[#22C55E] selection:text-[#0B0F0C]">
    <div class="fixed inset-0 pointer-events-none overflow-hidden opacity-60">
      <div class="absolute top-[-20%] left-[-10%] w-[45%] h-[45%] bg-[#22C55E] opacity-[0.04] blur-[120px] rounded-full" />
      <div class="absolute bottom-[-25%] right-[-15%] w-[50%] h-[50%] bg-[#4ADE80] opacity-[0.03] blur-[120px] rounded-full" />
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-8">
      <div class="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-3xl md:text-4xl font-title uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#F0FDF4] to-[#22C55E]">
            Profil
          </h1>
          <p class="text-[#71717A] text-[10px] uppercase tracking-[0.18em] mt-1 font-bold">
            Visage visible en continu · onglets pour parcourir les options
          </p>
        </div>
        <router-link
          to="/"
          class="text-xs font-bold uppercase tracking-widest text-[#22C55E] border border-[#22C55E]/40 hover:border-[#22C55E] px-4 py-2 rounded-sm transition-colors w-fit shrink-0"
        >
          Retour
        </router-link>
      </div>

      <div v-if="loadError" class="bg-red-900/20 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-widest mb-4">
        {{ loadError }}
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="w-12 h-12 border-2 border-[#2A2A2A] border-t-[#22C55E] rounded-full animate-spin" />
        <p class="text-[#A1A1AA] text-xs uppercase tracking-widest font-bold">Chargement…</p>
      </div>

      <!-- Bandeau aperçu mobile : suit le scroll sous la navbar (h-20) -->
      <div
        v-if="player && !loading"
        class="lg:hidden sticky top-20 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 mb-4 flex items-center gap-3 border-y border-[#2A2A2A]/80 bg-[#0B0F0C]/92 backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      >
        <div
          class="shrink-0 rounded-full border-[3px] border-[#22C55E]/55 shadow-[0_0_20px_rgba(34,197,94,0.2)] overflow-hidden bg-[#1A1A1A] w-[4.25rem] h-[4.25rem]"
        >
          <img :src="previewUrl" class="w-full h-full object-cover" width="68" height="68" alt="Aperçu avatar" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-[#71717A]">Aperçu</p>
          <p class="text-sm font-bold uppercase tracking-wide text-[#F0FDF4] truncate">{{ player.pseudo }}</p>
        </div>
        <button
          type="button"
          :disabled="saving"
          class="shrink-0 py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-sm border border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E] disabled:opacity-50"
          @click="save"
        >
          {{ saving ? '…' : 'OK' }}
        </button>
      </div>

      <div v-if="player && !loading" class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        <!-- Desktop : colonne gauche sticky, avatar toujours à l’écran -->
        <div
          class="hidden lg:flex lg:col-span-4 flex-col gap-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-5.5rem)]"
        >
          <div class="shrink-0 rounded-2xl border border-[#2A2A2A] bg-[#111111]/80 backdrop-blur-md px-5 py-5 flex flex-col items-center shadow-[0_0_40px_rgba(0,0,0,0.45)]">
            <p class="text-[9px] font-bold uppercase tracking-[0.25em] text-[#A1A1AA] mb-4">Ton avatar</p>
            <div
              class="rounded-full border-[3px] border-[#22C55E]/50 shadow-[0_0_30px_rgba(34,197,94,0.22)] overflow-hidden bg-[#1A1A1A] w-44 h-44 xl:w-48 xl:h-48"
            >
              <img :src="previewUrl" class="w-full h-full object-cover" width="192" height="192" alt="Avatar" />
            </div>
            <p class="mt-4 text-center text-xs text-[#F0FDF4] font-bold uppercase tracking-wider truncate max-w-full">
              {{ player.pseudo }}
            </p>
          </div>

          <div class="shrink-0 flex gap-2">
            <button
              type="button"
              class="flex-1 min-w-0 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm border border-[#2A2A2A] hover:border-[#22C55E]/60 hover:text-[#22C55E] transition-colors"
              @click="randomize"
            >
              Aléatoire
            </button>
            <button
              type="button"
              class="flex-1 min-w-0 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm border border-[#2A2A2A] hover:border-[#22C55E]/60 hover:text-[#22C55E] transition-colors"
              @click="resetDefaults"
            >
              Réinit.
            </button>
          </div>

          <div class="min-h-0 lg:overflow-y-auto lg:pr-1 lg:[scrollbar-width:thin] lg:[scrollbar-color:#2a2a2a_#0b0f0c] space-y-2 pt-1">
            <p v-if="saveError" class="text-red-400 text-[10px] font-bold uppercase tracking-widest">{{ saveError }}</p>
            <p v-if="saveOk" class="text-[#22C55E] text-[10px] font-bold uppercase tracking-widest">Enregistré ✓</p>
            <button
              type="button"
              :disabled="saving"
              class="w-full py-3.5 bg-gradient-to-r from-[#22C55E] to-[#14532D] text-[#0B0F0C] font-title uppercase tracking-widest text-xs rounded-sm border border-[#22C55E] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.25)]"
              @click="save"
            >
              {{ saving ? 'Sauvegarde…' : 'Sauvegarder' }}
            </button>
          </div>
        </div>

        <div class="lg:col-span-8 rounded-2xl border border-[#2A2A2A] bg-[#111111]/60 backdrop-blur-sm p-4 md:p-5 space-y-4">
          <!-- Onglets : moins de hauteur qu’un seul bloc -->
          <div
            class="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#2a2a2a_#0b0f0c]"
            role="tablist"
            aria-label="Sections avatar"
          >
            <button
              v-for="tab in editorTabs"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.id"
              class="shrink-0 px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-colors"
              :class="
                activeTab === tab.id
                  ? 'border-[#22C55E] bg-[#22C55E]/12 text-[#22C55E]'
                  : 'border-transparent text-[#A1A1AA] hover:text-[#F0FDF4] hover:bg-[#1a1a1a]'
              "
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div v-show="activeTab === 'head'" class="space-y-4">
            <div class="space-y-1.5 pb-3 border-b border-[#2A2A2A]/60">
              <label class="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">Graine (seed)</label>
              <input
                v-model="form.seed"
                type="text"
                maxlength="128"
                class="w-full max-w-xl bg-[#0B0F0C] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none"
                placeholder="Texte stabilisateur (ex. pseudo)"
              />
              <p class="text-[10px] text-[#71717A]">Stabilise le rendu — garde la même valeur une fois ton avatar figé.</p>
            </div>
            <DicebearPickGrid
              label="Coupe / chapeau"
              v-model="form.top"
              :items="pickTop"
              :show-value-line="false"
            />
            <div class="grid sm:grid-cols-2 gap-4">
              <DicebearColorPicker
                label="Couleur cheveux"
                v-model="form.hairColor"
                :colors="AVATAAARS_HAIR_COLORS"
                :show-value-line="false"
              />
              <DicebearColorPicker
                label="Peau"
                v-model="form.skinColor"
                :colors="AVATAAARS_SKIN_COLORS"
                :show-value-line="false"
              />
            </div>
            <DicebearColorPicker
              label="Couleur bonnet"
              v-model="form.hatColor"
              :colors="AVATAAARS_HAT_COLORS"
              :show-value-line="false"
            />
          </div>

          <div v-show="activeTab === 'face'" class="space-y-4">
            <div class="grid sm:grid-cols-3 gap-4">
              <DicebearPickGrid label="Yeux" v-model="form.eyes" :items="pickEyes" :show-value-line="false" />
              <DicebearPickGrid
                label="Sourcils"
                v-model="form.eyebrows"
                :items="pickEyebrows"
                :show-value-line="false"
              />
              <DicebearPickGrid label="Bouche" v-model="form.mouth" :items="pickMouth" :show-value-line="false" />
            </div>
            <div class="space-y-2 pt-1 border-t border-[#2A2A2A]/60">
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">Barbe • probabilité</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="p in probChoices"
                  :key="'b' + p"
                  type="button"
                  class="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-all"
                  :class="
                    form.facialHairProbability === p
                      ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E]'
                      : 'border-[#2A2A2A] text-[#A1A1AA] hover:border-[#404040]'
                  "
                  @click="form.facialHairProbability = p"
                >
                  {{ p }}%
                </button>
              </div>
              <DicebearPickGrid
                label="Style barbe"
                v-model="form.facialHair"
                :items="pickFacialHair"
                :show-value-line="false"
              />
              <DicebearColorPicker
                label="Couleur barbe"
                v-model="form.facialHairColor"
                :colors="AVATAAARS_HAIR_COLORS"
                :show-value-line="false"
              />
            </div>
            <div class="space-y-2 pt-1 border-t border-[#2A2A2A]/60">
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">Accessoire • probabilité</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="p in probChoices"
                  :key="'a' + p"
                  type="button"
                  class="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-all"
                  :class="
                    form.accessoriesProbability === p
                      ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E]'
                      : 'border-[#2A2A2A] text-[#A1A1AA] hover:border-[#404040]'
                  "
                  @click="form.accessoriesProbability = p"
                >
                  {{ p }}%
                </button>
              </div>
              <DicebearPickGrid
                label="Type"
                v-model="form.accessories"
                :items="pickAccessories"
                :show-value-line="false"
              />
              <DicebearColorPicker
                label="Couleur accessoire"
                v-model="form.accessoriesColor"
                :colors="AVATAAARS_ACCESSORIES_COLORS"
                :show-value-line="false"
              />
            </div>
          </div>

          <div v-show="activeTab === 'outfit'" class="space-y-4">
            <DicebearPickGrid
              label="Tenue"
              v-model="form.clothing"
              :items="pickClothing"
              :show-value-line="false"
            />
            <DicebearPickGrid
              v-if="form.clothing === 'graphicShirt'"
              label="Motif tee-shirt"
              v-model="form.clothingGraphic"
              :items="pickGraphic"
              :show-value-line="false"
            />
            <DicebearColorPicker
              label="Couleur tenue"
              v-model="form.clothesColor"
              :colors="AVATAAARS_CLOTHES_COLORS"
              :show-value-line="false"
            />
          </div>

          <!-- Mobile / tablette : actions sous le panneau (aperçu déjà dans le bandeau) -->
          <div class="lg:hidden pt-2 border-t border-[#2A2A2A]/60 space-y-2">
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm border border-[#2A2A2A] hover:border-[#22C55E]/60 hover:text-[#22C55E] transition-colors"
                @click="randomize"
              >
                Aléatoire
              </button>
              <button
                type="button"
                class="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm border border-[#2A2A2A] hover:border-[#22C55E]/60 hover:text-[#22C55E] transition-colors"
                @click="resetDefaults"
              >
                Réinit.
              </button>
            </div>
            <p v-if="saveError" class="text-red-400 text-[10px] font-bold uppercase tracking-widest">{{ saveError }}</p>
            <p v-if="saveOk" class="text-[#22C55E] text-[10px] font-bold uppercase tracking-widest">Enregistré ✓</p>
            <button
              type="button"
              :disabled="saving"
              class="w-full py-3.5 bg-gradient-to-r from-[#22C55E] to-[#14532D] text-[#0B0F0C] font-title uppercase tracking-widest text-xs rounded-sm border border-[#22C55E] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.25)]"
              @click="save"
            >
              {{ saving ? 'Sauvegarde…' : 'Sauvegarder' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import {
  AVATAAARS_TOP,
  AVATAAARS_ACCESSORIES,
  AVATAAARS_CLOTHING,
  AVATAAARS_CLOTHING_GRAPHIC,
  AVATAAARS_EYEBROWS,
  AVATAAARS_EYES,
  AVATAAARS_FACIAL_HAIR,
  AVATAAARS_HAIR_COLORS,
  AVATAAARS_CLOTHES_COLORS,
  AVATAAARS_MOUTH,
  AVATAAARS_SKIN_COLORS,
  AVATAAARS_HAT_COLORS,
  AVATAAARS_ACCESSORIES_COLORS,
  defaultAvataaarsForm,
  avataaarsFormToDicebearOptions,
  type AvataaarsFormState,
} from '../constants/avataaarsDicebear'
import { buildDicebearAvataaarsUrl, formStateFromStoredOptions } from '../lib/dicebear'
import {
  previewTop,
  previewEyes,
  previewEyebrows,
  previewMouth,
  previewClothing,
  previewClothingGraphic,
  previewFacialHair,
  previewAccessories,
} from '../lib/avataaarsPreviewUrls'
import { fetchPlayerAvatarConfig, upsertPlayerAvatarConfig } from '../services/playerAvatarService'
import DicebearPickGrid from '../components/DicebearPickGrid.vue'
import DicebearColorPicker from '../components/DicebearColorPicker.vue'

type FormDraft = Omit<AvataaarsFormState, 'frameStyle'> & {
  framePicker: 'default' | 'circle'
}

const probChoices = [0, 25, 50, 75, 100] as const

type EditorTabId = 'head' | 'face' | 'outfit'

const editorTabs: ReadonlyArray<{ id: EditorTabId; label: string }> = [
  { id: 'head', label: 'Tête' },
  { id: 'face', label: 'Visage' },
  { id: 'outfit', label: 'Tenue' },
]

const activeTab = ref<EditorTabId>('head')

const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const saveError = ref('')
const saveOk = ref(false)
const player = ref<{ id: string; pseudo: string } | null>(null)

function toFormDraft(base: AvataaarsFormState): FormDraft {
  return {
    ...base,
    framePicker: base.frameStyle === 'circle' ? 'circle' : 'default',
  }
}

const form = reactive<FormDraft>(toFormDraft(defaultAvataaarsForm('MCU')))

const previewUrl = computed(() => {
  const seed = form.seed.trim() || 'MCU'
  return buildDicebearAvataaarsUrl(seed, avataaarsFormToDicebearOptions(toPersistableForm(form)))
})

function toPersistableForm(f: FormDraft): AvataaarsFormState {
  const { framePicker: _fp, ...rest } = f
  return {
    ...rest,
    backgroundColor: 'transparent',
    frameStyle: 'default',
  }
}

const pickTop = computed(() => AVATAAARS_TOP.map((v) => ({ value: v, src: previewTop(v) })))
const pickEyes = computed(() => AVATAAARS_EYES.map((v) => ({ value: v, src: previewEyes(v) })))
const pickEyebrows = computed(() => AVATAAARS_EYEBROWS.map((v) => ({ value: v, src: previewEyebrows(v) })))
const pickMouth = computed(() => AVATAAARS_MOUTH.map((v) => ({ value: v, src: previewMouth(v) })))
const pickClothing = computed(() => AVATAAARS_CLOTHING.map((v) => ({ value: v, src: previewClothing(v) })))
const pickGraphic = computed(() => AVATAAARS_CLOTHING_GRAPHIC.map((v) => ({ value: v, src: previewClothingGraphic(v) })))
const pickFacialHair = computed(() => AVATAAARS_FACIAL_HAIR.map((v) => ({ value: v, src: previewFacialHair(v) })))
const pickAccessories = computed(() => AVATAAARS_ACCESSORIES.map((v) => ({ value: v, src: previewAccessories(v) })))

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function randomize() {
  saveOk.value = false
  const next = defaultAvataaarsForm(form.seed.trim() || 'MCU')
  next.top = pickRandom(AVATAAARS_TOP)
  next.hairColor = pickRandom(AVATAAARS_HAIR_COLORS)
  next.hatColor = pickRandom(AVATAAARS_HAT_COLORS)
  next.skinColor = pickRandom(AVATAAARS_SKIN_COLORS)
  next.eyes = pickRandom(AVATAAARS_EYES)
  next.eyebrows = pickRandom(AVATAAARS_EYEBROWS)
  next.mouth = pickRandom(AVATAAARS_MOUTH)
  next.clothing = pickRandom(AVATAAARS_CLOTHING)
  next.clothesColor = pickRandom(AVATAAARS_CLOTHES_COLORS)
  next.clothingGraphic = pickRandom(AVATAAARS_CLOTHING_GRAPHIC)
  next.facialHair = pickRandom(AVATAAARS_FACIAL_HAIR)
  next.facialHairColor = pickRandom(AVATAAARS_HAIR_COLORS)
  next.facialHairProbability = pickRandom([...probChoices])
  next.accessories = pickRandom(AVATAAARS_ACCESSORIES)
  next.accessoriesColor = pickRandom(AVATAAARS_ACCESSORIES_COLORS)
  next.accessoriesProbability = pickRandom([...probChoices])
  next.backgroundColor = 'transparent'
  next.frameStyle = 'default'
  Object.assign(form, toFormDraft(next))
}

function resetDefaults() {
  saveOk.value = false
  if (!player.value) return
  Object.assign(form, toFormDraft(defaultAvataaarsForm(player.value.pseudo)))
}

async function save() {
  if (!player.value) return
  saveError.value = ''
  saveOk.value = false
  const seed = form.seed.trim()
  if (!seed) {
    saveError.value = 'La graine ne peut pas être vide.'
    return
  }
  saving.value = true
  try {
    const persist = toPersistableForm(form)
    await upsertPlayerAvatarConfig({
      player_id: player.value.id,
      seed,
      options: avataaarsFormToDicebearOptions({ ...persist, seed }),
    })
    saveOk.value = true
    form.backgroundColor = 'transparent'
    form.framePicker = 'default'
    setTimeout(() => {
      saveOk.value = false
    }, 2500)
  } catch (e: any) {
    saveError.value = e?.message || 'Échec de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

function mergeStoredIntoForm(seed: string, opts: Record<string, unknown>, pseudoFallback: string) {
  const parsed = formStateFromStoredOptions(seed, opts, pseudoFallback)
  parsed.backgroundColor = 'transparent'
  parsed.frameStyle = 'default'
  Object.assign(form, toFormDraft(parsed))
}

onMounted(async () => {
  loadError.value = ''
  const raw = localStorage.getItem('mcu_user')
  if (!raw) {
    loadError.value = 'Non connecté.'
    loading.value = false
    return
  }
  try {
    const u = JSON.parse(raw) as { id?: string; pseudo?: string }
    if (!u.id || !u.pseudo) {
      loadError.value = 'Profil invalide. Réinscris-toi.'
      loading.value = false
      return
    }
    player.value = { id: u.id, pseudo: u.pseudo }
    const row = await fetchPlayerAvatarConfig(u.id)
    if (row?.seed) {
      const opts =
        row.options && typeof row.options === 'object' && !Array.isArray(row.options)
          ? (row.options as Record<string, unknown>)
          : {}
      mergeStoredIntoForm(row.seed, opts, u.pseudo)
    } else {
      Object.assign(form, toFormDraft(defaultAvataaarsForm(u.pseudo)))
    }
  } catch (e: any) {
    loadError.value = e?.message || 'Erreur de chargement.'
  } finally {
    loading.value = false
  }
})
</script>
