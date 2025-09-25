'use server';

import { db } from '@/lib/firebase';
import type { WeatherDataPoint } from '@/lib/types';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

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
      const timestamp = (data.timestamp as Timestamp).toDate();

      return {
        temperature: data.temperature,
        humidity: data.humidity,
        pressure: data.pressure,
        hour: timestamp.getHours(),
        minute: timestamp.getMinutes(),
        year: timestamp.getFullYear(),
        month: timestamp.getMonth() + 1,
        day: timestamp.getDate(),
        timestamp: timestamp,
        time: `${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}`,
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
