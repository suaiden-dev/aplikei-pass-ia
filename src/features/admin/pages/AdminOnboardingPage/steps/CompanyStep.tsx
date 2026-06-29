import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Save, Loader2, Mail, Globe, MapPin, Phone, Share2, ArrowRight, ArrowLeft, Landmark } from "lucide-react";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import { RiUploadLine } from "react-icons/ri";
import { toast } from "sonner";
import { cn } from "@shared/utils/cn";
import { useAuth } from "@shared/hooks/useAuth";
import { Button } from "@shared/components/atoms/button";
import { Input } from "@shared/components/atoms/input";
import { Label } from "@shared/components/atoms/label";
import {
  findOfficeByOwner,
  officeSlugExists,
  saveOfficeProfile,
  updateOfficeLogo,
  uploadOfficeLogo,
  type OfficeData,
} from "@features/admin/services/companyProfileService";

type SubStep = 1 | 2 | 3;

const SUB_STEP_LABELS: Record<SubStep, string> = {
  1: "Company Identity",
  2: "Contact & Channels",
  3: "Social Media",
};

function formatTaxId(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

interface CompanyStepProps {
  onSuccess: () => void;
}

export function CompanyStep({ onSuccess }: CompanyStepProps) {
  const { user, refreshAccount } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [office, setOffice] = React.useState<OfficeData | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = React.useState(false);
  const [slugConflict, setSlugConflict] = React.useState<string | null>(null);
  const [subStep, setSubStep] = React.useState<SubStep>(1);
  const [direction, setDirection] = React.useState(1); // 1 = forward, -1 = backward

  const slugifyOfficeName = React.useCallback((value: string) => {
    return value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `office-${crypto.randomUUID().slice(0, 8)}`;
  }, []);

  const checkSlugConflict = React.useCallback(async (slugRaw: string, currentOfficeId?: string) => {
    const slug = slugifyOfficeName(slugRaw);
    if (!slug) { setSlugConflict(null); return false; }
    setIsCheckingSlug(true);
    try {
      if (await officeSlugExists(slug, currentOfficeId)) {
        setSlugConflict("This slug is already in use.");
        return true;
      }
      setSlugConflict(null);
      return false;
    } catch {
      setSlugConflict(null);
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  }, [slugifyOfficeName]);

  React.useEffect(() => {
    async function load() {
      if (!user?.id) return;
      try {
        const data = await findOfficeByOwner(user.id);
        setOffice(data ? {
          ...data,
          email: data.email || user.email || "",
          phone: data.phone || user.phoneNumber || "",
        } : {
          slug: "", name: "", cnpj: "", address: "",
          phone: user.phoneNumber || "",
          email: user.email || "",
          website: "", instagram_url: "", linkedin_url: "", facebook_url: "",
          landing_page_config: {},
        });
      } catch {
        toast.error("Failed to load company data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id, user?.email, user?.phoneNumber]);

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setIsUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-").toLowerCase();
      const path = `landing-logos/${user.id}/${Date.now()}-${baseName}.${ext}`;
      const publicUrl = await uploadOfficeLogo(path, file);
      setOffice(prev => prev ? {
        ...prev, logo_url: publicUrl,
        landing_page_config: { ...(prev.landing_page_config || {}), logoUrl: publicUrl },
      } : prev);
      if (office?.id) await updateOfficeLogo(office.id, publicUrl, office.landing_page_config);
      toast.success("Logo uploaded.");
    } catch {
      toast.error("Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const goTo = (next: SubStep) => {
    setDirection(next > subStep ? 1 : -1);
    setSubStep(next);
  };

  const handleNext = async () => {
    if (subStep === 1) {
      if (!office?.name) { toast.error("Company name is required."); return; }
      const conflict = await checkSlugConflict(office.slug || office.name, office.id);
      if (conflict) return;
    }
    goTo((subStep + 1) as SubStep);
  };

  const handleSave = async () => {
    if (!office || !user?.id) return;
    const resolvedSlug = slugifyOfficeName(office.slug || office.name);
    const conflict = await checkSlugConflict(resolvedSlug, office.id);
    if (conflict) { toast.error("Slug already in use."); return; }
    setSaving(true);
    try {
      const result = await saveOfficeProfile({ office, ownerId: user.id, slug: resolvedSlug });
      if (result.officeId && !office.id) {
        setOffice(prev => prev ? { ...prev, id: result.officeId, slug: result.slug ?? prev.slug ?? null } : prev);
      }
      await refreshAccount();
      toast.success("Company saved!");
      onSuccess();
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const logoUrl = typeof office?.logo_url === "string" && office.logo_url
    ? office.logo_url
    : typeof office?.landing_page_config?.logoUrl === "string"
      ? office.landing_page_config.logoUrl : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!office) return null;

  const variants = {
    enter: (d: number) => ({ x: d * 30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -30, opacity: 0 }),
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-text">Set up your company</h2>
        <p className="text-sm text-text-muted">{SUB_STEP_LABELS[subStep]}</p>
      </div>

      {/* Sub-step dots */}
      <div className="flex items-center gap-2 justify-center">
        {([1, 2, 3] as SubStep[]).map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i < subStep ? "w-6 bg-primary" :
              i === subStep ? "w-4 bg-primary/70" :
              "w-4 bg-border",
            )}
          />
        ))}
      </div>

      {/* Animated sub-step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={subStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="space-y-4"
        >
          {/* ── SUB-STEP 1: Company Identity ── */}
          {subStep === 1 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Company Identity</p>
                </div>

                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-bg-subtle rounded-xl border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 className="text-text-muted h-5 w-5" />
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-bg-subtle px-3 py-1.5 text-xs text-text hover:bg-card transition-colors">
                    {isUploadingLogo ? <Loader2 className="animate-spin h-3 w-3" /> : <RiUploadLine className="h-3 w-3" />}
                    {isUploadingLogo ? "Uploading..." : logoUrl ? "Change Logo" : "Upload Logo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelected} disabled={isUploadingLogo} />
                  </label>
                </div>

                {/* Name + Slug */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-name" className="text-xs">Company Name <span className="text-danger">*</span></Label>
                    <Input
                      id="ob-name"
                      value={office.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setOffice(prev => prev ? { ...prev, name, slug: slugifyOfficeName(name) } : prev);
                      }}
                      placeholder="Smith & Associates"
                      className="rounded-xl border-border bg-bg-subtle"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-slug" className="text-xs">Slug <span className="text-danger">*</span></Label>
                    <Input
                      id="ob-slug"
                      value={office.slug || ""}
                      onChange={(e) => {
                        const v = e.target.value
                          .normalize("NFD").replace(/[̀-ͯ]/g, "")
                          .toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
                        setOffice(prev => prev ? { ...prev, slug: v } : prev);
                        if (slugConflict) setSlugConflict(null);
                      }}
                      onBlur={() => { void checkSlugConflict(office.slug || office.name, office.id); }}
                      placeholder="smith-associates"
                      className="rounded-xl border-border bg-bg-subtle"
                      required
                    />
                    {slugConflict && <p className="text-[11px] text-danger font-semibold">{slugConflict}</p>}
                    {isCheckingSlug && <p className="text-[11px] text-text-muted">Checking...</p>}
                  </div>
                </div>

                {/* CNPJ + Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="ob-cnpj" className="text-xs">CNPJ / Tax ID</Label>
                  <Input
                    id="ob-cnpj"
                    value={formatTaxId(office.cnpj || "")}
                    onChange={(e) => setOffice(prev => prev ? { ...prev, cnpj: e.target.value.replace(/\D/g, "").slice(0, 14) } : prev)}
                    placeholder="00.000.000/0000-00"
                    className="rounded-xl border-border bg-bg-subtle"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ob-address" className="text-xs">Full Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <Input
                      id="ob-address"
                      value={office.address || ""}
                      onChange={(e) => setOffice(prev => prev ? { ...prev, address: e.target.value } : prev)}
                      placeholder="123 Main St, Suite 100, Miami - FL"
                      className="pl-9 rounded-xl border-border bg-bg-subtle"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => void handleNext()} disabled={isCheckingSlug || !!slugConflict} className="rounded-xl px-7 h-11 text-sm font-semibold">
                  Next <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── SUB-STEP 2: Contact & Channels ── */}
          {subStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                  <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Contact & Channels</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ob-email" className="text-xs">Corporate Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <Input id="ob-email" type="email" value={office.email || ""} onChange={(e) => setOffice(prev => prev ? { ...prev, email: e.target.value } : prev)} placeholder="contact@office.com" className="pl-9 rounded-xl border-border bg-bg-subtle" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ob-phone" className="text-xs">Phone / WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <Input id="ob-phone" value={office.phone || ""} onChange={(e) => setOffice(prev => prev ? { ...prev, phone: e.target.value } : prev)} placeholder="+1 (555) 000-0000" className="pl-9 rounded-xl border-border bg-bg-subtle" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ob-website" className="text-xs">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <Input id="ob-website" value={office.website || ""} onChange={(e) => setOffice(prev => prev ? { ...prev, website: e.target.value } : prev)} placeholder="https://www.mywebsite.com" className="pl-9 rounded-xl border-border bg-bg-subtle" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => goTo(1)} className="rounded-xl text-sm">
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => goTo(3)} className="rounded-xl px-7 h-11 text-sm font-semibold">
                  Next <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── SUB-STEP 3: Social Media ── */}
          {subStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                  <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Social Media</p>
                    <p className="text-[11px] text-text-muted mt-0.5">Optional — skip if you prefer.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ob-ig" className="text-xs">Instagram</Label>
                  <div className="relative">
                    <FaInstagram className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <Input id="ob-ig" value={office.instagram_url || ""} onChange={(e) => setOffice(prev => prev ? { ...prev, instagram_url: e.target.value } : prev)} placeholder="@yourusername" className="pl-9 rounded-xl border-border bg-bg-subtle" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ob-li" className="text-xs">LinkedIn</Label>
                  <div className="relative">
                    <FaLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <Input id="ob-li" value={office.linkedin_url || ""} onChange={(e) => setOffice(prev => prev ? { ...prev, linkedin_url: e.target.value } : prev)} placeholder="linkedin.com/company/..." className="pl-9 rounded-xl border-border bg-bg-subtle" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ob-fb" className="text-xs">Facebook</Label>
                  <div className="relative">
                    <FaFacebook className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <Input id="ob-fb" value={office.facebook_url || ""} onChange={(e) => setOffice(prev => prev ? { ...prev, facebook_url: e.target.value } : prev)} placeholder="facebook.com/your-office" className="pl-9 rounded-xl border-border bg-bg-subtle" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pb-6">
                <Button variant="ghost" onClick={() => goTo(2)} className="rounded-xl text-sm">
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => void handleSave()} disabled={saving} className="rounded-xl px-7 h-11 text-sm font-semibold shadow-lg shadow-primary/20">
                  {saving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <>Save & Continue <ArrowRight className="ml-1.5 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
