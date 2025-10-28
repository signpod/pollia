interface SurveyPageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { id } = await params;
  console.log(id);

  return <div>SurveyPage</div>;
}
