import PoliaLogo from "@public/svgs/pollia-icon-filled.svg";
import { CenterOverlay } from "@repo/ui/components";

interface PointIconProps extends React.HTMLAttributes<HTMLDivElement>, React.PropsWithChildren {}

export function PointIcon({ children, className, ...props }: PointIconProps) {
  return (
    <CenterOverlay
      targetElement={
        <div className={className} {...props}>
          <PoliaLogo className="size-6" />
        </div>
      }
    >
      {children}
    </CenterOverlay>
  );
}
