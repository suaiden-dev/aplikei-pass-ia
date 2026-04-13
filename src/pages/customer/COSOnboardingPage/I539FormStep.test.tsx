import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, describe, vi } from 'vitest'
import I539FormStep from './I539FormStep'

const mockProc = {
  id: 'proc-123',
  step_data: {},
} as any

const mockUser = {
  id: 'user-123',
  fullName: 'John Doe',
  phoneNumber: '', // Set to empty to test typing clearly
  email: 'john@example.com',
} as any

const mockOnComplete = vi.fn()

describe('I539FormStep', () => {
  test('should render and have blank Preparer Information by default', () => {
    render(<I539FormStep proc={mockProc} user={mockUser} onComplete={mockOnComplete} />)
    
    // Check Preparer Information fields
    const preparerFamilyName = screen.getByLabelText(/Family Name/i, { selector: '[name="preparerFamilyName"]' })
    const preparerGivenName = screen.getByLabelText(/Given Name/i, { selector: '[name="preparerGivenName"]' })
    
    expect(preparerFamilyName).toHaveValue('')
    expect(preparerGivenName).toHaveValue('')
  })

  test('should apply phone mask correctly', async () => {
    const user = userEvent.setup()
    render(<I539FormStep proc={mockProc} user={mockUser} onComplete={mockOnComplete} />)
    
    const daytimePhone = screen.getByLabelText(/Daytime Phone/i)
    
    // Use clear to ensure we start from empty
    await user.clear(daytimePhone)
    await user.type(daytimePhone, '1234567890')
    expect(daytimePhone).toHaveValue('(123) 456-7890')
  })

  test('should handle date selection correctly', async () => {
    render(<I539FormStep proc={mockProc} user={mockUser} onComplete={mockOnComplete} />)
    
    const dobInput = screen.getByLabelText(/Date of Birth/i)
    
    fireEvent.change(dobInput, { target: { value: '1990-05-15' } })
    expect(dobInput).toHaveValue('1990-05-15')
  })

  test('should show validation errors for invalid data', async () => {
    const user = userEvent.setup()
    render(<I539FormStep proc={mockProc} user={mockUser} onComplete={mockOnComplete} />)
    
    const submitButtons = screen.getAllByRole('button', { name: /Enviar Formulário/i })
    const submitButton = submitButtons[submitButtons.length - 1] // Use the last one (usually the sticky bar)
    
    // Clear required fields
    const familyNameInput = screen.getByLabelText(/Family Name/i, { selector: '[name="familyName"]' })
    await user.clear(familyNameInput)
    
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Family Name is required/i)).toBeInTheDocument()
    })
  })
})
