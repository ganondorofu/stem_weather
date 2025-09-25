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
import type { WeatherDataPoint } from '@/lib/types';

interface WeatherChartProps {
  data: WeatherDataPoint[];
  dataKey: keyof Pick<WeatherDataPoint, 'temperature' | 'humidity' | 'pressure' | 'wbgt'>;
  title: string;
  description: string;
  unit: string;
  Icon: ComponentType<{ className?: string }>;
  strokeColor: string;
}

export function WeatherChart({
  data,
  dataKey,
  title,
  description,
  unit,
  Icon,
  strokeColor,
}: WeatherChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: strokeColor,
    },
  };

  const yDomain: [string | number, string | number] = ['auto', 'auto'];
  if (data.length > 0) {
    const values = data.map(d => d[dataKey]).filter(v => v !== undefined) as number[];
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = (max-min) * 0.1 || 1;
      yDomain[0] = Math.floor(min - padding);
      yDomain[1] = Math.ceil(max + padding);
    }
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
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={30}
              tickFormatter={(value) => value.slice(0, 5)} // HH:mm
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}${unit}`}
              domain={yDomain}
            />
            <Tooltip
              cursor={{
                stroke: 'hsl(var(--border))',
                strokeWidth: 2,
                strokeDasharray: '3 3',
              }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => {
                     if (typeof value !== 'number') return null;
                     return `${value.toFixed(2)}${unit}`;
                  }}
                  indicator="dot"
                />
              }
            />
            <Line
              dataKey={dataKey}
              type="monotone"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
