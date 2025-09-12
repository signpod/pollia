import { Button, ButtonProps } from "../ui/button";
import { Typo } from "./Typo";

export function KakaoLoginButton(props: ButtonProps) {
  return (
    <Button
      className="bg-kakao text-zinc-900 hover:bg-kakao active:bg-kakao focus:bg-kakao"
      {...props}
      leftIcon={
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_397_540)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.00002 0.600098C4.02917 0.600098 0 3.71306 0 7.55238C0 9.94012 1.5584 12.0451 3.93152 13.2971L2.93303 16.9446C2.84481 17.2669 3.21341 17.5238 3.49646 17.337L7.87334 14.4483C8.2427 14.4839 8.61808 14.5047 9.00002 14.5047C13.9705 14.5047 17.9999 11.3919 17.9999 7.55238C17.9999 3.71306 13.9705 0.600098 9.00002 0.600098Z"
              fill="#09090B"
            />
          </g>
          <defs>
            <clipPath id="clip0_397_540">
              <rect width="17.9999" height="18" fill="white" />
            </clipPath>
          </defs>
        </svg>
      }
    >
      <Typo.ButtonText size="large">카카오로 계속하기</Typo.ButtonText>
    </Button>
  );
}
