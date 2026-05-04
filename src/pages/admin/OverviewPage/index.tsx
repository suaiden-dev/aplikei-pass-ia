import { motion } from "framer-motion";
import {
  RiTeamLine,
  RiMoneyDollarCircleLine,
  RiBankCardLine,
  RiLineChartLine,
  RiTimeLine,
} from "react-icons/ri";
import { useT } from "../../../i18n";
import { useAdminOverview } from "../../../features/admin/hooks/useAdminOverview";
import { StatCard } from "../../../components/molecules/StatCard";
import { RevenueTrajectory } from "../../../components/organisms/RevenueTrajectory";
import { RevenueSplit } from "../../../components/organisms/RevenueSplit";
import { TopLawyers } from "../../../components/organisms/TopLawyers";
import { ProductDistributionSection } from "../../../components/organisms/ProductDistributionSection";

export default function OverviewPage() {
  const t = useT("admin");
  const { stats, monthlyRevenue, serviceDistribution, recentActivity, isLoading } = useAdminOverview();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const statItems = [
    {
      id: "customers",
      label: t.overview.stats.customers,
      value: stats?.customersCount ?? 0,
      icon: RiTeamLine,
      iconBg: "bg-info/10",
      iconColor: "text-info",
    },
    {
      id: "revenue",
      label: t.overview.stats.totalRevenue,
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(stats?.revenueTotal ?? 0),
      subtitle: t.overview.stats.revenueSubtitle,
      icon: RiMoneyDollarCircleLine,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      id: "pending_payments",
      label: t.overview.stats.pendingPayments,
      value: stats?.pendingPayments ?? 0,
      subtitle: t.overview.stats.pendingSubtitle,
      icon: RiBankCardLine,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      id: "sellers",
      label: t.overview.stats.activeSellers,
      value: stats?.activeSellers ?? 0,
      icon: RiLineChartLine,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: "partners",
      label: t.overview.stats.pendingPartners,
      value: stats?.pendingPartners ?? 0,
      subtitle: t.overview.stats.partnersSubtitle,
      icon: RiTimeLine,
      iconBg: "bg-danger/10",
      iconColor: "text-danger",
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-3xl font-black font-display tracking-tight text-text">
          {t.overview.title}
        </h1>
        <p className="text-text-muted text-sm font-medium">
          {t.overview.description}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {statItems.map((item, i) => (
          <StatCard key={item.id} {...item} index={i} />
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <RevenueTrajectory data={monthlyRevenue} />
        <RevenueSplit data={serviceDistribution} />
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <TopLawyers />
        <ProductDistributionSection data={serviceDistribution} />
        
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.7 }}
          className="bg-card rounded-2xl border border-border shadow-sm p-6"
        >
          <h2 className="font-display font-semibold text-text text-base mb-6 text-left">
            {t.overview.recentActivity.title}
          </h2>
          <div className="flex flex-col gap-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.dot} group-hover:scale-150 transition-transform`} />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-text">{item.action}</p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.detail}</p>
                </div>
                <span className="text-[10px] text-text-muted font-medium whitespace-nowrap shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-10 animate-pulse">
      <div className="h-12 w-64 bg-bg-subtle rounded-xl" />
      <div className="grid grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-32 bg-bg-subtle rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-64 bg-bg-subtle rounded-2xl" />
        <div className="h-64 bg-bg-subtle rounded-2xl" />
      </div>
    </div>
  );
}
