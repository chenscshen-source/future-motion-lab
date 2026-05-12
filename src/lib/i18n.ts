"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "zh" | "en";

export const LANG_COOKIE = "site-lang";
const EVENT_NAME = "fml:langchange";
// One year — matches localStorage's effective persistence.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const LangContext = createContext<Lang>("zh");

/** Server-rendered wrapper that seeds the initial language for all client
 *  consumers, eliminating the SSR → client mismatch on `<html lang>` and any
 *  bilingual UI text. */
export function LangProvider({
  value,
  children,
}: {
  value: Lang;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<Lang>(value);

  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<Lang>).detail;
      if (detail === "zh" || detail === "en") setLang(detail);
    };
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  return createElement(LangContext.Provider, { value: lang }, children);
}

export function useLanguage(): Lang {
  return useContext(LangContext);
}

export function setLanguage(next: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = next === "en" ? "en" : "zh-CN";
  document.documentElement.dataset.lang = next;
  try {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    window.localStorage.setItem(LANG_COOKIE, next);
  } catch {}
  window.dispatchEvent(new CustomEvent<Lang>(EVENT_NAME, { detail: next }));
}

export function t<T>(lang: Lang, zh: T, en: T): T {
  return lang === "en" ? en : zh;
}
