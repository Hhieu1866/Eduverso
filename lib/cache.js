// cơ chế cache đơn giản cho các truy vấn MongoDB
const cache = new Map();

// thời gian cache mặc định (30 phút)
const DEFAULT_CACHE_TIME = 30 * 60 * 1000;

export function getCache(key) {
  if (!key) return null;

  const item = cache.get(key);
  if (!item) return null;

  // Kiểm tra xem cache có hết hạn không
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.data;
}

export function setCache(key, data, ttl = DEFAULT_CACHE_TIME) {
  if (!key) return;

  const expiry = Date.now() + ttl;
  cache.set(key, { data, expiry });
}

export function deleteCache(key) {
  if (key) cache.delete(key);
}

export function clearCache() {
  cache.clear();
}

export function createCacheKey(prefix, ...args) {
  return `${prefix}:${args.map((arg) => JSON.stringify(arg)).join(":")}`;
}

export function withCache(fn, prefix, ttl = DEFAULT_CACHE_TIME) {
  return async function (...args) {
    const cacheKey = createCacheKey(prefix, ...args);
    const cachedData = getCache(cacheKey);

    if (cachedData) {
      console.log(`[Cache] Hit: ${cacheKey}`);
      return cachedData;
    }

    console.log(`[Cache] Miss: ${cacheKey}`);
    const result = await fn.apply(this, args);
    setCache(cacheKey, result, ttl);
    return result;
  };
}
