import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RiArrowUpLine } from "react-icons/ri";

export function ScrollToTop() {
  const { pathname, search } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Scroll to top on route change (including search params for onboarding steps)
  useEffect(() => {
    setTimeout(() => {
      // Standard window scroll
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // Dashboard container scroll
      const containers = document.querySelectorAll(".overflow-y-auto");
      containers.forEach((container) => {
        container.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }, 100);
  }, [pathname, search]);

  // Handle scroll visibility for the button
  useEffect(() => {
    const toggleVisibility = () => {
      // Half screen threshold
      if (window.scrollY > window.innerHeight / 2) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[80] p-3 rounded-full bg-primary text-white shadow-lg lg:bottom-10 lg:right-10 hover:bg-primary-hover hover:-translate-y-1 transition-transform"
          aria-label="Scroll to top"
        >
          <RiArrowUpLine size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
