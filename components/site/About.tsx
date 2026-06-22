import { STATS } from "@/lib/site";
import { Reveal } from "./Reveal";
import { StatNumber } from "./StatNumber";

export function About() {
  return (
    <section className="block section-pad" id="about">
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">About Us</p>
          <h2>Fluctuating demand won&apos;t slow you down.</h2>
          <p className="lede">
            Power Star Freight&apos;s end-to-end logistics give you the agility
            to speed up growth and the resilience to be ready for anything —
            built on amicable, empathetic partnerships with every customer.
          </p>
        </Reveal>

        <Reveal delay={1} className="stats" style={{ marginTop: 54 }}>
          {STATS.map((s) => (
            <div className="stat" key={s.cap}>
              <StatNumber value={s.num} sup={s.sup} />
              <div className="cap">{s.cap}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
