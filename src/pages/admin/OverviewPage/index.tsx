import { motion } from "framer-motion";
import {
  RiTeamLine,
  RiMoneyDollarCircleLine,
  RiBankCardLine,
  RiLineChartLine,
  RiBriefcaseLine,
  RiCheckboxCircleLine,
  RiHistoryLine,
  RiWallet3Line,
} from "react-icons/ri";
import { useT } from "../../../i18n";
import { useAdminOverview } from "../../../features/admin/hooks/useAdminOverview";
import { useOfficeOverview } from "../../../features/admin/hooks/useOfficeOverview";
import { StatCard } from "../../../components/molecules/StatCard";
import { RevenueTrajectory } from "../../../components/organisms/RevenueTrajectory";
import { RevenueSplit } from "../../../components/organisms/RevenueSplit";
import { TopLawyers } from "../../../components/organisms/TopLawyers";
import { ProductDistributionSection } from "../../../components/organisms/ProductDistributionSection";
import { useAuth } from "../../../hooks/useAuth";
import { useState } from "react";
import { WithdrawalModal } from "../../../features/admin/components/WithdrawalModal";

export default function OverviewPage() {
  const t = useT("admin");
  const { user } = useAuth();
  const role = user?.role;
  const officeId = user?.officeId;
  const isMaster = role === "master";
  const isManager = role === "manager";
  const isAdminLawyer = role === "admin_lawyer";

  const { stats: masterStats, monthlyRevenue, serviceDistribution, recentActivity, isLoading: isLoadingMaster } = useAdminOverview();
  const { data: officeStats, isLoading: isLoadingOffice } = useOfficeOverview();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const isLoading = isMaster ? isLoadingMaster : (officeId ? isLoadingOffice : false);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const fmtCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  let statItems = [];
  let title = t.overview.title;
  let description = t.overview.description;

  if (isMaster) {
    title = t.overview.master?.title || "Master Overview";
    description = t.overview.master?.description || "Global platform metrics";
    statItems = [
      {
        id: "revenue",
        label: t.overview.master?.stats?.totalRevenue || "Total Revenue",
        value: fmtCurrency(masterStats?.revenueTotal ?? 0),
        icon: RiMoneyDollarCircleLine,
        iconBg: "bg-success/10",
        iconColor: "text-success",
      },
      {
        id: "lawyers",
        label: t.overview.master?.stats?.lawyersCount || "Lawyers",
        value: masterStats?.lawyersCount ?? 0,
        icon: RiTeamLine,
        iconBg: "bg-info/10",
        iconColor: "text-info",
      },
      {
        id: "customers",
        label: t.overview.master?.stats?.customersCount || "Clients",
        value: masterStats?.customersCount ?? 0,
        icon: RiTeamLine,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
      },
      {
        id: "processes",
        label: t.overview.master?.stats?.processesCount || "Processes",
        value: masterStats?.processesCount ?? 0,
        icon: RiLineChartLine,
        iconBg: "bg-warning/10",
        iconColor: "text-warning",
      },
      {
        id: "zelle",
        label: t.overview.master?.stats?.zellePayments || "Zelle",
        value: masterStats?.requestedPaymentsCount ?? 0,
        icon: RiBankCardLine,
        iconBg: "bg-danger/10",
        iconColor: "text-danger",
      }
    ];
  } else if (isAdminLawyer) {
    title = t.overview.admin_lawyer?.title || "Overview";
    description = t.overview.admin_lawyer?.description || "Office metrics";
    statItems = [
      {
        id: "revenue",
        label: t.overview.admin_lawyer?.stats?.revenue || "Revenue",
        value: fmtCurrency(officeStats?.revenueTotal ?? 0),
        icon: RiMoneyDollarCircleLine,
        iconBg: "bg-success/10",
        iconColor: "text-success",
      },
      {
        id: "fees",
        label: t.overview.admin_lawyer?.stats?.fees || "Fees",
        value: fmtCurrency(officeStats?.feesTotal ?? 0),
        icon: RiHistoryLine,
        iconBg: "bg-danger/10",
        iconColor: "text-danger",
      },
      {
        id: "active_processes",
        label: t.overview.admin_lawyer?.stats?.activeProcesses || "Active Processes",
        value: officeStats?.activeProcesses ?? 0,
        icon: RiBriefcaseLine,
        iconBg: "bg-warning/10",
        iconColor: "text-warning",
      },
      {
        id: "total_processes",
        label: t.overview.admin_lawyer?.stats?.totalProcesses || "Total Processes",
        value: officeStats?.totalProcesses ?? 0,
        icon: RiLineChartLine,
        iconBg: "bg-info/10",
        iconColor: "text-info",
      },
      {
        id: "finished_processes",
        label: t.overview.admin_lawyer?.stats?.finishedProcesses || "Finished Processes",
        value: officeStats?.finishedProcesses ?? 0,
        icon: RiCheckboxCircleLine,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
      },
      {
        id: "available_balance",
        label: t.overview.admin_lawyer?.stats?.availableBalance || "Balance",
        value: fmtCurrency(officeStats?.availableBalance ?? 0),
        subtitle: t.overview.admin_lawyer?.stats?.availableBalanceSubtitle || "Available after 14 days",
        icon: RiWallet3Line,
        iconBg: "bg-success/20",
        iconColor: "text-success",
        action: (officeStats?.availableBalance ?? 0) > 0 ? {
          label: t.overview.admin_lawyer?.stats?.withdrawBtn || "Withdrawal",
          onClick: () => {
            setIsWithdrawModalOpen(true);
          },
        } : undefined,
      },
    ];
  } else {
    title = t.overview.manager?.title || "Manager Overview";
    description = t.overview.manager?.description || "Team and office execution metrics";
    statItems = [
      {
        id: "revenue",
        label: t.overview.manager?.stats?.revenue || "Revenue",
        value: fmtCurrency(officeStats?.revenueTotal ?? 0),
        icon: RiMoneyDollarCircleLine,
        iconBg: "bg-success/10",
        iconColor: "text-success",
      },
      {
        id: "active_processes",
        label: t.overview.manager?.stats?.activeProcesses || "Active Processes",
        value: officeStats?.activeProcesses ?? 0,
        icon: RiBriefcaseLine,
        iconBg: "bg-warning/10",
        iconColor: "text-warning",
      },
      {
        id: "total_processes",
        label: t.overview.manager?.stats?.totalProcesses || "Total Processes",
        value: officeStats?.totalProcesses ?? 0,
        icon: RiLineChartLine,
        iconBg: "bg-info/10",
        iconColor: "text-info",
      },
      {
        id: "finished_processes",
        label: t.overview.manager?.stats?.finishedProcesses || "Finished Processes",
        value: officeStats?.finishedProcesses ?? 0,
        icon: RiCheckboxCircleLine,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
      },
      {
        id: "conversion_rate",
        label: t.overview.manager?.stats?.completionRate || "Completion Rate",
        value: `${Math.round((((officeStats?.finishedProcesses ?? 0) / Math.max(1, officeStats?.totalProcesses ?? 0)) * 100))}%`,
        icon: RiTeamLine,
        iconBg: "bg-secondary/10",
        iconColor: "text-secondary",
      },
      {
        id: "available_balance",
        label: t.overview.manager?.stats?.availableBalance || "Available Balance",
        value: fmtCurrency(officeStats?.availableBalance ?? 0),
        subtitle: t.overview.manager?.stats?.availableBalanceSubtitle || "Read-only view for managers",
        icon: RiWallet3Line,
        iconBg: "bg-success/20",
        iconColor: "text-success",
      },
    ];
  }

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-3xl font-black font-display tracking-tight text-text uppercase">
          {title}
        </h1>
        <p className="text-text-muted text-sm font-medium">
          {description}
        </p>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${!isMaster ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-4 sm:gap-6`}>
        {statItems.map((item, i) => (
          <StatCard key={item.id} {...item} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <RevenueTrajectory data={isMaster ? monthlyRevenue : officeStats?.monthlyRevenue || []} />
        <RevenueSplit data={isMaster ? serviceDistribution : officeStats?.serviceDistribution || []} />
      </div>

      {isMaster && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <TopLawyers />
          <ProductDistributionSection data={serviceDistribution} />
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
      )}

      {officeId && isAdminLawyer && (
        <WithdrawalModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          availableBalance={officeStats?.availableBalance ?? 0}
          officeId={officeId}
          userId={user?.id ?? ""}
        />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-10 animate-pulse">
      <div className="h-12 w-64 bg-bg-subtle rounded-xl" />
      <div className="grid grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
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
