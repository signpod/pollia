"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { Textarea } from "@/app/admin/components/shadcn-ui/textarea";
import { useState } from "react";
import type { ActionFormProps, ScaleFormData } from "./types";

export function ScaleForm({
  isLoading = false,
  onSubmit,
  onCancel,
}: ActionFormProps<ScaleFormData>) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      type: "SCALE",
      title: title.trim(),
      description: description.trim() || undefined,
      options: [],
    });
  };

  const isValid = title.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="예: 서비스 만족도를 평가해주세요."
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          설명 <span className="text-muted-foreground">(선택)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="액션에 대한 추가 설명을 입력하세요."
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={isLoading}
          rows={2}
        />
      </div>

      {/* TODO: 척도 폼 구현 - 최소/최대값, 라벨 설정 */}
      <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        <p className="text-sm">척도 설정 영역</p>
        <p className="text-xs mt-1">최소/최대값, 양끝 라벨 등</p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          이전
        </Button>
        <Button type="submit" disabled={!isValid || isLoading}>
          {isLoading ? "생성 중..." : "액션 추가"}
        </Button>
      </div>
    </form>
  );
}
