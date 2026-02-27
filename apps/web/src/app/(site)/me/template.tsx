import { PageTransition } from "@/components/common/PageTransition";

export default function MeTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="stack">{children}</PageTransition>;
}
