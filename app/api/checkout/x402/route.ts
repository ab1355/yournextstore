/**
 * x402 checkout route handler.
 *
 * Protected by the x402 payment protocol: the client must pay the cart total
 * in USDC on Base (or Base Sepolia for testing) before being redirected to the
 * order success page. The payment amount is computed dynamically from the cart
 * stored in the `yns_cart` cookie, so no product ID mapping is required.
 *
 * How it works:
 *   1. Client (browser wallet or x402-capable agent) calls GET /api/checkout/x402.
 *   2. x402 reads the route config (dynamic price = cart total in USDC) and, if
 *      no valid X-PAYMENT header is present, returns HTTP 402 with payment details.
 *   3. Client settles the payment via the configured facilitator and retries the
 *      request with the X-PAYMENT header.
 *   4. x402 verifies the payment, then the handler runs and redirects the client
 *      to the success URL.
 *
 * Required env variables:
 *   X402_WALLET_ADDRESS   – EVM wallet address that receives the USDC payment
 *                           (e.g. "0xYourWalletAddress")
 *
 * Optional env variables:
 *   X402_NETWORK          – Payment network (default: "base-sepolia")
 *                           Use "base" for mainnet USDC payments.
 *   X402_FACILITATOR_URL  – Facilitator URL (default: https://x402.org/facilitator)
 *   X402_SUCCESS_URL      – Redirect URL after successful payment
 *                           (defaults to NEXT_PUBLIC_APP_URL/checkout/success)
 *   X402_CDP_CLIENT_KEY   – CDP client key for the built-in browser paywall UI
 *   X402_APP_NAME         – App name shown in the paywall UI
 *                           (defaults to "Your Next Store")
 */

import { type NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";
import { commerce } from "@/lib/commerce";
import { CART_COOKIE } from "@/lib/cookies";

async function handler(request: NextRequest) {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
	const successUrl = process.env.X402_SUCCESS_URL ?? `${appUrl}/checkout/success`;
	return NextResponse.redirect(successUrl);
}

/** Compute the cart total in USDC from the request's cart cookie. */
async function getRouteConfig(req: NextRequest) {
	// Validate that a receiving wallet address has been configured.
	if (!process.env.X402_WALLET_ADDRESS) {
		throw new Error("X402_WALLET_ADDRESS environment variable is not set.");
	}

	// Read cart cookie directly from the request to avoid any context issues.
	const cartCookieRaw = req.cookies.get(CART_COOKIE)?.value;

	let totalMinorUnits = BigInt(0);

	if (cartCookieRaw) {
		try {
			const cartCookie = JSON.parse(cartCookieRaw) as { id?: string };
			if (cartCookie?.id) {
				const cart = await commerce.cartGet({ cartId: cartCookie.id });
				if (cart?.lineItems.length) {
					totalMinorUnits = cart.lineItems.reduce(
						(sum, item) => sum + BigInt(item.productVariant.price) * BigInt(item.quantity),
						BigInt(0),
					);
				}
			}
		} catch {
			// Fall through: use totalMinorUnits = 0
		}
	}

	// Ensure the total is non-negative and non-zero before proceeding.
	if (totalMinorUnits <= 0n) {
		throw new Error("Cart is empty or invalid — cannot proceed with x402 checkout.");
	}

	// Convert minor units (cents) to a dollar string, e.g. 1999 → "$19.99".
	// x402 price strings are interpreted as USDC amounts on the selected network.
	const dollars = totalMinorUnits / 100n;
	const cents = totalMinorUnits % 100n;
	const price = `$${dollars}.${String(cents).padStart(2, "0")}`;

	return {
		price,
		network: (process.env.X402_NETWORK ?? "base-sepolia") as "base-sepolia" | "base",
		config: { description: "Cart checkout" },
	};
}

const facilitator = process.env.X402_FACILITATOR_URL ? { url: process.env.X402_FACILITATOR_URL } : undefined;

const paywall = process.env.X402_CDP_CLIENT_KEY
	? {
			cdpClientKey: process.env.X402_CDP_CLIENT_KEY,
			appName: process.env.X402_APP_NAME ?? "Your Next Store",
		}
	: undefined;

export const GET = withX402(
	handler,
	// X402_WALLET_ADDRESS is validated at request time inside getRouteConfig before
	// x402 uses the address to build payment instructions.
	(process.env.X402_WALLET_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
	getRouteConfig,
	facilitator,
	paywall,
);
