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
      const res = await deleteVenueAction(venueId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Venue deleted successfully.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            University Venues
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage campus event halls, auditoriums, and facilities.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-1.5" /> Add Venue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Campus Venue</DialogTitle>
              <DialogDescription>
                Create a new location for university events with capacity limits.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-2"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Science Block Auditorium"
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
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Seating Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g. 250"
                          disabled={isPending}
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
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Venue"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white shadow-xs">
        <Table>
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
                    <TableCell className="font-medium text-slate-900">
                      {venue.name}
                    </TableCell>
                    <TableCell>{venue.capacity} seats</TableCell>
                    <TableCell>
                      {eventCount > 0 ? (
                        <Badge variant="secondary">
                          {eventCount} event(s)
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          0 events
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        disabled={isPending}
                        onClick={() => handleDelete(venue.id, venue.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
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
