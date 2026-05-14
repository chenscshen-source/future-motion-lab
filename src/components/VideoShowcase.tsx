"use client";

/* eslint-disable @next/next/no-img-element */
import { X } from "lucide-react";
import { useEffect, useRef, useState, type WheelEvent } from "react";
import { showcaseCategories } from "@/content/site";
import { useLanguage } from "@/lib/i18n";

type ShowcaseItem = (typeof showcaseCategories)[number];

const ROW_A: ShowcaseItem[] = [...showcaseCategories];

const totalLabel = String(showcaseCategories.length).padStart(2, "0");

export function VideoShowcase() {
  const lang = useLanguage();
  const isEn = lang === "en";
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<ShowcaseItem | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgTextRef = useRef<HTMLParagraphElement | null>(null);

  // Continuous scroll-driven slide-in for the NEURAL FILM watermark.
  // Maps section scroll progress to a CSS variable --bg-p (0 = parked
  // offscreen-left, 1 = at home). As the user scrolls into the works
  // section, --bg-p ramps 0 → 1; as they scroll past, it ramps back to 0.
  // Naturally repeatable in both directions — every scroll back into the
  // section re-plays the entry. Independent of WorksScrollDirector and
  // ScrollRevealObserver, so existing animations are untouched.
  useEffect(() => {
    const node = sectionRef.current;
    const text = bgTextRef.current;
    if (!node || !text) return;

    let raf = 0;
    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    // Easing — same curve as the previous transition for visual continuity.
    const ease = (t: number) => {
      // cubic-bezier(0.22, 1, 0.36, 1) approx — easeOutQuint
      return 1 - Math.pow(1 - t, 5);
    };

    const tick = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Trapezoidal progress:
      //   - ramp 0 → 1 as section.top travels from vh down to 0
      //   - hold at 1 while section straddles the viewport
      //   - ramp 1 → 0 as section.bottom travels from vh down to 0
      const enterP = clamp01((vh - rect.top) / vh);
      const exitP = clamp01(rect.bottom / vh);
      const p = ease(Math.min(enterP, exitP));
      text.style.setProperty("--bg-p", String(p));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const hasPreviewImages = (item: ShowcaseItem) => Boolean(item.previewImages?.length);

  useEffect(() => {
    if (!modalItem) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalItem(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalItem]);

  useEffect(() => {
    if (!modalItem) return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    body.classList.add("is-video-modal-open");
    documentElement.classList.add("is-video-modal-open");

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
      body.classList.remove("is-video-modal-open");
      documentElement.classList.remove("is-video-modal-open");
    };
  }, [modalItem]);

  const handleModalWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!modalItem || !hasPreviewImages(modalItem)) return;

    const gallery = galleryRef.current;
    if (!gallery) return;

    if (gallery.contains(event.target as Node)) {
      event.stopPropagation();
      return;
    }

    const deltaScale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? gallery.clientHeight : 1;
    gallery.scrollTop += event.deltaY * deltaScale;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleCardClick = (video: ShowcaseItem, isPlaying: boolean) => {
    if (hasPreviewImages(video) || video.videoSrc) {
      setModalItem(video);
      return;
    }
    setPlayingId(isPlaying ? null : video.id);
  };

  const renderCard = (video: ShowcaseItem, suffix: string) => {
    const isPlaying = video.id === playingId;
    const isLeadWide = video.index === "01" || video.index === "02" || video.index === "03" || video.index === "13";
    return (
      <article
        key={`${video.id}-${suffix}`}
        className={`reel-card ${video.tone} ${isLeadWide ? "is-lead-wide" : ""} ${isPlaying ? "is-playing" : ""}`}
      >
        <button
          type="button"
          className="reel-frame"
          onClick={() => handleCardClick(video, isPlaying)}
          aria-pressed={isPlaying}
          aria-label={`${
            hasPreviewImages(video)
              ? isEn ? "Preview" : "预览"
              : isPlaying
                ? isEn ? "Pause" : "暂停"
                : isEn ? "Play" : "播放"
          } ${isEn ? video.headline : video.headlineCn}`}
        >
          {video.coverSrc ? (
            <img className="reel-cover-image" src={video.coverSrc} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          ) : (
            <span className="reel-motion-layer" aria-hidden="true" />
          )}

          <span className="reel-hover-veil" aria-hidden="true" />

          <span className="reel-hover-meta">
            <span className="reel-hover-top">
              <span className="reel-hover-type">{isEn ? video.en : video.cn}</span>
            </span>
            <span className="reel-hover-rule" aria-hidden="true" />
            <span className="reel-hover-bottom">
              <span className="reel-hover-title">{isEn ? video.headline : video.headlineCn}</span>
              {(video.brand || video.brandEn) && (
                <span className="reel-hover-brand">
                  {isEn ? video.brandEn : video.brand}
                </span>
              )}
            </span>
          </span>

          <span className="reel-play-glyph" aria-hidden="true">
            {isPlaying ? "❚❚" : "▶"}
          </span>
        </button>
      </article>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="works-reel deck-page"
      id="works"
      aria-label={isEn ? "Selected works" : "作品集"}
    >
      <div className="works-pin-wrap">
        <div className="works-pin">
          <div className="works-type-block">
            <div className="works-type-inner">
              {isEn ? (
                <h2 className="works-type-title" aria-label="Cinema-scale. Studio-light.">
                  <span className="works-type-line">Cinema-scale.</span>
                  <span className="works-type-line">Studio-light.</span>
                </h2>
              ) : (
                <h2 className="works-type-title" aria-label="大片，也能很轻">
                  <span className="works-type-line">大片，</span>
                  <span className="works-type-line">也能很轻。</span>
                </h2>
              )}
              <div className="works-type-panel" aria-hidden="true" />
            </div>
            <div className="works-type-meta">
              <span className="works-type-blink" aria-hidden="true">▌</span>
              <span className="works-type-tag">{"//"} WORKS</span>
              <span className="works-type-dot" aria-hidden="true">·</span>
              <span>{totalLabel} REELS</span>
            </div>
          </div>

          <div className="reel-rows" aria-label={isEn ? "Works list" : "作品列表"}>
            <div className="reel-row reel-row-a">
              {ROW_A.map((video, i) => renderCard(video, `a-${i}`))}
            </div>
          </div>

          <p
            ref={bgTextRef}
            className="works-bg-text"
            aria-hidden="true"
          >
            NEURAL FILM
          </p>
        </div>
      </div>

      {modalItem && (modalItem.videoSrc || hasPreviewImages(modalItem)) && (
        <div className="video-modal" role="dialog" aria-modal="true" aria-label={isEn ? modalItem.headline : modalItem.headlineCn} onClick={() => setModalItem(null)} onWheelCapture={handleModalWheel} data-lenis-prevent-wheel>
          <div className="video-modal-shell" onClick={(event) => event.stopPropagation()}>
            <button className="video-modal-close" type="button" aria-label={isEn ? "Close preview" : "关闭预览"} onClick={() => setModalItem(null)}>
              <X size={22} strokeWidth={1.5} />
            </button>
            {hasPreviewImages(modalItem) ? (
              <div className="video-modal-scroll-gallery" ref={galleryRef} data-lenis-prevent data-lenis-prevent-wheel>
                {modalItem.previewImages?.map((imageSrc, imageIndex) => (
                  <figure key={imageSrc} className="video-modal-page">
                    <img src={imageSrc} alt={isEn ? `${modalItem.headline} — image ${imageIndex + 1}` : `${modalItem.headlineCn} 第 ${imageIndex + 1} 张`} loading={imageIndex > 0 ? "lazy" : "eager"} />
                  </figure>
                ))}
              </div>
            ) : (
              <div className="video-modal-player">
                <video
                  src={modalItem.videoSrc}
                  poster={modalItem.coverSrc}
                  controls
                  playsInline
                  preload="metadata"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
