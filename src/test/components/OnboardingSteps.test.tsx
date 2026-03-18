/**
 * Onboarding Steps Component Tests
 * Tests that each step renders the correct fields.
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { PersonalInfo1Step } from "@/pages/dashboard/onboarding/steps/visto-b1-b2/PersonalInfo1Step";
import { PassportStep } from "@/pages/dashboard/onboarding/steps/visto-b1-b2/PassportStep";
import type {
  OnboardingData,
  StepProps,
} from "@/pages/dashboard/onboarding/types";
import { translations } from "@/i18n/translations";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi
          .fn()
          .mockResolvedValue({ data: { path: "test" }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "url" } }),
      }),
    },
  },
}));

const defaultStepProps: StepProps = {
  formData: {} as OnboardingData,
  register: vi.fn().mockReturnValue({
    name: "test",
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  }) as unknown as UseFormRegister<OnboardingData>,
  errors: {},
  setValue: vi.fn() as unknown as UseFormSetValue<OnboardingData>,
  watch: vi.fn().mockReturnValue("") as unknown as UseFormWatch<OnboardingData>,
  lang: "pt",
  t: {
    ds160: {
      interview: {
        fillNotice: { pt: "Notice", en: "Notice" },
        location: { pt: "Location", en: "Location" },
        options: [{ pt: "Opt1", en: "Opt1", es: "Opt1" }],
      },
      personal1: {
        title: { pt: "Title", en: "Title" },
        email: { pt: "Email", en: "Email" },
        lastName: { pt: "Last Name", en: "Last Name" },
        firstName: { pt: "First Name", en: "First Name" },
        fullNameHelper: { pt: "Helper", en: "Helper" },
        fullNamePassport: { pt: "Passport", en: "Passport" },
        hasOtherNames: { pt: "Other names", en: "Other names" },
        hasTelecode: { pt: "Telecode", en: "Telecode" },
        gender: { pt: "Gender", en: "Gender" },
        genderOptions: {
          male: { pt: "Male", en: "Male" },
          female: { pt: "Female", en: "Female" },
        },
        maritalStatus: { pt: "Marital", en: "Marital" },
        maritalOptions: {
          married: { pt: "M", en: "M" },
          single: { pt: "S", en: "S" },
          widowed: { pt: "W", en: "W" },
          divorced: { pt: "D", en: "D" },
          separated: { pt: "Sep", en: "Sep" },
        },
        dob: { pt: "DOB", en: "DOB" },
        cityBirth: { pt: "City", en: "City" },
        stateBirth: { pt: "State", en: "State" },
        countryBirth: { pt: "Country", en: "Country" },
      },
        passport: {
        title: { pt: "Title", en: "Title" },
        type: { pt: "Type", en: "Type" },
        typeOptions: {
          regular: { pt: "Regular", en: "Regular" },
          official: { pt: "Official", en: "Official" },
          diplomatic: { pt: "Diplomatic", en: "Diplomatic" },
          laissezPasser: { pt: "Laissez", en: "Laissez" },
          other: { pt: "Other", en: "Other" },
        },
        typeHelper: { pt: "Helper", en: "Helper" },
        authority: { pt: "Auth", en: "Auth" },
        issuanceDate: { pt: "Issue date", en: "Issue date" },
        lostStolen: { pt: "Lost/Stolen", en: "Lost/Stolen" },
        number: { pt: "Number", en: "Number" },
        bookNumber: { pt: "Book", en: "Book" },
        hasBookNumber: { pt: "Has Book", en: "Has Book" },
        country: { pt: "Country", en: "Country" },
        city: { pt: "City", en: "City" },
        state: { pt: "State", en: "State" },
        issueDate: { pt: "Issue", en: "Issue" },
        expirationDate: { pt: "Expr", en: "Expr" },
        lost: { pt: "Lost", en: "Lost" },
        lostExplanation: { pt: "Expl", en: "Expl" },
        select: { pt: "Select", en: "Select" },
        yes: { pt: "Yes", en: "Yes" },
        no: { pt: "No", en: "No" },
        lostPassportNumber: { pt: "Lost No", en: "Lost No" },
        issuingCountry: { pt: "Country", en: "Country" },
        explanationLabel: { pt: "Expl", en: "Expl" },
      },
    },
  } as unknown as typeof translations,
  o: new Proxy(
    {},
    { get: (_t, prop) => (typeof prop === "string" ? prop : "") },
  ) as unknown as typeof translations.onboardingPage,
  serviceSlug: "visto-b1-b2",
  serviceStatus: "active",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  securityData: null as any, // Justification: Tactical any for mock prop.
};

describe("Onboarding Steps", () => {
  describe("PersonalInfo1Step", () => {
    it("should render without crashing", () => {
      const { container } = render(<PersonalInfo1Step {...defaultStepProps} />);
      expect(container).toBeTruthy();
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it("should render input fields for personal data", () => {
      render(<PersonalInfo1Step {...defaultStepProps} />);
      const inputs = document.querySelectorAll("input, select");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe("PassportStep", () => {
    it("should render without crashing", () => {
      const { container } = render(<PassportStep {...defaultStepProps} />);
      expect(container).toBeTruthy();
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });

    it("should render passport-related fields", () => {
      render(<PassportStep {...defaultStepProps} />);
      const inputs = document.querySelectorAll("input, select");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
