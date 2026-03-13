/**
 * Creem.io checkout route handler.
 *
 * This route is called by the /checkout page to create a hosted checkout
 * session on Creem.io. Pass a `productId` query parameter to specify the
 * Creem product to purchase, and optionally a `referenceId` for tracking.
 *
 * Required env variables:
 *   CREEM_API_KEY       – Creem API key (from https://creem.io/dashboard)
 *   CREEM_SUCCESS_URL   – Absolute URL to redirect to after a successful payment
 *                         (defaults to {NEXT_PUBLIC_APP_URL}/checkout/success)
 */

import { Checkout } from "@creem_io/nextjs";

export const GET = Checkout({
	apiKey: process.env.CREEM_API_KEY ?? "",
	testMode: process.env.NODE_ENV !== "production",
	defaultSuccessUrl:
		process.env.CREEM_SUCCESS_URL ?? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/checkout/success`,
});
