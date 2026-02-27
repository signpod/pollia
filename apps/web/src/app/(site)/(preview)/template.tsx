import { PageTransition } from "@/components/common/PageTransition";

export default function PreviewTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="tab">{children}</PageTransition>;
}
