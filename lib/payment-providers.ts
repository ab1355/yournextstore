/**
 * Payment provider configuration and types.
 *
 * Supported providers:
 * - "polar"      – Polar.sh      (@polar-sh/sdk, @polar-sh/nextjs)
 * - "creem"      – Creem.io      (@creem_io/nextjs)
 * - "flexprice"  – Flexprice     (@flexprice/sdk)
 * - "x402"       – x402 protocol (@x402-next) — USDC payments on Base via HTTP 402
 *
 * Set the PAYMENT_PROVIDER environment variable to choose a provider.
 * When PAYMENT_PROVIDER is not set the legacy YNS/Stripe proxy is used.
 */

export type PaymentProvider = "polar" | "creem" | "flexprice" | "x402";

const SUPPORTED_PROVIDERS: PaymentProvider[] = ["polar", "creem", "flexprice", "x402"];

/**
 * Returns the configured payment provider, or null when the YNS/Stripe
 * proxy should be used (backward-compatible default).
 */
export function getPaymentProvider(): PaymentProvider | null {
	const raw = process.env.PAYMENT_PROVIDER;
	if (!raw) return null;
	if (SUPPORTED_PROVIDERS.includes(raw as PaymentProvider)) {
		return raw as PaymentProvider;
	}
	throw new Error(`Unknown PAYMENT_PROVIDER "${raw}". Supported values: ${SUPPORTED_PROVIDERS.join(", ")}`);
}

/** True when a new payment provider (not the legacy YNS proxy) is active. */
export function isNewPaymentProvider(): boolean {
	return getPaymentProvider() !== null;
}
