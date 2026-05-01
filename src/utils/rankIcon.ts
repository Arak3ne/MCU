export const getRankIconUrl = (rank: string) => {
  if (!rank) return '';
  const normalizedRank = rank.toLowerCase();
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${normalizedRank}.svg`;
};
