import {
  ADDRESS,
  EMAIL,
  POLICIES,
  QUICK_LINKS,
  SOCIALS,
  TEL,
} from "@/lib/site";
import { MailIcon, PhoneIcon, PinIcon, SocialIcon } from "./icons";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <a className="brand" href="#top">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="brand-logo footer-logo"
                src="/powerstar-logo.png"
                width={1762}
                height={202}
                alt="Power Star Freight"
              />
            </a>
            <p className="blurb">
              Total logistics made through Power Star — your end-to-end partner
              for Malaysia and the world.
            </p>
            <div className="foot-social" style={{ marginTop: 20 }}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={s.label}
                >
                  <SocialIcon name={s.label} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5>Quick Links</h5>
            {QUICK_LINKS.map((l, i) => (
              <a key={`${l.label}-${i}`} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>

          <div>
            <h5>Our Policies</h5>
            {POLICIES.map((p) => (
              <a key={p} href="#">
                {p}
              </a>
            ))}
          </div>

          <div>
            <h5>Contact</h5>
            <div className="contact-line nowrap">
              <PhoneIcon />
              <span>{TEL}</span>
            </div>
            <div className="contact-line">
              <MailIcon />
              <span>{EMAIL}</span>
            </div>
            <div className="contact-line">
              <PinIcon />
              <span>{ADDRESS}</span>
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© 2026 Power Star Freight Sdn Bhd. All rights reserved.</span>
          <span style={{ fontFamily: "var(--font-mono)", letterSpacing: ".1em" }}>
            CONCEPT REVAMP · NOT YET LIVE
          </span>
        </div>
      </div>
    </footer>
  );
}
