const services = {
  sectionTitle: "Our services",
  sectionSubtitle: "Choose the ideal guide for your immigration process.",
  viewDetails: "View details",
  catalogTitle: "Services Catalog",
  catalogSubtitle: "Complete solutions for every stage of your American dream.",
  data: [
    {
      slug: "visto-turismo-b1b2",
      title: "Tourist / Business Visa (B1/B2)",
      shortTitle: "Tourist Visa (B1/B2)",
      subtitle: "The gateway to the United States",
      price: "$ 59.00",
      originalPrice: "$ 118.00",
      basePrice: 59,
      description: "Full digital assistance for the B1/B2 visa. Ideal for those traveling for leisure, visiting family, or attending business meetings.",
      forWhom: ["Leisure travelers", "Visiting friends or family", "Business meetings and conferences", "Short medical treatments"],
      included: ["DS-160 Form in Portuguese / English", "Custom documents checklist", "Automated search for near dates", "AI interview training"],
      notIncluded: ["Consular fee ($ 185)", "Passport shipping", "Guarantee of approval"],
      requirements: ["Valid passport", "Ties to home country", "Financial capacity for the trip"]
    },
    {
      slug: "renovacao-visto",
      title: "Visa Renewal (No Interview)",
      shortTitle: "Visa Renewal",
      subtitle: "Renew your visa simply and quickly",
      price: "$ 39.00",
      originalPrice: "$ 78.00",
      basePrice: 39,
      description: "Simplified process for those who already have a US visa and wish to renew it without a new consular interview.",
      forWhom: ["Visas expired within last 48 months", "Same visa type", "Under 14 or over 79 years old"],
      included: ["Full DS-160 form", "Document submission instructions", "Passport/fee generation", "Operational support"],
      notIncluded: ["Consular fee ($ 185)", "Document shipping cost", "Passport delivery"],
      requirements: ["Previous visa issued in Brazil", "No prior visa denial", "Unchanged biographical data"]
    },
    {
      slug: "visto-estudante-f1",
      title: "Student Visa (F-1)",
      shortTitle: "Student Visa (F-1)",
      subtitle: "Realize your dream of studying in the US",
      price: "$ 99.00",
      originalPrice: "$ 198.00",
      basePrice: 99,
      description: "Full assistance for the F-1 student visa. From school document organization to interview preparation.",
      forWhom: ["Language course students", "Undergraduate and Graduate", "Technical and vocational courses"],
      included: ["I-20 form help", "SEVIS Fee payment", "Specialized DS-160", "Academic interview simulation"],
      notIncluded: ["Consular fee ($ 185)", "SEVIS Fee ($ 350)", "School/University costs"],
      requirements: ["I-20 from SEVP approved school", "Robust financial proof", "Intent to return to home country"]
    }
  ]
};

export default services;
