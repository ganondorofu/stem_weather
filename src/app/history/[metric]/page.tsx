
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { History, ArrowLeft, AlertCircle, CloudOff, Thermometer, Droplets, Gauge, SunDim } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export default function HistoryPage({ params }: { params: { metric: Metric } }) {
  const router = useRouter();
  const metric: Metric = params.metric;

  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const currentMetricDetails = metricDetails[metric] || metricDetails.wbgt;

  useEffect(() => {
    if (!metricDetails[metric]) {
      // Invalid metric, redirect or show error
      router.push('/history/wbgt');
      return;
    }

    startTransition(async () => {
      const to = new Date();
      const from = addDays(to, -365); // Fetch for the last year
      const result = await getDailySummaries(from, to);

      if ('error' in result) {
        setError(result.error);
        setSummaries([]);
      } else {
        const sortedSummaries = result.summaries.sort((a, b) => b.date.localeCompare(a.date));
        setSummaries(sortedSummaries);
      }
    });
  }, [metric, router]);

  const handleTabChange = (value: string) => {
    router.push(`/history/${value}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-headline">過去の気象データ</h1>
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
            <CardTitle>履歴データ</CardTitle>
            <CardDescription>過去365日間の日ごとの気象データです。</CardDescription>
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
              <div className="space-y-8">
                <Skeleton className="h-[300px] w-full" />
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>データを読み込めませんでした</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : summaries.length > 0 ? (
              <div className="space-y-8">
                <DailySummaryChart
                  data={summaries.slice().sort((a, b) => a.date.localeCompare(b.date))}
                  dataKey={metric}
                  title={currentMetricDetails.title}
                  description={`過去365日間の${currentMetricDetails.title}の推移`}
                  unit={currentMetricDetails.unit}
                  Icon={currentMetricDetails.Icon}
                />
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">日付</TableHead>
                        <TableHead className="text-right">平均 {currentMetricDetails.title} ({currentMetricDetails.unit})</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaries.map((summary) => (
                        <TableRow key={summary.date}>
                          <TableCell className="font-medium">
                            {format(parseISO(summary.date), 'yyyy年 M月 d日 (E)', { locale: ja })}
                          </TableCell>
                          <TableCell className="text-right">
                            {summary[metric]?.avg?.toFixed(2) ?? '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
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
