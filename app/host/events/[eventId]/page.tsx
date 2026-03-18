import { redirect } from "next/navigation";

export default function LegacyHostEventPage({
  params
}: {
  params: { eventId: string };
}) {
  redirect(`/studio/${params.eventId}`);
}

