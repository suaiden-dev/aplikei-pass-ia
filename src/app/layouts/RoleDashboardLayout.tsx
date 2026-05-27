import { useEffect, useMemo, useRef, useState } from "react";
import {
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import {
  RiArrowDownSLine,
  RiLogoutBoxRLine,
  RiPencilLine,
  RiUploadLine,
} from "react-icons/ri";
import { Button } from "@shared/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shared/components/atoms/dialog";
import { Input } from "@shared/components/atoms/input";
import { useAuth } from "@shared/hooks/useAuth";
import { useTheme } from "@shared/hooks/useTheme";
import type { UserRole as UserAccountRole } from "@features/auth/types";
import { getDashboardPathForRole } from "@features/auth/lib/roles";
import { authService } from "@features/auth/lib/auth";
import { storageService } from "@features/auth/services/storage";
import { cn } from "@shared/utils/cn";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";
import { OnboardingModal } from "@shared/components/organisms/OnboardingModal";
import { useSubscription } from "@features/admin/hooks/useSubscription";
import { RiLockPasswordLine, RiErrorWarningLine } from "react-icons/ri";
import { NotificationBell } from "@features/notifications/components/NotificationBell";
import { NotificationToaster } from "@features/notifications/components/NotificationToaster";
import { NotificationProvider } from "@app/app/providers/NotificationProvider";
import { fetchOfficeForUser } from "@features/offices/services/officeOps";

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  group?: string;
}

interface RoleDashboardLayoutProps {
  allowedRoles: UserAccountRole[];
  consoleTitle: string;
  consoleSubtitle: string;
  roleLabel: string;
  headerEyebrow: string;
  navItems: DashboardNavItem[];
  spotlightTitle?: string;
  spotlightDescription?: string;
  unauthorizedFallback: string;
}

const ONBOARDING_ALLOWED_PATHS = [
  "/admin/settings/company",
  "/admin/subscription",
] as const;

// ─── Sidebar Nav ─────────────────────────────────────────────────────────────

function NavItem({
  to,
  label,
  icon: Icon,
  exact,
  onNavigate,
  collapsed,
  disabled,
}: DashboardNavItem & {
  onNavigate: () => void;
  collapsed?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div
        title={collapsed ? label : undefined}
        className={cn(
          "flex items-center gap-3 px-4 rounded-2xl py-3 text-sm font-semibold transition-all duration-200 opacity-40 cursor-not-allowed",
          collapsed && "lg:justify-center lg:px-3 lg:gap-0",
          "text-text-muted bg-bg-subtle/40",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className={cn(collapsed && "lg:hidden")}>{label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 rounded-2xl py-3 text-sm font-semibold transition-all duration-200",
          collapsed && "lg:justify-center lg:px-3 lg:gap-0",
          isActive
            ? "bg-bg-subtle text-text border border-border"
            : "text-text-muted hover:bg-bg-subtle hover:text-text",
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className={cn(collapsed && "lg:hidden")}>{label}</span>
    </NavLink>
  );
}

function SidebarNav({
  navItems,
  location,
  onNavigate,
  collapsed,
  lockedAllowedPaths,
}: {
  navItems: DashboardNavItem[];
  location: { pathname: string };
  onNavigate: () => void;
  collapsed?: boolean;
  lockedAllowedPaths?: string[] | null;
}) {
  const ungrouped = navItems.filter((i) => !i.group);
  const grouped = navItems.filter((i) => i.group);

  const groupNames = [...new Set(grouped.map((i) => i.group as string))];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groupNames.forEach((name) => {
      const hasActive = grouped
        .filter((i) => i.group === name)
        .some((i) => location.pathname.startsWith(i.to));
      initial[name] = hasActive;
    });
    return initial;
  });

  const toggle = (name: string) =>
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <nav className="mt-6 space-y-1">
      {ungrouped.map((item) => (
        <NavItem
          key={item.to}
          {...item}
          onNavigate={onNavigate}
          collapsed={collapsed}
          disabled={
            !!lockedAllowedPaths && !lockedAllowedPaths.includes(item.to)
          }
        />
      ))}

      {groupNames.map((name) => {
        const items = grouped.filter((i) => i.group === name);
        const isOpen = openGroups[name] ?? false;

        return (
          <div key={name}>
            {/* Group header — hidden on desktop when collapsed */}
            <button
              type="button"
              onClick={() => toggle(name)}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-bg-subtle hover:text-text",
                collapsed && "lg:hidden",
              )}
            >
              <span>{name}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {/* Items — always visible on desktop collapsed (icon only), visible when open on mobile */}
            <div
              className={cn(
                !collapsed && !isOpen && "hidden",
                collapsed && "lg:block",
              )}
            >
              <div
                className={cn(
                  !collapsed &&
                    "ml-3 mt-1 space-y-1 border-l border-border pl-3",
                )}
              >
                {items.map((item) => (
                  <NavItem
                    key={item.to}
                    {...item}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                    disabled={
                      !!lockedAllowedPaths &&
                      !lockedAllowedPaths.includes(item.to)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_SHIFT_FACTOR = 0.6;
const avatarTransform = (x: number, y: number, zoom: number) =>
  `translate(${x * AVATAR_SHIFT_FACTOR}%, ${y * AVATAR_SHIFT_FACTOR}%) scale(${zoom})`;

function buildAvatarDataUri(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = (words[0]?.[0] ?? "U") + (words[1]?.[0] ?? "");
  const safeInitials = initials.toUpperCase().slice(0, 2);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="64" fill="#3b82f6"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#ffffff">${safeInitials}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function cropAvatarToBlob(
  imageUrl: string,
  xOffset: number,
  yOffset: number,
  zoom: number,
): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Falha ao carregar imagem para recorte."));
    image.src = imageUrl;
  });

  const size = 640;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Falha ao criar canvas para edição da foto.");

  const coverScale = Math.max(
    size / img.naturalWidth,
    size / img.naturalHeight,
  );
  const appliedScale = coverScale * zoom;
  const drawWidth = img.naturalWidth * appliedScale;
  const drawHeight = img.naturalHeight * appliedScale;

  const extraX = Math.max(0, drawWidth - size);
  const extraY = Math.max(0, drawHeight - size);
  const normalizedX = (xOffset + 50) / 100;
  const normalizedY = (yOffset + 50) / 100;

  const drawX = -extraX * normalizedX;
  const drawY = -extraY * normalizedY;

  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.94),
  );
  if (!blob) throw new Error("Falha ao gerar foto recortada.");
  return blob;
}

export function RoleDashboardLayout({
  allowedRoles,
  consoleTitle,
  consoleSubtitle,
  roleLabel,
  headerEyebrow,
  navItems,
  spotlightTitle,
  spotlightDescription,
  unauthorizedFallback,
}: RoleDashboardLayoutProps) {
  const tProfile = useT("admin").profile;
  const { theme, toggleTheme } = useTheme();
  const { user: currentUser, logout, refreshAccount } = useAuth();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [officeName, setOfficeName] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      fetchOfficeForUser(currentUser.id)
        .then((office) => {
          if (office) {
            setOfficeName(office.name);
          }
        })
        .catch(() => {
          // ignore or fallback
        });
    }
  }, [currentUser]);

  const displayedTitle = officeName || consoleTitle;
  const [hasDismissedOnboarding, setHasDismissedOnboarding] = useState(false);
  void spotlightTitle;
  void spotlightDescription;

  const showOnboarding =
    currentUser?.role === "admin_lawyer" &&
    !currentUser.hasCompletedOnboarding &&
    !hasDismissedOnboarding;

  const handleOnboardingComplete = async () => {
    if (!currentUser) return;
    if (!officeId || !isActive) {
      toast.error(
        "Complete company setup and activate your subscription before finishing onboarding.",
      );
      return;
    }

    // Mark as dismissed locally immediately to prevent re-triggering during refresh
    setHasDismissedOnboarding(true);
    localStorage.removeItem("admin_lawyer_onboarding_step_v1");

    try {
      await authService.updateAccount(currentUser.id, {
        has_completed_onboarding: true,
      });
      await refreshAccount();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };
  const {
    isRestricted,
    loading: subLoading,
    officeId,
    isActive,
  } = useSubscription();
  const isAdminLawyerPendingOnboarding =
    currentUser?.role === "admin_lawyer" && !currentUser.hasCompletedOnboarding;
  const onboardingAccessLocked =
    isAdminLawyerPendingOnboarding && (!officeId || !isActive);

  useEffect(() => {
    if (!onboardingAccessLocked) return;
    const isAllowed = ONBOARDING_ALLOWED_PATHS.some((path) =>
      routeLocation.pathname.startsWith(path),
    );
    if (isAllowed) return;

    navigate(officeId ? "/admin/subscription" : "/admin/settings/company", {
      replace: true,
    });
  }, [navigate, officeId, onboardingAccessLocked, routeLocation.pathname]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true",
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.fullName ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const resolvedName = useMemo(() => {
    const u = currentUser as unknown as {
      fullName?: string | null;
      full_name?: string | null;
      name?: string | null;
    } | null;
    const raw = u?.fullName || u?.full_name || u?.name || "";
    const firstWord = String(raw).trim().split(/\s+/).filter(Boolean)[0];
    return firstWord || tProfile.userNameDefault;
  }, [currentUser, tProfile.userNameDefault]);

  const resolvedAvatar = useMemo(() => {
    const u = currentUser as unknown as {
      avatarUrl?: string | null;
      avatar_url?: string | null;
    } | null;
    const fromUser = u?.avatarUrl || u?.avatar_url || null;
    if (fromUser) return fromUser;
    return buildAvatarDataUri(resolvedName);
  }, [currentUser, resolvedName]);

  const activeItem = navItems.find((item) =>
    item.exact
      ? routeLocation.pathname === item.to
      : routeLocation.pathname.startsWith(item.to),
  );
  const isPageBuilderPath = routeLocation.pathname.includes("/page-builder");
  const subscriptionLockedPaths = [
    "/page-builder",
    "/products",
    "/settings/discount-rules",
  ];
  const isSubscriptionLockedPath = subscriptionLockedPaths.some((path) =>
    routeLocation.pathname.includes(path),
  );

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const avatarUrl = useMemo(
    () => imagePreviewUrl ?? resolvedAvatar,
    [imagePreviewUrl, resolvedAvatar],
  );

  const openEditProfile = () => {
    if (!currentUser) return;
    setDisplayName(resolvedName);
    setImageFile(null);
    setImagePreviewUrl(null);
    setXOffset(currentUser.avatarOffsetX ?? 0);
    setYOffset(currentUser.avatarOffsetY ?? 0);
    setZoom(currentUser.avatarZoom ?? 1);
    setMenuOpen(false);
    setIsProfileDialogOpen(true);
  };

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(tProfile.selectImageError);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(tProfile.imageSizeError);
      return;
    }

    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    const preview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreviewUrl(preview);
    setXOffset(0);
    setYOffset(0);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      let nextAvatarUrl: string | undefined;
      if (imageFile && imagePreviewUrl) {
        const croppedBlob = await cropAvatarToBlob(
          imagePreviewUrl,
          xOffset,
          yOffset,
          zoom,
        );
        const avatarFile = new File([croppedBlob], "avatar.jpg", {
          type: "image/jpeg",
        });
        nextAvatarUrl = await storageService.uploadProfilePhoto(
          currentUser.id,
          avatarFile,
        );
      }

      await authService.updateAccount(currentUser.id, {
        full_name: displayName.trim() || resolvedName,
        avatar_url: nextAvatarUrl ?? resolvedAvatar ?? null,
        avatar_offset_x: xOffset,
        avatar_offset_y: yOffset,
        avatar_zoom: zoom,
      });
      await refreshAccount();
      toast.success(tProfile.successUpdate);
      setIsProfileDialogOpen(false);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || tProfile.errorUpdate);
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return <Navigate to="/acompanhar-meu-caso" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <Navigate
        to={unauthorizedFallback || getDashboardPathForRole(currentUser.role)}
        replace
      />
    );
  }

  return (
    <NotificationProvider role="admin">
      <div className="min-h-screen bg-bg text-text">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] translate-x-1/4 translate-y-1/4 rounded-full bg-info/10 blur-3xl" />
        </div>

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/95 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:translate-x-0",
            "w-72 p-5 transition-all duration-300",
            collapsed && "lg:w-16 lg:p-2",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between",
              collapsed && "lg:justify-center",
            )}
          >
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Aplikei"
                className="h-10 w-auto object-contain shrink-0"
              />
              <div className={cn(collapsed && "lg:hidden")}>
                <p className="text-sm font-bold text-text uppercase tracking-tight">
                  {displayedTitle}
                </p>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mt-0.5">
                  {roleLabel}
                </p>
                <p className="text-[10px] font-medium text-text-muted mt-1">
                  {consoleSubtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              className={cn(
                "rounded-xl border border-border p-2 text-text-muted lg:hidden",
                collapsed && "lg:hidden",
              )}
              onClick={() => setMobileMenuOpen(false)}
              aria-label={tProfile.closeMenu}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav — grows to fill space */}
          <div className="flex-1 overflow-y-auto">
            <SidebarNav
              navItems={navItems}
              location={routeLocation}
              onNavigate={() => setMobileMenuOpen(false)}
              collapsed={collapsed}
              lockedAllowedPaths={
                onboardingAccessLocked
                  ? (ONBOARDING_ALLOWED_PATHS as unknown as string[])
                  : null
              }
            />
          </div>

          {/* Profile & Logout (Mobile Only) */}
          <div className="mt-auto border-t border-border pt-4 space-y-2 lg:hidden">
            <div className="flex items-center gap-3 px-3 py-2">
              <img
                src={resolvedAvatar}
                alt="Avatar"
                className="h-9 w-9 rounded-full object-cover border border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text truncate">
                  {resolvedName}
                </p>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mt-1">
                  {currentUser.role.replace("_", " ")}
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-text-muted hover:bg-bg-subtle hover:text-text transition-all"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span>
                {theme === "dark"
                  ? tProfile.lightMode || "Modo Claro"
                  : tProfile.darkMode || "Modo Escuro"}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all"
            >
              <RiLogoutBoxRLine size={18} />
              <span>{tProfile.logout}</span>
            </button>
          </div>

          {/* Footer — collapse toggle */}
          <div
            className={cn(
              "mt-4 border-t border-border pt-4",
              collapsed ? "flex justify-center" : "",
            )}
          >
            <button
              type="button"
              onClick={toggleCollapsed}
              title={
                collapsed
                  ? tProfile.expandSidebar || "Expand"
                  : tProfile.collapseSidebar || "Collapse"
              }
              className={cn(
                "hidden lg:flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-bg-subtle hover:text-text",
                collapsed && "justify-center px-2",
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span>
                    {(tProfile.collapseSidebar || "Collapse").split(" ")[0]}
                  </span>
                </>
              )}
            </button>
            <p
              className={cn(
                "mt-3 text-center text-[10px] font-semibold uppercase tracking-widest text-text-muted",
                collapsed && "lg:hidden",
              )}
            >
              Powered by Aplikei
            </p>
          </div>
        </aside>

        {mobileMenuOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={tProfile.closeMenu}
          />
        ) : null}

        <div
          className={cn(
            "relative lg:transition-all lg:duration-300",
            collapsed ? "lg:pl-16" : "lg:pl-72",
          )}
        >
          <header className="sticky top-0 z-30 border-b border-border bg-bg/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-text-muted lg:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label={tProfile.openMenu}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    {headerEyebrow}
                  </p>
                  <h1 className="font-display text-2xl font-black tracking-[-0.04em] text-text">
                    {activeItem?.label ?? "Overview"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl p-1 transition-colors hover:bg-bg-subtle">
                  <NotificationBell role="admin" align="right" />
                </div>

                {/* Desktop-only Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="hidden lg:flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-text-muted transition-colors hover:text-text"
                  aria-label={tProfile.toggleTheme}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>

                {/* Desktop-only Profile Menu */}
                <div className="relative hidden lg:block" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-sm font-semibold text-text transition-colors hover:border-primary/40"
                  >
                    <img
                      src={resolvedAvatar}
                      alt="Avatar"
                      className="h-7 w-7 rounded-full object-cover border border-border"
                    />
                    <span className="max-w-[120px] truncate">
                      {resolvedName}
                    </span>
                    <RiArrowDownSLine className="text-text-muted" size={16} />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                      <button
                        type="button"
                        onClick={openEditProfile}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-text transition-colors hover:bg-bg-subtle"
                      >
                        <RiPencilLine size={16} />
                        {tProfile.changeProfile}
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10"
                      >
                        <RiLogoutBoxRLine size={16} />
                        {tProfile.logout}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main
            className={cn(
              "relative z-10 py-6",
              isPageBuilderPath
                ? "px-2 sm:px-3 lg:px-4"
                : "px-4 sm:px-6 lg:px-8",
            )}
          >
            <div
              className={cn(
                "mx-auto",
                isPageBuilderPath ? "max-w-none" : "max-w-7xl",
              )}
            >
              {subLoading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : isRestricted && isSubscriptionLockedPath ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 rounded-[32px] bg-warning/10 flex items-center justify-center text-warning mb-8">
                    <RiLockPasswordLine className="text-5xl" />
                  </div>
                  <h2 className="text-3xl font-black text-text mb-4 tracking-tighter">
                    Feature Locked
                  </h2>
                  <p className="text-text-muted max-w-md mx-auto font-medium mb-8">
                    This feature is part of professional plans. Activate your
                    subscription to manage products, discounts and your custom
                    website.
                  </p>
                  <Button
                    onClick={() => navigate("/subscription")}
                    className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                    View Available Plans
                  </Button>
                </div>
              ) : (
                <>
                  {isRestricted &&
                    !routeLocation.pathname.includes("/subscription") && (
                      <div className="mb-6 flex items-center justify-between p-4 rounded-2xl bg-warning/10 border border-warning/20 animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-3 text-warning">
                          <RiErrorWarningLine className="text-xl" />
                          <p className="text-xs font-black uppercase tracking-widest">
                            Your subscription is not active
                          </p>
                        </div>
                        <button
                          onClick={() => navigate("/subscription")}
                          className="text-[10px] font-black uppercase tracking-widest text-warning hover:underline"
                        >
                          Activate now
                        </button>
                      </div>
                    )}
                  <Outlet />
                </>
              )}
            </div>
          </main>
        </div>
        <NotificationToaster />

        <Dialog
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
        >
          <DialogContent className="max-w-xl border-border bg-card p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-text">
                {tProfile.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-28 w-28 overflow-hidden rounded-full border border-border">
                  <img
                    src={avatarUrl}
                    alt={tProfile.previewAlt}
                    className="h-full w-full object-cover"
                    style={{
                      transform: avatarTransform(xOffset, yOffset, zoom),
                    }}
                  />
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text hover:bg-bg-subtle">
                  <RiUploadLine size={16} />
                  {tProfile.uploadBtn}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelected}
                  />
                </label>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  {tProfile.xAxis}
                </label>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={xOffset}
                  onChange={(e) => setXOffset(Number(e.target.value))}
                  className="w-full"
                />
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  {tProfile.yAxis}
                </label>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={yOffset}
                  onChange={(e) => setYOffset(Number(e.target.value))}
                  className="w-full"
                />
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  {tProfile.zoom}
                </label>
                <input
                  type="range"
                  min={0.8}
                  max={2.5}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  {tProfile.nameLabel}
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={tProfile.namePlaceholder}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsProfileDialogOpen(false)}
                  disabled={isSaving}
                >
                  {tProfile.cancelBtn}
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? tProfile.savingBtn : tProfile.saveBtn}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <NotificationToaster />
        <OnboardingModal
          isOpen={showOnboarding}
          officeCreated={Boolean(officeId)}
          subscriptionActive={Boolean(isActive)}
          onGoCompany={() => navigate("/admin/settings/company")}
          onGoSubscription={() => navigate("/admin/subscription")}
          onGoOverview={() => navigate("/admin")}
          onGoProcesses={() => navigate("/admin/processes")}
          onGoTeam={() => navigate("/admin/roles")}
          onRefreshStatus={refreshAccount}
          onComplete={handleOnboardingComplete}
        />
      </div>
    </NotificationProvider>
  );
}
