
'use client';

import type { ComponentType } from 'react';
import {
  Line,
  LineChart,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { DailySummary } from '@/lib/types';

type DataKey = 'temperature' | 'humidity' | 'pressure' | 'wbgt';

interface DailySummaryChartProps {
  data: DailySummary[];
  dataKey: DataKey;
  title: string;
  description: string;
  unit: string;
  Icon: ComponentType<{ className?: string }>;
}

export function DailySummaryChart({
  data,
  dataKey,
  title,
  description,
  unit,
  Icon,
}: DailySummaryChartProps) {
  const chartData = data.map(d => ({
    date: d.date,
    avg: d[dataKey].avg,
    max: d[dataKey].max,
    min: d[dataKey].min,
    range: d[dataKey].min !== null && d[dataKey].max !== null ? [d[dataKey].min, d[dataKey].max] : null,
  }));

  const chartConfig = {
    avg: {
      label: `平均${title}`,
      color: "hsl(var(--chart-1))",
    },
    max: {
      label: `最高${title}`,
      color: "hsl(var(--chart-2))",
    },
    min: {
      label: `最低${title}`,
      color: "hsl(var(--chart-3))",
    },
    range: {
        label: "範囲",
        color: "hsl(var(--chart-1))",
    }
  };

  const yDomain: [string | number, string | number] = ['auto', 'auto'];
  const allValues = data.flatMap(d => [d[dataKey].avg, d[dataKey].max, d[dataKey].min]).filter(v => v !== null) as number[];
  if (allValues.length > 0) {
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max-min) * 0.1 || 1;
    yDomain[0] = Math.floor(min - padding);
    yDomain[1] = Math.ceil(max + padding);
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Icon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(parseISO(value), 'M/d')}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
              domain={yDomain}
              label={{ value: unit, position: 'insideTopLeft', offset: -5, fill: 'hsl(var(--foreground))', fontSize: 12 }}
            />
            <Tooltip
              cursor={{
                stroke: 'hsl(var(--border))',
                strokeWidth: 2,
                strokeDasharray: '3 3',
              }}
              content={
                <ChartTooltipContent
                   labelFormatter={(label) => format(parseISO(label), "PPP", { locale: ja })}
                   formatter={(value, name) => {
                     if (name === 'range') return null;
                     if (typeof value !== 'number') return null;
                     return `${value.toFixed(1)}${unit}`;
                   }}
                   indicator="dot"
                />
              }
            />
             <defs>
              <linearGradient id={`fill-range`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.range.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.range.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
             <Area
              dataKey="range"
              type="monotone"
              fill={`url(#fill-range)`}
              fillOpacity={0.4}
              stroke={chartConfig.range.color}
              strokeWidth={2}
              strokeOpacity={0.5}
              stackId="a"
              connectNulls
              name="範囲"
            />
            <Line
              dataKey="avg"
              type="monotone"
              stroke={chartConfig.avg.color}
              strokeWidth={2.5}
              dot={true}
              activeDot={{ r: 8 }}
              connectNulls
              name={`平均${title}`}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

