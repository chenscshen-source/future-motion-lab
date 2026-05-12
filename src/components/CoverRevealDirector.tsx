"use client";

import { useEffect } from "react";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const easeInOut = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

export function CoverRevealDirector() {
  useEffect(() => {
    let cancelled = false;
    let retryId = 0;
    let cleanupScene: (() => void) | undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bindScene = (scene: HTMLElement) => {
      if (reduceMotion) {
        scene.style.setProperty("--about-raw-progress", "1");
        scene.style.setProperty("--cover-reveal-progress", "1");
        scene.style.setProperty("--about-motion-progress", "1");
        scene.style.setProperty("--contact-enter-progress", "1");
        scene.style.setProperty("--contact-parallax-progress", "1");
        scene.style.setProperty("--contact-read-progress", "1");
        scene.classList.add("is-contact-staged");
        scene.classList.add("is-contact-revealing");
        return undefined;
      }

      const contact = scene.querySelector<HTMLElement>("[data-contact-section]");
      const contactMeta = contact?.querySelector<HTMLElement>(".manifesto-meta");
      const contactLede = contact?.querySelector<HTMLElement>(".manifesto-lede");
      const contactHeadline = contact?.querySelector<HTMLElement>(".manifesto-headline");
      const contactCards = contact
        ? Array.from(contact.querySelectorAll<HTMLElement>(".person-card"))
        : [];
      let rafId = 0;
      let sceneTop = 0;
      let sceneScrollable = 1;
      let contactOverflow = 0;
      let vh = 1;

      const measure = () => {
        vh = window.innerHeight || document.documentElement.clientHeight || 1;
        const rect = scene.getBoundingClientRect();
        sceneTop = rect.top + window.scrollY;

        if (contact) {
          contactOverflow = Math.ceil(Math.max(0, contact.scrollHeight - vh));
          scene.style.setProperty("--contact-overflow-y", `${contactOverflow}px`);
        }

        sceneScrollable = Math.max(1, scene.offsetHeight - vh);
        scene.style.setProperty(
          "--contact-anchor-top",
          `${Math.ceil(sceneScrollable * 0.9)}px`,
        );
      };

      const tick = () => {
        rafId = requestAnimationFrame(tick);

        const y = window.scrollY;
        const rawProgress = clamp01((y - sceneTop) / sceneScrollable);
        const aboutProgress = easeInOut((y - sceneTop) / (vh * 0.55));
        const coverProgress = easeInOut((rawProgress - 0.24) / 0.52);
        // Contact entry begins while the about curtain is still visibly lifting.
        // At the half-open state, the lower stage should already read as Contact,
        // not as an empty black field.
        const contactMotionProgress = easeInOut(clamp01((rawProgress - 0.4) / 0.34));
        const contactEnterProgress = easeInOut(clamp01(contactMotionProgress / 0.46));
        // Contact parallax: rises from the bottom of its module across the full
        // cover sweep, settling at progress=1. Runs ahead of entry so by the time
        // the section becomes visible it's already partway through its rise.
        const contactParallaxProgress = contactMotionProgress;
        const contactReadProgress = easeInOut((rawProgress - 0.9) / 0.1);

        // Stage the contact section as soon as the curtain starts moving, so
        // the lower half is already alive while About is still lifting away.
        const metaParallax = easeInOut(clamp01(contactMotionProgress / 0.38));
        const ledeParallax = easeInOut(clamp01((contactMotionProgress - 0.04) / 0.44));
        const headlineParallax = easeInOut(clamp01((contactMotionProgress - 0.08) / 0.46));
        contactMeta?.style.setProperty(
          "--contact-layer-y",
          `${((1 - metaParallax) * -44).toFixed(1)}px`,
        );
        contactLede?.style.setProperty(
          "--contact-layer-y",
          `${((1 - ledeParallax) * 96).toFixed(1)}px`,
        );
        contactHeadline?.style.setProperty(
          "--contact-layer-y",
          `${((1 - headlineParallax) * 58).toFixed(1)}px`,
        );
        contactCards.forEach((card, i) => {
          const cardProgress = easeInOut(
            clamp01((contactMotionProgress - 0.02 - i * 0.04) / 0.44),
          );
          const cardParallax = easeInOut(
            clamp01((contactMotionProgress - 0.06 - i * 0.06) / 0.48),
          );
          card.style.setProperty("--contact-scroll-card-progress", cardProgress.toFixed(4));
          card.style.setProperty(
            "--contact-card-parallax-y",
            `${((1 - cardParallax) * (i === 0 ? 120 : 164)).toFixed(1)}px`,
          );
        });

        scene.classList.toggle("is-contact-staged", coverProgress >= 0.08);
        scene.classList.toggle("is-contact-revealing", coverProgress >= 0.18);
        scene.style.setProperty("--about-raw-progress", rawProgress.toFixed(4));
        scene.style.setProperty("--about-motion-progress", aboutProgress.toFixed(4));
        scene.style.setProperty("--cover-reveal-progress", coverProgress.toFixed(4));
        scene.style.setProperty("--contact-enter-progress", contactEnterProgress.toFixed(4));
        scene.style.setProperty("--contact-parallax-progress", contactParallaxProgress.toFixed(4));
        scene.style.setProperty("--contact-read-progress", contactReadProgress.toFixed(4));
        scene.style.setProperty(
          "--contact-read-y",
          `${(-contactOverflow * contactReadProgress).toFixed(1)}px`,
        );
      };

      const onResize = () => requestAnimationFrame(measure);
      const resizeObserver = contact ? new ResizeObserver(measure) : null;

      measure();
      resizeObserver?.observe(contact!);
      rafId = requestAnimationFrame(tick);
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
        resizeObserver?.disconnect();
      };
    };

    const attachWhenReady = () => {
      if (cancelled || cleanupScene) return;
      const scene = document.querySelector<HTMLElement>("[data-cover-reveal-scene]");
      if (scene) {
        cleanupScene = bindScene(scene);
        return;
      }
      retryId = requestAnimationFrame(attachWhenReady);
    };

    attachWhenReady();

    return () => {
      cancelled = true;
      cancelAnimationFrame(retryId);
      cleanupScene?.();
    };
  }, []);

  return null;
}
