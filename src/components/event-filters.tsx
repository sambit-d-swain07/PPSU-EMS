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
import { eventCategories } from "@/lib/schemas";
import { Button } from "@/components/ui/button";

export function EventFilters() {
  const [q, setQ] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: false, throttleMs: 350 })
  );

  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault("ALL").withOptions({ shallow: false })
  );

  const [dateRange, setDateRange] = useQueryState(
    "dateRange",
    parseAsString.withDefault("ALL").withOptions({ shallow: false })
  );

  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  const resetFilters = () => {
    setQ("");
    setCategory("ALL");
    setDateRange("ALL");
    setPage(1);
  };

  const hasFilters = q !== "" || category !== "ALL" || dateRange !== "ALL";

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search events by title..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9"
          />
        </div>

        {/* Category Selector */}
        <div className="sm:col-span-3">
          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {eventCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Selector */}
        <div className="sm:col-span-3">
          <Select
            value={dateRange}
            onValueChange={(val) => {
              setDateRange(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Any Time</SelectItem>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="THIS_WEEK">This Week</SelectItem>
              <SelectItem value="THIS_MONTH">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-muted-foreground">
          <span>Active search filters</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-3 w-3 mr-1" /> Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
