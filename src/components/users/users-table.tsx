"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { Switch } from "@/components/ui/switch";
import { Sticker } from "@/components/ui-theme/sticker";
import { format } from "date-fns";
import { Edit2, KeyRound, ChevronLeft, ChevronRight } from "lucide-react";
import { toggleUserActiveAction } from "@/actions/users";
import { toast } from "sonner";
import { EditUserDialog, type UserItem } from "./edit-user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { useQueryState, parseAsInteger } from "nuqs";

interface UsersTableProps {
  data: UserItem[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  currentUserId: string;
}

export function UsersTable({
  data,
  totalCount,
  pageSize,
  currentPage,
  currentUserId,
}: UsersTableProps) {
  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  const [editUser, setEditUser] = React.useState<UserItem | null>(null);
  const [resetUser, setResetUser] = React.useState<UserItem | null>(null);
  const [pendingToggles, setPendingToggles] = React.useState<Record<string, boolean>>({});

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleToggleActive = React.useCallback(
    async (user: UserItem, newStatus: boolean) => {
      if (user.id === currentUserId && !newStatus) {
        toast.error("You cannot deactivate your own administrator account.");
        return;
      }

      setPendingToggles((prev) => ({ ...prev, [user.id]: true }));
      try {
        const res = await toggleUserActiveAction(user.id, newStatus);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`Account for "${user.name}" is now ${newStatus ? "active" : "deactivated"}.`);
        }
      } catch {
        toast.error("Failed to update user status.");
      } finally {
        setPendingToggles((prev) => ({ ...prev, [user.id]: false }));
      }
    },
    [currentUserId]
  );

  const columns = React.useMemo<ColumnDef<UserItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User Details",
        cell: ({ row }) => {
          const user = row.original;
          const isSelf = user.id === currentUserId;
          return (
            <div className="space-y-0.5 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-ink text-xs">{user.name}</span>
                {isSelf && (
                  <span className="font-mono text-[9px] px-1 bg-paper border border-ink text-ink font-bold">
                    YOU
                  </span>
                )}
                {user.mustChangePassword && (
                  <span className="font-mono text-[9px] px-1 bg-[#F6C945] border border-ink text-ink font-bold">
                    TEMP PASS
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-ink">{user.email}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.role;
          switch (role) {
            case "ADMIN":
              return <Sticker variant="pink">ADMIN</Sticker>;
            case "ORGANIZER":
              return <Sticker variant="yellow">ORGANIZER</Sticker>;
            case "STUDENT":
            default:
              return <Sticker variant="cream">STUDENT</Sticker>;
          }
        },
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-ink">
            {row.original.department || "-"}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const user = row.original;
          const isSelf = user.id === currentUserId;
          const isPending = pendingToggles[user.id] || false;

          return (
            <div className="flex items-center gap-2 font-mono">
              <Switch
                checked={user.isActive}
                disabled={isSelf || isPending}
                onCheckedChange={(checked) => handleToggleActive(user, checked)}
                aria-label={`Toggle active status for ${user.name}`}
              />
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  user.isActive ? "text-[#19A860]" : "text-muted-ink"
                }`}
              >
                {user.isActive ? "Active" : "Disabled"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-[11px] font-mono text-muted-ink">
            {format(new Date(row.original.createdAt), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditUser(user)}
                className="h-7 px-2 text-xs font-mono"
              >
                <Edit2 className="h-3 w-3 mr-1 text-muted-ink" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetUser(user)}
                className="h-7 px-2 text-xs font-mono border-ink bg-paper"
              >
                <KeyRound className="h-3 w-3 mr-1 text-ink" /> Reset Pass
              </Button>
            </div>
          );
        },
      },
    ],
    [currentUserId, pendingToggles, handleToggleActive]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="border-2 border-ink rounded-[3px] bg-paper shadow-hard overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-xs font-mono text-muted-ink"
                >
                  No user accounts found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 font-mono text-xs text-muted-ink">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="h-8 text-xs font-mono"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>
            <span className="px-2 text-xs font-bold text-ink">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="h-8 text-xs font-mono"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <EditUserDialog
        user={editUser}
        currentUserId={currentUserId}
        onClose={() => setEditUser(null)}
      />

      <ResetPasswordDialog
        user={resetUser}
        onClose={() => setResetUser(null)}
      />
    </div>
  );
}
