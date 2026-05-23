import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function Page() {
  redirect(ROUTES.ONBOARDING.CURP_VERIFICATION);
}
