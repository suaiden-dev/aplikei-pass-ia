const admin = {
  analysisPanel: {
    title: "Expert Technical Analysis",
    subtitle: "Analyze the customer's case and define the next steps.",
    clientExplanation: "Customer Explanation",
    clientDocuments: "Submitted Documents",
    noDocuments: "No documents submitted.",
    internalNotes: "Internal Notes (Optional)",
    internalNotesPlaceholder: "Write technical details about this case...",
    finalMessage: "Message to Customer",
    finalMessagePlaceholder: "Explain the analysis result or request more data...",
    actions: {
      completeReview: "Complete Review",
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
      missingFields: "Please fill the final message or upload at least one document.",
      proposalSent: "Proposal sent to customer!"
    }
  }
};

export default admin;
