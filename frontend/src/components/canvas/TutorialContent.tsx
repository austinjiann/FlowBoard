import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TutorialContentProps {
  onComplete?: () => void;
  className?: string;
}

export const TutorialContent: React.FC<TutorialContentProps> = ({
  onComplete,
  className = "",
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Flowboard",
      description:
        "Create beautiful 3D models and visuals in minutes with our intuitive tools.",
      videoUrl: "/demo/demo.mp4",
      tip: "Use the toolbar on the right to access all drawing tools",
    },
    {
      title: "Upload an image and annotate",
      description:
        "Select any 2D shape and press the 3D button to transform it into a 3D model.",
      videoUrl: "/demo/tutorial1.mp4",
      tip: "Try selecting multiple shapes before converting to 3D",
    },
    {
      title: "Or draw from scratch",
      description:
        "Navigate your 3D world with orbit and first-person camera controls.",
      videoUrl: "/demo/tutorial vid 2.mp4",
      tip: "Switch between Orbit and First Person modes for different views",
    },
    {
      title: "Prompt and generate",
      description:
        "You're all set! Start creating your masterpiece on the canvas.",
      videoUrl: "/demo/demo3.mp4",
      tip: "Export your work anytime with the Export button",
    },
    {
      title: "Create a whole story",
      description:
        "You're all set! Start creating your masterpiece on the canvas.",
      videoUrl: "/demo/demo4.mp4",
      tip: "Export your work anytime with the Export button",
    },
    {
      title: "Download",
      description:
        "You're all set! Start creating your masterpiece on the canvas.",
      videoUrl: "/demo/demo5.mp4",
      tip: "Export your work anytime with the Export button",
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete?.();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className={`grid md:grid-cols-2 gap-0 h-full bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden ${className}`}>
      {/* Video/Demo Section */}
      <div className="bg-gray-50/50 p-8 flex items-center justify-center min-h-[300px] md:min-h-auto">
        <div className="w-full aspect-video bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-gray-200/50 relative">
          <video
            key={currentSlide}
            className="w-full h-full object-cover absolute inset-0"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={slides[currentSlide].videoUrl} type="video/mp4" />
            {/* Fallback for demo */}
            <div className="w-full h-full bg-linear-to-br from-pink-100 to-pink-50 flex items-center justify-center">
              <span className="text-pink-300 text-4xl">🎬</span>
            </div>
          </video>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 md:p-12 flex flex-col">
        {/* Progress Indicators */}
        <div className="flex gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-12 bg-brand-pink"
                  : index < currentSlide
                    ? "w-1.5 bg-brand-pink/40"
                    : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-ananda">
            {slides[currentSlide].title}
          </h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {slides[currentSlide].description}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-3 bg-brand-pink/10 rounded-full text-sm text-brand-pink self-start mb-4 md:mb-0">
            <span className="font-medium">{slides[currentSlide].tip}</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <div className="text-sm text-gray-500 font-medium hidden sm:block">
            {currentSlide + 1} / {slides.length}
          </div>

          <button
            onClick={nextSlide}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-brand-pink hover:bg-brand-pink/90 transition-colors shadow-lg shadow-brand-pink/30 cursor-pointer"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            {currentSlide < slides.length - 1 && (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

