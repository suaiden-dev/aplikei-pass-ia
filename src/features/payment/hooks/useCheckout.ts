import { useState } from "react";
import {
  createStripeCheckout,
  createParcelowCheckout,
  uploadZelleProof,
  createZellePayment,
  type StripeCheckoutParams,
  type ParcelowCheckoutParams,
} from "../lib/paymentOps";

interface ZelleParams {
  slug: string;
  serviceName: string;
  expectedAmount: number;
  amount: number;
  confirmationCode: string;
  paymentDate: string;
  proofFile: File;
  guestEmail: string;
  guestName: string;
  phone?: string;
  userId?: string | null;
  dependents?: number;
  proc_id?: string;
  coupon_code?: string;
}

export function useCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);

  const stripe = async (params: StripeCheckoutParams): Promise<{ url: string; orderId?: string }> => {
    setIsProcessing(true);
    try {
      return await createStripeCheckout(params);
    } finally {
      setIsProcessing(false);
    }
  };

  const parcelow = async (params: ParcelowCheckoutParams): Promise<{ url: string; orderId?: string }> => {
    setIsProcessing(true);
    try {
      return await createParcelowCheckout(params);
    } finally {
      setIsProcessing(false);
    }
  };

  const zelle = async (params: ZelleParams): Promise<{ paymentId: string; autoApproved: boolean }> => {
    setIsProcessing(true);
    try {
      const proofPath = await uploadZelleProof(params.proofFile, params.slug);
      return await createZellePayment({ ...params, proofPath });
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, stripe, parcelow, zelle };
}
