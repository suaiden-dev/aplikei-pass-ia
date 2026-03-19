import React from "react";
import { ShieldCheck } from "lucide-react";

interface LoadingStateProps {
  fullScreen?: boolean;
  message?: string;
  icon?: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  fullScreen = false,
  message = "Processando solicitação...",
  icon = <ShieldCheck className="w-6 h-6 text-primary" />,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Spinner Container */}
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Outer static track */}
        <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-800" />
        
        {/* Inner spinning ring */}
        {/* We use standard animate-spin keyframes but apply ease-in-out easing */}
        <div 
          className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent border-r-transparent animate-spin" 
          style={{ animationTimingFunction: "ease-in-out", animationDuration: "1.2s" }}
        />
        
        {/* Inner static icon */}
        <div className="absolute inset-0 flex items-center justify-center z-10 transition-opacity">
          {icon}
        </div>
      </div>
      
      {/* Dynamic Message */}
      {message && (
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 animate-pulse tracking-tight">
          {message}
        </p>
      )}
    </div>
  );

  // Full Screen Variant with Glassmorphism
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-all duration-300">
        <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 flex flex-col items-center">
          {content}
        </div>
      </div>
    );
  }

  // Inline Variant
  return (
    <div className="flex items-center justify-center w-full p-8 min-h-[200px]">
      {content}
    </div>
  );
};
