export async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withRetry<T>(
  task: () => Promise<T>,
  shouldRetry: (error: unknown, attempt: number) => boolean,
  attempts = 3
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (attempt === attempts || !shouldRetry(error, attempt)) {
        throw error;
      }

      await sleep(250 * 2 ** (attempt - 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Retry attempts exhausted.");
}

export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  task: (item: T, index: number) => Promise<R>
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await task(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(concurrency, items.length || 1)) }, () =>
      worker()
    )
  );

  return results;
}
