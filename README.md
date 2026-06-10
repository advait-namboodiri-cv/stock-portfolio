# Ticker Desk

A philosophy-driven paper-trading portfolio. 

## How it works

```
npm run brief          →  data/briefing.md   (market snapshot)
agent reads briefing   →  data/proposals.json (pending proposals + reasoning)
   + data/philosophy.md
dashboard approve      →  order submitted to Alpaca, logged to activity
```

- **The ruleset is law.** `data/philosophy.md` defines the universe, entry and
  exit rules, sizing limits. The agent may only propose trades the
  ruleset justifies, and every proposal cites the rules it satisfies.

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · Alpaca REST API ·
file-backed JSON store.
