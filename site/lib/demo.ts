/**
 * 🚩 The automations demo's local-dev mock (PLAN §7: "wire the demo to
 * a mock handler in local dev").
 *
 * Under `next dev` there is no Worker, so /api/demo doesn't exist. With
 * this on, the demo plays the sequence it was handed by the page
 * instead of failing. Production builds are always false, and
 * worker/demo.ts is the handler there (also a mock until Phase 7).
 */
export const DEMO_MOCK = process.env.NODE_ENV !== "production";
