// SummarizeDailyWeather.ts
'use server';

/**
 * @fileOverview Generates a summary of the weather conditions for a given day using generative AI.
 *
 * - summarizeDailyWeather - A function that generates the weather summary.
 * - SummarizeDailyWeatherInput - The input type for the summarizeDailyWeather function.
 * - SummarizeDailyWeatherOutput - The return type for the summarizeDailyWeather function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDailyWeatherInputSchema = z.object({
  date: z.string().describe('The date for which to summarize weather data in YYYY-MM-DD format.'),
  temperatureData: z.array(z.number()).describe('An array of temperature readings for the day.'),
  humidityData: z.array(z.number()).describe('An array of humidity readings for the day.'),
  pressureData: z.array(z.number()).describe('An array of pressure readings for the day.'),
});
export type SummarizeDailyWeatherInput = z.infer<typeof SummarizeDailyWeatherInputSchema>;

const SummarizeDailyWeatherOutputSchema = z.object({
  summary: z.string().describe('A summary of the weather conditions for the day.'),
});
export type SummarizeDailyWeatherOutput = z.infer<typeof SummarizeDailyWeatherOutputSchema>;

const shouldMentionTemperatureTool = ai.defineTool({
  name: 'shouldMentionTemperature',
  description: 'Decides whether to include temperature information in the weather summary.',
  inputSchema: z.object({
    temperatureData: z.array(z.number()).describe('The temperature readings for the day.'),
  }),
  outputSchema: z.boolean().describe('Whether to include temperature information in the summary.'),
}, async (input) => {
  // Implement logic to determine if temperature should be mentioned.
  // For example, check if temperature readings are available and not all the same.
  return input.temperatureData.length > 0 && new Set(input.temperatureData).size > 1;
});

const shouldMentionHumidityTool = ai.defineTool({
  name: 'shouldMentionHumidity',
  description: 'Decides whether to include humidity information in the weather summary.',
  inputSchema: z.object({
    humidityData: z.array(z.number()).describe('The humidity readings for the day.'),
  }),
  outputSchema: z.boolean().describe('Whether to include humidity information in the summary.'),
}, async (input) => {
  // Implement logic to determine if humidity should be mentioned.
  // For example, check if humidity readings are available and not all the same.
  return input.humidityData.length > 0 && new Set(input.humidityData).size > 1;
});

const shouldMentionPressureTool = ai.defineTool({
  name: 'shouldMentionPressure',
  description: 'Decides whether to include pressure information in the weather summary.',
  inputSchema: z.object({
    pressureData: z.array(z.number()).describe('The pressure readings for the day.'),
  }),
  outputSchema: z.boolean().describe('Whether to include pressure information in the summary.'),
}, async (input) => {
  // Implement logic to determine if pressure should be mentioned.
  // For example, check if pressure readings are available and not all the same.
  return input.pressureData.length > 0 && new Set(input.pressureData).size > 1;
});

export async function summarizeDailyWeather(input: SummarizeDailyWeatherInput): Promise<SummarizeDailyWeatherOutput> {
  return summarizeDailyWeatherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDailyWeatherPrompt',
  input: {schema: SummarizeDailyWeatherInputSchema},
  output: {schema: SummarizeDailyWeatherOutputSchema},
  tools: [shouldMentionTemperatureTool, shouldMentionHumidityTool, shouldMentionPressureTool],
  prompt: `Summarize the weather conditions for {{date}}.\n\n` +
    `{% if shouldMentionTemperatureTool(temperatureData=temperatureData) %}` +
    `Temperature readings ranged from a low of {{minTemperature}} to a high of {{maxTemperature}}.\n` +
    `{% endif %}` +
    `{% if shouldMentionHumidityTool(humidityData=humidityData) %}` +
    `Humidity levels ranged from a low of {{minHumidity}} to a high of {{maxHumidity}}.\n` +
    `{% endif %}` +
    `{% if shouldMentionPressureTool(pressureData=pressureData) %}` +
    `Pressure readings ranged from a low of {{minPressure}} to a high of {{maxPressure}}.\n` +
    `{% endif %}`,
  system: `You are a weather reporter summarizing daily weather conditions.  Use the tools to decide if you should mention a piece of data or not.`
});

const summarizeDailyWeatherFlow = ai.defineFlow(
  {
    name: 'summarizeDailyWeatherFlow',
    inputSchema: SummarizeDailyWeatherInputSchema,
    outputSchema: SummarizeDailyWeatherOutputSchema,
  },
  async input => {
    // Calculate min/max values
    const minTemperature = Math.min(...input.temperatureData);
    const maxTemperature = Math.max(...input.temperatureData);
    const minHumidity = Math.min(...input.humidityData);
    const maxHumidity = Math.max(...input.humidityData);
    const minPressure = Math.min(...input.pressureData);
    const maxPressure = Math.max(...input.pressureData);

    const {output} = await prompt({
      ...input,
      minTemperature,
      maxTemperature,
      minHumidity,
      maxHumidity,
      minPressure,
      maxPressure,
    });
    return output!;
  }
);
