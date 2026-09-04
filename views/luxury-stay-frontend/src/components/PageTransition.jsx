import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Scroll to top immediately when route changes
    window.scrollTo(0, 0);
    
    // Show loader
    setIsLoading(true);

    // Hide loader after a short delay (simulating a smooth page load)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // 500ms loader

    return () => clearTimeout(timer);
  }, [location.pathname]); // Only trigger when the path changes

  return (
    <>
      {/* Premium Full-Screen Loader */}
      <div 
        className={`fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center transition-opacity duration-500 ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`transition-all duration-500 transform ${isLoading ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <Logo size="lg" isDark={true} />
          <div className="mt-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-gray-100 border-t-[#937648] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>

      {/* Render children normally (they will render instantly, but will be hidden by the absolute loader for 500ms) */}
      {children}
    </>
  );
};

export default PageTransition;
