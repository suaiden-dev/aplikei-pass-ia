import { vi, describe, test, expect } from 'vitest'

// Ensure we are testing the real service, not the mock from setup.ts
vi.unmock('./i539.service')

// Use vi.hoisted to create mock objects before they are used in the hoisted vi.mock
const mocks = vi.hoisted(() => {
  return {
    mockTextField: { setText: vi.fn() },
    mockCheckBox: { check: vi.fn(), uncheck: vi.fn() },
    mockDropdown: { select: vi.fn() },
    mockForm: {
      getTextField: vi.fn(),
      getCheckBox: vi.fn(),
      getDropdown: vi.fn(),
    },
    mockDoc: {
      getForm: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    }
  }
})

// Setup inner relationships
mocks.mockForm.getTextField.mockReturnValue(mocks.mockTextField)
mocks.mockForm.getCheckBox.mockReturnValue(mocks.mockCheckBox)
mocks.mockForm.getDropdown.mockReturnValue(mocks.mockDropdown)
mocks.mockDoc.getForm.mockReturnValue(mocks.mockForm)

// Mock pdf-lib
vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: vi.fn().mockResolvedValue(mocks.mockDoc),
  },
}))

vi.mock('../lib/supabase', () => ({ supabase: { storage: {} } }))
vi.mock('../forms/i539_template.pdf?url', () => ({ default: 'mock-url' }))

// Import the service
import { fillI539Form, type I539Data } from './i539.service'

describe('i539.service - PDF Mapping', () => {
  test('should map fields correctly to PDF positions', async () => {
    const testData: I539Data = {
      familyName: 'Silva',
      givenName: 'Anderson',
      applicationType: 'change',
    }

    await fillI539Form(testData, new Uint8Array([0]))

    // Verify mapping
    expect(mocks.mockForm.getTextField).toHaveBeenCalledWith(expect.stringContaining('P1Line1a_FamilyName'))
    expect(mocks.mockTextField.setText).toHaveBeenCalledWith('Silva')
    
    expect(mocks.mockForm.getCheckBox).toHaveBeenCalledWith(expect.stringContaining('P2_checkbox4[1]'))
    expect(mocks.mockCheckBox.check).toHaveBeenCalled()
  })
})
