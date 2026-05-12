"use client";

import { useEffect } from "react";

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export function SectionParallax() {
  useEffect(() => {
    // ── works entry elements ──────────────────────────────────────────────
    const works = document.getElementById("works");
    const worksTypeBlock = works?.querySelector<HTMLElement>(".works-type-block");
    // reel-rows container — separate from reel-row-a which owns horizontal transform
    const reelRowsEl = works?.querySelector<HTMLElement>(".reel-rows");

    // ── contact ───────────────────────────────────────────────────────────
    // About section is animated by AboutRevealHeadline; only contact remains here.
    const contact =
      document.querySelector<HTMLElement>("[data-contact-section]") ??
      document.getElementById("contact");
    const contactHeadline = contact?.querySelector<HTMLElement>(".manifesto-headline");
    const contactLede = contact?.querySelector<HTMLElement>(".manifesto-lede");

    // ── cached layout ─────────────────────────────────────────────────────
    let worksAbsTop = 0;
    let contactAbsTop = 0, contactH = 0;
    let vh = 0;
    let rafId = 0;

    const measure = () => {
      vh = window.innerHeight || 1;
      if (works) worksAbsTop = works.getBoundingClientRect().top + window.scrollY;
      if (contact) {
        const r = contact.getBoundingClientRect();
        contactAbsTop = r.top + window.scrollY;
        contactH = r.height;
      }
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const y = window.scrollY;

      // ── works entry ─────────────────────────────────────────────────────
      // Entry window: works-reel top is at viewport bottom → to top of viewport.
      // clamp: 0 = just peeking from below, 1 = fully covering viewport
      if (worksTypeBlock && reelRowsEl) {
        const entry = clamp((y - (worksAbsTop - vh)) / vh);
        // type block: larger lag (foreground slowest to arrive)
        const blockOffset = (1 - entry) * 90;
        worksTypeBlock.style.transform = `translate3d(0, ${blockOffset.toFixed(1)}px, 0)`;
        worksTypeBlock.style.opacity = (clamp(entry, 0.25, 1) ).toFixed(3);
        // card rows: half the lag (mid depth)
        const rowOffset = (1 - entry) * 45;
        reelRowsEl.style.transform = `translate3d(0, ${rowOffset.toFixed(1)}px, 0)`;
        reelRowsEl.style.opacity = (clamp(entry * 1.2, 0, 1)).toFixed(3);
      }

      // ── contact section ─────────────────────────────────────────────────
      if ((contactHeadline || contactLede) && !contact?.closest("[data-cover-reveal-scene]")) {
        const range = contactH / 2 + vh / 2;
        const progress = clamp(
          ((y + vh / 2) - (contactAbsTop + contactH / 2)) / range,
          -1, 1
        );
        if (contactHeadline) {
          contactHeadline.style.transform = `translate3d(0, ${(progress * -35).toFixed(1)}px, 0)`;
        }
        if (contactLede) {
          contactLede.style.transform = `translate3d(0, ${(progress * -35).toFixed(1)}px, 0)`;
        }
      }
    };

    const onResize = () => requestAnimationFrame(measure);

    measure();
    rafId = requestAnimationFrame(tick);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
