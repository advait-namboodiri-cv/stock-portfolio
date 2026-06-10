"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccountSummary, ActivityEntry, EquityPoint, Position, Proposal } from "@/lib/types";
import { money, plClass, signedMoney, signedPct } from "@/lib/format";
import Sparkline from "./Sparkline";
import PositionsTable from "./PositionsTable";
import ProposalCard from "./ProposalCard";
import ActivityFeed from "./ActivityFeed";

type PortfolioPayload = {
  account: AccountSummary;
  positions: Position[];
  history: EquityPoint[];
};

type ProposalsPayload = {
  proposals: Proposal[];
  activity: ActivityEntry[];
};

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [pRes, prRes] = await Promise.all([
        fetch("/api/portfolio"),
        fetch("/api/proposals"),
      ]);
      if (pRes.ok) setPortfolio((await pRes.json()) as PortfolioPayload);
      else setError(((await pRes.json()) as { error?: string }).error ?? "portfolio fetch failed");
      if (prRes.ok) {
        const data = (await prRes.json()) as ProposalsPayload;
        setProposals(data.proposals);
        setActivity(data.activity);
      }
    } catch {
      setError("could not reach the app server");
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(refresh, 0);
    const t = setInterval(refresh, 30_000);
    return () => {
      clearTimeout(initial);
      clearInterval(t);
    };
  }, [refresh]);

  const pending = proposals.filter((p) => p.status === "pending");
  const acct = portfolio?.account;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 space-y-8">
      {/* masthead */}
      <header className="rise flex flex-wrap items-end justify-between gap-4 border-b border-ink-edge pb-5">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Ticker Desk</h1>
          <p className="text-paper-dim text-xs mt-2 uppercase tracking-[0.25em]">
            philosophy-driven · human-approved
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-gain" />
          {acct ? (
            <span className={acct.paper ? "text-agent" : "text-loss"}>
              {acct.paper ? "PAPER" : "LIVE"} · {acct.source === "mock" ? "mock data (no keys)" : "alpaca"}
            </span>
          ) : (
            <span className="text-paper-dim">connecting…</span>
          )}
        </div>
      </header>

      {error && (
        <p className="border border-loss/40 bg-loss/5 text-loss text-sm px-4 py-3">{error}</p>
      )}

      {/* stats + sparkline */}
      <section className="rise grid gap-4 lg:grid-cols-5" style={{ animationDelay: "80ms" }}>
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Stat label="Equity" value={acct ? money(acct.equity) : "—"} />
          <Stat
            label="Today"
            value={acct ? signedMoney(acct.dayChange) : "—"}
            sub={acct ? signedPct(acct.dayChangePct) : undefined}
            tone={acct ? acct.dayChange : 0}
          />
          <Stat label="Cash" value={acct ? money(acct.cash) : "—"} />
          <Stat label="Buying power" value={acct ? money(acct.buyingPower) : "—"} />
        </div>
        <div className="lg:col-span-3 border border-ink-edge bg-ink-raised p-4 rounded-lg shadow-sm">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-xs uppercase tracking-widest text-paper-dim">Equity · 1 month</h2>
            {portfolio && portfolio.history.length > 1 && (
              <span className={`text-xs tabular ${plClass(portfolio.history[portfolio.history.length - 1].equity - portfolio.history[0].equity)}`}>
                {signedMoney(portfolio.history[portfolio.history.length - 1].equity - portfolio.history[0].equity)}
              </span>
            )}
          </div>
          <div className="h-28">
            {portfolio ? <Sparkline points={portfolio.history} /> : <div className="text-paper-dim text-xs">loading…</div>}
          </div>
        </div>
      </section>

      {/* positions + right rail */}
      <section className="rise grid gap-6 lg:grid-cols-3" style={{ animationDelay: "160ms" }}>
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-paper-dim">Positions</h2>
          <PositionsTable positions={portfolio?.positions ?? []} />
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-agent">
              Agent proposals{pending.length > 0 && ` · ${pending.length} pending`}
            </h2>
            {pending.length === 0 ? (
              <p className="border border-ink-edge bg-ink-raised p-4 text-paper-dim text-sm leading-relaxed rounded-lg shadow-sm">
                No pending proposals. Run <code className="text-agent">npm run brief</code>, then ask
                the agent to <code className="text-agent">/propose</code> from the briefing.
              </p>
            ) : (
              pending.map((p) => <ProposalCard key={p.id} proposal={p} onDecided={refresh} />)
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-paper-dim">Activity</h2>
            <ActivityFeed activity={activity} />
          </div>
        </div>
      </section>

      <footer className="rise border-t border-ink-edge pt-4 text-[11px] text-paper-dim" style={{ animationDelay: "240ms" }}>
        Ruleset: <a href="/philosophy" className="text-agent hover:underline">data/philosophy.md</a> · every
        order requires your approval · educational project, not financial advice
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: number;
}) {
  const toneClass = tone === undefined ? "" : plClass(tone);
  return (
    <div className="border border-ink-edge bg-ink-raised p-4 rounded-lg shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.2em] text-paper-dim">{label}</div>
      <div className={`mt-1 text-xl font-medium tabular ${toneClass}`}>{value}</div>
      {sub && <div className={`text-xs tabular ${toneClass}`}>{sub}</div>}
    </div>
  );
}
