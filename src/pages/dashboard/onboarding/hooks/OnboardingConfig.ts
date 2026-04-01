export const B1B2_FIELD_MAPPING: Record<string, string[]> = {
  "personal1": ["email", "firstName", "lastName", "gender", "maritalStatus", "birthDate", "birthCity", "birthState", "birthCountry", "fullName", "fullNamePassport", "hasOtherNames", "otherNamesDetails", "hasTelecode", "telecodeValue", "interviewLocation"],
  "personal2": ["nationality", "hasOtherNationality", "otherNationalities", "hasPassportOtherCountry", "otherPassportNumber", "isPermanentResidentOtherCountry", "permanentResidentDetails", "nationalID", "ssn", "taxpayerID"],
  "travel": ["travelPurpose", "hasSpecificTravelPlan", "arrivalDate", "arrivalCity", "intendedLengthOfStay", "travelPayer", "travelPayerDetails", "consulateCity"],
  "companions": ["hasTravelCompanions", "isTravelingWithGroup", "travelCompanionsList"],
  "previous-travel": ["hasBeenToUS", "previousTravelList", "hasUSDriverLicense", "driverLicenseList", "hasHadUSVisa", "lastVisaDate", "lastVisaNumber", "isSameVisaType", "hasBeenTenPrinted", "hasBeenLostStolen", "hasBeenCancelledRevoked", "hasBeenDeniedVisa", "denialDetails", "hasImmigrationPetition", "petitionDetails"],
  "address-phone": ["homeAddress", "homeCity", "homeState", "homeZip", "homeCountry", "isMailingSameAsHome", "mailingAddress", "mailingCity", "mailingState", "mailingZip", "mailingCountry", "primaryPhone", "secondaryPhone", "workPhone", "hasOtherPhoneLast5Years", "otherPhoneDetails", "hasOtherEmailLast5Years", "otherEmailDetails"],
  "social-media": ["socialMediaPlatforms"],
  "passport": ["passportType", "passportNumberDS", "passportBookNumber", "passportIssuanceCountry", "passportIssuanceCity", "passportIssuanceState", "passportIssuanceDate", "passportExpirationDate", "hasPassportBeenLostStolen", "lostStolenDetails"],
  "us-contact": ["contactName", "contactOrganization", "contactRelationship", "contactAddress", "contactCity", "contactState", "contactZip", "contactPhone", "contactEmail"],
  "family": ["fatherLastName", "fatherFirstName", "fatherBirthDate", "isFatherInUS", "fatherUSStatus", "motherLastName", "motherFirstName", "motherBirthDate", "isMotherInUS", "motherUSStatus", "hasImmediateRelativesInUS", "immediateRelativesList", "hasOtherRelativesInUS", "maternalGrandmotherName"],
  "work-education": ["primaryOccupation", "employerName", "employerAddress", "employerCity", "employerState", "employerZip", "employerCountry", "employerPhone", "jobStartDate", "monthlyIncome", "jobDescription", "wasPreviouslyEmployed", "previousEmployersList", "hasSecondaryEducation", "secondaryEducationList"],
  "additional": ["belongsToClan", "clanName", "languagesSpoken", "hasVisitedOtherCountries", "countriesVisitedDetails", "hasWorkContract", "contractDetails", "hasServedInMilitary", "militaryDetails", "hasBeenToWarZone", "warZoneDetails", "hasSpecialSkills", "skillsDetails"],
};

export const F1F2_FIELD_MAPPING: Record<string, string[]> = {
  "f1f2-personal1": ["email", "firstName", "lastName", "fullName", "birthDate", "gender", "maritalStatus", "birthCity", "birthCountry", "interviewLocation"],
  "f1f2-personal2": ["ssn", "taxpayerID", "nationality", "nationalID"],
  "f1f2-travel": ["travelPurpose", "sevisId", "schoolName", "courseStartDate", "courseEndDate", "arrivalDate", "intendedLengthOfStay", "travelPayer"],
  "f1f2-history": ["hasBeenToUS", "hasHadUSVisa", "hasBeenDeniedVisa", "hasImmigrationPetition"],
  "f1f2-address-phone": ["homeAddress", "homeCity", "homeState", "homeZip", "homeCountry", "primaryPhone", "socialMediaPlatforms"],
  "f1f2-passport": ["passportNumberDS", "passportIssuanceCountry", "passportIssuanceDate", "passportExpirationDate"],
};

export const COS_FIELD_MAPPING: Record<string, string[]> = {
  "cos-form": ["currentVisa", "currentVisaOther", "targetVisa", "i94AuthorizedStayDate", "dependents", "appliedBy"],
  "cos-cover-letter-form": ["coverLetterData"],
  "cos-tracking": ["trackingCode"]
};

export const B1B2_STEP_SLUGS = [
  "personal1", "personal2", "travel",
  "companions", "previous-travel", "address-phone",
  "social-media", "passport", "us-contact", "family",
  "work-education", "additional", "documents", "review"
];

export const F1F2_STEP_SLUGS = [
  "f1f2-personal1", "f1f2-personal2", "f1f2-travel", 
  "f1f2-history", "f1f2-address-phone", "f1f2-social-media", 
  "f1f2-passport", "f1f2-documents", "review"
];

export const COS_STEP_SLUGS = [
  "cos-form", "cos-documents", "cos-official-forms", "cos-cover-letter-form", 
  "cos-i20", "cos-sevis", "cos-final-forms", "cos-review", "cos-tracking"
];
