'use server';

import { db } from '@/lib/firebase';
import type { WeatherDataPoint } from '@/lib/types';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export async function getDailyWeather(date: Date): Promise<{ records: WeatherDataPoint[] } | { error: string }> {
  try {
    if (!date) {
        return { records: [] };
    }
    
    const dateString = format(date, 'yyyy-MM-dd');
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
        hour: data.hour,
        minute: data.minute,
        year: data.year,
        month: data.month,
        day: data.day,
        timestamp: timestamp,
        time: format(timestamp, 'HH:mm'),
      };
    });

    return { records };

  } catch (error) {
    console.error("Error fetching weather data:", error);
    // This could be a configuration or permissions issue.
    if (error instanceof Error && error.message.includes('permission-denied')) {
         return { error: 'Failed to fetch weather data due to Firestore permissions. Please ensure your Firestore rules allow read access to the weather_data collection.' };
    }
    return { error: 'Failed to fetch weather data. Check the server console for more details.' };
  }
}
