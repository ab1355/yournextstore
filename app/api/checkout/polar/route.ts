/**
 * Polar.sh checkout route handler.
 *
 * This route is called by the /checkout page to create a hosted checkout
 * session on Polar.sh. It forwards request query parameters (e.g.
 * `productPriceId`, `productId`, `customerEmail`) to the Polar Checkout API.
 *
 * Required env variables:
 *   POLAR_ACCESS_TOKEN  – Polar API access token (from https://polar.sh/settings)
 *   POLAR_SUCCESS_URL   – Absolute URL to redirect to after a successful payment
 *                         (defaults to {NEXT_PUBLIC_APP_URL}/checkout/success)
 *   POLAR_SERVER        – "sandbox" (default) or "production"
 */

import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
	accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
	successUrl: process.env.POLAR_SUCCESS_URL ?? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/checkout/success`,
	server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
	includeCheckoutId: true,
});
