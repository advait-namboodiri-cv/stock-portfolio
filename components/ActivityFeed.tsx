import type { ActivityEntry } from "@/lib/types";
import { timeAgo } from "@/lib/format";

const kindStyles: Record<ActivityEntry["kind"], string> = {
  executed: "text-gain border-gain/40",
  rejected: "text-paper-dim border-ink-edge",
  failed: "text-loss border-loss/40",
  deposit: "text-agent border-agent/40",
  note: "text-agent border-agent/40",
};

export default function ActivityFeed({ activity }: { activity: ActivityEntry[] }) {
  if (activity.length === 0) {
    return <p className="text-paper-dim text-sm">Nothing yet.</p>;
  }
  return (
    <ol className="space-y-3">
      {activity.slice(0, 12).map((a) => (
        <li key={a.id} className="flex gap-3 text-sm">
          <span
            className={`shrink-0 border px-1.5 py-0.5 text-[10px] uppercase tracking-widest self-start mt-0.5 ${kindStyles[a.kind]}`}
          >
            {a.kind}
          </span>
          <div className="min-w-0">
            <p className="text-paper/90 leading-snug">{a.summary}</p>
            {a.reasoning && (
              <p className="text-paper-dim text-xs leading-snug mt-0.5 line-clamp-2">{a.reasoning}</p>
            )}
            <time className="text-paper-dim/70 text-[11px]">{timeAgo(a.at)}</time>
          </div>
        </li>
      ))}
    </ol>
  );
}
