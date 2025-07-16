import mqtt from "mqtt"

import {config} from "@iot-seer/config"
import {z} from "zod"

const broker_url=config.MQTT_BROKER_URL
const client = mqtt.connect(broker_url)

const incomingMessageSchema = z.object({"average": z.coerce.number().default(0)})

client.on("connect", ()=>{
  console.log(`Connected to MQTT broker ${broker_url}`)
  client.subscribe(config.TOPICS.PROCESSED_DATA); 
})

client.on("error", (error)=>{
  console.error(`MQTT connection ${broker_url} error:`, error)
})


client.on("message", (topic:string, message:Buffer)=>{

  if(config.NODE_ENV==="development"){
    console.log(`Received message on topic "${topic}": ${message.toString()}`);
  }
  
  try{
    const data = JSON.parse(message.toString())
    const dataValidated = messageValidator(data)
    const anomalyScore = getAnomalyScore()
    forwardData(dataValidated.average, anomalyScore) 
  }catch(error){
    if(error instanceof SyntaxError){
      console.error("Error parsing JSON:", error)
    } else if(error instanceof z.ZodError){
      console.error("Validation error:", error)
    } else {
      console.error("Unexpected error:",error)
    }
  }
})

function messageValidator(message: Object){
  return incomingMessageSchema.parse(message)
}

function forwardData(average:number, anomalyScore:number) {
  client.publish(config.TOPICS.ANALYSIS_RESULTS, JSON.stringify({average, anomalyScore}))
}

function getAnomalyScore(): number{
  return Math.random()
}