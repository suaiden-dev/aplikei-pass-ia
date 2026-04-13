import { useParams } from "react-router-dom";
import { MdVerified, MdLanguage, MdSchool, MdHistory, MdSyncAlt, MdGroupAdd } from "react-icons/md";
import { RiUserVoiceLine } from "react-icons/ri";
import type { IconType } from "react-icons";
import ServiceDetailTemplate from "../../templates/ServiceDetailTemplate";
import { getServiceBySlug } from "../../data/services";

const heroIconMap: Record<string, IconType> = {
  MdVerified,
  MdLanguage,
  MdSchool,
  MdHistory,
  MdSyncAlt,
  MdGroupAdd,
  RiUserVoiceLine,
};

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getServiceBySlug(slug) : null;

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
