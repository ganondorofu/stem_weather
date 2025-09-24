'use client';

import { useState, useEffect, useTransition } from 'react';
import { format } from 'date-fns';
import { Thermometer, Droplets, Gauge, CalendarDays, Sparkles, AlertCircle, CloudOff } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WeatherChart } from '@/components/weather-chart';
import { getDailyWeather } from '@/app/actions';
import type { WeatherDataPoint } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [data, setData] = useState<WeatherDataPoint[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchData = (selectedDate: Date) => {
    startTransition(async () => {
      setError(null);
      const result = await getDailyWeather(selectedDate);

      if ('error' in result) {
        setError(result.error);
        setData([]);
        setSummary(null);
      } else {
        setData(result.records);
        setSummary(result.summary);
      }
    });
  };

  useEffect(() => {
    if (date) {
      fetchData(date);
    }
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
           <CalendarDays className="h-6 w-6 text-primary"/>
           <h1 className="text-2xl font-bold font-headline">WeatherCal</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Select a Date</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={isPending}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary"/>
                        Daily Summary
                    </CardTitle>
                    <CardDescription>
                      {date ? format(date, 'MMMM do, yyyy') : 'No date selected'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[150px]">
                  {isPending && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[75%]" />
                    </div>
                  )}
                  {!isPending && !error && summary && (
                    <p className="text-sm text-foreground/80">{summary}</p>
                  )}
                  {!isPending && !error && data.length > 0 && !summary && (
                     <p className="text-sm text-muted-foreground">Could not generate a summary for this day.</p>
                  )}
                   {!isPending && !error && data.length === 0 && (
                     <p className="text-sm text-muted-foreground">No data available to generate a summary.</p>
                  )}
                  {error && (
                     <Alert variant="destructive">
                       <AlertCircle className="h-4 w-4" />
                       <AlertTitle>Error</AlertTitle>
                       <AlertDescription>{error}</AlertDescription>
                     </Alert>
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
             </div>
           ) : error ? (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed h-full min-h-[500px]">
                  <Alert variant="destructive" className="w-full max-w-md border-0">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Could not load data</AlertTitle>
                    <AlertDescription>
                      There was an error fetching the weather data. Please try again or select a different date.
                    </AlertDescription>
                  </Alert>
              </div>
           ) : data.length > 0 ? (
            <>
              <WeatherChart
                data={data}
                dataKey="temperature"
                title="Temperature"
                description="Hourly temperature readings"
                unit="°C"
                Icon={Thermometer}
                strokeColor="hsl(var(--chart-1))"
              />
              <WeatherChart
                data={data}
                dataKey="humidity"
                title="Humidity"
                description="Hourly humidity levels"
                unit="%"
                Icon={Droplets}
                strokeColor="hsl(var(--chart-2))"
              />
              <WeatherChart
                data={data}
                dataKey="pressure"
                title="Pressure"
                description="Hourly atmospheric pressure"
                unit=" hPa"
                Icon={Gauge}
                strokeColor="hsl(var(--chart-4))"
              />
            </>
           ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed text-center p-8 h-full min-h-[500px]">
                <CloudOff className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Data Recorded</h3>
                <p className="text-muted-foreground mt-2">There is no weather data available for the selected date.</p>
            </div>
           )}
        </div>
      </main>
    </div>
  );
}
