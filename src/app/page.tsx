import { BootLoader } from "@/components/BootLoader";
import { ScrollRevealWords } from "@/components/ScrollRevealWords";
import { BilingualAboutHeadline } from "@/components/BilingualAboutHeadline";
import { AboutLedeScrollLines } from "@/components/AboutLedeScrollLines";
import { CinematicHeadline } from "@/components/CinematicHeadline";
import { ContactCopyPanel } from "@/components/ContactCopyPanel";
import { CoverRevealDirector } from "@/components/CoverRevealDirector";
import TextPressure from "@/components/TextPressure";
import { HeroTypewriterLede } from "@/components/HeroTypewriterLede";
import { HeroParallax } from "@/components/HeroParallax";
import { HeroVideo } from "@/components/HeroVideo";
import { LenisScroll } from "@/components/LenisScroll";
import { SectionParallax } from "@/components/SectionParallax";
import { ScrollRevealObserver } from "@/components/ScrollRevealObserver";
import { SectionRail } from "@/components/SectionRail";
import { Topbar } from "@/components/Topbar";
import { VideoShowcase } from "@/components/VideoShowcase";
import { WorksScrollDirector } from "@/components/WorksScrollDirector";
import Image from "next/image";
import { aboutPillars } from "@/content/site";
import { Fragment, type CSSProperties } from "react";

const aboutHeadlineLinesZh = [
  <span key="ai">
    一间用<span className="accent-mark">生成式 AI</span>
  </span>,
  <span key="motion">
    做<span className="accent-mark">动态影像</span>的工作室。
  </span>,
  <span key="brands" className="is-nowrap">服务时尚、运动、科技、生活方式。</span>,
  <span key="films">
    做品牌大片，做<span className="accent-mark">社媒短片</span>，
  </span>,
  <span key="social">
    做<span className="accent-mark">种草内容</span>。
  </span>,
  <span key="deliver">
    创意，直接变成<span className="accent-mark">可上线的画面</span>。
  </span>,
];

const aboutHeadlineLinesEn = [
  <span key="ai">
    A studio built on <span className="accent-mark">generative AI</span>,
  </span>,
  <span key="motion">
    for <span className="accent-mark">motion</span> that moves.
  </span>,
  <span key="brands">
    For <span className="accent-mark">fashion</span>, sport, tech, lifestyle.
  </span>,
  <span key="films">
    Hero films. <span className="accent-mark">Social cuts.</span>
  </span>,
  <span key="social">
    Content that <span className="accent-mark">earns the scroll</span>.
  </span>,
  <span key="deliver">
    From idea to <span className="accent-mark">broadcast</span>, fast.
  </span>,
];

export default function Home() {
  return (
    <main className="site-shell">
      <BootLoader />
      <LenisScroll />
      <HeroParallax />
      <CoverRevealDirector />
      <SectionParallax />
      <ScrollRevealObserver />
      <SectionRail />
      <WorksScrollDirector />

      <div className="site-frame">
        <Topbar />

        <section className="deck-page home-deck" id="lab">
          <section className="hero-section">
            <HeroVideo src="/videos/automotive-hero.mp4" />
            <div className="hero-signature" aria-label="By Sean & Chen">
              <span className="hero-signature-avatars" aria-hidden="true">
                <Image
                  className="hero-signature-avatar hero-signature-avatar-chen"
                  src="/avatars/chen.png"
                  alt=""
                  width={144}
                  height={144}
                  sizes="72px"
                />
                <Image
                  className="hero-signature-avatar hero-signature-avatar-sean"
                  src="/avatars/sean.png"
                  alt=""
                  width={144}
                  height={144}
                  sizes="72px"
                />
              </span>
              <span className="hero-signature-text">
                <span>By</span> Sean &amp; Chen
              </span>
            </div>
            <div className="hero-copy">
              <h1 className="hero-warp-title" aria-label="Future Motion Lab / 未来接口动态实验室">
                <span className="hero-title-row i18n-zh">
                  <TextPressure
                    text="未来接口"
                    fontSize="clamp(108px, 12.4vw, 236px)"
                    textColor="#ffffff"
                    flex={false}
                    weight
                    width
                    italic={false}
                    letterSpacing="-0.01em"
                  />
                </span>
                <span className="hero-title-row i18n-zh">
                  <TextPressure
                    text="动态实验室"
                    fontSize="clamp(108px, 12.4vw, 236px)"
                    textColor="#ffffff"
                    flex={false}
                    weight
                    width
                    italic={false}
                    letterSpacing="-0.01em"
                  />
                </span>
                <span className="hero-title-row hero-title-row--en i18n-en">
                  <TextPressure
                    text="FUTURE"
                    fontSize="clamp(104px, 12.6vw, 232px)"
                    textColor="#ffffff"
                    flex={false}
                    weight
                    width={false}
                    weightMin={550}
                    weightMax={900}
                    italic={false}
                    letterSpacing="-0.045em"
                  />
                </span>
                <span className="hero-title-row hero-title-row--en i18n-en">
                  <TextPressure
                    text="MOTION LAB"
                    fontSize="clamp(104px, 12.6vw, 232px)"
                    textColor="#ffffff"
                    flex={false}
                    weight
                    width={false}
                    weightMin={550}
                    weightMax={900}
                    italic={false}
                    letterSpacing="-0.045em"
                  />
                </span>
              </h1>
              <HeroTypewriterLede />
            </div>
          </section>

        </section>

        <VideoShowcase />

        <div className="about-contact-cover-scene" data-cover-reveal-scene>
          <div className="about-contact-cover-stage">
            <div className="about-contact-cover-curtain">
              <div className="about-pin-scene">
                <section className="manifesto-section deck-page" id="about">
                  <header className="manifesto-meta" data-reveal="down">
                    <span className="meta-left">
                      <span className="meta-dot" aria-hidden="true">●</span>
                      ABOUT <span className="meta-slash">{"//"}</span> STUDIO
                    </span>
                    <span className="meta-right">
                      <span className="meta-blink" aria-hidden="true">■</span>
                      POSITION <span className="meta-slash">{"//"}</span> GENERATIVE MOTION
                    </span>
                  </header>

                  <div className="manifesto-body">
                    <aside
                      className="manifesto-lede"
                      style={{ "--sr-delay": "80ms" } as CSSProperties}
                    >
                      <p className="manifesto-tag">{"//"} MEDIUM</p>
                      <span className="i18n-zh">
                        <AboutLedeScrollLines
                          blocks={[
                            {
                              lines: ["模型生成画面。", "我们打磨气质。"],
                            },
                            {
                              className: "manifesto-tag-sub",
                              lines: [
                                "AI 不是滤镜。",
                                <Fragment key="lede-native">
                                  是<span className="lede-mark">新的影像母语</span>。
                                </Fragment>,
                              ],
                            },
                          ]}
                        />
                      </span>
                      <span className="i18n-en">
                        <AboutLedeScrollLines
                          blocks={[
                            {
                              lines: ["Models make the frame.", "We shape the feel."],
                            },
                            {
                              className: "manifesto-tag-sub",
                              lines: [
                                "AI isn't a filter —",
                                <Fragment key="lede-native-en">
                                  it's a <span className="lede-mark">new visual language</span>.
                                </Fragment>,
                              ],
                            },
                          ]}
                        />
                      </span>
                    </aside>

                    <BilingualAboutHeadline
                      linesZh={aboutHeadlineLinesZh}
                      linesEn={aboutHeadlineLinesEn}
                    />
                  </div>

                  <ul className="manifesto-pillars">
                    {aboutPillars.map((pillar, i) => (
                      <li
                        key={pillar.index}
                        className="pillar-card"
                        style={{ "--sr-delay": `${i * 110}ms` } as CSSProperties}
                      >
                        <div className="pillar-card-inner">
                          <span className="pillar-corner" aria-hidden="true">[+]</span>
                          <p className="pillar-num">
                            <span className="pillar-arrow" aria-hidden="true">▶</span>
                            <span className="pillar-num-value">{pillar.index}</span>
                          </p>
                          <p className="pillar-label">{pillar.label}</p>
                          <h3 className="pillar-title">
                            <span className="i18n-zh">{pillar.cn}</span>
                            <span className="i18n-en">{pillar.en}</span>
                          </h3>
                          <p className="pillar-body">
                            <span className="i18n-zh">{pillar.body}</span>
                            <span className="i18n-en">{pillar.bodyEn}</span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="manifesto-bottom-word" aria-hidden="true">
                    MOTION CRAFT
                  </p>
                </section>
              </div>
            </div>

            <div className="about-contact-cover-base">
              <section className="dispatch-section deck-page" data-contact-section>
                <header className="manifesto-meta" data-reveal="down">
                  <span className="meta-left">
                    <span className="meta-dot" aria-hidden="true">●</span>
                    CONTACT <span className="meta-slash">{"//"}</span> CHANNEL
                  </span>
                  <span className="meta-right">
                    <span className="meta-blink" aria-hidden="true">▌</span>
                    MODEL READY <span className="meta-slash">{"//"}</span> AWAITING BRIEF
                  </span>
                </header>

                <div className="manifesto-body dispatch-body">
                  <ScrollRevealWords
                    text="FUTURE MOTION LAB"
                    windowStart={0.25}
                    windowEnd={0.55}
                    overlap={0.55}
                    className="section-bg-text"
                    aria-hidden="true"
                    data-bg-text="FUTURE MOTION LAB"
                  />
                  <aside
                    className="manifesto-lede"
                    data-reveal="up"
                    style={{ "--sr-delay": "80ms" } as CSSProperties}
                  >
                    <p className="manifesto-tag">{"//"} CHANNEL</p>
                    <p className="i18n-zh">
                      不用写完整 brief。
                      <br />一个方向、一个参考，就能开始。
                    </p>
                    <p className="i18n-en">
                      Skip the brief.
                      <br />A direction and a reference are enough to start.
                    </p>
                    <p className="manifesto-tag-sub i18n-zh">
                      其余的，
                      <br />
                      我们<span className="lede-mark">接住</span>。
                    </p>
                    <p className="manifesto-tag-sub i18n-en">
                      The rest,
                      <br />
                      we'll <span className="lede-mark">take from here</span>.
                    </p>
                  </aside>

                  <CinematicHeadline />
                </div>

                <div>
                  <ContactCopyPanel />
                </div>
              </section>
            </div>
          </div>
          <span className="about-contact-cover-anchor" id="contact" aria-hidden="true" />
        </div>

        <footer className="site-footer">
          <div className="footer-inner">
            <span className="footer-brand">
              FUTURE MOTION LAB
              <small className="i18n-zh">未来接口实验室</small>
              <small className="i18n-en">A generative motion studio.</small>
            </span>

            <span className="footer-meta">
              <span>GENERATIVE MOTION · SHANGHAI</span>
              <span className="footer-divider">{"//"}</span>
              <span>MODEL × DIRECTION</span>
            </span>

            <span className="footer-copy">
              © {new Date().getFullYear()} FIMOTION
              <span className="footer-cursor" aria-hidden="true">▮</span>
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
