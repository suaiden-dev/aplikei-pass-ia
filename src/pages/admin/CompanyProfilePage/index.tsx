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
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../../components/atoms/button";
import { Input } from "../../../components/atoms/input";
import { Label } from "../../../components/atoms/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/atoms/card";
import { DashboardPageHeader } from "../../../components/organisms/DashboardUI";
import { toast } from "sonner";
import { useT } from "../../../i18n";

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
}

export default function CompanyProfilePage() {
  const t = useT("admin");
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [office, setOffice] = React.useState<OfficeData | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = React.useState(false);
  const [slugConflict, setSlugConflict] = React.useState<string | null>(null);
  const shouldShowFieldTour = user?.role === "admin_lawyer" && !user?.hasCompletedOnboarding;
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

  React.useEffect(() => {
    async function fetchOffice() {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("offices")
          .select("id, slug, name, cnpj, address, phone, email, website, instagram_url, linkedin_url, facebook_url")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        } else {
          if (data) {
            setOffice(data);
          } else {
            setOffice({
              slug: "",
              name: "",
              cnpj: "",
              address: "",
              phone: "",
              email: "",
              website: "",
              instagram_url: "",
              linkedin_url: "",
              facebook_url: "",
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
  }, [user?.id, t]);

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
                    setOffice({ ...office, slug: e.target.value });
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
                  value={office.cnpj || ""}
                  onChange={(e) => setOffice({ ...office, cnpj: e.target.value })}
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

      {activeTour && (
        <div className="fixed bottom-6 right-6 z-[130] w-[420px] max-w-[calc(100vw-24px)] rounded-2xl border border-border bg-card p-4 shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Field guide</p>
          <h3 className="mt-1 text-base font-black text-text">{activeTour.title}</h3>
          <p className="mt-2 text-sm text-text-muted">{activeTour.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={() => setTourStep((prev) => Math.max(0, prev - 1))}
              disabled={tourStep === 0}
            >
              Back
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              onClick={() => setTourStep((prev) => Math.min(fieldTour.length - 1, prev + 1))}
              disabled={tourStep === fieldTour.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
