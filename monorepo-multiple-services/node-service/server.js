const http = require("http");
const PORT = process.env.NODE_SERVICE_PORT || 5000;

const server = http.createServer((req, res) => {
  res.end("Hello from node-service!");
});

server.listen(PORT, () => {
  console.log(`node-service running on port ${PORT}`);
});
