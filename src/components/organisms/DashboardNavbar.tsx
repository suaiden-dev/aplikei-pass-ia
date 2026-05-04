import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useLocale, useT, type Language } from "../../i18n";
import { useTheme } from "../../contexts/useTheme";
import { NotificationBell } from "../../features/notifications/components/NotificationBell";
import { RiSunLine, RiMoonLine, RiArrowDownSLine, RiLogoutBoxRLine, RiPencilLine, RiUploadLine, RiMenuLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../atoms/dialog";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import { authService } from "../../features/auth/lib/auth";
import { storageService } from "../../shared/storage/profile-photos";
import { toast } from "sonner";

const FLAG: Record<Language, string> = { pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸" };
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

interface DashboardNavbarProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
  role?: "client" | "admin" | "master" | "seller";
}

export function DashboardNavbar({ 
  onMenuClick, 
  title, 
  subtitle, 
  role = "client" 
}: DashboardNavbarProps) {
  const { user, logout, refreshAccount } = useAuth();
  const { lang, setLang } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const t = useT("dashboard");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.fullName ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const getPageTitle = () => {
    if (title) return title;
    if (pathname === "/dashboard") return t.sidebar.dashboard;
    if (pathname.startsWith("/dashboard/processes")) return t.sidebar.cases;
    if (pathname.startsWith("/dashboard/support")) return t.sidebar.support;
    if (pathname === "/minha-conta") return t.sidebar.myAccount;
    return "Dashboard";
  };

  const avatarUrl = useMemo(
    () =>
      imagePreviewUrl
      ?? user?.avatarUrl
      ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? "User")}&background=3b82f6&color=fff`,
    [imagePreviewUrl, user?.avatarUrl, user?.fullName],
  );

  const openEditProfile = () => {
    setDisplayName(user?.fullName ?? "");
    setImageFile(null);
    setImagePreviewUrl(null);
    setXOffset(user?.avatarOffsetX ?? 0);
    setYOffset(user?.avatarOffsetY ?? 0);
    setZoom(user?.avatarZoom ?? 1);
    setMenuOpen(false);
    setIsProfileDialogOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
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
    if (!user) return;
    setIsSaving(true);
    try {
      let nextAvatarUrl: string | undefined;
      if (imageFile && imagePreviewUrl) {
        const croppedBlob = await cropAvatarToBlob(imagePreviewUrl, xOffset, yOffset, zoom);
        const avatarFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
        nextAvatarUrl = await storageService.uploadProfilePhoto(user.id, avatarFile);
      }

      await authService.updateAccount(user.id, {
        full_name: displayName.trim() || user.fullName,
        avatar_url: nextAvatarUrl ?? user.avatarUrl ?? null,
        avatar_offset_x: xOffset,
        avatar_offset_y: yOffset,
        avatar_zoom: zoom,
      });
      await refreshAccount();
      toast.success("Perfil atualizado com sucesso.");
      setIsProfileDialogOpen(false);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erro ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-text-muted xl:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <RiMenuLine size={20} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-black text-text tracking-tight uppercase">
            {getPageTitle()}
          </h1>
          {subtitle && (
            <p className="text-[10px] font-medium text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Language selector — flags */}
        <div className="flex items-center gap-1 rounded-full border border-border bg-bg-subtle px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {(["pt", "en", "es"] as Language[]).map((l, i) => (
            <React.Fragment key={l}>
              {i > 0 && <span className="text-border text-[10px]">|</span>}
              <button
                onClick={() => setLang(l)}
                title={l.toUpperCase()}
                className={cn(
                  "text-lg px-0.5 transition-opacity",
                  lang === l ? "opacity-100" : "opacity-40 hover:opacity-70",
                )}
              >
                {FLAG[l]}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-subtle text-text-muted transition-colors hover:border-primary/40 hover:text-text"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
        </button>

        <div className="flex items-center gap-3">
          <div className="rounded-xl p-1 transition-colors hover:bg-bg-subtle">
            <NotificationBell role={role} align="right" />
          </div>

          <div className="mx-2 h-8 w-px bg-border" />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-border bg-bg-subtle px-2 py-1.5 transition-colors hover:border-primary/40"
            >
              <img
                src={user?.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? "User")}&background=3b82f6&color=fff`}
                alt="Avatar"
                className="h-8 w-8 rounded-full border border-border object-cover"
              />
              <span className="max-w-[140px] truncate text-xs font-bold text-text">
                {user?.fullName ?? "Usuário"}
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
                  Alterar perfil
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10"
                >
                  <RiLogoutBoxRLine size={16} />
                  Deslogar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-xl border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-text">Alterar Perfil</DialogTitle>
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
                Enviar foto
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelected} />
              </label>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Eixo X</label>
              <input
                type="range"
                min={-50}
                max={50}
                value={xOffset}
                onChange={(e) => setXOffset(Number(e.target.value))}
                className="w-full"
              />
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Eixo Y</label>
              <input
                type="range"
                min={-50}
                max={50}
                value={yOffset}
                onChange={(e) => setYOffset(Number(e.target.value))}
                className="w-full"
              />
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Zoom</label>
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
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Nome</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Seu nome" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
