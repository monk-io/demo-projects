const http = require("http");
const PORT = process.env.PORT || 3000;
const helper = require("./lib/helper");

const server = http.createServer((req, res) => {
  // Use the helper function (even if not a service)
  const greeting = helper.greet("Visitor");
  res.end("Hello from simple-backend! " + greeting);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
