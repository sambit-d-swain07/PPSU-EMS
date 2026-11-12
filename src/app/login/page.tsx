"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { loginAction } from "@/actions/auth";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Folder } from "@/components/ui-theme/folder";
import { PixelHeading } from "@/components/ui-theme/pixel-heading";
import { Sticker } from "@/components/ui-theme/sticker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(values);
      if (result.error) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hide-global-loader"));
        }
        setServerError(result.error);
      } else if (result.success) {
        window.location.href = "/";
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-12 relative overflow-hidden">
      {/* Decorative Floating Stickers */}
      <div className="hidden lg:block absolute left-12 top-24 pointer-events-none">
        <Sticker color="yellow" rotate={-6}>
          #workshops
        </Sticker>
        <div className="font-hand text-sm text-muted-ink mt-1 ml-4 -rotate-3">
          hands-on tech ↗
        </div>
      </div>

      <div className="hidden lg:block absolute right-14 top-32 pointer-events-none">
        <Sticker color="pink" rotate={4}>
          #annual_fest
        </Sticker>
        <div className="font-hand text-sm text-muted-ink mt-1 text-right -rotate-2">
          ↖ live performances
        </div>
      </div>

      <div className="hidden sm:block absolute left-20 bottom-16 pointer-events-none">
        <Sticker color="mint" rotate={3}>
          #hackathons
        </Sticker>
      </div>

      <div className="hidden sm:block absolute right-24 bottom-20 pointer-events-none">
        <Sticker color="cream" rotate={-4}>
          #sports_meet
        </Sticker>
      </div>

      {/* Hero Title Section */}
      <div className="w-full max-w-lg mb-8">
        <PixelHeading
          title="PPSU EVENTS"
          caption="✦ welcome to the campus portal ✦"
          tagline="Every campus event, workshop, and ticket in one notebook."
          doodleBox={true}
        />
      </div>

      {/* Login Folder Card */}
      <div className="w-full max-w-md">
        <Folder tab="SIGN IN" tabSide="left" color="paper">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-ink tracking-tight font-sans">
                University Access
              </h2>
              <p className="text-xs text-muted-ink font-hand text-sm">
                Sign in with your student, organizer, or admin account.
              </p>
            </div>

            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-mono-label text-ink">
                        Campus Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="student@university.edu"
                          autoComplete="email"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px] text-[#F0508C] font-mono" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-mono-label text-ink">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px] text-[#F0508C] font-mono" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={isPending}
                >
                  {isPending ? (
                    "AUTHENTICATING..."
                  ) : (
                    <>
                      ENTER PORTAL <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="pt-3 border-t border-ink/20 flex items-center justify-between text-[11px] text-muted-ink font-mono-label">
              <span>PPSU Campus Network</span>
              <span className="flex items-center gap-1 text-[#19A860]">
                <span className="h-2 w-2 rounded-full bg-[#19A860] animate-pulse" />
                SYSTEM ONLINE
              </span>
            </div>
          </div>
        </Folder>
      </div>
    </div>
  );
}
