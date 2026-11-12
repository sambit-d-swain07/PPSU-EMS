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
import { Sticker } from "@/components/ui-theme/sticker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import Link from "next/link";
import { Edit, AlertCircle, PlusCircle, Users, QrCode, Star, MessageSquare, BarChart3 } from "lucide-react";

export type EventItem = {
  id: string;
  title: string;
  category: string;
  startsAt: Date | string;
  endsAt: Date | string;
  capacity: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  reviewRemark?: string | null;
  venue: {
    name: string;
    capacity: number;
  };
  registrations?: {
    id: string;
    createdAt: Date | string;
    attendedAt?: Date | string | null;
    feedback?: {
      id: string;
      rating: number;
      comment?: string | null;
      createdAt: Date | string;
    } | null;
    user: {
      id: string;
      name: string;
      email: string;
      department?: string | null;
    };
  }[];
};

interface OrganizerEventsTableProps {
  data: EventItem[];
}

export function OrganizerEventsTable({ data }: OrganizerEventsTableProps) {
  const [remarkDialogEvent, setRemarkDialogEvent] =
    React.useState<EventItem | null>(null);
  const [registrationsDialogEvent, setRegistrationsDialogEvent] =
    React.useState<EventItem | null>(null);
  const [feedbackDialogEvent, setFeedbackDialogEvent] =
    React.useState<EventItem | null>(null);

  const columns = React.useMemo<ColumnDef<EventItem>[]>(
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
        accessorKey: "startsAt",
        header: "Date & Time",
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
        header: "Venue",
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">
            {row.original.venue.name}
          </span>
        ),
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">
            {row.original.capacity}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          switch (status) {
            case "APPROVED":
              return <Sticker variant="approved">APPROVED</Sticker>;
            case "PENDING":
              return <Sticker variant="pending">IN REVIEW</Sticker>;
            case "REJECTED":
              return (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Sticker variant="rejected">REJECTED</Sticker>
                  {row.original.reviewRemark && (
                    <button
                      type="button"
                      onClick={() => setRemarkDialogEvent(row.original)}
                      className="text-[10px] font-mono uppercase tracking-wider text-[#E8573A] underline flex items-center hover:opacity-80 cursor-pointer"
                    >
                      <AlertCircle className="h-3 w-3 mr-0.5" /> Note
                    </button>
                  )}
                </div>
              );
            case "DRAFT":
            default:
              return <Sticker variant="draft">DRAFT</Sticker>;
          }
        },
      },
      {
        id: "registrations",
        header: "Registrations",
        cell: ({ row }) => {
          const regCount = row.original.registrations?.length || 0;
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRegistrationsDialogEvent(row.original)}
              className="text-xs h-7 font-mono px-2"
            >
              <Users className="h-3.5 w-3.5 mr-1 text-muted-ink" />
              {regCount} / {row.original.capacity}
            </Button>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isEditable =
            row.original.status === "DRAFT" || row.original.status === "REJECTED";

          if (row.original.status === "APPROVED") {
            const isEnded = new Date(row.original.endsAt).getTime() <= Date.now();
            return (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button size="sm" variant="default" className="text-xs h-7 px-2" asChild>
                  <Link href={`/organizer/events/${row.original.id}/attendance`}>
                    <QrCode className="h-3.5 w-3.5 mr-1" /> Check-in
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-7 px-2" asChild>
                  <Link href={`/organizer/events/${row.original.id}/analytics`}>
                    <BarChart3 className="h-3.5 w-3.5 mr-1 text-blue-600" /> Stats
                  </Link>
                </Button>
                {isEnded && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    onClick={() => setFeedbackDialogEvent(row.original)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1 text-amber-600" /> Feedback
                  </Button>
                )}
              </div>
            );
          }

          if (isEditable) {
            return (
              <Button size="sm" variant="outline" className="text-xs h-7 px-2.5" asChild>
                <Link href={`/organizer/events/${row.original.id}/edit`}>
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Link>
              </Button>
            );
          }

          return (
            <span className="text-[11px] font-mono text-muted-ink uppercase tracking-wider">Locked</span>
          );
        },
      },
    ],
    []
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-pixel text-xl tracking-tight text-ink uppercase">
            MY PROPOSED & HOSTED EVENTS
          </h2>
          <p className="font-hand text-base text-muted-ink">
            manage your events, check approvals & view student turnouts
          </p>
        </div>
        <Button size="sm" variant="yellow" asChild className="self-start sm:self-auto">
          <Link href="/organizer/events/new">
            <PlusCircle className="h-4 w-4 mr-1.5" /> CREATE EVENT
          </Link>
        </Button>
      </div>

      <div className="border-2 border-ink rounded-[3px] bg-paper shadow-hard overflow-x-auto">
        <Table className="min-w-[700px]">
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
                  No events found. Click &quot;Create Event&quot; to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end space-x-2 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}

      {/* Rejection Remark Dialog */}
      {remarkDialogEvent && (
        <Dialog
          open={!!remarkDialogEvent}
          onOpenChange={(open) => {
            if (!open) setRemarkDialogEvent(null);
          }}
        >
          <DialogContent className="border-2 border-ink bg-paper shadow-hard-lg">
            <DialogHeader>
              <DialogTitle className="font-pixel text-lg">REJECTION REMARK</DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-ink">
                Feedback provided for &quot;{remarkDialogEvent.title}&quot;
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-[3px] bg-[#FDF2F4] border-2 border-ink p-4 text-xs font-mono text-ink shadow-hard-sm">
              {remarkDialogEvent.reviewRemark || "No detailed remark provided."}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRemarkDialogEvent(null)}
              >
                Close
              </Button>
              <Button size="sm" variant="yellow" asChild>
                <Link href={`/organizer/events/${remarkDialogEvent.id}/edit`}>
                  Edit and Resubmit
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Registrations Dialog */}
      {registrationsDialogEvent && (
        <Dialog
          open={!!registrationsDialogEvent}
          onOpenChange={(open) => {
            if (!open) setRegistrationsDialogEvent(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col border-2 border-ink bg-paper shadow-hard-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="font-pixel text-lg">REGISTERED STUDENTS</span>
                <Badge variant="outline" className="border-2 border-ink bg-[#BFE5CF] font-mono text-[10px]">
                  {registrationsDialogEvent.registrations?.length || 0} /{" "}
                  {registrationsDialogEvent.capacity} FILLED
                </Badge>
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-ink">
                Confirmed attendee list for &quot;
                {registrationsDialogEvent.title}&quot;
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 my-2 border-2 border-ink rounded-[3px] bg-paper shadow-hard-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Registered At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationsDialogEvent.registrations?.length ? (
                    registrationsDialogEvent.registrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-mono text-xs font-semibold text-ink">
                          {reg.user.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-ink">
                          {reg.user.email}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-ink">
                          {reg.user.department || "General"}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-ink">
                          {format(new Date(reg.createdAt), "MMM d, h:mm a")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center font-mono text-xs text-muted-ink"
                      >
                        No students have registered for this event yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRegistrationsDialogEvent(null)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Feedback Dialog */}
      {feedbackDialogEvent && (() => {
        const feedbacks = feedbackDialogEvent.registrations
          ?.map((r) => r.feedback)
          .filter((f): f is NonNullable<typeof f> => Boolean(f)) || [];
        const avg = feedbacks.length
          ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
          : null;

        return (
          <Dialog
            open={!!feedbackDialogEvent}
            onOpenChange={(open) => {
              if (!open) setFeedbackDialogEvent(null);
            }}
          >
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col border-2 border-ink bg-paper shadow-hard-lg">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle className="font-pixel text-lg">
                    ATTENDEE FEEDBACK
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1 font-mono text-[10px] bg-[#F6C945] border-2 border-ink text-ink">
                      <Star className="h-3 w-3 fill-ink text-ink" />
                      {avg ? `${avg} / 5` : "NO RATINGS"}
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-[10px] border-2 border-ink">
                      {feedbacks.length} {feedbacks.length === 1 ? "REVIEW" : "REVIEWS"}
                    </Badge>
                  </div>
                </div>
                <DialogDescription className="font-mono text-xs text-muted-ink">
                  Anonymous student ratings and reviews for &quot;{feedbackDialogEvent.title}&quot;
                </DialogDescription>
              </DialogHeader>

              <div className="overflow-y-auto flex-1 my-2 border-2 border-ink rounded-[3px] bg-paper shadow-hard-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead className="w-28 text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks.length > 0 ? (
                      feedbacks.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-semibold text-amber-600">
                            <span className="flex items-center gap-0.5">
                              {Array.from({ length: f.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-[#F6C945] text-ink" />
                              ))}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-ink leading-relaxed">
                            {f.comment || (
                              <span className="text-muted-ink italic">No written comment</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-[11px] font-mono text-muted-ink">
                            {format(new Date(f.createdAt), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="h-28 text-center font-mono text-xs text-muted-ink"
                        >
                          No feedback has been submitted by attendees yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeedbackDialogEvent(null)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}
