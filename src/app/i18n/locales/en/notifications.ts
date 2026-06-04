const notifications = {
  bell: {
    tooltip: "Notifications",
    markAllRead: "Mark all as read",
    viewAll: "View all notifications",
  },
  filters: {
    all: "All",
    unread: "Unread",
    payment: "Payment",
    process: "Process",
    uscis: "USCIS",
    rfe: "RFE",
    scheduling: "Scheduling",
    motion: "Motion",
    admin: "Admin",
    billing: "Billing",
    cos: "COS",
    b1b2: "B1/B2",
    f1: "F1",
    system: "System",
  },
  empty: {
    title: "No notifications",
    subtitle: "You're all caught up!",
  },
  toast: {
    newNotification: "New notification",
    viewDetails: "View details",
    dismiss: "Dismiss",
  },
  log: {
    title: "Notification Log",
    subtitle: "Full history of system events",
    noResults: "No notifications found.",
    sentAt: "Sent at {{date}}",
    emailSent: "Email sent",
    emailPending: "Email not sent",
  },
  status: {
    pending: "Pending",
    sent: "Sent",
    failed: "Failed",
    read: "Read",
    unread: "Unread",
  },
  category: {
    payment: "Payment",
    process: "Process",
    uscis: "USCIS",
    rfe: "RFE",
    scheduling: "Scheduling",
    motion: "Motion",
    admin: "Administrative",
    billing: "Billing",
    cos: "COS",
    b1b2: "B1/B2",
    f1: "F1",
    system: "System",
  },
  action: {
    confirmed: "Confirmed",
    zelle_approved: "Zelle Approved",
    zelle_rejected: "Zelle Rejected",
    zelle_bot_failed: "Zelle Verification Failed",
    zelle_bot_offline: "Zelle Bot Offline",
    step_approved: "Step Approved",
    step_approved_final: "Step Approved (Final)",
    step_rejected: "Changes Requested",
    completed_approved: "Completed (Approved)",
    completed_denied: "Completed (Denied)",
    result_approved: "Result Approved",
    result_denied: "Result Denied",
    received: "Received",
    interview_scheduled: "Interview Scheduled",
    submitted: "Submitted",
    message: "Message",
    review_required: "Review Required",
    step_submitted: "Step Submitted",
    under_review: "Under Review",
    update: "Update",
    step_approved_confirmed: "Step Approved by Admin",
    step_rejected_confirmed: "Step Rejected by Admin",
    process_approved: "Process Approved",
    process_denied: "Process Denied",
    withdrawal_requested: "Withdrawal Requested",
    withdrawal_approved: "Withdrawal Approved",
    withdrawal_rejected: "Withdrawal Rejected",
    subscription_canceled: "Subscription Canceled",
    subscription_updated: "Subscription Updated",
    i20_uploaded: "I-20 Uploaded",
    sevis_receipt_uploaded: "SEVIS Receipt Uploaded",
    cover_letter_completed: "Cover Letter Completed",
    i539_generated: "I-539 Generated",
    rfe_letter_uploaded: "RFE Letter Uploaded",
    rfe_description_submitted: "RFE Description Submitted",
    motion_reason_submitted: "Motion Reason Submitted",
    motion_denial_letter_uploaded: "Denial Letter Uploaded",
    motion_supporting_docs_uploaded: "Supporting Docs Uploaded",
    uscis_result_reported: "USCIS Result Reported",
    motion_started: "Motion Started",
    rfe_started: "RFE Started",
    motion_result_reported: "Motion Result Reported",
    rfe_result_reported: "RFE Result Reported",
    ds160_completed: "DS-160 Completed",
    ds160_signed: "DS-160 Signed",
    casv_scheduled: "CASV Scheduling Submitted",
    mrv_payment_confirmed: "MRV Payment Confirmed",
  },

  // -----------------------------------------------------------------
  // Notification content — key: {category}__{action}
  // Variables: {{var}} replaced from notification.metadata at display time.
  // Missing variables render as empty string.
  // -----------------------------------------------------------------
  content: {
    // payment — client-facing ----------------------------------------
    "payment__confirmed": {
      title: "Payment Confirmed!",
      message: "Your payment for {{service_name}} was processed successfully.",
    },
    "payment__zelle_approved": {
      title: "Zelle Payment Approved!",
      message: "Your Zelle transfer of {{amount}} for {{service_name}} was verified and approved.",
    },
    "payment__zelle_rejected": {
      title: "Problem with Your Zelle Payment",
      message: "We found an issue with your Zelle payment for {{service_name}}. Reason: {{reason}} Please contact support.",
    },
    // payment — admin alerts ------------------------------------------
    "payment__zelle_bot_failed": {
      title: "Zelle: Auto-Verification Failed",
      message: "Payment {{payment_id}} (${{amount}}) did not pass automatic verification. Reason: {{bot_response}}. Manual review required.",
    },
    "payment__zelle_bot_offline": {
      title: "Zelle: Verification Bot Offline",
      message: "Could not contact the verification bot for payment {{payment_id}}. Proceeding with manual review.",
    },

    // process — client-facing -----------------------------------------
    "process__step_approved": {
      title: "Step Approved",
      message: "The step \"{{step_name}}\" was approved. Next step: {{next_step_name}}.",
    },
    "process__step_approved_final": {
      title: "Step Approved",
      message: "The step \"{{step_name}}\" was approved.",
    },
    "process__step_rejected": {
      title: "Changes Required",
      message: "The step \"{{step_name}}\" needs updates. Feedback: {{feedback}}",
    },
    "process__step_rejected_no_feedback": {
      title: "Changes Required",
      message: "The step \"{{step_name}}\" needs updates. Please review your dashboard.",
    },
    "process__completed_approved": {
      title: "Process Completed Successfully",
      message: "Your {{service_name}} has been completed and approved.",
    },
    "process__completed_denied": {
      title: "Process Completed",
      message: "Your {{service_name}} was completed with a denied result. Contact your lawyer for next steps.",
    },
    "process__under_review": {
      title: "We Are Reviewing!",
      message: "Your step was submitted successfully and is pending review by our team. Please wait for validation.",
    },
    // process — admin-facing -------------------------------------------
    "process__review_required": {
      title: "Action Required: Review Step",
      message: "{{client_name}} completed step \"{{step_name}}\" in {{service_name}} and is waiting for your review.",
    },
    "process__step_submitted": {
      title: "Action Required: Review Step",
      message: "{{client_name}} completed a step in {{service_name}} and is waiting for your review.",
    },

    // uscis — client-facing -------------------------------------------
    "uscis__result_approved": {
      title: "USCIS Approved Your Case",
      message: "Great news! USCIS has approved your case.",
    },
    "uscis__result_denied": {
      title: "USCIS Decision Received",
      message: "USCIS issued a decision on your case. Check your dashboard for next steps.",
    },

    // rfe — client-facing ---------------------------------------------
    "rfe__received": {
      title: "RFE Received",
      message: "USCIS issued a Request for Evidence for your case. Please check your dashboard urgently.",
    },

    // scheduling — client-facing --------------------------------------
    "scheduling__interview_scheduled": {
      title: "Interview Scheduled",
      message: "Your interview has been scheduled. Check the date and location in your process.",
    },

    // motion — client-facing ------------------------------------------
    "motion__submitted": {
      title: "Motion Submitted",
      message: "Your payment was confirmed and we have started the next steps for your motion.",
    },

    // admin — generic message (admin/master-facing) -------------------
    "admin__message": {
      title: "New Message from the Team",
      message: "You have received a new message from the administrative team.",
    },
    "admin__step_approved_confirmed": {
      title: "Step Approved by Admin",
      message: "Admin approved step \"{{step_name}}\" in {{service_name}}.",
    },
    "admin__process_approved": {
      title: "Process Completed (Approved)",
      message: "Admin approved the final step for {{service_name}}.",
    },
    "admin__step_rejected_confirmed": {
      title: "Step Rejected by Admin",
      message: "Admin rejected step \"{{step_name}}\" in {{service_name}} and sent feedback.",
    },
    "admin__process_denied": {
      title: "Process Completed (Denied)",
      message: "Admin denied the final step for {{service_name}}.",
    },

    // billing — admin/master-facing -----------------------------------
    "billing__withdrawal_requested": {
      title: "New Withdrawal Request",
      message: "Office {{office_id}} requested a withdrawal of ${{amount}}.",
    },
    "billing__withdrawal_approved": {
      title: "Withdrawal Approved",
      message: "Your withdrawal request of ${{amount}} was approved.",
    },
    "billing__withdrawal_rejected": {
      title: "Withdrawal Rejected",
      message: "Your withdrawal request of ${{amount}} was rejected.",
    },
    "billing__subscription_canceled": {
      title: "Subscription Canceled",
      message: "Office {{office_id}} canceled the active subscription.",
    },
    "billing__subscription_updated": {
      title: "Subscription Updated",
      message: "Office {{office_id}} activated/changed to plan {{plan_name}}.",
    },

    // cos — admin-facing (all in English) -----------------------------
    "cos__i20_uploaded": {
      title: "COS: I-20 Received",
      message: "{{client_name}} uploaded the I-20 document for review.",
    },
    "cos__sevis_receipt_uploaded": {
      title: "COS: SEVIS Receipt Received",
      message: "{{client_name}} uploaded the SEVIS fee receipt for verification.",
    },
    "cos__cover_letter_completed": {
      title: "COS: Cover Letter Completed",
      message: "{{client_name}} completed the cover letter questionnaire.",
    },
    "cos__i539_generated": {
      title: "COS: I-539 Form Generated",
      message: "{{client_name}} completed and generated the I-539 PDF.",
    },
    "cos__rfe_letter_uploaded": {
      title: "COS: RFE Letter Received",
      message: "{{client_name}} submitted the RFE letter.",
    },
    "cos__rfe_description_submitted": {
      title: "COS: RFE Description Submitted",
      message: "{{client_name}} submitted the RFE requirements description.",
    },
    "cos__motion_reason_submitted": {
      title: "COS: Motion Reason Submitted",
      message: "{{client_name}} submitted the motion reason.",
    },
    "cos__motion_denial_letter_uploaded": {
      title: "COS: Denial Letter Received",
      message: "{{client_name}} submitted the denial letter to start the motion.",
    },
    "cos__motion_supporting_docs_uploaded": {
      title: "COS: Supporting Docs Uploaded",
      message: "{{client_name}} uploaded supporting motion documents.",
    },
    "cos__uscis_result_reported": {
      title: "COS: USCIS Result Reported",
      message: "{{client_name}} reported a new USCIS result.",
    },
    "cos__motion_started": {
      title: "COS: Motion Workflow Started",
      message: "Motion workflow started for {{client_name}}.",
    },
    "cos__rfe_started": {
      title: "COS: RFE Workflow Started",
      message: "RFE workflow started for {{client_name}}.",
    },
    "cos__motion_result_reported": {
      title: "COS: Motion Result Reported",
      message: "{{client_name}} reported the Motion result.",
    },
    "cos__rfe_result_reported": {
      title: "COS: RFE Result Reported",
      message: "{{client_name}} reported the RFE result.",
    },

    // b1b2 — admin-facing (all in English) ----------------------------
    "b1b2__ds160_completed": {
      title: "B1/B2: DS-160 Completed",
      message: "{{client_name}} completed the DS-160 form.",
    },
    "b1b2__ds160_signed": {
      title: "B1/B2: DS-160 Signed",
      message: "{{client_name}} completed review and uploaded DS-160 signature confirmation documents.",
    },
    "b1b2__casv_scheduled": {
      title: "B1/B2: CASV Scheduling Submitted",
      message: "{{client_name}} submitted preferred date for CASV scheduling.",
    },
    "b1b2__mrv_payment_confirmed": {
      title: "B1/B2: MRV Payment Confirmed",
      message: "{{client_name}} confirmed MRV fee payment.",
    },

    // f1 — admin-facing (all in English) ------------------------------
    "f1__i20_uploaded": {
      title: "F1: I-20 Uploaded",
      message: "{{client_name}} uploaded the I-20 document for review.",
    },

    // system ----------------------------------------------------------
    "system__message": {
      title: "System Notice",
      message: "You have received a new message from the system.",
    },
    "system__update": {
      title: "Platform Update",
      message: "There are new updates available on the platform.",
    },
  },
};

export default notifications;
