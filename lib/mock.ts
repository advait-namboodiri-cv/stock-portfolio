import type { AccountSummary, EquityPoint, Position, Quote } from "./types";

// Deterministic mock data so the app is fully usable before Alpaca keys exist.

const START_EQUITY = 100000;

export const mockPositions: Position[] = [
  {
    symbol: "VOO",
    qty: 14.2,
    avgEntryPrice: 512.4,
    currentPrice: 531.1,
    marketValue: 7541.62,
    unrealizedPl: 265.54,
    unrealizedPlPct: 3.65,
    dayChangePct: 0.42,
  },
  {
    symbol: "AAPL",
    qty: 9.5,
    avgEntryPrice: 228.1,
    currentPrice: 224.6,
    marketValue: 2133.7,
    unrealizedPl: -33.25,
    unrealizedPlPct: -1.53,
    dayChangePct: -0.31,
  },
  {
    symbol: "NVDA",
    qty: 11.0,
    avgEntryPrice: 121.7,
    currentPrice: 138.2,
    marketValue: 1520.2,
    unrealizedPl: 181.5,
    unrealizedPlPct: 13.56,
    dayChangePct: 1.85,
  },
  {
    symbol: "KO",
    qty: 18.0,
    avgEntryPrice: 63.2,
    currentPrice: 64.9,
    marketValue: 1168.2,
    unrealizedPl: 30.6,
    unrealizedPlPct: 2.69,
    dayChangePct: 0.12,
  },
];

export function mockAccount(): AccountSummary {
  const invested = mockPositions.reduce((s, p) => s + p.marketValue, 0);
  const cash = START_EQUITY - invested + 444.42;
  const equity = invested + cash;
  return {
    equity,
    cash,
    buyingPower: cash,
    dayChange: 312.18,
    dayChangePct: 0.31,
    source: "mock",
    paper: true,
  };
}

export function mockHistory(days = 30): EquityPoint[] {
  // gentle upward drift with a mid-month dip, seeded so it never changes
  const out: EquityPoint[] = [];
  const today = new Date();
  let equity = START_EQUITY;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const t = days - 1 - i;
    const wave = Math.sin(t / 4.2) * 260;
    const dip = t > 10 && t < 16 ? -420 : 0;
    equity = START_EQUITY + t * 38 + wave + dip;
    out.push({ date: d.toISOString().slice(0, 10), equity: Math.round(equity * 100) / 100 });
  }
  return out;
}

const mockPrices: Record<string, Quote> = {
  VOO: { symbol: "VOO", price: 531.1, dayChangePct: 0.42 },
  AAPL: { symbol: "AAPL", price: 224.6, dayChangePct: -0.31 },
  NVDA: { symbol: "NVDA", price: 138.2, dayChangePct: 1.85 },
  KO: { symbol: "KO", price: 64.9, dayChangePct: 0.12 },
  MSFT: { symbol: "MSFT", price: 462.3, dayChangePct: 0.55 },
  SCHD: { symbol: "SCHD", price: 27.4, dayChangePct: 0.08 },
  XLE: { symbol: "XLE", price: 91.2, dayChangePct: -0.74 },
};

export function mockQuotes(symbols: string[]): Quote[] {
  return symbols.map(
    (s) => mockPrices[s.toUpperCase()] ?? { symbol: s.toUpperCase(), price: 100, dayChangePct: 0 },
  );
}
