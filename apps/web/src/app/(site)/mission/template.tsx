import { PageTransition } from "@/components/common/PageTransition";

export default function MissionTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="stack">{children}</PageTransition>;
}
