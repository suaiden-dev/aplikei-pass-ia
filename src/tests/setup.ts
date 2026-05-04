import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock toast from sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock process service
vi.mock('../features/process/lib/processOps', () => ({
  updateStepData: vi.fn().mockResolvedValue({}),
}))

// Mock I539 service
vi.mock('../features/onboarding/cos/lib/i539', () => ({
  fillI539Form: vi.fn().mockResolvedValue(new Uint8Array()),
  uploadFilledI539: vi.fn().mockResolvedValue('https://mock-pdf-url.com'),
}))

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn()
