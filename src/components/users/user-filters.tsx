"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserFilters() {
  const [q, setQ] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: false, throttleMs: 350 })
  );

  const [role, setRole] = useQueryState(
    "role",
    parseAsString.withDefault("ALL").withOptions({ shallow: false })
  );

  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  const resetFilters = () => {
    setQ("");
    setRole("ALL");
    setPage(1);
  };

  const hasFilters = q !== "" || role !== "ALL";

  return (
    <div className="bg-paper p-4 rounded-[3px] border-2 border-ink shadow-hard space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-ink" />
          <Input
            placeholder="Search users by name or email..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-8 h-9 text-xs font-mono border-2 border-ink bg-paper shadow-hard-sm"
          />
          {q && (
            <button
              onClick={() => {
                setQ("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-ink hover:text-ink cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="sm:col-span-3">
          <Select
            value={role}
            onValueChange={(val) => {
              setRole(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-paper border-2 border-ink shadow-hard-sm font-mono uppercase tracking-wider">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="ADMIN">Administrator</SelectItem>
              <SelectItem value="ORGANIZER">Event Organizer</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-1 flex justify-end">
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-9 text-xs font-mono"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

