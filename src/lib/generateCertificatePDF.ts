import { jsPDF } from "jspdf";

interface CertificateData {
  recipientName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  credentialId: string;
}

export function generateCertificatePDF(data: CertificateData): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background gradient effect (simulated with rectangles)
  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Border
  doc.setDrawColor(154, 52, 18); // Primary color
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  // Inner border
  doc.setLineWidth(0.5);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Header decoration
  doc.setFillColor(154, 52, 18);
  doc.rect(pageWidth / 2 - 40, 20, 80, 3, "F");

  // "Certificate of Completion" text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(107, 114, 128);
  doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 40, { align: "center" });

  // Award icon (simplified)
  doc.setFontSize(40);
  doc.setTextColor(154, 52, 18);
  doc.text("★", pageWidth / 2, 60, { align: "center" });

  // "This is to certify that"
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text("This is to certify that", pageWidth / 2, 80, { align: "center" });

  // Recipient name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(17, 24, 39);
  doc.text(data.recipientName, pageWidth / 2, 95, { align: "center" });

  // Underline for name
  const nameWidth = doc.getTextWidth(data.recipientName);
  doc.setDrawColor(154, 52, 18);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - nameWidth / 2, 98, pageWidth / 2 + nameWidth / 2, 98);

  // "has successfully completed"
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text("has successfully completed the course", pageWidth / 2, 115, { align: "center" });

  // Course name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(154, 52, 18);
  doc.text(data.courseName, pageWidth / 2, 130, { align: "center" });

  // Instructor
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128);
  doc.text(`Instructor: ${data.instructorName}`, pageWidth / 2, 145, { align: "center" });

  // Date
  doc.text(`Completed on: ${data.completionDate}`, pageWidth / 2, 155, { align: "center" });

  // Footer decoration
  doc.setFillColor(154, 52, 18);
  doc.rect(pageWidth / 2 - 40, pageHeight - 35, 80, 3, "F");

  // Credential ID
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text(`Credential ID: ${data.credentialId}`, pageWidth / 2, pageHeight - 25, { align: "center" });

  // Platform name
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text("LearnHub", pageWidth / 2, pageHeight - 18, { align: "center" });

  // Download
  doc.save(`certificate-${data.credentialId}.pdf`);
}

export function shareCertificate(credentialId: string): void {
  const shareUrl = `${window.location.origin}/verify-certificate/${credentialId}`;
  
  if (navigator.share) {
    navigator.share({
      title: "My LearnHub Certificate",
      text: "I just earned a certificate on LearnHub!",
      url: shareUrl,
    }).catch(() => {
      // Fallback to clipboard
      copyToClipboard(shareUrl);
    });
  } else {
    copyToClipboard(shareUrl);
  }
}

function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).then(() => {
    // Toast will be shown by the calling component
  });
}
