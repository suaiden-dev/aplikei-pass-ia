import { describe, it, expect } from "vitest";
import { DS160Schema } from "./ds160.schema";

describe("DS160Schema", () => {
  const validBaseData = {
    interviewLocation: "São Paulo",
    isBrazilian: "sim",
    surname: "Doe",
    givenName: "John",
    maternalGrandmotherName: "Jane",
    fullName: "John Doe",
    hasOtherNames: "nao",
    gender: "masculino",
    maritalStatus: "solteiro",
    birthDate: "1990-01-01",
    birthCity: "São Paulo",
    birthState: "SP",
    birthCountry: "Brasil",
    hasOtherNationality: "nao",
    hasOtherResidence: "nao",
    cpf: "123.456.789-00",
    passportNumber: "BR123456",
    passportIssueDate: "2020-01-01",
    passportExpDate: "2030-01-01",
    lostPassport: "nao",
    travelPurpose: "Turismo",
    specificTravelPlan: "nao",
    estArrivalDate: "2025-01-01",
    usStayName: "Hotel",
    usStayStreet: "Main St",
    usStayCity: "Orlando",
    usStayState: "FL",
    payingTrip: "eu",
    travelingWithOthers: "nao",
    beenToUS: "nao",
    hadUSVisa: "nao",
    refusedUSVisa: "nao",
    immigrationPetition: "nao",
    homeStreet: "Rua A",
    homeZip: "01000-000",
    homeCity: "São Paulo",
    homeState: "SP",
    homeCountry: "Brasil",
    differentMailingAddress: "nao",
    primaryPhone: "11999999999",
    otherPhones5Y: "nao",
    primaryEmail: "john@example.com",
    otherEmails5Y: "nao",
    socialMediaAccounts: "Nenhuma",
    primaryJobSector: "Tecnologia",
    primaryJobEntity: "Empresa",
    employedLast5Y: "nao",
    higherEducation: "nao",
    belongsToTribe: "nao",
    fluentLanguages: "Português, Inglês",
    servedMilitary: "nao",
    securityExceptions: "nao",
  };

  it("should validate successfully with correct base data", () => {
    const result = DS160Schema.safeParse(validBaseData);
    expect(result.success).toBe(true);
  });

  it("should fail validation if hasOtherNames is 'sim' but otherNames is empty", () => {
    const data = { ...validBaseData, hasOtherNames: "sim", otherNames: "" };
    const result = DS160Schema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("otherNames"))).toBe(true);
    }
  });

  it("should fail validation if lostPassport is 'sim' but missing explanation", () => {
    const data = { ...validBaseData, lostPassport: "sim", lostPassportNumber: "123", lostPassportExpanation: "" };
    const result = DS160Schema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("lostPassportExpanation"))).toBe(true);
    }
  });

  it("should enforce specific travel plan fields when specificTravelPlan is 'sim'", () => {
    const data = { ...validBaseData, specificTravelPlan: "sim", arrivalDate: "", arrivalCity: "" };
    const result = DS160Schema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("arrivalDate"))).toBe(true);
      expect(result.error.issues.some(i => i.path.includes("arrivalCity"))).toBe(true);
    }
  });

  it("should enforce payer details when payingTrip is not 'eu'", () => {
    const data = { ...validBaseData, payingTrip: "outro", payerName: "", payerRelation: "" };
    const result = DS160Schema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("payerName"))).toBe(true);
      expect(result.error.issues.some(i => i.path.includes("payerRelation"))).toBe(true);
    }
  });

  it("should enforce previous visits details when beenToUS is 'sim'", () => {
    const data = { ...validBaseData, beenToUS: "sim", previousVisitsDetails: "" };
    const result = DS160Schema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("previousVisitsDetails"))).toBe(true);
    }
  });

  it("should enforce security exceptions details when securityExceptions is 'sim'", () => {
    const data = { ...validBaseData, securityExceptions: "sim", securityExceptionsDetails: "" };
    const result = DS160Schema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("securityExceptionsDetails"))).toBe(true);
    }
  });
});
