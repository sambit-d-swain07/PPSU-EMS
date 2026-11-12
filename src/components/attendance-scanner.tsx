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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sticker } from "@/components/ui-theme/sticker";
import { Folder } from "@/components/ui-theme/folder";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className="h-64 sm:h-80 w-full rounded-[3px] bg-ink flex flex-col items-center justify-center text-paper/60 gap-2 border-2 border-ink">
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
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild className="font-mono text-xs">
          <Link href="/organizer">
            <ArrowLeft className="h-4 w-4 mr-1" /> BACK TO MY EVENTS
          </Link>
        </Button>
      </div>

      {/* Top Event Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Folder
          tabTitle="EVENT CHECK-IN"
          tabPosition="left"
          color="paper"
          className="md:col-span-2"
          contentClassName="p-4 sm:p-5"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sticker variant="cream">{eventCategory}</Sticker>
              <Sticker variant="approved">APPROVED</Sticker>
            </div>
            <h1 className="font-pixel text-2xl text-ink tracking-tight uppercase">
              {eventTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-ink pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(startDate, "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {venueName}
              </span>
            </div>
          </div>
        </Folder>

        <div className="bg-[#BFE5CF] border-2 border-ink rounded-[3px] p-5 shadow-hard flex flex-col justify-center rotate-0.5">
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-ink uppercase tracking-wider font-bold">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Attendance Turnout
              </span>
              <span className="font-pixel text-base">
                {attendanceRate}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-pixel text-4xl text-ink">
                {attendedCount}
              </span>
              <span className="font-mono text-xs text-ink/80">
                / {totalRegistered} registered
              </span>
            </div>
            <div className="w-full bg-paper border border-ink rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-ink h-full rounded-full transition-all duration-300"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scanner Left, Attendee List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-2 border-ink rounded-[3px] bg-paper shadow-hard overflow-hidden">
            <div className="p-4 border-b-2 border-ink bg-paper-cream flex flex-row items-center justify-between">
              <div>
                <h3 className="font-pixel text-sm flex items-center gap-2 uppercase tracking-tight text-ink">
                  <Camera className="h-4 w-4" /> Camera Scanner
                </h3>
                <p className="font-hand text-sm text-muted-ink">
                  point camera at student&apos;s ticket QR code
                </p>
              </div>
              <Button
                size="sm"
                variant={cameraActive ? "outline" : "yellow"}
                onClick={() => setCameraActive((prev) => !prev)}
                className="text-xs h-7"
              >
                {cameraActive ? "PAUSE" : "RESUME"}
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="relative rounded-[3px] overflow-hidden bg-black flex items-center justify-center min-h-[260px] aspect-square max-h-[340px] mx-auto border-2 border-ink shadow-hard-sm">
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
                    <p className="font-mono text-xs text-white">Camera is paused.</p>
                    <Button
                      size="sm"
                      variant="yellow"
                      onClick={() => setCameraActive(true)}
                      className="mt-2 text-xs"
                    >
                      Turn On Camera
                    </Button>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white font-mono text-xs font-bold uppercase tracking-wider">
                    Verifying pass...
                  </div>
                )}
              </div>

              {/* Scan Feedback Banner */}
              {scanFeedback.type === "success" && (
                <div className="border-2 border-ink bg-[#BFE5CF] p-3 rounded-[3px] shadow-hard-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-ink shrink-0" />
                    <p className="font-mono font-bold text-xs uppercase tracking-wider text-ink">
                      {scanFeedback.message}
                    </p>
                  </div>
                  <div className="font-mono text-xs text-ink/80 pl-6">
                    <span className="font-bold">{scanFeedback.studentName}</span>
                    {scanFeedback.department && (
                      <span> • {scanFeedback.department}</span>
                    )}
                  </div>
                </div>
              )}

              {scanFeedback.type === "error" && (
                <div className="border-2 border-ink bg-[#FDF2F4] p-3 rounded-[3px] shadow-hard-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-[#E8573A] shrink-0" />
                    <p className="font-mono font-bold text-xs uppercase tracking-wider text-[#E8573A]">
                      Scan Rejected
                    </p>
                  </div>
                  <p className="font-mono text-xs text-ink pl-6">
                    {scanFeedback.message}
                  </p>
                </div>
              )}

              {scanFeedback.type === "idle" && (
                <div className="font-mono text-xs text-center text-muted-ink py-2 border-2 border-dashed border-ink rounded-[3px] bg-paper-cream">
                  Ready to scan passes • Window opens 1 hr before start
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance List Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border-2 border-ink rounded-[3px] bg-paper shadow-hard flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b-2 border-ink bg-paper-cream flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-pixel text-base uppercase tracking-tight text-ink">
                  ATTENDEE ROSTER
                </h3>
                <p className="font-hand text-sm text-muted-ink">
                  toggle manual check-in or filter students
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-ink" />
                <Input
                  placeholder="Search name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-paper border-2 border-ink shadow-hard-sm"
                />
              </div>
            </div>

            <div className="p-0 flex-1 overflow-x-auto">
              <Table className="min-w-[480px]">
                <TableHeader>
                  <TableRow className="bg-paper-cream hover:bg-paper-cream">
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
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-ink bg-[#BFE5CF] border border-ink px-2 py-0.5 rounded-[2px] text-[10px]">
                                <Check className="h-3 w-3" />
                                {format(new Date(reg.attendedAt), "h:mm a")}
                              </span>
                            ) : (
                              <span className="font-mono text-muted-ink text-[11px]">
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
                        className="h-32 text-center font-mono text-muted-ink text-xs"
                      >
                        {search
                          ? "No attendees match your search query."
                          : "No students registered for this event yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
