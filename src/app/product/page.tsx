"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductPage() {
  const router = useRouter();

  useEffect(() => {
    // /product is no longer used. Only /product/[id] should show a product.
    router.replace("/");
  }, [router]);

  return null;
}

