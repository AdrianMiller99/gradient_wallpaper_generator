import GradientForm from './components/GradientForm';
import ThemeToggle from './components/ThemeToggle';
import { Palette, Github } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-0 px-4 py-4 sm:px-6 lg:px-8">
          {/* Mobile Layout */}
          <div className="sm:hidden flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Palette className="h-8 w-8 text-blue-500 dark:text-green-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Gradient Wallpaper Generator
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/AdrianMiller99/gradient_wallpaper_generator"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Github Repository"
              >
                <Github className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-green-500" />
              </a>
              <ThemeToggle />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
              <Palette className="h-8 w-8 text-blue-500 dark:text-green-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gradient Wallpaper Generator
              </h1>
            </div>
            
            <div className="ml-auto flex items-center gap-4">
              <a
                href="https://github.com/AdrianMiller99/gradient_wallpaper_generator"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Github Repository"
              >
                <Github className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-green-500" />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <GradientForm />
      </main>
    </div>
  );
}

export default App;