import { useState } from 'react';
import { Download } from 'lucide-react';
import ColorPicker from './ColorPicker';

type AspectRatio = {
  name: string;
  width: number;
  height: number;
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
  const [color1, setColor1] = useState('#ff6b6b');
  const [color2, setColor2] = useState('#4ecdc4');
  const [opacity1, setOpacity1] = useState(1);
  const [opacity2, setOpacity2] = useState(1);
  const [angle, setAngle] = useState(45);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);

  const getGradientString = () => {
    const rgba1 = `${color1}${Math.round(opacity1 * 255).toString(16).padStart(2, '0')}`;
    const rgba2 = `${color2}${Math.round(opacity2 * 255).toString(16).padStart(2, '0')}`;
    return `linear-gradient(${angle}deg, ${rgba1}, ${rgba2})`;
  };

  const handleColor1Change = (color: string, opacity: number) => {
    setColor1(color);
    setOpacity1(opacity);
  };

  const handleColor2Change = (color: string, opacity: number) => {
    setColor2(color);
    setOpacity2(opacity);
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

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ColorPicker
          color={color1}
          opacity={opacity1}
          onChange={handleColor1Change}
          label="Color 1"
        />
        <ColorPicker
          color={color2}
          opacity={opacity2}
          onChange={handleColor2Change}
          label="Color 2"
        />
      </div>

      <div className="space-y-2 p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
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

      <div className="space-y-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 pl-3 pt-3">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.name}
              onClick={() => setSelectedRatio(ratio)}
              className={`p-2 rounded-md text-sm ${
                selectedRatio.name === ratio.name
                  ? 'bg-blue-500 dark:bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200'
              }`}
            >
              {ratio.name} ({ratio.width}x{ratio.height})
            </button>
          ))}
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
        className="w-full flex items-center justify-center gap-2 bg-blue-500 dark:bg-green-500 text-white p-3 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={20} />
        Download Wallpaper
      </button>
    </div>
  );
}