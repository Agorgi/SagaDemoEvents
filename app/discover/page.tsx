import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/src/lib/routes";

export default function DiscoverPage() {
  redirect(APP_ROUTES.home);
}
