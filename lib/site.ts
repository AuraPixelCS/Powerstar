/* ============================================================
   Power Star Freight — shared site content & constants.
   Sourced from the concept design + powerstar.com.my.
   ============================================================ */

export const WA_PHONE = "60126212929";
export const TEL = "+60333249788";
export const TEL_HREF = "tel:+60333249788";
export const EMAIL = "rain@powerstar.com.my";
export const ADDRESS =
  "11, Lorong Sentosa 4, Taman Bayu Tinggi, 41200 Klang, Selangor, Malaysia";

const wa = (text: string) =>
  `https://api.whatsapp.com/send/?phone=${WA_PHONE}&text=${encodeURIComponent(text)}`;

export const WA_QUOTE = wa(
  "Hello Power Star Freight, I am interested in your logistics services.",
);
export const WA_BOOK = wa(
  "Hello Power Star Freight, I would like to book a shipment.",
);

export const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#why", label: "Why Us" },
  { href: "#book", label: "Book & Plan" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export const CRED_ITEMS = [
  { glyph: "★", label: "ISO 9001:2015 Certified" },
  { glyph: "◆", label: "ESG Verified by SIRIM" },
  { glyph: "⛴", label: "Sea · Air · Land Freight" },
  { glyph: "✦", label: "Halal Logistics Compliant" },
  { glyph: "⦿", label: "CO₂ Emission Tracking" },
  { glyph: "★", label: "13+ Years Experience" },
  { glyph: "◆", label: "Cargo Insurance Arranged" },
];

export const STATS = [
  { num: "13", sup: "+", cap: "Years moving cargo for Malaysian business" },
  { num: "200", sup: "+", cap: "Destinations served across the globe" },
  { num: "8", sup: "", cap: "Integrated services under one roof" },
  { num: "100", sup: "%", cap: "ISO & ESG verified operations" },
];

export const WHY = [
  {
    n: "01",
    h: "Global reach, local care",
    p: "Worldwide freight solutions delivered with the personal attention of a partner who picks up the phone.",
  },
  {
    n: "02",
    h: "Experienced & empathetic team",
    p: "Over a decade of logistics expertise from a team that genuinely listens and cares.",
  },
  {
    n: "03",
    h: "Sustainability you can verify",
    p: "ESG-verified operations and CO₂ emission tracking — responsibility you can put in a report.",
  },
];

export const FAQ = [
  {
    q: "What is the Verified Gross Mass (VGM), and why is it mandatory?",
    a: "The VGM is the total confirmed gross weight of a packed container — cargo plus tare. It's mandated under the SOLAS convention: a container will not be loaded onto a vessel without a verified VGM. We guide you through obtaining and submitting it correctly, keeping your shipment safe, compliant and free of demurrage charges.",
  },
  {
    q: "What is an HS Code, and why is it critical for my shipment?",
    a: "A Harmonized System code is the international language for classifying traded goods. It determines your duties and taxes, ensures smooth customs clearance, and triggers any required permits. We classify your goods accurately to avoid delays, inspections and costly misclassification penalties.",
  },
  {
    q: "Why is cargo insurance important for every shipment?",
    a: "Carrier liability is strictly limited by international treaty and covers only a fraction of your cargo's value. Cargo insurance is an all-risk safety net against natural disasters, water damage, theft and handling accidents — protecting your cash flow and your customer relationships. We arrange comprehensive cover tailored to your shipment's value and route.",
  },
  {
    q: "How can Power Star Freight help with all of this?",
    a: "We work with you to classify goods, prepare documentation and optimise duty costs — handling the complexity end-to-end so your shipment stays compliant, on time and protected.",
  },
];

export const QUICK_LINKS = [
  { href: "#about", label: "Know Us" },
  { href: "#services", label: "Logistics Solution" },
  { href: "#book", label: "Book & Plan" },
  { href: "#contact", label: "Pricing" },
  { href: "#contact", label: "Contact Us" },
];

export const POLICIES = [
  "ESG Policy",
  "Quality Policy",
  "Environment Policy",
  "Anti-Bribery Policy",
  "Supplier Code of Conduct",
];

export const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/powerstarfreight" },
  { label: "Instagram", href: "https://www.instagram.com/powerstarfreight/" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/power-star-freight-sdn-bhd",
  },
  { label: "TikTok", href: "https://www.tiktok.com/@powerstar9788" },
];
