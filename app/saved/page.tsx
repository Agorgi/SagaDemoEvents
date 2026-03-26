import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/src/lib/routes";

export default function SavedPage() {
  redirect(`${APP_ROUTES.plans}?tab=saved`);
}
