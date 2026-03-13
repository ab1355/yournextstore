/**
 * Flexprice webhook handler.
 *
 * Flexprice uses Stripe webhooks under the hood. Configure your Stripe webhook
 * endpoint (https://dashboard.stripe.com/webhooks) to point to this route and
 * add the signing secret to FLEXPRICE_WEBHOOK_SECRET.
 *
 * Required env variables:
 *   FLEXPRICE_WEBHOOK_SECRET – Stripe webhook signing secret for Flexprice events
 *
 * Alternatively, if Flexprice provides its own webhook endpoint in the future,
 * update this handler accordingly.
 */

import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const webhookSecret = process.env.FLEXPRICE_WEBHOOK_SECRET;
	if (!webhookSecret) {
		return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
	}

	const body = await request.text();
	const signature = request.headers.get("stripe-signature") ?? "";

	if (!signature) {
		return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
	}

	// ⚠️  SECURITY: Verify the Stripe webhook signature before processing events.
	//
	// Install the `stripe` package and uncomment the block below:
	//
	//   import Stripe from "stripe";
	//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
	//   let event: Stripe.Event;
	//   try {
	//     event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	//   } catch (err) {
	//     return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	//   }
	//
	// See https://docs.flexprice.io/integrations/stripe/payment-links for details.
	try {
		const event = JSON.parse(body) as { type: string; id: string };
		console.log("[flexprice] webhook event", event.type, event.id);

		// Add your fulfilment logic here based on event.type.
		// Common events: payment_intent.succeeded, invoice.paid, customer.subscription.created

		return NextResponse.json({ received: true });
	} catch (err) {
		console.error("[flexprice] webhook error", err);
		return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
	}
}
