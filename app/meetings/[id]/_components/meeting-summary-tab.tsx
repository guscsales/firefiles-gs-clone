'use client';

import { CheckCircle2 } from 'lucide-react';

export function MeetingSummaryTab({
  summary,
  actionItems
}: {
  summary: string | null;
  actionItems: { text: string }[] | null;
}) {
  return (
    <div className="flex flex-col gap-8 py-4">
      <section className="flex flex-col gap-3">
        <h2 className="font-sans text-sm font-semibold text-foreground">
          Summary
        </h2>
        <p className="font-sans text-sm leading-6 text-muted-foreground">
          {summary || 'No summary available'}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-sans text-sm font-semibold text-foreground">
          Action Items
        </h2>
        {!actionItems || actionItems.length === 0 ? (
          <p className="font-sans text-sm text-muted-foreground">
            No action items
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {actionItems.map((item) => (
              <li
                key={item.text}
                className="flex items-start gap-2 font-sans text-sm leading-6 text-muted-foreground"
              >
                <CheckCircle2 className="size-4 text-emerald-500 mt-1 shrink-0" />
                {item.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
