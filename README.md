# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## API Endpoints

This application provides an API endpoint to get the latest weather data.

### Get Latest Weather Data

- **URL:** `/api/temperature`
- **Method:** `GET`
- **Description:** Returns the most recently recorded weather data for the current day (JST).
- **Success Response (200 OK):**
  ```json
  {
    "temperature": 28.5,
    "humidity": 65.2,
    "pressure": 1012.5,
    "wbgt": 27.8,
    "timestamp": "2023-10-27T14:30:00.000Z"
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "message": "本日のデータはまだありません。"
  }
  ```
- **Error Response (500 Internal Server Error):**
   ```json
  {
    "error": "最新の気象データの取得に失敗しました。"
  }
  ```

### How to use

You can fetch the latest data using any HTTP client. Here is an example using `fetch` in JavaScript:

```javascript
async function getLatestWeather() {
  try {
    const response = await fetch('/api/temperature');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Latest Temperature:', data.temperature);
    console.log('Latest Humidity:', data.humidity);
    console.log('Latest Pressure:', data.pressure);
    console.log('Latest WBGT:', data.wbgt);
  } catch (error) {
    console.error("Failed to fetch latest weather data:", error);
  }
}

getLatestWeather();
```
