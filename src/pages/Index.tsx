import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RideOptions from "@/components/RideOptions";
import HowItWorks from "@/components/HowItWorks";
import SafetySection from "@/components/SafetySection";
import DriverCTA from "@/components/DriverCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <RideOptions />
      <HowItWorks />
      <SafetySection />
      <DriverCTA />
      <Footer />
    </div>
  );
};

export default Index;
