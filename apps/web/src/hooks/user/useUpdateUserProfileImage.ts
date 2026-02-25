"use client";

import { updateUser } from "@/actions/user";
import { toast } from "@/components/common/Toast";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import type { GetCurrentUserResponse } from "@/types/dto/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface UpdateProfileImageContext {
  previousData: GetCurrentUserResponse | undefined;
}

const PROFILE_IMAGE_MESSAGES = {
  success: "프로필 사진이 변경되었어요.",
  removeSuccess: "기본 이미지로 변경되었어요.",
  error: "프로필 사진 변경 중 오류가 발생했어요.",
  removeError: "프로필 사진 삭제 중 오류가 발생했어요.",
} as const;

export const useUpdateUserProfileImage = () => {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { uploadAsync, isUploading } = useImageUpload({
    bucket: STORAGE_BUCKETS.USER_PROFILE_IMAGES,
  });

  const updateMutation = useMutation<{ data: unknown }, Error, File, UpdateProfileImageContext>({
    mutationFn: async (file: File) => {
      const uploaded = await uploadAsync(file);
      return await updateUser({ profileImageFileUploadId: uploaded.fileUploadId });
    },

    onMutate: async file => {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      await queryClient.cancelQueries({
        queryKey: userQueryKeys.currentUser(),
      });

      const previousData = queryClient.getQueryData<GetCurrentUserResponse>(
        userQueryKeys.currentUser(),
      );

      return { previousData };
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.currentUser() }),
        queryClient.invalidateQueries({ queryKey: ["profile-image"] }),
      ]);
      setPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      toast.success(PROFILE_IMAGE_MESSAGES.success);
    },

    onError: (_, __, context) => {
      setPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (context?.previousData) {
        queryClient.setQueryData(userQueryKeys.currentUser(), context.previousData);
      }
      toast.warning(PROFILE_IMAGE_MESSAGES.error);
    },
  });

  const removeMutation = useMutation<{ data: unknown }, Error, void, UpdateProfileImageContext>({
    mutationFn: async () => updateUser({ profileImageFileUploadId: null }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userQueryKeys.currentUser() });
      const previousData = queryClient.getQueryData<GetCurrentUserResponse>(
        userQueryKeys.currentUser(),
      );
      return { previousData };
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.currentUser() }),
        queryClient.invalidateQueries({ queryKey: ["profile-image"] }),
      ]);
      toast.success(PROFILE_IMAGE_MESSAGES.removeSuccess);
    },

    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(userQueryKeys.currentUser(), context.previousData);
      }
      toast.warning(PROFILE_IMAGE_MESSAGES.removeError);
    },
  });

  return {
    updateProfileImage: updateMutation.mutate,
    updateProfileImageAsync: updateMutation.mutateAsync,
    removeProfileImage: removeMutation.mutate,
    removeProfileImageAsync: removeMutation.mutateAsync,
    isPending: updateMutation.isPending || isUploading || removeMutation.isPending,
    previewUrl,
  };
};

export type UseUpdateUserProfileImageReturn = ReturnType<typeof useUpdateUserProfileImage>;
