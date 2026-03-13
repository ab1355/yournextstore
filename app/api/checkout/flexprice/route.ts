/**
 * Flexprice checkout route handler.
 *
 * Creates a Flexprice customer → invoice → payment link and redirects the
 * browser to the Stripe-powered payment page.
 *
 * Required env variables:
 *   FLEXPRICE_API_KEY        – Flexprice API key
 *   FLEXPRICE_API_URL        – API base URL (default: https://api.flexprice.io/v1)
 *   FLEXPRICE_SUCCESS_URL    – Redirect URL after successful payment
 *                              (defaults to NEXT_PUBLIC_APP_URL/checkout/success)
 *
 * The route reads the cart from the yns_cart cookie, so it must be called
 * from the same origin as the store.
 */

import { Flexprice, PaymentDestinationType, PaymentGatewayType, PaymentMethodType } from "@flexprice/sdk";
import { type NextRequest, NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";
import { getCartCookieJson } from "@/lib/cookies";

export async function GET(request: NextRequest) {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
	const successUrl = process.env.FLEXPRICE_SUCCESS_URL ?? `${appUrl}/checkout/success`;
	const cancelUrl = `${appUrl}/`;

	const cartCookie = await getCartCookieJson();
	if (!cartCookie?.id) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	const cart = await commerce.cartGet({ cartId: cartCookie.id });
	if (!cart?.lineItems.length) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	const flexprice = new Flexprice({
		serverURL: process.env.FLEXPRICE_API_URL ?? "https://api.flexprice.io/v1",
		apiKeyAuth: process.env.FLEXPRICE_API_KEY ?? "",
	});

	// Calculate cart total in decimal (e.g., "19.99").
	// Keep all arithmetic in BigInt to avoid precision loss, then convert
	// the final integer value to a decimal string.
	const totalMinorUnits = cart.lineItems.reduce(
		(sum, item) => sum + BigInt(item.productVariant.price) * BigInt(item.quantity),
		BigInt(0),
	);
	const totalDecimal = `${totalMinorUnits / 100n}.${String(totalMinorUnits % 100n).padStart(2, "0")}`;

	// Create a one-off guest customer for this checkout session.
	const customer = await flexprice.customers.createCustomer({
		externalId: `cart-${cartCookie.id}`,
		name: "Guest",
	});

	if (!customer.id) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	// Build invoice line items from the cart.
	// Use BigInt arithmetic to avoid floating-point precision loss.
	const lineItems = cart.lineItems.map((item) => {
		const lineMinorUnits = BigInt(item.productVariant.price) * BigInt(item.quantity);
		const lineDecimal = `${lineMinorUnits / 100n}.${String(lineMinorUnits % 100n).padStart(2, "0")}`;
		return {
			amount: lineDecimal,
			displayName: item.productVariant.product.name,
			quantity: String(item.quantity),
		};
	});

	// Create a draft invoice.
	const invoice = await flexprice.invoices.createInvoice({
		customerId: customer.id,
		currency: "usd",
		amountDue: totalDecimal,
		subtotal: totalDecimal,
		total: totalDecimal,
		lineItems,
	});

	if (!invoice.id) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	// Finalize the invoice so it can be paid.
	await flexprice.invoices.finalizeInvoice(invoice.id);

	// Create a payment link for the finalized invoice.
	const payment = await flexprice.payments.createPayment({
		amount: totalDecimal,
		currency: "usd",
		destinationId: invoice.id,
		destinationType: PaymentDestinationType.Invoice,
		paymentMethodType: PaymentMethodType.PaymentLink,
		processPayment: true,
		paymentGateway: PaymentGatewayType.Stripe,
		successUrl,
		cancelUrl,
	});

	const paymentUrl = payment.paymentUrl;
	if (!paymentUrl) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.redirect(paymentUrl);
}
