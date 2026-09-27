/**
 * Helper to retry an async function with exponential backoff (2s, 4s, 8s...)
 */
async function retryWithExponentialBackoff(fn, maxRetries = 3, initialDelayMs = 2000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw error;
      }
      const waitTime = initialDelayMs * Math.pow(2, attempt - 1);
      console.log(`[Scraper Retry] Attempt ${attempt}/${maxRetries} failed: "${error.message}". Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

module.exports = { retryWithExponentialBackoff };
