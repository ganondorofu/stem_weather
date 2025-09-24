'use server';

import { db } from '@/lib/firebase';
import type { WeatherDataPoint } from '@/lib/types';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { summarizeDailyWeather } from '@/ai/flows/summarize-daily-weather';

export async function getDailyWeather(date: Date): Promise<{ records: WeatherDataPoint[], summary: string | null } | { error: string }> {
  try {
    if (!date) {
        return { records: [], summary: null };
    }
    
    const dateString = format(date, 'yyyy-MM-dd');
    const recordsRef = collection(db, 'weather_data', dateString, 'records');
    const q = query(recordsRef, orderBy('timestamp', 'asc'));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { records: [], summary: null };
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

    try {
        const temperatureData = records.map(r => r.temperature);
        const humidityData = records.map(r => r.humidity);
        const pressureData = records.map(r => r.pressure);
    
        const aiSummary = await summarizeDailyWeather({
          date: dateString,
          temperatureData,
          humidityData,
          pressureData
        });
        
        return {
          records,
          summary: aiSummary.summary
        };

    } catch (aiError) {
        console.error("AI summary generation failed:", aiError);
        // Return data even if AI fails
        return {
            records,
            summary: "Could not generate an AI summary for this data."
        }
    }

  } catch (error) {
    console.error("Error fetching weather data:", error);
    // This could be a configuration or permissions issue.
    if (error instanceof Error && error.message.includes('permission-denied')) {
         return { error: 'Failed to fetch weather data due to Firestore permissions. Please ensure your Firestore rules allow read access to the weather_data collection.' };
    }
    return { error: 'Failed to fetch weather data. Check the server console for more details.' };
  }
}
