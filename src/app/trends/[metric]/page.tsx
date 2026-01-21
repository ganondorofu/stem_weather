
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDays } from 'date-fns';
import { LineChart, ArrowLeft, AlertCircle, CloudOff, Thermometer, Droplets, Gauge, SunDim } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDailySummaries } from '@/app/actions';
import type { DailySummary } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DailySummaryChart } from '@/components/daily-summary-chart';

type Metric = 'temperature' | 'humidity' | 'pressure' | 'wbgt';

const metricDetails: Record<Metric, { title: string; unit: string; Icon: React.ComponentType<{className?: string}> }> = {
  temperature: { title: '気温', unit: '°C', Icon: Thermometer },
  humidity: { title: '湿度', unit: '%', Icon: Droplets },
  pressure: { title: '気圧', unit: 'hPa', Icon: Gauge },
  wbgt: { title: 'WBGT (暑さ指数)', unit: '°C', Icon: SunDim },
};

export default function TrendsPage({ params: { metric } }: { params: { metric: Metric } }) {
  const router = useRouter();

  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentMetricDetails = metricDetails[metric] || metricDetails.wbgt;

  useEffect(() => {
    if (!metricDetails[metric]) {
      router.push('/trends/wbgt');
      return;
    }

    startTransition(async () => {
      const to = new Date();
      const from = addDays(to, -365);
      const result = await getDailySummaries(from, to);

      if ('error' in result) {
        setError(result.error);
        setSummaries([]);
      } else {
        const sortedSummaries = result.summaries.sort((a, b) => a.date.localeCompare(b.date));
        setSummaries(sortedSummaries);
      }
    });
  }, [metric, router]);

  const handleTabChange = (value: string) => {
    router.push(`/trends/${value}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-headline">長期トレンド</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>過去365日の推移</CardTitle>
            <CardDescription>過去365日間の日ごとの気象データの推移をグラフで確認できます。</CardDescription>
            <Tabs value={metric} onValueChange={handleTabChange} className="pt-4">
              <TabsList>
                <TabsTrigger value="temperature">気温</TabsTrigger>
                <TabsTrigger value="humidity">湿度</TabsTrigger>
                <TabsTrigger value="pressure">気圧</TabsTrigger>
                <TabsTrigger value="wbgt">WBGT</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <Skeleton className="h-[300px] w-full" />
            ) : error ? (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>データを読み込めませんでした</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : summaries.length > 0 ? (
                <DailySummaryChart
                  data={summaries}
                  dataKey={metric}
                  title={currentMetricDetails.title}
                  description={`日ごとの${currentMetricDetails.title}の平均値`}
                  unit={currentMetricDetails.unit}
                  Icon={currentMetricDetails.Icon}
                />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed text-center p-8 min-h-[300px]">
                <CloudOff className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">記録されたデータがありません</h3>
                <p className="text-muted-foreground mt-2">過去365日間の{currentMetricDetails.title}データはありませんでした。</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
