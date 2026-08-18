"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function MessagingBackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={goBack} aria-label={label} title={label}>
      <ArrowLeft aria-hidden />
    </Button>
  );
}
