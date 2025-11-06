import { SurveyClientWrapper } from "./SurveyClientWrapper";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // const queryClient = getQueryClient();

  // TODO: Tanstack Query를 사용하여 설문 조회. Server에서 데이터를 가져온 후, Client에서 데이터를 표시.
  /*
  await queryClient.prefetchQuery({
    queryKey: surveyQueryKey가 들어가야 합니다.
    queryFn: survey를 GET하는 함수를 호출합니다.
  });
  */

  return <SurveyClientWrapper />;
}
