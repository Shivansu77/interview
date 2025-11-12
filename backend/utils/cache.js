const { CACHE_CONFIG } = require('../config/constants');

class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, duration = CACHE_CONFIG.DURATION) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      duration
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.duration) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.duration) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const cache = new CacheManager();

// Auto cleanup every 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

module.exports = cache;