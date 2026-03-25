import { redirect } from "next/navigation";

export default function CreatorProfileAlias({
  params
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  redirect(`/profiles/${slug}`);
}
