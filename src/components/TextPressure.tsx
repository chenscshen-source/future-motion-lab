"use client";

// Component ported from https://codepen.io/JuanFuentes/full/rgXKGQ
// Adapted: also drives fontWeight + scale per char so non-variable fonts
// (e.g. Chinese display fonts) show the pressure effect visibly.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type Pt = { x: number; y: number };

const dist = (a: Pt, b: Pt) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (
  distance: number,
  maxDist: number,
  minVal: number,
  maxVal: number,
) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = <Args extends unknown[]>(
  func: (...args: Args) => void,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export type TextPressureProps = {
  text?: string;
  /** Use the page's display font by default; pass a variable font name to enable real VF axes. */
  fontFamily?: string;
  /** Optional URL for a variable @font-face. */
  fontUrl?: string;

  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;

  /** Floor/ceiling for the cursor-driven weight axis. Default 100/900. */
  weightMin?: number;
  weightMax?: number;
  /** Floor/ceiling for the cursor-driven width axis. Default 5/200. */
  widthMin?: number;
  widthMax?: number;

  flex?: boolean;
  scale?: boolean;

  textColor?: string;
  className?: string;

  minFontSize?: number;
  /** Optional CSS font-size override; if omitted, auto-fits the container. */
  fontSize?: string | number;
  style?: CSSProperties;
  letterSpacing?: string;
};

const TextPressure = ({
  text = "Compressa",
  fontFamily,
  fontUrl,

  width = true,
  weight = true,
  italic = false,
  alpha = false,

  weightMin = 100,
  weightMax = 900,
  widthMin = 5,
  widthMax = 200,

  flex = true,
  scale = false,

  textColor = "#FFFFFF",
  className = "",

  minFontSize = 24,
  fontSize: fontSizeProp,
  style,
  letterSpacing,
}: TextPressureProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  const mouseRef = useRef<Pt>({ x: 0, y: 0 });
  const cursorRef = useRef<Pt>({ x: 0, y: 0 });

  const [autoFontSize, setAutoFontSize] = useState<number>(minFontSize);
  const [scaleY, setScaleY] = useState<number>(1);
  const [lineHeight, setLineHeight] = useState<number>(1);

  // Array.from handles surrogate pairs / CJK reliably.
  const chars = useMemo(() => Array.from(text), [text]);
  const useAutoSize = fontSizeProp === undefined;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width: w, height: h } =
        containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + w / 2;
      mouseRef.current.y = top + h / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!useAutoSize) return;
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } =
      containerRef.current.getBoundingClientRect();

    let next = containerW / Math.max(chars.length / 2, 1);
    next = Math.max(next, minFontSize);

    setAutoFontSize(next);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();
      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale, useAutoSize]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener("resize", debouncedSetSize);
    return () => window.removeEventListener("resize", debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId = 0;
    const animate = () => {
      mouseRef.current.x +=
        (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y +=
        (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = Math.max(titleRect.width / 2, 1);

        spansRef.current.forEach((span) => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          };

          const d = dist(mouseRef.current, charCenter);

          const clampToRange = (raw: number, lo: number, hi: number) =>
            Math.min(hi, Math.max(lo, raw));
          const wdth = width
            ? Math.floor(clampToRange(getAttr(d, maxDist, widthMin, widthMax), widthMin, widthMax))
            : 100;
          const wght = weight
            ? Math.floor(clampToRange(getAttr(d, maxDist, weightMin, weightMax), weightMin, weightMax))
            : 400;
          const italVal = italic
            ? Number(getAttr(d, maxDist, 0, 1).toFixed(2))
            : 0;
          const alphaVal = alpha
            ? Number(getAttr(d, maxDist, 0, 1).toFixed(2))
            : 1;

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
          if (
            span.style.fontVariationSettings !== newFontVariationSettings
          ) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }

          // Visible fallbacks (CSS axes that work on any font):
          if (weight) {
            const wStr = String(wght);
            if (span.style.fontWeight !== wStr) span.style.fontWeight = wStr;
          }

          // wdth → horizontal scale (1 → narrow ~0.85, 200 → wide ~1.18)
          // wght → vertical scale (100 → 0.96, 900 → 1.10)
          if (width || weight) {
            const sx = width ? 0.85 + (wdth / 200) * 0.33 : 1;
            const sy = weight ? 0.96 + ((wght - 100) / 800) * 0.14 : 1;
            const t = `scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
            if (span.style.transform !== t) span.style.transform = t;
          }

          if (alpha) {
            const aStr = String(alphaVal);
            if (span.style.opacity !== aStr) span.style.opacity = aStr;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, [width, weight, italic, alpha, weightMin, weightMax, widthMin, widthMax]);

  const fontFaceCss = useMemo(() => {
    if (!fontFamily || !fontUrl) return null;
    return (
      <style>{`
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}');
          font-style: normal;
          font-display: swap;
        }
      `}</style>
    );
  }, [fontFamily, fontUrl]);

  const dynamicClassName = [className, flex ? "tp-flex" : ""]
    .filter(Boolean)
    .join(" ");

  const resolvedFontSize =
    fontSizeProp !== undefined ? fontSizeProp : autoFontSize;

  return (
    <div
      ref={containerRef}
      className="text-pressure-root"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "transparent",
        ...style,
      }}
    >
      {fontFaceCss}
      <h1
        ref={titleRef}
        className={`text-pressure-title ${dynamicClassName}`}
        style={{
          fontFamily: fontFamily || "inherit",
          textTransform: "none",
          fontSize: resolvedFontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: "center top",
          margin: 0,
          textAlign: "inherit",
          userSelect: "none",
          whiteSpace: "nowrap",
          fontWeight: 100,
          width: "100%",
          color: textColor,
          letterSpacing,
          display: flex ? "flex" : "block",
          justifyContent: flex ? "space-between" : undefined,
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              spansRef.current[i] = el;
            }}
            data-char={char}
            style={{
              display: "inline-block",
              color: textColor,
              transformOrigin: "center center",
              willChange: "transform, font-weight, filter, opacity",
              ["--char-i" as string]: i,
            }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;
