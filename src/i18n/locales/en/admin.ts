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
  },
  overview: {
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
      byVisaType: "By Visa Type",
      total: "Total"
    },
    recentActivity: {
      title: "Recent Activity",
      paymentReceived: "Payment Received",
      newCustomer: "New Customer",
      processUpdated: "Process Updated",
      paymentPending: "Payment Pending",
      hoursAgo: "{{count}} hours ago",
      yesterday: "Yesterday"
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
    },
    mrv: {
      loginLabel: "Consulate Login (Email)",
      loginPlaceholder: "Consular account email",
      passwordLabel: "Consulate Password",
      passwordPlaceholder: "Consular account password",
      voucherLabel: "MRV Fee Voucher",
      voucherSent: "Voucher Sent",
      selectVoucher: "Select PDF Voucher",
      finishGeneration: "Finish Fee Generation",
      messages: {
        fillFields: "Fill in the login, password and send the voucher.",
        uploadSuccess: "Voucher uploaded successfully!",
      }
    },
    scheduling: {
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
        fillCasv: "Fill in the CASV data.",
        fillConsulate: "Fill in the Consulate data.",
        updateSuccess: "Scheduling updated!",
        notifiedSuccess: "Client notified of the scheduling!",
      }
    },
    motion: {
       panelTitle: "Formulate Motion Proposal",
       clientInstructions: "Client Instructions",
       clientReason: "Informed Reason:",
       noReason: "No description provided.",
       denialLetter: "Denial Letter / Docs",
       strategyLabel: "Strategy / Proposal",
       strategyPlaceholder: "Describe the technical strategy for the Motion...",
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
       strategyPlaceholder: "Describe how the RFE will be answered...",
       amountLabel: "RFE Consultancy Value ($)",
       sendProposal: "Send RFE Proposal",
       historyTitle: "RFE History",
       cycle: "Cycle",
       resultApproved: "Approved",
       resultNewRfe: "New RFE",
       resultRejected: "Rejected",
       amount: "Value:",
       yesterday: "yesterday"
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
  payments: {
    title: "Payment Management",
    subtitle: "Queue for manual verification of Zelle transfers and service activation.",
    tabs: {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected"
    },
    searchPlaceholder: "Search by service...",
    table: {
      customer: "Customer",
      serviceName: "Service Name",
      payment: "Payment",
      actions: "Actions",
      noClientName: "Unnamed Customer",
      method: "Method: {{method}}",
      viewProof: "View proof",
      statusSuffix: "Status: {{status}}",
      expected: "Expected: {{amount}}",
      code: "Code: {{code}}",
      autoProcessing: "Auto Processing"
    },
    modals: {
      rejectTitle: "Reject payment",
      reasonLabel: "Reason (optional)",
      reasonPlaceholder: "Ex: Illegible proof, incorrect amount...",
      proofTitle: "Proof — {{name}}",
      openOriginal: "Open"
    },
    messages: {
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
      itemsCount: "{{count}} items"
    },
    categories: {
      main: "Main Services",
      dependents: "Dependents",
      mentorships: "Mentorships",
      additionalSupport: "Additional Support",
      others: "Others"
    },
    messages: {
      invalidValue: "Enter a valid value.",
      updateSuccess: "Price of \"{{name}}\" updated.",
      updateError: "Error saving price: {{error}}",
      statusActivated: "\"{{name}}\" activated. Customers can purchase.",
      statusDeactivated: "\"{{name}}\" deactivated. Purchases blocked.",
      statusError: "Error changing status: {{error}}",
      noPermission: "No permission to change this product. Check RLS policies."
    },
    footerHint: "Hover over the price and click \"Edit\" to change. Use \"Disable/Enable\" to control availability."
  },
  analysisPanel: {
    title: "Technical Specialist Analysis",
    subtitle: "Analyze the client case and define the next steps.",
    clientExplanation: "Client Explanation",
    clientDocuments: "Uploaded Documents",
    noDocuments: "No documents uploaded.",
    internalNotes: "Internal Notes (Optional)",
    internalNotesPlaceholder: "Note technical details about this case...",
    finalMessage: "Message to the Client",
    finalMessagePlaceholder: "Explain the analysis outcome or ask for more data...",
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
      missingFields: "Fill in the final message or send at least one document.",
      proposalSent: "Proposal sent to the client!"
    }
  },
  coupons: {
    title: "Discount Coupons",
    subtitle: "Create and manage promotional coupons. Changes take effect on checkout immediately.",
    createNew: "Create New Coupon",
    stats: {
      total: "Total Coupons",
      active: "Active",
      expired: "Expired",
      totalUses: "Total Uses"
    },
    form: {
      code: "Coupon Code",
      codePlaceholder: "E.g.: SAVE20",
      generateRandom: "Generate",
      discountType: "Discount Type",
      percentage: "Percentage (%)",
      fixed: "Fixed Amount ($)",
      value: "Value",
      valuePlaceholder: "E.g.: 20",
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
      submit: "Create Coupon"
    },
    table: {
      code: "Code",
      type: "Type",
      value: "Value",
      uses: "Uses",
      expiresAt: "Expires at",
      status: "Status",
      actions: "Actions",
      copy: "Copy",
      activate: "Activate",
      deactivate: "Deactivate",
      unlimited: "Unlimited",
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
      toggleSuccess: "Coupon \"{{code}}\" {{status}}.",
      toggleError: "Error changing status: {{error}}",
      copied: "Code copied!",
      invalidValue: "Enter a valid value.",
      invalidCode: "Enter a valid code."
    }
  }
};

export default admin;
