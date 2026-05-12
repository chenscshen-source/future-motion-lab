"use client";

import React, { type CSSProperties, type ReactNode, useEffect, useLayoutEffect, useRef } from "react";

type AboutRevealHeadlineProps = {
  lines: ReactNode[];
};

// Use layout effect on the client; fall back to plain effect on the server (no-op).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Walk the DOM under `root` and wrap every character in a Text node inside a
// .char-unit <span>, assigning a sequential --char-index. This runs after
// render so it sidesteps React Server Component prop serialization quirks.
function splitCharsInDom(root: HTMLElement) {
  if (root.dataset.charsSplit === "1") return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) textNodes.push(n as Text);
  let idx = 0;
  for (const tn of textNodes) {
    const text = tn.nodeValue ?? "";
    if (!text) continue;
    const frag = document.createDocumentFragment();
    for (const ch of Array.from(text)) {
      if (ch === " " || ch === " ") {
        frag.appendChild(document.createTextNode(ch));
        continue;
      }
      const span = document.createElement("span");
      span.className = "char-unit";
      span.style.setProperty("--char-index", String(idx));
      span.textContent = ch;
      frag.appendChild(span);
      idx++;
    }
    tn.parentNode?.replaceChild(frag, tn);
  }
  root.dataset.charsSplit = "1";
}

export function AboutRevealHeadline({ lines }: AboutRevealHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useIsoLayoutEffect(() => {
    const headline = ref.current;
    if (!headline) return;
    headline.querySelectorAll<HTMLElement>(".reveal-line").forEach(splitCharsInDom);
  }, [lines]);

  useEffect(() => {
    const headline = ref.current;
    if (!headline) return;

    const lineEls = Array.from(headline.querySelectorAll<HTMLElement>(".reveal-line"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-lit");
          } else {
            (entry.target as HTMLElement).classList.remove("is-lit");
          }
        });
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px 0px -20% 0px",
      }
    );

    lineEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const headline = ref.current;
    if (!headline) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const MIN_SCALE = 0.7;
    const RELEASE_PROGRESS = 0.35;
    const LINE_FADE_START = 0;
    const LINE_FADE_STEP = 0.035;
    const LINE_FADE_SPAN = 0.45;
    const CARD_BOTTOM_TIGHTEN_VH = 0.16;

    const scene = headline.closest<HTMLElement>(".about-pin-scene");
    if (!scene) return;
    const section = scene.querySelector<HTMLElement>(".manifesto-section");
    if (!section) return;
    const coverScene = scene.closest<HTMLElement>(".about-contact-cover-scene");

    type CardSpec = {
      startY: number;
      rotate: number;
      travelVh: number;
      startScale: number;
    };
    const cardSpecs: CardSpec[] = [
      { startY: -20, rotate: 0, travelVh: 0.95, startScale: 0.68 },
      { startY: 150, rotate: 0, travelVh: 0.74, startScale: 0.64 },
      { startY: 45, rotate: 0, travelVh: 0.9, startScale: 0.66 },
    ];
    const cards = Array.from(
      scene.querySelectorAll<HTMLElement>(".pillar-card")
    );
    const bottomWord = scene.querySelector<HTMLElement>(".manifesto-bottom-word");
    const lineEls = Array.from(headline.querySelectorAll<HTMLElement>(".reveal-line"));

    let rafId = 0;
    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const offsetTopWithin = (el: HTMLElement, root: HTMLElement) => {
      let top = 0;
      let node: HTMLElement | null = el;
      while (node && node !== root) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return top;
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const sectionRect = section.getBoundingClientRect();
      let progress = 0;
      if (coverScene) {
        const coverProgress = Number.parseFloat(
          getComputedStyle(coverScene).getPropertyValue("--about-motion-progress"),
        );
        progress = Number.isFinite(coverProgress) ? clamp01(coverProgress) : 0;
      } else {
        const sceneRect = scene.getBoundingClientRect();
        const pinDistance = Math.max(1, sceneRect.height - vh);
        const animationDistance = pinDistance / RELEASE_PROGRESS;
        const scrolled = -sceneRect.top;
        if (scrolled <= 0) progress = 0;
        else if (scrolled >= animationDistance) progress = 1;
        else progress = scrolled / animationDistance;
      }
      const scale = 1 - (1 - MIN_SCALE) * progress;
      headline.style.setProperty("--about-shrink", scale.toFixed(4));
      bottomWord?.style.setProperty(
        "--manifesto-word-y",
        `${(-progress * 42).toFixed(1)}vh`,
      );

      for (let i = 0; i < lineEls.length; i++) {
        const bottomFirstIndex = lineEls.length - 1 - i;
        const fadeStart = LINE_FADE_START + bottomFirstIndex * LINE_FADE_STEP;
        const fadeProgress = clamp01((progress - fadeStart) / LINE_FADE_SPAN);
        lineEls[i].style.setProperty("--line-fade", (1 - fadeProgress).toFixed(4));
      }

      for (let i = 0; i < cards.length; i++) {
        const spec = cardSpecs[i] ?? cardSpecs[cardSpecs.length - 1];
        const y =
          spec.startY -
          spec.travelVh * vh * progress +
          CARD_BOTTOM_TIGHTEN_VH * vh * progress;
        const baseCenterY =
          sectionRect.top + offsetTopWithin(cards[i], section) + cards[i].offsetHeight / 2;
        const projectedCenterY = baseCenterY + y;
        const scaleProgress = clamp01(1 - (projectedCenterY - vh * 0.5) / (vh * 0.5));
        const scale = spec.startScale + (1 - spec.startScale) * scaleProgress;
        cards[i].style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${spec.rotate.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <h2 className="manifesto-headline reveal-headline" ref={ref}>
      {lines.map((line, index) => (
        <span
          className="reveal-line"
          key={index}
          style={{ "--line-index": index } as CSSProperties}
        >
          {line}
        </span>
      ))}
    </h2>
  );
}
