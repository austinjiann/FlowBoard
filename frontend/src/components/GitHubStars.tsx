import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface GitHubStarsProps {
  repo: string; // format: "owner/repo"
  className?: string;
}

export const GitHubStars: React.FC<GitHubStarsProps> = ({
  repo,
  className = "",
}) => {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${repo}`);
        if (response.ok) {
          const data = await response.json();
          setStars(data.stargazers_count);
        }
      } catch (error) {
        console.error("Error fetching GitHub stars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, [repo]);

  if (loading) {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <span className="text-s">...</span>
        <Star className="w-3 h-3 fill-yellow-100 text-yellow-300" />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="text-s font-semibold">
        {stars?.toLocaleString() ?? 0}
      </span>
      <Star className="w-3 h-3 fill-yellow-100 text-yellow-300" />
    </span>
  );
};
