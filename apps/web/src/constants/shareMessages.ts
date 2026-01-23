export const SHARE_MESSAGES = {
  kakao: {
    title: "설문에 참여해주세요",
    description: "설문에 참여하고 의견을 공유해보세요!",
    buttonText: "설문 참여하기",
    preparing: "카카오톡 공유를 준비 중입니다. 잠시 후 다시 시도해주세요",
    unavailable: "카카오톡 공유 기능을 사용할 수 없습니다",
    error: "카카오톡 공유 중 문제가 발생했습니다",
  },
  clipboard: {
    success: "링크가 클립보드에 복사되었어요!",
    error: "링크 복사 중 문제가 발생했습니다",
  },
} as const;

export const SHARE_IMAGE_PATH = "/images/pollia-logo.png" as const;
