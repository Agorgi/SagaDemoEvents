"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { TagChip } from "@/src/components/Chips";
import { type CommunityThread, getUserById } from "@/src/data/demo";
import { formatCompactNumber } from "@/src/lib/utils";

export function CommunityCard({
  community
}: {
  community: CommunityThread;
}) {
  const previewPosts = community.posts.slice(0, 2);

  return (
    <Link
      className="surface-card block overflow-hidden p-3 transition hover:-translate-y-1 hover:border-white/12"
      href={`/communities/${community.id}`}
    >
      <div className="relative mb-4 overflow-hidden rounded-[20px] border border-white/8">
        <img
          alt={community.title}
          className="h-28 w-full object-cover"
          src={community.coverImageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090d] via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {community.fandomTags.map((tag) => (
            <TagChip key={tag} label={tag} subdued />
          ))}
        </div>
      </div>
      <div className="mb-3">
        <h3 className="text-2xl font-semibold text-white">{community.title}</h3>
        <p className="mt-2 text-sm text-app-muted">{community.description}</p>
      </div>
      <div className="mb-4 flex items-center justify-between text-sm text-app-muted">
        <span>{formatCompactNumber(community.memberCount)} members</span>
        <span>{community.activeNow} active now</span>
      </div>
      <div className="space-y-3">
        {previewPosts.map((post) => {
          const author = getUserById(post.authorId);
          return (
            <div
              className="rounded-[20px] border border-white/8 bg-[#0d1119] p-3"
              key={post.id}
            >
              <div className="mb-2 flex items-center gap-3">
                <Avatar
                  name={author?.name ?? "Member"}
                  size="sm"
                  src={author?.avatarUrl}
                />
                <span className="text-sm font-semibold text-white">
                  {author?.handle}
                </span>
              </div>
              <p className="text-sm text-app-muted">{post.text}</p>
            </div>
          );
        })}
      </div>
    </Link>
  );
}
