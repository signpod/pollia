import { useCurrentUser } from "./useCurrentUser";

export const useProfileImageUrl = () => {
  const { data: user } = useCurrentUser();
  return user?.profileImageFileUpload?.publicUrl ?? null;
};

export type UseProfileImageUrlReturn = ReturnType<typeof useProfileImageUrl>;
