"use client";

import { useEffect, useState } from "react";

export function BootLoader() {
  const [phase, setPhase] = useState<"intro" | "split" | "done">("intro");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    const splitTimer = window.setTimeout(() => setPhase("split"), 380);
    const doneTimer = window.setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
    }, 1280);

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
