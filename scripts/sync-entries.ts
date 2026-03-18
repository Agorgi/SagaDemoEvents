import { syncContestEntriesFromSheet } from "@/src/server/giveaway/sync-entries";

async function main() {
  const result = await syncContestEntriesFromSheet();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
