import { EventDetailContent } from "./components/EventDetailContent";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  return <EventDetailContent eventId={id} />;
}
