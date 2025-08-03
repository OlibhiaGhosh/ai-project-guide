// import { createClient } from "redis"
// require('dotenv').config()
// const client = createClient({
//   url: process.env.REDIS_URL
// });

// client.on("error", function(err) {
//   throw err;
// });
// await client.connect()
// await client.set('foo','bar');

// // Disconnect after usage
// await client.disconnect();
import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()

await redis.set("foo", "bar");
await redis.get("foo");