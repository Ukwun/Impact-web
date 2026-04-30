import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/paypal-service";

/**
 * POST /api/payments/paypal/checkout
 * Create a PayPal order and return approval URL
 */
export async function POST(request: NextRequest) {
  try {
    const { amount, currency } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:3000";
    const returnUrl = `${baseUrl}/payments/paypal/success`;
    const cancelUrl = `${baseUrl}/payments/paypal/cancel`;
    const order = await createOrder({ amount, currency, returnUrl, cancelUrl });
    const approvalUrl = order.links?.find((l: any) => l.rel === "approve")?.href;
    if (!approvalUrl) {
      return NextResponse.json({ success: false, error: "No approval URL returned from PayPal" }, { status: 500 });
    }
    return NextResponse.json({ success: true, approvalUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to create PayPal order" }, { status: 500 });
  }
}
