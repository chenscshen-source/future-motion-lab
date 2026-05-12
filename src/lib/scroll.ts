// Smooth-scroll an in-page section into view and update the URL hash without
// pushing a history entry. Shared by Topbar and SectionRail so the navigation
// behaviour stays in lock-step.
export function scrollToSection(id: string) {
  if (typeof window === "undefined") return;

  if (id === "lab") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState(null, "", "#lab");
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: "smooth" });
  window.history.replaceState(null, "", `#${id}`);
}
