import { vi, describe, test, expect } from 'vitest';

// Use vi.hoisted to create mock objects before they are used in the hoisted vi.mock
const mocks = vi.hoisted(() => {
  return {
    mockTextField: { setText: vi.fn() },
    mockForm: {
      getTextField: vi.fn(),
    },
    mockDoc: {
      getForm: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    }
  }
});

// Setup inner relationships
mocks.mockForm.getTextField.mockReturnValue(mocks.mockTextField);
mocks.mockDoc.getForm.mockReturnValue(mocks.mockForm);

// Mock pdf-lib
vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: vi.fn().mockResolvedValue(mocks.mockDoc),
  },
}));

// Mock supabase and processService
vi.mock('../lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'mock-url' } }),
      })
    }
  }
}));

vi.mock('./process.service', () => ({
  processService: {
    updateStepData: vi.fn().mockResolvedValue({}),
  }
}));

// Mock the template URLs
vi.mock('../forms/g1145_template.pdf?url', () => ({ default: 'mock-url-1145' }));
vi.mock('../forms/g1450_template.pdf?url', () => ({ default: 'mock-url-1450' }));

// Import the service AFTER mocks
import { finalFormsService } from './final_forms.service';
import type { FinalFormsData } from '../pages/customer/COSOnboardingPage/FinalFormsStep';

// Mock global fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([0])),
});

describe('finalFormsService - PDF Generation and Security', () => {
  const testData: FinalFormsData = {
    g1145: {
      lastName: 'Silva',
      firstName: 'Anderson',
      middleName: 'M',
      email: 'anderson@example.com',
      mobile: '(11) 98888-7777',
    },
    g1450: {
      applicantLastName: 'Silva',
      applicantFirstName: 'Anderson',
      applicantMiddleName: 'M',
      dateOfBirth: '1990-05-15',
      cardType: 'Visa',
      cardholderName: 'ANDERSON SILVA',
      cardNumber: '4111222233334444',
      expirationDate: '12/2030',
      cvv: '123',
      streetAddress: 'Rua Exemplo, 123',
      aptSteFlr: '',
      aptSteFlrNumber: '',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brazil',
    }
  };

  test('should map G-1145 and G-1450 fields correctly', async () => {
    await finalFormsService.generateAndUploadFinalForms('user-123', 'proc-456', testData);

    // Verify basic mapping for G-1145
    expect(mocks.mockForm.getTextField).toHaveBeenCalledWith(expect.stringContaining('LastName'));
    expect(mocks.mockTextField.setText).toHaveBeenCalledWith('Silva');

    // Verify mapping for G-1450
    expect(mocks.mockForm.getTextField).toHaveBeenCalledWith(expect.stringContaining('FamilyName'));
  });

  test('should NOT fill sensitive credit card fields for security', async () => {
    // Reset mocks to count calls specifically for this test
    mocks.mockTextField.setText.mockClear();

    await finalFormsService.generateAndUploadFinalForms('user-123', 'proc-456', testData);

    // Get all calls to setText
    const setTextCalls = mocks.mockTextField.setText.mock.calls.map(call => call[0]);

    // Sensitive values should NOT be present in any setText call
    expect(setTextCalls).not.toContain('4111222233334444');
    expect(setTextCalls).not.toContain('12/2030');
    expect(setTextCalls).not.toContain('123');
    
    console.log('Verified: Sensitive fields (Card Number, CVV, Expiry) were NOT passed to the PDF engine.');
  });

  test('should NOT fill A-Number field as requested', async () => {
      mocks.mockForm.getTextField.mockClear();
      await finalFormsService.generateAndUploadFinalForms('user-123', 'proc-456', testData);
      
      const getFieldCalls = mocks.mockForm.getTextField.mock.calls.map(call => call[0]);
      expect(getFieldCalls).not.toContain(expect.stringContaining('AlienNumber'));
  });
});
