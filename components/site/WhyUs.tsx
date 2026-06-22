import { WHY } from "@/lib/site";
import { Reveal } from "./Reveal";

export function WhyUs() {
  return (
    <section className="block section-pad" id="why">
      <div className="wrap split">
        <Reveal>
          <p className="eyebrow">Why Choose Us</p>
          <h2 style={{ fontSize: "clamp(32px,4.4vw,58px)", fontWeight: 800, marginTop: 18 }}>
            We move better — and we mean it measurably.
          </h2>
          <div className="why-list">
            {WHY.map((w) => (
              <div className="why" key={w.n}>
                <div className="n">{w.n}</div>
                <div>
                  <h4>{w.h}</h4>
                  <p>{w.p}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal
          delay={1}
          className="why-visual"
          aria-label="Power Star Freight operations"
        >
          <div className="grain" />
          <div className="float-card">
            <div className="k">Live shipment</div>
            <div className="v">Port Klang → Rotterdam</div>
          </div>
          <div className="place-note">[ ops / port photography ]</div>
        </Reveal>
      </div>
    </section>
  );
}
