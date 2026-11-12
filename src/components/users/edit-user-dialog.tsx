"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editUserSchema, type EditUserInput } from "@/lib/schemas";
import { editUserAction } from "@/actions/users";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ORGANIZER" | "STUDENT";
  department?: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date | string;
}

interface EditUserDialogProps {
  user: UserItem | null;
  currentUserId: string;
  onClose: () => void;
}

export function EditUserDialog({ user, currentUserId, onClose }: EditUserDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isSelf = user?.id === currentUserId;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      role: "STUDENT",
      department: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        role: user.role,
        department: user.department || "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data: EditUserInput) => {
    if (!user) return;
    startTransition(async () => {
      const res = await editUserAction(user.id, data);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`User "${data.name}" updated successfully.`);
        onClose();
      }
    });
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-2 border-ink bg-paper shadow-hard-lg">
        <DialogHeader>
          <DialogTitle className="font-pixel text-lg text-ink uppercase">
            EDIT USER PROFILE
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-ink">
            Update account details and university roles for {user?.email}.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2 font-mono">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-bold uppercase text-ink">
                Full Name
              </Label>
              <Input
                id="name"
                className="h-8 text-xs font-mono border-2 border-ink"
                {...register("name")}
                disabled={isPending}
              />
              {errors.name && (
                <p className="text-[11px] text-[#E8573A]">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-ink">
                Role
              </Label>
              <Select
                defaultValue={user.role}
                onValueChange={(val: "ADMIN" | "ORGANIZER" | "STUDENT") =>
                  setValue("role", val)
                }
                disabled={isPending || isSelf}
              >
                <SelectTrigger className="h-8 text-xs font-mono border-2 border-ink bg-paper">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="ORGANIZER">Organizer</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
              {isSelf && (
                <p className="text-[11px] text-muted-ink italic">
                  You cannot change your own administrator role.
                </p>
              )}
              {errors.role && (
                <p className="text-[11px] text-[#E8573A]">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="department" className="text-xs font-bold uppercase text-ink">
                Department
              </Label>
              <Input
                id="department"
                placeholder="e.g. Computer Science"
                className="h-8 text-xs font-mono border-2 border-ink"
                {...register("department")}
                disabled={isPending}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="yellow" size="sm" disabled={isPending}>
                {isPending ? "SAVING..." : "SAVE CHANGES"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
