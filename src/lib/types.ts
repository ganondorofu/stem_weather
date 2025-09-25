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
  wbgt?: number;
}
