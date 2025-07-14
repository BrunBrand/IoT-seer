const http = require('http');
const WebSocket = require('ws');

const port = 3004;

const server = http.createServer();

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('Client connected');

  wss.on("message", data =>{
    console.log("Received: %s", data)
  })

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.on('request', (req, res) => {
  if(req.headers.upgrade === 'websocket') return 

  if (req.method === 'POST' && req.url === '/publish') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Publishing data:', data);

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        res.writeHead(200, {'Content-Type': 'text/plain'})
        res.end("Data forwarded")
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON payload');
      }
    });
  }
});

server.listen(port, () => {
  console.log(`WebSocket API Service listening on port ${port}`);
});