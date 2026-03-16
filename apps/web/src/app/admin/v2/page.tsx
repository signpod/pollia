import { redirect } from "next/navigation";
import { ADMIN_V2_ROUTES } from "./constants/routes";

export default function AdminV2Page() {
  redirect(ADMIN_V2_ROUTES.USERS);
}
