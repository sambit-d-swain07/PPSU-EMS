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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 text-xs">{user.name}</span>
                {isSelf && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1 bg-slate-50 text-slate-600">
                    You
                  </Badge>
                )}
                {user.mustChangePassword && (
                  <Badge variant="warning" className="text-[10px] py-0 px-1">
                    Temp Pass
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
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
              return <Badge variant="destructive" className="text-[10px]">Admin</Badge>;
            case "ORGANIZER":
              return <Badge variant="warning" className="text-[10px]">Organizer</Badge>;
            case "STUDENT":
            default:
              return <Badge variant="secondary" className="text-[10px]">Student</Badge>;
          }
        },
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
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
            <div className="flex items-center gap-2">
              <Switch
                checked={user.isActive}
                disabled={isSelf || isPending}
                onCheckedChange={(checked) => handleToggleActive(user, checked)}
                aria-label={`Toggle active status for ${user.name}`}
              />
              <span
                className={`text-[11px] font-medium ${
                  user.isActive ? "text-emerald-700" : "text-slate-400"
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
          <span className="text-[11px] text-slate-500">
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
                className="h-7 px-2 text-xs"
              >
                <Edit2 className="h-3 w-3 mr-1 text-slate-500" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetUser(user)}
                className="h-7 px-2 text-xs text-amber-700 hover:text-amber-900 border-amber-200 bg-amber-50/50 hover:bg-amber-100/50"
              >
                <KeyRound className="h-3 w-3 mr-1 text-amber-600" /> Reset Pass
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
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50/75">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold">
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
                  className="h-28 text-center text-xs text-muted-foreground"
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
        <div className="flex items-center justify-between px-2 text-xs text-slate-500">
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
              className="h-8 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>
            <span className="px-2 text-xs font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="h-8 text-xs"
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
