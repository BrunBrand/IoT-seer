import http from "http"
import mqtt from "mqtt"
import {z} from "zod"

const port = 3001;
const client = mqtt.connect("mqtt:localhost:1883")

const pushTopic = "raw"

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/data') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Received data:', data);

        forwardData(data, res);
        res.writeHead(200, {"Content-Type": "text/plain"})
        res.end("Data Received")
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON payload');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

function forwardData(data) {
  
  client.publish(pushTopic, JSON.stringify(data))
}

server.listen(port, () => {
  console.log(`Data Ingestion Service listening on port ${port}`);
});
