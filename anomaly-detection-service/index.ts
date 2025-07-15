import mqtt from "mqtt"

const pullTopic="treated"
const pushTopic="score"

const broker="mqtt://localhost:1883"
const client = mqtt.connect(broker)

client.on("connect", ()=>{
  console.log("Connected to MQTT broker")
  client.subscribe(pullTopic);
})

client.on("error", (error)=>{
  console.error("MQTT connection error:", error)
})


client.on("message", (topic, message)=>{

  console.log(`Received message on topic "${topic}": ${message.toString()}`);
  
  try{
    const data = JSON.parse(message)
    const anomalyScore = Math.random()
    forwardData(data.average, anomalyScore) 
  }catch(error){
    console.error("Error parsing JSON:", error)
    return
  }

})

function forwardData(average, anomalyScore) {
  client.publish(pushTopic, JSON.stringify({average, anomalyScore}))
}
