import { getFileUploadById } from "@/actions/common/files";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./useCurrentUser";

export const useProfileImageUrl = () => {
  const { data: user } = useCurrentUser();
  const fileUploadId = user?.profileImageFileUploadId;
  const kakaoProfileImageUrl = user?.kakaoProfileImageUrl ?? null;

  const { data: storageImageUrl } = useQuery({
    queryKey: ["profile-image", fileUploadId],
    queryFn: () => getFileUploadById(fileUploadId!),
    enabled: !!fileUploadId,
    select: data => data.publicUrl,
    staleTime: 5 * 60 * 1000,
  });

  return storageImageUrl ?? kakaoProfileImageUrl;
};

export type UseProfileImageUrlReturn = ReturnType<typeof useProfileImageUrl>;
