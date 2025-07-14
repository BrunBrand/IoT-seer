const http = require('http');

const port = 3001;
const processingServiceUrl = 'http://localhost:3002';

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

        // Forward data to the Real-Time Processing Service
        forwardData(data, res);
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

function forwardData(data, response) {
  const req = http.request(
    {
      url: processingServiceUrl,
      port: 3002,
      method: 'POST',
      path: '/process',
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
    response.end('Failed to forward data to processing service.');
  });

  req.write(JSON.stringify(data));
  req.end();
}

server.listen(port, () => {
  console.log(`Data Ingestion Service listening on port ${port}`);
});
