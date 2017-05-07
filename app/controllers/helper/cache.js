import log from '../../utils/log';
import getCacheKey from './cacheKey';

const getCache = (key, options = {}) => async (ctx, next) => {
  const cacheKey = getCacheKey(ctx)(key, options);
  const result = await ctx.cache.get(cacheKey);
  if (result) {
    log.debug(`get cache by key: ${cacheKey}`);
    return ctx.body = {
      success: true,
      result
    };
  }
  ctx.query.cacheKeys = [cacheKey];
  ctx.query.shouldCache = true;
  await next();
};

const setCache = (options = {}) => async (ctx, next) => {
  const { cacheKeys, shouldCache } = ctx.query;
  const { result } = ctx.body;
  const expire = options.expire || 86400 * 3; // three days

  if (cacheKeys && cacheKeys.length && result && shouldCache) {
    for (let i = 0; i < cacheKeys.length; i++) {
      const cacheKey = cacheKeys[i];
      log.debug(`set cache of key: ${cacheKey}`);
      await ctx.cache.set(cacheKey, result, { expire });
    }
  }
};

const removeCache = (keys = []) => async (ctx, next) => {
  const targetKeys = ctx.query.deleteKeys || keys;
  for(let i = 0; i < targetKeys.length; i++) {
    log.debug(`delete cache of key: ${targetKeys[i]}`);
    await ctx.cache.del(targetKeys[i]);
  }
};

export default {
  get: getCache,
  set: setCache,
  del: removeCache
};
