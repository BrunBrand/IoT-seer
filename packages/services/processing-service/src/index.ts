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
const parameters = serviceParameterSchema.parse(config.parameters);

type mapOfDevices = Record<string, DeviceMessage[]>;
const devices: mapOfDevices = {};

function processMotionData(arrData: DeviceMessage[]) {
  const slice = arrData.slice(Math.max(arrData.length - parameters.window, 0));
  const avg =
    slice.reduce(
      (a, b) =>
        a +
        ((b as DeviceMessage & { data: { speed: number } }).data?.speed ?? 0),
      0
    ) / slice.length;
  return { avg: avg };
}

function processDataFromDevice(deviceMessageList: DeviceMessage[]) {
  const mostRecentDevice = deviceMessageList[deviceMessageList.length - 1];
  if (mostRecentDevice === undefined) {
    return;
  }
  switch (mostRecentDevice.sensorType) {
    case "Motion":
      return processMotionData(deviceMessageList);

    default:
      throw new Error(`Invalid sensorType {mostRecentDevice.sensorType}`);
  }
}

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

    const deviceMessageList = devices[device.deviceId];
    if (deviceMessageList === undefined) {
      throw Error("reference is undefined");
    }
    if (deviceMessageList.length >= parameters.window * 2) {
      // #TODO discuss possible I/O procedure to save the content?
      deviceMessageList.splice(0, parameters.window);
    }
    deviceMessageList.push(device);

    const processedData = processDataFromDevice(deviceMessageList);

    const consolidatedData = { ...device, processed: processedData };
    forwardData(client, consolidatedData);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return;
  }
});

function forwardData(client: any, message: any) {
  client.publish(config.topics.processedData, JSON.stringify(message));
  console.log("pushing");
  console.log(JSON.stringify(message));
}
