/** Everyone in a slot party except `excludeUserId` (typically the rater). */
export function peersForSlot(
  hostId: string,
  acceptedApplicantIds: string[],
  excludeUserId: string,
): string[] {
  const ids = new Set<string>([hostId, ...acceptedApplicantIds]);
  ids.delete(excludeUserId);
  return Array.from(ids);
}

export function isSlotParticipant(
  userId: string,
  hostId: string,
  acceptedApplicantIds: string[],
): boolean {
  return userId === hostId || acceptedApplicantIds.includes(userId);
}
