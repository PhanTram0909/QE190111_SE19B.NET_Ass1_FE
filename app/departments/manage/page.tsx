"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DeprecateManageDepartmentsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/departments");
  }, [router]);
  return <LoadingSpinner text="Redirecting to Admin console..." />;
}
