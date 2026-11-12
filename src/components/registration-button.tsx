"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
import {
  registerForEventAction,
  cancelRegistrationAction,
} from "@/actions/registrations";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Ticket } from "lucide-react";

interface RegistrationButtonProps {
  eventId: string;
  eventTitle: string;
  isRegistered: boolean;
  isFull: boolean;
  hasStarted: boolean;
  seatsLeft: number;
}

export function RegistrationButton({
  eventId,
  eventTitle,
  isRegistered,
  isFull,
  hasStarted,
  seatsLeft,
}: RegistrationButtonProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleRegister = () => {
    startTransition(async () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("show-global-loader", {
            detail: { message: `Reserving your seat for "${eventTitle}"...` },
          })
        );
      }
      try {
        const res = await registerForEventAction(eventId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`You are now registered for "${eventTitle}".`);
        }
      } finally {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hide-global-loader"));
        }
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("show-global-loader", {
            detail: { message: "Cancelling your registration..." },
          })
        );
      }
      try {
        const res = await cancelRegistrationAction(eventId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Your registration has been cancelled.");
        }
      } finally {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hide-global-loader"));
        }
      }
    });
  };

  if (hasStarted) {
    return (
      <Button disabled variant="outline" className="w-full sm:w-auto font-mono-label opacity-70">
        EVENT CONCLUDED
      </Button>
    );
  }

  if (isRegistered) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Button
          disabled
          variant="secondary"
          className="bg-[#BFE5CF] text-ink border-2 border-ink cursor-default font-mono-label font-bold"
        >
          <CheckCircle2 className="h-4 w-4 mr-1.5 text-[#19A860]" />
          REGISTERED ✓
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="text-[#F0508C] hover:bg-[#F0508C] hover:text-white font-mono-label"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel Seat
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel your registration?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your seat for &quot;{eventTitle}
                &quot;? Your reserved spot will be released to other students.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep my seat</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="bg-[#F0508C] hover:bg-[#F0508C]/90 text-white font-mono-label"
              >
                {isPending ? "Cancelling..." : "Confirm Cancellation"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  if (isFull) {
    return (
      <Button disabled variant="outline" className="w-full sm:w-auto font-mono-label text-muted-ink">
        SOLD OUT (0 SEATS LEFT)
      </Button>
    );
  }

  return (
    <Button
      onClick={handleRegister}
      disabled={isPending}
      className="w-full sm:w-auto font-mono-label font-bold tracking-wider"
    >
      <Ticket className="h-4 w-4 mr-1.5 text-[#F6C945]" />
      {isPending ? "BOOKING SEAT..." : `CONFIRM REGISTRATION (${seatsLeft} LEFT)`}
    </Button>
  );
}
