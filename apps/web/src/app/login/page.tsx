import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export const revalidate = 86400;

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
