import type { FC } from 'react';
import { useState, useCallback } from 'react';
import './CropEditor.css';

// Interactive crop editor with sliders
interface CropEditorProps {
	/** Current crop values */
	crop: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	/** Callback when crop values change */
	onCropChange: (crop: { x: number; y: number; width: number; height: number }) => void;
	/** Callback to apply crop */
	onApply: () => void;
	/** Callback to cancel */
	onCancel: () => void;
}

const CropEditor: FC<CropEditorProps> = ({
	crop,
	onCropChange,
	onApply,
	onCancel,
}) => {
	const [localCrop, setLocalCrop] = useState(crop);

	// Update crop value and notify parent
	const updateCrop = useCallback((updates: Partial<typeof localCrop>) => {
		const newCrop = { ...localCrop, ...updates };
		
		newCrop.x = Math.max(0, Math.min(1, newCrop.x));
		newCrop.y = Math.max(0, Math.min(1, newCrop.y));
		newCrop.width = Math.max(0.1, Math.min(1, newCrop.width));
		newCrop.height = Math.max(0.1, Math.min(1, newCrop.height));
		
		if (newCrop.x + newCrop.width > 1) {
			newCrop.width = 1 - newCrop.x;
		}
		if (newCrop.y + newCrop.height > 1) {
			newCrop.height = 1 - newCrop.y;
		}
		
		setLocalCrop(newCrop);
		onCropChange(newCrop);
	}, [localCrop, onCropChange]);

	// Format percentage for display
	const formatPercent = (value: number): string => {
		return `${Math.round(value * 100)}%`;
	};

	return (
		<div className="crop-editor">
			<div className="crop-editor-header">
				<h3>Crop Video</h3>
				<p>Adjust the crop area using the controls below</p>
			</div>

			<div className="crop-editor-controls">
				<div className="crop-control-group">
					<label>
						<span>Left Position</span>
						<span className="crop-value">{formatPercent(localCrop.x)}</span>
					</label>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={localCrop.x}
						onChange={(e) => {
							const newX = parseFloat(e.target.value);
							const maxX = 1 - localCrop.width;
							updateCrop({ x: Math.min(newX, maxX) });
						}}
						className="crop-slider"
					/>
				</div>

				<div className="crop-control-group">
					<label>
						<span>Top Position</span>
						<span className="crop-value">{formatPercent(localCrop.y)}</span>
					</label>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={localCrop.y}
						onChange={(e) => {
							const newY = parseFloat(e.target.value);
							const maxY = 1 - localCrop.height;
							updateCrop({ y: Math.min(newY, maxY) });
						}}
						className="crop-slider"
					/>
				</div>

				<div className="crop-control-group">
					<label>
						<span>Width</span>
						<span className="crop-value">{formatPercent(localCrop.width)}</span>
					</label>
					<input
						type="range"
						min="0.1"
						max="1"
						step="0.01"
						value={localCrop.width}
						onChange={(e) => {
							const newWidth = parseFloat(e.target.value);
							const maxWidth = 1 - localCrop.x;
							updateCrop({ width: Math.min(newWidth, maxWidth) });
						}}
						className="crop-slider"
					/>
				</div>

				<div className="crop-control-group">
					<label>
						<span>Height</span>
						<span className="crop-value">{formatPercent(localCrop.height)}</span>
					</label>
					<input
						type="range"
						min="0.1"
						max="1"
						step="0.01"
						value={localCrop.height}
						onChange={(e) => {
							const newHeight = parseFloat(e.target.value);
							const maxHeight = 1 - localCrop.y;
							updateCrop({ height: Math.min(newHeight, maxHeight) });
						}}
						className="crop-slider"
					/>
				</div>

				<div className="crop-presets">
					<button
						type="button"
						className="crop-preset-btn"
						onClick={() => updateCrop({ x: 0, y: 0, width: 1, height: 1 })}
					>
						Reset (Full)
					</button>
					<button
						type="button"
						className="crop-preset-btn"
						onClick={() => updateCrop({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 })}
					>
						80% Center
					</button>
					<button
						type="button"
						className="crop-preset-btn"
						onClick={() => updateCrop({ x: 0.05, y: 0.05, width: 0.9, height: 0.9 })}
					>
						90% Center
					</button>
				</div>
			</div>

			<div className="crop-editor-actions">
				<button
					type="button"
					className="crop-btn crop-btn-cancel"
					onClick={onCancel}
				>
					Cancel
				</button>
				<button
					type="button"
					className="crop-btn crop-btn-apply"
					onClick={onApply}
				>
					Apply Crop
				</button>
			</div>
		</div>
	);
};

export default CropEditor;
