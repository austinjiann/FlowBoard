import type { FC } from 'react';
import './VideoClip.css';

// Video clip thumbnail component (clickable to open editor)
interface VideoClipProps {
	/** Unique identifier for this video clip */
	id: string;
	/** URL to the video file */
	videoUrl: string;
	/** Optional thumbnail/poster image URL (if not provided, first frame is used) */
	thumbnailUrl?: string;
	/** Duration in seconds */
	duration: number;
	/** Callback when clip is clicked - opens the editor */
	onClick: (clipId: string) => void;
	/** Optional title/name for the clip */
	title?: string;
}

// Format seconds to MM:SS or HH:MM:SS
const formatDuration = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);
	
	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const VideoClip: FC<VideoClipProps> = ({
	id,
	videoUrl,
	thumbnailUrl,
	duration,
	onClick,
	title,
}) => {
	const handleClick = () => {
		onClick(id);
	};

	return (
		<div className="video-clip" onClick={handleClick}>
			<div className="video-clip-thumbnail">
				{thumbnailUrl ? (
					<img 
						src={thumbnailUrl} 
						alt={title || 'Video thumbnail'} 
						className="video-clip-image"
					/>
				) : (
					<video 
						src={videoUrl} 
						className="video-clip-preview"
						muted
						preload="metadata"
					/>
				)}
				
				<div className="video-clip-overlay">
					<svg 
						width="48" 
						height="48" 
						viewBox="0 0 24 24" 
						fill="white" 
						className="video-clip-play-icon"
					>
						<path d="M8 5v14l11-7z" />
					</svg>
				</div>
				
				<div className="video-clip-duration">
					{formatDuration(duration)}
				</div>
			</div>
			
			{title && (
				<div className="video-clip-title">{title}</div>
			)}
		</div>
	);
};

export default VideoClip;
