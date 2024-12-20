import React, { useState } from 'react';
import { Download } from 'lucide-react';

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
  const [gradient, setGradient] = useState('linear-gradient(45deg, #ff6b6b, #4ecdc4)');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [error, setError] = useState('');

  const validateGradient = (value: string) => {
    try {
      const div = document.createElement('div');
      div.style.background = value;
      return div.style.background !== '';
    } catch {
      return false;
    }
  };

  const handleGradientChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setGradient(value);
    if (!validateGradient(value)) {
      setError('Invalid gradient syntax');
    } else {
      setError('');
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
    temp.style.background = gradient;

    // Convert to data URL
    const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${selectedRatio.width}" height="${selectedRatio.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:${gradient}"></div>
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
      <div className="space-y-2">
        <label htmlFor="gradient" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          CSS Gradient
        </label>
        <textarea
          id="gradient"
          value={gradient}
          onChange={handleGradientChange}
          className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          rows={3}
          placeholder="Enter CSS gradient (e.g., linear-gradient(45deg, #ff6b6b, #4ecdc4))"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
  
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Aspect Ratio</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
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
  
      <div className="relative overflow-hidden rounded-lg shadow-lg" style={{ aspectRatio: `${selectedRatio.width}/${selectedRatio.height}` }}>
        <div
          className="w-full h-full"
          style={{ background: gradient }}
        />
      </div>
  
      <button
        onClick={downloadWallpaper}
        disabled={!!error}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 dark:bg-green-500 text-white p-3 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={20} />
        Download Wallpaper
      </button>
    </div>
  );
}