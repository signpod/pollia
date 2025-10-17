import { redirect } from "next/navigation";

export default function Home() {
  // redirect 함수를 server에서 사용하면, Home을 기준으로 한 SPA처럼 동작. (insert meta tag to redirect)
  // TODO: 메인 페이지 구현 이후 변경되어야 합니다.
  redirect("/me");
}
