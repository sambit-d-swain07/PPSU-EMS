import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { Certificate } from "@/components/certificate";
import * as React from "react";

export const runtime = "nodejs";

interface CertificateRouteProps {
  params: Promise<{ registrationId: string }>;
}

export async function GET(req: NextRequest, { params }: CertificateRouteProps) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { registrationId } = await params;

  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      user: { select: { id: true, name: true } },
      event: {
        include: {
          venue: { select: { name: true } },
          organizer: { select: { name: true } },
        },
      },
    },
  });

  if (!reg) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  // Check ownership
  const isOwner = reg.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: "Forbidden. You can only download your own certificate." },
      { status: 403 }
    );
  }

  // Check attendance
  if (!reg.attendedAt) {
    return NextResponse.json(
      { error: "Certificate is only available for attendees who checked in." },
      { status: 403 }
    );
  }

  // Check if event has ended
  if (new Date(reg.event.endsAt) > new Date()) {
    return NextResponse.json(
      {
        error:
          "Certificate will become available after the event has concluded.",
      },
      { status: 403 }
    );
  }

  try {
    const pdfBuffer = await renderToBuffer(
      React.createElement(Certificate, {
        studentName: reg.user.name,
        eventTitle: reg.event.title,
        startsAt: reg.event.startsAt,
        venueName: reg.event.venue.name,
        organizerName: reg.event.organizer.name,
        registrationId: reg.id,
      }) as unknown as React.ReactElement<DocumentProps>
    );

    const safeTitle = reg.event.title
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificate-${safeTitle}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Certificate generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate certificate PDF." },
      { status: 500 }
    );
  }
}
