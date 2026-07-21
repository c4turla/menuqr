import { NextRequest, NextResponse } from "next/server";
import {
  handlePaymentCompleted,
  handlePaymentFailed,
  handlePaymentExpired,
} from "@/server/services/payment-service";

// ── Verify Webhook Token ────────────────────────────────
function verifyWebhookToken(request: NextRequest): boolean {
  const expected = process.env.SUMOPOD_WEBHOOK_TOKEN;
  if (!expected) {
    console.error("[Webhook] SUMOPOD_WEBHOOK_TOKEN not configured");
    return false;
  }
  const received = request.headers.get("x-webhook-token");
  return expected === received;
}

// ── POST /api/webhooks/sumopod ──────────────────────────
export async function POST(request: NextRequest) {
  // Verify webhook token
  if (!verifyWebhookToken(request)) {
    console.error("[Webhook] Invalid webhook token");
    return NextResponse.json(
      { error: "Invalid webhook token" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const eventType = body.event_type;
    const data = body.data;

    if (!eventType || !data) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Received event: ${eventType} for order: ${data.order_id}`);

    switch (eventType) {
      case "payment.completed":
        console.log("Calling handlePaymentCompleted with data:", data);
        await handlePaymentCompleted(data);
        console.log("handlePaymentCompleted done.");
        break;
      case "payment.failed":
        await handlePaymentFailed(data);
        break;
      case "payment.expired":
        await handlePaymentExpired(data);
        break;
      case "payment.test":
        console.log("[Webhook] Test event received successfully");
        break;
      default:
        console.log(`[Webhook] Unknown event type: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
