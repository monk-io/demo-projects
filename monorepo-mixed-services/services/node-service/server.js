const express = require("express");
const redis = require("redis");
const { MongoClient } = require("mongodb");
const mysql = require("mysql");

const app = express();
const port = process.env.PORT || 3000;

// Connect to Redis
const redisUrl = process.env.REDIS_URL;
const redisClient = redis.createClient({ url: redisUrl });
redisClient
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Redis error:", err));

// Connect to MongoDB
const mongoUrl = process.env.MONGO_URL;
const mongoClient = new MongoClient(mongoUrl);
mongoClient
  .connect()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB error:", err));

// Connect to MySQL
const mysqlUrl = process.env.MYSQL_URL;
// Parse URL: expect format mysql://user:password@host:port/db
const dbUrlPattern = /mysql:\/\/(.*):(.*)@(.*):(\d+)\/(.*)/;
const match = mysqlUrl.match(dbUrlPattern);
if (!match) {
  console.error("Invalid MYSQL_URL");
} else {
  const connection = mysql.createConnection({
    host: match[3],
    port: match[4],
    user: match[1],
    password: match[2],
    database: match[5],
  });
  connection.connect((err) => {
    if (err) {
      console.error("MySQL connection error:", err);
    } else {
      console.log("Connected to MySQL");
    }
  });
}

app.get("/", (req, res) => {
  res.send(
    "Node.js service is running and connected to Redis, MongoDB, and MySQL."
  );
});

app.listen(port, () => {
  console.log(`Node.js service listening on port ${port}`);
});
