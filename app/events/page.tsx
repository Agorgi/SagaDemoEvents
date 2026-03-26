import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/src/lib/routes";

export default function EventsPage() {
  redirect(APP_ROUTES.home);
}
