"use client";

import { deleteFileById } from "@/actions/common/files";
import type { DeleteFileByIdRequest } from "@/types/dto/file";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import type { UseDeleteImageReturn } from "./types";

export function useDeleteImage(): UseDeleteImageReturn {
  const [markedId, setMarkedId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (request: DeleteFileByIdRequest) => deleteFileById(request),
  });

  const mark = useCallback((fileUploadId: string) => {
    setMarkedId(fileUploadId);
  }, []);

  const unmark = useCallback(() => {
    setMarkedId(null);
  }, []);

  const deleteById = useCallback(
    (fileUploadId: string) => {
      deleteMutation.mutate({ fileUploadId });
    },
    [deleteMutation],
  );

  const deleteMarked = useCallback(() => {
    if (!markedId) return;
    deleteMutation.mutate({ fileUploadId: markedId });
    setMarkedId(null);
  }, [markedId, deleteMutation]);

  return {
    markedId,
    isDeleting: deleteMutation.isPending,
    mark,
    unmark,
    deleteById,
    deleteMarked,
  };
}
