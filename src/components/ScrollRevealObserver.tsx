"use client";

import { useEffect } from "react";

/**
 * Singleton observer — watches every [data-reveal] element in the document.
 * Adds "is-revealed" once the element crosses the viewport threshold.
 * Fire-once: observer unregisters the element immediately after it fires.
 */
export function ScrollRevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.05 }
    );

    document
      .querySelectorAll<HTMLElement>("[data-reveal]")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
