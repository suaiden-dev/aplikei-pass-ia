import { motion } from "framer-motion";

export function LogoLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      {/* Pulsing Logo Only */}
      <motion.div
        animate={{ 
          scale: [0.95, 1.05, 0.95],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative"
      >
        <img src="/logo.png" alt="Loading..." className="h-32 w-auto object-contain brightness-110 drop-shadow-2xl" />
      </motion.div>
    </div>
  );
}
