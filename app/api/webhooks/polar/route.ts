/**
 * Polar.sh webhook handler.
 *
 * Required env variables:
 *   POLAR_WEBHOOK_SECRET – Webhook signing secret from https://polar.sh/settings/webhooks
 *
 * Events handled:
 *   - checkout.created  – a checkout session was created
 *   - order.created     – a one-time order was placed
 *   - order.paid        – payment confirmed for an order
 *   - subscription.active – a subscription became active
 *
 * Add your fulfilment logic in the event handlers below.
 */

import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",

	onCheckoutCreated: async (payload) => {
		// A checkout session was created.
		// payload.data contains the Checkout object.
		console.log("[polar] checkout.created", payload.data.id);
	},

	onOrderCreated: async (payload) => {
		// A one-time order was placed.
		// Add order fulfilment logic here (e.g. send a digital download link).
		console.log("[polar] order.created", payload.data.id);
	},

	onOrderPaid: async (payload) => {
		// Payment was confirmed for an order.
		console.log("[polar] order.paid", payload.data.id);
	},

	onSubscriptionActive: async (payload) => {
		// A subscription became active.
		// Grant access to the subscriber here.
		console.log("[polar] subscription.active", payload.data.id);
	},
});
