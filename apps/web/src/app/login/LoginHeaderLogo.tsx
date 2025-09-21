import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";

export default function LoginHeaderLogo() {
  return (
    <>
      <PolliaIcon className="text-primary" width={20} height={20} />
      <PolliaWordmark className="text-black" height={30} />
    </>
  );
}
