import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ChevronLeft, ChevronRight, AlertCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";

export default function AdminDS160ViewerPage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const clientName = location.state?.clientName || "Cliente Desconhecido";

    const { lang, t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (userId) {
            fetchDS160Data();
        }
    }, [userId]);

    const fetchDS160Data = async () => {
        setLoading(true);
        try {
            const { data: services, error: serviceError } = await supabase
                .from("user_services")
                .select("id, service_slug, status")
                .eq("user_id", userId!)
                .eq("service_slug", "visto-b1-b2")
                .order("created_at", { ascending: false })
                .limit(1);

            if (serviceError) {
                console.error("❌ Erro ao buscar serviço:", serviceError);
            }

            const service = services?.[0];

            if (!service) {
                console.warn("⚠️ Nenhum serviço 'visto-b1-b2' encontrado.");
                setFormData(null);
                setLoading(false);
                return;
            }

            const { data: responses, error } = await supabase
                .from("onboarding_responses")
                .select("step_slug, data")
                .eq("user_service_id", service.id);

            if (error) {
                console.error("❌ Erro ao buscar respostas:", error);
                throw error;
            }

            if (responses && responses.length > 0) {
                const combined = responses.reduce((acc, curr) => ({ ...acc, ...(curr.data as any) }), {});
                setFormData(combined);
            } else {
                console.warn("⚠️ Não há respostas na tabela.");
                setFormData(null);
            }
        } catch (err) {
            console.error("💥 Erro catastrófico no fetch:", err);
        } finally {
            setLoading(false);
        }
    };

    const translateYesNo = (val?: string) => {
        if (val === 'yes') return lang === 'pt' ? 'Sim' : 'Yes';
        if (val === 'no') return lang === 'pt' ? 'Não' : 'No';
        return val || "—";
    };

    const sections = formData ? [
        {
            title: "Personal Information 1",
            fields: [
                { label: "Given Names", value: formData.firstName },
                { label: "Surname", value: formData.lastName },
                { label: "Full Name in Passport", value: formData.fullNamePassport },
                { label: "Email", value: formData.email },
                { label: "Other Names Used?", value: translateYesNo(formData.hasOtherNames) },
                { label: "Details (Other Names)", value: formData.otherNames },
                { label: "Gender", value: formData.gender },
                { label: "Marital Status", value: formData.maritalStatus },
                { label: "Birth Date", value: formData.birthDate },
                { label: "Birth City", value: formData.birthCity },
                { label: "Birth Country", value: formData.birthCountry },
            ]
        },
        {
            title: "Personal Information 2",
            fields: [
                { label: "Nationality", value: formData.nationalityInfo },
                { label: "Other Nationality?", value: translateYesNo(formData.hasOtherNationality) },
                { label: "Other Nationalities", value: formData.otherNationalities },
                { label: "National ID (CPF/RG)", value: formData.nationalID },
                { label: "US Social Security #", value: formData.ssn },
                { label: "US Taxpayer ID #", value: formData.taxID },
            ]
        },
        {
            title: "Travel Information",
            fields: [
                { label: "Plan Type", value: formData.hasSpecificTravelPlan === 'yes' ? 'Specific Plan' : 'Estimated' },
                { label: "Arrival Date", value: formData.arrivalDate },
                { label: "Departure Date", value: formData.departureDate },
                { label: "Stay Duration", value: `${formData.stayDurationValue} ${formData.stayDurationUnit}` },
                { label: "US Address", value: `${formData.stayAddress}, ${formData.stayCity}, ${formData.stayState} ${formData.stayZip}` },
                { label: "Payer", value: formData.travelPayer },
                { label: "Payer Name/Relationship", value: `${formData.payerName} (${formData.payerRelationship})` },
            ]
        },
        {
            title: "Travel Companions",
            fields: [
                { label: "Traveling with Others?", value: translateYesNo(formData.hasTravelCompanions) },
                { label: "Companion Name", value: formData.companionName },
                { label: "Companion Relationship", value: formData.companionRelationship },
            ]
        },
        {
            title: "Previous US Travel",
            fields: [
                { label: "Been to US before?", value: translateYesNo(formData.hasBeenToUS) },
                { label: "Last Arrival Date", value: formData.lastUSTravelDate },
                { label: "Last Stay Duration", value: `${formData.lastUSTravelDurationValue} ${formData.lastUSTravelDurationUnit}` },
                { label: "Ever had US Visa?", value: translateYesNo(formData.hasHadUSVisa) },
                { label: "Last Visa Number/Date", value: `${formData.lastVisaNumber} (${formData.lastVisaIssuanceDate})` },
                { label: "Visa Refused?", value: translateYesNo(formData.hasBeenDeniedVisa) },
                { label: "Refusal Details", value: formData.visaRefusalDetails },
            ]
        },
        {
            title: "Address & Contact",
            fields: [
                { label: "Home Address", value: `${formData.homeAddress}, ${formData.homeCity}, ${formData.homeState}, ${formData.homeCountry}` },
                { label: "Phone", value: formData.mobilePhone },
                { label: "Other Phones", value: formData.otherPhonesDetails },
                { label: "Other Emails", value: formData.otherEmailsDetails },
            ]
        },
        {
            title: "Passport Information",
            fields: [
                { label: "Passport Type", value: formData.passportType },
                { label: "Passport Number", value: formData.passportNumberDS },
                { label: "Issuance City/Country", value: `${formData.passportIssuanceCity}, ${formData.passportIssuanceCountry}` },
                { label: "Issuance Date", value: formData.passportIssuanceDate },
                { label: "Expiration Date", value: formData.passportExpirationDate },
            ]
        },
        {
            title: "US Contact Information",
            fields: [
                { label: "Contact Name", value: formData.contactName },
                { label: "Organization", value: formData.contactOrganization },
                { label: "Relationship", value: formData.contactRelationship },
                { label: "Contact Address", value: `${formData.contactAddress}, ${formData.contactCity}, ${formData.contactState} ${formData.contactZip}` },
                { label: "Contact Phone/Email", value: `${formData.contactPhone} / ${formData.contactEmail}` },
            ]
        },
        {
            title: "Family Information",
            fields: [
                { label: "Father's Name", value: `${formData.fatherFirstName || ''} ${formData.fatherLastName || ''}` },
                { label: "Father's DOB", value: formData.fatherBirthDate },
                { label: "Is Father in US?", value: translateYesNo(formData.isFatherInUS) },
                { label: "Father's US Status", value: formData.fatherUSStatus },
                { label: "Mother's Name", value: `${formData.motherFirstName || ''} ${formData.motherLastName || ''}` },
                { label: "Mother's DOB", value: formData.motherBirthDate },
                { label: "Is Mother in US?", value: translateYesNo(formData.isMotherInUS) },
                { label: "Mother's US Status", value: formData.motherUSStatus },
                { label: "Has Immediate Relatives in US?", value: translateYesNo(formData.hasImmediateRelativesInUS) },
                { label: "Immediate Relative Name", value: formData.immediateRelativeName },
                { label: "Immediate Relative Relationship", value: formData.immediateRelativeRelationship },
                { label: "Immediate Relative Status", value: formData.immediateRelativeStatus },
                { label: "Has Other Relatives in US?", value: translateYesNo(formData.hasOtherRelativesInUS) },
            ]
        },
        {
            title: "Work / Education / Training",
            fields: [
                { label: "Primary Occupation", value: formData.primaryOccupation },
                { label: "Employer/School Name", value: formData.employerName },
                { label: "Employer Address", value: `${formData.employerAddress || ''} ${formData.employerCity || ''} ${formData.employerState || ''} ${formData.employerCountry || ''}` },
                { label: "Job Start Date", value: formData.jobStartDate },
                { label: "Monthly Income", value: formData.monthlyIncome },
                { label: "Job Description", value: formData.jobDescription },
            ]
        },
        {
            title: "Social Media",
            fields: [
                { label: "Platform 1", value: formData.socialMedia1 },
                { label: "Platform 2", value: formData.socialMedia2 },
                { label: "Platform 3", value: formData.socialMedia3 },
            ]
        },
        {
            title: "Additional Information",
            fields: [
                { label: "Belongs to Clan/Tribe?", value: translateYesNo(formData.belongsToClan) },
                { label: "Clan/Tribe Name", value: formData.clanName },
                { label: "Languages Spoken", value: formData.languagesSpoken },
                { label: "Traveled to other countries in last 5 years?", value: translateYesNo(formData.hasVisitedOtherCountries) },
                { label: "Countries Visited Details", value: formData.countriesVisitedDetails },
            ]
        },
    ].map((s: any) => ({
        ...s,
        fields: s.fields.filter((f: any) => f.value && f.value !== '—' && f.value !== 'undefined undefined')
    })).filter((s: any) => s.fields.length > 0) : [];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6 text-accent" />
                        Formulário DS-160 completo
                    </h2>
                    <p className="text-muted-foreground">
                        Visualizando respostas detalhadas de <strong className="text-foreground">{clientName}</strong>
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl p-8 min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-accent" />
                        <p className="text-muted-foreground font-medium">Carregando informações do DS-160...</p>
                    </div>
                ) : !formData ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50" />
                        <div className="max-w-md">
                            <h3 className="text-lg font-bold mb-1">Nenhum dado encontrado</h3>
                            <p className="text-muted-foreground">Não foi possível carregar as respostas do DS-160 para este cliente. Pode ser que o formulário não tenha sido preenchido ainda.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12 flex flex-col h-full">
                        {sections.map((section: any, idx: number) => (
                            <div key={idx} className="space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="font-bold text-xl text-primary flex items-center gap-2">
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm">{idx + 1}</span>
                                        {section.title}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {section.fields.map((field: any, i: number) => (
                                        <div key={i} className="space-y-2 p-4 rounded-xl bg-background border border-border hover:border-accent/40 transition-colors shadow-sm">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</p>
                                            <p className="text-base font-medium text-foreground">{field.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
