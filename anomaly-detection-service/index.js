const http = require('http');

const port = 3003;
const websocketServiceUrl = 'http://localhost:3004';

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/analyze') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Analyzing data:', data);

        // Placeholder anomaly detection: return a random score
        const anomalyScore = Math.random();

        // Forward data to the Websocket API Service
        forwardData(data.average, anomalyScore, res);
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

function forwardData(average, anomalyScore, response) {
  const req = http.request(
    {
      url: websocketServiceUrl,
      port: 3004,
      method: 'POST',
      path: '/publish',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    res => {
      let body = '';

      res.on('data', chunk => {
        body += chunk.toString();
      });
      res.on('end', () => {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Data forwarded and processed.');
      });
    }
  );

  req.on('error', error => {
    console.error(error);
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end('Failed to forward data to websocket service.');
  });

  const data = JSON.stringify({average: average, anomalyScore: anomalyScore})
  console.log(`data to be forwaredd ${data}`)
  req.write(data);
  req.end();
}

server.listen(port, () => {
  console.log(`Anomaly Detection Service listening on port ${port}`);
});