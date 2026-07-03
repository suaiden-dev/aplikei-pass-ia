import officeTeamImage from "@assets/images/group-business-executives-discussing-laptop-their-des.jpg";
import heroHomeImage from "@assets/images/herohome.png";
import wernerLogo from "@assets/logos/Logotipo-Werner-Advocacia.png";
import logoHorizontal from "@assets/logos/logo-horizontal-CyOfyqfY.png";
import marquesLogo from "@assets/logos/MARQUES-ADVOGADOS-.png";
import logotipoLogo from "@assets/logos/cropped-LOGOTIPO-Logotipo.webp";
import msgLogo from "@assets/logos/cropped-logo-MSG-azul.png";
import genericLogo from "@assets/logos/4085d7be-8277-487c-af1e-7190ed407c7f-e1729658650101.png";
import mattosLogo from "@assets/logos/Logo-03-1024x818.png";
import overviewVisual from "@assets/landing/solution-overview.svg";
import financeVisual from "@assets/landing/solution-finance.svg";
import productsVisual from "@assets/landing/solution-products.svg";
import caseVisual from "@assets/landing/solution-case.svg";

export type HomePageLang = "pt" | "en" | "es";

type FirmLogo = {
  name: string;
  src: string;
  logoClassName?: "is-compact" | "is-emblem" | "is-tall";
};

export const FIRM_LOGOS: readonly FirmLogo[] = [
  { name: "Werner Advocacia", src: wernerLogo },
  { name: "Logo Horizontal", src: logoHorizontal },
  { name: "Marques Advogados", src: marquesLogo, logoClassName: "is-emblem" },
  { name: "Logotipo", src: logotipoLogo, logoClassName: "is-compact" },
  { name: "MSG Advocacia", src: msgLogo, logoClassName: "is-compact" },
  { name: "Advocacia", src: genericLogo },
  { name: "Mattos Advogados", src: mattosLogo, logoClassName: "is-tall" },
];

export const SOLUTION_VISUALS = [overviewVisual, financeVisual, productsVisual, caseVisual] as const;

export const TESTIMONIAL_IMAGES = [officeTeamImage, heroHomeImage] as const;

export const PAIN_ICONS = [
  <svg key={0} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><path d="M14 7h4M16 5v4M5 14v5M3 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={1} viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>,
  <svg key={2} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" /><path d="M12 9v4M9 2h6M12 5V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={3} viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

export const AUTO_ICONS = [
  <svg key={0} viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={1} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={2} viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

export const EXC_ICONS = [
  <svg key={0} viewBox="0 0 24 24" fill="none"><path d="M4 19V9M10 19V5M16 19v-8M22 19H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={1} viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];
