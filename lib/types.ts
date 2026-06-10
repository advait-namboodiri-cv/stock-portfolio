export type AccountSummary = {
  equity: number;
  cash: number;
  buyingPower: number;
  dayChange: number;
  dayChangePct: number;
  source: "alpaca" | "mock";
  paper: boolean;
};

export type Position = {
  symbol: string;
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlPct: number;
  dayChangePct: number;
};

export type EquityPoint = {
  date: string; // ISO date
  equity: number;
};

export type ProposalAction = "buy" | "sell";

export type ProposalStatus = "pending" | "approved" | "rejected" | "executed" | "failed";

export type Proposal = {
  id: string;
  createdAt: string; // ISO datetime
  action: ProposalAction;
  symbol: string;
  /** dollar amount for fractional orders */
  notional: number;
  /** the philosophy rule(s) this trade satisfies */
  rules: string[];
  /** agent's written reasoning for the trade */
  reasoning: string;
  status: ProposalStatus;
  /** broker order id once executed */
  orderId?: string;
  /** error message if execution failed */
  error?: string;
};

export type ActivityEntry = {
  id: string;
  at: string; // ISO datetime
  kind: "executed" | "rejected" | "deposit" | "note" | "failed";
  symbol?: string;
  action?: ProposalAction;
  notional?: number;
  summary: string;
  reasoning?: string;
};

export type Quote = {
  symbol: string;
  price: number;
  dayChangePct: number;
};
