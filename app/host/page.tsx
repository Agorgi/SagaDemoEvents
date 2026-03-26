import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/src/lib/routes";

export default function LegacyHostPage() {
  redirect(APP_ROUTES.launch);
}
