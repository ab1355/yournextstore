/**
 * Creem.io webhook handler.
 *
 * Required env variables:
 *   CREEM_WEBHOOK_SECRET – Webhook signing secret from https://creem.io/dashboard/webhooks
 *
 * Events handled:
 *   - checkout.completed – a purchase was completed
 *   - grant access       – triggered for new subscriptions / one-time purchases
 *   - revoke access      – triggered when a subscription is cancelled/expired
 *
 * Add your fulfilment logic in the callbacks below.
 */

import { Webhook } from "@creem_io/nextjs";

export const POST = Webhook({
	webhookSecret: process.env.CREEM_WEBHOOK_SECRET ?? "",

	onCheckoutCompleted: async ({ product, customer }) => {
		// A purchase was completed.
		// `product` and `customer` contain the order details.
		console.log("[creem] checkout.completed", product?.id, customer?.email);
	},

	onGrantAccess: async ({ reason, product, customer, metadata }) => {
		// Grant access to the customer's product/subscription.
		// `metadata.referenceId` can be used to link back to your internal user record.
		console.log("[creem] grant access", reason, product?.id, customer?.email, metadata);
	},

	onRevokeAccess: async ({ reason, product, customer, metadata }) => {
		// Revoke access when a subscription is cancelled or expires.
		console.log("[creem] revoke access", reason, product?.id, customer?.email, metadata);
	},
});
