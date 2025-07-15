import mqtt from "mqtt";



// -- definitions of urls

const broker = 'mqtt://localhost:1883';

const pullTopic = "raw"
const pushTopic = "treated"

// -- MQTT client 

const client = mqtt.connect(broker);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(pullTopic); 
});

client.on('error', (error) => {
  console.error('MQTT connection error:', error);
});


let dataBuffer = [];

client.on('message', (topic, message) => {
  console.log(`Received message on topic "${topic}": ${message.toString()}`);

  try {
    const data = JSON.parse(message.toString());
    dataBuffer.push(data.value)
    if(dataBuffer.length > 10){ // window of movign average
      dataBuffer.shift()
    }
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return;
  }

  const avg = dataBuffer.reduce((a,b) => a+b, 0) / dataBuffer.length;

  forwardData(client, avg)
});



function forwardData(client, average) {
  client.publish(pushTopic, JSON.stringify({average:average}))
  
}

