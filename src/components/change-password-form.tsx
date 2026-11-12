"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/schemas";
import { changePasswordAction } from "@/actions/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle } from "lucide-react";

interface ChangePasswordFormProps {
  mustChangePassword?: boolean;
  roleDashboard: string;
}

export function ChangePasswordForm({
  mustChangePassword,
  roleDashboard,
}: ChangePasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await changePasswordAction(data);
      if (res.error) {
        setServerError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Password changed successfully!");
        router.push(roleDashboard);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-mono">
      {mustChangePassword && (
        <Alert variant="warning" className="bg-paper-cream border-2 border-ink text-ink shadow-hard-sm">
          <AlertCircle className="h-4 w-4 text-ink" />
          <AlertDescription className="text-xs font-mono">
            An administrator has requested that you change your password before continuing.
          </AlertDescription>
        </Alert>
      )}

      {serverError && (
        <Alert variant="destructive" className="bg-[#FDF2F4] border-2 border-ink text-[#E8573A] shadow-hard-sm">
          <AlertCircle className="h-4 w-4 text-[#E8573A]" />
          <AlertDescription className="text-xs font-mono">{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword" className="text-xs font-bold uppercase text-ink">
          Current Password
        </Label>
        <Input
          id="currentPassword"
          type="password"
          placeholder="••••••••"
          className="border-2 border-ink font-mono text-xs"
          {...register("currentPassword")}
          disabled={isPending}
        />
        {errors.currentPassword && (
          <p className="text-xs text-[#E8573A]">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-xs font-bold uppercase text-ink">
          New Password
        </Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="At least 8 characters"
          className="border-2 border-ink font-mono text-xs"
          {...register("newPassword")}
          disabled={isPending}
        />
        {errors.newPassword && (
          <p className="text-xs text-[#E8573A]">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase text-ink">
          Confirm New Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter new password"
          className="border-2 border-ink font-mono text-xs"
          {...register("confirmPassword")}
          disabled={isPending}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-[#E8573A]">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" variant="yellow" disabled={isPending} className="w-full">
        {isPending ? (
          "UPDATING PASSWORD..."
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            UPDATE PASSWORD
          </>
        )}
      </Button>
    </form>
  );
}
