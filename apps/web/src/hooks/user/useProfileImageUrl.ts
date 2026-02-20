import { getFileUploadById } from "@/actions/common/files";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./useCurrentUser";

export const useProfileImageUrl = () => {
  const { data: user } = useCurrentUser();
  const fileUploadId = user?.profileImageFileUploadId;

  const { data: profileImageUrl } = useQuery({
    queryKey: ["profile-image", fileUploadId],
    queryFn: () => getFileUploadById(fileUploadId!),
    enabled: !!fileUploadId,
    select: data => data.publicUrl,
    staleTime: 5 * 60 * 1000,
  });

  return profileImageUrl ?? null;
};

export type UseProfileImageUrlReturn = ReturnType<typeof useProfileImageUrl>;
