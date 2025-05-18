/**
 * Một cơ chế cache đơn giản cho các truy vấn MongoDB
 */

// Đối tượng lưu trữ cache
const cache = new Map();

// Thời gian cache mặc định (30 phút)
const DEFAULT_CACHE_TIME = 30 * 60 * 1000;

/**
 * Lấy dữ liệu từ cache
 * @param {string} key Khóa cache
 * @returns {Object|null} Dữ liệu từ cache hoặc null nếu không tìm thấy
 */
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

/**
 * Lưu dữ liệu vào cache
 * @param {string} key Khóa cache
 * @param {any} data Dữ liệu cần lưu
 * @param {number} ttl Thời gian sống của cache (ms)
 */
export function setCache(key, data, ttl = DEFAULT_CACHE_TIME) {
  if (!key) return;

  const expiry = Date.now() + ttl;
  cache.set(key, { data, expiry });
}

/**
 * Xóa một mục trong cache
 * @param {string} key Khóa cache cần xóa
 */
export function deleteCache(key) {
  if (key) cache.delete(key);
}

/**
 * Xóa toàn bộ cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Tạo khóa cache từ tên hàm và các tham số
 * @param {string} prefix Tiền tố cho khóa (thường là tên hàm)
 * @param {Array} args Các tham số
 * @returns {string} Khóa cache
 */
export function createCacheKey(prefix, ...args) {
  return `${prefix}:${args.map((arg) => JSON.stringify(arg)).join(":")}`;
}

/**
 * Decorator để cache kết quả của một hàm async
 * @param {Function} fn Hàm cần cache kết quả
 * @param {string} prefix Tiền tố cho khóa cache
 * @param {number} ttl Thời gian sống của cache
 * @returns {Function} Hàm mới có cache
 */
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
