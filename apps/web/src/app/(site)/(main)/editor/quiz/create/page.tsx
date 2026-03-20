import { checkAuthStatus } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { QuizCreateContent } from "../components/view/QuizCreateContent";

export default async function QuizCreatePage() {
  const { isAuthenticated } = await checkAuthStatus().catch(() => ({
    isAuthenticated: false,
    user: null,
  }));

  if (!isAuthenticated) {
    redirect("/login?next=/editor/quiz/create");
  }

  return (
    <Suspense>
      <QuizCreateContent />
    </Suspense>
  );
}
