import MissionPassword from "./MissionPassword";

/**
 * 무한 캐시 설정
 * On-demand revalidation을 통해 데이터 갱신 시 캐시를 무효화합니다.
 * Action/Mission 생성/수정/삭제 시 revalidatePath를 호출해야 합니다.
 */
export const revalidate = false;

export default function MissionPasswordPage() {
  return <MissionPassword />;
}
