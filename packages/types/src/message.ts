import { z } from "zod";

const isoTimestamp = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Invalid ISO 8601 timestamp",
});

const sensorTypeList = [
  "Temperature",
  "Humidity",
  "GPS",
  "Motion",
  "Unspecified",
];
const dataSensorTypeTemperature = z.object({
  value: z.number(),
  unit: z.enum(["C", "F"]),
});
const dataSensorTypeHumidity = z.object({
  value: z.number(),
});
const dataSensorTypeGPS = z.object({
  lat: z.number(),
  lon: z.number(),
  altitude: z.number().optional(),
});

const dataSensorTypeMotion = z.object({
  speed: z.number(),
});

const sensorData = z.union([
  dataSensorTypeTemperature,
  dataSensorTypeHumidity,
  dataSensorTypeGPS,
  dataSensorTypeMotion,
  z.object({}),
]);

const sensorType = z.enum(sensorTypeList);

const fieldLocation = z.object({
  lat: z.number(),
  lon: z.number(),
  place: z.string(),
});

export const deviceMessage = z.object({
  deviceId: z.string(),
  timestamp: isoTimestamp,
  location: fieldLocation,
  sensorType: sensorType,
  data: sensorData,
  metadata: z.object({
    firmware: z.string().optional(),
    rssi: z.number(),
    uptime: z.number(),
  }),
  quality: z.object({ status: z.string(), confidence: z.number() }).optional(),
});

export const deviceMessageCalculated = deviceMessage.extend({
  processed: z.object({}),
});

export type DeviceMessage = z.infer<typeof deviceMessage>;

export type DeviceMessageCalculated = z.infer<typeof deviceMessageCalculated>;
