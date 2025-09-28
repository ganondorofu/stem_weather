
export interface WeatherDataPoint {
  temperature: number;
  humidity: number;
  pressure: number;
  hour: number;
  minute: number;
  year: number;
  month: number;
  day: number;
  timestamp: Date;
  time: string; 
  wbgt: number;
}

export interface DailySummary {
  date: string; // "yyyy-MM-dd"
  temperature: {
    avg: number | null;
    max: number | null;
    min: number | null;
  };
  humidity: {
    avg: number | null;
    max: number | null;
    min: number | null;
  };
  pressure: {
    avg: number | null;
    max: number | null;
    min: number | null;
  };
  wbgt: {
    avg: number | null;
    max: number | null;
    min: number | null;
  };
}
