"use client";

import { updateUser } from "@/actions/user";
import { toast } from "@/components/common/Toast";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { useUploadImage } from "@/hooks/image";
import type { GetCurrentUserResponse } from "@/types/dto/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const PROFILE_IMAGE_MESSAGES = {
  success: "프로필 사진이 변경되었어요.",
  error: "프로필 사진 변경 중 오류가 발생했어요.",
} as const;

export const useUpdateUserProfileImage = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ fileUploadId }: { fileUploadId: string }) =>
      updateUser({ profileImageFileUploadId: fileUploadId }),

    onMutate: async () => {
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
      toast.success(PROFILE_IMAGE_MESSAGES.success);
    },

    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(userQueryKeys.currentUser(), context.previousData);
      }
      toast.warning(PROFILE_IMAGE_MESSAGES.error);
    },
  });

  const uploadImage = useUploadImage({
    bucket: STORAGE_BUCKETS.USER_PROFILE_IMAGES,
    onUploadSuccess: data => updateMutation.mutate({ fileUploadId: data.fileUploadId }),
    onUploadError: () => toast.warning(PROFILE_IMAGE_MESSAGES.error),
  });

  return {
    updateProfileImage: uploadImage.upload,
    isPending: uploadImage.isUploading || updateMutation.isPending,
    previewUrl: uploadImage.previewUrl,
  };
};

export type UseUpdateUserProfileImageReturn = ReturnType<typeof useUpdateUserProfileImage>;
