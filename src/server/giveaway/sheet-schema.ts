import { z } from "zod";

import { normalizeEligibilityStatus } from "@/src/server/giveaway/constants";

const urlSchema = z.string().url();

export const normalizedSheetRowSchema = z.object({
  externalEntryId: z.string(),
  creatorName: z.string().min(1),
  publicDisplayName: z.string().min(1),
  profileImageUrl: urlSchema.nullable(),
  thumbnailUrl: urlSchema.nullable(),
  sagaHandle: z.string().nullable(),
  instagramHandle: z.string().nullable(),
  tiktokHandle: z.string().nullable(),
  sagaPostUrl: urlSchema.nullable(),
  instagramPostUrl: urlSchema.nullable(),
  tiktokPostUrl: urlSchema.nullable(),
  entryTitle: z.string().nullable(),
  contentType: z.string().nullable(),
  eligibilityStatus: z.enum([
    "eligible",
    "pending_review",
    "ineligible",
    "disqualified",
    "unknown"
  ]),
  createdAt: z.coerce.date(),
  sourceRowNumber: z.number().int().positive()
});

export type NormalizedSheetRow = z.infer<typeof normalizedSheetRowSchema>;

type FieldKey = keyof Omit<NormalizedSheetRow, "eligibilityStatus" | "createdAt" | "sourceRowNumber"> & string;

const FIELD_ALIASES: Record<FieldKey | "eligibilityStatus" | "createdAt", string[]> = {
  externalEntryId: ["entry_id", "entry id", "id", "submission_id", "external_entry_id"],
  creatorName: ["creator_name", "creator name", "name"],
  publicDisplayName: ["public_display_name", "public display name", "display_name", "display name"],
  profileImageUrl: ["profile_image_url", "profile image url", "avatar_url", "avatar url"],
  thumbnailUrl: ["thumbnail_url", "thumbnail url", "entry_thumbnail_url", "entry thumbnail url"],
  sagaHandle: ["saga_handle", "saga handle"],
  instagramHandle: ["instagram_handle", "instagram handle", "ig_handle"],
  tiktokHandle: ["tiktok_handle", "tiktok handle"],
  sagaPostUrl: ["saga_post_url", "saga post url", "saga_post", "saga post", "saga_url", "saga url"],
  instagramPostUrl: [
    "instagram_post_url",
    "instagram post url",
    "instagram_post",
    "instagram post",
    "instagram_url",
    "instagram url"
  ],
  tiktokPostUrl: [
    "tiktok_post_url",
    "tiktok post url",
    "tiktok_post",
    "tiktok post",
    "tiktok_url",
    "tiktok url"
  ],
  entryTitle: ["entry_title", "entry title", "title"],
  contentType: ["content_type", "content type", "category", "format"],
  eligibilityStatus: ["eligibility_status", "eligibility status", "status"],
  createdAt: ["created_at", "created at", "timestamp", "submitted_at", "submitted at"]
};

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readAliasedValue(
  row: Record<string, string>,
  aliases: readonly string[]
) {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);

    if (normalizedAlias in row) {
      return row[normalizedAlias] ?? "";
    }
  }

  return "";
}

function nullableString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    return null;
  }
}

export function normalizeSheetRow(
  row: Record<string, string>,
  sourceRowNumber: number
) {
  const creatorName = nullableString(readAliasedValue(row, FIELD_ALIASES.creatorName)) ?? "Unnamed entry";
  const publicDisplayName =
    nullableString(readAliasedValue(row, FIELD_ALIASES.publicDisplayName)) ?? creatorName;
  const externalEntryId =
    nullableString(readAliasedValue(row, FIELD_ALIASES.externalEntryId)) ??
    `sheet-row-${sourceRowNumber}`;
  const createdAt =
    nullableString(readAliasedValue(row, FIELD_ALIASES.createdAt)) ??
    new Date().toISOString();
  const eligibilityStatus =
    nullableString(readAliasedValue(row, FIELD_ALIASES.eligibilityStatus)) ?? "eligible";

  return normalizedSheetRowSchema.parse({
    externalEntryId,
    creatorName,
    publicDisplayName,
    profileImageUrl: normalizeUrl(readAliasedValue(row, FIELD_ALIASES.profileImageUrl)),
    thumbnailUrl: normalizeUrl(readAliasedValue(row, FIELD_ALIASES.thumbnailUrl)),
    sagaHandle: nullableString(readAliasedValue(row, FIELD_ALIASES.sagaHandle)),
    instagramHandle: nullableString(readAliasedValue(row, FIELD_ALIASES.instagramHandle)),
    tiktokHandle: nullableString(readAliasedValue(row, FIELD_ALIASES.tiktokHandle)),
    sagaPostUrl: normalizeUrl(readAliasedValue(row, FIELD_ALIASES.sagaPostUrl)),
    instagramPostUrl: normalizeUrl(readAliasedValue(row, FIELD_ALIASES.instagramPostUrl)),
    tiktokPostUrl: normalizeUrl(readAliasedValue(row, FIELD_ALIASES.tiktokPostUrl)),
    entryTitle: nullableString(readAliasedValue(row, FIELD_ALIASES.entryTitle)),
    contentType: nullableString(readAliasedValue(row, FIELD_ALIASES.contentType)),
    eligibilityStatus: normalizeEligibilityStatus(eligibilityStatus),
    createdAt,
    sourceRowNumber
  });
}

export function normalizeSheetRecords(rows: string[][]) {
  const [headerRow, ...dataRows] = rows;

  if (!headerRow || headerRow.length === 0) {
    return [];
  }

  const normalizedHeaders = headerRow.map(normalizeHeader);

  return dataRows
    .filter((row) => row.some((value) => value.trim().length > 0))
    .map((row, index) => {
      const record = normalizedHeaders.reduce<Record<string, string>>((accumulator, header, valueIndex) => {
        accumulator[header] = row[valueIndex]?.trim() ?? "";
        return accumulator;
      }, {});

      return normalizeSheetRow(record, index + 2);
    });
}
