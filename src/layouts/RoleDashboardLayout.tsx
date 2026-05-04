import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
<<<<<<< HEAD
import { Menu, LogOut, Moon, Sun, ShieldCheck, X } from "lucide-react";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/useTheme";
import type { UserAccountRole } from "../models/users-account";
import { getDashboardPathForRole } from "../services/auth.service";
=======
import { Menu, Moon, Sun, ShieldCheck, X } from "lucide-react";
import { RiArrowDownSLine, RiLogoutBoxRLine, RiPencilLine, RiUploadLine } from "react-icons/ri";
import { Button } from "../components/atoms/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/atoms/dialog";
import { Input } from "../components/atoms/input";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/useTheme";
import type { UserRole as UserAccountRole } from "../features/auth/types";
import { getDashboardPathForRole } from "../shared/auth/roles";
import { authService } from "../features/auth/lib/auth";
import { storageService } from "../shared/storage/profile-photos";
>>>>>>> ca1a9af (feat: Implemented a color-coding system, atomic components, an organized)
import { cn } from "../utils/cn";
import { toast } from "sonner";
import { useT } from "../i18n";

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface RoleDashboardLayoutProps {
  allowedRoles: UserAccountRole[];
  consoleTitle: string;
  consoleSubtitle: string;
  roleLabel: string;
  headerEyebrow: string;
  navItems: DashboardNavItem[];
  spotlightTitle: string;
  spotlightDescription: string;
  unauthorizedFallback: string;
}

const AVATAR_SHIFT_FACTOR = 0.6;
const avatarTransform = (x: number, y: number, zoom: number) =>
  `translate(${x * AVATAR_SHIFT_FACTOR}%, ${y * AVATAR_SHIFT_FACTOR}%) scale(${zoom})`;

async function cropAvatarToBlob(
  imageUrl: string,
  xOffset: number,
  yOffset: number,
  zoom: number,
): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao carregar imagem para recorte."));
    image.src = imageUrl;
  });

  const size = 640;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Falha ao criar canvas para edição da foto.");

  const coverScale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
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

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.94));
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
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.fullName ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const activeItem = navItems.find((item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to),
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
    () =>
      imagePreviewUrl
      ?? currentUser?.avatarUrl
      ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.fullName ?? "User")}&background=3b82f6&color=fff`,
    [imagePreviewUrl, currentUser?.avatarUrl, currentUser?.fullName],
  );

  const openEditProfile = () => {
    if (!currentUser) return;
    setDisplayName(currentUser.fullName ?? "");
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
        const croppedBlob = await cropAvatarToBlob(imagePreviewUrl, xOffset, yOffset, zoom);
        const avatarFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
        nextAvatarUrl = await storageService.uploadProfilePhoto(currentUser.id, avatarFile);
      }

      await authService.updateAccount(currentUser.id, {
        full_name: displayName.trim() || currentUser.fullName,
        avatar_url: nextAvatarUrl ?? currentUser.avatarUrl ?? null,
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
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={unauthorizedFallback || getDashboardPathForRole(currentUser.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] translate-x-1/4 translate-y-1/4 rounded-full bg-info/10 blur-3xl" />
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur transition-transform lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text uppercase tracking-tight">{consoleTitle}</p>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-0.5">{roleLabel}</p>
              <p className="text-[10px] font-medium text-text-muted mt-1">{consoleSubtitle}</p>
            </div>
          </div>
            <button
            type="button"
            className="rounded-xl border border-border p-2 text-text-muted lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={tProfile.closeMenu}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-text-muted hover:bg-bg-subtle hover:text-text",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

<<<<<<< HEAD
        <div className="mt-6 rounded-[1.5rem] border border-border bg-highlight p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Modo operacao</p>
          <p className="mt-2 font-display text-xl font-black tracking-[-0.03em]">{spotlightTitle}</p>
          <p className="mt-2 text-sm text-slate-300">{spotlightDescription}</p>
        </div>
=======
>>>>>>> ca1a9af (feat: Implemented a color-coding system, atomic components, an organized)
      </aside>

      {mobileMenuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label={tProfile.closeMenu}
        />
      ) : null}

      <div className="relative lg:pl-72">
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
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{headerEyebrow}</p>
                <h1 className="font-display text-2xl font-black tracking-[-0.04em] text-text">
                  {activeItem?.label ?? "Overview"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-text-muted transition-colors hover:text-text"
                aria-label="Alternar tema"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-sm font-semibold text-text transition-colors hover:border-primary/40"
                >
                  <img
                    src={currentUser.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName ?? "User")}&background=3b82f6&color=fff`}
                    alt="Avatar"
                    className="h-7 w-7 rounded-full object-cover border border-border"
                  />
                  <span className="max-w-[120px] truncate">{currentUser.fullName ?? "Usuário"}</span>
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

        <main className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-xl border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-text">{tProfile.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-28 w-28 overflow-hidden rounded-full border border-border">
                <img
                  src={avatarUrl}
                  alt="Pré-visualização"
                  className="h-full w-full object-cover"
                  style={{ transform: avatarTransform(xOffset, yOffset, zoom) }}
                />
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text hover:bg-bg-subtle">
                <RiUploadLine size={16} />
                {tProfile.uploadBtn}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelected} />
              </label>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">{tProfile.xAxis}</label>
              <input
                type="range"
                min={-50}
                max={50}
                value={xOffset}
                onChange={(e) => setXOffset(Number(e.target.value))}
                className="w-full"
              />
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">{tProfile.yAxis}</label>
              <input
                type="range"
                min={-50}
                max={50}
                value={yOffset}
                onChange={(e) => setYOffset(Number(e.target.value))}
                className="w-full"
              />
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">{tProfile.zoom}</label>
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
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">{tProfile.nameLabel}</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={tProfile.namePlaceholder} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)} disabled={isSaving}>
                {tProfile.cancelBtn}
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? tProfile.savingBtn : tProfile.saveBtn}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
