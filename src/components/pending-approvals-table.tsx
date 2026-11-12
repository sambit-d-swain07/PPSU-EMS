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
import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/ui-theme/sticker";
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("show-global-loader", {
            detail: { message: "Approving event proposal..." },
          })
        );
      }
      try {
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
      } finally {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hide-global-loader"));
        }
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("show-global-loader", {
            detail: { message: "Rejecting event proposal..." },
          })
        );
      }
      try {
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
      } finally {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hide-global-loader"));
        }
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
            <p className="font-mono font-semibold text-ink text-xs">{row.original.title}</p>
            <p className="font-mono text-[10px] text-muted-ink uppercase">{row.original.category}</p>
          </div>
        ),
      },
      {
        accessorKey: "organizer",
        header: "Organizer",
        cell: ({ row }) => (
          <div className="text-xs font-mono">
            <p className="font-semibold text-ink">
              {row.original.organizer.name}
            </p>
            <p className="text-[10px] text-muted-ink">
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
            <div className="text-xs font-mono">
              <p className="text-ink">{format(start, "MMM d, yyyy")}</p>
              <p className="text-[10px] text-muted-ink">{format(start, "h:mm a")}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "venue",
        header: "Venue & Capacity",
        cell: ({ row }) => (
          <div className="text-xs font-mono">
            <p className="text-ink font-medium">{row.original.venue.name}</p>
            <p className="text-[10px] text-muted-ink">
              Cap: {row.original.capacity} / {row.original.venue.capacity}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: () => <Sticker variant="pending">IN REVIEW</Sticker>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2"
              onClick={() => setSelectedEvent(row.original)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Review
            </Button>
            <Button
              size="sm"
              variant="green"
              disabled={isPending}
              onClick={() => handleApprove(row.original.id)}
              className="text-xs h-7 px-2"
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
              className="text-xs h-7 px-2"
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
        <h2 className="font-pixel text-xl tracking-tight text-ink uppercase">
          PENDING EVENT PROPOSALS
        </h2>
        <p className="font-hand text-base text-muted-ink">
          review, approve, or reject event requests submitted by organizers
        </p>
      </div>

      <div className="border-2 border-ink rounded-[3px] bg-paper shadow-hard overflow-hidden">
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
                  className="h-24 text-center font-mono text-xs text-muted-ink"
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
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-2 border-ink bg-paper shadow-hard-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Sticker variant="cream">{selectedEvent.category}</Sticker>
                <Sticker variant="pending">AWAITING REVIEW</Sticker>
              </div>
              <DialogTitle className="font-pixel text-xl text-ink uppercase tracking-tight">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-ink">
                Submitted by {selectedEvent.organizer.name} (
                {selectedEvent.organizer.email} -{" "}
                {selectedEvent.organizer.department || "No Department"})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {selectedEvent.posterUrl && (
                <div className="relative w-full h-48 rounded-[3px] overflow-hidden bg-black/5 border-2 border-ink shadow-hard-sm">
                  <Image
                    src={selectedEvent.posterUrl}
                    alt={selectedEvent.title}
                    fill
                    unoptimized={Boolean(selectedEvent.posterUrl.startsWith("data:") || selectedEvent.posterUrl.startsWith("blob:"))}
                    className="object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-paper-cream p-3 rounded-[3px] border-2 border-ink shadow-hard-sm">
                <div>
                  <span className="text-muted-ink block text-[10px] uppercase tracking-wider">
                    Starts
                  </span>
                  <span className="font-semibold text-ink">
                    {format(
                      new Date(selectedEvent.startsAt),
                      "MMM d, yyyy h:mm a"
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-ink block text-[10px] uppercase tracking-wider">
                    Ends
                  </span>
                  <span className="font-semibold text-ink">
                    {format(
                      new Date(selectedEvent.endsAt),
                      "MMM d, yyyy h:mm a"
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-ink block text-[10px] uppercase tracking-wider">
                    Venue
                  </span>
                  <span className="font-semibold text-ink">
                    {selectedEvent.venue.name} (Max:{" "}
                    {selectedEvent.venue.capacity})
                  </span>
                </div>
                <div>
                  <span className="text-muted-ink block text-[10px] uppercase tracking-wider">
                    Expected Capacity
                  </span>
                  <span className="font-semibold text-ink">
                    {selectedEvent.capacity} attendees
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-ink mb-1">
                  Description
                </h4>
                <p className="text-xs font-mono text-ink whitespace-pre-wrap leading-relaxed border-2 border-ink rounded-[3px] p-3 bg-paper shadow-hard-sm">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
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
                variant="green"
                disabled={isPending}
                onClick={() => handleApprove(selectedEvent.id)}
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
          <DialogContent className="border-2 border-ink bg-paper shadow-hard-lg">
            <DialogHeader>
              <DialogTitle className="font-pixel text-lg">REJECT EVENT</DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-ink">
                Provide a mandatory remark explaining why &quot;
                {rejectingEvent.title}&quot; cannot be approved.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-2">
              <label
                htmlFor="remark"
                className="text-xs font-mono font-bold uppercase text-ink"
              >
                Reviewer Remark (Required)
              </label>
              <Textarea
                id="remark"
                rows={3}
                placeholder="e.g. Venue capacity conflict with another scheduled department event..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="border-2 border-ink font-mono text-xs"
              />
            </div>

            <DialogFooter className="gap-2">
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

