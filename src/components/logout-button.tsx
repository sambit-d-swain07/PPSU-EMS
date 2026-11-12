"use client";

import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await logoutAction();
        });
      }}
      className="h-8 px-3 text-[11px] font-mono-label hover:bg-[#F0508C] hover:text-white"
    >
      {isPending ? "EXITING..." : "LOG OUT"}
    </Button>
  );
}
