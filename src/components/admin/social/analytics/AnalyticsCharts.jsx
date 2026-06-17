import React from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";
import { CHART_COLORS, PLATFORM_COLORS, compactNumber, platformLabel } from "./analyticsConfig";

const AXIS = { stroke: "hsl(215 20% 65%)", fontSize: 11 };
const GRID = "hsl(222 40% 18%)";

const tooltipStyle = {
  background: "hsl(224 47% 11%)",
  border: "1px solid hsl(222 40% 18%)",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(210 40% 98%)",
};

export function ChartCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="font-sora font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EngagementOverTime({ data, metric = "engagement" }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#fb923c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={compactNumber} width={48} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => compactNumber(v)} />
        <Area type="monotone" dataKey={metric} stroke="#fb923c" strokeWidth={2} fill="url(#engGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PostsByPlatform({ data }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(222 40% 16% / 0.5)" }} />
        <Bar dataKey="posts" radius={[6, 6, 0, 0]}>
          {data.map((d) => <Cell key={d.key} fill={PLATFORM_COLORS[d.key] || "#fb923c"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Generic horizontal-comparison bar (platform comparison, content type, posting times).
export function ComparisonBars({ data, dataKey = "value", colorByPlatform = false, formatter }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={compactNumber} />
        <YAxis type="category" dataKey="label" tick={AXIS} tickLine={false} axisLine={false} width={96} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(222 40% 16% / 0.5)" }} formatter={(v) => (formatter ? formatter(v) : compactNumber(v))} />
        <Bar dataKey={dataKey} radius={[0, 6, 6, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={colorByPlatform ? (PLATFORM_COLORS[d.key] || "#fb923c") : CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EmptyChart({ label = "Not enough data yet" }) {
  return (
    <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export { platformLabel };