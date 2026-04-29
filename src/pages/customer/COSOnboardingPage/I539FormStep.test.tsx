import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, describe, vi } from 'vitest'
import I539FormStep from './I539FormStep'
import { LanguageProvider } from '../../../i18n/LanguageContext'

const mockProc = {
  id: 'proc-123',
  step_data: {
    targetVisa: 'F-1 (Academic Student)',
    i539: {
      streetName: '123 Main St',
      city: 'Orlando',
      state: 'FL',
      zipCode: '32801',
      dateOfBirth: '05/15/1990',
      countryOfCitizenship: 'Brazil',
      countryOfBirth: 'Brazil',
      dateOfArrival: '01/10/2024',
      i94Number: '12345678901',
      passportNumber: 'AB123456',
      passportExpirationDate: '05/15/2030',
      currentStatus: 'B-2',
      newStatusDropdown: 'F-1 (Academic Student)',
      daytimePhone: '(321) 555-1234',
      email: 'john@example.com',
    },
  },
}

const mockUser = {
  id: 'user-123',
  fullName: 'John Doe',
  phoneNumber: '', // Set to empty to test typing clearly
  email: 'john@example.com',
}

const mockOnComplete = vi.fn()

vi.mock('../../../i18n', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useT: () => {
    // Return a mock object that matches the usage in I539FormStep
    return {
      cos: {
        i539: {
          labels: {
            fullLegalName: "Full Legal Name", // Added missing keys
            identifiers: "Identifiers",
            familyName: "Family Name",
            givenName: "Given Name",
            middleName: "Middle Name",
            hasMiddleName: "Has Middle Name",
            alienNumber: "Alien Registration Number",
            uscisOnlineAccount: "USCIS Online Account",
            mailingAddress: "Mailing Address",
            physicalAddress: "Physical Address",
            inCareOf: "In Care Of",
            streetName: "Street Name",
            unitType: "Unit Type",
            unitNumber: "Unit Number",
            city: "City",
            state: "State",
            zipCode: "ZIP Code",
            sameAddress: "Same Address",
            foreignAddress: "Foreign Address",
            country: "Country",
            province: "Province",
            postalCode: "Postal Code",
            foreignStreet: "Foreign Street",
            travelId: "Travel ID",
            dob: "Date of Birth",
            citizenship: "Citizenship",
            birthCountry: "Birth Country",
            ssn: "SSN",
            arrivalDate: "Arrival Date",
            i94Number: "I-94 Number",
            passportNumber: "Passport Number",
            passportIssuance: "Passport Issuance",
            passportExp: "Passport Expiration Date",
            currentStatus: "Current Status",
            statusExp: "Status Expiration Date",
            durationStatus: "Duration of Status",
            changeStatus: "Change of Status",
            newStatusRequested: "New Status Requested",
            effectiveDate: "Effective Date",
            processingInfo: "Processing Info",
            priorExtensionQuery: "Prior Extension Query",
            priorExtensionDate: "Prior Extension Date",
            immigrantPetitionQuery: "Immigrant Petition Query",
            petitionDate: "Petition Date",
            receiptNumber: "Receipt Number",
            q3: "Question 3",
            q4: "Question 4",
            q5: "Question 5",
            securityInfo: "Security Info",
            contactInfo: "Contact Info",
            daytimePhone: "Daytime Phone",
            mobilePhone: "Mobile Phone",
            email: "Email",
            signature: "Signature",
            date: "Date",
            interpreterInfo: "Interpreter Info",
            language: "Language",
            preparerInfo: "Preparer Info",
            business: "Business",
            fax: "Fax"
          },
          securityQuestions: {
            q6: "Q6", q7: "Q7", q8: "Q8", q9: "Q9", q10: "Q10",
            q11: "Q11", q12: "Q12", q13: "Q13", q14: "Q14", q15: "Q15",
            q16: "Q16", q17: "Q17", q18: "Q18", q19: "Q19", q20: "Q20"
          },
          sections: {
            part1: "Part 1",
            part2: "Part 2",
            part3: "Part 3",
            part4: "Part 4",
            part5: "Part 5",
            part6: "Part 6",
            part7: "Part 7"
          },
          tooltips: {},
          toasts: {
            success: "Success",
            error: "Error",
            draftSaved: "Draft Saved",
            draftError: "Draft Error",
            checkFields: "Check fields: {errorList}"
          }
        },
        form: {
          dependents: {
            select: "Select..."
          }
        }
      }
    };
  },
  useLocale: () => ({ lang: 'en', setLang: vi.fn(), isLanguageLoading: false })
}))

describe('I539FormStep', () => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  })
  vi.stubGlobal('scrollTo', vi.fn())

  async function goToStep(stepNumber: number) {
    const user = userEvent.setup()

    for (let current = 1; current < stepNumber; current += 1) {
      await user.click(screen.getByRole('button', { name: /Proxima etapa/i }))
    }
  }

  test('should render and have blank Preparer Information by default', async () => {
    render(
      <LanguageProvider>
        <I539FormStep proc={mockProc} user={mockUser} onComplete={mockOnComplete} />
      </LanguageProvider>
    )

    await goToStep(5)

    const preparerFamilyName = document.querySelector('input[name="preparerFamilyName"]') as HTMLInputElement
    const preparerGivenName = document.querySelector('input[name="preparerGivenName"]') as HTMLInputElement

    expect(preparerFamilyName).toHaveValue('')
    expect(preparerGivenName).toHaveValue('')
  })

  test('should apply phone mask correctly', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider>
        <I539FormStep proc={mockProc} user={mockUser} onComplete={mockOnComplete} />
      </LanguageProvider>
    )

    await goToStep(5)

    const daytimePhone = document.querySelector('input[name="daytimePhone"]') as HTMLInputElement

    await user.clear(daytimePhone)
    await user.type(daytimePhone, '1234567890')
    expect(daytimePhone).toHaveValue('(123) 456-7890')
  })

  test('should handle date selection correctly', async () => {
    render(
      <LanguageProvider>
        <I539FormStep proc={mockProc} user={mockUser} onComplete={mockOnComplete} />
      </LanguageProvider>
    )

    await goToStep(2)

    const dobInput = document.querySelector('input[name="dateOfBirth"]') as HTMLInputElement

    fireEvent.change(dobInput, { target: { value: '1990-05-15' } })
    expect(dobInput).toHaveValue('1990-05-15')
  })

  test('should show validation errors for invalid data', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider>
        <I539FormStep proc={mockProc} user={mockUser} onComplete={mockOnComplete} />
      </LanguageProvider>
    )

    const nextButton = screen.getByRole('button', { name: /Proxima etapa/i })
    const familyNameInput = screen.getByLabelText(/Family Name/i, { selector: '[name="familyName"]' })
    await user.clear(familyNameInput)

    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Family Name is required/i)).toBeInTheDocument()
    })
  })
})
