import path from "node:path";
import mqtt from "mqtt";
import { loadConfig } from "@iot-seer/config";
import { deviceMessage, DeviceMessage } from "@iot-seer/types";

const rootPath = path.dirname(__filename);

const configFilePath = path.join(rootPath, "config.toml");
const config = loadConfig(configFilePath);

const client = mqtt.connect(config.mqttBrokerURL);

console.log("--- Simulated Data Service ---");
console.log(`--- Publishing to ${config.topics.rawData}---`);

const registeredIds = [...Array(10).keys()];

client.on("connect", () => {
  console.log("Simulated data script is connected to MQTT broker");

  setInterval(() => {
    const randomValue = Math.floor(Math.random() * 10);
    const data: DeviceMessage = deviceMessage.parse({
      deviceId: "5",
      timestamp: new Date().toISOString(),
      location: { lat: 1, lon: 2, place: "testPlace" },
      sensorType: "Motion",
      data: { speed: Math.floor(Math.random() * 100) },
      metadata: { firmware: "1", rssi: 1, uptime: 1 },
    });

    client.publish(config.topics.rawData, JSON.stringify(data));
    console.log(`Published ${data} to topic: ${config.topics.rawData}`);
  }, 5000);
});

client.on("error", (error) => {
  console.error(`MQTT connection error: ${error}`);
});
