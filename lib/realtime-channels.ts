/** Pusher private channel names — safe to import from client bundles. */

export function slotChannelName(slotId: string) {
  return `private-slot-${slotId}`;
}

export function userChannelName(userId: string) {
  return `private-user-${userId}`;
}
