"use client";

import type { ReactNode } from "react";
import { AboutRevealHeadline } from "@/components/AboutRevealHeadline";
import { useLanguage } from "@/lib/i18n";

type Props = {
  linesZh: ReactNode[];
  linesEn: ReactNode[];
};

export function BilingualAboutHeadline({ linesZh, linesEn }: Props) {
  const lang = useLanguage();
  return (
    <AboutRevealHeadline
      key={lang}
      lines={lang === "en" ? linesEn : linesZh}
    />
  );
}
