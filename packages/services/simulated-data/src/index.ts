import path from "node:path";
import mqtt from "mqtt";
import { loadConfig } from "@iot-seer/config";

const rootPath = path.dirname(__filename);

const configFilePath = path.join(rootPath, "config.toml");
const config = loadConfig(configFilePath);

const client = mqtt.connect(config.mqttBrokerURL);

console.log("--- Simulated Data Service ---");
console.log(`--- Publishing to ${config.topics.rawData}---`);

client.on("connect", () => {
  console.log("Simulated data script is connected to MQTT broker");

  setInterval(() => {
    const randomValue = Math.floor(Math.random() * 100);
    client.publish(
      config.topics.rawData,
      JSON.stringify({ value: randomValue })
    );
    console.log(`Published ${randomValue} to topic: ${config.topics.rawData}`);
  }, 5000);
});

client.on("error", (error) => {
  console.error(`MQTT connection error: ${error}`);
});
