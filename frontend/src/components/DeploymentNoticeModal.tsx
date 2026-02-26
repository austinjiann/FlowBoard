import React from "react";
import { X } from "lucide-react";
import { useDeploymentNotice } from "../contexts/DeploymentNoticeContext";

const GITHUB_REPO = "https://github.com/austinjiann/flowboard";

const builders = [
  { name: "James", url: "https://www.linkedin.com/in/jamessli/" },
  { name: "Daniel", url: "https://www.linkedin.com/in/danielpu1/" },
  { name: "Ferdinand", url: "https://www.linkedin.com/in/ferdinand-simmons-zhang-39ba62297/" },
  { name: "Austin", url: "https://www.linkedin.com/in/austin-jian/" },
];

const DeploymentNoticeModal: React.FC = () => {
  const { isOpen, closeModal } = useDeploymentNotice();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-6 font-ananda">
          <span className="text-brand-pink">FlowBoard</span>
        </h2>

        {/* Description */}
        <p className="text-zinc-400 text-center mb-6 leading-relaxed">
          FlowBoard is a video storyboarding tool that transforms your sketches
          and prompts into context-aware video clips that extend infinitely.
        </p>

        {/* GitHub Button */}
        <a
          href={GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          View Repository
        </a>

        {/* Notice message */}
        <p className="text-zinc-400 text-center text-sm mb-6 leading-relaxed">
          Due to deployment costs, we can no longer host this project. However, FlowBoard is
          open-source and easy to self-host. Check out the repo and give us a star!
        </p>

        {/* Builder credits */}
        <p className="text-zinc-500 text-center text-sm">
          Built by{" "}
          {builders.map((builder, index) => (
            <span key={builder.name}>
              <a
                href={builder.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-brand-pink transition-colors"
              >
                {builder.name}
              </a>
              {index < builders.length - 2 && ", "}
              {index === builders.length - 2 && ", and "}
            </span>
          ))}
          .
        </p>
      </div>
    </div>
  );
};

export default DeploymentNoticeModal;
