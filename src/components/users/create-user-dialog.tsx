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
        <Button size="sm" variant="yellow" className="h-9 text-xs">
          <UserPlus className="h-3.5 w-3.5 mr-1.5" /> ADD USER
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-2 border-ink bg-paper shadow-hard-lg">
        <DialogHeader>
          <DialogTitle className="font-pixel text-lg text-ink uppercase">
            CREATE USER ACCOUNT
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-ink">
            Add a university student, organizer, or admin. They will be prompted to change their password upon first login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2 font-mono">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-bold uppercase text-ink">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Alex Taylor"
              className="h-8 text-xs font-mono border-2 border-ink"
              {...register("name")}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-[11px] text-[#E8573A]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-bold uppercase text-ink">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. ataylor@university.edu"
              className="h-8 text-xs font-mono border-2 border-ink"
              {...register("email")}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-[11px] text-[#E8573A]">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-ink">
                Assigned Role
              </Label>
              <Select
                defaultValue="STUDENT"
                onValueChange={(val: "ADMIN" | "ORGANIZER" | "STUDENT") =>
                  setValue("role", val)
                }
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
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-bold uppercase text-ink">
              Temporary Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 characters"
              className="h-8 text-xs font-mono border-2 border-ink"
              {...register("password")}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-[11px] text-[#E8573A]">{errors.password.message}</p>
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
            <Button type="submit" variant="yellow" size="sm" disabled={isPending}>
              {isPending ? "CREATING..." : "CREATE USER"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

