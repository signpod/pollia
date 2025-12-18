"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Separator } from "@/app/admin/components/shadcn-ui/separator";
import { useReadMission } from "@/app/admin/hooks/use-read-mission";
import { useRemoveMissionPassword } from "@/app/admin/hooks/use-remove-mission-password";
import { useSetMissionPassword } from "@/app/admin/hooks/use-set-mission-password";
import { CheckCircle2, Dices, Lock, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PinInput } from "./PinInput";

interface PasswordManagementProps {
  missionId: string;
}

function generateRandomPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function PasswordManagement({ missionId }: PasswordManagementProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { data: missionData, isPending } = useReadMission(missionId);
  const setPasswordMutation = useSetMissionPassword(missionId);
  const removePasswordMutation = useRemoveMissionPassword(missionId);

  const mission = missionData?.data;
  const hasPassword = !!mission?.password;

  if (isPending) {
    return (
      <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
        미션 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const handleGenerateRandom = () => {
    const randomPin = generateRandomPin();
    setPassword(randomPin);
    setError("");
    toast.success("랜덤 비밀번호가 생성되었습니다");
  };

  const handleSave = async () => {
    if (password.length !== 6) {
      setError("6자리 숫자를 모두 입력해주세요.");
      return;
    }

    if (!/^\d{6}$/.test(password)) {
      setError("숫자만 입력 가능합니다.");
      return;
    }

    try {
      await setPasswordMutation.mutateAsync(password);
      toast.success("비밀번호가 저장되었습니다");
      setPassword("");
      setError("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "비밀번호 저장에 실패했습니다";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemove = async () => {
    if (!confirm("정말 비밀번호를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await removePasswordMutation.mutateAsync();
      toast.success("비밀번호가 삭제되었습니다");
      setPassword("");
      setError("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "비밀번호 삭제에 실패했습니다";
      toast.error(errorMessage);
    }
  };

  const isLoading = setPasswordMutation.isPending || removePasswordMutation.isPending;

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>현재 상태</CardTitle>
          <CardDescription>비밀번호 설정 상태를 확인할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {hasPassword ? (
              <>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">비밀번호 설정됨</div>
                  <div className="text-sm text-muted-foreground">
                    이 미션은 비밀번호로 보호되고 있습니다
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground">비밀번호 미설정</div>
                  <div className="text-sm text-muted-foreground">
                    누구나 이 미션에 접근할 수 있습니다
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>비밀번호 {hasPassword ? "변경" : "설정"}</CardTitle>
          <CardDescription>6자리 숫자로 구성된 비밀번호를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">비밀번호</label>
            </div>

            <PinInput
              value={password}
              onChange={setPassword}
              disabled={isLoading}
              error={!!error}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateRandom}
              disabled={isLoading}
              className="gap-2"
            >
              <Dices className="h-4 w-4" />
              랜덤 생성
            </Button>

            <div className="flex gap-3">
              {hasPassword && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </Button>
              )}

              <Button
                type="button"
                onClick={handleSave}
                disabled={isLoading || password.length !== 6}
              >
                저장
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 비밀번호는 6자리 숫자만 입력 가능합니다.</p>
          <p>• 비밀번호가 설정된 미션은 사용자가 비밀번호를 입력해야 접근할 수 있습니다.</p>
          <p>• 비밀번호는 안전하게 암호화되어 저장됩니다.</p>
          <p>• 랜덤 생성 버튼을 사용하여 안전한 비밀번호를 자동으로 생성할 수 있습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
