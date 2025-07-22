import { z } from "zod";

const fieldLocation = z.object({
  lat: z.number(),
  lon: z.number(),
  place: z.string(),
});

const fieldData = z.object({});

export const deviceMessage = z.object({
  deviceId: z.string(),
  timestamp: z.string(),
  location: fieldLocation,
  sensorType: z.string().default("Unspecified"),
  data: fieldData,
  metadata: z.object({
    firmware: z.string().optional(),
    rssi: z.number(),
    uptime: z.number(),
  }),
  quality: z.object({ status: z.string(), confidence: z.number() }).optional(),
});

export type DeviceMessage = z.infer<typeof deviceMessage>;
