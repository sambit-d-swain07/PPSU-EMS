"use client";

import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await logoutAction();
        });
      }}
    >
      {isPending ? "Logging out..." : "Log out"}
    </Button>
  );
}

