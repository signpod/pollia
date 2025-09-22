import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href="/poll/create">
        <button>만들기</button>
      </Link>
    </div>
  );
}
