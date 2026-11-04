/**
 * The feature flag names, on their own so typed data files (and the
 * Worker, which imports some of them) can name a flag without importing
 * lib/flags.ts, which reads process.env.
 */
export type FlagName = "automations" | "automationsDemo" | "voice";
