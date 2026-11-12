"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { venueFormSchema, type VenueFormInput } from "@/lib/schemas";
import { createVenueAction, deleteVenueAction } from "@/actions/venues";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2 } from "lucide-react";

export type VenueItem = {
  id: string;
  name: string;
  capacity: number;
  _count?: {
    events: number;
  };
};

interface VenuesManagerProps {
  venues: VenueItem[];
}

export function VenuesManager({ venues }: VenuesManagerProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<VenueFormInput>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: "",
      capacity: 100,
    },
  });

  const onSubmit = (values: VenueFormInput) => {
    startTransition(async () => {
      const res = await createVenueAction(values);
      if (res.error) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hide-global-loader"));
        }
        toast.error(res.error);
      } else {
        toast.success("Venue created successfully.");
        form.reset();
        setOpen(false);
      }
    });
  };

  const handleDelete = (venueId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete venue "${name}"?`)) return;

    startTransition(async () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("show-global-loader", {
            detail: { message: `Deleting venue "${name}"...` },
          })
        );
      }
      try {
        const res = await deleteVenueAction(venueId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Venue deleted successfully.");
        }
      } finally {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hide-global-loader"));
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-pixel text-xl tracking-tight text-ink uppercase">
            CAMPUS VENUES & FACILITIES
          </h2>
          <p className="font-hand text-base text-muted-ink">
            manage event halls, auditoriums, and capacity limits
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="yellow" className="self-start sm:self-auto">
              <PlusCircle className="h-4 w-4 mr-1.5" /> ADD VENUE
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-ink bg-paper shadow-hard-lg">
            <DialogHeader>
              <DialogTitle className="font-pixel text-lg">ADD CAMPUS VENUE</DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-ink">
                Create a new location for university events with capacity limits.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-2 font-mono"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-bold text-ink">Venue Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Science Block Auditorium"
                          disabled={isPending}
                          className="border-2 border-ink font-mono text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-bold text-ink">Maximum Seating Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g. 250"
                          disabled={isPending}
                          className="border-2 border-ink font-mono text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="yellow" disabled={isPending}>
                    {isPending ? "CREATING..." : "CREATE VENUE"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border-2 border-ink rounded-[3px] bg-paper shadow-hard overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Venue Name</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Assigned Events</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venues.length ? (
              venues.map((venue) => {
                const eventCount = venue._count?.events ?? 0;
                return (
                  <TableRow key={venue.id}>
                    <TableCell className="font-mono text-xs font-semibold text-ink">
                      {venue.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-ink">{venue.capacity} seats</TableCell>
                    <TableCell>
                      {eventCount > 0 ? (
                        <Badge variant="outline" className="border border-ink bg-paper-cream font-mono text-[10px]">
                          {eventCount} event(s)
                        </Badge>
                      ) : (
                        <span className="text-xs font-mono text-muted-ink">
                          0 events
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#E8573A] border-ink text-xs h-7"
                        disabled={isPending}
                        onClick={() => handleDelete(venue.id, venue.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center font-mono text-xs text-muted-ink"
                >
                  No venues found. Click &quot;Add Venue&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

