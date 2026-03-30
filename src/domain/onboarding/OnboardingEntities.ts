export interface OnboardingData {
    // Old fields (kept for compatibility)
    fullName?: string;
    dob?: string;
    passportNumber?: string;
    nationality?: string;
    currentAddress?: string;
    travelledBefore?: string;
    hadVisa?: string;
    countriesVisited?: string;
    travelPurpose?: string;
    expectedDate?: string;
    expectedDuration?: string;
    consulateCity?: string;

    // DS-160 Specific Fields
    interviewLocation?: string;

    // Personal Info 1
    email?: string;
    firstName?: string;
    lastName?: string;
    fullNamePassport?: string;
    hasOtherNames?: string;
    otherNames?: string;
    hasTelecode?: string;
    telecodeValue?: string;
    gender?: string;
    maritalStatus?: string;
    birthDate?: string;
    birthCity?: string;
    birthState?: string;
    birthCountry?: string;

    // Personal Info 2
    nationalityInfo?: string;
    hasOtherNationality?: string;
    otherNationalities?: string;
    hasNationalityPassport?: string;
    nationalityPassportNumber?: string;
    isPermanentResidentOtherCountry?: string;
    permResCountryDetails?: string;
    nationalID?: string;
    nationalIDDoesNotApply?: boolean;
    ssn?: string;
    ssnDoesNotApply?: boolean;
    taxID?: string;
    taxIDDoesNotApply?: boolean;

    // Travel Info
    hasSpecificTravelPlan?: string;
    arrivalDate?: string;
    arrivalFlightNumber?: string;
    arrivalCity?: string;
    departureDate?: string;
    departureFlightNumber?: string;
    departureCity?: string;
    stayDurationValue?: string;
    stayDurationUnit?: string;
    visitLocations?: string;
    stayAddress?: string;
    stayCity?: string;
    stayState?: string;
    stayZip?: string;
    travelPayer?: string;
    payerRelationship?: string;
    payerName?: string;

    // Companions
    hasTravelCompanions?: string;
    companionName?: string;
    companionRelationship?: string;
    isTravelingWithGroup?: string;
    groupName?: string;

    // Previous Travel
    hasBeenToUS?: string;
    lastUSTravelDate?: string;
    lastUSTravelPortOfEntry?: string;
    lastUSTravelDurationValue?: string;
    lastUSTravelDurationUnit?: string;
    lastUSTravelPurpose?: string;
    hasUSDriverLicense?: string;
    usDriverLicenseNumber?: string;
    usDriverLicenseState?: string;
    hasHadUSVisa?: string;
    lastVisaIssuanceDate?: string;
    lastVisaNumber?: string;
    hasVisaBeenCancelled?: string;
    visaCancellationDetails?: string;
    hasBeenDeniedVisa?: string;
    visaRefusalDetails?: string;
    hasImmigrationPetition?: string;
    immigrationPetitionDetails?: string;
    isSolicitingSameTypeVisa?: string;
    isApplyingInSameCountry?: string;
    haveBeenFingerprintedBefore?: string;
    hasVisaBeenLostStolen?: string;
    visaLostStolenYear?: string;
    visaLostStolenExplanation?: string;

    // Address & Phone
    homeAddress?: string;
    homeCity?: string;
    homeState?: string;
    homeZip?: string;
    homeCountry?: string;
    isMailingSameAsHome?: string;
    mailingAddress?: string;
    mailingCity?: string;
    mailingState?: string;
    mailingZip?: string;
    mobilePhone?: string;
    homePhone?: string;
    workPhone?: string;
    hasOtherPhoneLast5Years?: string;
    otherPhonesDetails?: string;
    hasOtherEmailLast5Years?: string;
    otherEmailsDetails?: string;

    // Social Media
    socialMedia1?: string;
    socialMedia2?: string;
    socialMedia3?: string;
    socialMediaPlatforms?: { platform: string; identifier: string }[];

    // Passport Info
    passportType?: string;
    passportNumberDS?: string;
    passportAuthority?: string;
    passportIssuanceCity?: string;
    passportIssuanceState?: string;
    passportIssuanceCountry?: string;
    passportIssuanceDate?: string;
    passportExpirationDate?: string;
    hasLostPassport?: string;
    hasPassportBeenLostStolen?: string;
    lostPassportNumberDetails?: string;
    lostPassportCountryDetails?: string;
    lostPassportExplanationDetails?: string;

    // US Contact
    hasUSContact?: string;
    contactName?: string;
    contactNameDoesNotApply?: boolean;
    contactOrganization?: string;
    contactOrganizationDoesNotApply?: boolean;
    contactRelationship?: string;
    contactAddress?: string;
    contactCity?: string;
    contactState?: string;
    contactZip?: string;
    contactPhone?: string;
    contactEmail?: string;
    contactEmailDoesNotApply?: boolean;

    // Family Info
    fatherLastName?: string;
    fatherFirstName?: string;
    fatherBirthDate?: string;
    isFatherInUS?: string;
    fatherUSStatus?: string;
    motherLastName?: string;
    motherFirstName?: string;
    motherBirthDate?: string;
    isMotherInUS?: string;
    motherUSStatus?: string;
    hasImmediateRelativesInUS?: string;
    maternalGrandmotherName?: string;
    immediateRelativeName?: string;
    immediateRelativeRelationship?: string;
    immediateRelativeStatus?: string;
    hasOtherRelativesInUS?: string;

    // Work / Education
    primaryOccupation?: string;
    employerName?: string;
    employerAddress?: string;
    employerCity?: string;
    employerState?: string;
    employerZip?: string;
    employerPhone?: string;
    employerCountry?: string;
    jobStartDate?: string;
    monthlyIncome?: string;
    jobDescription?: string;
    wasPreviouslyEmployed?: string;
    prevEmployerName?: string;
    prevJobTitle?: string;
    prevJobPeriod?: string;
    prevJobReasonLeft?: string;
    prevEmployerSupervisor?: string;
    hasSecondaryEducation?: string;
    educationInstitutionName?: string;
    educationCompletionDate?: string;
    educationDegree?: string;

    // Additional Info
    belongsToClan?: string;
    clanName?: string;
    languagesSpoken?: string;
    hasVisitedOtherCountries?: string;
    countriesVisitedLast5Years?: string;
    countriesVisitedDetails?: string;

    // F1/F2 Specific Fields
    schoolName?: string;
    schoolAddress?: string;
    courseName?: string;
    courseStartDate?: string;
    courseEndDate?: string;
    sevisId?: string;
    f1f2ConsulateLocation?: string;
    f1f2ApplicationId?: string;
    f1f2SecurityAnswer?: string;

    // Change of Status Specific Fields
    courseApplyingIn?: string;
    paidFormI531?: string;
    hasSponsor?: string;
    appliedBy?: string;
    agreedVisaExtension?: boolean;
    agreedFeesCOS?: boolean;
    agreedSevisFees?: boolean;
    agreedMailingAddress?: boolean;
    agreedAcknowledgement?: boolean;

    // Change of Status (COS) - New Fields
    currentVisa?: string;
    currentVisaOther?: string;
    targetVisa?: string;
    i94AuthorizedStayDate?: string;
    dependents?: {
        name: string;
        relationship: string;
        birthDate: string;
        marriageDate?: string;
    }[];
    coverLetterData?: {
        decidedToGoUS?: string;
        locationsVisited?: string;
        whyB1B2?: string;
        whyNotF1Home?: string;
        whyChangeStatus?: string;
        chosenCourse?: string;
        whyNotCourseBrazil?: string;
        jobInBrazil?: string;
        careerBenefit?: string;
        residenceBrazil?: string;
        financialSupport?: string;
        sponsorInfo?: string;
    };
    sevisPaid?: string;
}
