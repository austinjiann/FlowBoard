import React from "react";
import { useNavigate } from "react-router-dom";
import { TutorialContent } from "../canvas/TutorialContent";

const TutorialSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-transparent relative z-10">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4 font-ananda">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              See how easy it is to bring your ideas to life with FlowBoard.
            </p>
          </div>

          <TutorialContent 
            onComplete={() => navigate("/app")} 
            className="border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]"
          />
        </div>
      </div>
    </section>
  );
};

export default TutorialSection;

