import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Users } from "lucide-react";

export interface EventCardData {
  id: string;
  title: string;
  category: string;
  posterUrl?: string | null;
  startsAt: Date;
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
}

export function EventCard({ event }: EventCardProps) {
  const seatsLeft = Math.max(0, event.capacity - event._count.registrations);
  const isSoldOut = seatsLeft === 0;

  return (
    <Link
      href={`/student/events/${event.id}`}
      className="group block transition-transform duration-200 hover:-translate-y-0.5"
    >
      <Card className="h-full flex flex-col overflow-hidden border-slate-200 bg-white shadow-2xs hover:shadow-md transition-shadow">
        {/* Poster Image / Fallback Header */}
        <div className="relative w-full h-44 bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100">
          {event.posterUrl ? (
            <Image
              src={event.posterUrl}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
              <span className="text-2xl font-black tracking-widest text-white/20 select-none">
                CAMPUS
              </span>
              <span className="text-xs uppercase font-medium tracking-wider text-slate-300 mt-1">
                {event.category}
              </span>
            </div>
          )}

          <div className="absolute top-2.5 left-2.5">
            <Badge variant="secondary" className="shadow-xs bg-white/95 text-slate-800 backdrop-blur-xs">
              {event.category}
            </Badge>
          </div>

          <div className="absolute top-2.5 right-2.5">
            {isSoldOut ? (
              <Badge variant="destructive" className="shadow-xs">
                Full
              </Badge>
            ) : seatsLeft <= 10 ? (
              <Badge variant="warning" className="shadow-xs bg-amber-500 text-white">
                Only {seatsLeft} left
              </Badge>
            ) : (
              <Badge variant="success" className="shadow-xs">
                {seatsLeft} seats left
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {event.title}
            </h3>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{format(new Date(event.startsAt), "EEE, MMM d, yyyy • h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{event.venue.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>
                {event._count.registrations} / {event.capacity} registered
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

