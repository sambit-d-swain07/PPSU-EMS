import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from "@react-email/components";

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={brandBadge}>PPSU CAMPUS</Text>
            <Text style={brandTitle}>Event Management System</Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              P. P. Savani University • Campus Event Management Portal
            </Text>
            <Text style={footerSubtext}>
              This is an automated notification. Please do not reply directly to
              this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  maxWidth: "560px",
};

const header = {
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "16px",
  marginBottom: "24px",
};

const brandBadge = {
  fontSize: "10px",
  fontWeight: "700" as const,
  letterSpacing: "1.5px",
  color: "#64748b",
  margin: "0 0 4px",
};

const brandTitle = {
  fontSize: "18px",
  fontWeight: "700" as const,
  color: "#0f172a",
  margin: "0",
};

const content = {
  margin: "0",
};

const hr = {
  borderColor: "#f1f5f9",
  margin: "28px 0 16px",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 4px",
};

const footerSubtext = {
  fontSize: "11px",
  color: "#94a3b8",
  margin: "0",
};
