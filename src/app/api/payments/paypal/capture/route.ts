import { NextRequest, NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal-service";

/**
 * GET /api/payments/paypal/capture?orderId=...
 * Capture a PayPal order after approval
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
    }
    const result = await captureOrder(orderId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to capture PayPal order" }, { status: 500 });
  }
}
