import {
  RiTeamLine,
  RiMoneyDollarCircleLine,
  RiBankCardLine,
  RiFileTextLine,
  RiInboxArchiveLine,
  RiUserStarLine
} from "react-icons/ri";
import { useT } from "../../../i18n";
import { useMasterOverview } from "../../../features/admin/hooks/useMasterOverview";
import { StatCard } from "../../../components/molecules/StatCard";
import { RevenueTrajectory } from "../../../components/organisms/RevenueTrajectory";
import { RevenueSplit } from "../../../components/organisms/RevenueSplit";
import { TopOffices } from "../../../components/organisms/TopOffices";
import { ProductDistributionSection } from "../../../components/organisms/ProductDistributionSection";
import { Button } from "../../../components/atoms/button";

export default function MasterOverviewPage() {
  const t = useT("admin");
  const { stats, monthlyRevenue, serviceDistribution, topOffices, isLoading, isError, refetchAll } = useMasterOverview();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-8 max-w-[900px] mx-auto">
        <div className="rounded-3xl border border-danger/20 bg-danger/5 p-8 text-left space-y-4">
          <h2 className="text-xl font-black text-danger uppercase tracking-widest">Erro ao carregar Overview Master</h2>
          <p className="text-sm text-text-muted">Não foi possível buscar os dados globais da plataforma.</p>
          <Button onClick={() => refetchAll()} className="rounded-xl h-11 px-5 font-bold">Tentar novamente</Button>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      id: "revenue",
      label: t.overview.master.stats.totalRevenue,
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.revenueTotal ?? 0),
      icon: RiMoneyDollarCircleLine,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      id: "lawyers",
      label: t.overview.master.stats.lawyersCount,
      value: stats?.lawyersCount ?? 0,
      icon: RiUserStarLine,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: "customers",
      label: t.overview.master.stats.customersCount,
      value: stats?.customersCount ?? 0,
      icon: RiTeamLine,
      iconBg: "bg-info/10",
      iconColor: "text-info",
    },
    {
      id: "processes",
      label: t.overview.master.stats.processesCount,
      value: stats?.processesCount ?? 0,
      icon: RiFileTextLine,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      id: "zelle",
      label: t.overview.master.stats.zellePayments,
      value: stats?.zellePaymentsCount ?? 0,
      icon: RiInboxArchiveLine,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      id: "requested_payments",
      label: t.overview.master.stats.requestedPayments,
      value: stats?.requestedPaymentsCount ?? 0,
      icon: RiBankCardLine,
      iconBg: "bg-danger/10",
      iconColor: "text-danger",
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-4xl font-black font-display tracking-tight text-text uppercase">
          {t.overview.master.title}
        </h1>
        <p className="text-text-muted text-base font-medium">
          {t.overview.master.description}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <TopOffices data={topOffices} title="Top Offices" />
        <ProductDistributionSection data={serviceDistribution} />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-10 animate-pulse">
      <div className="h-12 w-64 bg-bg-subtle rounded-xl" />
      <div className="grid grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 bg-bg-subtle rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-80 bg-bg-subtle rounded-[32px]" />
        <div className="h-80 bg-bg-subtle rounded-[32px]" />
      </div>
    </div>
  );
}
