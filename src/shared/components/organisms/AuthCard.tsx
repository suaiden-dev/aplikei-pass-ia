import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@shared/utils/cn";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  logoHref?: string;
  logoAlt?: string;
  logoSrc?: string;
  welcome?: {
    show: boolean;
    title: string;
    description: string;
  };
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  logoHref = "/",
  logoAlt = "Aplikei",
  logoSrc = "/logo.png",
  welcome,
  className,
}: AuthCardProps) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-[32px] border border-border bg-card p-8 shadow-[0_20px_80px_rgba(15,23,42,0.22)] sm:p-12",
          className,
        )}
      >
        {welcome?.show ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-card p-8 text-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <img src={logoSrc} alt={logoAlt} className="mb-6 h-20 w-auto" />
            </motion.div>
            <motion.h2
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="font-display mb-3 text-2xl font-bold leading-none tracking-[-0.03em] text-text"
            >
              {welcome.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted"
            >
              {welcome.description}
            </motion.p>
          </motion.div>
        ) : null}

        <div className="text-center">
          <Link to={logoHref} className="inline-block">
            <img src={logoSrc} alt={logoAlt} className="h-12 w-auto transition-transform hover:scale-105" />
          </Link>
          <h1 className="mt-10 font-display text-2xl font-bold leading-none tracking-[-0.04em] text-text">
            {title}
          </h1>
          <p className="mt-3 text-sm font-medium text-text-muted">{subtitle}</p>
        </div>

        <div className="mt-8">{children}</div>

        {footer ? <div className="mt-6 text-center">{footer}</div> : null}
      </motion.div>
    </div>
  );
}
