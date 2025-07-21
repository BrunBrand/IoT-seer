import path from "node:path";
import mqtt from "mqtt";

import { loadConfig } from "@iot-seer/config";

const rootPath = path.dirname(__filename);
const configFilePath = path.join(rootPath, "config.toml");
const config = loadConfig(configFilePath);

const client = mqtt.connect(config.mqttBrokerURL);

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe(config.topics.rawData);
});

client.on("error", (error) => {
  console.error("MQTT connection error:", error);
});

let dataBuffer = [];

client.on("message", (topic, message) => {
  console.log(`Received message on topic "${topic}": ${message.toString()}`);

  try {
    const data = JSON.parse(message.toString());
    dataBuffer.push(data.value);
    if (dataBuffer.length > 10) {
      // window of movign average
      dataBuffer.shift();
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return;
  }

  const avg = dataBuffer.reduce((a, b) => a + b, 0) / dataBuffer.length;

  forwardData(client, avg);
});

function forwardData(client: any, average: any) {
  client.publish(
    config.topics.processedData,
    JSON.stringify({ average: average })
  );
}
