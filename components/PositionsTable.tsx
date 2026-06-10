import type { Position } from "@/lib/types";
import { money, plClass, signedPct } from "@/lib/format";

export default function PositionsTable({ positions }: { positions: Position[] }) {
  if (positions.length === 0) {
    return (
      <div className="border border-ink-edge bg-ink-raised/70 p-8 text-center text-paper-dim text-sm">
        No positions yet — approve a proposal to open one.
      </div>
    );
  }
  return (
    <div className="border border-ink-edge bg-ink-raised/70 overflow-x-auto">
      <table className="w-full text-sm tabular">
        <thead>
          <tr className="text-paper-dim text-xs uppercase tracking-widest border-b border-ink-edge">
            <th className="text-left font-medium px-4 py-3">Symbol</th>
            <th className="text-right font-medium px-4 py-3">Qty</th>
            <th className="text-right font-medium px-4 py-3">Avg cost</th>
            <th className="text-right font-medium px-4 py-3">Price</th>
            <th className="text-right font-medium px-4 py-3">Value</th>
            <th className="text-right font-medium px-4 py-3">Today</th>
            <th className="text-right font-medium px-4 py-3">P/L</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => (
            <tr key={p.symbol} className="border-b border-ink-edge/60 last:border-0 hover:bg-ink-edge/30 transition-colors">
              <td className="px-4 py-3 font-semibold">{p.symbol}</td>
              <td className="px-4 py-3 text-right text-paper-dim">{p.qty}</td>
              <td className="px-4 py-3 text-right text-paper-dim">{money(p.avgEntryPrice)}</td>
              <td className="px-4 py-3 text-right">{money(p.currentPrice)}</td>
              <td className="px-4 py-3 text-right">{money(p.marketValue)}</td>
              <td className={`px-4 py-3 text-right ${plClass(p.dayChangePct)}`}>{signedPct(p.dayChangePct)}</td>
              <td className={`px-4 py-3 text-right ${plClass(p.unrealizedPl)}`}>
                {money(Math.abs(p.unrealizedPl))} <span className="opacity-80">({signedPct(p.unrealizedPlPct)})</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
