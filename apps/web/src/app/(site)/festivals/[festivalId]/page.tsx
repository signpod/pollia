import { getFestival } from "@/actions/festival";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FestivalContent } from "./components/FestivalContent";
import { FestivalIntro } from "./components/FestivalIntro";

export const revalidate = 86400; // 24시간 (온디맨드 ISR)

interface FestivalPageProps {
  params: Promise<{ festivalId: string }>;
}

export async function generateMetadata({ params }: FestivalPageProps): Promise<Metadata> {
  const { festivalId } = await params;

  try {
    const festival = await getFestival(festivalId);

    if (!festival) {
      return {
        title: "축제 정보",
        description: "축제 상세 정보를 확인하세요.",
      };
    }

    return {
      title: festival.title,
      description: festival.description,
      openGraph: {
        title: festival.title,
        description: festival.description,
        images: festival.imageUrl ? [{ url: festival.imageUrl }] : [],
        type: "website",
      },
    };
  } catch {
    return {
      title: "축제 정보",
      description: "축제 상세 정보를 확인하세요.",
    };
  }
}

export default async function FestivalPage({ params }: FestivalPageProps) {
  const { festivalId } = await params;

  const festival = await getFestival(festivalId);

  if (!festival) {
    notFound();
  }

  return (
    <FestivalIntro festival={festival}>
      <FestivalContent festival={festival} />
    </FestivalIntro>
  );
}
