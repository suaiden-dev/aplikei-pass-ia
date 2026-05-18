import { useParams } from "react-router-dom";
import { MdVerified, MdLanguage, MdSchool, MdHistory, MdSyncAlt } from "react-icons/md";
import type { IconType } from "react-icons";
import ServiceDetailTemplate from "@shared/components/templates/ServiceDetailTemplate";
import { getServiceBySlug } from "@shared/data/services";
import { getServiceLocale } from "@shared/data/services.i18n";
import { useLocale } from "@app/app/i18n";

const heroIconMap: Record<string, IconType> = {
  MdVerified,
  MdLanguage,
  MdSchool,
  MdHistory,
  MdSyncAlt,
};

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLocale();

  const baseService = slug ? getServiceBySlug(slug) : null;
  const localized   = slug ? getServiceLocale(slug, lang) : null;

  // Merge: localized fields take precedence, rest comes from source data
  const service = baseService
    ? { ...baseService, ...(localized ?? {}) }
    : null;

  const HeroIcon = service ? (heroIconMap[service.heroIconName] ?? MdVerified) : MdVerified;

  return (
    <ServiceDetailTemplate
      service={service ?? null}
      heroImage={service?.heroImage ?? ""}
      successRate={service?.successRate}
      processType={service?.processType ?? ""}
      HeroIcon={HeroIcon}
    />
  );
}
