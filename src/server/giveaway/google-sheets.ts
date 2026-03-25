import { JWT } from "google-auth-library";

import { getRequiredEnv, optionalEnv } from "@/src/server/env";
import {
  normalizeSheetRecords,
  type NormalizedSheetRow
} from "@/src/server/giveaway/sheet-schema";

function getGoogleJwt() {
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });
}

function hasGoogleServiceAccountConfig() {
  return Boolean(
    process.env.GOOGLE_SHEET_ID?.trim() &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
      process.env.GOOGLE_PRIVATE_KEY?.trim()
  );
}

function getPublicSheetCsvUrl() {
  const explicitUrl = optionalEnv("GOOGLE_SHEET_CSV_URL");

  if (explicitUrl) {
    return explicitUrl;
  }

  const sheetId = optionalEnv("GOOGLE_SHEET_ID");

  if (!sheetId) {
    return null;
  }

  const gid = optionalEnv("GOOGLE_SHEET_GID") ?? "0";
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

export function hasGoogleSheetConfig() {
  return hasGoogleServiceAccountConfig() || Boolean(getPublicSheetCsvUrl());
}

function parseCsvRows(csvText: string) {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let isInsideQuotes = false;

  const pushField = () => {
    currentRow.push(currentField);
    currentField = "";
  };

  const pushRow = () => {
    if (currentRow.length > 0 || currentField.length > 0) {
      pushField();
      rows.push(currentRow);
    }

    currentRow = [];
  };

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === "\"") {
      if (isInsideQuotes && nextCharacter === "\"") {
        currentField += "\"";
        index += 1;
        continue;
      }

      isInsideQuotes = !isInsideQuotes;
      continue;
    }

    if (!isInsideQuotes && character === ",") {
      pushField();
      continue;
    }

    if (!isInsideQuotes && character === "\n") {
      pushRow();
      continue;
    }

    if (!isInsideQuotes && character === "\r") {
      if (nextCharacter === "\n") {
        index += 1;
      }
      pushRow();
      continue;
    }

    currentField += character;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    pushRow();
  }

  return rows;
}

async function fetchSheetEntriesFromCsv() {
  const csvUrl = getPublicSheetCsvUrl();

  if (!csvUrl) {
    throw new Error("Google Sheet CSV fallback is not configured.");
  }

  const response = await fetch(csvUrl, {
    cache: "no-store",
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Google Sheet CSV request failed with ${response.status}.`);
  }

  const csvText = await response.text();
  const rows = parseCsvRows(csvText);

  return {
    range: optionalEnv("GOOGLE_SHEET_RANGE") ?? "CSV export",
    rows: normalizeSheetRecords(rows),
    totalRows: Math.max(rows.length - 1, 0)
  };
}

export async function fetchSheetEntries() {
  if (!hasGoogleServiceAccountConfig()) {
    return fetchSheetEntriesFromCsv();
  }

  const sheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const range = optionalEnv("GOOGLE_SHEET_RANGE") ?? "Form Responses 1!A:Z";
  const jwt = getGoogleJwt();
  const { access_token: accessToken } = await jwt.authorize();

  if (!accessToken) {
    throw new Error("Google Sheets authorize call did not return an access token.");
  }

  const endpoint = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`
  );
  endpoint.searchParams.set("majorDimension", "ROWS");

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Google Sheets request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as { values?: string[][] };
  const rows = payload.values ?? [];

  return {
    range,
    rows: normalizeSheetRecords(rows),
    totalRows: Math.max(rows.length - 1, 0)
  };
}

export type { NormalizedSheetRow };
