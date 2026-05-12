"use client";

import TextType from "@/components/TextType";
import { useLanguage } from "@/lib/i18n";

const copyZh = "我们为时尚、运动、科技与生活方式品牌，\n创造由 AI 驱动的动态影像、品牌视觉系统与实验性内容。";
const copyEn = "AI-driven motion, brand systems, and experimental work\nfor fashion, sport, tech, and lifestyle brands.";

export function HeroTypewriterLede() {
  const lang = useLanguage();
  const isEn = lang === "en";
  const copy = isEn ? copyEn : copyZh;

  return (
    <div className="hero-lede-shell">
      <p className="hero-lede hero-lede-typing hero-lede-ghost" aria-hidden="true">
        {isEn ? (
          <>
            AI-driven motion, brand systems, and experimental work
            <br />
            for fashion, sport, tech, and lifestyle brands.
          </>
        ) : (
          <>
            我们为时尚、运动、科技与生活方式品牌，
            <br />
            创造由 AI 驱动的动态影像、品牌视觉系统与实验性内容。
          </>
        )}
      </p>
      <TextType
        key={lang}
        as="p"
        className="hero-lede hero-lede-typing hero-lede-live"
        text={copy}
        typingSpeed={140}
        deletingSpeed={70}
        pauseDuration={3200}
        loop
        showCursor
        cursorCharacter="_"
        cursorBlinkDuration={0.55}
      />
    </div>
  );
}
