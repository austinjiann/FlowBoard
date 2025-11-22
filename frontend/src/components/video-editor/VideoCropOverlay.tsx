import type { FC } from 'react';
import { useState, useCallback, useEffect } from 'react';
import './VisualCropOverlay.css';

// Interactive crop overlay with draggable handles
interface VisualCropOverlayProps {
	/** Current crop values (0-1) */
	crop: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	/** Container dimensions (for calculating pixel positions) */
	containerWidth: number;
	containerHeight: number;
	/** Callback when crop values change */
	onCropChange: (crop: { x: number; y: number; width: number; height: number }) => void;
}

type HandleType = 
	| 'top-left' 
	| 'top-right' 
	| 'bottom-left' 
	| 'bottom-right'
	| 'top'
	| 'bottom'
	| 'left'
	| 'right'
	| 'move';

const VisualCropOverlay: FC<VisualCropOverlayProps> = ({
	crop,
	containerWidth,
	containerHeight,
	onCropChange,
}) => {
	const [isDragging, setIsDragging] = useState<HandleType | null>(null);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [dragStartCrop, setDragStartCrop] = useState(crop);

	// Convert percentage to pixels
	const percentToPixels = useCallback((percent: number, dimension: 'width' | 'height'): number => {
		return percent * (dimension === 'width' ? containerWidth : containerHeight);
	}, [containerWidth, containerHeight]);

	// Convert pixels to percentage
	const pixelsToPercent = useCallback((pixels: number, dimension: 'width' | 'height'): number => {
		const total = dimension === 'width' ? containerWidth : containerHeight;
		return Math.max(0, Math.min(1, pixels / total));
	}, [containerWidth, containerHeight]);

	// Calculate crop box position and size in pixels
	const cropBox = {
		left: percentToPixels(crop.x, 'width'),
		top: percentToPixels(crop.y, 'height'),
		width: percentToPixels(crop.width, 'width'),
		height: percentToPixels(crop.height, 'height'),
	};

	// Handle mouse down on handle or crop box
	const handleMouseDown = useCallback((e: React.MouseEvent, handleType: HandleType) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(handleType);
		setDragStart({ x: e.clientX, y: e.clientY });
		setDragStartCrop(crop);
	}, [crop]);

	// Handle drag operations
	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const deltaX = e.clientX - dragStart.x;
			const deltaY = e.clientY - dragStart.y;

			const deltaXPercent = pixelsToPercent(deltaX, 'width');
			const deltaYPercent = pixelsToPercent(deltaY, 'height');

			let newCrop = { ...dragStartCrop };

			switch (isDragging) {
				case 'move':
					newCrop.x = Math.max(0, Math.min(1 - newCrop.width, dragStartCrop.x + deltaXPercent));
					newCrop.y = Math.max(0, Math.min(1 - newCrop.height, dragStartCrop.y + deltaYPercent));
					break;

				case 'top-left':
					newCrop.x = Math.max(0, dragStartCrop.x + deltaXPercent);
					newCrop.y = Math.max(0, dragStartCrop.y + deltaYPercent);
					newCrop.width = Math.max(0.1, dragStartCrop.width - deltaXPercent);
					newCrop.height = Math.max(0.1, dragStartCrop.height - deltaYPercent);
					if (newCrop.x + newCrop.width > 1) newCrop.width = 1 - newCrop.x;
					if (newCrop.y + newCrop.height > 1) newCrop.height = 1 - newCrop.y;
					break;

				case 'top-right':
					newCrop.y = Math.max(0, dragStartCrop.y + deltaYPercent);
					newCrop.width = Math.max(0.1, dragStartCrop.width + deltaXPercent);
					newCrop.height = Math.max(0.1, dragStartCrop.height - deltaYPercent);
					if (newCrop.x + newCrop.width > 1) newCrop.width = 1 - newCrop.x;
					if (newCrop.y + newCrop.height > 1) newCrop.height = 1 - newCrop.y;
					break;

				case 'bottom-left':
					newCrop.x = Math.max(0, dragStartCrop.x + deltaXPercent);
					newCrop.width = Math.max(0.1, dragStartCrop.width - deltaXPercent);
					newCrop.height = Math.max(0.1, dragStartCrop.height + deltaYPercent);
					if (newCrop.x + newCrop.width > 1) newCrop.width = 1 - newCrop.x;
					if (newCrop.y + newCrop.height > 1) newCrop.height = 1 - newCrop.y;
					break;

				case 'bottom-right':
					newCrop.width = Math.max(0.1, dragStartCrop.width + deltaXPercent);
					newCrop.height = Math.max(0.1, dragStartCrop.height + deltaYPercent);
					if (newCrop.x + newCrop.width > 1) newCrop.width = 1 - newCrop.x;
					if (newCrop.y + newCrop.height > 1) newCrop.height = 1 - newCrop.y;
					break;

				case 'top':
					newCrop.y = Math.max(0, dragStartCrop.y + deltaYPercent);
					newCrop.height = Math.max(0.1, dragStartCrop.height - deltaYPercent);
					if (newCrop.y + newCrop.height > 1) newCrop.height = 1 - newCrop.y;
					break;

				case 'bottom':
					newCrop.height = Math.max(0.1, dragStartCrop.height + deltaYPercent);
					if (newCrop.y + newCrop.height > 1) newCrop.height = 1 - newCrop.y;
					break;

				case 'left':
					newCrop.x = Math.max(0, dragStartCrop.x + deltaXPercent);
					newCrop.width = Math.max(0.1, dragStartCrop.width - deltaXPercent);
					if (newCrop.x + newCrop.width > 1) newCrop.width = 1 - newCrop.x;
					break;

				case 'right':
					newCrop.width = Math.max(0.1, dragStartCrop.width + deltaXPercent);
					if (newCrop.x + newCrop.width > 1) newCrop.width = 1 - newCrop.x;
					break;
			}

			onCropChange(newCrop);
		};

		const handleMouseUp = () => {
			setIsDragging(null);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, dragStart, dragStartCrop, pixelsToPercent, onCropChange]);

	return (
		<div className="visual-crop-overlay">
			<svg
				className="crop-overlay-svg"
				width={containerWidth}
				height={containerHeight}
			>
				<defs>
					<mask id="crop-mask">
						<rect width="100%" height="100%" fill="white" />
						<rect
							x={cropBox.left}
							y={cropBox.top}
							width={cropBox.width}
							height={cropBox.height}
							fill="black"
						/>
					</mask>
				</defs>
				<rect
					width="100%"
					height="100%"
					fill="rgba(0, 0, 0, 0.5)"
					mask="url(#crop-mask)"
				/>
			</svg>

			<div
				className="crop-box"
				style={{
					left: `${cropBox.left}px`,
					top: `${cropBox.top}px`,
					width: `${cropBox.width}px`,
					height: `${cropBox.height}px`,
				}}
				onMouseDown={(e) => handleMouseDown(e, 'move')}
			>
				<div className="crop-grid">
					<div className="grid-line grid-line-vertical" style={{ left: '33.33%' }} />
					<div className="grid-line grid-line-vertical" style={{ left: '66.66%' }} />
					<div className="grid-line grid-line-horizontal" style={{ top: '33.33%' }} />
					<div className="grid-line grid-line-horizontal" style={{ top: '66.66%' }} />
				</div>

				<div
					className="crop-handle crop-handle-corner crop-handle-top-left"
					onMouseDown={(e) => handleMouseDown(e, 'top-left')}
				/>
				<div
					className="crop-handle crop-handle-corner crop-handle-top-right"
					onMouseDown={(e) => handleMouseDown(e, 'top-right')}
				/>
				<div
					className="crop-handle crop-handle-corner crop-handle-bottom-left"
					onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
				/>
				<div
					className="crop-handle crop-handle-corner crop-handle-bottom-right"
					onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
				/>

				<div
					className="crop-handle crop-handle-edge crop-handle-top"
					onMouseDown={(e) => handleMouseDown(e, 'top')}
				/>
				<div
					className="crop-handle crop-handle-edge crop-handle-bottom"
					onMouseDown={(e) => handleMouseDown(e, 'bottom')}
				/>
				<div
					className="crop-handle crop-handle-edge crop-handle-left"
					onMouseDown={(e) => handleMouseDown(e, 'left')}
				/>
				<div
					className="crop-handle crop-handle-edge crop-handle-right"
					onMouseDown={(e) => handleMouseDown(e, 'right')}
				/>
			</div>
		</div>
	);
};

export default VisualCropOverlay;
