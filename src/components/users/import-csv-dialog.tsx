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
        <Button variant="outline" size="sm" className="h-9 text-xs bg-white">
          <Upload className="h-3.5 w-3.5 mr-1.5 text-slate-600" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Bulk Import University Accounts
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload a CSV with name, email, password, role, and department columns.
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleTemplate}
              className="text-xs shrink-0"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-slate-500" /> Sample Template
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 flex-1 overflow-hidden flex flex-col">
          {rows.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-3 bg-slate-50/50">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Select a CSV file to validate and preview
                </p>
                <p className="text-[11px] text-slate-500">
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
                variant="default"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Choose CSV File
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden space-y-3">
              {/* Validation Summary Bar */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-slate-500" />
                    {fileName}
                  </span>
                  <Badge variant="outline" className="text-[11px]">
                    {rows.length} total rows
                  </Badge>
                  <Badge variant="success" className="text-[11px] gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {validRows.length} valid
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="text-[11px] gap-1">
                      <AlertTriangle className="h-3 w-3" /> {errorCount} errors
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs">
                  Upload Different File
                </Button>
              </div>

              {/* Table Preview */}
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75">
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
                      <TableRow key={row.rowNumber} className={row.isValid ? "" : "bg-red-50/40"}>
                        <TableCell className="text-xs text-center text-slate-400 font-mono">
                          {row.rowNumber}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-900">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-mono">
                          {row.email}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant={
                              row.role === "ADMIN"
                                ? "destructive"
                                : row.role === "ORGANIZER"
                                ? "warning"
                                : row.role === "STUDENT"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {row.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {row.department}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.isValid ? (
                            <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Ready
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              {row.errors.map((err, i) => (
                                <p key={i} className="text-[11px] text-red-600 flex items-center gap-1">
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
            size="sm"
            onClick={handleConfirmImport}
            disabled={isPending || validRows.length === 0}
          >
            {isPending ? "Importing..." : `Confirm Import (${validRows.length} Users)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
