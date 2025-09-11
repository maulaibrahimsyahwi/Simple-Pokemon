// src/hooks/usePokemonCache.js
const CACHE_DURATION = 182 * 24 * 60 * 60 * 1000; // Kurang lebih 6 bulan

export const getCache = (key) => {
  const cachedData = localStorage.getItem(key);
  if (!cachedData) return null;

  const { timestamp, data } = JSON.parse(cachedData);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(key);
    return null;
  }
  return data;
};

export const setCache = (key, data) => {
  const cacheEntry = {
    timestamp: Date.now(),
    data,
  };
  localStorage.setItem(key, JSON.stringify(cacheEntry));
};
