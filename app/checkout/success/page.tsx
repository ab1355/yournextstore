/**
 * /checkout/success — generic order success page for new payment providers.
 *
 * Each provider appends provider-specific query parameters:
 *   Polar.sh  → ?checkoutId=<id>
 *   Creem.io  → ?checkout_id=<id>&order_id=<id>
 *   Flexprice → ?payment_id=<id>
 */

import { CheckCircle } from "lucide-react";
import type { SearchParams } from "next/dist/server/request/search-params";
import { Button } from "@/components/ui/button";
import { YnsLink } from "@/components/yns-link";

/**
 * Extract the most useful reference ID from the provider's success redirect.
 * Polar uses `checkoutId`, Creem uses `order_id` or `checkout_id`,
 * Flexprice uses `payment_id`.
 */
function getReferenceId(params: SearchParams): string | undefined {
	return (
		(params.order_id as string | undefined) ??
		(params.checkoutId as string | undefined) ??
		(params.checkout_id as string | undefined) ??
		(params.payment_id as string | undefined)
	);
}

export default async function CheckoutSuccessPage(props: { searchParams: Promise<SearchParams> }) {
	const searchParams = await props.searchParams;
	const referenceId = getReferenceId(searchParams);

	return (
		<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
			<div className="text-center mb-10">
				<div className="flex justify-center mb-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
				</div>
				<h1 className="text-3xl font-semibold tracking-tight">Thank you for your order!</h1>
				{referenceId && <p className="text-muted-foreground mt-2">Reference: {referenceId}</p>}
				<p className="text-sm text-muted-foreground mt-4">You will receive a confirmation email shortly.</p>
			</div>

			<div className="mt-8 text-center">
				<Button asChild>
					<YnsLink prefetch="eager" href="/">
						Continue Shopping
					</YnsLink>
				</Button>
			</div>
		</div>
	);
}
