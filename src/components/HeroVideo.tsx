"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** 桌面端视频源（高画质，体积大） */
  src: string;
  /** 移动端视频源；不传则移动端只显示 poster，不加载视频 */
  mobileSrc?: string;
  /** 静态封面图（首帧）— 移动端首屏依赖它，必传 */
  poster?: string;
  /** ≤ 此宽度视为移动端，默认 768 */
  mobileBreakpoint?: number;
};

/**
 * Hero 视频：
 * - 服务端渲染时始终输出 poster + 桌面源占位（不会阻塞首屏；preload 由客户端决定）
 * - 客户端挂载后探测视口：
 *   · 桌面 → preload=auto, autoplay
 *   · 移动 → 若提供 mobileSrc 则切换源并 preload=metadata；否则完全不加载视频，仅显示 poster
 * - 微信内置浏览器（X5/TBS、iOS WKWebView）的兼容：
 *   · Android X5 内核：需要 x5-video-player-type=h5-inline 才能 inline 播放
 *   · iOS 微信：autoplay 可能要等 WeixinJSBridgeReady 才能成功；额外加 tap-to-play 兜底
 * - 避免 hydration mismatch：服务端不写 autoplay/preload，全部由 effect 设置
 */
export function HeroVideo({ src, mobileSrc, poster, mobileBreakpoint = 768 }: Props) {
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

    // 微信内核：补 X5/WKWebView 私有属性。React 不支持驼峰版，用 setAttribute 写。
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("x5-playsinline", "true");
    video.setAttribute("x5-video-player-type", "h5-inline");
    video.setAttribute("x5-video-player-fullscreen", "false");
    video.setAttribute("x5-video-orientation", "portraint");

    // 移动端：优先使用 mobileSrc；缺省时回退到桌面源，保证背景视频始终可见
    const nextSrc = mode === "mobile" ? (mobileSrc ?? src) : src;
    if (video.getAttribute("src") !== nextSrc) {
      video.setAttribute("src", nextSrc);
      video.load();
    }
    video.preload = mode === "mobile" ? "metadata" : "auto";

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    tryPlay();

    // 微信 iOS：autoplay 经常被拦，等 JSBridge 就绪后再尝试
    const ua = navigator.userAgent.toLowerCase();
    const isWeixin = ua.includes("micromessenger");
    const onBridgeReady = () => tryPlay();
    if (isWeixin) {
      // 已就绪的情况下直接重试；否则监听一次
      if (
        typeof window !== "undefined" &&
        (window as unknown as { WeixinJSBridge?: unknown }).WeixinJSBridge
      ) {
        tryPlay();
      } else {
        document.addEventListener("WeixinJSBridgeReady", onBridgeReady, { once: true });
      }
    }

    // 兜底：首次用户触摸/点击页面任意位置时再触发一次播放
    const onUserGesture = () => {
      tryPlay();
      document.removeEventListener("touchstart", onUserGesture);
      document.removeEventListener("click", onUserGesture);
    };
    document.addEventListener("touchstart", onUserGesture, { once: true, passive: true });
    document.addEventListener("click", onUserGesture, { once: true });

    return () => {
      document.removeEventListener("WeixinJSBridgeReady", onBridgeReady);
      document.removeEventListener("touchstart", onUserGesture);
      document.removeEventListener("click", onUserGesture);
    };
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
