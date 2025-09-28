
'use client';

import type { ComponentType } from 'react';
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
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
  }));

  const chartConfig = {
    avg: {
      label: `平均${title}`,
      color: "hsl(var(--chart-1))",
    },
  };

  const yDomain: [string | number, string | number] = ['auto', 'auto'];
  const allValues = data.map(d => d[dataKey].avg).filter(v => v !== null) as number[];
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
          <CardDescription>{description.replace(' (平均/最高/最低)', ' (平均)')}</CardDescription>
        </div>
        <Icon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
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
                   formatter={(value) => {
                     if (typeof value !== 'number') return null;
                     return `${value.toFixed(1)}${unit}`;
                   }}
                   indicator="dot"
                />
              }
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
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
