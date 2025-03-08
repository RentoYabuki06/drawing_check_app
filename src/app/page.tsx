"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/zumen");
  }, [router]);

  // ボタンは不要になるため、空のdivを返す
  return <div></div>;
}

