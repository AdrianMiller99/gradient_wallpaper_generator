import { useState } from 'react';
import { Download, Plus, X } from 'lucide-react';
import ColorPicker from './ColorPicker';

type ColorStop = {
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

export default function GradientForm() {
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { color: '#ff6b6b', opacity: 1 },
    { color: '#4ecdc4', opacity: 1 }
  ]);
  const [angle, setAngle] = useState(45);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');

  const getGradientString = () => {
    return `linear-gradient(${angle}deg, ${colorStops.map(stop => 
      `${stop.color}${Math.round(stop.opacity * 255).toString(16).padStart(2, '0')}`
    ).join(', ')})`;
  };

  const handleColorChange = (index: number, color: string, opacity: number) => {
    const newStops = [...colorStops];
    newStops[index] = { color, opacity };
    setColorStops(newStops);
  };

  const addColorStop = () => {
    if (colorStops.length < 5) { // Limit to 5 colors
      setColorStops([...colorStops, { color: '#ffffff', opacity: 1 }]);
    }
  };

  const removeColorStop = (index: number) => {
    if (colorStops.length > 2) { // Keep minimum 2 colors
      setColorStops(colorStops.filter((_, i) => i !== index));
    }
  };

  const downloadWallpaper = () => {
    const canvas = document.createElement('canvas');
    canvas.width = selectedRatio.width;
    canvas.height = selectedRatio.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create temporary div to render gradient
    const temp = document.createElement('div');
    temp.style.width = `${selectedRatio.width}px`;
    temp.style.height = `${selectedRatio.height}px`;
    temp.style.background = getGradientString();

    // Convert to data URL
    const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${selectedRatio.width}" height="${selectedRatio.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:${getGradientString()}"></div>
      </foreignObject>
    </svg>`;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `wallpaper-${selectedRatio.name.toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
  };

  const handleCustomRatio = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (width > 0 && height > 0) {
      setSelectedRatio({
        name: 'Custom',
        width,
        height,
        isCustom: true
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">Colors</h2>
          <button
            onClick={addColorStop}
            disabled={colorStops.length >= 5}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-blue-500 dark:bg-green-500 text-white hover:bg-blue-600 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Plus size={16} />
            Add Color
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {colorStops.map((stop, index) => (
            <div key={index} className="relative">
              <ColorPicker
                color={stop.color}
                opacity={stop.opacity}
                onChange={(color, opacity) => handleColorChange(index, color, opacity)}
                label={`Color ${index + 1}`}
              />
              {colorStops.length > 2 && (
                <button
                  onClick={() => removeColorStop(index)}
                  className="absolute top-3 right-3 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Remove color"
                >
                  <X size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Gradient Angle: {angle}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={angle}
          onChange={(e) => setAngle(parseInt(e.target.value))}
          className="w-full accent-blue-500 dark:accent-green-500"
        />
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

      <div 
        className="relative overflow-hidden rounded-lg shadow-lg" 
        style={{ 
          aspectRatio: `${selectedRatio.width}/${selectedRatio.height}`,
          background: getGradientString()
        }}
      />

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