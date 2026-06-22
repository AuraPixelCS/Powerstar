import { Nav } from "@/components/site/Nav";
import { Journey } from "@/components/site/Journey";
import { CredStrip } from "@/components/site/CredStrip";
import { About } from "@/components/site/About";
import { Services } from "@/components/site/Services";
import { WhyUs } from "@/components/site/WhyUs";
import { BookingBand } from "@/components/site/BookingBand";
import { Faq } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";

export default function Home() {
  return (
    <>
      <Nav />
      <span id="top" />
      <Journey />
      <CredStrip />
      <About />
      <Services />
      <WhyUs />
      <BookingBand />
      <Faq />
      <FinalCta />
      <Footer />
      <WhatsAppFab />
    </>
  );
}
