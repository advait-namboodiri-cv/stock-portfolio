import type { AccountSummary, EquityPoint, Position, Quote } from "./types";
import { mockAccount, mockHistory, mockPositions, mockQuotes } from "./mock";

// Thin Alpaca REST client. Paper and live share the exact same API —
// switching to real money is only a key + base-url change in .env.local.

const PAPER = process.env.ALPACA_PAPER !== "false";
const TRADING_BASE = PAPER ? "https://paper-api.alpaca.markets" : "https://api.alpaca.markets";
const DATA_BASE = "https://data.alpaca.markets";

export function hasKeys(): boolean {
  return Boolean(process.env.ALPACA_API_KEY && process.env.ALPACA_API_SECRET);
}

function headers(): Record<string, string> {
  return {
    "APCA-API-KEY-ID": process.env.ALPACA_API_KEY ?? "",
    "APCA-API-SECRET-KEY": process.env.ALPACA_API_SECRET ?? "",
    "Content-Type": "application/json",
  };
}

async function alpaca<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, { ...init, headers: headers(), cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Alpaca ${res.status} on ${path}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function getAccount(): Promise<AccountSummary> {
  if (!hasKeys()) return mockAccount();
  const acct = await alpaca<{
    equity: string;
    last_equity: string;
    cash: string;
    buying_power: string;
  }>(TRADING_BASE, "/v2/account");
  const equity = parseFloat(acct.equity);
  const lastEquity = parseFloat(acct.last_equity);
  return {
    equity,
    cash: parseFloat(acct.cash),
    buyingPower: parseFloat(acct.buying_power),
    dayChange: equity - lastEquity,
    dayChangePct: lastEquity ? ((equity - lastEquity) / lastEquity) * 100 : 0,
    source: "alpaca",
    paper: PAPER,
  };
}

type AlpacaPosition = {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  change_today: string;
};

export async function getPositions(): Promise<Position[]> {
  if (!hasKeys()) return mockPositions;
  const raw = await alpaca<AlpacaPosition[]>(TRADING_BASE, "/v2/positions");
  return raw.map((p) => ({
    symbol: p.symbol,
    qty: parseFloat(p.qty),
    avgEntryPrice: parseFloat(p.avg_entry_price),
    currentPrice: parseFloat(p.current_price),
    marketValue: parseFloat(p.market_value),
    unrealizedPl: parseFloat(p.unrealized_pl),
    unrealizedPlPct: parseFloat(p.unrealized_plpc) * 100,
    dayChangePct: parseFloat(p.change_today) * 100,
  }));
}

export async function getHistory(): Promise<EquityPoint[]> {
  if (!hasKeys()) return mockHistory();
  const hist = await alpaca<{ timestamp: number[]; equity: (number | null)[] }>(
    TRADING_BASE,
    "/v2/account/portfolio/history?period=1M&timeframe=1D",
  );
  return hist.timestamp
    .map((t, i) => ({
      date: new Date(t * 1000).toISOString().slice(0, 10),
      equity: hist.equity[i] ?? 0,
    }))
    .filter((p) => p.equity > 0);
}

type Snapshot = {
  latestTrade?: { p: number };
  dailyBar?: { c: number };
  prevDailyBar?: { c: number };
};

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];
  if (!hasKeys()) return mockQuotes(symbols);
  const list = symbols.map((s) => s.toUpperCase()).join(",");
  const snaps = await alpaca<Record<string, Snapshot>>(
    DATA_BASE,
    `/v2/stocks/snapshots?symbols=${list}&feed=iex`,
  );
  return Object.entries(snaps).map(([symbol, s]) => {
    const price = s.latestTrade?.p ?? s.dailyBar?.c ?? 0;
    const prev = s.prevDailyBar?.c ?? price;
    return {
      symbol,
      price,
      dayChangePct: prev ? ((price - prev) / prev) * 100 : 0,
    };
  });
}

export type OrderResult = { id: string; status: string };

export async function submitOrder(
  symbol: string,
  notional: number,
  side: "buy" | "sell",
): Promise<OrderResult> {
  if (!hasKeys()) {
    // mock execution so the approve flow is testable without keys
    return { id: `mock-${Date.now()}`, status: "filled (mock)" };
  }
  const order = await alpaca<{ id: string; status: string }>(TRADING_BASE, "/v2/orders", {
    method: "POST",
    body: JSON.stringify({
      symbol: symbol.toUpperCase(),
      notional: notional.toFixed(2),
      side,
      type: "market", // fractional (notional) orders must be market + day
      time_in_force: "day",
    }),
  });
  return { id: order.id, status: order.status };
}
