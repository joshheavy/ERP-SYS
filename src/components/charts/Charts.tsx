'use client';

import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { BarChart3Icon } from 'lucide-react';
import { CHART_TOKENS, chartColor } from '../../utils/chart';
import { cn } from '../../utils/cn';

/* Shared tooltip styling so every chart's tooltip matches the design tokens. */
const tooltipProps = {
  cursor: { fill: 'var(--c-surface-3)', opacity: 0.5 },
  contentStyle: {
    background: CHART_TOKENS.tooltipBg,
    border: `1px solid ${CHART_TOKENS.tooltipBorder}`,
    borderRadius: 8,
    fontSize: 12,
    color: CHART_TOKENS.tooltipText,
    boxShadow: 'var(--shadow-pop)',
    padding: '8px 10px'
  },
  labelStyle: { color: CHART_TOKENS.axisText, fontWeight: 600, marginBottom: 2 },
  itemStyle: { padding: 0 }
} as const;

const axisTick = { fill: CHART_TOKENS.axisText, fontSize: 11 };

export interface SeriesDef {
  key: string;
  label: string;
  colorIndex: number;
}

/* ------------------------------------------------------------------ *
 * ChartFrame — shared loading + empty states so every chart handles
 * "every state matters" consistently (per the design brief).
 * ------------------------------------------------------------------ */
interface ChartFrameProps {
  loading?: boolean;
  empty?: boolean;
  emptyLabel?: string;
  height: number;
  /** 'area' | 'bars' | 'donut' — shapes the loading skeleton appropriately. */
  variant?: 'area' | 'bars' | 'donut';
  className?: string;
  children: React.ReactNode;
}

function ChartFrame({ loading, empty, emptyLabel = 'No data to display', height, variant = 'area', className, children }: ChartFrameProps) {
  if (loading) {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        {variant === 'donut' ? (
          <div className="flex h-full items-center justify-center">
            <div className="aspect-square h-[80%] animate-shimmer rounded-full border-[16px] border-surface-3" />
          </div>
        ) : (
          <div className="flex h-full items-end gap-2 px-2 pb-6 pt-2">
            {[62, 45, 78, 52, 84, 40, 70, 58, 90, 48, 66, 74].map((h, i) => (
              <div key={i} className="flex-1 animate-shimmer rounded-t bg-surface-3" style={{ height: `${h}%` }} />
            ))}
          </div>
        )}
      </div>
    );
  }
  if (empty) {
    return (
      <div className={cn('flex w-full flex-col items-center justify-center gap-1 text-center', className)} style={{ height }}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-3 text-ink-subtle">
          <BarChart3Icon className="h-4 w-4" aria-hidden />
        </span>
        <p className="text-small text-ink-muted">{emptyLabel}</p>
      </div>
    );
  }
  return <div className={cn('w-full', className)} style={{ height }}>{children}</div>;
}

/* ------------------------------------------------------------------ *
 * AreaTrend — smooth, curved, gradient-filled area chart.
 * ------------------------------------------------------------------ */
export interface AreaTrendProps {
  data: Array<Record<string, number | string>>;
  xKey: string;
  series: SeriesDef[];
  height?: number;
  /** Formats the tooltip/axis value, e.g. (v) => `KSh ${v}M`. */
  format?: (value: number) => string;
  loading?: boolean;
  className?: string;
}

export function AreaTrend({ data, xKey, series, height = 260, format, loading, className }: AreaTrendProps) {
  return (
    <ChartFrame loading={loading} empty={!data.length} height={height} variant="area" className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor(s.colorIndex)} stopOpacity={0.28} />
                <stop offset="100%" stopColor={chartColor(s.colorIndex)} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={CHART_TOKENS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} stroke={CHART_TOKENS.grid} tickLine={false} axisLine={false} />
          <YAxis tick={axisTick} stroke={CHART_TOKENS.grid} width={44} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipProps} formatter={(v: number, n: string) => [format ? format(v) : v, seriesLabel(series, n)]} />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.key}
              stroke={chartColor(s.colorIndex)}
              strokeWidth={2.5}
              fill={`url(#grad-${s.key})`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--c-surface)' }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------------ *
 * GroupedBars — rounded, grouped bar chart.
 * ------------------------------------------------------------------ */
export interface GroupedBarsProps {
  data: Array<Record<string, number | string>>;
  xKey: string;
  series: SeriesDef[];
  height?: number;
  format?: (value: number) => string;
  loading?: boolean;
  className?: string;
}

export function GroupedBars({ data, xKey, series, height = 260, format, loading, className }: GroupedBarsProps) {
  return (
    <ChartFrame loading={loading} empty={!data.length} height={height} variant="bars" className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4} barCategoryGap="24%">
          <CartesianGrid stroke={CHART_TOKENS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} stroke={CHART_TOKENS.grid} tickLine={false} axisLine={false} />
          <YAxis tick={axisTick} stroke={CHART_TOKENS.grid} width={44} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipProps} formatter={(v: number, n: string) => [format ? format(v) : v, seriesLabel(series, n)]} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.key} fill={chartColor(s.colorIndex)} radius={[4, 4, 0, 0]} maxBarSize={22} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------------ *
 * DonutStat — radial composition with a value in the centre.
 * ------------------------------------------------------------------ */
export interface DonutSlice {
  name: string;
  value: number;
  colorIndex: number;
}

export interface DonutStatProps {
  data: DonutSlice[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  loading?: boolean;
  className?: string;
}

export function DonutStat({ data, height = 220, centerLabel, centerValue, loading, className }: DonutStatProps) {
  return (
    <ChartFrame loading={loading} empty={!data.length} height={height} variant="donut" className={cn('relative', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip {...tooltipProps} />
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="62%" outerRadius="90%" paddingAngle={2} stroke="var(--c-surface)" strokeWidth={2}>
            {data.map((slice) => (
              <Cell key={slice.name} fill={chartColor(slice.colorIndex)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="tabular text-h1 text-ink">{centerValue}</span>}
          {centerLabel && <span className="text-caption uppercase tracking-wide text-ink-subtle">{centerLabel}</span>}
        </div>
      )}
    </ChartFrame>
  );
}

/** A colour-swatch legend for the donut (never colour-alone: name + value shown). */
export function DonutLegend({ data, total, format }: { data: DonutSlice[]; total: number; format?: (v: number) => string }) {
  return (
    <ul className="space-y-1.5">
      {data.map((slice) => (
        <li key={slice.name} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: chartColor(slice.colorIndex) }} aria-hidden />
          <span className="min-w-0 flex-1 truncate text-small text-ink-muted">{slice.name}</span>
          <span className="tabular text-small font-medium text-ink">{format ? format(slice.value) : slice.value}</span>
          <span className="tabular w-9 text-right text-caption text-ink-subtle">{Math.round((slice.value / total) * 100)}%</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ *
 * Sparkline — tiny inline trend for KPI tiles.
 * ------------------------------------------------------------------ */
export function Sparkline({ data, colorIndex = 0, height = 36 }: { data: number[]; colorIndex?: number; height?: number }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
          <Line type="monotone" dataKey="v" stroke={chartColor(colorIndex)} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function seriesLabel(series: SeriesDef[], key: string): string {
  return series.find((s) => s.key === key)?.label ?? key;
}
