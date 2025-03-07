import Link from "next/link";

export default function Home() {

  return (
    <Link href={"/watch"} className="text-[40px] font-bold">
      go player page
    </Link>
  );
}
