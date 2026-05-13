"use client";

import { useEffect, useState } from "react";

export function BootLoader() {
  const [phase, setPhase] = useState<"intro" | "split" | "done">("intro");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 820px)").matches;
    document.body.style.overflow = "hidden";

    if (reduceMotion) {
      const t = window.setTimeout(() => {
        setPhase("done");
        document.body.style.overflow = "";
      }, 200);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    }

    // 节奏：先让 logo + tagline 充分入场，再做分屏退出。
    // 分屏 CSS 过渡是 850ms，所以 doneDelay 必须 ≥ splitDelay + 850
    // 否则 loader 会在分屏动画跑完前被卸载（视觉上"啪"地消失）。
    const splitDelay = isMobile ? 1100 : 1400;
    const doneDelay = isMobile ? 2000 : 2350;

    const splitTimer = window.setTimeout(() => setPhase("split"), splitDelay);
    const doneTimer = window.setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
    }, doneDelay);

    return () => {
      window.clearTimeout(splitTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "done") return null;

  const splitting = phase === "split";

  return (
    <div className={`boot-loader ${splitting ? "is-splitting" : ""}`} aria-hidden="true">
      <div className="boot-half boot-half-top" />
      <div className="boot-half boot-half-bottom" />
      <div className="boot-mark-stack">
        <img src="/logo.svg" alt="" className="boot-mark" />
        <span className="boot-mark-tagline i18n-zh">未来接口动态实验室</span>
        <span className="boot-mark-tagline i18n-en">Future Motion Lab</span>
      </div>
    </div>
  );
}
