import * as React from "react";
import { Heading, Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./layout";
import { format } from "date-fns";

interface EventSubmittedEmailProps {
  eventTitle: string;
  organizerName: string;
  category: string;
  venueName: string;
  startsAt: Date | string;
  approvalUrl: string;
}

export function EventSubmittedEmail({
  eventTitle,
  organizerName,
  category,
  venueName,
  startsAt,
  approvalUrl,
}: EventSubmittedEmailProps) {
  const formattedDate = format(
    new Date(startsAt),
    "EEEE, MMMM d, yyyy 'at' h:mm a"
  );

  return (
    <EmailLayout previewText={`New event pending review: ${eventTitle}`}>
      <Heading style={heading}>New Event Submitted for Review 📋</Heading>
      <Text style={paragraph}>Hello Faculty & Administration,</Text>
      <Text style={paragraph}>
        A new campus event proposal has been submitted and is currently awaiting
        your review and approval:
      </Text>

      <Section style={card}>
        <Text style={cardItem}>
          📌 <strong>Event:</strong> {eventTitle}
        </Text>
        <Text style={cardItem}>
          👤 <strong>Organizer:</strong> {organizerName}
        </Text>
        <Text style={cardItem}>
          🏷️ <strong>Category:</strong> {category}
        </Text>
        <Text style={cardItem}>
          📍 <strong>Proposed Venue:</strong> {venueName}
        </Text>
        <Text style={cardItem}>
          📅 <strong>Scheduled Date:</strong> {formattedDate}
        </Text>
      </Section>

      <Text style={paragraph}>
        Please inspect the schedule and venue capacity to approve or provide
        rejection feedback.
      </Text>

      <Section style={buttonContainer}>
        <Button style={primaryButton} href={approvalUrl}>
          Review Event
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

