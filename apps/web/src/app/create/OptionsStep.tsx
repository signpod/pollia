"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { PollOption } from "./page";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "../../components/ui/sheet";
import { usePostImage } from "@/hooks/shared/useUploadImage";
import { CDN_BASE_URL } from "@/constants/config";

type Props = {
  options: PollOption[];
  onChangeOptions: (opts: PollOption[]) => void;
};

export default function OptionsStep({ options, onChangeOptions }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<PollOption | null>(null);
  const tempBlobRef = useRef<string | null>(null);
  const canAddMore = options.length < 10;
  const postImage = usePostImage();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditing({ id: "", title: "", description: "", imageUrl: "", link: "" });
    setSheetOpen(true);
  };

  const handleOpenEdit = (opt: PollOption) => {
    setEditing(opt);
    setSheetOpen(true);
  };

  const handleClose = () => {
    if (tempBlobRef.current && tempBlobRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(tempBlobRef.current);
      tempBlobRef.current = null;
    }
    setSheetOpen(false);
    setEditing(null);
  };

  const isValid = useMemo(() => {
    if (!editing) return false;
    return editing.title.trim().length > 0;
  }, [editing]);

  const handleSave = () => {
    if (!editing || !isValid) return;
    if (!editing.id) {
      const newItem: PollOption = {
        ...editing,
        id: crypto.randomUUID(),
      } as PollOption;
      onChangeOptions([...options, newItem]);
    } else {
      onChangeOptions(options.map((o: PollOption) => (o.id === editing.id ? editing : o)));
    }
    // 저장 후에는 blob URL을 유지하여 리스트에서 미리보기 가능하도록 함
    handleClose();
  };

  const handleDelete = (id: string) => {
    onChangeOptions(options.filter((o: PollOption) => o.id !== id));
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        선택지를 추가하세요 (2-10개)
      </h1>

      <div style={{ display: "grid", gap: 12 }}>
        {options.map((o) => (
          <div
            key={o.id}
            role="button"
            tabIndex={0}
            onClick={() => handleOpenEdit(o)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenEdit(o);
              }
            }}
            style={{
              textAlign: "left",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              display: "flex",
              gap: 12,
              cursor: "pointer",
            }}
          >
            {o.imageUrl ? (
              <Image
                src={o.imageUrl}
                alt={o.title}
                width={56}
                height={56}
                unoptimized
                style={{ borderRadius: 8, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  background: "#f3f4f6",
                  display: "grid",
                  placeItems: "center",
                  color: "#9ca3af",
                  fontSize: 12,
                }}
              >
                IMG
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{o.title}</div>
              {o.description && (
                <div style={{ color: "#6b7280", marginTop: 2 }}>{o.description}</div>
              )}
              {o.link && (
                <div style={{ color: "#2563eb", marginTop: 4, fontSize: 12 }}>{o.link}</div>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(o.id);
              }}
              style={{
                border: "1px solid #fca5a5",
                color: "#b91c1c",
                background: "#fff1f2",
                borderRadius: 8,
                padding: "8px 10px",
                height: 36,
                alignSelf: "center",
              }}
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleOpenCreate}
          disabled={!canAddMore}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            border: "1px dashed #9ca3af",
            color: canAddMore ? "#111" : "#9ca3af",
            background: "#fff",
          }}
        >
          + 선택지 추가
        </button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={(open: boolean) => (!open ? handleClose() : setSheetOpen(true))}>
        <SheetContent side="bottom">
          {editing && (
            <div className="space-y-3">
              <SheetHeader>
                <SheetTitle>{editing.id ? "선택지 수정" : "새 선택지"}</SheetTitle>
              </SheetHeader>
              <input
                type="file"
                accept="image/*"
                disabled={postImage.isPending}
                onChange={async (e) => {
                  if (postImage.isPending) return;
                  const file = e.target.files?.[0];
                  if (!file || !editing) return;
                  setUploadError(null);
                  // blob preview
                  const url = URL.createObjectURL(file);
                  if (tempBlobRef.current && tempBlobRef.current.startsWith("blob:")) {
                    URL.revokeObjectURL(tempBlobRef.current);
                  }
                  tempBlobRef.current = url;
                  setEditing({ ...editing, imageUrl: url });

                  try {
                    const uploadedUrl = await postImage.mutateAsync({
                      file,
                      fileName: file.name,
                      fileType: file.type,
                    });
                    setEditing({
                      ...editing,
                      imageUrl: `${CDN_BASE_URL}${uploadedUrl}`,
                    });
                    if (tempBlobRef.current && tempBlobRef.current.startsWith("blob:")) {
                      URL.revokeObjectURL(tempBlobRef.current);
                      tempBlobRef.current = null;
                    }
                  } catch (err) {
                    setUploadError("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
                  }
                }}
                className="h-11 w-full rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-input)" }}
              />
              {editing.imageUrl && (
                <div className="mt-1 relative">
                  <Image
                    src={editing.imageUrl}
                    alt={editing.title || "preview"}
                    width={120}
                    height={120}
                    unoptimized
                    style={{ borderRadius: 8, objectFit: "cover" }}
                  />
                  {postImage.isPending && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.35)",
                        borderRadius: 8,
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      업로드 중...
                    </div>
                  )}
                </div>
              )}
              {uploadError && (
                <div className="text-[12px] text-red-700 mt-1">{uploadError}</div>
              )}
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="제목 (필수)"
                className="h-11"
              />
              <Textarea
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="설명"
                className="min-h-28"
              />
              <Input
                value={editing.link ?? ""}
                onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                placeholder="관련 링크"
                className="h-11"
              />
              <SheetFooter>
                <SheetClose asChild>
                  <button
                    onClick={handleClose}
                    className="h-11 flex-1 rounded-lg border border-input bg-white"
                  >
                    취소
                  </button>
                </SheetClose>
                <button
                  onClick={handleSave}
                  disabled={!isValid}
                  className="h-11 flex-[2] rounded-lg border border-foreground bg-foreground text-white disabled:bg-muted disabled:text-muted-foreground"
                >
                  저장
                </button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}


