import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applySuccessfulPayment } from "../../../supabase/functions/_shared/payment-slot-logic";

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  match: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
};

describe('RFE Workflow - Cycles & Payments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly update RFE cycle status to "paid" upon technical proposal payment', async () => {
    const processId = 'proc_123';
    const userId = 'user_456';
    const now = new Date().toISOString();

    // Setup mock data for the process
    const stepData = {
      active_rfe_cycle: 1,
      rfe_cycles: [
        { cycle: 1, status: 'awaiting_payment', started_at: now, result: null }
      ],
      uscis_official_result: 'rfe'
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: processId,
        step_data: stepData,
        service_slug: 'troca-status',
        current_step: 16 // cos_rfe_proposal
      },
      error: null
    });

    // We need to bypass the order resolution in applySuccessfulPayment for this test
    // or mock it to return null/empty
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });

    await applySuccessfulPayment({
      supabase: mockSupabase,
      user_id: userId,
      service_slug: 'proposta-rfe-motion',
      proc_id: processId,
      paid_amount: 1500,
      payment_id: 'pay_789'
    });

    // Check if update was called with correct data
    expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
      current_step: 17, // Advanced from 16
      step_data: expect.objectContaining({
        rfe_proposal_paid: true,
        rfe_cycles: expect.arrayContaining([
          expect.objectContaining({
            cycle: 1,
            status: 'paid'
          })
        ])
      })
    }));
  });

  it('should handle multi-cycle RFE indexing correctly', async () => {
    const processId = 'proc_123';
    const userId = 'user_456';
    const now = new Date().toISOString();

    // Setup mock data for Cycle #2
    const stepData = {
      active_rfe_cycle: 2,
      rfe_cycles: [
        { cycle: 1, status: 'completed', result: 'rfe', closed_at: now },
        { cycle: 2, status: 'awaiting_payment', started_at: now, result: null }
      ],
      uscis_official_result: 'rfe'
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: processId,
        step_data: stepData,
        service_slug: 'extensao-status',
        current_step: 16
      },
      error: null
    });

    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });

    await applySuccessfulPayment({
      supabase: mockSupabase,
      user_id: userId,
      service_slug: 'proposta-rfe-motion',
      proc_id: processId
    });

    // Verify that ONLY Cycle #2 was updated to paid
    const updateCall = mockSupabase.update.mock.calls.find(call => call[0].step_data?.rfe_cycles);
    expect(updateCall).toBeDefined();
    const updatedCycles = updateCall![0].step_data.rfe_cycles;

    expect(updatedCycles[0].status).toBe('completed'); // Cycle 1 remains completed
    expect(updatedCycles[1].status).toBe('paid');      // Cycle 2 becomes paid
  });
});
