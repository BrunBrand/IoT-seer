const http = require('http');

const port = 3002;
const anomalyServiceUrl = 'http://localhost:3003';

let dataBuffer = [];

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/process') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Processing data:', data);

        dataBuffer.push(data.value);
        if (dataBuffer.length > 10) {
          dataBuffer.shift();
        }

        // Calculate average
        const average = dataBuffer.reduce((a, b) => a + b, 0) / dataBuffer.length;

        // Forward data to the Anomaly Detection Service
        forwardData(average, res);
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

function forwardData(average, response) {
  const req = http.request(
    {
      url: anomalyServiceUrl,
      port: 3003,
      method: 'POST',
      path: '/analyze',
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
    response.end('Failed to forward data to anomaly service.');
  });

  req.write(JSON.stringify({ average: average }));
  req.end();
}

server.listen(port, () => {
  console.log(`Real-Time Processing Service listening on port ${port}`);
});