import brFlagSvg from "./flags/br";
import usFlagSvg from "./flags/us";
import esFlagSvg from "./flags/es";

type FlagProps = {
  countryCode?: string;
  alt?: string;
  size?: number;
  className?: string;
};

const FLAG_SVG: Record<string, string> = {
  br: brFlagSvg,
  us: usFlagSvg,
  es: esFlagSvg,
};

function toDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function Flag({ countryCode = "br", alt, size = 24, className }: FlagProps) {
  const normalizedCode = countryCode.trim().toLowerCase();
  const svg = FLAG_SVG[normalizedCode] ?? FLAG_SVG.br;
  const label = alt ?? `Flag ${normalizedCode.toUpperCase()}`;

  return <img src={toDataUri(svg)} alt={label} width={size} height={size} className={className} loading="lazy" />;
}
