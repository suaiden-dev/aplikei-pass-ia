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
  RiPriceTag3Line,
  RiLinksLine,
  RiFileCopyLine,
  RiCheckLine,
  RiStoreLine,
} from "react-icons/ri";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";
import { useAdminOverview } from "../../hooks/useAdminOverview";
import { useOfficeOverview } from "@features/offices/hooks/useOfficeOverview";
import { useOfficeSlug } from "@features/offices/hooks/useOfficeSlug";
import { useOfficeHasActiveProducts } from "@features/offices/hooks/useOfficeHasActiveProducts";
import { StatCard } from "@shared/components/molecules/StatCard";
import { RevenueTrajectory } from "@shared/components/organisms/RevenueTrajectory";
import { RevenueSplit } from "@shared/components/organisms/RevenueSplit";
import { TopLawyers } from "@shared/components/organisms/TopLawyers";
import { ProductDistributionSection } from "@shared/components/organisms/ProductDistributionSection";
import { useAuth } from "@shared/hooks/useAuth";
import { useState } from "react";
import { WithdrawalModal } from "../../components/WithdrawalModal";

export default function OverviewPage() {
  const t = useT("admin");
  const overview = t.overview ?? {};
  const recentActivityCopy = overview.recentActivity ?? {};
  const { user } = useAuth();
  const role = user?.role;
  const officeId = user?.officeId;
  const isMaster = role === "master";
  const isManager = role === "manager";
  const isAdminLawyer = role === "admin_lawyer";

  const { stats: masterStats, monthlyRevenue, serviceDistribution, recentActivity, isLoading: isLoadingMaster } = useAdminOverview();
  const { data: officeStats, isLoading: isLoadingOffice } = useOfficeOverview();
  const { data: officeSlug } = useOfficeSlug(isAdminLawyer ? officeId : null);
  const { data: hasActiveProducts } = useOfficeHasActiveProducts(isAdminLawyer ? officeId : null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkoutUrl = officeSlug ? `${window.location.origin}/checkout?office=${officeSlug}` : null;
  const isEmpty = isAdminLawyer && (officeStats?.totalProcesses ?? 0) === 0;

  const handleCopyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = isMaster ? isLoadingMaster : (officeId ? isLoadingOffice : false);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const fmtCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  const overviewContent = isMaster
    ? {
        title: t.overview.master?.title || "Master Overview",
        description: t.overview.master?.description || "Global platform metrics",
        statItems: [
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
          },
        ],
      }
    : isAdminLawyer
      ? {
          title: t.overview.admin_lawyer?.title || "Overview",
          description: t.overview.admin_lawyer?.description || "Office metrics",
          statItems: [
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
              id: "pending_payments",
              label: "Awaiting Payment",
              value: officeStats?.pendingPayments ?? 0,
              icon: RiBankCardLine,
              iconBg: "bg-warning/10",
              iconColor: "text-warning",
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
          ],
        }
      : {
          title: t.overview.manager?.title || "Manager Overview",
          description: t.overview.manager?.description || "Team and office execution metrics",
          statItems: [
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
          ],
        };

  const { title, description, statItems } = overviewContent;

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

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isMaster ? 'xl:grid-cols-5' : isAdminLawyer ? 'xl:grid-cols-4 2xl:grid-cols-7' : 'xl:grid-cols-6'} gap-4 sm:gap-6`}>
        {statItems.map((item, i) => (
          <StatCard key={item.id} {...item} index={i} />
        ))}
      </div>

      {isAdminLawyer && hasActiveProducts === false && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-2xl border border-warning/30 bg-warning/5 p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <RiPriceTag3Line size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text">No services configured</p>
            <p className="text-xs text-text-muted mt-0.5">Set prices so clients can hire your services.</p>
          </div>
          <Link
            to="/admin/services"
            className="shrink-0 text-xs font-semibold text-warning hover:text-warning/80 transition-colors"
          >
            Set up →
          </Link>
        </motion.div>
      )}

      {isAdminLawyer && isEmpty ? (
        <EmptyDashboardState
          checkoutUrl={checkoutUrl}
          hasProducts={hasActiveProducts ?? false}
          copied={copied}
          onCopy={handleCopyLink}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <RevenueTrajectory data={isMaster ? monthlyRevenue : officeStats?.monthlyRevenue || []} />
          <RevenueSplit data={isMaster ? serviceDistribution : officeStats?.serviceDistribution || []} />
        </div>
      )}

      {isAdminLawyer && !isEmpty && checkoutUrl && (
        <CheckoutLinkCard url={checkoutUrl} copied={copied} onCopy={handleCopyLink} />
      )}

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
              {recentActivityCopy.title ?? "Recent Activity"}
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

function EmptyDashboardState({
  checkoutUrl,
  hasProducts,
  copied,
  onCopy,
}: {
  checkoutUrl: string | null;
  hasProducts: boolean;
  copied: boolean;
  onCopy: (url: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center gap-5 max-w-lg mx-auto"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <RiStoreLine size={32} />
      </div>
      {hasProducts ? (
        <>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-text">Your office is ready!</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Share your checkout link to receive your first client.
            </p>
          </div>
          {checkoutUrl && (
            <div className="w-full space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Your checkout link</p>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-subtle px-3 py-2.5">
                <RiLinksLine size={14} className="text-text-muted shrink-0" />
                <span className="flex-1 text-xs text-text-muted truncate text-left">{checkoutUrl}</span>
                <button
                  type="button"
                  onClick={() => onCopy(checkoutUrl)}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-primary/90"
                >
                  {copied ? <RiCheckLine size={12} /> : <RiFileCopyLine size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-text">Almost there!</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Configure your services and prices to start receiving clients.
            </p>
          </div>
          <Link
            to="/admin/services"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <RiPriceTag3Line size={16} />
            Set up your services
          </Link>
        </>
      )}
    </motion.div>
  );
}

function CheckoutLinkCard({
  url,
  copied,
  onCopy,
}: {
  url: string;
  copied: boolean;
  onCopy: (url: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <RiLinksLine size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text mb-0.5">Your checkout link</p>
        <p className="text-xs text-text-muted truncate">{url}</p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(url)}
        className="shrink-0 flex items-center gap-1.5 rounded-xl border border-border bg-bg-subtle px-3 py-2 text-[11px] font-semibold text-text hover:bg-card transition-colors"
      >
        {copied ? <RiCheckLine size={12} className="text-success" /> : <RiFileCopyLine size={12} />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </motion.div>
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
