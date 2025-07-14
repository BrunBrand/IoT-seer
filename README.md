# To Run the PoC:

Install Dependencies: In each service directory, run npm install ws (for the WebSocket service) or npm install if you decide to use package.json files. The dashboard only needs the Chart.js library, which is included via CDN.
Run the Services: Open separate terminal windows for each service and run node index.js in each directory.
Open the Dashboard: Open the dashboard/index.html file in your web browser.
Send Data: Use a tool like curl or Postman to send POST requests to the Data Ingestion Service (http://localhost:3001/data) with a JSON payload like {"value": 25}.