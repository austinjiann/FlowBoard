import type { FC } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, Button, Flex, Text, IconButton, Slider, Box } from '@radix-ui/themes';
import { Play, Pause, X, Scissors, Gauge, Trash2, Copy, Crop, Save } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import Timeline from './Timeline';
import './VideoEditorModal.css';


interface VideoEditorModalProps {
	/** Whether the modal is currently open/visible */
	isOpen: boolean;
	/** Video clip data */
	videoClip: {
		id: string;
		videoUrl: string;
		duration: number;
		title?: string;
		trimStart?: number;
		trimEnd?: number;
		playbackRate?: number;
		crop?: {
			x: number;
			y: number;
			width: number;
			height: number;
		};
	};
	/** Callback to close the modal */
	onClose: (finalSpeed?: number) => void;
	/** Callback when split action is triggered */
	onSplit?: (clipId: string, time: number) => void;
	/** Callback when speed changes */
	onSpeedChange?: (clipId: string, speed: number) => void;
	/** Callback when delete action is triggered */
	onDelete?: (clipId: string) => void;
	/** Callback when copy action is triggered */
	onCopy?: (clipId: string) => void;
	/** Callback when duplicate action is triggered */
	onDuplicate?: (clipId: string) => void;
	/** Callback when trim action is triggered */
	onTrim?: (clipId: string, startTime: number, endTime: number) => void;
	/** Callback when crop action is triggered */
	onCrop?: (clipId: string, crop?: { x: number; y: number; width: number; height: number }) => void;
	/** Callback when save action is triggered */
	onSave?: (clipId: string) => void;
	/** Whether the video is currently being saved */
	isSaving?: boolean;
}

const VideoEditorModal: FC<VideoEditorModalProps> = ({
	isOpen,
	videoClip,
	onClose,
	onSplit,
	onSpeedChange,
	onDelete,
	onDuplicate,
	onTrim,
	onCrop,
	onSave,
	isSaving = false,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [actualDuration, setActualDuration] = useState(videoClip.duration || 0);
	const [playbackRate, setPlaybackRate] = useState(videoClip.playbackRate || 1.0);
	const [isCropMode, setIsCropMode] = useState(false);
	const [tempCrop, setTempCrop] = useState(videoClip.crop || {
		x: 0,
		y: 0,
		width: 1,
		height: 1,
	});
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const videoElementRef = useRef<HTMLVideoElement>(null);
	const [videoFrameUrl, setVideoFrameUrl] = useState<string>('');
	const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
	const [isTrimMode, setIsTrimMode] = useState(false);
	const [tempTrimStart, setTempTrimStart] = useState<number | undefined>(videoClip.trimStart);
	const [tempTrimEnd, setTempTrimEnd] = useState<number | undefined>(videoClip.trimEnd);
	const previewRef = useRef<HTMLDivElement>(null);
	const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 });
	
	// Calculate effective duration (accounting for trim and speed)
	const baseDuration = videoClip.trimEnd !== undefined && videoClip.trimStart !== undefined
		? videoClip.trimEnd - videoClip.trimStart
		: actualDuration;
	const effectiveDuration = baseDuration / playbackRate;

	// Close modal on ESC key
	useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose(playbackRate);
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	// Reset video state when modal opens or video changes
	useEffect(() => {
		if (isOpen) {
			setIsPlaying(false);
			setCurrentTime(0);
			setPlaybackRate(videoClip.playbackRate || 1.0);
			setIsCropMode(false);
		}
	}, [isOpen, videoClip.id, videoClip.playbackRate]);

	// Capture current video frame for cropping
	const captureVideoFrame = useCallback(() => {
		const video = videoElementRef.current;
		if (!video) return;

		const videoWidth = video.videoWidth || previewDimensions.width;
		const videoHeight = video.videoHeight || previewDimensions.height;
		
		if (videoWidth === 0 || videoHeight === 0) {
			console.warn('Video dimensions not available yet');
			return;
		}
		
		setVideoDimensions({ width: videoWidth, height: videoHeight });

		const canvas = document.createElement('canvas');
		canvas.width = videoWidth;
		canvas.height = videoHeight;
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		
		if (!ctx) {
			console.error('Could not get canvas context');
			return;
		}

		try {
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			
			try {
				const dataUrl = canvas.toDataURL('image/png');
				setVideoFrameUrl(dataUrl);
			} catch (toDataUrlError) {
				console.error('CORS error: Cannot export canvas.', toDataUrlError);
				setIsCropMode(false);
				alert('Cannot crop this video due to CORS restrictions.');
				return;
			}
		} catch (drawError) {
			console.error('Error drawing video to canvas:', drawError);
			setIsCropMode(false);
			alert('Error capturing video frame. Please try again.');
		}
	}, [previewDimensions]);

	// Update preview dimensions for crop overlay
	useEffect(() => {
		if (!isOpen || !previewRef.current) return;

		const updateDimensions = () => {
			if (previewRef.current) {
				const rect = previewRef.current.getBoundingClientRect();
				setPreviewDimensions({
					width: rect.width,
					height: rect.height,
				});
			}
		};

		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => window.removeEventListener('resize', updateDimensions);
	}, [isOpen]);

	// Initialize crop state when video dimensions are available
	useEffect(() => {
		if (isCropMode && videoDimensions.width > 0 && videoDimensions.height > 0 && videoFrameUrl) {
			const existingCrop = videoClip.crop || {
				x: 0,
				y: 0,
				width: 1,
				height: 1,
			};
			
			const zoom = 1 / Math.min(existingCrop.width, existingCrop.height);
			setZoom(Math.max(1, Math.min(3, zoom)));
			
			// Convert percentage crop to react-easy-crop coordinates (relative to center)
			const cropCenterX = existingCrop.x + existingCrop.width / 2;
			const cropCenterY = existingCrop.y + existingCrop.height / 2;
			const offsetXPercent = 0.5 - cropCenterX;
			const offsetYPercent = 0.5 - cropCenterY;
			const offsetX = offsetXPercent * videoDimensions.width;
			const offsetY = offsetYPercent * videoDimensions.height;
			
			setCrop({ x: offsetX, y: offsetY });
		}
	}, [isCropMode, videoDimensions, videoClip.crop, videoFrameUrl]);

	// Capture video frame when entering crop mode
	useEffect(() => {
		if (isCropMode && videoElementRef.current) {
			const video = videoElementRef.current;
			const checkAndCapture = () => {
				if (video.videoWidth > 0 && video.videoHeight > 0) {
					captureVideoFrame();
				} else {
					setTimeout(checkAndCapture, 100);
				}
			};
			
			const timer = setTimeout(checkAndCapture, 100);
			return () => clearTimeout(timer);
		}
	}, [isCropMode, captureVideoFrame]);

	const handlePlayPauseChange = useCallback((playing: boolean) => {
		setIsPlaying(playing);
	}, []);

	const handleTimeUpdate = useCallback((time: number) => {
		setCurrentTime(time);
	}, []);

	const handleDurationChange = useCallback((newDuration: number) => {
		setActualDuration(newDuration);
	}, []);

	// Handle timeline seek (clamps to effective duration)
	const handleSeek = useCallback((time: number) => {
		const clampedTime = Math.max(0, Math.min(time, effectiveDuration));
		setCurrentTime(clampedTime);
	}, [effectiveDuration]);

	const handlePlayPauseClick = () => {
		setIsPlaying(!isPlaying);
	};

	const handleSplit = () => {
		onSplit?.(videoClip.id, currentTime);
	};

	const handleSpeedChange = (speed: number) => {
		setPlaybackRate(speed);
		onSpeedChange?.(videoClip.id, speed);
	};

	const handleDelete = () => {
		onDelete?.(videoClip.id);
		onClose();
	};

	const handleDuplicate = () => {
		onDuplicate?.(videoClip.id);
	};

	const handleTrim = () => {
		if (isTrimMode) {
			if (tempTrimStart !== undefined && tempTrimEnd !== undefined && tempTrimEnd > tempTrimStart) {
				const baseStart = videoClip.trimStart || 0;
				const actualStart = baseStart + tempTrimStart;
				const actualEnd = baseStart + tempTrimEnd;
				onTrim?.(videoClip.id, actualStart, actualEnd);
			}
			setIsTrimMode(false);
		} else {
			setTempTrimStart(0);
			setTempTrimEnd(effectiveDuration);
			setIsTrimMode(true);
		}
	};

	const handleTrimPointSet = (time: number, type: 'start' | 'end') => {
		if (type === 'start') {
			setTempTrimStart(time);
		} else {
			setTempTrimEnd(time);
		}
	};

	const handleCrop = () => {
		if (isCropMode) {
			onCrop?.(videoClip.id, tempCrop);
			setIsCropMode(false);
			if (videoFrameUrl) {
				setVideoFrameUrl('');
			}
		} else {
			const existingCrop = videoClip.crop || {
				x: 0,
				y: 0,
				width: 1,
				height: 1,
			};
			setTempCrop(existingCrop);
			setIsCropMode(true);
		}
	};

	const onCropChange = useCallback((crop: { x: number; y: number }) => {
		setCrop(crop);
	}, []);

	const onZoomChange = useCallback((zoom: number) => {
		setZoom(zoom);
	}, []);

	// Convert crop from pixels to percentage (0-1)
	const onCropComplete = useCallback((
		_croppedArea: { x: number; y: number; width: number; height: number },
		croppedAreaPixels: { x: number; y: number; width: number; height: number }
	) => {
		if (videoDimensions.width > 0 && videoDimensions.height > 0) {
			const newCrop = {
				x: croppedAreaPixels.x / videoDimensions.width,
				y: croppedAreaPixels.y / videoDimensions.height,
				width: croppedAreaPixels.width / videoDimensions.width,
				height: croppedAreaPixels.height / videoDimensions.height,
			};
			const clampedCrop = {
				x: Math.max(0, Math.min(1, newCrop.x)),
				y: Math.max(0, Math.min(1, newCrop.y)),
				width: Math.max(0.1, Math.min(1, newCrop.width)),
				height: Math.max(0.1, Math.min(1, newCrop.height)),
			};
			setTempCrop(clampedCrop);
		}
	}, [videoDimensions]);

	// Format time for display (MM:SS)
	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	};

	if (!isOpen) return null;

	return (
		<Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose(playbackRate)}>
			<Dialog.Content 
				style={{ 
					maxWidth: '95vw',
					maxHeight: '95vh',
					width: '95vw',
					height: '95vh',
					padding: 0,
					background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
					fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
					overflow: 'hidden',
				}}
			>
				<Flex direction="column" style={{ height: '100%' }}>
					{/* Header */}
					<Flex 
						align="center" 
						justify="between" 
						px="6" 
						py="4"
						style={{
							background: 'rgba(255, 255, 255, 0.95)',
							backdropFilter: 'blur(10px)',
							borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
							boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
						}}
					>
						<Text size="5" weight="bold" style={{ 
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							fontFamily: "'Inter', sans-serif",
						}}>
							{videoClip.title || 'Video Editor'}
						</Text>
						<Dialog.Close>
							<IconButton 
								size="3" 
								variant="ghost" 
								style={{ cursor: 'pointer' }}
							>
								<X size={20} />
							</IconButton>
						</Dialog.Close>
					</Flex>

					{/* Body */}
					<Flex 
						direction="column" 
						gap="4" 
						p="6" 
						style={{ flex: 1, overflow: 'hidden' }}
					>
						{/* Video Preview */}
						<Box 
							style={{
								flex: 7,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: '#000',
								borderRadius: '16px',
								overflow: 'hidden',
								position: 'relative',
								boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
								maxWidth: '60%',
								margin: '0 auto',
								width: '100%',
							}}
							ref={previewRef}
						>
							<div style={{ display: isCropMode ? 'none' : 'block', width: '100%', height: '100%' }}>
								<VideoPlayer
									videoUrl={videoClip.videoUrl}
									isPlaying={isPlaying}
									currentTime={currentTime}
									playbackRate={playbackRate}
									trimStart={videoClip.trimStart}
									trimEnd={videoClip.trimEnd}
									crop={videoClip.crop}
									onPlayPauseChange={handlePlayPauseChange}
									onTimeUpdate={handleTimeUpdate}
									onDurationChange={handleDurationChange}
									videoRef={videoElementRef}
								/>
							</div>
							{isCropMode && previewDimensions.width > 0 && videoFrameUrl && (
								<div className="crop-container">
									<Cropper
										image={videoFrameUrl}
										crop={crop}
										zoom={zoom}
										aspect={videoDimensions.width > 0 && videoDimensions.height > 0 
											? videoDimensions.width / videoDimensions.height 
											: previewDimensions.width / previewDimensions.height}
										onCropChange={onCropChange}
										onZoomChange={onZoomChange}
										onCropComplete={onCropComplete}
										style={{
											containerStyle: {
												position: 'absolute',
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
											},
										}}
									/>
									<Box 
										style={{
											position: 'absolute',
											bottom: 20,
											left: '50%',
											transform: 'translateX(-50%)',
											padding: '12px 20px',
											background: 'rgba(255, 255, 255, 0.95)',
											backdropFilter: 'blur(10px)',
											borderRadius: '12px',
											boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
											zIndex: 11,
										}}
									>
										<Flex direction="column" gap="2" style={{ minWidth: '240px' }}>
											<Text size="2" weight="medium">Zoom: {Math.round(zoom * 100)}%</Text>
											<Slider
												value={[zoom]}
												onValueChange={(value) => setZoom(value[0])}
												min={1}
												max={3}
												step={0.1}
											/>
										</Flex>
									</Box>
								</div>
							)}
						</Box>

						{/* Controls Container */}
						<Flex direction="column" gap="4" style={{ flex: 3 }}>
							{/* Toolbar */}
							<Flex 
								gap="2" 
								align="center" 
								justify="center"
								p="4"
								style={{
									background: 'rgba(255, 255, 255, 0.95)',
									backdropFilter: 'blur(10px)',
									borderRadius: '12px',
									boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
								}}
							>
								<Button 
									variant="soft" 
									size="3"
									onClick={handleSplit}
									style={{ cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
								>
									<Scissors size={18} />
									Split
								</Button>
								<Button 
									variant="soft" 
									size="3"
									onClick={() => {
										const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
										const currentIndex = speeds.indexOf(playbackRate);
										const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
										handleSpeedChange(nextSpeed);
									}}
									style={{ cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
								>
									<Gauge size={18} />
									{playbackRate}x
								</Button>
								<Button 
									variant="soft" 
									size="3"
									onClick={handleTrim}
									color={isTrimMode ? 'blue' : undefined}
									style={{ cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
								>
									<Scissors size={18} />
									{isTrimMode ? 'Apply Trim' : 'Trim'}
								</Button>
								<Button 
									variant="soft" 
									size="3"
									onClick={handleCrop}
									color={isCropMode ? 'blue' : undefined}
									style={{ cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
								>
									<Crop size={18} />
									{isCropMode ? 'Apply Crop' : 'Crop'}
								</Button>
								<Button 
									variant="soft" 
									size="3"
									onClick={handleDuplicate}
									style={{ cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
								>
									<Copy size={18} />
									Duplicate
								</Button>
								{onSave && (
									<Button 
										variant="solid" 
										size="3"
										onClick={() => onSave(videoClip.id)}
										disabled={isSaving}
										style={{ cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
									>
										<Save size={18} />
										{isSaving ? 'Saving...' : 'Save'}
									</Button>
								)}
								<Button 
									variant="soft" 
									size="3"
									color="red"
									onClick={handleDelete}
									style={{ cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
								>
									<Trash2 size={18} />
									Delete
								</Button>
							</Flex>

							{/* Timeline */}
							{!isCropMode && (
								<Box>
									<Timeline
										currentTime={currentTime}
										duration={effectiveDuration}
										onSeek={handleSeek}
										trimStart={isTrimMode ? tempTrimStart : undefined}
										trimEnd={isTrimMode ? tempTrimEnd : undefined}
										isTrimMode={isTrimMode}
										onTrimPointSet={handleTrimPointSet}
									/>
								</Box>
							)}

							{/* Playback Controls */}
							{!isCropMode && (
								<Flex align="center" justify="center" gap="4">
									<IconButton
										size="4"
										onClick={handlePlayPauseClick}
										style={{ 
											cursor: 'pointer',
											background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
											color: 'white',
											width: '64px',
											height: '64px',
											borderRadius: '50%',
											boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
										}}
									>
										{isPlaying ? <Pause size={24} /> : <Play size={24} />}
									</IconButton>
									<Text 
										size="4" 
										weight="medium"
										style={{ 
											fontFamily: "'SF Mono', 'Monaco', 'Menlo', monospace",
											color: '#1a1a1a',
										}}
									>
										{formatTime(currentTime)} / {formatTime(effectiveDuration)}
									</Text>
								</Flex>
							)}
						</Flex>
					</Flex>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};

export default VideoEditorModal;
