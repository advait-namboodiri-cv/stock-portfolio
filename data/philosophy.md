# Philosophy Ruleset

> **PLACEHOLDER** — this is a deliberately conservative starter ruleset so the
> agent has something to follow while the owner works through the investing
> field guide. Once a philosophy is chosen, rewrite every section below using
> the five-block template (Universe / Entry / Exit / Sizing / Cadence).

## Philosophy

Index-first passive (Bogle) with dollar-cost averaging. Until the owner picks
a real philosophy, the agent's job is to keep things simple, diversified, and
boring.

## 1. Universe

- Core: `VOO` (S&P 500 ETF) only.
- Satellite candidates (may be *proposed*, never required): `SCHD`, `VXUS`.
- Everything else is out of bounds.

## 2. Entry rules

- If cash exceeds 20% of equity, propose buying `VOO` with the excess,
  in increments of at least $5.
- Never propose more than one buy per symbol per day.

## 3. Exit rules

- Do not propose sells, except:
  - a position that is no longer in the universe (ruleset changed), or
  - rebalancing when a satellite exceeds 25% of equity.

## 4. Sizing & risk limits

- Max single proposal: 10% of current equity.
- Cash floor: never propose a buy that would take cash below 5% of equity.
- Satellites combined must stay under 30% of equity.

## 5. Cadence & discretion

- Evaluate at most once per trading day.
- Propose only — every order requires the owner's approval in the dashboard.
- Every proposal must cite the rule(s) above that justify it, plus plain-English
  reasoning grounded in the current briefing.
- If the briefing data looks stale or contradictory, propose nothing and write
  a `note` activity entry explaining why.
