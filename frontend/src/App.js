import { useEffect, useState } from 'react';
import FileUploader from './components/Homepage.jsx'; // Corrected path/name
import './global.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Effect to apply dark mode class to document.documentElement and save preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark'); // For your global.css variables
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light'); // For your global.css variables
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    // The outermost div doesn't need to conditionally apply bg/text colors directly here
    // as Tailwind's 'dark' variant and your component's props will handle it.
    // The min-h-screen/min-w-screen is handled by FileUploader, or you can add it here.
    <div className="min-h-screen">
      {/* The toggle button can be here or inside FileUploader, depending on design.
          If here, FileUploader doesn't need its own toggle. */}
      {/* <div className="p-4 flex justify-end">
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
        >
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div> */}
      <FileUploader isDarkMode={darkMode} toggleTheme={toggleTheme} />
    </div>
  );
}

export default App;