import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import type { UseFormReturn } from "react-hook-form";

interface ImageCardProps {
  form: UseFormReturn<{
    title: string;
    description?: string | undefined;
    target?: string | undefined;
    imageUrl?: string | undefined;
    brandLogoUrl?: string | undefined;
    deadline?: Date | undefined;
    estimatedMinutes?: number | undefined;
    actionIds?: string[] | undefined;
    isActive?: boolean | undefined;
  }>;
}

export function ImageCard({ form }: ImageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>이미지</CardTitle>
        <CardDescription>미션 이미지와 브랜드 로고를 업로드하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imageUrl">미션 이미지 URL</Label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            {...form.register("imageUrl")}
          />
          {form.formState.errors.imageUrl && (
            <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
          )}
          <p className="text-xs text-muted-foreground">TODO: 파일 업로드 기능 추가 예정</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandLogoUrl">브랜드 로고 URL</Label>
          <Input
            id="brandLogoUrl"
            type="url"
            placeholder="https://example.com/logo.jpg"
            {...form.register("brandLogoUrl")}
          />
          {form.formState.errors.brandLogoUrl && (
            <p className="text-sm text-destructive">{form.formState.errors.brandLogoUrl.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
