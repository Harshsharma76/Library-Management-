const asyncRedis = require("async-redis");

const client = asyncRedis.createClient(6379, "127.0.0.1");

// const client = redis.createClient(6379, '127.0.0.1')

client.on("connect", () => {
  console.log("Redis connection opened");
});

client.on("error", (err) => {
  console.log("Redis connection error: " + err);
});

module.exports = client;
