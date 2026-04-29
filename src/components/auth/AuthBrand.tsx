import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

interface AuthBrandProps {
  className?: string;
}

export function AuthBrand({ className }: AuthBrandProps) {
  return (
    <Link to="/" className="inline-flex items-center">
      <img
        src="/logo.png"
        alt="Aplikei"
        className={cn("h-12 w-auto object-contain", className)}
      />
    </Link>
  );
}
