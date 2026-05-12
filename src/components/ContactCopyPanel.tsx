"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useLanguage } from "@/lib/i18n";

const contacts = [
  {
    name: "CHEN",
    role: "CO-FOUNDER",
    email: "chen.sc.shen@gmail.com",
    qr: "/wechat-chen.svg",
  },
  {
    name: "SEAN",
    role: "CO-FOUNDER",
    email: "seanloloside@gmail.com",
    qr: "/wechat-sean.svg",
  },
];

export function ContactCopyPanel() {
  const lang = useLanguage();
  const isEn = lang === "en";
  const [copied, setCopied] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (el.closest("[data-cover-reveal-scene]")) return;

    const cards = Array.from(
      el.querySelectorAll<HTMLElement>(".person-card"),
    );
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "is-revealed",
            entry.isIntersecting,
          );
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.18 },
    );

    cards.forEach((card, i) => {
      card.style.setProperty("--card-delay", `${i * 220}ms`);
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const f = document.createElement("textarea");
      f.value = value;
      f.style.position = "fixed";
      f.style.opacity = "0";
      document.body.appendChild(f);
      f.select();
      document.execCommand("copy");
      document.body.removeChild(f);
    }
    setCopied(value);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div
      className="dispatch-panel dispatch-panel--reveal"
      ref={panelRef}
      aria-label="Contact channels"
    >
      <div className="dispatch-people" aria-label={isEn ? "Contacts" : "联系人"}>
        {contacts.map((person) => (
          <article className="person-card" key={person.email}>
            <div className="person-card-scanline" aria-hidden="true" />
            <div className="person-main">
              <p className="person-meta">
                <span>{person.role}</span>
              </p>
              <h3 className="person-name" aria-label={person.name}>
                {Array.from(person.name).map((ch, i) => (
                  <span
                    key={i}
                    className="person-name-char"
                    style={{ "--char-i": i } as CSSProperties}
                    aria-hidden="true"
                  >
                    {ch}
                  </span>
                ))}
              </h3>
              <div className="person-email-row">
                <strong className="person-email">{person.email}</strong>
                <button
                  type="button"
                  className="row-copy"
                  onClick={() => copy(person.email)}
                >
                  {copied === person.email ? (
                    <>
                      <Check size={12} strokeWidth={2} /> COPIED
                    </>
                  ) : (
                    <>
                      <Copy size={12} strokeWidth={2} /> COPY
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="qr-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={person.qr}
                alt={isEn ? `${person.name} WeChat QR code` : `${person.name} 微信二维码`}
                className="qr-img"
              />
              <span className="qr-scan" aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
