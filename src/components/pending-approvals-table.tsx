"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { reviewEventAction } from "@/actions/events";
import { toast } from "sonner";
import Image from "next/image";
import { Eye, CheckCircle2, XCircle } from "lucide-react";

export type PendingEventItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  startsAt: Date | string;
  endsAt: Date | string;
  capacity: number;
  posterUrl?: string | null;
  createdAt: Date | string;
  venue: {
    id: string;
    name: string;
    capacity: number;
  };
  organizer: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
  };
};

interface PendingApprovalsTableProps {
  data: PendingEventItem[];
}

export function PendingApprovalsTable({ data }: PendingApprovalsTableProps) {
  const [selectedEvent, setSelectedEvent] =
    React.useState<PendingEventItem | null>(null);
  const [rejectingEvent, setRejectingEvent] =
    React.useState<PendingEventItem | null>(null);
  const [remark, setRemark] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const handleApprove = (eventId: string) => {
    startTransition(async () => {
      const res = await reviewEventAction({
        eventId,
        action: "APPROVE",
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Event approved successfully.");
        setSelectedEvent(null);
      }
    });
  };

  const handleReject = () => {
    if (!rejectingEvent) return;
    if (!remark.trim()) {
      toast.error("Please provide a reason/remark for rejection.");
      return;
    }

    startTransition(async () => {
      const res = await reviewEventAction({
        eventId: rejectingEvent.id,
        action: "REJECT",
        remark: remark.trim(),
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Event rejected with remark.");
        setRejectingEvent(null);
        setSelectedEvent(null);
        setRemark("");
      }
    });
  };

  const columns = React.useMemo<ColumnDef<PendingEventItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Event",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-900">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">{row.original.category}</p>
          </div>
        ),
      },
      {
        accessorKey: "organizer",
        header: "Organizer",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-medium text-slate-800">
              {row.original.organizer.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.organizer.department || row.original.organizer.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "startsAt",
        header: "Schedule",
        cell: ({ row }) => {
          const start = new Date(row.original.startsAt);
          return (
            <div className="text-sm">
              <p>{format(start, "MMM d, yyyy")}</p>
              <p className="text-xs text-muted-foreground">{format(start, "h:mm a")}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "venue",
        header: "Venue & Capacity",
        cell: ({ row }) => (
          <div className="text-sm">
            <p>{row.original.venue.name}</p>
            <p className="text-xs text-muted-foreground">
              Capacity: {row.original.capacity} / {row.original.venue.capacity}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: () => <Badge variant="warning">Pending Review</Badge>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedEvent(row.original)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Review
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => handleApprove(row.original.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                setRejectingEvent(row.original);
                setRemark("");
              }}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
            </Button>
          </div>
        ),
      },
    ],
    [isPending]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Pending Approvals
        </h2>
        <p className="text-xs text-muted-foreground">
          Review, approve, or reject event requests submitted by organizers.
        </p>
      </div>

      <div className="rounded-md border bg-white shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No pending events waiting for review.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog
          open={!!selectedEvent}
          onOpenChange={(open) => {
            if (!open) setSelectedEvent(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{selectedEvent.category}</Badge>
                <Badge variant="warning">Pending Review</Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription>
                Submitted by {selectedEvent.organizer.name} (
                {selectedEvent.organizer.email} -{" "}
                {selectedEvent.organizer.department || "No Department"})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {selectedEvent.posterUrl && (
                <div className="relative w-full h-48 rounded-md overflow-hidden bg-slate-100 border">
                  <Image
                    src={selectedEvent.posterUrl}
                    alt={selectedEvent.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-md border border-slate-100">
                <div>
                  <span className="text-muted-foreground block text-xs">
                    Starts
                  </span>
                  <span className="font-medium text-slate-800">
                    {format(
                      new Date(selectedEvent.startsAt),
                      "MMM d, yyyy h:mm a"
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">
                    Ends
                  </span>
                  <span className="font-medium text-slate-800">
                    {format(
                      new Date(selectedEvent.endsAt),
                      "MMM d, yyyy h:mm a"
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">
                    Venue
                  </span>
                  <span className="font-medium text-slate-800">
                    {selectedEvent.venue.name} (Max:{" "}
                    {selectedEvent.venue.capacity})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">
                    Expected Capacity
                  </span>
                  <span className="font-medium text-slate-800">
                    {selectedEvent.capacity} attendees
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Description
                </h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  setRejectingEvent(selectedEvent);
                  setRemark("");
                }}
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => handleApprove(selectedEvent.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Approve Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Remark Dialog */}
      {rejectingEvent && (
        <Dialog
          open={!!rejectingEvent}
          onOpenChange={(open) => {
            if (!open) setRejectingEvent(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Event</DialogTitle>
              <DialogDescription>
                Provide a mandatory remark explaining why &quot;
                {rejectingEvent.title}&quot; cannot be approved.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-2">
              <label
                htmlFor="remark"
                className="text-xs font-medium text-slate-700"
              >
                Reviewer Remark (Required)
              </label>
              <Textarea
                id="remark"
                rows={3}
                placeholder="e.g. Venue capacity conflict with another scheduled department event..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingEvent(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending || !remark.trim()}
                onClick={handleReject}
              >
                {isPending ? "Submitting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
