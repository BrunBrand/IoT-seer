import path from "node:path";
import http from "http";
import mqtt from "mqtt";
import { z } from "zod";

import { loadConfig } from "@iot-seer/config";

const rootPath = path.dirname(__filename);
const configFilePath = path.join(rootPath, "config.toml");
const config = loadConfig(configFilePath);

const client = mqtt.connect(config.mqttBrokerURL);

const httpAdapterPort = 3001;

const pushTopic = "raw";

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/data") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        console.log("Received data:", data);

        forwardData(data);
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Data Received");
      } catch (error) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid JSON payload");
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

function forwardData(data: any) {
  client.publish(pushTopic, JSON.stringify(data));
}

server.listen(httpAdapterPort, () => {
  console.log(`Data Ingestion Service listening on port ${httpAdapterPort}`);
});
