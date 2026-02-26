import { Theme } from "@radix-ui/themes";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import TutorialSection from "../components/landing/TutorialSection";
import DemoSection from "../components/landing/DemoSection";
import Footer from "../components/landing/Footer";
import { DeploymentNoticeProvider } from "../contexts/DeploymentNoticeContext";
import DeploymentNoticeModal from "../components/DeploymentNoticeModal";

function Landing() {
  return (
    <DeploymentNoticeProvider>
      <Theme>
        <div className="min-h-screen relative bg-white">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

          <div className="relative z-10">
            <Navbar />
            <Hero />
            <TutorialSection />
            <DemoSection />
            <Footer />
          </div>
        </div>
        <DeploymentNoticeModal />
      </Theme>
    </DeploymentNoticeProvider>
  );
}

export default Landing;
