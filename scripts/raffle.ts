import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { activeCampaign, getCampaignPhase } from "@/src/giveaway/config";
import { getFinalistPoolForRaffle } from "@/src/giveaway/data";

function getArg(name: string) {
  const directMatch = process.argv.find((argument) => argument.startsWith(`--${name}=`));
  if (directMatch) {
    return directMatch.split("=").slice(1).join("=");
  }

  const index = process.argv.findIndex((argument) => argument === `--${name}`);
  if (index >= 0) {
    return process.argv[index + 1];
  }

  return undefined;
}

function assertArg(value: string | undefined, message: string) {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let next = (seed += 0x6d2b79f5);
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: string) {
  const generator = mulberry32(hashSeed(seed));
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(generator() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [
      nextItems[swapIndex],
      nextItems[index]
    ];
  }

  return nextItems;
}

async function main() {
  const seed = assertArg(
    getArg("seed"),
    'Provide a seed with --seed="COS-YYYY-MM".'
  );
  const winnersRequested = Number(getArg("winners") ?? activeCampaign.winnerCount);

  if (!Number.isFinite(winnersRequested) || winnersRequested <= 0) {
    throw new Error("--winners must be a positive integer.");
  }

  const finalistPool = await getFinalistPoolForRaffle();

  if (finalistPool.length === 0) {
    throw new Error("No eligible finalists were found for the current campaign.");
  }

  const winners = seededShuffle(finalistPool, seed).slice(
    0,
    Math.min(finalistPool.length, Math.floor(winnersRequested))
  );
  const artifact = {
    campaign: activeCampaign.slug,
    title: activeCampaign.title,
    timestamp: new Date().toISOString(),
    seed,
    finalistPool,
    winners
  };
  const outputPath = path.join(process.cwd(), "data", "raffle-results.json");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  process.stdout.write(
    [
      `Saved raffle artifact to ${outputPath}`,
      `Campaign: ${activeCampaign.slug}`,
      `Phase: ${getCampaignPhase(new Date(), activeCampaign)}`,
      `Finalists: ${finalistPool.length}`,
      `Winners drawn: ${winners.length}`,
      `Seed: ${seed}`,
      `Winners: ${winners.map((winner) => winner.displayName).join(", ")}`
    ].join("\n") + "\n"
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

