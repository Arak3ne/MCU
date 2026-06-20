/** Pages consultables sans inscription MCU (localStorage `mcu_user`). */
const PUBLIC_PATHS = new Set([
  '/',
  '/register',
  '/overlay',
  '/admin/login',
  '/champions',
  '/players',
  '/stats',
  '/future-matches',
  '/matches',
  '/playoffs',
  '/fantasy-leaderboard',
])

/** Pages qui exigent un profil joueur enregistré. */
const REGISTRATION_REQUIRED_PATHS = new Set(['/fantasy', '/profil'])

export function isMcuPublicPath(path: string): boolean {
  if (PUBLIC_PATHS.has(path)) return true
  if (path.startsWith('/admin')) return true
  if (path.startsWith('/draft/')) return true
  return false
}

export function requiresMcuRegistration(path: string): boolean {
  return REGISTRATION_REQUIRED_PATHS.has(path)
}

export function getMcuRegisteredUser(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem('mcu_user')
    if (!raw) return null
    const user = JSON.parse(raw) as Record<string, unknown>
    if (!user?.id || typeof user.id !== 'string') return null
    return user
  } catch {
    return null
  }
}

export function isMcuRegistered(): boolean {
  return getMcuRegisteredUser() !== null
}

export function patchMcuRegisteredUser(patch: Record<string, unknown>): void {
  const user = getMcuRegisteredUser()
  if (!user) return
  localStorage.setItem('mcu_user', JSON.stringify({ ...user, ...patch }))
}
