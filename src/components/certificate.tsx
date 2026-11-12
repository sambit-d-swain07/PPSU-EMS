import * as React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

export interface CertificateProps {
  studentName: string;
  eventTitle: string;
  startsAt: Date | string;
  venueName: string;
  organizerName: string;
  registrationId: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
  },
  outerBorder: {
    borderWidth: 3,
    borderColor: "#0f2347",
    height: "100%",
    padding: 6,
  },
  innerBorder: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    height: "100%",
    padding: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSection: {
    alignItems: "center",
    marginTop: 8,
  },
  institutionName: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    color: "#475569",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  portalName: {
    fontSize: 10,
    color: "#64748b",
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  certificateTitle: {
    fontSize: 26,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#0f2347",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  titleDivider: {
    width: 120,
    borderBottomWidth: 2,
    borderColor: "#f59e0b",
    marginTop: 6,
    marginBottom: 12,
  },
  bodySection: {
    alignItems: "center",
    marginVertical: 12,
    width: "100%",
  },
  certifyText: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 8,
    fontFamily: "Helvetica-Oblique",
  },
  studentName: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#0f2347",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  participationText: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  eventDetails: {
    fontSize: 11,
    color: "#64748b",
  },
  footerSection: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  signatureBlock: {
    alignItems: "center",
    width: 180,
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#94a3b8",
    marginBottom: 4,
  },
  signatoryName: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  signatoryTitle: {
    fontSize: 9,
    color: "#64748b",
  },
  bottomIdSection: {
    alignItems: "center",
    marginTop: 8,
  },
  certId: {
    fontSize: 8,
    color: "#94a3b8",
    fontFamily: "Helvetica",
    letterSpacing: 0.5,
  },
});

export function Certificate({
  studentName,
  eventTitle,
  startsAt,
  venueName,
  organizerName,
  registrationId,
}: CertificateProps) {
  const formattedDate = format(new Date(startsAt), "MMMM d, yyyy");

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.institutionName}>
                P. P. Savani University
              </Text>
              <Text style={styles.portalName}>
                Campus Event Management System
              </Text>
              <Text style={styles.certificateTitle}>
                Certificate of Participation
              </Text>
              <View style={styles.titleDivider} />
            </View>

            {/* Body */}
            <View style={styles.bodySection}>
              <Text style={styles.certifyText}>This is to certify that</Text>
              <Text style={styles.studentName}>{studentName}</Text>
              <Text style={styles.participationText}>
                has actively participated and successfully completed the campus
                event
              </Text>
              <Text style={styles.eventTitle}>&quot;{eventTitle}&quot;</Text>
              <Text style={styles.eventDetails}>
                conducted on {formattedDate} at {venueName}.
              </Text>
            </View>

            {/* Footer with Signatures */}
            <View style={styles.footerSection}>
              <View style={styles.signatureBlock}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatoryName}>{organizerName}</Text>
                <Text style={styles.signatoryTitle}>Event Organizer</Text>
              </View>

              <View style={styles.signatureBlock}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatoryName}>Dean / Campus Director</Text>
                <Text style={styles.signatoryTitle}>Student Affairs & Events</Text>
              </View>
            </View>

            {/* Bottom ID */}
            <View style={styles.bottomIdSection}>
              <Text style={styles.certId}>
                Certificate ID: {registrationId} • Verified by PPSU Campus Portal
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

