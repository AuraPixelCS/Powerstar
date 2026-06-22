import { CRED_ITEMS } from "@/lib/site";

export function CredStrip() {
  // duplicate the run for a seamless marquee loop
  const items = [...CRED_ITEMS, ...CRED_ITEMS];
  return (
    <div className="cred">
      <div className="cred-track">
        {items.map((it, i) => (
          <span className="cred-item" key={`${it.label}-${i}`}>
            <span className="glyph">{it.glyph}</span> {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}
