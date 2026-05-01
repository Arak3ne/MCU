/**
 * Récupère le JSON brut LCU pour une partie : GET /lol-match-history/v1/games/{gameId}
 *
 * Prérequis :
 * - League Client ouvert (lockfile présent)
 * - .env avec VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (pour résoudre le dernier game_id si besoin)
 *
 * Usage :
 *   node scripts/dump-lcu-game-json.mjs              → dernier match enregistré dans match_history
 *   node scripts/dump-lcu-game-json.mjs 1234567890   → game_id explicite
 *
 * Sortie : ./lcu-game-<gameId>.json (répertoire courant)
 *
 * Lockfile : variable LC_LOCKFILE ou défaut installation League Windows courante.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const LOCKFILE =
  process.env.LC_LOCKFILE ||
  'C:\\Riot Games\\League of Legends\\lockfile'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

async function readLockfile() {
  if (!fs.existsSync(LOCKFILE)) {
    throw new Error(
      `Lockfile introuvable : ${LOCKFILE}\n` +
        'Lance le client League ou définis LC_LOCKFILE vers ton lockfile.'
    )
  }
  const raw = fs.readFileSync(LOCKFILE, 'utf8')
  const parts = raw.trim().split(':')
  if (parts.length < 5) throw new Error('Format lockfile invalide')
  return { port: parts[2], token: parts[3] }
}

async function fetchGameJson(gameId) {
  const { port, token } = await readLockfile()
  const auth = Buffer.from(`riot:${token}`, 'utf8').toString('base64')
  const url = `https://127.0.0.1:${port}/lol-match-history/v1/games/${gameId}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LCU ${res.status} ${res.statusText}\n${text.slice(0, 500)}`)
  }
  return await res.json()
}

async function latestGameIdFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Définis VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env à la racine du projet.'
    )
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const { data, error } = await supabase
    .from('match_history')
    .select('game_id, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data?.game_id) {
    throw new Error('Aucune ligne dans match_history : synchronise au moins un match avant.')
  }
  return String(data.game_id)
}

async function main() {
  const argId = process.argv[2]
  const gameId = argId ? String(argId) : await latestGameIdFromSupabase()

  console.log(`game_id = ${gameId}`)
  console.log(`GET /lol-match-history/v1/games/${gameId} …`)

  const json = await fetchGameJson(gameId)
  const outName = path.join(process.cwd(), `lcu-game-${gameId}.json`)
  fs.writeFileSync(outName, JSON.stringify(json, null, 2), 'utf8')
  console.log(`Écrit : ${outName}`)
  console.log(
    'Cherche dans le fichier : totalTimeSpentDead, ou une variante snake_case / à la racine participant.'
  )
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
