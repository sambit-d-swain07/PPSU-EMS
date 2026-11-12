"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import {
  CheckCircle2,
  Camera,
  Users,
  Search,
  Check,
  XCircle,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { markAttendance, toggleAttendance } from "@/actions/attendance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((m) => m.Scanner),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-80 w-full rounded-xl bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-800">
        <Camera className="h-8 w-8 animate-pulse text-slate-500" />
        <span className="text-xs">Initializing camera feed...</span>
      </div>
    ),
  }
);

export type RegistrationItem = {
  id: string;
  createdAt: Date | string;
  attendedAt: Date | string | null;
  user: {
    id: string;
    name: string;
    email: string;
    department: string | null;
  };
};

interface AttendanceScannerProps {
  eventId: string;
  eventTitle: string;
  eventCategory: string;
  startsAt: Date | string;
  endsAt: Date | string;
  venueName: string;
  registrations: RegistrationItem[];
}

export function AttendanceScanner({
  eventId,
  eventTitle,
  eventCategory,
  startsAt,
  endsAt,
  venueName,
  registrations: initialRegistrations,
}: AttendanceScannerProps) {
  const [registrations, setRegistrations] =
    React.useState<RegistrationItem[]>(initialRegistrations);
  const [search, setSearch] = React.useState("");
  const [cameraActive, setCameraActive] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [scanFeedback, setScanFeedback] = React.useState<{
    type: "success" | "error" | "idle";
    message: string;
    studentName?: string;
    department?: string | null;
    timestamp?: Date;
  }>({ type: "idle", message: "" });

  const lastScanTimestamp = React.useRef<number>(0);

  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  const totalRegistered = registrations.length;
  const attendedCount = registrations.filter((r) => !!r.attendedAt).length;
  const attendanceRate =
    totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 0;

  const filteredRegistrations = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter(
      (r) =>
        r.user.name.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q) ||
        (r.user.department && r.user.department.toLowerCase().includes(q))
    );
  }, [registrations, search]);

  const handleScan = React.useCallback(
    async (detectedCodes: { rawValue: string }[]) => {
      if (!detectedCodes || detectedCodes.length === 0) return;
      const rawValue = detectedCodes[0].rawValue?.trim();
      if (!rawValue) return;

      const now = Date.now();
      // Debounce scans within 1.8 seconds to avoid rapid duplicate triggers
      if (now - lastScanTimestamp.current < 1800) {
        return;
      }
      lastScanTimestamp.current = now;

      setIsProcessing(true);

      try {
        const res = await markAttendance(rawValue, eventId);
        if ("error" in res) {
          setScanFeedback({
            type: "error",
            message: res.error,
            timestamp: new Date(),
          });
          toast.error(res.error);
        } else {
          setScanFeedback({
            type: "success",
            message: "Check-in confirmed!",
            studentName: res.studentName,
            department: res.department,
            timestamp: new Date(),
          });
          toast.success(`Checked in: ${res.studentName}`);

          setRegistrations((prev) =>
            prev.map((r) =>
              r.id === rawValue ? { ...r, attendedAt: new Date() } : r
            )
          );
        }
      } catch (err) {
        console.error("Attendance scan error:", err);
        setScanFeedback({
          type: "error",
          message: "Failed to record attendance. Please try again.",
          timestamp: new Date(),
        });
        toast.error("Failed to record attendance.");
      } finally {
        setIsProcessing(false);
      }
    },
    [eventId]
  );

  const handleToggle = async (regId: string, currentAttended: boolean) => {
    const nextAttended = !currentAttended;

    // Optimistic update
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === regId
          ? { ...r, attendedAt: nextAttended ? new Date() : null }
          : r
      )
    );

    const res = await toggleAttendance(regId, eventId, nextAttended);
    if ("error" in res) {
      toast.error(res.error);
      // Revert optimistic update
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId
            ? { ...r, attendedAt: currentAttended ? new Date() : null }
            : r
        )
      );
    } else {
      toast.success(
        nextAttended ? "Student marked as attended" : "Attendance status cleared"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Event Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{eventCategory}</Badge>
              <Badge variant="success">Approved</Badge>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              {eventTitle}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {format(startDate, "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {venueName}
              </span>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 bg-slate-900 text-white flex flex-col justify-center">
          <CardContent className="py-5 px-6 space-y-3">
            <div className="flex items-center justify-between text-slate-300 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="h-4 w-4" /> Attendance Turnout
              </span>
              <span className="font-bold text-white text-sm">
                {attendanceRate}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {attendedCount}
              </span>
              <span className="text-slate-400 text-sm">
                / {totalRegistered} registered
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Scanner Left, Attendee List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Column */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-200 overflow-hidden shadow-xs">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4 text-slate-600" /> Camera Scanner
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Point camera at student&apos;s ticket QR code
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant={cameraActive ? "outline" : "default"}
                onClick={() => setCameraActive((prev) => !prev)}
                className="text-xs h-7"
              >
                {cameraActive ? "Pause" : "Resume"}
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[260px] aspect-square max-h-[340px] mx-auto border border-slate-800">
                {cameraActive ? (
                  <Scanner
                    onScan={handleScan}
                    onError={(err) => {
                      console.warn("Scanner warning/error:", err);
                    }}
                    scanDelay={1500}
                    allowMultiple={true}
                    classNames={{
                      container: "w-full h-full",
                      video: "w-full h-full object-cover",
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
                    <Camera className="h-10 w-10 text-slate-600" />
                    <p className="text-xs">Camera is paused.</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setCameraActive(true)}
                      className="mt-2 text-xs"
                    >
                      Turn On Camera
                    </Button>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs text-white text-xs font-medium">
                    Verifying pass...
                  </div>
                )}
              </div>

              {/* Scan Feedback Banner */}
              {scanFeedback.type === "success" && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertTitle className="text-sm font-semibold text-emerald-900">
                    {scanFeedback.message}
                  </AlertTitle>
                  <AlertDescription className="text-xs text-emerald-800 mt-1">
                    <span className="font-bold">{scanFeedback.studentName}</span>
                    {scanFeedback.department && (
                      <span className="text-emerald-700">
                        {" "}
                        • {scanFeedback.department}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {scanFeedback.type === "error" && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-semibold">
                    Scan Rejected
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    {scanFeedback.message}
                  </AlertDescription>
                </Alert>
              )}

              {scanFeedback.type === "idle" && (
                <div className="text-xs text-center text-muted-foreground py-2 border border-dashed rounded-lg bg-slate-50/50">
                  Ready to scan passes. Check-in window opens 1 hr before event.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance List Column */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-200 shadow-xs flex flex-col h-full">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Attendee Roster
                </CardTitle>
                <CardDescription className="text-xs">
                  Toggle manual attendance or search students
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="w-12 text-center">Status</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Check-in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg) => {
                      const isAttended = !!reg.attendedAt;
                      return (
                        <TableRow
                          key={reg.id}
                          className={
                            isAttended
                              ? "bg-emerald-50/30 hover:bg-emerald-50/50"
                              : ""
                          }
                        >
                          <TableCell className="text-center py-3">
                            <Checkbox
                              checked={isAttended}
                              onCheckedChange={() =>
                                handleToggle(reg.id, isAttended)
                              }
                              aria-label={`Mark ${reg.user.name} attended`}
                            />
                          </TableCell>
                          <TableCell className="py-3">
                            <p className="font-medium text-slate-900 text-sm">
                              {reg.user.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {reg.user.department || "General"}
                            </p>
                          </TableCell>
                          <TableCell className="text-slate-600 text-xs py-3">
                            {reg.user.email}
                          </TableCell>
                          <TableCell className="text-right text-xs py-3">
                            {reg.attendedAt ? (
                              <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                                <Check className="h-3 w-3" />
                                {format(new Date(reg.attendedAt), "h:mm a")}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">
                                Unchecked
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-32 text-center text-muted-foreground text-xs"
                      >
                        {search
                          ? "No attendees match your search query."
                          : "No students registered for this event yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
