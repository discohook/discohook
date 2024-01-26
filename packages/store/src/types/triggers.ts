// Debating whether to support server boosts.
// The only way(s) to do this seem to be listening to MEMBER_UPDATE (booster role)
// or MESSAGE_CREATE (boost messages), both of which are very noisy events and have
// their respective drawbacks; I need to know the booster role ID, or the server
// needs to have boost messages enabled (and the bot has to be able to see them).
// I'm hoping that it will be more manageable in the future to support this since
// event processing should no longer take a considerable toll on my machine's CPU.
export enum TriggerEvent {
  MemberAdd = 0,
  MemberRemove = 1,
}
