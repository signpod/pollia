"use client";

import "@/app/admin/admin.css";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { ROUTES } from "@/constants/routes";
import { AuthError, useKakaoLogin } from "@/hooks/login/useKakaoLogin";

interface AdminLoginClientProps {
  initialError: AuthError | null;
}

export function AdminLoginClient({ initialError }: AdminLoginClientProps) {
  const { handleKakaoLogin } = useKakaoLogin({
    initialError,
    redirectPath: ROUTES.ADMIN,
  });

  return (
    <div className="admin-root fixed inset-0 flex items-center justify-center overflow-auto bg-muted/40 px-4 py-6 lg:px-6 lg:py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Pollia Admin</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            관리자 페이지에 접속하려면 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleKakaoLogin}
            className="w-full gap-2 bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90"
          >
            <KakaoIcon />
            카카오로 로그인
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 0.5C4.02919 0.5 0 3.69354 0 7.63636C0 10.0736 1.55835 12.2164 3.93132 13.4845L2.93341 17.0261C2.84562 17.3344 3.20341 17.5814 3.4726 17.4026L7.87342 14.5009C8.24371 14.5414 8.61937 14.5626 9 14.5626C13.9706 14.5626 18 11.3689 18 7.42598C18 3.48306 13.9706 0.5 9 0.5Z"
        fill="#191919"
      />
    </svg>
  );
}
