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
 * - 底层永远铺一张 <img poster>：保证视频未就绪 / 加载中 / 失败时背景都有图
 * - 视频层默认 SSR 不写 src（preload=none）→ 移动端首屏 0 字节视频
 * - 客户端挂载后探测视口：
 *   · 桌面 → 注入 desktop src，autoplay
 *   · 移动 + mobileSrc 存在 → 注入 mobile src，autoplay
 *   · 移动 + 无 mobileSrc → 视频层保持空，仅显示底图
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
      // 移动端无专用源 → 不挂任何 src，底图兜底显示
      if (video.getAttribute("src")) {
        video.removeAttribute("src");
        video.load();
      }
      return;
    }

    const nextSrc = mode === "mobile" ? mobileSrc! : src;
    if (video.getAttribute("src") !== nextSrc) {
      video.setAttribute("src", nextSrc);
      video.preload = mode === "mobile" ? "metadata" : "auto";
      video.load();
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        /* iOS / 微信首次需要用户手势失败，底图兜底 */
      });
    }
  }, [mode, src, mobileSrc]);

  return (
    <>
      {/* 永远存在的底图层：视频未就绪时是它顶住背景 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="hero-video hero-video-poster"
        src={poster}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
      />
      <video
        ref={videoRef}
        className="hero-video"
        poster={poster}
        loop
        muted
        playsInline
        preload="none"
        aria-hidden="true"
      />
    </>
  );
}
