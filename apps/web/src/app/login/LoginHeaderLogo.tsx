import Image from "next/image";

export default function LoginHeaderLogo() {
  return (
    <>
      <Image
        src="/svgs/pollia-icon.svg"
        alt="Pollia Icon"
        width={20}
        height={20}
        className="text-primary"
      />
      <Image
        src="/svgs/pollia-wordmark.svg"
        alt="Pollia Wordmark"
        width={80}
        height={30}
        className="text-black"
      />
    </>
  );
}
