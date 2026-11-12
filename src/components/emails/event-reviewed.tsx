import * as React from "react";
import { Heading, Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./layout";

interface EventReviewedEmailProps {
  organizerName: string;
  eventTitle: string;
  status: "APPROVED" | "REJECTED";
  remark?: string | null;
  dashboardUrl: string;
}

export function EventReviewedEmail({
  organizerName,
  eventTitle,
  status,
  remark,
  dashboardUrl,
}: EventReviewedEmailProps) {
  const isApproved = status === "APPROVED";
  const preview = isApproved
    ? `Your event "${eventTitle}" has been approved!`
    : `Update on your event submission "${eventTitle}"`;

  return (
    <EmailLayout previewText={preview}>
      <Heading style={heading}>
        {isApproved ? "Event Approved! ✅" : "Event Needs Revision ⚠️"}
      </Heading>
      <Text style={paragraph}>Hello {organizerName},</Text>
      <Text style={paragraph}>
        Your event proposal <strong>&quot;{eventTitle}&quot;</strong> has been
        reviewed by campus administration.
      </Text>

      <Section style={isApproved ? approvedCard : rejectedCard}>
        <Text style={isApproved ? statusTextApproved : statusTextRejected}>
          Status: {isApproved ? "APPROVED" : "REJECTED"}
        </Text>
        {remark && (
          <Text style={remarkText}>
            <strong>Reviewer feedback:</strong> &quot;{remark}&quot;
          </Text>
        )}
      </Section>

      <Text style={paragraph}>
        {isApproved
          ? "Your event is now live in the student catalog. Registered students can now book seats and obtain entry tickets."
          : "You can update the event details and re-submit it for approval through your organizer dashboard."}
      </Text>

      <Section style={buttonContainer}>
        <Button style={primaryButton} href={dashboardUrl}>
          Go to Organizer Portal
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

const approvedCard = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "8px",
  padding: "16px",
  margin: "18px 0",
};

const rejectedCard = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "16px",
  margin: "18px 0",
};

const statusTextApproved = {
  fontSize: "13px",
  fontWeight: "700" as const,
  color: "#166534",
  margin: "0",
};

const statusTextRejected = {
  fontSize: "13px",
  fontWeight: "700" as const,
  color: "#991b1b",
  margin: "0",
};

const remarkText = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#334155",
  marginTop: "8px",
  marginBottom: "0",
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

