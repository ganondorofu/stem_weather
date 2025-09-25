'use server';

import { db } from '@/lib/firebase';
import type { WeatherDataPoint } from '@/lib/types';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

function calculateWBGT(Ta: number, RH: number): number {
  // 湿球温度（Tw）の計算（Stullの近似式）
  const Tw =
    Ta * Math.atan(0.151977 * Math.pow(RH + 8.313659, 0.5)) +
    Math.atan(Ta + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035;

  // 屋内WBGTの計算
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
      // JSTに変換するために9時間加算
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
