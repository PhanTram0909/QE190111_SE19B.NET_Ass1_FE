"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DeprecateManageTagsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/tags");
  }, [router]);
  return <LoadingSpinner text="Redirecting to Admin console..." />;
}
