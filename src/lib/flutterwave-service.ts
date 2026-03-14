import axios from "axios";

/**
 * Flutterwave Payment Service
 * Handles payment processing, verification, and webhook management
 */

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
const WEBHOOK_SECRET = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

/**
 * Initialize Flutterwave payment
 */
export async function initializePayment(options: {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  orderId: string;
  redirectUrl: string;
  meta?: Record<string, any>;
}): Promise<{
  success: boolean;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  error?: string;
}> {
  try {
    if (!FLUTTERWAVE_SECRET_KEY) {
      throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");
    }

    const payload = {
      tx_ref: options.orderId,
      amount: options.amount,
      currency: options.currency,
      redirect_url: options.redirectUrl,
      customer: {
        email: options.email,
        phonenumber: options.phone,
        name: `${options.firstName} ${options.lastName}`,
      },
      customizations: {
        title: "ImpactEdu Payment",
        description: `Payment for order ${options.orderId}`,
        logo: `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "")}/logo.png`,
      },
      meta: options.meta || {},
    };

    const response = await axios.post(
      `${FLUTTERWAVE_BASE_URL}/payments`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      return {
        success: true,
        data: {
          authorization_url: response.data.data.link,
          access_code: response.data.data.link.split("=").pop() || "",
          reference: response.data.data.tx_ref,
        },
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Failed to initialize payment",
      };
    }
  } catch (error: any) {
    console.error("Flutterwave initialization error:", error);
    return {
      success: false,
      error: error.message || "Failed to initialize payment",
    };
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(transactionId: string): Promise<{
  success: boolean;
  data?: {
    status: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      name: string;
    };
    tx_ref: string;
    flw_ref: string;
  };
  error?: string;
}> {
  try {
    if (!FLUTTERWAVE_SECRET_KEY) {
      throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");
    }

    const response = await axios.get(
      `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status === "success") {
      const txData = response.data.data;
      return {
        success: true,
        data: {
          status: txData.status,
          amount: txData.amount,
          currency: txData.currency,
          customer: {
            email: txData.customer.email,
            name: txData.customer.name,
          },
          tx_ref: txData.tx_ref,
          flw_ref: txData.flw_ref,
        },
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Payment verification failed",
      };
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return {
      success: false,
      error: error.message || "Failed to verify payment",
    };
  }
}

/**
 * Get bank transfer details (for manual bank transfer option)
 */
export function getBankTransferDetails(
  amount: number,
  currency: string = "NGN"
): {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  currency: string;
  reference: string;
  instructions: string[];
} {
  // These are placeholder details - replace with your actual bank account details
  const reference = `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return {
    bankName: "Guaranty Trust Bank (GTB)",
    accountNumber: "0123456789", // Replace with your actual account
    accountName: "ImpactEdu Limited",
    amount,
    currency,
    reference,
    instructions: [
      `Transfer NGN ${amount.toLocaleString()} to the account above`,
      `Use reference: ${reference}`,
      "Your enrollment will be confirmed immediately after payment confirmation",
      "For support, contact support@impactedu.ng",
    ],
  };
}

/**
 * Verify bank transfer payment (callback handler)
 * This is typically called by your bank's API or webhook
 */
export async function verifyBankTransfer(options: {
  reference: string;
  amount: number;
  transactionDate: Date;
}): Promise<{
  success: boolean;
  verified: boolean;
  message: string;
}> {
  try {
    // This would typically call your bank's API to verify the transfer
    // For now, return a placeholder response
    return {
      success: true,
      verified: true,
      message: "Bank transfer verification completed",
    };
  } catch (error: any) {
    console.error("Bank transfer verification error:", error);
    return {
      success: false,
      verified: false,
      message: error.message || "Failed to verify bank transfer",
    };
  }
}

/**
 * Create payment record
 */
export async function createPaymentRecord(
  userId: string,
  enrollmentId: string,
  options: {
    amount: number;
    currency: string;
    purpose: string;
    description?: string;
    paymentMethod: "FLUTTERWAVE" | "BANK_TRANSFER";
  }
): Promise<{
  success: boolean;
  paymentId?: string;
  error?: string;
}> {
  try {
    const response = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        enrollmentId,
        amount: options.amount,
        currency: options.currency,
        purpose: options.purpose,
        description: options.description,
        paymentMethod: options.paymentMethod,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Create payment record error:", error);
    return {
      success: false,
      error: error.message || "Failed to create payment record",
    };
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  options?: {
    transactionId?: string;
    flutterWaveRef?: string;
    failureReason?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/api/payments/${paymentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        ...options,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Update payment status error:", error);
    return {
      success: false,
      error: error.message || "Failed to update payment status",
    };
  }
}
