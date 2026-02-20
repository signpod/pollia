"use client";

import { getMissionPassword } from "@/actions/mission";
import { PinInput } from "@/app/admin/components/common/PinInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/admin/components/shadcn-ui/alert-dialog";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Separator } from "@/app/admin/components/shadcn-ui/separator";
import {
  useReadMission,
  useRemoveMissionPassword,
  useSetMissionPassword,
} from "@/app/admin/hooks/mission";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { Check, CheckCircle2, Copy, Dices, Eye, EyeOff, Lock, Trash2, XCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface PasswordManagementProps {
  missionId: string;
}

function generateRandomPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function PasswordManagement({ missionId }: PasswordManagementProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [actualPassword, setActualPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: missionData, isPending } = useReadMission(missionId);
  const setPasswordMutation = useSetMissionPassword(missionId);
  const removePasswordMutation = useRemoveMissionPassword(missionId);

  const mission = missionData?.data;
  const hasPassword = !!mission?.password;

  const handleTogglePasswordVisibility = useCallback(async () => {
    if (!isPasswordVisible && !actualPassword) {
      try {
        const result = await getMissionPassword(missionId);
        setActualPassword(result.data);
        setIsPasswordVisible(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "비밀번호를 불러올 수 없습니다";
        toast.error(errorMessage);
        return;
      }
    } else {
      setIsPasswordVisible(!isPasswordVisible);
    }
  }, [isPasswordVisible, actualPassword, missionId]);

  const handleCopyPassword = useCallback(async () => {
    if (!actualPassword) {
      try {
        const result = await getMissionPassword(missionId);
        setActualPassword(result.data);
        if (result.data) {
          await navigator.clipboard.writeText(result.data);
          setCopied(true);
          toast.success("비밀번호가 복사되었습니다");
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "비밀번호를 불러올 수 없습니다";
        toast.error(errorMessage);
      }
    } else {
      await navigator.clipboard.writeText(actualPassword);
      setCopied(true);
      toast.success("비밀번호가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [actualPassword, missionId]);

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
        {UBIQUITOUS_CONSTANTS.MISSION} 정보를 불러올 수 없습니다.
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
      setError("6자리 숫자를 모두 입력해주세요");
      return;
    }

    if (!/^\d{6}$/.test(password)) {
      setError("숫자만 입력 가능합니다");
      return;
    }

    try {
      await setPasswordMutation.mutateAsync(password);
      toast.success("비밀번호가 저장되었습니다");
      setPassword("");
      setError("");
      setActualPassword(null);
      setIsPasswordVisible(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "비밀번호 저장에 실패했습니다";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemove = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await removePasswordMutation.mutateAsync();
      toast.success("비밀번호가 삭제되었습니다");
      setPassword("");
      setError("");
      setIsDeleteDialogOpen(false);
      setActualPassword(null);
      setIsPasswordVisible(false);
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
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {hasPassword ? (
                  <>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">비밀번호 설정됨</div>
                      <div className="text-sm text-muted-foreground">
                        이 {UBIQUITOUS_CONSTANTS.MISSION}은 비밀번호로 보호되고 있습니다
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
                        누구나 이 {UBIQUITOUS_CONSTANTS.MISSION}에 접근할 수 있습니다
                      </div>
                    </div>
                  </>
                )}
              </div>
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
            </div>

            {hasPassword && (
              <PasswordDisplay
                isPasswordVisible={isPasswordVisible}
                actualPassword={actualPassword}
                copied={copied}
                onToggleVisibility={handleTogglePasswordVisibility}
                onCopy={handleCopyPassword}
                isLoading={isLoading}
              />
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
              <span className="text-sm font-medium">비밀번호</span>
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

            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading || password.length !== 6}
            >
              저장
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>비밀번호를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 비밀번호가 삭제되면 누구나 이{" "}
              {UBIQUITOUS_CONSTANTS.MISSION}에 접근할 수 있게 됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removePasswordMutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={removePasswordMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removePasswordMutation.isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface PasswordDisplayProps {
  isPasswordVisible: boolean;
  actualPassword: string | null;
  copied: boolean;
  onToggleVisibility: () => void;
  onCopy: () => void;
  isLoading: boolean;
}

function PasswordDisplay({
  isPasswordVisible,
  actualPassword,
  copied,
  onToggleVisibility,
  onCopy,
  isLoading,
}: PasswordDisplayProps) {
  const displayValue = isPasswordVisible && actualPassword ? actualPassword : "******";

  return (
    <div className="space-y-3 p-3 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <PinInput
          value={displayValue}
          onChange={() => {}}
          disabled={true}
          error={false}
          masked={!isPasswordVisible}
        />
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleVisibility}
            disabled={isLoading}
            className="size-12"
          >
            {isPasswordVisible ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCopy}
            disabled={isLoading}
            className="size-12"
          >
            {copied ? <Check className="size-5 text-green-600" /> : <Copy className="size-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
