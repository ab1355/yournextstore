import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSubdomainPublicUrl } from "./lib/commerce";
import { isNewPaymentProvider } from "./lib/payment-providers";

export async function proxy(request: NextRequest) {
	// When a new payment provider (Polar, Creem, or Flexprice) is configured,
	// skip the YNS/Stripe proxy so that the Next.js checkout pages handle the flow.
	if (isNewPaymentProvider()) {
		return NextResponse.next();
	}

	const { subdomain, publicUrl } = await getSubdomainPublicUrl();
	const destinationUrl = new URL(publicUrl);

	// Clone the request headers and set the correct x-forwarded-host
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-forwarded-host", destinationUrl.host);
	requestHeaders.set("origin", destinationUrl.toString());

	// Rewrite to the destination with updated headers
	const url = new URL(`/${subdomain}${request.nextUrl.pathname}${request.nextUrl.search}`, destinationUrl);

	return NextResponse.rewrite(url, {
		request: {
			headers: requestHeaders,
		},
	});
}

export const config = {
	matcher: ["/checkout/:path*"],
};
