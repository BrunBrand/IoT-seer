import path from "node:path";
import http from "http";
import { WebSocket } from "ws";
import * as mqtt from "mqtt";

import { loadConfig } from "@iot-seer/config";

const rootPath = path.dirname(__filename);

const configFilePath = path.join(rootPath, "config.toml");
const config = loadConfig(configFilePath);

const client = mqtt.connect(config.mqttBrokerURL);

const httpPort = 3004;
const server = http.createServer();

const wss = new WebSocket.Server({ server });

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe(config.topics.analysisResults);
});

client.on("error", (error) => {
  console.error("MQTT connection error:", error);
});

client.on("message", (topic, message) => {
  console.log(`Received message on topic "${topic}": ${message.toString()}`);

  try {
    const data = JSON.parse(message.toString());
    console.log(`Publishing data ${data}`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return;
  }
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  wss.on("message", (data) => {
    console.log("Received: %s", data);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(httpPort, () => {
  console.log(`WebSocket API Service listening on port ${httpPort}`);
});
