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
import { Search, X, Calendar } from "lucide-react";
import { eventCategories } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { TornChip, type ChipColor } from "@/components/ui-theme/torn-chip";

const categoryColors: Record<string, ChipColor> = {
  ALL: "yellow",
  TECHNICAL: "blue",
  CULTURAL: "pink",
  SPORTS: "green",
  WORKSHOP: "yellow",
  SEMINAR: "cream",
  OTHER: "ink",
};

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

  const categories = ["ALL", ...eventCategories];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-[3px] border-2 border-ink shadow-hard space-y-4">
      {/* Search Input & Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink pointer-events-none" />
          <Input
            placeholder="Search events by title..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-8"
          />
          {q && (
            <button
              onClick={() => {
                setQ("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-ink hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Select
            value={dateRange}
            onValueChange={(val) => {
              setDateRange(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-ink" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Dates</SelectItem>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="THIS_WEEK">This Week</SelectItem>
              <SelectItem value="THIS_MONTH">This Month</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-3 shrink-0"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* TornChip Category Filter Bar */}
      <div className="pt-2 border-t border-ink/15">
        <div className="text-[11px] font-mono-label text-muted-ink mb-2">
          Filter by Category:
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => {
            const isActive = category === cat;
            const chipColor = categoryColors[cat] || "cream";
            return (
              <TornChip
                key={cat}
                color={chipColor}
                active={isActive}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
              >
                {cat}
              </TornChip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
