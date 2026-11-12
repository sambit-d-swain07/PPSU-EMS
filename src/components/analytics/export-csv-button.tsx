"use client";

import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportCsvButtonProps {
  data: Record<string, string | number | boolean | null | undefined>[];
  filename: string;
}

export function ExportCsvButton({ data, filename }: ExportCsvButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className="h-8 text-xs bg-white"
    >
      <Download className="h-3.5 w-3.5 mr-1.5 text-slate-600" />
      Export CSV
    </Button>
  );
}
