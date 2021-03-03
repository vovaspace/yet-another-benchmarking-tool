export const perf: Performance = process.env.IS_BROWSER_ENV
  ? window.performance
  : // eslint-disable-next-line global-require
    require('perf_hooks').performance;
