
'use server';

import { db } from '@/lib/firebase';
import type { WeatherDataPoint, DailySummary } from '@/lib/types';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

function calculateWBGT(Ta: number, RH: number): number {
  const Tw =
    Ta * Math.atan(0.151977 * Math.pow(RH + 8.313659, 0.5)) +
    Math.atan(Ta + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035;

  const WBGT = 0.7 * Tw + 0.3 * Ta;
  return WBGT;
}

export async function getDailyWeather(dateString: string): Promise<{ records: WeatherDataPoint[] } | { error: string }> {
  try {
    if (!dateString) {
        return { records: [] };
    }
    
    const recordsRef = collection(db, 'weather_data', dateString, 'records');
    const q = query(recordsRef, orderBy('timestamp', 'asc'));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { records: [] };
    }

    const records: WeatherDataPoint[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const utcDate = (data.timestamp as Timestamp).toDate();
      const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

      const temperature = data.temperature;
      const humidity = data.humidity;
      const wbgt = calculateWBGT(temperature, humidity);

      return {
        temperature: temperature,
        humidity: humidity,
        pressure: data.pressure,
        hour: jstDate.getUTCHours(),
        minute: jstDate.getUTCMinutes(),
        year: jstDate.getUTCFullYear(),
        month: jstDate.getUTCMonth() + 1,
        day: jstDate.getUTCDate(),
        timestamp: jstDate,
        time: `${String(jstDate.getUTCHours()).padStart(2, '0')}:${String(jstDate.getUTCMinutes()).padStart(2, '0')}`,
        wbgt: wbgt,
      };
    });

    return { records };

  } catch (error) {
    console.error("Error fetching weather data:", error);
    if (error instanceof Error && error.message.includes('permission-denied')) {
         return { error: 'Firestoreの権限設定により、気象データの取得に失敗しました。Firestoreのルールでweather_dataコレクションへの読み取りアクセスが許可されていることを確認してください。' };
    }
    return { error: '気象データの取得に失敗しました。詳細はサーバーコンソールを確認してください。' };
  }
}

export async function getDailySummaries(startDate: Date, endDate: Date): Promise<{ summaries: DailySummary[] } | { error: string }> {
  try {
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    const dateStrings = dateInterval.map(d => format(d, 'yyyy-MM-dd'));

    const promises = dateStrings.map(dateString => getDailyWeather(dateString));
    const results = await Promise.all(promises);

    const summaries: DailySummary[] = results.map((result, index) => {
      const date = dateStrings[index];
      if ('error' in result || result.records.length === 0) {
        return {
          date,
          temperature: { avg: null, max: null, min: null },
          humidity: { avg: null, max: null, min: null },
          pressure: { avg: null, max: null, min: null },
          wbgt: { avg: null, max: null, min: null },
        };
      }

      const records = result.records;
      const temperatures = records.map(r => r.temperature).filter(t => t !== undefined && t !== null) as number[];
      const humidities = records.map(r => r.humidity).filter(h => h !== undefined && h !== null) as number[];
      const pressures = records.map(r => r.pressure).filter(p => p !== undefined && p !== null) as number[];
      const wbgts = records.map(r => r.wbgt).filter(w => w !== undefined && w !== null) as number[];

      const calculateStats = (arr: number[]) => {
        if (arr.length === 0) return { avg: null, max: null, min: null };
        const sum = arr.reduce((a, b) => a + b, 0);
        return {
          avg: sum / arr.length,
          max: Math.max(...arr),
          min: Math.min(...arr),
        };
      };

      return {
        date,
        temperature: calculateStats(temperatures),
        humidity: calculateStats(humidities),
        pressure: calculateStats(pressures),
        wbgt: calculateStats(wbgts),
      };
    }).filter(summary => summary.temperature.avg !== null); // Only return days with data

    return { summaries };

  } catch (error) {
    console.error("Error fetching daily summaries:", error);
     if (error instanceof Error && error.message.includes('permission-denied')) {
         return { error: 'Firestoreの権限設定により、気象データの取得に失敗しました。Firestoreのルールでweather_dataコレクションへの読み取りアクセスが許可されていることを確認してください。' };
    }
    return { error: '日ごとの集計データの取得に失敗しました。詳細はサーバーコンソールを確認してください。' };
  }
}
