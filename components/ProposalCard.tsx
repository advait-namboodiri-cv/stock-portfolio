"use client";

import { useState } from "react";
import type { Proposal } from "@/lib/types";
import { money, timeAgo } from "@/lib/format";

type Props = {
  proposal: Proposal;
  onDecided: () => void;
};

export default function ProposalCard({ proposal, onDecided }: Props) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "approve" | "reject") {
    setBusy(decision);
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "request failed");
      }
      onDecided();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    } finally {
      setBusy(null);
    }
  }

  const isBuy = proposal.action === "buy";

  return (
    <article className="border border-agent/40 bg-ink-raised p-4 space-y-3 rounded-lg shadow-sm">
      <header className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-xs font-semibold uppercase tracking-widest ${isBuy ? "text-gain" : "text-loss"}`}>
            {proposal.action}
          </span>
          <span className="text-lg font-semibold">{proposal.symbol}</span>
          <span className="text-paper-dim tabular">{money(proposal.notional)}</span>
        </div>
        <time className="text-xs text-paper-dim shrink-0">{timeAgo(proposal.createdAt)}</time>
      </header>

      <p className="text-sm leading-relaxed text-paper/90">{proposal.reasoning}</p>

      <ul className="flex flex-wrap gap-1.5">
        {proposal.rules.map((rule) => (
          <li key={rule} className="text-[11px] text-agent border border-agent/30 bg-agent/5 px-2 py-0.5">
            {rule}
          </li>
        ))}
      </ul>

      {error && <p className="text-xs text-loss">{error}</p>}

      <footer className="flex gap-2 pt-1">
        <button
          onClick={() => decide("approve")}
          disabled={busy !== null}
          className="flex-1 border border-gain/50 text-gain text-xs font-semibold uppercase tracking-widest py-2 rounded-md hover:bg-gain hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
        >
          {busy === "approve" ? "sending…" : "Approve"}
        </button>
        <button
          onClick={() => decide("reject")}
          disabled={busy !== null}
          className="flex-1 border border-ink-edge text-paper-dim text-xs font-semibold uppercase tracking-widest py-2 rounded-md hover:border-loss/60 hover:text-loss transition-colors disabled:opacity-40 cursor-pointer"
        >
          {busy === "reject" ? "…" : "Reject"}
        </button>
      </footer>
    </article>
  );
}
