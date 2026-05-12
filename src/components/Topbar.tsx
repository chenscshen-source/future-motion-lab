"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navItems } from "@/content/site";
import { scrollToSection as scrollTo } from "@/lib/scroll";

const sectionIds = navItems.map((item) => item.href.replace("#", ""));

export function Topbar() {
  const [activeId, setActiveId] = useState(sectionIds[0]);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // 抽屉开启时锁定背景滚动 + ESC 关闭
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const goToSection = (id: string) => {
    setActiveId(id);
    setMenuOpen(false);
    scrollTo(id);
  };

  return (
    <>
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

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </header>

      <div
        id="mobile-nav-drawer"
        className={`nav-drawer ${menuOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      >
        <nav
          className="nav-drawer-list"
          aria-label="Mobile navigation"
          onClick={(event) => event.stopPropagation()}
        >
          {navItems.map((item, index) => {
            const id = item.href.replace("#", "");
            const isActive = id === activeId;
            return (
              <a
                key={item.label}
                href={item.href}
                className={isActive ? "active" : ""}
                style={{ ["--i" as string]: index }}
                onClick={(event) => {
                  event.preventDefault();
                  goToSection(id);
                }}
              >
                <span className="nav-drawer-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="nav-drawer-label">
                  <span className="i18n-zh">{item.label}</span>
                  <span className="i18n-en">{item.labelEn}</span>
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
}
