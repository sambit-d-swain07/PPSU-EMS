import * as React from "react";
import { Heading, Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./layout";
import { format } from "date-fns";

interface EventReminderEmailProps {
  studentName: string;
  eventTitle: string;
  startsAt: Date | string;
  venueName: string;
  ticketUrl: string;
}

export function EventReminderEmail({
  studentName,
  eventTitle,
  startsAt,
  venueName,
  ticketUrl,
}: EventReminderEmailProps) {
  const formattedDate = format(
    new Date(startsAt),
    "EEEE, MMMM d, yyyy 'at' h:mm a"
  );

  return (
    <EmailLayout previewText={`Reminder: ${eventTitle} is tomorrow!`}>
      <Heading style={heading}>Upcoming Event Reminder ⏰</Heading>
      <Text style={paragraph}>Hello {studentName},</Text>
      <Text style={paragraph}>
        This is a friendly reminder that <strong>{eventTitle}</strong> is taking
        place tomorrow! Make sure to arrive on time.
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
        Remember to keep your digital QR pass ready on your phone when arriving
        at the venue.
      </Text>

      <Section style={buttonContainer}>
        <Button style={primaryButton} href={ticketUrl}>
          Access Your Ticket
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
