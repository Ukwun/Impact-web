import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';
import { authenticateUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return new NextResponse('Missing id', { status: 400 });

    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = authResult.user.id;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { course: true, user: true },
    });
    if (!payment || payment.userId !== userId) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Generate PDF
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {});

    doc.fontSize(20).text('Payment Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Receipt ID: ${payment.id}`);
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleString()}`);
    doc.text(`Student: ${payment.user?.firstName} ${payment.user?.lastName} (${payment.user?.email})`);
    doc.text(`Course: ${payment.course?.title || '-'}`);
    doc.text(`Amount: ${payment.amount} ${payment.currency}`);
    doc.text(`Status: ${payment.status}`);
    doc.text(`Gateway: ${payment.gateway || '-'}`);
    doc.text(`Transaction Ref: ${payment.flutterWaveRef || payment.stripeRef || payment.paypalRef || '-'}`);
    doc.moveDown();
    doc.text('Thank you for your payment!', { align: 'center' });
    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const bufs: Buffer[] = [];
      doc.on('data', (d) => bufs.push(d));
      doc.on('end', () => resolve(Buffer.concat(bufs)));
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=receipt-${payment.id}.pdf`,
      },
    });
  } catch (e) {
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
