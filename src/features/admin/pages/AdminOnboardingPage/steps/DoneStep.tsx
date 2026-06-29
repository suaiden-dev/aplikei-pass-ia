import { motion } from "framer-motion";
import { RiCheckDoubleLine, RiSettings3Line } from "react-icons/ri";
import { Button } from "@shared/components/atoms/button";

interface DoneStepProps {
  onComplete: () => void;
  productsSkipped?: boolean;
  onConfigureProducts?: () => void;
}

export function DoneStep({ onComplete, productsSkipped, onConfigureProducts }: DoneStepProps) {
  return (
    <div className="text-center space-y-8 py-12 px-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mx-auto w-24 h-24 rounded-full bg-success/10 flex items-center justify-center"
      >
        <RiCheckDoubleLine className="text-5xl text-success" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="space-y-3"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-text">Your office is ready.</h2>
        <p className="text-base text-text-muted max-w-sm mx-auto leading-relaxed">
          {productsSkipped
            ? "Welcome to Aplikei. You can configure your services and pricing anytime from the Products page."
            : "Welcome to Aplikei. Your account is fully configured and ready to use."}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.65 }}
        className="space-y-3"
      >
        {productsSkipped && onConfigureProducts && (
          <div>
            <Button
              variant="outline"
              onClick={onConfigureProducts}
              className="h-11 px-8 rounded-xl text-sm font-semibold border-primary/30 text-primary hover:bg-primary/5 transition-all"
            >
              <RiSettings3Line className="mr-2 h-4 w-4" /> Configure services now
            </Button>
          </div>
        )}
        <div>
          <Button
            onClick={onComplete}
            className="h-12 px-10 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            Go to Dashboard →
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
