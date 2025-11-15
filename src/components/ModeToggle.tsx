import { Layers, Sparkles } from 'lucide-react';

type ModeToggleProps = {
  mode: 'gradient' | 'mesh';
  onChange: (mode: 'gradient' | 'mesh') => void;
};

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onChange('gradient')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          mode === 'gradient'
            ? 'bg-white dark:bg-gray-600 text-blue-500 dark:text-green-500 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        aria-label="Gradient mode"
      >
        <Layers size={16} />
        <span className="hidden sm:inline">Gradient</span>
      </button>
      <button
        onClick={() => onChange('mesh')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          mode === 'mesh'
            ? 'bg-white dark:bg-gray-600 text-blue-500 dark:text-green-500 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        aria-label="Mesh gradient mode"
      >
        <Sparkles size={16} />
        <span className="hidden sm:inline">Mesh</span>
      </button>
    </div>
  );
}

