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
} from "@/components/ui/dialog";
import { format } from "date-fns";
import Link from "next/link";
import { Edit, AlertCircle, PlusCircle } from "lucide-react";

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
};

interface OrganizerEventsTableProps {
  data: EventItem[];
}

export function OrganizerEventsTable({ data }: OrganizerEventsTableProps) {
  const [remarkDialogEvent, setRemarkDialogEvent] = React.useState<EventItem | null>(null);

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
              return <Badge variant="success">Approved</Badge>;
            case "PENDING":
              return <Badge variant="warning">Pending Review</Badge>;
            case "REJECTED":
              return (
                <div className="flex items-center gap-1.5">
                  <Badge variant="destructive">Rejected</Badge>
                  {row.original.reviewRemark && (
                    <button
                      type="button"
                      onClick={() => setRemarkDialogEvent(row.original)}
                      className="text-xs text-red-600 underline flex items-center hover:text-red-800"
                    >
                      <AlertCircle className="h-3.5 w-3.5 mr-0.5" /> Remark
                    </button>
                  )}
                </div>
              );
            case "DRAFT":
            default:
              return <Badge variant="secondary">Draft</Badge>;
          }
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isEditable =
            row.original.status === "DRAFT" || row.original.status === "REJECTED";

          if (!isEditable) {
            return (
              <span className="text-xs text-slate-400 italic">Locked</span>
            );
          }

          return (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/organizer/events/${row.original.id}/edit`}>
                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
              </Link>
            </Button>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            My Events
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage your created events, track approvals, and edit drafts.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/organizer/events/new">
            <PlusCircle className="h-4 w-4 mr-1.5" /> Create Event
          </Link>
        </Button>
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

      {remarkDialogEvent && (
        <Dialog
          open={!!remarkDialogEvent}
          onOpenChange={(open) => {
            if (!open) setRemarkDialogEvent(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejection Remark</DialogTitle>
              <DialogDescription>
                Feedback provided for &quot;{remarkDialogEvent.title}&quot;
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md bg-red-50 border border-red-100 p-4 text-sm text-red-800">
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
              <Button size="sm" asChild>
                <Link href={`/organizer/events/${remarkDialogEvent.id}/edit`}>
                  Edit and Resubmit
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
