
import mqtt from "mqtt"

const topic = "raw"
const broker = "mqtt://localhost:1883"

const client = mqtt.connect(broker);

client.on("connect", ()=>{
    console.log("Simulated data script is connected to MQTT broker") 

    setInterval(()=>{ 
        const randomValue = Math.floor(Math.random()*100)
        client.publish(topic, JSON.stringify({"value": randomValue}) )
        console.log(`Published ${randomValue} to topic: ${topic}`)

    }, 5000)

})

client.on("error", (error)=>{
    console.error(`MQTT connection error: ${error}`)
})

