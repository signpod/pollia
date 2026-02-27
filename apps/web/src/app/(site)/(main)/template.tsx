import { PageTransition } from "@/components/common/PageTransition";

export default function MainTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="tab">{children}</PageTransition>;
}
