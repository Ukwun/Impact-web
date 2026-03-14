import { Certificate } from "@prisma/client";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateCertificatePDF(certificate: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50,
      });

      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Background color
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');

      // Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .stroke('#1FA774');

      // Header
      doc.fillColor('#0B3C5D')
         .fontSize(36)
         .font('Helvetica-Bold')
         .text('IMPACT EDUCATION CERTIFICATE', 0, 80, {
           align: 'center',
           width: doc.page.width
         });

      // Subtitle
      doc.fillColor('#666')
         .fontSize(16)
         .font('Helvetica')
         .text('Certificate of Completion', 0, 130, {
           align: 'center',
           width: doc.page.width
         });

      // Main content
      doc.fillColor('#333')
         .fontSize(14)
         .font('Helvetica')
         .text('This is to certify that', 0, 200, {
           align: 'center',
           width: doc.page.width
         });

      // Student name
      doc.fillColor('#0B3C5D')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text(`${certificate.user.firstName} ${certificate.user.lastName}`, 0, 230, {
           align: 'center',
           width: doc.page.width
         });

      // Course completion text
      doc.fillColor('#333')
         .fontSize(14)
         .font('Helvetica')
         .text('has successfully completed the course', 0, 280, {
           align: 'center',
           width: doc.page.width
         });

      // Course name
      doc.fillColor('#1FA774')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text(`"${certificate.course.title}"`, 0, 310, {
           align: 'center',
           width: doc.page.width
         });

      // Issued date
      doc.fillColor('#666')
         .fontSize(12)
         .font('Helvetica')
         .text(`Issued on: ${certificate.issuedDate.toLocaleDateString('en-US', {
           year: 'numeric',
           month: 'long',
           day: 'numeric'
         })}`, 0, 360, {
           align: 'center',
           width: doc.page.width
         });

      // Certificate number
      doc.fillColor('#999')
         .fontSize(10)
         .font('Helvetica')
         .text(`Certificate ID: ${certificate.certificateNumber}`, 0, 420, {
           align: 'center',
           width: doc.page.width
         });

      // Instructor signature
      doc.fillColor('#333')
         .fontSize(12)
         .font('Helvetica')
         .text('Instructor:', 100, 480);

      doc.text(`${certificate.course.instructor}`, 100, 500);

      // QR Code placeholder (you can add actual QR code generation later)
      doc.rect(doc.page.width - 150, 450, 100, 100)
         .stroke('#ccc');

      doc.fillColor('#999')
         .fontSize(8)
         .text('Scan to verify', doc.page.width - 140, 560);

      // Footer
      doc.fillColor('#666')
         .fontSize(10)
         .font('Helvetica')
         .text('ImpactEdu - Learning. Building. Leading.', 0, doc.page.height - 80, {
           align: 'center',
           width: doc.page.width
         });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}