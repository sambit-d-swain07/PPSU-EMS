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
import { CheckCircle2, XCircle } from "lucide-react";

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
      const res = await registerForEventAction(eventId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`You are now registered for "${eventTitle}".`);
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelRegistrationAction(eventId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Your registration has been cancelled.");
      }
    });
  };

  if (hasStarted) {
    return (
      <Button disabled variant="outline" className="w-full sm:w-auto">
        Event Concluded / In Progress
      </Button>
    );
  }

  if (isRegistered) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Button
          disabled
          variant="secondary"
          className="bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default font-medium"
        >
          <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
          Registered
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel Registration
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
                className="bg-destructive hover:bg-destructive/90 text-white"
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
      <Button disabled variant="outline" className="w-full sm:w-auto text-slate-400">
        Full (0 seats left)
      </Button>
    );
  }

  return (
    <Button
      onClick={handleRegister}
      disabled={isPending}
      className="w-full sm:w-auto cursor-pointer"
    >
      {isPending ? "Registering..." : `Register (${seatsLeft} seats left)`}
    </Button>
  );
}
