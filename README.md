# xbit89-fortune

A tiny paid fortune API listed on vAPI Call. Payment is x402 (v2, exact scheme)
on Base — 0.01 USDC per call, paid to the operator's Base wallet.

## Endpoints

- `GET /api/fortune` — the paid endpoint. Unpaid requests get an HTTP 402
  x402 challenge; paid requests get today's fortune + lucky number as JSON.
- `GET /api/openapi` — OpenAPI 3 description of the service.
- `GET /api` — service info.

## Deploy

Import this repository into Vercel. No build settings are needed —
the serverless functions live in `/api`.
