import http from "http"
import WebSocket from "ws";
import mqtt from "mqtt"

const port = 3004
const server = http.createServer();
const broker = "mqtt://localhost:1883"
const pullTopic= "score"

const wss = new WebSocket.Server({ server });
const client = mqtt.connect(broker)

client.on("connect", ()=>{
  console.log("Connected to MQTT broker")
  client.subscribe(pullTopic)
})

client.on("error", (error)=>{
  console.error("MQTT connection error:", error)
})

client.on("message", (topic, message)=> {

  console.log(`Received message on topic "${topic}": ${message.toString()}`);

  try {
    const data = JSON.parse(message.toString());
    console.log(`Publishing data ${data}`)
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });


  } catch (error) {
    console.error('Error parsing JSON:', error);
    return;
  }
})


wss.on('connection', ws => {
  console.log('Client connected');

  wss.on("message", data =>{
    console.log("Received: %s", data)
  })

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


server.listen(port, () => {
  console.log(`WebSocket API Service listening on port ${port}`);
});