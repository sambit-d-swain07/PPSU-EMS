"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventFormSchema,
  type EventFormInput,
  eventCategories,
} from "@/lib/schemas";
import { createEventAction, updateEventAction } from "@/actions/events";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PosterUpload } from "@/components/poster-upload";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface VenueOption {
  id: string;
  name: string;
  capacity: number;
}

interface EventFormProps {
  venues: VenueOption[];
  eventId?: string;
  initialData?: {
    title: string;
    description: string;
    category: (typeof eventCategories)[number];
    venueId: string;
    startsAt: string; // ISO string or datetime-local format
    endsAt: string;
    capacity: number;
    posterUrl?: string | null;
    status?: string;
    reviewRemark?: string | null;
  };
}

// Convert ISO string to "YYYY-MM-DDTHH:mm" for <input type="datetime-local" />
function toDatetimeLocal(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function EventForm({ venues, eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "TECHNICAL",
      venueId: initialData?.venueId || (venues[0]?.id ?? ""),
      startsAt: initialData?.startsAt
        ? toDatetimeLocal(initialData.startsAt)
        : "",
      endsAt: initialData?.endsAt ? toDatetimeLocal(initialData.endsAt) : "",
      capacity: initialData?.capacity || 50,
      posterUrl: initialData?.posterUrl || null,
    },
  });

  const selectedVenueId = form.watch("venueId");
  const selectedVenue = venues.find((v) => v.id === selectedVenueId);

  const handleSubmit = (submitForApproval: boolean) => {
    form.handleSubmit((values) => {
      // Check client-side venue capacity
      if (selectedVenue && values.capacity > selectedVenue.capacity) {
        form.setError("capacity", {
          message: `Capacity cannot exceed venue maximum (${selectedVenue.capacity}).`,
        });
        return;
      }

      startTransition(async () => {
        const result = eventId
          ? await updateEventAction(eventId, values, submitForApproval)
          : await createEventAction(values, submitForApproval);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(
            submitForApproval
              ? "Event submitted for approval."
              : "Event saved as draft."
          );
          router.push("/organizer");
          router.refresh();
        }
      });
    })();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/organizer">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Events
          </Link>
        </Button>
      </div>

      {initialData?.status === "REJECTED" && initialData.reviewRemark && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">
                Event was rejected by reviewer
              </p>
              <p className="mt-1 text-red-700">
                <strong>Remark:</strong> {initialData.reviewRemark}
              </p>
              <p className="mt-2 text-xs text-red-600">
                You can address the reviewer&apos;s feedback below and resubmit
                for approval.
              </p>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Annual Tech Symposium 2026"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide a detailed overview of the event, agenda, and speakers..."
                    rows={4}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a venue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name} (Max {venue.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startsAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starts At</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endsAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ends At</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attendee Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={selectedVenue?.capacity}
                    placeholder="Enter maximum expected attendees"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                {selectedVenue && (
                  <FormDescription>
                    Maximum allowable capacity for {selectedVenue.name} is{" "}
                    <strong>{selectedVenue.capacity}</strong>.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="posterUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Poster</FormLabel>
                <FormControl>
                  <PosterUpload
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleSubmit(false)}
            >
              {isPending ? "Saving..." : "Save as draft"}
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => handleSubmit(true)}
            >
              {isPending ? "Submitting..." : "Submit for approval"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
