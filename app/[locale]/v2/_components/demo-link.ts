// demo-link.ts — single source of truth for the "book a demo" destination.
// v1 (components/report-view.tsx) opens this same URL from the
// AccessRequestModal onPlanDemo handler.

export const DEMO_CALENDAR_URL = "https://meetings-eu1.hubspot.com/jknuvers";

// Helper so callers don't have to remember the target/rel incantation.
export function openDemoCalendar(): void {
  if (typeof window === "undefined") return;
  window.open(DEMO_CALENDAR_URL, "_blank", "noopener,noreferrer");
}
