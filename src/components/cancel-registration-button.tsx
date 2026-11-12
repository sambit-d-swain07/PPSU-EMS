"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cancelRegistrationAction } from "@/actions/registrations";
import { toast } from "sonner";
import { XCircle, Loader2 } from "lucide-react";
import { Tape } from "@/components/ui-theme/tape";

interface CancelRegistrationButtonProps {
  eventId: string;
  eventTitle: string;
}

export function CancelRegistrationButton({
  eventId,
  eventTitle,
}: CancelRegistrationButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleCancel = () => {
    startTransition(async () => {
      // Trigger full-screen loader
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("show-global-loader", {
            detail: { message: "Cancelling your registration..." },
          })
        );
      }

      try {
        const res = await cancelRegistrationAction(eventId);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Registration cancelled. Your seat has been released.");
          setOpen(false);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to cancel registration.";
        toast.error(message);
      } finally {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hide-global-loader"));
        }
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-xs h-8 border-ink text-[#E8573A] hover:bg-[#FDF2F4] hover:text-[#E8573A] font-mono-label gap-1.5"
        >
          <XCircle className="h-3.5 w-3.5" />
          <span>CANCEL TICKET</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="relative bg-paper border-2 border-ink rounded-[3px] shadow-hard-lg max-w-md">
        <Tape color="pink" rotation="rotate-2" className="-top-3 left-1/2 -translate-x-1/2" />
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="font-pixel text-xl text-ink uppercase tracking-tight">
            CANCEL REGISTRATION?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs font-mono text-muted-ink leading-relaxed">
            Are you sure you want to cancel your seat for{" "}
            <span className="font-bold text-ink">&ldquo;{eventTitle}&rdquo;</span>?
            This will release your ticket and allow another student to register.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-4 flex gap-2">
          <AlertDialogCancel
            disabled={isPending}
            className="border-2 border-ink font-mono text-xs"
          >
            Keep My Ticket
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={isPending}
            className="bg-[#F0508C] text-white hover:bg-[#E8573A] border-2 border-ink font-mono text-xs shadow-hard-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel Seat"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
