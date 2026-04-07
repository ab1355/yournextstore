/**
 * /checkout — unified checkout entry point.
 *
 * When a new payment provider is configured (PAYMENT_PROVIDER env var), this
 * page reads the cart from the cookie, builds provider-specific checkout
 * query parameters, and redirects to the appropriate checkout API route.
 *
 * Supported providers:
 *   polar      → /api/checkout/polar?productPriceId=...
 *   creem      → /api/checkout/creem?productId=...
 *   flexprice  → /api/checkout/flexprice  (creates invoice + payment link)
 *   x402       → /api/checkout/x402       (HTTP 402 / USDC payment, no product mapping needed)
 *
 * Product ID mapping:
 *   Polar and Creem require their own product/price IDs.
 *   Configure a JSON mapping in the PRODUCT_ID_MAP environment variable:
 *
 *   PRODUCT_ID_MAP='{"<yns_variant_id>":{"polar":"<polar_price_id>","creem":"<creem_product_id>"}}'
 *
 *   Flexprice and x402 compute the total dynamically from the cart, so no
 *   product mapping is needed for those providers.
 *
 * If PAYMENT_PROVIDER is not set the YNS/Stripe proxy handles the request
 * and this file is never rendered (proxy.ts returns NextResponse.rewrite).
 */

import { notFound, redirect } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { getCartCookieJson } from "@/lib/cookies";
import { getPaymentProvider } from "@/lib/payment-providers";

type ProductIdMap = Record<string, { polar?: string; creem?: string }>;

function getProductIdMap(): ProductIdMap {
	const raw = process.env.PRODUCT_ID_MAP;
	if (!raw) return {};
	try {
		return JSON.parse(raw) as ProductIdMap;
	} catch {
		return {};
	}
}

export default async function CheckoutPage() {
	const provider = getPaymentProvider();
	if (!provider) {
		// Fallback: if no provider is configured, this page should not be reached.
		notFound();
	}

	const cartCookie = await getCartCookieJson();
	if (!cartCookie?.id) {
		redirect("/");
	}

	const cart = await commerce.cartGet({ cartId: cartCookie.id });
	if (!cart?.lineItems.length) {
		redirect("/");
	}

	const productIdMap = getProductIdMap();

	if (provider === "polar") {
		// Build a URL to the Polar checkout API route.
		// For multi-item carts, Polar supports multiple `productPriceId` params.
		const params = new URLSearchParams();
		for (const item of cart.lineItems) {
			const polarPriceId = productIdMap[item.productVariant.id]?.polar;
			if (polarPriceId) {
				Array.from({ length: item.quantity }, () => params.append("productPriceId", polarPriceId));
			}
		}
		redirect(`/api/checkout/polar?${params.toString()}`);
	}

	if (provider === "creem") {
		// Creem supports a single productId per checkout session.
		// Use the first cart item's mapped product ID.
		const firstItem = cart.lineItems[0];
		if (!firstItem) redirect("/");
		const creemProductId = productIdMap[firstItem.productVariant.id]?.creem;
		if (creemProductId) {
			redirect(`/api/checkout/creem?productId=${encodeURIComponent(creemProductId)}`);
		}
		// Fall back to the route without a product ID (Creem will show product selection).
		redirect("/api/checkout/creem");
	}

	if (provider === "flexprice") {
		// Flexprice checkout is handled entirely server-side in its API route.
		redirect("/api/checkout/flexprice");
	}

	if (provider === "x402") {
		// x402 checkout: the API route computes the cart total and requires a
		// USDC payment via the HTTP 402 protocol before redirecting to success.
		redirect("/api/checkout/x402");
	}

	redirect("/");
}
