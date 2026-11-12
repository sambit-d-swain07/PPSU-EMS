import Link from "next/link";
import { format } from "date-fns";
import { Folder, type FolderColor } from "@/components/ui-theme/folder";
import { Polaroid } from "@/components/ui-theme/polaroid";
import { Sticker } from "@/components/ui-theme/sticker";
import { MapPin, Users, ArrowUpRight } from "lucide-react";

export interface EventCardData {
  id: string;
  title: string;
  description?: string;
  category: string;
  posterUrl?: string | null;
  startsAt: Date | string;
  capacity: number;
  venue: {
    name: string;
  };
  _count: {
    registrations: number;
  };
}

interface EventCardProps {
  event: EventCardData;
  index?: number;
}

const folderColors: FolderColor[] = ["paper", "ink", "yellow", "cream"];

export function EventCard({ event, index = 0 }: EventCardProps) {
  const seatsLeft = Math.max(0, event.capacity - event._count.registrations);
  const isSoldOut = seatsLeft === 0;
  const folderColor = folderColors[index % folderColors.length];
  const isInk = folderColor === "ink";

  const dateLabel = format(new Date(event.startsAt), "MMM d, yyyy").toUpperCase();
  const timeLabel = format(new Date(event.startsAt), "h:mm a");

  return (
    <Link
      href={`/student/events/${event.id}`}
      className="group block transition-transform duration-200 hover:-translate-y-1 hover-tilt"
    >
      <Folder
        tab={dateLabel}
        tabSide={index % 2 === 0 ? "left" : "right"}
        color={folderColor}
        className="h-full"
        contentClassName="flex flex-col h-full justify-between space-y-4"
      >
        <div className="space-y-4">
          {/* Polaroid Poster Image */}
          <div className="flex justify-center pt-1">
            <Polaroid
              src={event.posterUrl}
              alt={event.title}
              caption={event.category}
              rotate={index % 2 === 0 ? -1.5 : 1.5}
              tapeColor={index % 2 === 0 ? "blue" : "pink"}
              className="w-full max-w-[280px]"
              imageClassName="h-36 sm:h-40"
            />
          </div>

          {/* Event Information */}
          <div className="space-y-1.5 px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Sticker
                color={
                  event.category === "TECHNICAL"
                    ? "blue"
                    : event.category === "CULTURAL"
                    ? "pink"
                    : event.category === "SPORTS"
                    ? "mint"
                    : "yellow"
                }
              >
                {event.category}
              </Sticker>
              <span className={`text-[11px] font-mono ${isInk ? "text-slate-300" : "text-muted-ink"}`}>
                {timeLabel}
              </span>
            </div>

            <h3
              className={`font-sans font-bold text-lg sm:text-xl line-clamp-1 leading-snug tracking-tight ${
                isInk ? "text-white" : "text-ink"
              }`}
            >
              {event.title}
            </h3>

            {event.description && (
              <p
                className={`text-xs line-clamp-2 leading-relaxed ${
                  isInk ? "text-slate-300" : "text-muted-ink"
                }`}
              >
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer / Meta Row */}
        <div
          className={`pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs px-1 ${
            isInk ? "border-white/20" : "border-ink/20"
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Sticker color={isInk ? "paper" : "cream"}>
              <MapPin className="h-3 w-3 mr-0.5 inline" /> {event.venue.name}
            </Sticker>

            <Sticker color={isSoldOut ? "pink" : "mint"}>
              <Users className="h-3 w-3 mr-0.5 inline" />{" "}
              {isSoldOut ? "FULL" : `${seatsLeft} SEATS`}
            </Sticker>
          </div>

          <span
            className={`font-mono-label underline flex items-center gap-0.5 shrink-0 ${
              isInk
                ? "text-[#F6C945] group-hover:text-white"
                : "text-ink group-hover:text-[#2347D6]"
            }`}
          >
            VIEW EVENT <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </Folder>
    </Link>
  );
}
