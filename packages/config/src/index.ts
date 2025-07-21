import { readFileSync } from "fs";
import { z } from "zod";
import toml from "toml";

const userDefinedConfigs = {
  serviceName: z.string(),
} satisfies Record<string, z.ZodType>;

const baseTopicsSchema = z.object({
  rawData: z.string().default("raw"),
  processedData: z.string().default("treated"),
  analysisResults: z.string().default("score"),
});

const systemDefaultedConfigs = {
  nodeEnv: z.enum(["development", "production"]).default("development"),
  mqttBrokerURL: z.string().default("mqtt://localhost:1883"),
  httpPort: z.coerce.number().default(3000),
  topics: baseTopicsSchema,
} satisfies Record<string, z.ZodType>;

const configSchema = z.object({
  ...userDefinedConfigs,
  ...systemDefaultedConfigs,
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(filePath: string) {
  const tomlConfig = toml.parse(readFileSync(filePath, "utf-8"));
  const parsedConfig = configSchema.parse(tomlConfig);
  return parsedConfig;
}
