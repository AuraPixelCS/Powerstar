import { WA_QUOTE } from "@/lib/site";
import { WhatsAppGlyph } from "./icons";

export function WhatsAppFab() {
  return (
    <a
      className="wa"
      href={WA_QUOTE}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppGlyph />
    </a>
  );
}
