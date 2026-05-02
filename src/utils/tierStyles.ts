/** Fantasy tier couleurs : S rouge, A bleu, B vert, C jaune, D violet */
export function getFantasyTierBadgeClass(tier: string | null | undefined): string {
  const t = (tier || '').toUpperCase().trim();
  switch (t) {
    case 'S':
      return 'text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(248,113,113,0.25)]';
    case 'A':
      return 'text-blue-400 border-blue-500/40 shadow-[0_0_10px_rgba(96,165,250,0.25)]';
    case 'B':
      return 'text-green-400 border-green-500/40 shadow-[0_0_10px_rgba(74,222,128,0.25)]';
    case 'C':
      return 'text-yellow-400 border-yellow-500/40 shadow-[0_0_10px_rgba(250,204,21,0.25)]';
    case 'D':
      return 'text-violet-400 border-violet-500/40 shadow-[0_0_10px_rgba(167,139,250,0.25)]';
    default:
      return 'text-white/50 border-white/10';
  }
}

export function getFantasyTierGlowClass(tier: string | null | undefined): string {
  const t = (tier || '').toUpperCase().trim();
  switch (t) {
    case 'S':
      return 'hover:shadow-[0_20px_70px_rgba(248,113,113,0.22)] hover:border-red-500/50';
    case 'A':
      return 'hover:shadow-[0_20px_70px_rgba(96,165,250,0.22)] hover:border-blue-500/50';
    case 'B':
      return 'hover:shadow-[0_20px_70px_rgba(74,222,128,0.22)] hover:border-green-500/50';
    case 'C':
      return 'hover:shadow-[0_20px_70px_rgba(250,204,21,0.22)] hover:border-yellow-500/50';
    case 'D':
      return 'hover:shadow-[0_20px_70px_rgba(167,139,250,0.22)] hover:border-violet-500/50';
    default:
      return 'hover:shadow-[0_20px_70px_rgba(34,197,94,0.2)] hover:border-mcu-primary/50';
  }
}
