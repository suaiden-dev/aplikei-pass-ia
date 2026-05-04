import { motion } from "framer-motion";
import { useT } from "../../i18n";
import { RiUserStarLine } from "react-icons/ri";

export function TopLawyers() {
  const t = useT("admin");

  const lawyers = [
    { name: "Harvey Specter", cases: 42, revenue: "$124,000", avatar: "HS" },
    { name: "Mike Ross", cases: 38, revenue: "$98,500", avatar: "MR" },
    { name: "Jessica Pearson", cases: 25, revenue: "$156,000", avatar: "JP" },
    { name: "Louis Litt", cases: 31, revenue: "$87,200", avatar: "LL" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.5 }}
      className="bg-card rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-semibold text-text text-base">
          {t.overview.sections.topLawyers}
        </h2>
        <RiUserStarLine className="text-primary text-xl" />
      </div>

      <div className="space-y-4">
        {lawyers.map((lawyer, i) => (
          <div key={lawyer.name} className="flex items-center gap-4 group">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:scale-110 transition-transform">
              {lawyer.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">{lawyer.name}</p>
              <p className="text-[11px] text-text-muted">{lawyer.cases} casos</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-text">{lawyer.revenue}</p>
              <p className="text-[10px] text-success font-medium">+12%</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
