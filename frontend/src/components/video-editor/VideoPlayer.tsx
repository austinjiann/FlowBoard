import type { FC } from 'react';
import { useRef, useEffect, useState } from 'react';
import './VideoPlayer.css';

interface VideoPlayerProps {
	/** URL to the video file */
	videoUrl: string;
	/** Whether video is currently playing */
	isPlaying: boolean;
	/** Current playback time in seconds (controlled by parent) */
	currentTime: number;
	/** Playback speed multiplier (1.0 = normal, 2.0 = 2x speed) */
	playbackRate: number;
	/** Optional trim start time in seconds (for client-side trimming) */
	trimStart?: number;
	/** Optional trim end time in seconds (for client-side trimming) */
	trimEnd?: number;
	/** Optional crop settings (for visual cropping) */
	crop?: {
		x: number; // 0-1, left position
		y: number; // 0-1, top position
		width: number; // 0-1, crop width
		height: number; // 0-1, crop height
	};
	/** Callback when play/pause state changes */
	onPlayPauseChange: (isPlaying: boolean) => void;
	/** Callback when current time changes (fires frequently during playback) */
	onTimeUpdate: (time: number) => void;
	/** Callback when video duration is loaded */
	onDurationChange: (duration: number) => void;
	/** Callback when video is ready to play */
	onLoaded?: () => void;
	/** Optional className for custom styling */
	className?: string;
	/** Optional ref to expose video element */
	videoRef?: React.RefObject<HTMLVideoElement>;
}

const VideoPlayer: FC<VideoPlayerProps> = ({
	videoUrl,
	isPlaying,
	currentTime,
	playbackRate,
	trimStart,
	trimEnd,
	crop,
	onPlayPauseChange,
	onTimeUpdate,
	onDurationChange,
	onLoaded,
	className = '',
	videoRef: externalVideoRef,
}) => {
	const internalVideoRef = useRef<HTMLVideoElement>(null);
	const videoRef = externalVideoRef || internalVideoRef;
	const [isLoaded, setIsLoaded] = useState(false);

	// Set crossOrigin before video loads (for CORS)
	useEffect(() => {
		const video = videoRef.current;
		if (video && !video.crossOrigin) {
			video.crossOrigin = 'anonymous';
		}
	}, []);

	// Sync playback state with video element
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		if (isPlaying) {
			video.play().catch((error) => {
				console.error('Error playing video:', error);
				onPlayPauseChange(false);
			});
		} else {
			video.pause();
		}
	}, [isPlaying, onPlayPauseChange]);

	// Sync currentTime with video element (accounts for trim and speed)
	useEffect(() => {
		const video = videoRef.current;
		if (!video || !isLoaded) return;

		let actualVideoTime = currentTime * playbackRate;
		if (trimStart !== undefined) {
			actualVideoTime = actualVideoTime + trimStart;
		}
		
		let targetTime = actualVideoTime;
		if (trimStart !== undefined) {
			targetTime = Math.max(trimStart, actualVideoTime);
		}
		if (trimEnd !== undefined) {
			targetTime = Math.min(trimEnd, targetTime);
		}

		const timeDifference = Math.abs(video.currentTime - targetTime);
		if (timeDifference > 0.1) {
			video.currentTime = targetTime;
		}
	}, [currentTime, isLoaded, trimStart, trimEnd]);

	// Sync playbackRate with video element
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		video.playbackRate = playbackRate;
	}, [playbackRate]);

	const handleLoadedMetadata = () => {
		const video = videoRef.current;
		if (!video) return;

		setIsLoaded(true);
		onDurationChange(video.duration);
		onLoaded?.();
	};

	// Handle time update (convert to effective time, account for trim and speed)
	const handleTimeUpdate = () => {
		const video = videoRef.current;
		if (!video) return;

		const actualTime = video.currentTime;
		
		if (trimEnd !== undefined && actualTime >= trimEnd) {
			video.pause();
			onPlayPauseChange(false);
			let effectiveTime = trimEnd;
			if (trimStart !== undefined) {
				effectiveTime = trimEnd - trimStart;
			}
			effectiveTime = effectiveTime / playbackRate;
			onTimeUpdate(effectiveTime);
			return;
		}

		let effectiveTime = actualTime;
		if (trimStart !== undefined) {
			effectiveTime = actualTime - trimStart;
		}
		effectiveTime = effectiveTime / playbackRate;
		
		onTimeUpdate(Math.max(0, effectiveTime));
	};

	const handlePlay = () => {
		onPlayPauseChange(true);
	};

	const handlePause = () => {
		onPlayPauseChange(false);
	};

	const handleEnded = () => {
		onPlayPauseChange(false);
		const video = videoRef.current;
		if (video) {
			video.currentTime = 0;
		}
	};

	// Calculate crop style (clip-path and transform)
	const getCropStyle = () => {
		if (!crop) return {};
		
		const top = crop.y * 100;
		const right = (1 - (crop.x + crop.width)) * 100;
		const bottom = (1 - (crop.y + crop.height)) * 100;
		const left = crop.x * 100;
		
		const scale = 1 / Math.min(crop.width, crop.height);
		const cropCenterX = crop.x + crop.width / 2;
		const cropCenterY = crop.y + crop.height / 2;
		const translateX = (0.5 - cropCenterX) * 100;
		const translateY = (0.5 - cropCenterY) * 100;
		
		return {
			clipPath: `inset(${top}% ${right}% ${bottom}% ${left}%)`,
			objectFit: 'cover' as const,
			transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
			transformOrigin: 'center center',
			width: '100%',
			height: '100%',
		};
	};

	return (
		<div className={`video-player ${className}`}>
			<video
				ref={videoRef}
				src={videoUrl}
				className="video-player-element"
				controls={false}
				preload="metadata"
				crossOrigin="anonymous"
				style={getCropStyle()}
				onLoadedMetadata={handleLoadedMetadata}
				onTimeUpdate={handleTimeUpdate}
				onPlay={handlePlay}
				onPause={handlePause}
				onEnded={handleEnded}
			/>
		</div>
	);
};

export default VideoPlayer;