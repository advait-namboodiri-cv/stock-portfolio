// Generates data/briefing.md — a market snapshot the agent (Claude Code)
// reads alongside data/philosophy.md before writing proposals.
// Run with: npm run brief

import { promises as fs } from "fs";
import path from "path";

// tsx doesn't load Next's env files; pull .env.local in manually
async function loadEnv() {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    // no .env.local yet — mock mode
  }
}

type Bar = { t: string; c: number };

async function main() {
  await loadEnv();
  const { getAccount, getPositions, getQuotes, hasKeys } = await import("../lib/alpaca");

  const philosophy = await fs.readFile(path.join(process.cwd(), "data", "philosophy.md"), "utf8");
  // universe = symbols in backticks within the ruleset, plus current positions
  const universe = [...new Set([...philosophy.matchAll(/`([A-Z]{1,5})`/g)].map((m) => m[1]))];

  const [account, positions] = await Promise.all([getAccount(), getPositions()]);
  const symbols = [...new Set([...universe, ...positions.map((p) => p.symbol)])];
  const quotes = await getQuotes(symbols);

  // 3 months of daily closes for simple trend context (50-day MA, 1-month change)
  const trend: Record<string, { ma50?: number; monthChangePct?: number }> = {};
  if (hasKeys() && symbols.length > 0) {
    const start = new Date();
    start.setDate(start.getDate() - 100);
    const url =
      `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbols.join(",")}` +
      `&timeframe=1Day&start=${start.toISOString()}&limit=10000&feed=iex&adjustment=split`;
    const res = await fetch(url, {
      headers: {
        "APCA-API-KEY-ID": process.env.ALPACA_API_KEY ?? "",
        "APCA-API-SECRET-KEY": process.env.ALPACA_API_SECRET ?? "",
      },
    });
    if (res.ok) {
      const data = (await res.json()) as { bars?: Record<string, Bar[]> };
      for (const [sym, bars] of Object.entries(data.bars ?? {})) {
        const closes = bars.map((b) => b.c);
        const last50 = closes.slice(-50);
        const ma50 = last50.reduce((a, b) => a + b, 0) / last50.length;
        const monthAgo = closes[Math.max(0, closes.length - 22)];
        const last = closes[closes.length - 1];
        trend[sym] = {
          ma50: Math.round(ma50 * 100) / 100,
          monthChangePct: monthAgo ? Math.round(((last - monthAgo) / monthAgo) * 10000) / 100 : undefined,
        };
      }
    }
  }

  const now = new Date().toISOString();
  const lines: string[] = [
    "# Market Briefing",
    "",
    `Generated: ${now}`,
    `Data source: ${account.source}${account.paper ? " (paper)" : " (LIVE)"}`,
    "",
    "## Account",
    "",
    `- Equity: $${account.equity.toFixed(2)}`,
    `- Cash: $${account.cash.toFixed(2)} (${((account.cash / account.equity) * 100).toFixed(1)}% of equity)`,
    `- Buying power: $${account.buyingPower.toFixed(2)}`,
    `- Day change: $${account.dayChange.toFixed(2)} (${account.dayChangePct.toFixed(2)}%)`,
    "",
    "## Positions",
    "",
  ];

  if (positions.length === 0) {
    lines.push("(none)");
  } else {
    lines.push("| Symbol | Qty | Avg cost | Price | Value | Unrealized P/L | Today |");
    lines.push("|---|---|---|---|---|---|---|");
    for (const p of positions) {
      lines.push(
        `| ${p.symbol} | ${p.qty} | $${p.avgEntryPrice.toFixed(2)} | $${p.currentPrice.toFixed(2)} | $${p.marketValue.toFixed(2)} | ${p.unrealizedPl >= 0 ? "+" : ""}$${p.unrealizedPl.toFixed(2)} (${p.unrealizedPlPct.toFixed(2)}%) | ${p.dayChangePct.toFixed(2)}% |`,
      );
    }
  }

  lines.push("", "## Watchlist quotes", "");
  lines.push("| Symbol | Price | Today | vs 50-day MA | 1-month |");
  lines.push("|---|---|---|---|---|");
  for (const q of quotes) {
    const t = trend[q.symbol];
    const vsMa =
      t?.ma50 !== undefined ? `${(((q.price - t.ma50) / t.ma50) * 100).toFixed(1)}%` : "n/a";
    const mo = t?.monthChangePct !== undefined ? `${t.monthChangePct.toFixed(1)}%` : "n/a";
    lines.push(`| ${q.symbol} | $${q.price.toFixed(2)} | ${q.dayChangePct.toFixed(2)}% | ${vsMa} | ${mo} |`);
  }

  lines.push(
    "",
    "## Notes for the agent",
    "",
    "- Read data/philosophy.md and obey it exactly; cite specific rules in every proposal.",
    "- Propose only what the ruleset permits. If nothing qualifies, propose nothing.",
    "- Append new proposals to data/proposals.json with status \"pending\".",
    "",
  );

  const out = path.join(process.cwd(), "data", "briefing.md");
  await fs.writeFile(out, lines.join("\n"), "utf8");
  console.log(`wrote ${out} (${symbols.length} symbols, source: ${account.source})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
