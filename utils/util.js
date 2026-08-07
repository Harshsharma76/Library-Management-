const client = require("../config/redis");

exports.set_redis_key = async (key, value, expire_time) => {
  // console.log(process.env.DEFAULT_KEY_FOR_REDIS, key);
  const response = await client.set(
    `${process.env.DEFAULT_KEY_FOR_REDIS}:${key}`,
    value,
  );
  if (expire_time)
    await client.expire(
      `${process.env.DEFAULT_KEY_FOR_REDIS}:${key}`,
      expire_time,
    );
  return response;
};

exports.get_redis_key = async (key) =>
  client.get(`${process.env.DEFAULT_KEY_FOR_REDIS}:${key}`);

exports.delete_redis_key = async (key) =>
  client.del(`${process.env.DEFAULT_KEY_FOR_REDIS}:${key}`);
