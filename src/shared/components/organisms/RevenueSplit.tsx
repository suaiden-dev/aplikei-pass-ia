import { motion } from "framer-motion";
import { useT } from "@app/app/i18n";

interface ServiceDistribution {
  label: string;
  percent: number;
  color: string;
}

interface RevenueSplitProps {
  data: ServiceDistribution[];
}

export function RevenueSplit({ data }: RevenueSplitProps) {
  const t = useT("admin");
  const overview = t.overview ?? {};
  const sections = overview.sections ?? {};
  const charts = overview.charts ?? {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.4 }}
      className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col"
    >
      <h2 className="font-display font-semibold text-text text-base mb-1 text-left">
        {sections.revenueSplit ?? "Revenue Split"}
      </h2>
      <p className="text-xs text-text-muted mb-4 text-left">{charts.byVisaType ?? "By visa type"}</p>

      <div className="flex flex-col items-center gap-6 flex-1 justify-center">
        <div className="relative">
          <DonutChart data={data} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold font-display text-text leading-none">
                100%
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">{charts.total ?? "Total"}</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
          {data.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2 group">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0 transition-transform group-hover:scale-125"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-text font-medium">{seg.label}</span>
              <span className="text-xs text-text-muted ml-auto">{seg.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DonutChart({ data }: { data: ServiceDistribution[] }) {
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const segments = data.map((seg, i) => {
    const dash = (seg.percent / 100) * circumference;
    const gap = circumference - dash;
    const offset = data
      .slice(0, i)
      .reduce((sum, s) => sum + (s.percent / 100) * circumference, 0);
    return { ...seg, dash, gap, offset };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--bg-subtle)"
        strokeWidth={strokeWidth}
      />
      {/* Segments */}
      {segments.map((seg) => (
        <motion.circle
          key={seg.label}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${seg.dash} ${seg.gap}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: -seg.offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          strokeLinecap="round"
          className="transition-all hover:stroke-[26px] cursor-pointer"
        />
      ))}
    </svg>
  );
}
