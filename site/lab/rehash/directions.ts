export const DIRECTIONS = [
  {
    id: "a",
    name: "Molten Room",
    note: "Dark throughout, one live canvas seen through two openings",
  },
  { id: "b", name: "Cold Steel, Hot Core", note: "Light and readable, with dark molten moments" },
  { id: "c", name: "Liquid Print", note: "Printed poster stills, no WebGL" },
] as const;

export const VIEWS = [
  { id: "home", name: "Home" },
  { id: "pricing", name: "Pricing" },
  { id: "start", name: "Start" },
  { id: "case", name: "Case study" },
  { id: "components", name: "Components" },
  { id: "liquid", name: "Liquid use" },
] as const;

export type DirectionId = (typeof DIRECTIONS)[number]["id"];
export type ViewId = (typeof VIEWS)[number]["id"];

export const isDirection = (v: string | null): v is DirectionId =>
  DIRECTIONS.some((d) => d.id === v);
export const isView = (v: string | null): v is ViewId => VIEWS.some((x) => x.id === v);
