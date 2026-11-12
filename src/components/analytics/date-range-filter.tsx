"use client";

import { useQueryState, parseAsString } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

export function DateRangeFilter() {
  const [range, setRange] = useQueryState(
    "range",
    parseAsString.withDefault("all").withOptions({ shallow: false })
  );

  return (
    <div className="flex items-center gap-2">
      <Select value={range || "all"} onValueChange={(val) => setRange(val === "all" ? null : val)}>
        <SelectTrigger className="w-[170px] h-9 text-xs bg-paper border-2 border-ink shadow-hard-sm font-mono uppercase tracking-wider">
          <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-ink" />
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="30d">Last 30 Days</SelectItem>
          <SelectItem value="90d">Last 90 Days</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

