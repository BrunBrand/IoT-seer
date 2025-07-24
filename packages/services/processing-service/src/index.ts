import path from "node:path";
import mqtt from "mqtt";
import { z } from "zod";

import { loadConfig } from "@iot-seer/config";
import { DeviceMessage, deviceMessage } from "@iot-seer/types/dist";

const serviceParameterSchema = z.object({
  window: z.number().default(10),
  bufferWindow: z.number().default(10),
});

const rootPath = path.dirname(__filename);
const configFilePath = path.join(rootPath, "config.toml");
const config = loadConfig(
  configFilePath,
  z.object({
    parameters: serviceParameterSchema,
  })
);

const client = mqtt.connect(config.mqttBrokerURL);
console.log("this are the loaded parmeters from config", config.parameters);
console.log("all config", config);
const parameters = serviceParameterSchema.parse(config.parameters);

const devices: Record<string, DeviceMessage[]> = {};

console.log("intial devices object value");
console.log(devices);

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe(config.topics.rawData);
});

client.on("error", (error) => {
  console.error("MQTT connection error:", error);
});

client.on("message", (topic, message) => {
  console.log(`Received message on topic "${topic}": ${message.toString()}`);

  try {
    const data = JSON.parse(message.toString());
    const device = deviceMessage.parse(data);

    if (devices[device.deviceId] === undefined) {
      devices[device.deviceId] = new Array();
    }

    const ref = devices[device.deviceId];
    console.log("length of arr", ref?.length);
    if (ref === undefined) {
      throw Error("reference is undefined");
    }
    if (ref.length >= parameters.window * 2) {
      // #TODO discuss possible I/O procedure to save the content?
      ref.splice(0, parameters.window);
    }
    ref.push(device);

    // example of data calculation based on device type
    const slice = ref.slice(Math.max(ref.length - parameters.window, 0));
    const avg =
      slice.reduce(
        (a, b) =>
          a +
          ((b as DeviceMessage & { data: { speed: number } }).data?.speed ?? 0),
        0
      ) / slice.length;
    console.log("avg : ", avg);
    const consolidatedData = { ...device, processed: { avg: avg } };
    // console.log("object forwarded", temp);
    forwardData(client, consolidatedData);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return;
  }
  console.log("list of all devices up to here:");
  console.log(devices);
});

function forwardData(client: any, average: any) {
  client.publish(
    config.topics.processedData,
    JSON.stringify({ average: average })
  );
}
