interface SurveyPageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { id } = await params;

  return <div>Survey Question {id}</div>;
}
