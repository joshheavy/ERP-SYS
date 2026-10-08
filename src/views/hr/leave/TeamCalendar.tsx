'use client';

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ClipboardListIcon } from 'lucide-react';
import { useNav } from '../../../hooks/useNav';
import { PageHeader } from '../../../components/shell/PageHeader';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatTile } from '../../../components/ui/StatTile';
import { cn } from '../../../utils/cn';
import { PUBLIC_HOLIDAYS, TEAM_ABSENCES } from '../../../data/leave';
import { ROUTE_META } from '../../../data/navigation';
import { formatDate } from '../../../utils/format';
import type { LeaveType } from '../../../types/leave';

const TYPE_COLOR: Record<LeaveType, string> = {
  annual: 'bg-primary-soft text-primary-text',
  sick: 'bg-warning-soft text-warning',
  compassionate: 'bg-info-soft text-info',
  study: 'bg-success-soft text-success',
  maternity: 'bg-danger-soft text-danger'
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function absencesOn(dateIso: string) {
  return TEAM_ABSENCES.filter((a) => dateIso >= a.startDate && dateIso <= a.endDate);
}

export function TeamCalendar() {
  const navigate = useNav();
  // Fixed demo month: September 2026.
  const [month, setMonth] = useState(8); // 0-indexed
  const year = 2026;

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const monthLabel = new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const onLeaveToday = absencesOn('2026-09-14');

  return (
    <div>
      <PageHeader
        trail={ROUTE_META['/hr/leave/calendar'].trail}
        title="Team calendar"
        meta={<span>Approved and pending absences across the team</span>}
        secondaryActions={
          <Button icon={ClipboardListIcon} onClick={() => navigate('/hr/leave/requests')}>
            Leave requests
          </Button>
        }
      />

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile emphasis label="On leave today" value={String(onLeaveToday.length)} footnote="14 Sep 2026" />
          <StatTile label="Approved this month" value={String(TEAM_ABSENCES.filter((a) => a.status === 'approved').length)} />
          <StatTile label="Pending" value={String(TEAM_ABSENCES.filter((a) => a.status === 'pending').length)} />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-12 xl:col-span-8">
            <CardHeader
              title={monthLabel}
              actions={
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" iconOnly icon={ChevronLeftIcon} aria-label="Previous month" onClick={() => setMonth((m) => Math.max(0, m - 1))} />
                  <Button size="sm" variant="ghost" iconOnly icon={ChevronRightIcon} aria-label="Next month" onClick={() => setMonth((m) => Math.min(11, m + 1))} />
                </div>
              }
            />
            <div className="p-3">
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="pb-1 text-center text-caption font-semibold uppercase tracking-wide text-ink-subtle">
                    {d}
                  </div>
                ))}
                {cells.map((day, i) => {
                  if (day === null) return <div key={`e${i}`} />;
                  const dateIso = iso(year, month, day);
                  const dow = new Date(year, month, day).getDay();
                  const weekend = dow === 0 || dow === 6;
                  const holiday = PUBLIC_HOLIDAYS.includes(dateIso);
                  const dayAbs = absencesOn(dateIso);
                  const isToday = dateIso === '2026-09-14';
                  return (
                    <div
                      key={dateIso}
                      className={cn(
                        'min-h-[64px] rounded-control border p-1',
                        weekend || holiday ? 'border-line bg-surface-2' : 'border-line bg-surface',
                        isToday && 'ring-2 ring-primary'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn('tabular text-caption', weekend ? 'text-ink-subtle' : 'text-ink-muted')}>{day}</span>
                        {holiday && <span className="text-caption text-danger">Hol</span>}
                      </div>
                      <div className="mt-0.5 space-y-0.5">
                        {dayAbs.slice(0, 2).map((a) => (
                          <div key={a.employee} className={cn('truncate rounded-[3px] px-1 text-caption', TYPE_COLOR[a.type], a.status === 'pending' && 'opacity-60')} title={`${a.employee} — ${a.typeLabel}`}>
                            {a.employee.split(' ')[0]}
                          </div>
                        ))}
                        {dayAbs.length > 2 && <div className="px-1 text-caption text-ink-subtle">+{dayAbs.length - 2}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
                {(Object.keys(TYPE_COLOR) as LeaveType[]).slice(0, 4).map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-caption text-ink-muted">
                    <span className={cn('h-2.5 w-2.5 rounded-[3px]', TYPE_COLOR[t])} aria-hidden />
                    <span className="capitalize">{t}</span>
                  </span>
                ))}
                <span className="text-caption text-ink-subtle">Faded = pending approval</span>
              </div>
            </div>
          </Card>

          <Card className="col-span-12 xl:col-span-4">
            <CardHeader title="Upcoming absences" level={3} />
            <ul className="divide-y divide-line">
              {[...TEAM_ABSENCES].sort((a, b) => a.startDate.localeCompare(b.startDate)).map((a) => (
                <li key={`${a.employee}-${a.startDate}`} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-body text-ink">{a.employee}</span>
                    <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-caption font-medium capitalize', TYPE_COLOR[a.type])}>{a.typeLabel}</span>
                  </div>
                  <p className="tabular mt-0.5 text-caption text-ink-subtle">
                    {formatDate(a.startDate)} – {formatDate(a.endDate)} · {a.status === 'pending' ? 'Pending' : 'Approved'}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
