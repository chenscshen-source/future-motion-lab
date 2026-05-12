"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { navItems } from "@/content/site";
import { scrollToSection as scrollTo } from "@/lib/scroll";

const sectionIds = navItems.map((item) => item.href.replace("#", ""));

export function Topbar() {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    const observed = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        root: null,
        rootMargin: "-32% 0px -52% 0px",
        threshold: [0.12, 0.28, 0.48],
      },
    );

    observed.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const goToSection = (id: string) => {
    setActiveId(id);
    scrollTo(id);
  };

  return (
    <header className="topbar">
      <a
        className="brandline brand-logo"
        href="#lab"
        aria-label="Future Motion Lab"
        onClick={(event) => {
          event.preventDefault();
          goToSection("lab");
        }}
      >
        <Image
          src="/logo-horizontal.svg"
          alt="Future Motion Lab"
          width={173}
          height={58}
          priority
        />
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => {
          const id = item.href.replace("#", "");
          const isActive = id === activeId;
          return (
            <a
              key={item.label}
              className={isActive ? "active" : ""}
              href={item.href}
              aria-current={isActive ? "true" : undefined}
              onClick={(event) => {
                event.preventDefault();
                goToSection(id);
              }}
            >
              <span className="i18n-zh">{item.label}</span>
              <span className="i18n-en">{item.labelEn}</span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}
