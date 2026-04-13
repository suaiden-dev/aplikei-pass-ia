const checkout = {
  paymentPending: {
    title: "CONSULAR FEE PAYMENT",
    desc: "Select the desired payment method to proceed with scheduling.",
    loadingInfo: "Loading information...",
    feeInProcessing: "FEE IN PROCESSING",
    excellentEmailReceived: "Excellent! Your email confirmation has been received. Now our team is generating your slip for the MRV fee payment.",
    generatingSlip: "Generating Slip...",
    processMinutes: "This process usually takes a few minutes. Once ready, the payment options will appear here.",
    refreshStatus: "REFRESH STATUS",
    slipDetails: "SLIP DETAILS",
    cardDetails: "CARD DETAILS",
    bankSlip: "Bank Slip",
    payAnyBank: "Pay at any bank or convenience store.",
    creditCard: "Credit Card",
    immediatePayment: "Immediate payment via consulate portal.",
    slide1Title: "Access the Portal",
    slide1Desc: "Click the button below to access the official consulate portal and log in using the credentials provided here.",
    slide2Title: "Navigate to Payment",
    slide2Desc: "In the portal, locate the 'Pay Visa Fee' button to proceed with your application and reach the payment section.",
    slide3Title: "Select Credit Card",
    slide3Desc: "Choose the 'Credit Card' option as the payment method to pay the MRV fee instantly.",
    slide4Title: "Confirm Payment",
    slide4Desc: "After successfully paying, return here and click 'I've already paid the fee' to continue scheduling your interview.",
    downloadPdfSlip: "Download PDF Slip",
    officialSlipAvailable: "The official slip is now available.",
    importantInfo: "IMPORTANT INFO",
    compensationDesc: "Slip clearing can take up to 48 business hours. Only after this period will our system release your scheduling.",
    portalPayment: "Portal Payment",
    accessOfficialPortal: "To pay with a credit card, you must access the official consulate portal with the details below:",
    password: "Password",
    goToPortal: "GO TO PORTAL",
    advantage: "ADVANTAGE",
    creditCardInstant: "Payments via credit card are usually cleared instantly, speeding up your process.",
    alreadyPaid: "I HAVE COMPLETED THE PAYMENT",
    secureEnvironment: "Secure and encrypted environment"
  },
  feeProcessing: {
    title: "Fee Processing",
    desc: "We are preparing the creation of your account on the official US consulate portal.",
    nextStep: "NEXT STEP",
    consularAccountTitle: "Consular Account Creation",
    consularAccountDesc: "To continue with your visa, we will create your official access.",
    accountEmailTitle: "Account with your Email",
    accountEmailDesc: "An account was created using your email. Please check your inbox.",
    watchEmailTitle: "Watch your Email",
    watchEmailDesc: "Stay tuned to your inbox and spam folder to confirm your email by clicking the link once it arrives.",
    alreadyConfirmedEmail: "I'VE ALREADY CONFIRMED THE EMAIL",
    securityPriority: "Data security is our top priority.",
    creatingCredentialsTitle: "Creating your credentials...",
    creatingCredentialsDesc: "Our team is setting up your access in the consular system. This should be quick.",
    successMsg: "Great! Now let's proceed to payment.",
    errorUpdatingStatus: "Error updating status."
  },
  product: {
    title: "Payment",
    scarcityBanner: {
      lastSlots: "Last slots with discount: today only!",
      timeLeft: "left",
      cta: "Hurry up"
    },
    summary: {
      mainService: "Main service",
      dependentsCount: "Dependents ({{count}}×)",
      slotsCount: "Slots Quantity",
      subtotal: "Subtotal",
      total: "Total",
      stripeFee: "Stripe Fee (~3.9% + $0.30)",
      exchangeTax: "Exchange + IOF (est.)",
      estimatedNotice: "* Estimated value. The final exchange rate is calculated at the time of payment.",
      offLabel: "50% OFF"
    },
    dependents: {
      label: "Dependents",
      slotsLabel: "Slots Quantity",
      perPerson: "{{price}} per person",
      perSlot: "{{price}} per slot"
    },
    userData: {
      title: "Your details",
      fullName: "Full name",
      email: "Email",
      phone: "Phone",
      password: "Create a password for your account",
      passwordDesc: "Minimum 6 characters",
      passwordAutoNotice: "Your account will be created automatically upon completing the order.",
      errors: {
        nameRequired: "Enter your full name",
        nameShort: "Name too short",
        emailRequired: "Enter your email",
        emailInvalid: "Invalid email",
        phoneRequired: "Enter a valid phone number",
        passwordShort: "The password must be at least 6 characters.",
        emailTaken: "This email already has an account. Please log in before hiring."
      }
    },
    paymentMethods: {
      title: "Payment method",
      card: {
        label: "Card",
        sublabel: "USD",
        notice: "You will be redirected to **Stripe's** secure checkout. We accept Visa, Mastercard, and American Express in USD."
      },
      pix: {
        label: "Pix",
        sublabel: "BRL",
        notice: "You will be redirected to **Stripe checkout with Pix**. A QR Code will be generated in BRL. The value includes exchange rate + IOF."
      },
      parcelow: {
        label: "Parcelow",
        sublabel: "BRL",
        notice: "Pay in up to **12 fixed installments** via **Parcelow**. Value converted to BRL with installment fees. Guaranteed exchange rate.",
        cpfLabel: "Cardholder's CPF",
        cpfPlaceholder: "000.000.000-00",
        cpfRequired: "Provide a valid CPF to proceed with Parcelow.",
        cpfNotice: "Required for invoice issuance by Parcelow."
      },
      zelle: {
        label: "Zelle",
        sublabel: "USD",
        notice: "Send Zelle to:",
        name: "Name:",
        email: "Email:",
        phone: "Phone:",
        confirmTitle: "Payment Confirmation",
        amountSent: "Amount sent (USD)",
        amountPlaceholder: "0.00",
        confirmationCode: "Confirmation code (optional)",
        confirmationPlaceholder: "Ex: 123456789",
        paymentDate: "Payment date",
        uploadProof: "Attach proof",
        uploadDesc: "JPG or PNG. Max 8MB.",
        fileTooLarge: "File too large. Max 8MB.",
        amountRequired: "Inform the value sent via Zelle.",
        dateRequired: "Inform the payment date.",
        proofRequired: "Attach the payment proof.",
        submit: "Submit Confirmation",
        pendingReview: "Confirmation received! We are analyzing the proof to activate your guide. You will receive an email shortly.",
        goDashboard: "Go to Dashboard"
      },
      soon: "COMING SOON"
    },
    placeOrder: "Complete Order",
    redirecting: "Processing...",
    statusUnavailable: {
      title: "Service unavailable",
      desc: "This guide is temporarily unavailable for hiring. You will be redirected to your dashboard.",
      back: "Back to Dashboard"
    },
    success: {
      activating: "Activating your process...",
      confirmed: "Payment confirmed!",
      activated: "Your process has been successfully activated.",
      checkEmail: "Check your email",
      checkEmailDesc: "We sent a confirmation with your process details.",
      accessDashboard: "Access your dashboard",
      accessDashboardDesc: "Track your process progress and receive real-time updates.",
      goDashboard: "Go to Dashboard",
      backHome: "Back to home",
      errorTitle: "Notice about your service",
      errorDesc: "Your payment was successfully received, but the system found an alert when starting the service:",
      sessionExpired: "Session expired. Please log in again."
    }
  }
};

export default checkout;
