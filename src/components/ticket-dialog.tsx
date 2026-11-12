"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { Ticket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/ui-theme/sticker";

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
  const formattedDate = format(new Date(startsAt), "EEE, MMM d, yyyy");
  const formattedTime = format(new Date(startsAt), "h:mm a");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="yellow" className="h-8 gap-1.5 text-xs font-mono-label">
          <Ticket className="h-3.5 w-3.5" />
          VIEW TICKET
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-2 border-ink shadow-hard-lg rounded-[3px]">
        {/* Ticket Header */}
        <div className="p-5 bg-[#F6C945] border-b-2 border-ink text-ink space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-pixel text-xs tracking-wider">
              ★ PPSU EVENT PASS ★
            </span>
            {attendedAt ? (
              <Sticker color="mint">CHECKED IN ✓</Sticker>
            ) : (
              <Sticker color="paper">VALID TICKET</Sticker>
            )}
          </div>
          <DialogTitle className="font-pixel text-xl sm:text-2xl font-bold text-ink leading-tight">
            {eventTitle}
          </DialogTitle>
          <DialogDescription className="font-hand text-sm text-ink/80">
            Present this ticket pass to entry volunteers at the door.
          </DialogDescription>
        </div>

        {/* Perforation Line with Stub Cutouts */}
        <div className="relative py-1 bg-white">
          <div className="border-b-2 border-dashed border-ink w-full" />
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-paper border-r-2 border-ink" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-paper border-l-2 border-ink" />
        </div>

        {/* QR Code & Stub Body */}
        <div className="p-5 bg-white space-y-4">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-white border-2 border-ink shadow-hard-sm rounded-[3px]">
              <QRCodeSVG
                value={registrationId}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="font-mono text-[10px] text-muted-ink uppercase tracking-wider">
              PASS ID: {registrationId}
            </p>
          </div>

          {/* Ticket Information Rows */}
          <div className="bg-[#EFE6D2]/60 p-3 rounded-[3px] border-2 border-ink font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-muted-ink">ATTENDEE</span>
              <span className="font-bold text-ink">{studentName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-muted-ink">SCHEDULE</span>
              <span className="font-bold text-ink">{formattedDate} • {formattedTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-muted-ink">VENUE</span>
              <span className="font-bold text-ink">{venueName}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
