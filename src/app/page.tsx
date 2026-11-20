import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import { HowItWorks, Comparison, Faq, Footer } from "@/components/sections";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Comparison />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </>
  );
}