# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## API Endpoints

This application provides API endpoints to get the latest weather data.

### Get All Latest Weather Data

- **URL:** `/api/weather/latest`
- **Method:** `GET`
- **Description:** Returns the most recently recorded temperature, humidity, pressure and calculated WBGT for the current day (JST).
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

### Get Latest Temperature

- **URL:** `/api/temperature`
- **Method:** `GET`
- **Description:** Returns the most recently recorded temperature for the current day (JST).
- **Success Response (200 OK):**
  ```json
  {
    "temperature": 28.5,
    "timestamp": "2023-10-27T14:30:00.000Z"
  }
  ```

### Get Latest Humidity

- **URL:** `/api/humidity`
- **Method:** `GET`
- **Description:** Returns the most recently recorded humidity for the current day (JST).
- **Success Response (200 OK):**
  ```json
  {
    "humidity": 65.2,
    "timestamp": "2023-10-27T14:30:00.000Z"
  }
  ```

### Get Latest Pressure

- **URL:** `/api/pressure`
- **Method:** `GET`
- **Description:** Returns the most recently recorded pressure for the current day (JST).
- **Success Response (200 OK):**
  ```json
  {
    "pressure": 1012.5,
    "timestamp": "2023-10-27T14:30:00.000Z"
  }
  ```

### Get Latest WBGT

- **URL:** `/api/wbgt`
- **Method:** `GET`
- **Description:** Returns the most recently calculated WBGT for the current day (JST).
- **Success Response (200 OK):**
  ```json
  {
    "wbgt": 27.8,
    "timestamp": "2023-10-27T14:30:00.000Z"
  }
  ```

### Common Error Responses

- **404 Not Found:** Returned if no data is available for the current day.
  ```json
  {
    "message": "本日のデータはまだありません。"
  }
  ```
- **500 Internal Server Error:** Returned if there is an issue fetching the data.
   ```json
  {
    "error": "最新の気象データの取得に失敗しました。"
  }
  ```

### How to use

You can fetch the latest data using any HTTP client. Here is an example using `fetch` in JavaScript to get the latest temperature:

```javascript
async function getLatestTemperature() {
  try {
    const response = await fetch('/api/temperature');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Latest Temperature:', data.temperature);
    console.log('Timestamp:', data.timestamp);
  } catch (error) {
    console.error("Failed to fetch latest temperature data:", error);
  }
}

getLatestTemperature();
```

Here is an example to get all latest data:
```javascript
async function getLatestWeatherData() {
  try {
    const response = await fetch('/api/weather/latest');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Latest Temperature:', data.temperature);
    console.log('Latest Humidity:', data.humidity);
    console.log('Latest Pressure:', data.pressure);
    console.log('Latest WBGT:', data.wbgt);
    console.log('Timestamp:', data.timestamp);
  } catch (error) {
    console.error("Failed to fetch latest weather data:", error);
  }
}

getLatestWeatherData();
```
