interface AdminSurveyPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSurveyPage({ params }: AdminSurveyPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">설문 상세</h1>
        <p className="text-muted-foreground">설문 ID: {id}</p>
      </div>
      <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
        TODO: 설문 상세 페이지 구현
      </div>
    </div>
  );
}
