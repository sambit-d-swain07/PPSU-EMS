"use client";

import { useState, useTransition, useRef } from "react";
import Papa from "papaparse";
import { csvUserRowSchema, type CsvUserRow } from "@/lib/schemas";
import { bulkImportUsersAction } from "@/actions/users";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RowValidationResult {
  rowNumber: number;
  name: string;
  email: string;
  role: string;
  department: string;
  isValid: boolean;
  errors: string[];
  cleanData?: CsvUserRow;
}

export function ImportCsvDialog() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<RowValidationResult[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleTemplate = () => {
    const csvContent =
      "name,email,password,role,department\n" +
      "John Student,student_sample@university.edu,TempPass123!,STUDENT,Engineering\n" +
      "Sarah Organizer,organizer_sample@university.edu,TempPass123!,ORGANIZER,Student Affairs\n" +
      "David Admin,admin_sample@university.edu,TempPass123!,ADMIN,Administration\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users-import-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        const validated: RowValidationResult[] = results.data.map((row, idx) => {
          const rawRole = (row.role || "").trim().toUpperCase();
          const cleanRow = {
            name: (row.name || "").trim(),
            email: (row.email || "").trim(),
            password: (row.password || "").trim(),
            role: rawRole as "ADMIN" | "ORGANIZER" | "STUDENT",
            department: (row.department || "").trim() || undefined,
          };

          const parseResult = csvUserRowSchema.safeParse(cleanRow);
          if (parseResult.success) {
            return {
              rowNumber: idx + 1,
              name: cleanRow.name,
              email: cleanRow.email,
              role: rawRole,
              department: cleanRow.department || "-",
              isValid: true,
              errors: [],
              cleanData: parseResult.data,
            };
          } else {
            const errorMessages = parseResult.error.errors.map(
              (err) => `${err.path.join(".")}: ${err.message}`
            );
            return {
              rowNumber: idx + 1,
              name: cleanRow.name || "(missing name)",
              email: cleanRow.email || "(missing email)",
              role: rawRole || "(missing)",
              department: cleanRow.department || "-",
              isValid: false,
              errors: errorMessages,
            };
          }
        });

        setRows(validated);
      },
      error: (err) => {
        toast.error(`CSV Parsing error: ${err.message}`);
      },
    });
  };

  const validRows = rows.filter((r) => r.isValid && r.cleanData).map((r) => r.cleanData!);
  const errorCount = rows.filter((r) => !r.isValid).length;

  const handleConfirmImport = () => {
    if (validRows.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }

    startTransition(async () => {
      const res = await bulkImportUsersAction(validRows);
      if (res.error) {
        toast.error(res.error);
      } else if (res.summary) {
        toast.success(
          `Import complete! Created: ${res.summary.created}, Updated: ${res.summary.updated}, Skipped: ${res.summary.skipped}`
        );
        setRows([]);
        setFileName(null);
        setOpen(false);
      }
    });
  };

  const handleReset = () => {
    setRows([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-xs font-mono border-2 border-ink bg-paper shadow-hard-sm">
          <Upload className="h-3.5 w-3.5 mr-1.5 text-ink" /> IMPORT CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col border-2 border-ink bg-paper shadow-hard-lg">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="font-pixel text-lg text-ink uppercase">
                BULK IMPORT ACCOUNTS
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-ink">
                Upload a CSV with name, email, password, role, and department columns.
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleTemplate}
              className="text-xs font-mono shrink-0 border-ink self-start sm:self-auto"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-ink" /> TEMPLATE
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 flex-1 overflow-hidden flex flex-col font-mono">
          {rows.length === 0 ? (
            <div className="border-2 border-dashed border-ink rounded-[3px] p-8 text-center space-y-3 bg-paper-cream">
              <div className="h-10 w-10 rounded-[3px] border border-ink bg-paper flex items-center justify-center mx-auto text-ink">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink uppercase tracking-wider">
                  Select a CSV file to validate and preview
                </p>
                <p className="text-[11px] text-muted-ink">
                  Required columns: name, email, password, role, department
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <Button
                variant="yellow"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" /> CHOOSE CSV FILE
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden space-y-3">
              {/* Validation Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-paper-cream rounded-[3px] border-2 border-ink shadow-hard-sm text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-ink" />
                    {fileName}
                  </span>
                  <Badge variant="outline" className="text-[11px] font-mono border-ink bg-paper">
                    {rows.length} total rows
                  </Badge>
                  <Badge variant="outline" className="text-[11px] font-mono border-ink bg-[#BFE5CF] text-ink gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {validRows.length} valid
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="outline" className="text-[11px] font-mono border-ink bg-[#FDF2F4] text-[#E8573A] gap-1">
                      <AlertTriangle className="h-3 w-3" /> {errorCount} errors
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-xs font-mono">
                  Change File
                </Button>
              </div>

              {/* Table Preview */}
              <div className="flex-1 overflow-auto border-2 border-ink rounded-[3px] bg-paper shadow-hard-sm">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-12 text-center">#</TableHead>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead className="text-xs">Department</TableHead>
                      <TableHead className="text-xs">Validation Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.rowNumber} className={row.isValid ? "" : "bg-[#FDF2F4]"}>
                        <TableCell className="text-xs text-center text-muted-ink font-mono">
                          {row.rowNumber}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-ink">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-ink font-mono">
                          {row.email}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-ink bg-paper"
                          >
                            {row.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-ink">
                          {row.department}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.isValid ? (
                            <span className="text-[#19A860] font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="h-3 w-3" /> Ready
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              {row.errors.map((err, i) => (
                                <p key={i} className="text-[11px] text-[#E8573A] flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3 shrink-0" />
                                  {err}
                                </p>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="yellow"
            size="sm"
            onClick={handleConfirmImport}
            disabled={isPending || validRows.length === 0}
          >
            {isPending ? "IMPORTING..." : `CONFIRM IMPORT (${validRows.length} USERS)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
