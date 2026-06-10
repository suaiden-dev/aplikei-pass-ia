export const adminQueryKeys = {
  // Admin overview
  adminDashboardStats: () => ["admin-dashboard-stats-v2"] as const,
  adminMonthlyRevenue: (lang: string) => ["admin-monthly-revenue", lang] as const,
  adminServiceDistribution: () => ["admin-service-distribution"] as const,
  adminRecentActivity: () => ["admin-recent-activity"] as const,

  // Master overview
  masterStats: () => ["master-overview-stats-v1"] as const,
  masterMonthlyRevenue: (lang: string) => ["master-overview-monthly-revenue-v1", lang] as const,
  masterServiceDistribution: () => ["master-overview-service-distribution-v1"] as const,
  masterRecentActivity: (lang: string) => ["master-overview-recent-activity-v1", lang] as const,
  masterTopOffices: () => ["master-overview-top-offices-v1"] as const,

  // Office
  userOfficeId: (userId?: string, officeId?: string) => ["user-office-id", userId, officeId] as const,
  officeSubscription: (officeId?: string) => ["office-subscription", officeId] as const,
  officeName: (officeId?: string) => ["office-name", officeId] as const,
  officeWithdrawals: (officeId?: string) => ["office-withdrawals", officeId] as const,
  officeOverviewStats: (officeId?: string) => ["office-overview-stats", officeId] as const,
  officeProducts: (officeId?: string) => ["office-products", officeId] as const,
  officeProductsResolved: (userId?: string, officeId?: string) => ["products-office", userId, officeId] as const,

  // Teams
  teamOffices: () => ["team-offices"] as const,
  teamCurrentOffice: (userId?: string) => ["team-current-office", userId] as const,
  teamData: (officeId?: string) => ["team-data", officeId] as const,

  // Revenue / payments
  revenue: (tab: string, isMaster: boolean, officeId?: string) =>
    ["admin-revenue", tab, isMaster, officeId] as const,
  zellePayments: (tab: string, isMaster: boolean, officeId?: string) =>
    ["zelle-payments", tab, isMaster, officeId] as const,

  // Subscriptions
  subscriptionPlans: () => ["subscription-plans"] as const,
  billingHistory: (officeId?: string) => ["billing-history", officeId] as const,

  // Users / roles
  adminRolesUsers: (search: string) => ["admin-roles-users", search] as const,
} as const;
