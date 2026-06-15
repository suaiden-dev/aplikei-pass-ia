import { useTheme } from "@shared/hooks/useTheme";

interface AppLogoProps {
  className?: string;
  alt?: string;
}

export function AppLogo({ className, alt = "Aplikei" }: AppLogoProps) {
  const { theme } = useTheme();
  return (
    <img
      src={theme === "dark" ? "/logo-dark.png" : "/logo.png"}
      alt={alt}
      className={className}
    />
  );
}
