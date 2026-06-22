import { TEL, TEL_HREF, WA_QUOTE } from "@/lib/site";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="final section-pad" id="contact">
      <div className="wrap">
        <Reveal as="p" className="eyebrow" style={{ justifyContent: "center" }}>
          Get Started
        </Reveal>
        <Reveal as="h2" delay={1}>
          Let&apos;s get your
          <br />
          goods moving.
        </Reveal>
        <Reveal as="p" delay={2} className="lede">
          Total logistics made through Power Star — sea, air and land, with
          sustainability built in.
        </Reveal>
        <Reveal delay={2} className="beat-cta">
          <a
            className="btn btn-primary"
            href={WA_QUOTE}
            target="_blank"
            rel="noopener"
          >
            Get a quote <span className="arrow">→</span>
          </a>
          <a className="btn btn-ghost" href={TEL_HREF}>
            {TEL}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
