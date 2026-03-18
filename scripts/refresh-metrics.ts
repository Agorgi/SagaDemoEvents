import { refreshContestEntryMetrics } from "@/src/server/giveaway/refresh-metrics";

async function main() {
  const result = await refreshContestEntryMetrics();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
