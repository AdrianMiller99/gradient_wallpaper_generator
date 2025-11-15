import { useRef } from 'react';

type ColorPickerProps = {
  color: string;
  opacity: number;
  onChange: (color: string, opacity: number) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  label: string;
};

export default function ColorPicker({ color, opacity, onChange, onInteractionStart, onInteractionEnd, label }: ColorPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-2 p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <div className="relative" ref={pickerRef}>
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value, opacity)}
          onMouseDown={() => onInteractionStart?.()}
          onMouseUp={() => onInteractionEnd?.()}
          onBlur={() => onInteractionEnd?.()}
          onTouchStart={() => onInteractionStart?.()}
          onTouchEnd={() => onInteractionEnd?.()}
          className="w-full h-10 cursor-pointer bg-white dark:bg-gray-800"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs dark:text-white">
          Opacity: {Math.round(opacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(e) => onChange(color, parseFloat(e.target.value))}
          onMouseDown={() => onInteractionStart?.()}
          onMouseUp={() => onInteractionEnd?.()}
          onTouchStart={() => onInteractionStart?.()}
          onTouchEnd={() => onInteractionEnd?.()}
          className="w-full accent-blue-500 dark:accent-green-500"
        />
      </div>
    </div>
  );
} 