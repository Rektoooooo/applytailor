import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const MobileMenuContext = createContext(null);

export function MobileMenuProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  // Close menu on resize above 768px (md breakpoint)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMenu]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <MobileMenuContext.Provider value={{ isOpen, openMenu, closeMenu, toggleMenu }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext);
  if (!context) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider');
  }
  return context;
}
