import { RootWrapper } from "@/components/common/RootWrapper";
import { LeftAsidePanel } from "@/components/common/aside/LeftAsidePanel";
import { RightAsidePanel } from "@/components/common/aside/RightAsidePanel";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootWrapper leftAside={<LeftAsidePanel />} rightAside={<RightAsidePanel />}>
      {children}
    </RootWrapper>
  );
}
