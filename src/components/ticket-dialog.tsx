"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { Ticket, Calendar, MapPin, User, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TicketDialogProps {
  registrationId: string;
  eventTitle: string;
  startsAt: Date | string;
  venueName: string;
  studentName: string;
  attendedAt?: Date | string | null;
}

export function TicketDialog({
  registrationId,
  eventTitle,
  startsAt,
  venueName,
  studentName,
  attendedAt,
}: TicketDialogProps) {
  const [open, setOpen] = React.useState(false);
  const formattedDate = format(new Date(startsAt), "EEEE, MMMM d, yyyy");
  const formattedTime = format(new Date(startsAt), "h:mm a");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs font-medium">
          <Ticket className="h-3.5 w-3.5" />
          View Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border border-slate-200">
        <DialogHeader className="p-6 bg-slate-900 text-white relative">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              PPSU Campus Event Pass
            </span>
            {attendedAt ? (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3" /> Attended
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-[11px]">
                Valid Entry
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white line-clamp-2">
            {eventTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300 mt-1">
            Show this QR code at the venue check-in desk.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 flex flex-col items-center space-y-6">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <QRCodeSVG
              value={registrationId}
              size={210}
              level="H"
              includeMargin
              className="rounded"
            />
            <p className="text-[10px] font-mono text-muted-foreground mt-2 tracking-wider">
              ID: {registrationId}
            </p>
          </div>

          <div className="w-full space-y-2.5 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-700">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900">{studentName}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                {formattedDate} • <span className="font-medium text-slate-900">{formattedTime}</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-900">{venueName}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
