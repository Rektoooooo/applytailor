import { motion, AnimatePresence } from 'framer-motion';
import { useMobileMenu } from '../contexts/MobileMenuContext';

export default function MobileOverlay() {
  const { isOpen, closeMenu } = useMobileMenu();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeMenu}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}
