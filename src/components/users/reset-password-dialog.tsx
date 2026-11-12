"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetUserPasswordSchema, type ResetUserPasswordInput } from "@/lib/schemas";
import { resetUserPasswordAction } from "@/actions/users";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import type { UserItem } from "./edit-user-dialog";

interface ResetPasswordDialogProps {
  user: UserItem | null;
  onClose: () => void;
}

export function ResetPasswordDialog({ user, onClose }: ResetPasswordDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetUserPasswordInput>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (data: ResetUserPasswordInput) => {
    if (!user) return;
    startTransition(async () => {
      const res = await resetUserPasswordAction(user.id, data);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Password for "${user.name}" has been reset.`);
        reset();
        onClose();
      }
    });
  };

  return (
    <AlertDialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-md border-2 border-ink bg-paper shadow-hard-lg font-mono">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-ink" />
            <AlertDialogTitle className="font-pixel text-lg text-ink uppercase">
              RESET PASSWORD
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="font-mono text-xs text-muted-ink">
            Set a new temporary password for <strong>{user?.name}</strong> ({user?.email}).
            The user will be required to change it upon their next sign-in.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {user && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label htmlFor="reset-password" className="text-xs font-bold uppercase text-ink">
                New Temporary Password
              </Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="Minimum 8 characters"
                className="h-8 text-xs font-mono border-2 border-ink"
                {...register("password")}
                disabled={isPending}
              />
              {errors.password && (
                <p className="text-[11px] text-[#E8573A]">{errors.password.message}</p>
              )}
            </div>

            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel onClick={onClose} disabled={isPending}>
                Cancel
              </AlertDialogCancel>
              <Button type="submit" variant="yellow" size="sm" disabled={isPending}>
                {isPending ? "RESETTING..." : "CONFIRM RESET"}
              </Button>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
