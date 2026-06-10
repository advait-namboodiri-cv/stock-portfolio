# Ticker Desk

A philosophy-driven paper-trading portfolio. An AI analyst reads a written
investing ruleset, studies the market, and **proposes** trades with its
reasoning spelled out — a human approves or rejects every order from the
dashboard. Approved orders execute on [Alpaca](https://alpaca.markets)
(paper trading; the live API is the same code path).

## How it works

```
npm run brief          →  data/briefing.md   (market snapshot)
agent reads briefing   →  data/proposals.json (pending proposals + reasoning)
   + data/philosophy.md
dashboard approve      →  order submitted to Alpaca, logged to activity
```

- **The ruleset is law.** `data/philosophy.md` defines the universe, entry and
  exit rules, sizing limits, and cadence. The agent may only propose trades the
  ruleset justifies, and every proposal cites the rules it satisfies.
- **Human in the loop.** Nothing trades without a click on Approve.
- **Paper → live is one env change.** Same API, same code; swap keys in
  `.env.local` when ready.

## Setup

```bash
npm install
cp .env.example .env.local   # add Alpaca paper keys (optional — mock data without them)
npm run dev                  # dashboard at localhost:3000
```

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · Alpaca REST API ·
file-backed JSON store. No database, no chart library — the equity curve is a
hand-rolled SVG.

*Educational project, not financial advice.*
