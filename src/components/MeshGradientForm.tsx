import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import ColorPicker from './ColorPicker';

type ColorPoint = {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  color: string;
  opacity: number;
};

type AspectRatio = {
  name: string;
  width: number;
  height: number;
  isCustom?: boolean;
};

const aspectRatios: AspectRatio[] = [
  { name: '16:9', width: 1920, height: 1080 },
  { name: '4:3', width: 1600, height: 1200 },
  { name: '21:9', width: 2560, height: 1080 },
  { name: 'Square', width: 1440, height: 1440 },
  { name: 'Mobile', width: 1080, height: 1920 },
  { name: '32:9', width: 3840, height: 1080 },
];

export default function MeshGradientForm() {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [colorPoints, setColorPoints] = useState<ColorPoint[]>([
    { x: 0.2, y: 0.2, color: '#ff6b6b', opacity: 1 },
    { x: 0.8, y: 0.3, color: '#4ecdc4', opacity: 1 },
    { x: 0.3, y: 0.8, color: '#ffe66d', opacity: 1 },
    { x: 0.7, y: 0.7, color: '#a8e6cf', opacity: 1 },
  ]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null); // Track selected point for canvas highlighting only
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [blendRadius, setBlendRadius] = useState(0.4); // How far colors blend
  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState<number | null>(null);
  const [renderTrigger, setRenderTrigger] = useState(0); // Force re-render trigger
  const renderTimeoutRef = useRef<number | null>(null);
  const isRenderingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isInteractingRef = useRef(false); // Tracks any user interaction

  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  // Calculate distance between two points
  const distance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  // Render mesh gradient using inverse distance weighting
  const renderMeshGradient = useCallback((canvas: HTMLCanvasElement, width: number, height: number, points: ColorPoint[], radius: number, lowQuality = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limit preview resolution for performance
    // Use much lower resolution during interaction for better performance
    const maxPreviewWidth = lowQuality ? 300 : 600;
    let renderWidth = width;
    let renderHeight = height;
    let scale = 1;

    if (width > maxPreviewWidth) {
      scale = maxPreviewWidth / width;
      renderWidth = maxPreviewWidth;
      renderHeight = Math.floor(height * scale);
    }

    const imageData = ctx.createImageData(renderWidth, renderHeight);
    const data = imageData.data;

    for (let y = 0; y < renderHeight; y++) {
      for (let x = 0; x < renderWidth; x++) {
        const nx = x / renderWidth;
        const ny = y / renderHeight;

        // Calculate weighted color based on distance to all color points
        let totalWeight = 0;
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;

        for (const point of points) {
          const dist = distance(nx, ny, point.x, point.y);
          // Use inverse distance weighting with adjustable blend radius
          // The radius controls how far colors spread (higher = smoother blending)
          const adjustedDist = dist / radius;
          const weight = 1 / (adjustedDist ** 2 + 0.01); // Add small epsilon to avoid division by zero
          totalWeight += weight;

          const [pr, pg, pb] = hexToRgb(point.color);
          const opacity = point.opacity;
          r += pr * weight * opacity;
          g += pg * weight * opacity;
          b += pb * weight * opacity;
          a += opacity * weight;
        }

        // Normalize
        if (totalWeight > 0) {
          r /= totalWeight;
          g /= totalWeight;
          b /= totalWeight;
          a = Math.min(1, a / totalWeight);
        }

        const idx = (y * renderWidth + x) * 4;
        data[idx] = Math.round(r);
        data[idx + 1] = Math.round(g);
        data[idx + 2] = Math.round(b);
        data[idx + 3] = Math.round(a * 255);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    
    // Scale up if needed
    if (scale < 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = renderWidth;
      tempCanvas.height = renderHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(imageData, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(tempCanvas, 0, 0, width, height);
      }
    }
  }, []);

  // Render preview with aggressive debouncing and quality control
  useEffect(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    // Don't render during any interaction
    if (isInteractingRef.current || isDragging) {
      return;
    }

    // Use longer debounce for better performance
    renderTimeoutRef.current = window.setTimeout(() => {
      const canvas = previewCanvasRef.current;
      if (!canvas || isRenderingRef.current) return;

      const container = canvas.parentElement;
      if (!container) return;

      isRenderingRef.current = true;
      requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const aspectRatio = selectedRatio.width / selectedRatio.height;
        let width = rect.width;
        let height = width / aspectRatio;

        if (height > rect.height) {
          height = rect.height;
          width = height * aspectRatio;
        }

        canvas.width = Math.floor(width);
        canvas.height = Math.floor(height);
        renderMeshGradient(canvas, canvas.width, canvas.height, colorPoints, blendRadius, false);
        isRenderingRef.current = false;
      });
    }, 200); // Increased debounce to 200ms

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [colorPoints, selectedRatio, blendRadius, isDragging, renderMeshGradient, renderTrigger]);

  // Global mouse handlers for dragging with throttling
  useEffect(() => {
    if (!isDragging || dragPointIndex === null) return;

    let rafId: number | null = null;
    let lastUpdate = 0;
    const throttleMs = 32; // ~30fps max update rate

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate < throttleMs) {
        return;
      }
      lastUpdate = now;

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;

        const container = canvas.parentElement;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        const newPoints = [...colorPoints];
        newPoints[dragPointIndex] = {
          ...newPoints[dragPointIndex],
          x,
          y,
        };
        setColorPoints(newPoints);
      });
    };

    const handleGlobalMouseUp = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      isDraggingRef.current = false;
      isInteractingRef.current = false;
      setIsDragging(false);
      setDragPointIndex(null);
      setRenderTrigger(prev => prev + 1); // Trigger render after drag
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragPointIndex, colorPoints]);

  // Handle canvas click to add points (only if not dragging)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current || isDragging) return; // Don't add points while dragging

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Add new point
    const newPoint: ColorPoint = {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      color: '#ffffff',
      opacity: 1,
    };
    setColorPoints([...colorPoints, newPoint]);
    setSelectedPoint(colorPoints.length);
  };


  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
    isInteractingRef.current = false;
    setIsDragging(false);
    setDragPointIndex(null);
    setRenderTrigger(prev => prev + 1); // Trigger render after interaction
  };

  const handleColorChange = (index: number, color: string, opacity: number) => {
    const newPoints = [...colorPoints];
    newPoints[index] = { ...newPoints[index], color, opacity };
    setColorPoints(newPoints);
  };

  const handleColorInteractionStart = () => {
    isInteractingRef.current = true;
  };

  const handleColorInteractionEnd = () => {
    isInteractingRef.current = false;
    setRenderTrigger(prev => prev + 1); // Trigger render after interaction ends
  };

  const removeColorPoint = (index: number) => {
    if (colorPoints.length > 1) {
      setColorPoints(colorPoints.filter((_, i) => i !== index));
      if (selectedPoint === index) {
        // If removing the selected point, select the first remaining point
        setSelectedPoint(0);
      } else if (selectedPoint !== null && selectedPoint > index) {
        setSelectedPoint(selectedPoint - 1);
      }
    }
  };

  const addColorPoint = () => {
    const newPoint: ColorPoint = {
      x: 0.5,
      y: 0.5,
      color: '#ffffff',
      opacity: 1,
    };
    const newIndex = colorPoints.length;
    setColorPoints([...colorPoints, newPoint]);
    setSelectedPoint(newIndex);
  };

  const downloadWallpaper = () => {
    const canvas = document.createElement('canvas');
    canvas.width = selectedRatio.width;
    canvas.height = selectedRatio.height;

    renderMeshGradient(canvas, canvas.width, canvas.height, colorPoints, blendRadius, false);

    const link = document.createElement('a');
    link.download = `mesh-wallpaper-${selectedRatio.name.toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCustomRatio = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);

    if (width > 0 && height > 0) {
      setSelectedRatio({
        name: 'Custom',
        width,
        height,
        isCustom: true,
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Color Points ({colorPoints.length})
          </h2>
          <button
            onClick={addColorPoint}
            disabled={colorPoints.length >= 10}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-blue-500 dark:bg-green-500 text-white hover:bg-blue-600 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Plus size={16} />
            Add Point
          </button>
        </div>

        {/* List of all color points - always expanded */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {colorPoints.map((point, index) => (
            <div
              key={index}
              className="border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md"
            >
              <div className="flex items-center justify-between p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex-shrink-0"
                    style={{
                      backgroundColor: point.color,
                      opacity: point.opacity,
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Point {index + 1}
                  </span>
                </div>
                <button
                  onClick={() => removeColorPoint(index)}
                  disabled={colorPoints.length <= 1}
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Remove point"
                >
                  <Trash2 size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="px-3 pb-3">
                <ColorPicker
                  color={point.color}
                  opacity={point.opacity}
                  onChange={(color, opacity) => handleColorChange(index, color, opacity)}
                  onInteractionStart={handleColorInteractionStart}
                  onInteractionEnd={handleColorInteractionEnd}
                  label={`Point ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Blend Smoothness: {Math.round(blendRadius * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={blendRadius}
            onMouseDown={() => { isInteractingRef.current = true; }}
            onMouseUp={() => { 
              isInteractingRef.current = false;
              setRenderTrigger(prev => prev + 1); // Trigger render after slider release
            }}
            onTouchEnd={() => {
              isInteractingRef.current = false;
              setRenderTrigger(prev => prev + 1); // Trigger render after touch release
            }}
            onChange={(e) => setBlendRadius(parseFloat(e.target.value))}
            className="w-full accent-blue-500 dark:accent-green-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click on the canvas to add color points. Drag points to move them.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800">
        <div
          className="relative w-full flex items-center justify-center"
          style={{
            aspectRatio: `${selectedRatio.width}/${selectedRatio.height}`,
            minHeight: '300px',
          }}
        >
          <canvas
            ref={previewCanvasRef}
            className="w-full h-full cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
          {/* Render control points overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {colorPoints.map((point, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-move z-10"
                style={{
                  left: `${point.x * 100}%`,
                  top: `${point.y * 100}%`,
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isDraggingRef.current = true;
                  isInteractingRef.current = true;
                  setIsDragging(true);
                  setDragPointIndex(index);
                  setSelectedPoint(index);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPoint(index);
                }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-lg transition-transform hover:scale-110"
                  style={{
                    backgroundColor: point.color,
                    opacity: point.opacity,
                  }}
                />
                {selectedPoint === index && (
                  <div className="absolute inset-0 w-7 h-7 -translate-x-1 -translate-y-1 rounded-full border-2 border-blue-500 dark:border-green-500 animate-pulse pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 pl-3 pt-3">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 pb-4">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.name}
              onClick={() => setSelectedRatio(ratio)}
              className={`shadow-md p-2 rounded-md text-sm ${
                selectedRatio.name === ratio.name
                  ? 'bg-blue-500 dark:bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200'
              }`}
            >
              {ratio.name} ({ratio.width}x{ratio.height})
            </button>
          ))}
          <div className="col-span-2 sm:col-span-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex gap-2">
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="shadow-md w-full p-2 text-sm rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-200 border-0"
                  placeholder="Width"
                  min="1"
                />
                <span className="hidden sm:flex items-center text-gray-500 dark:text-gray-400">×</span>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  className="shadow-md w-full p-2 text-sm rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-200 border-0"
                  placeholder="Height"
                  min="1"
                />
              </div>
              <button
                onClick={handleCustomRatio}
                className={`shadow-md w-full sm:w-20 p-2 rounded-md text-sm bg-blue-500 dark:bg-green-500 text-white`}
              >
                Set
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={downloadWallpaper}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 dark:bg-green-500 text-white p-3 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        <Download size={20} />
        Download Wallpaper
      </button>
    </div>
  );
}

