import * as React from "react";
import { useSearchParams } from "react-router-dom";
import {
  Building2,
  Save,
  Loader2,
  Landmark,
  Mail,
  Globe,
  MapPin,
  Phone,
  Share2
} from "lucide-react";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import { RiUploadLine } from "react-icons/ri";
import { useAuth } from "@shared/hooks/useAuth";
import { Button } from "@shared/components/atoms/button";
import { Input } from "@shared/components/atoms/input";
import { Label } from "@shared/components/atoms/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/atoms/card";
import { DashboardPageHeader } from "@shared/components/organisms/DashboardUI";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";
import {
  findOfficeByOwner,
  officeSlugExists,
  saveOfficeProfile,
  updateOfficeLogo,
  uploadOfficeLogo,
  type OfficeData,
} from "@features/admin/services/companyProfileService";

function formatTaxId(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export default function CompanyProfilePage() {
  const t = useT("admin");
  const { user, refreshAccount } = useAuth();
  const [searchParams] = useSearchParams();
  const fromOnboarding = searchParams.get("from") === "onboarding";
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [office, setOffice] = React.useState<OfficeData | null>(null);
  const [isDirty, setIsDirty] = React.useState(false);
  const [showPulse, setShowPulse] = React.useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = React.useState(false);
  const [slugConflict, setSlugConflict] = React.useState<string | null>(null);
  const shouldShowFieldTour = false;
  const [tourStep, setTourStep] = React.useState(0);

  const fieldTour = React.useMemo(
    () => [
      { id: "companyName", title: "Company Name", description: "Public office name shown to clients and in documents." },
      { id: "companySlug", title: "Slug", description: "Unique office identifier in URLs. Use lowercase letters and hyphens." },
      { id: "cnpj", title: "CNPJ", description: "Office tax information. Fill it for organization and future validations." },
      { id: "address", title: "Address", description: "Main address used as operational and contact reference." },
      { id: "email", title: "Email", description: "Official company contact channel." },
      { id: "phone", title: "Phone", description: "Primary office contact number." },
      { id: "website", title: "Website", description: "Official website to reinforce your brand credibility." },
      { id: "instagram", title: "Instagram", description: "Social profile for digital presence and social proof." },
      { id: "linkedin", title: "LinkedIn", description: "Company professional page." },
      { id: "facebook", title: "Facebook", description: "Social page for engagement and outreach." },
      { id: "saveCompanyProfileBtn", title: "Save", description: "After reviewing the fields, click save to create/update your company." },
    ],
    [],
  );

  const activeTour = shouldShowFieldTour ? fieldTour[tourStep] : null;

  React.useEffect(() => {
    if (!activeTour) return;
    const el = document.getElementById(activeTour.id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeTour]);

  const getTourClass = React.useCallback(
    (id: string) => (activeTour?.id === id ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-bg" : ""),
    [activeTour?.id],
  );

  const slugifyOfficeName = React.useCallback((value: string) => {
    const normalized = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return normalized || `office-${crypto.randomUUID().slice(0, 8)}`;
  }, []);

  const checkOfficeSlugConflict = React.useCallback(async (slugRaw: string, currentOfficeId?: string) => {
    const slug = slugifyOfficeName(slugRaw);
    if (!slug) {
      setSlugConflict(null);
      return false;
    }

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

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    
    setIsUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const safeBaseName = baseName.replace(/\s+/g, "-").toLowerCase();
      const path = `landing-logos/${user.id}/${Date.now()}-${safeBaseName}.${ext}`;
      const publicUrl = await uploadOfficeLogo(path, file);

      // Update local state
      setOffice(prev => prev ? { 
        ...prev, 
        logo_url: publicUrl,
        landing_page_config: { 
          ...(prev.landing_page_config || {}), 
          logoUrl: publicUrl 
        }
      } : prev);

      // Auto-save to the dedicated logo_url column if office already exists
      if (office?.id) {
        await updateOfficeLogo(office.id, publicUrl, office.landing_page_config);
      }

      toast.success(t.companyProfile.messages.logoUploadSuccess);
    } catch (err) {
      toast.error(t.companyProfile.messages.logoUploadError);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  React.useEffect(() => {
    async function fetchOffice() {
      if (!user?.id) return;
      
      try {
        const data = await findOfficeByOwner(user.id);
        setOffice(data ? {
          ...data,
          email: data.email || user.email || "",
          phone: data.phone || user.phoneNumber || "",
        } : {
          slug: "",
          name: "",
          cnpj: "",
          address: "",
          phone: user.phoneNumber || "",
          email: user.email || "",
          website: "",
          instagram_url: "",
          linkedin_url: "",
          facebook_url: "",
          landing_page_config: {},
        });
      } catch {
        toast.error(t.companyProfile.messages.loadError);
      } finally {
        setLoading(false);
      }
    }

    fetchOffice();
  }, [user?.id, user?.email, user?.phoneNumber, t]);

  // Auto-scroll to save button when coming from onboarding and office not yet saved
  React.useEffect(() => {
    if (!fromOnboarding || loading) return;
    // Only scroll if no office exists yet
    const timer = setTimeout(() => {
      document.getElementById("saveCompanyProfileBtn")?.scrollIntoView({ behavior: "smooth", block: "center" });
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 3000);
    }, 800);
    return () => clearTimeout(timer);
  }, [fromOnboarding, loading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!office || !user?.id) return;

    const resolvedSlug = slugifyOfficeName(office.slug || office.name);
    const hasSlugConflict = await checkOfficeSlugConflict(resolvedSlug, office.id);
    if (hasSlugConflict) {
      toast.error(t.companyProfile.messages.slugConflict);
      return;
    }

    setSaving(true);
    try {
      const result = await saveOfficeProfile({
        office,
        ownerId: user.id,
        slug: resolvedSlug,
      });

      if (result.officeId && !office.id) {
        setOffice((prev) => (prev ? { ...prev, id: result.officeId, slug: result.slug ?? prev.slug ?? null } : prev));
      }
      await refreshAccount();
      setIsDirty(false);
      toast.success(t.companyProfile.messages.saveSuccess);
    } catch {
      toast.error(t.companyProfile.messages.saveError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!office) return null;

  const logoUrl =
    typeof office.logo_url === "string" && office.logo_url
      ? office.logo_url
      : typeof office.landing_page_config?.logoUrl === "string"
        ? office.landing_page_config.logoUrl
        : null;

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      <DashboardPageHeader
        eyebrow={t.nav.settings}
        title={t.companyProfile.title}
        description={t.companyProfile.subtitle}
      />

      {/* Onboarding context banner */}
      {fromOnboarding && !office?.id && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Save className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold text-text">
              Fill in the fields below and click{" "}
              <span className="text-primary">Save Company Profile</span> to complete this step.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              document.getElementById("saveCompanyProfileBtn")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="text-xs font-bold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors shrink-0"
          >
            Jump to save ↓
          </button>
        </div>
      )}

      {/* Unsaved changes banner */}
      {isDirty && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-amber-800">You have unsaved changes.</p>
          <button
            type="button"
            onClick={() => {
              document.getElementById("saveCompanyProfileBtn")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="text-xs font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors shrink-0"
          >
            Jump to save ↓
          </button>
        </div>
      )}

      <form id="company-profile-form" onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-bg-subtle/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Landmark className="h-5 w-5" />
              </div>
              <div className="text-left">
                <CardTitle className="uppercase">{t.companyProfile.sections.general.title}</CardTitle>
                <CardDescription>{t.companyProfile.sections.general.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 text-left">
              <div className="space-y-2 md:col-span-2 flex items-center gap-6">
                <div className="h-16 w-16 bg-bg-subtle rounded-xl border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="w-full h-full object-contain p-1" 
                    />
                  ) : (
                    <Building2 className="text-text-muted" />
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">Company Logo</Label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-text hover:bg-bg-subtle transition-colors">
                      {isUploadingLogo ? <Loader2 className="animate-spin h-4 w-4" /> : <RiUploadLine className="h-4 w-4" />}
                      {isUploadingLogo ? "Uploading..." : logoUrl ? "Change Logo" : "Upload Logo"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelected} disabled={isUploadingLogo} />
                    </label>
                    {logoUrl && (
                      <span className="text-xs text-success font-bold">✓ Logo saved</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">
                  {t.companyProfile.sections.general.companyName} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={office.name}
                  onChange={(e) => {
                    setOffice({ ...office, name: e.target.value });
                    setIsDirty(true);
                  }}
                  placeholder="e.g., Smith & Associates"
                  className={`rounded-xl border-border bg-bg-subtle ${getTourClass("companyName")}`}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySlug">
                  Slug <span className="text-danger">*</span>
                </Label>
                <Input
                  id="companySlug"
                  value={office.slug || ""}
                  onChange={(e) => {
                    const maskedValue = e.target.value
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                      .replace(/-+/g, "-");
                    setOffice({ ...office, slug: maskedValue });
                    setIsDirty(true);
                    if (slugConflict) setSlugConflict(null);
                  }}
                  onBlur={() => { void checkOfficeSlugConflict(office.slug || office.name, office.id); }}
                  placeholder="smith-associates"
                  className={`rounded-xl border-border bg-bg-subtle ${getTourClass("companySlug")}`}
                  required
                />
                {slugConflict && (
                  <p className="text-xs font-semibold text-danger">{slugConflict}</p>
                )}
                {isCheckingSlug && (
                  <p className="text-xs font-semibold text-text-muted">Checking slug...</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">{t.companyProfile.sections.general.cnpj}</Label>
                <Input
                  id="cnpj"
                  value={formatTaxId(office.cnpj || "")}
                  onChange={(e) => {
                    setOffice({
                      ...office,
                      cnpj: e.target.value.replace(/\D/g, "").slice(0, 14),
                    });
                    setIsDirty(true);
                  }}
                  placeholder={t.companyProfile.sections.general.cnpjPlaceholder || "00.000.000/0000-00"}
                  className={`rounded-xl border-border bg-bg-subtle ${getTourClass("cnpj")}`}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">{t.companyProfile.sections.general.address}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="address"
                    value={office.address || ""}
                    onChange={(e) => { setOffice({ ...office, address: e.target.value }); setIsDirty(true); }}
                    placeholder={t.companyProfile.sections.general.addressPlaceholder || "Street, Number, District, City - State"}
                    className={`pl-10 rounded-xl border-border bg-bg-subtle ${getTourClass("address")}`}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 text-left">
          {/* Contact Info */}
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-bg-subtle/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <CardTitle className="uppercase">{t.companyProfile.sections.contact.title}</CardTitle>
                  <CardDescription>{t.companyProfile.sections.contact.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.companyProfile.sections.contact.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="email"
                    type="email"
                    value={office.email || ""}
                    onChange={(e) => { setOffice({ ...office, email: e.target.value }); setIsDirty(true); }}
                    placeholder="contact@office.com"
                    className={`pl-10 rounded-xl border-border bg-bg-subtle ${getTourClass("email")}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t.companyProfile.sections.contact.phone}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="phone"
                    value={office.phone || ""}
                    onChange={(e) => { setOffice({ ...office, phone: e.target.value }); setIsDirty(true); }}
                    placeholder={t.companyProfile.sections.contact.phonePlaceholder || "+55 (00) 00000-0000"}
                    className={`pl-10 rounded-xl border-border bg-bg-subtle ${getTourClass("phone")}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t.companyProfile.sections.contact.website}</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="website"
                    value={office.website || ""}
                    onChange={(e) => { setOffice({ ...office, website: e.target.value }); setIsDirty(true); }}
                    placeholder="https://www.mywebsite.com"
                    className={`pl-10 rounded-xl border-border bg-bg-subtle ${getTourClass("website")}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-bg-subtle/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Share2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <CardTitle className="uppercase">{t.companyProfile.sections.social.title}</CardTitle>
                  <CardDescription>{t.companyProfile.sections.social.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">{t.companyProfile.sections.social.instagram}</Label>
                <div className="relative">
                  <FaInstagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="instagram"
                    value={office.instagram_url || ""}
                    onChange={(e) => { setOffice({ ...office, instagram_url: e.target.value }); setIsDirty(true); }}
                    placeholder="@yourusername"
                    className={`pl-10 rounded-xl border-border bg-bg-subtle ${getTourClass("instagram")}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">{t.companyProfile.sections.social.linkedin}</Label>
                <div className="relative">
                  <FaLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="linkedin"
                    value={office.linkedin_url || ""}
                    onChange={(e) => { setOffice({ ...office, linkedin_url: e.target.value }); setIsDirty(true); }}
                    placeholder="linkedin.com/company/your-office"
                    className={`pl-10 rounded-xl border-border bg-bg-subtle ${getTourClass("linkedin")}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">{t.companyProfile.sections.social.facebook}</Label>
                <div className="relative">
                  <FaFacebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="facebook"
                    value={office.facebook_url || ""}
                    onChange={(e) => { setOffice({ ...office, facebook_url: e.target.value }); setIsDirty(true); }}
                    placeholder="facebook.com/your-office"
                    className={`pl-10 rounded-xl border-border bg-bg-subtle ${getTourClass("facebook")}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            id="saveCompanyProfileBtn"
            type="submit"
            disabled={saving || isCheckingSlug || !!slugConflict}
            className={`rounded-xl px-12 h-12 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all uppercase ${getTourClass("saveCompanyProfileBtn")} ${showPulse ? "animate-pulse ring-2 ring-primary ring-offset-2" : ""}`}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t.companyProfile.savingBtn}
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                {t.companyProfile.saveBtn}
              </>
            )}
          </Button>
        </div>
      </form>

    </div>
  );
}
