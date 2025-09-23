import { BottomCTALayout } from "@repo/ui/components";
import LoginHeaderLogo from "./LoginHeaderLogo";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BottomCTALayout hasBottomGap={false} className="min-h-screen">
      <div className="min-h-screen flex flex-col">
        <div className="flex items-center gap-2 justify-center py-3">
          <LoginHeaderLogo />
        </div>
        <div className="flex flex-1 flex-col w-full h-full my-5">
          {children}
        </div>
      </div>
    </BottomCTALayout>
  );
}
