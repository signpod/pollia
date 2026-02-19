import { RootWrapper } from "@/components/common/RootWrapper";
import "../globals.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <RootWrapper>{children}</RootWrapper>;
}
