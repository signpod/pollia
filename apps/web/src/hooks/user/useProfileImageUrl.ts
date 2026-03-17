import { useCurrentUser } from "./useCurrentUser";

function getKakaoProfileImageCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)kakao_profile_image=([^;]*)/);
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1]);
}

export const useProfileImageUrl = () => {
  const { data: user } = useCurrentUser();
  const uploadedUrl = user?.profileImageFileUpload?.publicUrl ?? null;

  if (uploadedUrl) return uploadedUrl;

  return getKakaoProfileImageCookie();
};

export type UseProfileImageUrlReturn = ReturnType<typeof useProfileImageUrl>;
