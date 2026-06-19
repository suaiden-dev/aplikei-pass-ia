import { LogoLoader } from "@shared/components/atoms/logo-loader";

export function RouteGuardLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg text-text">
      <LogoLoader />
    </div>
  );
}
