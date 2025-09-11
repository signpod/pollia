import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center gap-2 justify-center py-3">
        <PolliaIcon className="text-primary" width={20} height={20} />
        <PolliaWordmark className="text-black" height={30} />
      </div>
      <div className="flex flex-1 flex-col w-full h-full my-5">{children}</div>
    </div>
  );
}
