"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@/lib/schemas";
import { createUserAction } from "@/actions/users";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import { UserPlus } from "lucide-react";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
      department: "",
    },
  });

  const onSubmit = (data: CreateUserInput) => {
    startTransition(async () => {
      const res = await createUserAction(data);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`User "${data.name}" created successfully.`);
        reset();
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 text-xs">
          <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Single User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Create New User Account
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add a university student, organizer, or admin. They will be prompted to change their password upon first login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Alex Taylor"
              className="h-8 text-xs"
              {...register("name")}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-[11px] text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. ataylor@university.edu"
              className="h-8 text-xs"
              {...register("email")}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-[11px] text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                Assigned Role
              </Label>
              <Select
                defaultValue="STUDENT"
                onValueChange={(val: "ADMIN" | "ORGANIZER" | "STUDENT") =>
                  setValue("role", val)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="ORGANIZER">Organizer</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-[11px] text-red-600">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="department" className="text-xs font-semibold text-slate-700">
                Department
              </Label>
              <Input
                id="department"
                placeholder="e.g. Computer Science"
                className="h-8 text-xs"
                {...register("department")}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
              Temporary Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 characters"
              className="h-8 text-xs"
              {...register("password")}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-[11px] text-red-600">{errors.password.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

