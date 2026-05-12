"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** 桌面端视频源（高画质，体积大） */
  src: string;
  /** 移动端视频源；不传则移动端只显示 poster，不加载视频 */
  mobileSrc?: string;
  /** 静态封面图（首帧）— 移动端首屏依赖它，必传 */
  poster: string;
  /** ≤ 此宽度视为移动端，默认 820 */
  mobileBreakpoint?: number;
};

/**
 * Hero 视频：
 * - 服务端渲染时始终输出 poster + 桌面源占位（不会阻塞首屏；preload 由客户端决定）
 * - 客户端挂载后探测视口：
 *   · 桌面 → preload=auto, autoplay
 *   · 移动 → 若提供 mobileSrc 则切换源并 preload=metadata；否则完全不加载视频，仅显示 poster
 * - 避免 hydration mismatch：服务端不写 autoplay/preload，全部由 effect 设置
 */
export function HeroVideo({ src, mobileSrc, poster, mobileBreakpoint = 820 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<"pending" | "desktop" | "mobile">("pending");

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    const apply = () => setMode(mq.matches ? "mobile" : "desktop");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mobileBreakpoint]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || mode === "pending") return;

    if (mode === "mobile" && !mobileSrc) {
      // 移动端无专用源 → 不加载视频，只显示 poster
      video.removeAttribute("src");
      video.load();
      return;
    }

    const nextSrc = mode === "mobile" ? mobileSrc! : src;
    if (video.getAttribute("src") !== nextSrc) {
      video.setAttribute("src", nextSrc);
      video.load();
    }
    video.preload = mode === "mobile" ? "metadata" : "auto";
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        /* iOS / 微信首次需要用户手势，poster 会兜底 */
      });
    }
  }, [mode, src, mobileSrc]);

  return (
    <video
      ref={videoRef}
      className="hero-video"
      poster={poster}
      loop
      muted
      playsInline
      // SSR 阶段不设 src/preload/autoplay：避免首屏强制拉取 45MB
      preload="none"
      aria-hidden="true"
    />
  );
}
