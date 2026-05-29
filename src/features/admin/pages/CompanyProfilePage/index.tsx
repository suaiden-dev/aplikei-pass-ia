import * as React from "react";
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
import { supabase } from "@shared/lib/supabase";
import { useAuth } from "@shared/hooks/useAuth";
import { Button } from "@shared/components/atoms/button";
import { Input } from "@shared/components/atoms/input";
import { Label } from "@shared/components/atoms/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/atoms/card";
import { DashboardPageHeader } from "@shared/components/organisms/DashboardUI";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";

interface OfficeData {
  id?: string;
  slug?: string | null;
  name: string;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  logo_url?: string | null;
  landing_page_config?: any;
}

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
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [office, setOffice] = React.useState<OfficeData | null>(null);
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
      const { data, error } = await supabase
        .from("offices")
        .select("id")
        .eq("slug", slug)
        .limit(1);

      if (error) throw error;

      const conflict = (data || []).find((row) => row.id !== currentOfficeId);
      if (conflict) {
        setSlugConflict("This slug is already in use.");
        return true;
      }

      setSlugConflict(null);
      return false;
    } catch (err) {
      console.error("Error checking office slug conflict:", err);
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
      const { error } = await supabase.storage
        .from("profiles")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (error) throw new Error(error.message);
      const publicUrl = supabase.storage.from("profiles").getPublicUrl(path).data.publicUrl;

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
        await supabase.from("offices").update({
          logo_url: publicUrl,
          landing_page_config: { 
            ...(office.landing_page_config || {}), 
            logoUrl: publicUrl 
          }
        }).eq("id", office.id);
      }

      toast.success("Logo uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  React.useEffect(() => {
    async function fetchOffice() {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("offices")
          .select("id, slug, name, cnpj, address, phone, email, website, instagram_url, linkedin_url, facebook_url, logo_url, landing_page_config")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        } else {
          if (data) {
            setOffice({
              ...data,
              email: data.email || user.email || "",
              phone: data.phone || user.phoneNumber || "",
            });
          } else {
            setOffice({
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
          }
        }
      } catch (err) {
        console.error("Error fetching office:", err);
        toast.error(t.companyProfile.messages.loadError);
      } finally {
        setLoading(false);
      }
    }

    fetchOffice();
  }, [user?.id, user?.email, user?.phoneNumber, t]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!office || !user?.id) return;

    const resolvedSlug = slugifyOfficeName(office.slug || office.name);
    const hasSlugConflict = await checkOfficeSlugConflict(resolvedSlug, office.id);
    if (hasSlugConflict) {
      toast.error("This slug is already in use.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: office.name,
        cnpj: office.cnpj,
        address: office.address,
        phone: office.phone,
        email: office.email,
        website: office.website,
        instagram_url: office.instagram_url,
        linkedin_url: office.linkedin_url,
        facebook_url: office.facebook_url,
        landing_page_config: office.landing_page_config,
      };
      let officeId = office.id;
      let createdSlug: string | null = null;

      if (officeId) {
        const { error } = await supabase
          .from("offices")
          .update({ ...payload, slug: resolvedSlug })
          .eq("id", officeId);

        if (error) throw error;
      } else {
        const { data: created, error } = await supabase
          .from("offices")
          .insert({
            ...payload,
            slug: resolvedSlug,
            owner_id: user.id,
          })
          .select("id, slug")
          .single();

        if (error) throw error;
        officeId = created.id;
        createdSlug = created.slug ?? null;

        const { error: userOfficeError } = await supabase
          .from("user_accounts")
          .update({ office_id: officeId })
          .eq("id", user.id);

        if (userOfficeError) throw userOfficeError;

        const { error: disableProductsError } = await supabase
          .from("user_service_prices")
          .update({ is_active: false })
          .eq("office_id", officeId);

        if (disableProductsError) throw disableProductsError;
      }

      if (officeId && !office.id) {
        setOffice((prev) => (prev ? { ...prev, id: officeId, slug: createdSlug ?? prev.slug ?? null } : prev));
      }
      await refreshAccount();
      toast.success(t.companyProfile.messages.saveSuccess);
    } catch (err) {
      console.error("Error updating office:", err);
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

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      <DashboardPageHeader
        eyebrow={t.nav.settings}
        title={t.companyProfile.title}
        description={t.companyProfile.subtitle}
      />

      <form onSubmit={handleSave} className="space-y-6">
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
                  {(office.logo_url || office.landing_page_config?.logoUrl) ? (
                    <img 
                      src={office.logo_url || office.landing_page_config?.logoUrl} 
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
                      {isUploadingLogo ? "Uploading..." : (office.logo_url || office.landing_page_config?.logoUrl) ? "Trocar Logo" : "Upload Logo"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelected} disabled={isUploadingLogo} />
                    </label>
                    {(office.logo_url || office.landing_page_config?.logoUrl) && (
                      <span className="text-xs text-success font-bold">✓ Logo salva</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">{t.companyProfile.sections.general.companyName}</Label>
                <Input
                  id="companyName"
                  value={office.name}
                  onChange={(e) => {
                    setOffice({ ...office, name: e.target.value });
                  }}
                  placeholder="Ex: Silva & Associados"
                  className={`rounded-xl border-border bg-bg-subtle ${getTourClass("companyName")}`}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySlug">Slug</Label>
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
                    if (slugConflict) setSlugConflict(null);
                  }}
                  onBlur={() => { void checkOfficeSlugConflict(office.slug || office.name, office.id); }}
                  placeholder="silva-associados"
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
                  onChange={(e) =>
                    setOffice({
                      ...office,
                      cnpj: e.target.value.replace(/\D/g, "").slice(0, 14),
                    })
                  }
                  placeholder="00.000.000/0000-00"
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
                    onChange={(e) => setOffice({ ...office, address: e.target.value })}
                    placeholder="Street, Number, District, City - State"
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
                    onChange={(e) => setOffice({ ...office, email: e.target.value })}
                    placeholder="contato@escritorio.com"
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
                    onChange={(e) => setOffice({ ...office, phone: e.target.value })}
                    placeholder="+55 (00) 00000-0000"
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
                    onChange={(e) => setOffice({ ...office, website: e.target.value })}
                    placeholder="https://www.meusite.com"
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
                    onChange={(e) => setOffice({ ...office, instagram_url: e.target.value })}
                    placeholder="@seuusuario"
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
                    onChange={(e) => setOffice({ ...office, linkedin_url: e.target.value })}
                    placeholder="linkedin.com/company/seu-escritorio"
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
                    onChange={(e) => setOffice({ ...office, facebook_url: e.target.value })}
                    placeholder="facebook.com/seu-escritorio"
                    className={`pl-10 rounded-xl border-border bg-bg-subtle ${getTourClass("facebook")}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button id="saveCompanyProfileBtn" type="submit" disabled={saving || isCheckingSlug || !!slugConflict} className={`rounded-xl px-12 h-12 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all uppercase ${getTourClass("saveCompanyProfileBtn")}`}>
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
