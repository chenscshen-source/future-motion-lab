"use client";

import { useEffect, useMemo, useState } from "react";
import { navItems } from "@/content/site";
import { setLanguage, useLanguage } from "@/lib/i18n";
import { scrollToSection as scrollTo } from "@/lib/scroll";

export function SectionRail() {
  const sections = useMemo(
    () =>
      navItems.map((item, i) => ({
        id: item.href.replace("#", ""),
        index: String(i + 1).padStart(2, "0"),
        label: item.label,
        labelEn: item.labelEn,
        sub: item.sub,
      })),
    [],
  );
  const [activeId, setActiveId] = useState(sections[0].id);
  const lang = useLanguage();

  useEffect(() => {
    let rafId = 0;
    let lastId = "";

    // Single coalesced compute per scroll/resize via rAF. Replaces a permanent
    // 60fps loop that ran even when the page was idle.
    const compute = () => {
      rafId = 0;
      const probeY = window.innerHeight * 0.4;
      // DOM order; the LATEST section whose rect overlaps the probe wins so
      // later sections beat the sticky `#lab` once they enter the viewport.
      let pick = sections[0].id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= probeY && r.bottom > probeY) {
          pick = section.id;
        }
      }
      if (pick !== lastId) {
        lastId = pick;
        setActiveId(pick);
      }
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const goToSection = (id: string) => {
    setActiveId(id);
    scrollTo(id);
  };

  return (
    <aside
      className="side-rail right-rail section-rail"
      aria-label={lang === "en" ? "Section index" : "目录导航"}
    >
      <div
        className="rail-lang-toggle"
        role="group"
        aria-label="Switch language / 切换语言"
      >
        <button
          type="button"
          className={lang === "zh" ? "is-active" : ""}
          onClick={() => lang !== "zh" && setLanguage("zh")}
          aria-pressed={lang === "zh"}
        >
          中文
        </button>
        <span className="rail-lang-divider" aria-hidden="true" />
        <button
          type="button"
          className={lang === "en" ? "is-active" : ""}
          onClick={() => lang !== "en" && setLanguage("en")}
          aria-pressed={lang === "en"}
        >
          EN
        </button>
      </div>
      <div className="section-rail-core">
        <div className="section-rail-title" aria-hidden="true">
          <small>INDEX</small>
        </div>
        <nav
          className="section-nav"
          aria-label={lang === "en" ? "Page index" : "页面目录"}
        >
          {sections.map((section) => {
            const isActive = section.id === activeId;
            const label = lang === "en" ? section.labelEn : section.label;

            return (
              <a
                key={section.id}
                className={isActive ? "is-active" : ""}
                href={`#${section.id}`}
                data-label={`${label} / ${section.sub}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  goToSection(section.id);
                }}
              >
                <span className="nav-cursor" aria-hidden="true">{isActive ? "▸" : ""}</span>
                <span className="nav-num">{section.index}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
