import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { formatInTimeZone } from 'date-fns-tz';

export async function GET() {
  try {
    const timeZone = 'Asia/Tokyo';
    const now = new Date();
    const dateString = formatInTimeZone(now, timeZone, 'yyyy-MM-dd');

    const recordsRef = collection(db, 'weather_data', dateString, 'records');
    const q = query(recordsRef, orderBy('timestamp', 'desc'), limit(1));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ message: '本日のデータはまだありません。' }, { status: 404 });
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const utcDate = (data.timestamp as Timestamp).toDate();
    const jstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));

    const latestData = {
      pressure: data.pressure,
      timestamp: jstDate.toISOString(),
    };

    return NextResponse.json(latestData);

  } catch (error) {
    console.error("Error fetching latest pressure data:", error);
    return NextResponse.json({ error: '最新の気圧データの取得に失敗しました。' }, { status: 500 });
  }
}
