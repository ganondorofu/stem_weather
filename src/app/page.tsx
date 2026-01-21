
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Thermometer, Droplets, Gauge, CalendarDays, AlertCircle, CloudOff, SunDim, TrendingUp, History, ChevronDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherChart } from '@/components/weather-chart';
import { DailySummaryChart } from '@/components/daily-summary-chart';
import { getDailyWeather, getDailySummaries } from '@/app/actions';
import type { WeatherDataPoint, DailySummary } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type ViewMode = 'daily' | 'range';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  
  // Daily view state
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dailyData, setDailyData] = useState<WeatherDataPoint[]>([]);

  // Range view state (no more user selection)
  const [rangeData, setRangeData] = useState<DailySummary[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const fetchDailyData = (selectedDate: Date) => {
    startTransition(async () => {
      setError(null);
      setDailyData([]);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const result = await getDailyWeather(dateString);

      if ('error' in result) {
        setError(result.error);
        setDailyData([]);
      } else {
        setDailyData(result.records);
      }
    });
  };

  const fetchRangeData = () => {
    const to = new Date();
    const from = addDays(to, -29);

    startTransition(async () => {
      setError(null);
      setRangeData([]);
      const result = await getDailySummaries(from, to);
      if ('error' in result) {
        setError(result.error);
        setRangeData([]);
      } else {
        setRangeData(result.summaries);
      }
    });
  };

  useEffect(() => {
    if (viewMode === 'daily') {
        if(date){
            fetchDailyData(date);
        }
    } else if (viewMode === 'range') {
        fetchRangeData();
    }
  }, [viewMode, date]);

  useEffect(() => {
    // Initial data fetch on component mount
    if (viewMode === 'daily' && date) {
      fetchDailyData(date);
    } else if (viewMode === 'range') {
      fetchRangeData();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(new Date(selectedDate));
    }
  };

  const isDataAvailable = useMemo(() => {
    if (viewMode === 'daily') return dailyData.length > 0;
    if (viewMode === 'range') return rangeData.length > 0;
    return false;
  }, [viewMode, dailyData, rangeData]);

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary"/>
                <h1 className="text-2xl font-bold font-headline">STEM研究部気象情報</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <History className="h-4 w-4 mr-2" />
                  履歴データ
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>過去のデータ（表）</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/history/temperature">気温</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history/humidity">湿度</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history/pressure">気圧</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history/wbgt">WBGT</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>長期トレンド（グラフ）</DropdownMenuLabel>
                 <DropdownMenuItem asChild>
                  <Link href="/trends/temperature">気温</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trends/humidity">湿度</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trends/pressure">気圧</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trends/wbgt">WBGT</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-md">
              <CardHeader>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="daily">1日の変化</TabsTrigger>
                    <TabsTrigger value="range">過去30日の変化</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="flex justify-center">
                {viewMode === 'daily' ? (
                  <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      disabled={isPending}
                      className="rounded-md border"
                      locale={ja}
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>過去30日間の気象データの推移を表示しています。</p>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
           {isPending ? (
             <div className="space-y-8">
                <Skeleton className="h-[365px] w-full rounded-lg" />
                <Skeleton className="h-[365px] w-full rounded-lg" />
                <Skeleton className="h-[365px] w-full rounded-lg" />
                <Skeleton className="h-[365px] w-full rounded-lg" />
             </div>
           ) : error ? (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed h-full min-h-[500px]">
                  <Alert variant="destructive" className="w-full max-w-md border-0">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>データを読み込めませんでした</AlertTitle>
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
              </div>
           ) : isDataAvailable ? (
            <>
            {viewMode === 'daily' ? (
              <>
                <WeatherChart
                  data={dailyData}
                  dataKey="temperature"
                  title="気温"
                  description="気温の変化"
                  unit="°C"
                  Icon={Thermometer}
                  strokeColor="hsl(var(--chart-1))"
                />
                <WeatherChart
                  data={dailyData}
                  dataKey="humidity"
                  title="湿度"
                  description="湿度の変化"
                  unit="%"
                  Icon={Droplets}
                  strokeColor="hsl(var(--chart-2))"
                />
                <WeatherChart
                  data={dailyData}
                  dataKey="pressure"
                  title="気圧"
                  description="気圧の変化"
                  unit=" hPa"
                  Icon={Gauge}
                  strokeColor="hsl(var(--chart-4))"
                />
                <WeatherChart
                  data={dailyData}
                  dataKey="wbgt"
                  title="WBGT (暑さ指数)"
                  description="WBGTの変化"
                  unit="°C"
                  Icon={SunDim}
                  strokeColor="hsl(var(--chart-5))"
                />
              </>
            ) : (
               <>
                <DailySummaryChart
                  data={rangeData}
                  dataKey="temperature"
                  title="気温"
                  description="日ごとの気温の変化 (平均)"
                  unit="°C"
                  Icon={Thermometer}
                />
                <DailySummaryChart
                  data={rangeData}
                  dataKey="humidity"
                  title="湿度"
                  description="日ごとの湿度の変化 (平均)"
                  unit="%"
                  Icon={Droplets}
                />
                <DailySummaryChart
                  data={rangeData}
                  dataKey="pressure"
                  title="気圧"
                  description="日ごとの気圧の変化 (平均)"
                  unit="hPa"
                  Icon={Gauge}
                />
                <DailySummaryChart
                  data={rangeData}
                  dataKey="wbgt"
                  title="WBGT (暑さ指数)"
                  description="日ごとのWBGTの変化 (平均)"
                  unit="°C"
                  Icon={SunDim}
                />
               </>
            )}
            </>
           ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed text-center p-8 h-full min-h-[500px]">
                <CloudOff className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">記録されたデータがありません</h3>
                <p className="text-muted-foreground mt-2">選択された日付/期間の天気データはありません。</p>
            </div>
           )}
        </div>
      </main>
    </div>
  );
}
