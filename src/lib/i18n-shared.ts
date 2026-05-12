// Server-safe constants and types for i18n. These must live outside the
// "use client" boundary so server components (layout.tsx) can read the raw
// values rather than client-reference handles.

export type Lang = "zh" | "en";

export const LANG_COOKIE = "site-lang";
