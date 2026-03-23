import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import ValueSection from "@/components/home/ValueSection";
import ModulesPreview from "@/components/home/ModulesPreview";
import PricingSection from "@/components/home/PricingSection";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar isAuthenticated={false} />
      <HeroSection />
      <ValueSection />
      <ModulesPreview />
      <PricingSection />
      <Footer />
    </>
  );
}
