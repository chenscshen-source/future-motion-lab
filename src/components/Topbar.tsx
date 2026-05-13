"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { navItems } from "@/content/site";
import { setLanguage, useLanguage } from "@/lib/i18n";
import { scrollToSection as scrollTo } from "@/lib/scroll";

const sectionIds = navItems.map((item) => item.href.replace("#", ""));

export function Topbar() {
  const [activeId, setActiveId] = useState(sectionIds[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const lang = useLanguage();

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

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const goToSection = (id: string) => {
    setActiveId(id);
    setMenuOpen(false);
    scrollTo(id);
  };

  return (
    <header className={`topbar${menuOpen ? " is-menu-open" : ""}`}>
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
      <nav
        id="topbar-nav"
        className={`nav-links${menuOpen ? " is-open" : ""}`}
        aria-label="Primary navigation"
      >
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
      <div
        className="topbar-lang-toggle rail-lang-toggle"
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
      <button
        type="button"
        className="topbar-menu-btn"
        aria-label={menuOpen ? "Close menu / 关闭菜单" : "Open menu / 打开菜单"}
        aria-expanded={menuOpen}
        aria-controls="topbar-nav"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span className="topbar-menu-bar" aria-hidden="true" />
        <span className="topbar-menu-bar" aria-hidden="true" />
      </button>
    </header>
  );
}
