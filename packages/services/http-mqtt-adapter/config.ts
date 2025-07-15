// src/config.ts
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  MQTT_BROKER_URL: z.string().default('mqtt://localhost:1883'),
  HTTP_PORT: z.coerce.number().default(3000),
  SERVICE_NAME: z.string(),
  TOPICS: z.object({
    RAW_DATA: z.string().default('raw'),
    PROCESSED_DATA: z.string().default('treated'),
    ANALYSIS_RESULTS: z.string().default('score')
  })
});

export type Config = z.infer<typeof configSchema>;
export const config = configSchema.parse({
  ...process.env,
  TOPICS: {
    RAW_DATA: process.env.TOPIC_RAW,
    PROCESSED_DATA: process.env.TOPIC_PROCESSED,
    ANALYSIS_RESULTS: process.env.TOPIC_ANALYSIS
  }
});