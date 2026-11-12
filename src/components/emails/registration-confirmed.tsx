import * as React from "react";
import { Heading, Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./layout";
import { format } from "date-fns";

interface RegistrationConfirmedEmailProps {
  studentName: string;
  eventTitle: string;
  startsAt: Date | string;
  venueName: string;
  ticketUrl: string;
}

export function RegistrationConfirmedEmail({
  studentName,
  eventTitle,
  startsAt,
  venueName,
  ticketUrl,
}: RegistrationConfirmedEmailProps) {
  const formattedDate = format(
    new Date(startsAt),
    "EEEE, MMMM d, yyyy 'at' h:mm a"
  );

  return (
    <EmailLayout previewText={`Registration confirmed for ${eventTitle}`}>
      <Heading style={heading}>Booking Confirmed! 🎉</Heading>
      <Text style={paragraph}>Hello {studentName},</Text>
      <Text style={paragraph}>
        Your seat for <strong>{eventTitle}</strong> has been secured. Below are
        the event schedule and venue details:
      </Text>

      <Section style={card}>
        <Text style={cardItem}>
          📅 <strong>Date & Time:</strong> {formattedDate}
        </Text>
        <Text style={cardItem}>
          📍 <strong>Venue:</strong> {venueName}
        </Text>
      </Section>

      <Text style={paragraph}>
        Please present your digital QR ticket at the venue check-in desk on the
        day of the event.
      </Text>

      <Section style={buttonContainer}>
        <Button style={primaryButton} href={ticketUrl}>
          View QR Ticket
        </Button>
      </Section>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "20px",
  fontWeight: "700" as const,
  color: "#0f172a",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#334155",
  margin: "0 0 14px",
};

const card = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px",
  margin: "18px 0",
};

const cardItem = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#1e293b",
  margin: "4px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0 12px",
};

const primaryButton = {
  backgroundColor: "#0f172a",
  color: "#ffffff",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "600" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
};

