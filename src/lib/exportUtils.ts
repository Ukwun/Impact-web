/**
 * Export Utilities - CSV and JSON export functionality
 */

export interface ExportOptions {
  filename: string;
  format: 'csv' | 'json' | 'pdf';
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(data: T[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const headerRow = headers.map(h => `"${h}"`).join(',');

  const rows = data.map(row =>
    headers
      .map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return `"${value}"`;
      })
      .join(',')
  );

  return [headerRow, ...rows].join('\n');
}

/**
 * Export data as CSV file
 */
export function exportAsCSV<T extends Record<string, any>>(
  data: T[],
  filename: string
): void {
  const csv = arrayToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${filename}.csv`);
}

/**
 * Export data as JSON file
 */
export function exportAsJSON<T>(data: T, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  downloadFile(blob, `${filename}.json`);
}

/**
 * Generic file download helper
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format and export report data
 */
export interface ReportData {
  title: string;
  description?: string;
  generatedAt: string;
  data: Record<string, any>[];
  metadata?: Record<string, any>;
}

export function exportReport(report: ReportData, format: 'csv' | 'json' = 'csv'): void {
  const filename = `${report.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    exportAsCSV(report.data, filename);
  } else {
    exportAsJSON(report, filename);
  }
}

/**
 * Generate printable HTML for reports
 */
export function generatePrintableHTML(
  title: string,
  content: string,
  metadata?: Record<string, string>
): string {
  const metadataHtml = metadata
    ? `<div style="margin-bottom: 20px; font-size: 12px; color: #666;">
        ${Object.entries(metadata)
          .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
          .join('')}
       </div>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
          }
          h1 { color: #333; margin-bottom: 10px; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; }
            table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${metadataHtml}
        <div id="content">${content}</div>
      </body>
    </html>
  `;
}

/**
 * Print content via browser print dialog
 */
export function printContent(title: string, content: string): void {
  const html = generatePrintableHTML(title, content, {
    'Generated': new Date().toLocaleString(),
  });

  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
