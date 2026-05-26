const admin = {
  shared: {
    back: "Back",
    save: "Save",
    loading: "Loading...",
    success: "Success!",
    error: "Error",
    cancel: "Cancel",
    confirm: "Confirm",
    administrativeAction: "Administrative Action",
    rejection: {
      confirm: "Confirm Rejection",
    },
    table: {
      empty: "No files",
    },
    registration: "Registration",
    paid: "Paid",
    client: "Client",
    roleLabels: {
      master: "Master",
      admin_lawyer: "Admin Lawyer",
      manager: "Manager",
      seller: "Seller",
      customer: "Customer"
    },
    cardPayment: "Card Payment",
    view: "View",
    remove: "Remove",
    locale: "en-US"
  },
  nav: {
    overview: "Overview",
    revenue: "Finance",
    finance_analytics: "Finance Analytics",
    dashboard: "Dashboard",
    matters: "Cases",
    lawyers: "Lawyers",
    products: "Products",
    chats: "Messages",
    customers: "Customers",
    plans: "Plans",
    coupons: "Coupons",
    roles: "Teams",
    pageBuilder: "Page Builder",
    caseLaw: "Case Law",
    documents: "Documents",
    billing: "Billing",
    analytics: "Analytics",
    settings: "Settings",
    paymentSettings: "Payment Methods",
    withdrawals: "Withdrawals",
    billings: "Billings",
    offices: "Offices",
    subscription: "My Subscription",
    companyProfile: "Company Profile"
  },
  financeAnalytics: {
    title: "Finance Analytics",
    masterOnly: "Master Only",
    subtitle: "Advanced platform performance and profit tracking",
    charts: {
      revenueGrowth: "Revenue Growth",
      revenueVsProfit: "Revenue vs Profit",
      salesByProduct: "Sales by Product",
      revenueLegend: "Revenue",
      profitLegend: "Profit"
    },
    table: {
      title: "Recent Transactions",
      growthBadge: "+12.5% this month",
      customer: "Customer",
      office: "Office",
      product: "Product",
      amount: "Amount",
      method: "Method",
      action: "Action",
      details: "Details",
      empty: "No transactions found for analytics."
    },
    states: {
      loadErrorTitle: "Failed to load data",
      retry: "Retry"
    },
    modal: {
      title: "Transaction Details",
      customer: "Customer",
      office: "Office",
      product: "Product",
      total: "Total",
      statusMethod: "Status / Method",
      close: "Close"
    }
  },
  payoutSettings: {
    title: "Payout Configuration",
    subtitle: "Configure your payment methods and payout preferences",
    sections: {
      paymentLinks: {
        title: "Payment Links",
        description: "Configure your direct payment links for clients",
        stripe: "Stripe Payment Link",
        zelle: "Zelle Payment Link",
        stripePlaceholder: "https://buy.stripe.com/...",
        zellePlaceholder: "https://zellepay.com/..."
      },
      zelleConfig: {
        title: "Zelle Configuration",
        description: "Specific details for receiving via Zelle",
        name: "Zelle Account Name",
        identifier: "Zelle Identifier (Email/Phone)",
        namePlaceholder: "Full Name on Account",
        identifierPlaceholder: "email@example.com or phone"
      }
    },
    messages: {
      saveSuccess: "Payout settings updated successfully!",
      saveError: "Error saving payout settings.",
      loadError: "Error loading payout settings."
    },
    saveBtn: "Save Configuration",
    savingBtn: "Saving..."
  },
  overview: {
    title: "Overview",
    description: "High-level financial and operational metrics",
    sections: {
      revenueTrajectory: "Revenue Trajectory",
      revenueSplit: "Revenue Split",
      topLawyers: "Top AdminLawyers",
      productDistribution: "Product Distribution"
    },
    stats: {
      customers: "Customers",
      totalRevenue: "Total Revenue",
      revenueSubtitle: "Total accumulated revenue",
      pendingPayments: "Pending Payments",
      pendingSubtitle: "Awaiting confirmation",
      activeSellers: "Active Sellers",
      pendingPartners: "Pending Partners",
      partnersSubtitle: "Approval queue"
    },
    charts: {
      monthlyRevenue: "Monthly Revenue",
      growth: "{{percent}}% growth",
      serviceDistribution: "Service Distribution",
      byVisaType: "By visa type",
      total: "Total",
      last6Months: "Last 6 months",
      casesCount: "{{count}} cases"
    },
    recentActivity: {
      title: "Recent Activity",
      paymentReceived: "Payment Received",
      newCustomer: "New Customer",
      processUpdated: "Process Updated",
      paymentPending: "Payment Pending",
      hoursAgo: "{{count}} hours ago",
      yesterday: "Yesterday"
    },
    master: {
      title: "Master Overview",
      description: "Global platform metrics for Master administration.",
      stats: {
        totalRevenue: "Total Revenue",
        lawyersCount: "Number of Lawyers",
        customersCount: "Number of Clients",
        processesCount: "Total Processes",
        zellePayments: "Payments via Zelle",
        requestedPayments: "Requested Payments"
      },
      recentActivity: "Recent Activity"
    },
    admin_lawyer: {
      title: "Overview",
      description: "Metrics and financial control of your office.",
      stats: {
        revenue: "Revenue",
        fees: "Fees",
        activeProcesses: "Active processes",
        totalProcesses: "Total processes",
        finishedProcesses: "Finished processes",
        availableBalance: "Balance available for withdrawal",
        availableBalanceSubtitle: "Available after 14 days",
        withdrawBtn: "Withdrawal"
      },
      modals: {
        withdrawal: {
          title: "Request Withdrawal",
          description: "Request a withdrawal of your available balance. Funds will be sent to your configured payment method.",
          amountLabel: "Amount to Withdraw",
          amountPlaceholder: "0.00",
          methodLabel: "Payout Method",
          paymentLinkLabel: "Stripe Payment Link (for this withdrawal)",
          paymentLinkPlaceholder: "https://buy.stripe.com/...",
          paymentLinkHint: "Create a payment link in your Stripe dashboard for the exact amount of this withdrawal.",
          limitReached: "Amount exceeds available balance.",
          confirmBtn: "Confirm Request",
          success: "Withdrawal request sent!",
          error: "Error requesting withdrawal."
        }
      }
    }
  },
  cases: {
    title: "Cases",
    subtitle: "Complete management of customer requests",
    refresh: "Refresh",
    stats: {
      total: "Total Cases",
      awaiting: "Awaiting Review",
      active: "In Progress",
      completed: "Completed",
    },
    filters: {
      searchPlaceholder: "Search by name or email...",
      allProducts: "Filter: All Products",
      pendingActions: "Pending Actions",
      viewAll: "View All",
    },
    table: {
      client: "Client",
      service: "Service",
      payment: "Payment",
      flowActions: "Flow / Actions",
      noResults: "No processes found at the moment.",
      noName: "No Name",
      noEmail: "Email not updated",
    },
    statusLabel: {
      uscisApproved: "USCIS Approved",
      uscisDenied: "USCIS Denied",
      completed: "Completed",
      awaitingReview: "Review and Signature",
    },
    actions: {
      approve: "Approve",
      approveUscis: "Approve (USCIS Result)",
      reject: "Reject Step",
      rejectUscis: "Deny (USCIS Result)",
    },
    messages: {
      loadError: "Error loading processes.",
      approveSuccess: "Step approved for {name}!",
      approveFinalSuccess: "Process Completed (Approved)!",
      rejectSuccess: "Step rejected. The client will need to redo.",
      rejectFinalSuccess: "Process Completed (Denied).",
      errorAction: "Error performing action: ",
    }
  },
  processDetail: {
    steps: {
      completed: "Step Completed",
      awaitingAction: "Awaiting your action",
      stepCounter: "Step {{current}} of {{total}}",
    },
    mrv: {
      title: "MRV Fee and Consulate Access",
      loginLabel: "Consulate Login (Email)",
      loginPlaceholder: "Consular account email",
      passwordLabel: "Consulate Password",
      passwordPlaceholder: "Consular account password",
      voucherLabel: "MRV Fee Voucher",
      voucherSent: "Voucher Sent",
      selectVoucher: "Select PDF Voucher",
      finishGeneration: "Finish Fee Generation",
      messages: {
        fillFields: "Fill in login, password and send the voucher.",
        uploadSuccess: "Voucher sent successfully!",
      }
    },
    scheduling: {
      title: "Final Scheduling (CASV/Consulate)",
      upsellTitle: "Upsell Plan Acquired",
      upsellAction: "Intervene According to Plan",
      sameLocation: "Same Location",
      differentLocations: "Different Locations",
      casvData: "CASV Data",
      consulateData: "Consulate Data",
      casvLocationPlaceholder: "CASV Location",
      consulateLocationPlaceholder: "Consulate Location",
      informClient: "Inform Client",
      updateScheduling: "Update Scheduling",
      messages: {
        fillCasv: "Fill in CASV data.",
        fillConsulate: "Fill in Consulate data.",
        updateSuccess: "Scheduling updated!",
        notifiedSuccess: "Client notified of scheduling!",
      }
    },
    motion: {
      panelTitle: "Formulate Motion Proposal",
      clientInstructions: "Client Instructions",
      clientReason: "Informed Reason:",
      noReason: "No description provided.",
      denialLetter: "Denial Letter / Docs",
      strategyLabel: "Strategy / Proposal",
      strategyPlaceholder: "Describe technical strategy for Motion...",
      amountLabel: "Service Amount ($)",
      sendProposal: "Send Proposal to Client",
      finalPackageTitle: "Send Final Package (Motion)",
      packageReady: "Motion Document Ready",
      noPackage: "No package sent yet",
      selectPackage: "Select Final PDF",
    },
    rfe: {
      panelTitle: "Formulate RFE Response Proposal",
      infoTitle: "RFE Information",
      clientDescription: "Client Description:",
      officialLetter: "Official RFE Letter",
      strategyLabel: "Response Strategy",
      strategyPlaceholder: "Describe how RFE will be answered...",
      amountLabel: "RFE Consultancy Value ($)",
      sendProposal: "Send RFE Proposal",
      historyTitle: "RFE History",
      cycle: "Cycle",
      resultApproved: "Approved",
      resultNewRfe: "New RFE",
      resultRejected: "Rejected",
      amount: "Value:",
      finalPackageLoading: "Uploading RFE final package...",
      finalPackageTitle: "Send Final Package (RFE)",
      finalPackageReady: "RFE final package ready",
      selectFinalPdf: "Select Final PDF",
      provideToClient: "Provide to Client",
    },
    credentials: {
      title: "CEAC Credentials / Application ID",
      appId: "Application ID",
      motherName: "Mother's Name (Security Answer)",
      birthYear: "Birth Year",
      sendBtn: "Send Credentials to Client",
    },
    notifications: {
      completed: "Process Completed",
      approved: "Step Approved",
      corrections: "Corrections Needed",
    },
    officialForms: {
      title: "Official Forms",
      i539Form: "Form I-539",
      digitalDocDesc: "Digitally filled document.",
      viewPdf: "View PDF",
      reject: "Reject",
    },
    coverLetter: {
      title: "Analysis: Cover Letter",
      finalLetter: "Final Letter Generated",
      generateBtn: "Generate Cover Letter",
    },
    finalForms: {
      g1145: "G-1145",
      g1450: "G-1450",
    },
    i20Sevis: {
      title: "Review I-20 and SEVIS",
      rejectBtn: "Reject",
      approveBtn: "Approve I-20 / SEVIS",
      requestCorrection: "Request Correction",
    },
    f1Documents: {
      title: "Aplikei Analysis: I-20 Document",
      approveBtn: "Approve Documents",
    },
    f1FinalDocs: {
      title: "Student Proofs (DS-160 / SEVIS)",
      ds160Signed: "Signed DS-160",
      finalProof: "Final Proof",
      approveBtn: "Approve Final Review",
    },
    b1b2FinalDocs: {
      title: "Final DS-160 Proofs",
      ds160Signed: "Signed DS-160",
      ceacProof: "CEAC Proof",
      approveBtn: "Approve Documentation",
    },
    casv: {
      title: "CASV Scheduling — Consulate",
      selectedConsulate: "Selected Consulate",
      noConsulate: "Consulate not informed",
      preferredDate: "Requested Preferred Date",
      noDate: "No date provided yet.",
      confirmBtn: "Confirm Scheduling",
      requestAdjustment: "Request Adjustment",
    },
    accountCreation: {
      title: "Account Creation on Consulate Website",
      instruction: "Use data above to create official account on consulate website. Once created, confirm below so client can validate access.",
      confirmBtn: "Confirm Account Created",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone",
      notInformed: "Not informed",
    },
    finalPackage: {
      title: "Final Package",
      mergeBtn: "Merge All Documents",
      reviewPdf: "Review PDF",
      approveBtn: "Approve Step",
    },
    purchases: {
      title: "Purchase History",
      slotsPaid: "Paid Slots",
      noPurchases: "No purchases recorded via JSONB.",
      dependents: "Dependents",
    },
    logs: {
      title: "Change Log",
      noLogs: "No changes recorded yet.",
      status: {
        active: "Active",
        awaitingReview: "Awaiting Review",
        completed: "Completed",
        rejected: "Rejected",
      },
      actor: {
        admin: "Admin",
        client: "Client",
      },
      actions: {
        approved: "✅ Step Approved",
        returned: "🔄 Returned to Client",
        inReview: "⏳ Marked as In Review",
        completed: "🎉 Process Completed",
        formSubmitted: "📤 Submitted Form / Advanced Step",
        sentForReview: "📨 Sent for Review",
        internalChange: "🔧 Internal Change",
      },
      labels: {
        step: "Step",
        status: "Status",
      },
      messages: {
        aiCoverLetterSuccess: "Cover Letter generated successfully by AI!",
        aiCoverLetterLoading: "AI generating cover letter...",
        fillBioAndStrategy: "Please fill bio and strategy.",
        generateError: "Error generating: ",
        finalPackageGenerating: "Generating final package...",
        finalPackageGenerated: "Package generated!",
      }
    }
  },
  customers: {
    title: "Customers",
    subtitle: "Manage your system's customers and users",
    searchInput: "Search by name, email or phone...",
    emptyState: "No customers found at the moment.",
    stats: {
      totalUsers: "Total Users",
      customers: "Customers",
      admins: "Admins",
      newUsers: "New (7 days)"
    },
    table: {
      customerContact: "Customer / Contact",
      role: "Role",
      purchasesSpent: "Purchases / Spent",
      admissionDate: "Admission Date",
      actions: "Actions",
      noName: "No Name",
      productCount: "{{count}} product",
      productsCount: "{{count}} products"
    }
  },
  notificationsCenter: {
    title: "Notifications",
    markAll: "Mark all",
    emptyTitle: "No notifications",
    emptySubtitle: "All caught up!",
    viewFullLog: "View full log",
    filters: {
      all: "All",
      unread: "Unread",
      adminAction: "Admin",
      clientAction: "Client",
      system: "System",
    },
    labels: {
      system: "Notification",
      actionRequiredReview: "Action required: review step",
      actionRequiredReviewMessage: "A client completed a step and is waiting for your review.",
      clientCompletedStepMessage: "The client completed the \"{{step}}\" step of {{service}} and is waiting for your review.",
      clientCompletedGenericMessage: "The client completed a step of {{service}} and is waiting for your review.",
      stepApproved: "Step approved",
      stepApprovedMessage: "Your step was approved and you can proceed to the next one.",
      changesRequired: "Changes required",
      changesRequiredMessage: "Changes were requested. Review details and submit again.",
      processCompleted: "Process completed",
      processCompletedMessage: "Your process has been completed.",
      interviewScheduled: "Interview scheduled",
      interviewScheduledMessage: "Your interview is scheduled. Check date and location in your process.",
      underReview: "We are reviewing!",
      underReviewMessage: "Your step was submitted successfully to our review team. Please wait for validation.",
    },
  },
  payments: {
    title: "Financial",
    subtitle: "Platform revenue and payout control",
    searchPlaceholder: "Search payments...",
    tabs: {
      pending: "Zelle Verification",
      officeRequests: "Office Requests",
      approved: "Approved Payments",
    },
    table: {
      customer: "Customer",
      serviceName: "Product",
      payment: "Amount",
      viewProof: "Proof of Payment",
      detailsBtn: "Details",
      noResults: "No payments found in this category.",
    },
    modals: {
      detailsTitle: "Payment Details",
    },
    messages: {
      approveSuccess: "Payment approved!",
      approveError: "Error approving payment.",
      updateStatusSuccess: "Status updated to {{status}}",
      updateStatusError: "Error updating status.",
    },
    statusSuffix: "Status: {{status}}",
    expected: "Expected: {{amount}}",
    code: "Code: {{code}}",
    autoProcessing: "Auto Processing",
    couponApplied: "COUPON APPLIED",
    services: {
      analiseCos: "Expert Analysis (COS)",
      analiseEos: "Expert Analysis (EOS)",
      motionCos: "Motion (COS)",
      motionEos: "Motion (EOS)",
      rfeSupport: "RFE Support",
      rfeEos: "RFE Support (EOS)",
      rfeCos: "RFE Support (COS)",
      recoveryEos: "Case Recovery (EOS)",
      recoveryCos: "Case Recovery (COS)",
      motionSupport: "Motion Support",
      mentoriaBronze: "Bronze Mentorship",
      mentoriaGold: "Gold Mentorship"
    },
    modalsDetail: {
      detailsTitle: "Payment Details",
      rejectTitle: "Reject payment",
      reasonLabel: "Reason (optional)",
      reasonPlaceholder: "Ex: Illegible proof, incorrect value...",
      proofTitle: "Proof — {{name}}",
      openOriginal: "Open"
    },
    messagesDetail: {
      approveSuccess: "{{name}} approved!",
      rejectSuccess: "Payment rejected.",
      approveError: "Error approving.",
      rejectError: "Error rejecting.",
      rejectedByAdmin: "Rejected by administrator."
    }
  },
  products: {
    title: "Products & Prices",
    subtitle: "Activate or deactivate products and edit prices. Changes affect purchases immediately.",
    stats: {
      totalProducts: "Total Products",
      activeCount: "Active",
      inactiveCount: "Inactive",
      avgTicket: "Avg Ticket"
    },
    table: {
      serviceId: "Service ID",
      name: "Name",
      currency: "Currency",
      price: "Price",
      status: "Status",
      actions: "Action",
      active: "Active",
      inactive: "Inactive",
      edit: "Edit",
      activate: "Activate",
      deactivate: "Deactivate",
      itemCount: "{{count}} item",
      itemsCount: "{{count}} items",
      productName: "Name",
      actionsHeader: "Actions"
    },
    categories: {
      main_visa: "Main Visas",
      dependent: "Dependents",
      analysis: "Analyses",
      mentoring: "Mentorships",
      consultancy: "Consultancy",
      other: "Others"
    },
    messages: {
      invalidValue: "Enter a valid value.",
      updateSuccess: "Price of \"{{name}}\" updated.",
      updateError: "Error saving price: {{error}}",
      statusActivated: "\"{{name}}\" activated!",
      statusDeactivated: "\"{{name}}\" deactivated!",
      statusError: "Error changing product status.",
      noPermission: "No permission to change this product. Check RLS policies."
    },
    footerHint: "Deactivated products will not appear in the sales flow for customers."
  },
  analysisPanel: {
    title: "Specialist Technical Analysis",
    subtitle: "Analyze the client case and define next steps.",
    clientExplanation: "Client Explanation",
    clientDocuments: "Uploaded Documents",
    noDocuments: "No documents uploaded.",
    internalNotes: "Internal Notes (Optional)",
    internalNotesPlaceholder: "Note technical details about this case...",
    finalMessage: "Message to Client",
    finalMessagePlaceholder: "Explain analysis result or request more data...",
    actions: {
      completeReview: "Complete Analysis",
      sendProposal: "Send Proposal",
      requestMoreInfo: "Request Information",
      uploadFinalDocs: "Upload Final Documents"
    },
    status: {
      pending: "Pending Analysis",
      reviewing: "Reviewing",
      proposalSent: "Proposal Sent",
      completed: "Completed",
      rfeRequested: "RFE Requested",
      motionStarted: "Motion Started"
    },
    labels: {
      caseComplexity: "Case Complexity",
      low: "Low",
      medium: "Medium",
      high: "High",
      estimatedHours: "Estimated Hours",
      expertAssigned: "Expert Assigned"
    },
    messages: {
      successSave: "Analysis saved successfully!",
      errorSave: "Error saving analysis.",
      missingFields: "Fill in final message or send at least one document.",
      proposalSent: "Proposal sent to client!"
    }
  },
  coupons: {
    title: "Discount Coupons",
    subtitle: "Create and manage promotional coupons. Changes affect checkout immediately.",
    createNew: "Create New Coupon",
    stats: {
      total: "Total Coupons",
      active: "Active",
      expired: "Expired",
      totalUses: "Total Uses"
    },
    form: {
      code: "Coupon Code",
      codePlaceholder: "Ex: SAVE20",
      generateRandom: "Generate",
      discountType: "Discount Type",
      percentage: "Percentage (%)",
      fixed: "Fixed Amount ($)",
      value: "Value",
      valuePlaceholder: "Ex: 20",
      maxUses: "Usage Limit",
      maxUsesPlaceholder: "Empty = unlimited",
      expiration: "Expiration",
      expirationOptions: {
        "1h": "1 hour",
        "6h": "6 hours",
        "12h": "12 hours",
        "24h": "24 hours",
        "48h": "48 hours",
        "7d": "7 days",
        "30d": "30 days",
        "custom": "Custom"
      },
      customDate: "Expiration date",
      applicableSlugs: "Applicable services",
      allServices: "All services",
      minPurchase: "Minimum purchase (USD)",
      minPurchasePlaceholder: "0.00",
      submit: "Create Coupon",
      sellerHint: "As a seller, your coupons apply only to main visas."
    },
    table: {
      code: "Code",
      type: "Type",
      value: "Value",
      uses: "Uses",
      expiresAt: "Expires in",
      status: "Status",
      actions: "Actions",
      copy: "Copy",
      activate: "Activate",
      deactivate: "Deactivate",
      unlimited: "unlimited",
      remaining: "{{remaining}} remaining of {{total}}",
      noResults: "No coupons created yet."
    },
    status: {
      active: "Active",
      expired: "Expired",
      depleted: "Depleted",
      inactive: "Inactive"
    },
    messages: {
      createSuccess: "Coupon \"{{code}}\" created successfully!",
      createError: "Error creating coupon: {{error}}",
      toggleSuccess: "Coupon {{code}} {{status}}.",
      toggleError: "Error changing status.",
      statusActivated: "activated",
      statusDeactivated: "deactivated",
      copied: "Code copied!",
      invalidValue: "Enter a valid value.",
      invalidCode: "Enter a valid code.",
      rulePercentageNotAllowed: "Percentage discount is not allowed by your office.",
      ruleFixedNotAllowed: "Fixed discount is not allowed by your office.",
      ruleMaxPct: "Maximum allowed discount: {{value}}%",
      ruleMaxFixed: "Maximum allowed discount: US$ {{value}}",
      ruleMaxUses: "Maximum usage limit per coupon: {{value}}"
    }
  },
  chats: {
    title: "Message Center",
    subtitle: "Direct service and technical review for clients.",
    searchPlaceholder: "Search conversation...",
    emptyState: "No conversations found.",
    selectChat: "Select a conversation",
    selectChatSubtitle: "Choose a customer from the list to start service or technical review.",
    online: "Online",
    offline: "Offline",
    typeMessage: "Type your message...",
    today: "Today",
    settings: {
      title: "Chat Settings",
      goToProcess: "Go to process",
      reopen: "Reopen conversation",
      close: "Close conversation",
      reopenedSuccess: "Chat reopened.",
      closedSuccess: "Chat closed.",
      errorToggle: "Error changing chat status: "
    }
  },
  teams: {
    title: "Team Management",
    subtitle: "Manage access and permissions for your office members",
    selectOffice: "Select Office",
    generateLinkBtn: "Add Employee",
    copySuccess: "Registration link copied!",
    roles: {
      vendedor: "Seller",
      gerente: "Manager",
      seller: "Seller",
      manager: "Manager",
      admin: "Admin",
    },
    pending: {
      title: "Pending Requests",
      subtitle: "New members awaiting approval",
      newBadge: "{{count}} NEW",
      table: {
        candidate: "Candidate",
        requestedRole: "Requested Role",
        requestDate: "Request Date",
        actions: "Screening Actions",
      },
      approveBtn: "Approve",
      rejectBtn: "Reject",
      rejectConfirm: "Permanently remove this user from the system?",
    },
    managers: {
      title: "Managers",
      subtitle: "Full administrative access",
    },
    sellers: {
      title: "Sellers",
      subtitle: "Sales and prospecting team",
    },
    table: {
      member: "Member",
      changeRole: "Change Role",
      joinDate: "Join Date",
      actions: "Actions",
      removeBtn: "Remove",
      noMembers: "No members found.",
      loading: "Loading...",
      noName: "No Name",
    },
    modal: {
      title: "Registration Link",
      description: "Send this link to new members. They will enter as <b>inactive</b> until you approve them.",
      defineRole: "Define New Member Role",
      generateBtn: "Add Employee",
      linkTitle: "Registration Link — {{role}}",
      copyBtn: "Copy to Clipboard",
      backBtn: "Back",
    },
  },
  lawyers: {
    title: "AdminLawyers",
    subtitle: "Performance management and commission tracking for lawyers.",
    stats: {
      total: "Total Lawyers",
      active: "Active Lawyers",
      pending: "Awaiting Activation",
      recent: "New (30 days)"
    },
    table: {
      lawyer: "Lawyer",
      status: "Status",
      admission: "Registration Date",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      details: "View Details",
      noResults: "No AdminLawyers found.",
      searchPlaceholder: "Search lawyer by name or email..."
    }
  },
  layout: {
    admin: {
      headerEyebrow: "Admin Dashboard",
      spotlightTitle: "Active Operation",
      spotlightDescription: "Administrative environment for daily service, financial, and portfolio management."
    },
    master: {
      subtitle: "Global Management",
      roleLabel: "Master Scope",
      headerEyebrow: "Master Dashboard",
      spotlightTitle: "Master Operation",
      spotlightDescription: "Master environment for global supervision of all operations and users."
    },
    seller: {
      subtitle: "Aplikei Sales",
      roleLabel: "Seller Scope",
      headerEyebrow: "Seller Dashboard",
      spotlightTitle: "Sales Pipeline",
      spotlightDescription: "Scope focused on sales, relationship, campaigns, and commercial service."
    },
    shared: {
      consoleTitle: "Aplikei Console"
    }
  },
  profile: {
    title: "Change Profile",
    uploadBtn: "Upload photo",
    xAxis: "X Axis",
    yAxis: "Y Axis",
    zoom: "Zoom",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    saveBtn: "Save",
    savingBtn: "Saving...",
    cancelBtn: "Cancel",
    changeProfile: "Change Profile",
    logout: "Logout",
    successUpdate: "Profile updated successfully.",
    errorUpdate: "Error updating profile.",
    selectImageError: "Select an image file.",
    imageSizeError: "Image must be max 5MB.",
    closeMenu: "Close menu",
    openMenu: "Open menu",
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    toggleTheme: "Toggle theme",
    previewAlt: "Preview",
    userNameDefault: "User"
  },
  paymentMethods: {
    title: "Payment Methods",
    subtitle: "Configure how your customers can pay for your services.",
    aplikei: {
      title: "Receive via Aplikei",
      activeDesc: "All payments are processed by Aplikei's accounts.",
      inactiveDesc: "Activate to use Aplikei's accounts instead of your own.",
      activeSuccess: "Payments will be processed by Aplikei.",
      inactiveSuccess: "Your own accounts are active again.",
      saveError: "Error saving: "
    },
    stripe: {
      title: "Stripe",
      description: "Receive payments via Credit Card and PIX.",
      enable: "Enable Stripe",
      clientId: "Stripe Connect Client ID",
      clientIdHint: "Find in: Stripe Dashboard → Connect → Settings → Client ID",
      redirectUri: "Redirect URI — add to Stripe",
      redirectUriHint: "Stripe Dashboard → Connect → Settings → Redirect URIs → Add URI",
      connected: "Account connected",
      connectedDesc: "Payments will be directed to your Stripe account.",
      connectTitle: "Connect your Stripe account",
      connectDesc: "Authorize access so your clients' payments are deposited directly into your account.",
      connectBtn: "Connect with Stripe",
      disconnectBtn: "Disconnect",
      redirecting: "Redirecting...",
      footerHint: "By connecting, you authorize Aplikei to process payments in your account via Stripe Connect.",
      messages: {
        connectSuccess: "Stripe account connected successfully!",
        connectError: "Error connecting Stripe: ",
        disconnectSuccess: "Stripe account disconnected.",
        disconnectError: "Error disconnecting: ",
        statusError: "Error saving Stripe status.",
        missingClientId: "Inform the Stripe Connect Client ID before connecting.",
        initError: "Error initiating connection: "
      }
    },
    zelle: {
      title: "Zelle",
      description: "Receive direct transfers via Zelle.",
      enable: "Enable Zelle",
      recipientName: "Recipient Name",
      email: "Zelle Email",
      phone: "Zelle Phone",
      instructions: "Payment Instructions",
      instructionsPlaceholder: "Ex: Send payment via Zelle and upload proof.",
      messages: {
        statusError: "Error saving Zelle status.",
        missingFields: "Zelle requires email or phone when active."
      }
    },
    parcelow: {
      title: "Parcelow",
      description: "Receive installment payments from customers in Brazil.",
      enable: "Enable Parcelow",
      accountIdentifier: "Parcelow Account Identifier",
      checkoutLink: "Public Checkout Link",
      instructions: "Payment Instructions",
      instructionsPlaceholder: "Ex: Complete payment via Parcelow and upload proof.",
      messages: {
        statusError: "Error saving Parcelow status.",
        missingFields: "Parcelow requires identifier and link when active."
      }
    },
    shared: {
      change: "Change",
      active: "Active",
      inactive: "Inactive",
      missingConfig: "Incomplete configuration"
    },
    saveSuccess: "Configuration saved!",
    saveError: "Error saving configuration.",
  },
  offices: {
    title: "Partner Offices",
    subtitle: "Manage and monitor the performance of all offices on the platform.",
    searchPlaceholder: "Search office or responsible...",
    emptyState: "No offices found.",
    table: {
      office: "Office",
      processes: "Processes",
      revenue: "Revenue",
      balance: "Balance / Pending",
      plan: "Active Plan",
      actions: "Actions",
      noResponsible: "No responsible",
      totalRevenue: "Total Revenue",
      pendingRequests: "{{count}} pending",
      active: "Active",
      inactive: "Inactive",
      noPlan: "No Plan"
    },
    tooltips: {
      viewDetails: "View Details",
      visitWebsite: "Access Office Page"
    },
    menu: {
      changePlan: "Change Plan",
      changeExpiration: "Change Expiration",
      expirePlan: "Expire Plan"
    },
    modals: {
      manageSubscription: "Manage Subscription",
      officeDetails: "Office Details",
      selectedOffice: "Selected Office",
      changePlanTo: "Change Plan to",
      noPlan: "No Plan",
      changeExpiration: "Change Expiration",
      expirationHint: "Access will be cut automatically after this date.",
      officeName: "Office Name",
      responsible: "Responsible",
      cnpj: "CNPJ/Tax ID",
      currentPlan: "Current Plan",
      contactInfo: "Contact Information",
      socialMedia: "Social Media",
      stats: {
        processes: "Processes",
        revenue: "Revenue",
        balance: "Balance",
        pending: "Pending"
      },
      notInformed: "Not informed",
      noEmail: "No email",
      noPhone: "No phone",
      noAddress: "No registered address",
      noWebsite: "No website"
    },
    messages: {
      loadError: "Error loading data.",
      updateSuccess: "Subscription and expiration updated!",
      updateError: "Error updating.",
      expireConfirm: "Are you sure you want to expire the plan for office {{name}}?",
      expireSuccess: "Plan expired successfully.",
      expireError: "Error expiring plan."
    }
  },
  companyProfile: {
    title: "Company Profile",
    subtitle: "Manage basic information, contact, and social media for your office.",
    sections: {
      general: {
        title: "General Information",
        description: "Main identification data for the office.",
        companyName: "Company / Office Name",
        cnpj: "CNPJ / Tax ID",
        address: "Full Address"
      },
      contact: {
        title: "Contact and Channels",
        description: "How clients can find you.",
        email: "Corporate Email",
        phone: "Phone / WhatsApp",
        website: "Website"
      },
      social: {
        title: "Social Media",
        description: "Links to your social profiles.",
        instagram: "Instagram",
        linkedin: "LinkedIn",
        facebook: "Facebook"
      }
    },
    saveBtn: "Save Company Profile",
    savingBtn: "Saving Changes...",
    messages: {
      notFound: "Office not found.",
      notFoundDescription: "We couldn't locate your office registration.",
      loadError: "Error loading company data.",
      saveSuccess: "Data updated successfully!",
      saveError: "Error saving changes."
    }
  },
  subscription: {
    title: "My Subscription",
    subtitle: "Manage your plan, invoices, and platform features",
    status: {
      active: "Active Plan",
      none: "No Subscription",
      inactive: "Inactive Subscription"
    },
    noPlan: "No Plan",
    nextBilling: "Next Renewal",
    nextCycle: "Next Cycle",
    manageCard: "Manage Card",
    billingHistory: "Billing History",
    paidOn: "Paid on {{date}}",
    upgrade: {
      title: "Plan Upgrade",
      description: "Need more members or corporate features? Discover the Enterprise plan.",
      btn: "View Other Plans"
    },
    security: {
      title: "Guaranteed Security",
      description: "Your subscription is processed securely through Stripe. We do not store your card data on our servers."
    },
    modals: {
      choosePlan: "Choose your new plan",
      transitionHint: "Smooth transition between business models",
      changeBtn: "Switch to this plan",
      effectHint: "* The change will take effect in the next billing cycle",
      cancelTitle: "Cancel Subscription?",
      cancelDescription: "You will lose access to the office's premium features. This action cannot be undone automatically.",
      cancelConfirm: "Confirm Cancellation",
      cancelKeep: "Keep Plan",
      cancelBtn: "Cancel Subscription",
      expiration: "Expiration",
      cancelSuccess: "Subscription canceled successfully.",
      cancelError: "Failed to cancel subscription."
    },
    onboarding: {
      eyebrow: "Become a Partner Office",
      title: "Choose the ideal plan for your office",
      description: "We have flexible models that adapt to your case volume and revenue. No commitment, cancel anytime.",
      btn: "Get this plan"
    },
    plans: {
      fixed: {
        name: "Fixed Plan",
        price: "$149",
        period: "per month",
        description: "Ideal for offices with steady revenue.",
        features: ["Fixed recurrence", "No surprises", "VIP Support"]
      },
      percentage: {
        name: "Scalable Plan",
        price: "5%",
        period: "of revenue",
        description: "Pay only when you win. With minimum and maximum fees.",
        features: ["$49 minimum fee", "$699 maximum CAP", "Grows with you"]
      },
      hybrid: {
        name: "Hybrid Plan",
        price: "$79 + 2%",
        period: "monthly",
        description: "The best of both worlds for high performance.",
        features: ["Reduced fixed fee", "Competitive %", "Unlimited resources"]
      }
    },
    features: {
      unlimitedProcesses: "Unlimited Cases",
      membersLimit: "Up to 5 Team Members",
      prioritySupport: "24/7 Priority Support",
      customSalesPage: "Custom Sales Page",
      advancedAi: "Advanced AI Integration"
    }
  }
};

export default admin;
