import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { formatInTimeZone } from 'date-fns-tz';

export async function GET() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const timeZone = 'Asia/Tokyo';
    const now = new Date();
    const dateString = formatInTimeZone(now, timeZone, 'yyyy-MM-dd');

    const recordsRef = collection(db, 'weather_data', dateString, 'records');
    const q = query(recordsRef, orderBy('timestamp', 'desc'), limit(1));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ message: '本日のデータはまだありません。' }, { status: 404, headers });
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const utcDate = (data.timestamp as Timestamp).toDate();
    const jstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));

    const latestData = {
      humidity: data.humidity,
      timestamp: jstDate.toISOString(),
    };

    return NextResponse.json(latestData, { headers });

  } catch (error) {
    console.error("Error fetching latest humidity data:", error);
    return NextResponse.json({ error: '最新の湿度データの取得に失敗しました。' }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}