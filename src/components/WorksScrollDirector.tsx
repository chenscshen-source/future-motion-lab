"use client";

import { useEffect } from "react";

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

export function WorksScrollDirector() {
  useEffect(() => {
    const works = document.getElementById("works");
    if (!works) return;

    const wrap = works.querySelector<HTMLElement>(".works-pin-wrap");
    const viewport = works.querySelector<HTMLElement>(".reel-rows");
    const row = works.querySelector<HTMLElement>(".reel-row-a");
    if (!wrap || !viewport || !row) return;

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.scrollY > 0) window.scrollTo(0, 0);

    const desktop = window.matchMedia("(min-width: 821px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let shift = 0;
    let wrapTop = 0;
    let scrollDistance = 0;
    let rafId = 0;
    let vpCenterX = 0;
    let rowBaseLeft = 0;
    let vpWidth = 0;
    let vh = 0;

    // title scroll-scale state
    const typeTitle = works.querySelector<HTMLElement>(".works-type-title");
    const typeBlock = works.querySelector<HTMLElement>(".works-type-block");
    let titleScale = 1.3;   // spring-interpolated current scale
    let panelFired = false;
    let smoothedOffset = 0; // spring-interpolated horizontal track offset
    let smoothedInit = false;

    type CardMetric = { el: HTMLElement; centerInRow: number };
    let cardMetrics: CardMetric[] = [];

    const isActive = () => desktop.matches && !reducedMotion.matches;

    const updateCards = (trackOffset: number) => {
      for (const { el, centerInRow } of cardMetrics) {
        const cardCenterX = rowBaseLeft + centerInRow + trackOffset;
        // signed distance: positive → card is right of center (still entering),
        // negative or zero → card has reached or passed center (locked at 100%)
        const signed = cardCenterX - vpCenterX;
        const linear = signed <= 0 ? 1 : clamp(1 - signed / (vpWidth * 0.9));
        // smootherstep (Ken Perlin) — gentle shoulders, spring-like ramp
        const proximity = linear * linear * linear * (linear * (linear * 6 - 15) + 10);
        // 60% → 100% on entry from the right; stays at 100% after passing center
        el.style.opacity = (0.35 + 0.65 * proximity).toFixed(3);
        el.style.transform = `scale(${(0.6 + 0.4 * proximity).toFixed(4)})`;
      }
    };

    const clearCards = () => {
      for (const { el } of cardMetrics) {
        el.style.opacity = "";
        el.style.transform = "";
      }
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const y = window.scrollY;

      if (!isActive() || scrollDistance <= 0) {
        works.style.setProperty("--works-track-offset", "0px");
        clearCards();
        // On mobile/reduced-motion: snap title to normal; the panel sweep
        // is triggered by the IntersectionObserver below instead of firing
        // here on load (otherwise the user never sees it animate).
        if (typeTitle) typeTitle.style.transform = "";
        return;
      }

      // ── title scroll-scale (entry phase: wrapTop-vh → wrapTop) ──────────
      const entryProgress = clamp((y - (wrapTop - vh)) / Math.max(vh, 1));
      const targetScale = 1.3 - 0.3 * entryProgress;          // 1.3 → 1.0
      titleScale += (targetScale - titleScale) * 0.085;         // spring lerp
      if (typeTitle) typeTitle.style.transform = `scale(${titleScale.toFixed(4)})`;

      // fire panel sweep once scale has settled
      if (!panelFired && entryProgress >= 0.92) {
        panelFired = true;
        typeBlock?.classList.add("is-scale-done");
      }

      // Lead-in: shift the trajectory start ahead of the pin so the first card
      // begins entering during the pre-pin scroll (alongside the title scaling),
      // not waiting until the pin fully engages.
      const lead = vh * 0.16;
      const progress = clamp((y - (wrapTop - lead)) / (scrollDistance + lead));
      // easeOutCubic — first card sweeps in with momentum, gracefully decelerates
      // toward the end of the pin so the final framing settles rather than locks
      const eased = 1 - Math.pow(1 - progress, 3);
      // Entry: row starts pushed off to the right by vpWidth (first card just past
      // the right edge), then sweeps left to its natural end position (-shift).
      const targetOffset = vpWidth - eased * (shift + vpWidth);
      if (!smoothedInit) { smoothedOffset = targetOffset; smoothedInit = true; }
      // spring lerp adds a soft trailing follow on top of Lenis smoothing
      smoothedOffset += (targetOffset - smoothedOffset) * 0.24;
      // snap when very close, to avoid endless tiny sub-pixel updates
      if (Math.abs(targetOffset - smoothedOffset) < 0.05) smoothedOffset = targetOffset;
      works.style.setProperty("--works-track-offset", `${smoothedOffset.toFixed(2)}px`);

      // skip expensive per-card opacity/scale writes when far from the pin zone
      if (y < wrapTop - vh || y > wrapTop + scrollDistance + vh) return;
      updateCards(smoothedOffset);
    };

    const measure = () => {
      if (!isActive()) {
        wrap.style.height = "";
        works.style.setProperty("--works-track-offset", "0px");
        works.style.setProperty("--works-track-shift", "0px");
        cardMetrics = [];
        clearCards();
        return;
      }

      vh = window.innerHeight;
      vpWidth = viewport.clientWidth;
      // Base shift: how far left the row must travel for its right edge to
      // reach the viewport's right edge.
      const baseShift = Math.max(0, row.scrollWidth - vpWidth);
      // The per-card scale ramp in updateCards() shrinks any card whose
      // center is right of the viewport center (signed > 0). With baseShift
      // alone the LAST card lands flush against the right edge — its center
      // stays well right of viewport center, so it never reaches scale 1.0
      // and ends up visibly smaller than its neighbors. Push the row a bit
      // further left so the last card's center lands at (or just left of)
      // the viewport center → full-scale framing + comfortable clearance
      // from the right side-rail (z:30, ~72px wide).
      const lastCard = row.querySelector<HTMLElement>(
        ".reel-card:last-child"
      );
      let centerShift = baseShift;
      if (lastCard) {
        const lastCenter = lastCard.offsetLeft + lastCard.offsetWidth / 2;
        centerShift = Math.max(baseShift, lastCenter - vpWidth / 2);
      }
      shift = centerShift;
      // entry phase adds vpWidth of scroll travel so the first card can sweep in from the right
      const entryDistance = vpWidth * 0.42;
      const totalTravel = shift + entryDistance;
      works.style.setProperty("--works-track-shift", `${shift}px`);
      wrap.style.height = `${vh + totalTravel}px`;
      wrapTop = wrap.getBoundingClientRect().top + window.scrollY;

      // reset spring state on re-measure (e.g. resize)
      titleScale = 1.3;
      panelFired = false;
      smoothedInit = false;
      typeBlock?.classList.remove("is-scale-done");
      if (typeTitle) typeTitle.style.transform = `scale(1.3)`;
      scrollDistance = totalTravel;

      const vpRect = viewport.getBoundingClientRect();
      vpCenterX = vpRect.left + vpWidth / 2;
      rowBaseLeft = vpRect.left;

      // pre-position row off-screen to the right before the user reaches the pin
      works.style.setProperty("--works-track-offset", `${vpWidth}px`);

      cardMetrics = Array.from(row.querySelectorAll<HTMLElement>(".reel-card")).map((el) => ({
        el,
        centerInRow: el.offsetLeft + el.offsetWidth / 2,
      }));
    };

    const onResize = () => requestAnimationFrame(measure);

    // Mobile / reduced-motion fallback: the desktop tick() drives the panel
    // sweep via scroll progress; on mobile we fire it once via a scroll-driven
    // bounding-rect check (IntersectionObserver doesn't reliably fire inside
    // the pinning wrap on mobile). Triggered when the title block's top
    // crosses ~70% of the viewport, mimicking the desktop "scale-settled" feel.
    let mobilePanelFired = false;
    const onScrollMobile = () => {
      if (isActive() || mobilePanelFired || !typeBlock) return;
      const rect = typeBlock.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.7 && rect.bottom > 0) {
        mobilePanelFired = true;
        typeBlock.classList.add("is-scale-done");
      }
    };

    measure();
    onScrollMobile();
    rafId = requestAnimationFrame(tick);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScrollMobile, { passive: true });
    desktop.addEventListener("change", onResize);
    reducedMotion.addEventListener("change", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScrollMobile);
      desktop.removeEventListener("change", onResize);
      reducedMotion.removeEventListener("change", onResize);
    };
  }, []);

  return null;
}
