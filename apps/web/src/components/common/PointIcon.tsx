import { CenterOverlay } from "@repo/ui/components";
import PoliaLogo from "@public/svgs/pollia-icon-filled.svg";

export function PointIcon({ children }: { children: React.ReactNode }) {
  return (
    <CenterOverlay
      targetElement={
        <div>
          <PoliaLogo className="size-6" />
        </div>
      }
    >
      {children}
    </CenterOverlay>
  );
}
