<p align="center">
  <a href="https://yournextstore.com">
    <img src="public/logo.svg" height="128">
  </a>
</p>

<h1 align="center">Your Next Store</h1>

<p align="center">
  <strong>Open-source AI-native Next.js e-commerce template.</strong>
</p>
<p align="center">
Multi-provider payments: Polar.sh · Creem.io · Flexprice · Stripe (legacy)
</p>

<div align="center">
  <a href="https://demo.yournextstore.com">
    <img src="public/screenshot.png" alt="Your Next Store Demo" width="800" />
  </a>
  <p><strong>Live Demo:</strong> <a href="https://demo.yournextstore.com">demo.yournextstore.com</a></p>
</div>

<div align="center">
  <a href="https://github.com/yournextstore/yournextstore/stargazers"><img src="https://img.shields.io/github/stars/yournextstore/yournextstore?style=for-the-badge&logo=github&labelColor=181717&color=181717" alt="GitHub Stars" /></a>
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyournextstore%2Fyournextstore&env=ENABLE_EXPERIMENTAL_COREPACK,YNS_API_KEY&envDescription=Read%20more%20about%20required%20env%20variables%20in%20YNS&envLink=https%3A%2F%2Fgithub.com%2Fyournextstore%2Fyournextstore%2Ftree%2Fupcoming%3Ftab%3Dreadme-ov-file%23add-environmental-variables&project-name=yournextstore&repository-name=yournextstore&demo-title=Your%20Next%20Store&demo-description=A%20Next.js%20boilerplate%20for%20building%20your%20online%20store%20instantly%3A%20simple%2C%20quick%2C%20powerful.&demo-url=https%3A%2F%2Fdemo.yournextstore.com%2F&demo-image=https%3A%2F%2Fyournextstore.com%2Fdemo.png"><img src="https://img.shields.io/badge/Deploy-Vercel-000?style=for-the-badge&logo=vercel&labelColor=000" alt="Deploy with Vercel" /></a>
  <a href="https://yournextstore.com/discord"><img src="https://img.shields.io/discord/1206629600483082341?style=for-the-badge&logo=discord&logoColor=white&labelColor=5865F2&color=5865F2" alt="Discord" /></a>
  <a href="https://www.producthunt.com/posts/your-next-store"><img src="https://img.shields.io/badge/Product%20Hunt-720-DA552F?style=for-the-badge&logo=producthunt&logoColor=white&labelColor=DA552F" alt="Product Hunt" /></a>
</div>

<br/>

| | |
|:---|:---|
| **AI-Friendly Codebase** | Ships with [AGENTS.md](AGENTS.md) — idiomatic patterns, Commerce Kit SDK with typed methods. Claude Code, Cursor, and Codex work out of the box |
| **Multi-Provider Payments** | Polar.sh, Creem.io, and Flexprice out of the box — plus Stripe via the legacy YNS proxy |
| **Next.js 16** | App Router, React Server Components, React Compiler |
| **Open Source** | Self-host anywhere, deploy to Vercel in one click |

## Quick Start

```bash
git clone https://github.com/yournextstore/yournextstore.git
cd yournextstore && bun install
cp .env.example .env.local   # Add your YNS_API_KEY from https://yns.store/manage/settings/api
bun dev
```

Open [localhost:3000](http://localhost:3000) — your store is running.

## Payment Providers

Your Next Store supports four checkout backends. Set `PAYMENT_PROVIDER` in your `.env.local` to choose one. When unset the legacy YNS / Stripe proxy is used.

### Polar.sh

1. Create an account at [polar.sh](https://polar.sh) and set up your products.
2. Copy your **Access Token** from *Settings → Developers → Access Tokens*.
3. Copy your **Webhook Secret** from *Settings → Webhooks → Endpoint secret*.
4. Map your commerce-kit variant IDs to Polar price IDs in `PRODUCT_ID_MAP`.

```env
PAYMENT_PROVIDER=polar
NEXT_PUBLIC_APP_URL=https://your-store.example.com
POLAR_ACCESS_TOKEN=polar_oat_xxxx
POLAR_WEBHOOK_SECRET=whs_xxxx
POLAR_SERVER=production          # or "sandbox" for testing
PRODUCT_ID_MAP={"variant_id_1":{"polar":"polar_price_id_1"}}
```

Checkout route: `/api/checkout/polar`  
Webhook route: `/api/webhooks/polar`

### Creem.io

1. Create an account at [creem.io](https://creem.io) and set up your products.
2. Copy your **API Key** from the Creem dashboard.
3. Copy your **Webhook Secret** from *Dashboard → Webhooks*.
4. Map your commerce-kit variant IDs to Creem product IDs in `PRODUCT_ID_MAP`.

```env
PAYMENT_PROVIDER=creem
NEXT_PUBLIC_APP_URL=https://your-store.example.com
CREEM_API_KEY=creem_xxxx
CREEM_WEBHOOK_SECRET=whsec_xxxx
PRODUCT_ID_MAP={"variant_id_1":{"creem":"creem_product_id_1"}}
```

Checkout route: `/api/checkout/creem`  
Webhook route: `/api/webhooks/creem`

### Flexprice

[Flexprice](https://flexprice.io) is an open-source usage-based billing platform that uses Stripe under the hood.

1. Create an account at [flexprice.io](https://flexprice.io) and note your API key.
2. Configure a Stripe webhook at [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) pointing to `{APP_URL}/api/webhooks/flexprice`.

```env
PAYMENT_PROVIDER=flexprice
NEXT_PUBLIC_APP_URL=https://your-store.example.com
FLEXPRICE_API_KEY=fp_xxxx
FLEXPRICE_API_URL=https://api.flexprice.io/v1
FLEXPRICE_WEBHOOK_SECRET=whsec_xxxx   # Stripe webhook signing secret
```

Webhook route: `/api/webhooks/flexprice`

### Legacy YNS / Stripe

Leave `PAYMENT_PROVIDER` unset to keep the original YNS backend / Stripe proxy.

```env
YNS_API_KEY=your_api_token_here
```

## Why AI Tools Work Better Here

| | |
|---|---|
| **Familiar patterns** | Idiomatic Next.js App Router (Server Components, Server Actions, `"use cache"`) — matches what LLMs have seen thousands of times |
| **Commerce Kit SDK** | Methods like `productBrowse()` and `cartUpsert()` have defined input/output shapes. LLMs write correct code when they know the contracts |
| **Well-defined domain** | Products, variants, carts, checkout — the data models already exist with clear types. No need for the LLM to invent them |
| **AGENTS.md** | Full project context, SDK examples, Biome rules, and validation checklist — AI agents understand the codebase before writing a single line |

## Tech Stack

- **Next.js 16** — App Router, React Server Components, React Compiler
- **Bun** — Fast JavaScript runtime and package manager
- **Commerce Kit SDK** — Headless commerce API integration
- **Polar.sh / Creem.io / Flexprice** — Payment provider integrations
- **Tailwind CSS v4** — Utility-first styling
- **Shadcn UI** — 50+ accessible components built on Radix UI
- **TypeScript** — Strict type-safe development
- **Biome** — Lightning-fast linter and formatter

## Prerequisites

- [Node.js 24+](https://nodejs.org/)
- [Bun 1.0+](https://bun.sh/)
- YNS API key from [https://yns.store/manage/settings/api](https://yns.store/manage/settings/api) *(only required for the legacy Stripe mode)*

### Environment Variables

Copy `.env.example` to `.env.local` and configure for your chosen payment provider. See the [Payment Providers](#payment-providers) section above.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding conventions and PR checklist.

## Next Steps

Refer to the [API documentation](https://yns.store/manage/settings/api) for details on fetching products, managing carts, and building on top of YNS.

## Star History

<a href="https://star-history.com/#yournextstore/yournextstore&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=yournextstore/yournextstore&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=yournextstore/yournextstore&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=yournextstore/yournextstore&type=Date" width="600" />
  </picture>
</a>
