export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function optionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}
