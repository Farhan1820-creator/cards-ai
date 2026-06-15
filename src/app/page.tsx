import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Link
        href="/home"
        className="text-xl font-medium underline"
      >
        Go to Home
      </Link>
    </main>
  );
}
