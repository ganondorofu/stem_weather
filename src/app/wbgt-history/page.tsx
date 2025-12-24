
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { addDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { History, ArrowLeft, AlertCircle, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDailySummaries } from '@/app/actions';
import type { DailySummary } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WbgtHistoryPage() {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const to = new Date();
      const from = addDays(to, -365); // Fetch for the last year
      const result = await getDailySummaries(from, to);

      if ('error' in result) {
        setError(result.error);
        setSummaries([]);
      } else {
        // Sort descending by date
        const sortedSummaries = result.summaries.sort((a, b) => b.date.localeCompare(a.date));
        setSummaries(sortedSummaries);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-headline">過去のWBGTデータ</h1>
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
            <CardTitle>WBGT履歴</CardTitle>
            <CardDescription>過去1年間の日ごとのWBGT(暑さ指数)の平均値、最高値、最低値です。</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>データを読み込めませんでした</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : summaries.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">日付</TableHead>
                      <TableHead className="text-right">平均 WBGT (°C)</TableHead>
                      <TableHead className="text-right">最高 WBGT (°C)</TableHead>
                      <TableHead className="text-right">最低 WBGT (°C)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaries.map((summary) => (
                      <TableRow key={summary.date}>
                        <TableCell className="font-medium">
                          {format(parseISO(summary.date), 'yyyy年 M月 d日 (E)', { locale: ja })}
                        </TableCell>
                        <TableCell className="text-right">
                          {summary.wbgt.avg?.toFixed(2) ?? '-'}
                        </TableCell>
                        <TableCell className="text-right text-red-400">
                          {summary.wbgt.max?.toFixed(2) ?? '-'}
                        </TableCell>
                        <TableCell className="text-right text-blue-400">
                          {summary.wbgt.min?.toFixed(2) ?? '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed text-center p-8 min-h-[300px]">
                <CloudOff className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">記録されたデータがありません</h3>
                <p className="text-muted-foreground mt-2">過去1年間のWBGTデータはありませんでした。</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
