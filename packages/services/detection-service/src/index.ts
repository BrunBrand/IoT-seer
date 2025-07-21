import path from "node:path";
import mqtt from "mqtt";
import { z } from "zod";

import { loadConfig } from "@iot-seer/config";

const rootPath = path.dirname(__filename);

const configFilePath = path.join(rootPath, "config.toml");
const config = loadConfig(configFilePath);

const client = mqtt.connect(config.mqttBrokerURL);

const incomingMessageSchema = z.object({
  average: z.coerce.number().default(0),
});

client.on("connect", () => {
  console.log(`Connected to MQTT broker ${config.mqttBrokerURL}}`);
  client.subscribe(config.topics.processedData);
});

client.on("error", (error) => {
  console.error(`MQTT connection ${config.mqttBrokerURL} error:`, error);
});

client.on("message", (topic: string, message: Buffer) => {
  if (config.nodeEnv === "development") {
    console.log(`Received message on topic "${topic}": ${message.toString()}`);
  }

  try {
    const data = JSON.parse(message.toString());
    const dataValidated = messageValidator(data);
    const anomalyScore = getAnomalyScore();
    forwardData(dataValidated.average, anomalyScore);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Error parsing JSON:", error);
    } else if (error instanceof z.ZodError) {
      console.error("Validation error:", error);
    } else {
      console.error("Unexpected error:", error);
    }
  }
});

function messageValidator(message: Object) {
  return incomingMessageSchema.parse(message);
}

function forwardData(average: number, anomalyScore: number) {
  client.publish(
    config.topics.analysisResults,
    JSON.stringify({ average, anomalyScore })
  );
}

function getAnomalyScore(): number {
  return Math.random();
}
