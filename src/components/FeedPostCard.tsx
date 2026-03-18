"use client";

import { type CSSProperties, useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { TagChip } from "@/src/components/Chips";
import { Modal } from "@/src/components/Modal";
import { type DemoFeedPost, getUserById } from "@/src/data/demo";
import { formatDateLabel } from "@/src/lib/utils";

export function FeedPostCard({
  post,
  className = ""
}: {
  post: DemoFeedPost;
  className?: string;
}) {
  const author = getUserById(post.authorId);
  const [expanded, setExpanded] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const showCaptionToggle = post.caption.length > 120 || Boolean(post.body);
  const collapsedCaptionStyle: CSSProperties = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden"
  };
  const mediaAspectClass = post.format === "story" ? "aspect-[16/9]" : "aspect-[4/5]";

  return (
    <>
      <article className={`w-full ${className}`}>
        <button
          className="group block w-full text-left"
          onClick={() => setExpanded(true)}
          type="button"
        >
          {post.imageUrl ? (
            <div
              className={`relative overflow-hidden rounded-[30px] bg-[#090c13] ${mediaAspectClass}`}
            >
              <img
                alt={post.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]"
                src={post.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06080d]/78 via-transparent to-transparent" />
              {post.format === "story" ? (
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/58 sm:text-[11px]">
                    Fiction drop
                  </p>
                  <h3 className="mt-3 max-w-3xl text-[26px] font-semibold leading-[1.02] text-white sm:text-[38px]">
                    {post.title}
                  </h3>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[30px] bg-[#090c13] px-5 py-8 sm:px-7 sm:py-10">
              <h3 className="text-2xl font-semibold text-white sm:text-[30px]">
                {post.title}
              </h3>
            </div>
          )}
        </button>

        <div className="px-1 pt-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <button
                className="block max-w-full text-left"
                onClick={() => setExpanded(true)}
                type="button"
              >
                <p className="truncate text-sm font-semibold text-white">
                  {author?.handle ?? "@saga"}
                </p>
              </button>
              <p className="mt-1 text-xs text-app-muted">
                {formatDateLabel(post.createdAt)} · {post.likes} likes · {post.comments} comments
              </p>
            </div>
            <button
              className="shrink-0 text-xs font-medium text-app-muted transition hover:text-white"
              onClick={() => setExpanded(true)}
              type="button"
            >
              {post.format === "story" ? "Open story" : "Open post"}
            </button>
          </div>

          {post.format === "image" ? (
            <h3 className="mt-3 text-base font-semibold text-white">{post.title}</h3>
          ) : null}

          <p
            className="mt-2 text-sm leading-6 text-white/76 sm:text-[15px]"
            style={captionExpanded ? undefined : collapsedCaptionStyle}
          >
            {post.caption}
          </p>

          {showCaptionToggle ? (
            <button
              className="mt-1 text-xs font-medium text-app-muted transition hover:text-white"
              onClick={() => setCaptionExpanded((value) => !value)}
              type="button"
            >
              {captionExpanded ? "Show less" : "Read more"}
            </button>
          ) : null}
        </div>
      </article>

      <Modal
        description={post.format === "story" ? "Text-first fandom post" : "Image-first social post"}
        onClose={() => setExpanded(false)}
        open={expanded}
        panelClassName={post.format === "story" ? "max-w-5xl" : "max-w-3xl"}
        title={post.title}
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name={author?.name ?? "Saga member"} size="md" src={author?.avatarUrl} />
            <div>
              <p className="text-sm font-semibold text-white">{author?.handle ?? "@saga"}</p>
              <p className="text-xs text-app-muted">{formatDateLabel(post.createdAt)}</p>
            </div>
          </div>

          {post.imageUrl ? (
            <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[#0d1119]">
              <img
                alt={post.title}
                className={`w-full object-cover ${post.format === "story" ? "aspect-[16/9]" : "aspect-[4/5]"}`}
                src={post.imageUrl}
              />
            </div>
          ) : null}

          <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-5">
            <p className="text-base leading-8 text-app-muted">{post.caption}</p>
            {post.body ? (
              <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-white/88">
                {post.body}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {post.fandomTags.map((tag) => (
              <TagChip key={tag} label={tag} subdued />
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-app-muted">
            <span>{post.likes} likes</span>
            <span>{post.comments} comments</span>
          </div>
        </div>
      </Modal>
    </>
  );
}
