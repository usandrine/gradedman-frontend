import { Eye, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProctoringReport as Report, ProctoringSummary } from '@/lib/features/results/resultsSlice';

const hasFlags = (summary: ProctoringSummary) => summary.tab_switches > 0 || summary.blocked_actions > 0;

// 95 → "1m 35s"
const formatAway = (seconds: number) => (seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`);

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const eventLabels: Record<Report['events'][number]['type'], string> = {
  tab_switch: 'Left the exam tab or window',
  tab_return: 'Came back to the exam',
  copy: 'Tried to copy (blocked)',
  cut: 'Tried to cut (blocked)',
  paste: 'Tried to paste (blocked)',
  right_click: 'Right-clicked (blocked)',
};

// Small marker for a row in a list of students — nothing is shown for a clean attempt
export function ProctoringFlag({ summary }: { summary: ProctoringSummary }) {
  if (!hasFlags(summary)) return null;

  const parts = [
    summary.tab_switches > 0 && `Left ${summary.tab_switches}×`,
    summary.blocked_actions > 0 && `${summary.blocked_actions} blocked`,
  ].filter(Boolean);

  return (
    <Badge variant="secondary" className="bg-amber-100 text-amber-800" title="Proctoring events during this attempt">
      <Eye />
      {parts.join(' · ')}
    </Badge>
  );
}

// Full proctoring section on a student's marked paper (teacher only)
export function ProctoringReport({ report }: { report: Report }) {
  if (!hasFlags(report)) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 text-sm text-gray-700">
          <ShieldCheck className="size-5 shrink-0 text-green-600" />
          No proctoring events: the student stayed on the exam and made no copy or paste attempts.
        </CardContent>
      </Card>
    );
  }

  const figures = [
    { label: 'Left the exam', value: `${report.tab_switches} ${report.tab_switches === 1 ? 'time' : 'times'}` },
    { label: 'Time away', value: formatAway(report.away_seconds) },
    { label: 'Blocked copy / paste', value: report.blocked_actions },
  ];

  return (
    <Card className="ring-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="size-4 text-amber-600" />
          Proctoring
        </CardTitle>
        <CardDescription>
          A signal, not proof. Leaving the tab also happens for innocent reasons, such as a notification or a slip of the mouse.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {figures.map((figure) => (
            <div key={figure.label} className="rounded-lg bg-amber-50 px-3 py-2">
              <p className="text-xs text-amber-800">{figure.label}</p>
              <p className="text-lg font-semibold text-amber-950 tabular-nums">{figure.value}</p>
            </div>
          ))}
        </div>

        <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
          {report.events.map((event, index) => (
            <li key={index} className="flex gap-3">
              <span className="shrink-0 font-mono text-xs leading-5 text-muted-foreground tabular-nums">
                {formatTime(event.created_at)}
              </span>
              <span className="text-gray-700">
                {eventLabels[event.type]}
                {event.type === 'tab_return' && event.away_ms !== null && ` after ${formatAway(Math.round(event.away_ms / 1000))}`}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
