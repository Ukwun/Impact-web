'use client';

import { useState } from 'react';
import { Award, Download, Share2, Calendar, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function CertificatesPage() {
  const [selectedCertificate, setSelectedCertificate] = useState<number | null>(null);
  const { success, error: errorToast } = useToast();

  const certificates = [
    {
      id: 1,
      courseName: 'Financial Literacy Masterclass',
      issueDate: '2026-02-15',
      certificateNumber: 'CERT-2026-001234',
      instructor: 'Adeyemi Johnson',
      score: 92,
      courseHours: 40,
    },
    {
      id: 2,
      courseName: 'Digital Skills Bootcamp',
      issueDate: '2026-01-20',
      certificateNumber: 'CERT-2026-001100',
      instructor: 'Grace Adekunle',
      score: 88,
      courseHours: 30,
    },
    {
      id: 3,
      courseName: 'Leadership & Management Fundamentals',
      issueDate: '2025-12-10',
      certificateNumber: 'CERT-2025-000999',
      instructor: 'David Okonkwo',
      score: 95,
      courseHours: 25,
    },
  ];

  const selectedCert = certificates.find((c) => c.id === selectedCertificate);

  const handleDownload = (certId: number) => {
    const cert = certificates.find((c) => c.id === certId);
    if (!cert) return;

    const html = `
      <html>
        <head>
          <title>${cert.courseName} Certificate</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            .card { border: 4px solid #d6b24c; border-radius: 16px; padding: 32px; }
            .title { font-size: 28px; font-weight: bold; margin-bottom: 12px; }
            .meta { margin-top: 20px; line-height: 1.7; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">Certificate of Completion</div>
            <p>This certifies successful completion of:</p>
            <h2>${cert.courseName}</h2>
            <div class="meta">
              <div>Instructor: ${cert.instructor}</div>
              <div>Issued: ${new Date(cert.issueDate).toDateString()}</div>
              <div>Certificate No: ${cert.certificateNumber}</div>
              <div>Score: ${cert.score}%</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) {
      errorToast('Download blocked', 'Please allow popups to print your certificate.');
      return;
    }

    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
    success('Certificate ready', 'Print dialog opened for download as PDF.');
  };

  const handleShare = async (certId: number, network?: 'linkedin' | 'twitter') => {
    const cert = certificates.find((c) => c.id === certId);
    if (!cert) return;

    const shareText = `I earned a certificate in ${cert.courseName} on ImpactEdu.`;
    const shareUrl = window.location.href;

    if (network === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
      return;
    }

    if (network === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({ title: cert.courseName, text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        success('Copied', 'Share text copied to clipboard.');
      }
    } catch (err) {
      errorToast('Share failed', 'Unable to share this certificate right now.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">My Certificates</h1>
        <p className="text-gray-400">Showcase your achievements and skills</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 border border-primary-500">
          <div className="flex items-center gap-3">
            <Trophy size={32} className="text-white/70" />
            <div>
              <p className="text-primary-200 text-sm font-semibold">Certificates Earned</p>
              <p className="text-4xl font-black text-white">{certificates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-lg p-6 border border-secondary-500">
          <div className="flex items-center gap-3">
            <Award size={32} className="text-white/70" />
            <div>
              <p className="text-secondary-200 text-sm font-semibold">Learning Hours</p>
              <p className="text-4xl font-black text-white">
                {certificates.reduce((acc, c) => acc + c.courseHours, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 border border-blue-500">
          <div className="flex items-center gap-3">
            <Calendar size={32} className="text-white/70" />
            <div>
              <p className="text-blue-200 text-sm font-semibold">Avg Score</p>
              <p className="text-4xl font-black text-white">
                {Math.round(certificates.reduce((acc, c) => acc + c.score, 0) / certificates.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-white">Your Achievements</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="group relative bg-gradient-to-br from-dark-500 to-dark-600 rounded-xl overflow-hidden border border-dark-400 hover:border-primary-500 transition-all cursor-pointer hover:shadow-xl hover:shadow-primary-600/20"
              onClick={() => setSelectedCertificate(cert.id)}
            >
              {/* Certificate Preview */}
              <div className="aspect-[4/5] bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 p-6 flex flex-col justify-between relative overflow-hidden">
                {/* Brand Mark */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-30"></div>

                {/* Content */}
                <div className="relative z-10 space-y-4">
                  <div className="text-4xl">🏆</div>
                  <div>
                    <p className="text-amber-700 text-xs font-bold uppercase tracking-wider">Certificate of Completion</p>
                    <h3 className="text-amber-900 text-lg font-black line-clamp-2 mt-2">
                      {cert.courseName}
                    </h3>
                  </div>
                </div>

                <div className="relative z-10 space-y-3 border-t border-amber-200 pt-4">
                  <div>
                    <p className="text-amber-700 text-xs font-semibold">Instructor</p>
                    <p className="text-amber-900 font-bold">{cert.instructor}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-amber-700 text-xs font-semibold">Issued</p>
                      <p className="text-amber-900 font-bold text-sm">
                        {new Date(cert.issueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-700 text-xs font-semibold">Score</p>
                      <p className="text-amber-900 font-black text-lg">{cert.score}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <div className="w-full space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(cert.id);
                    }}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(cert.id);
                    }}
                    className="w-full px-4 py-2 bg-dark-600 text-white rounded-lg font-bold hover:bg-dark-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Detail Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-600 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-dark-400">
            {/* Close Button */}
            <div className="sticky top-0 flex justify-end p-4 bg-dark-600 border-b border-dark-400">
              <button
                onClick={() => setSelectedCertificate(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Certificate Display */}
            <div className="p-8">
              <div className="bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 rounded-xl p-12 space-y-8 border-4 border-amber-200 relative">
                {/* Decorative Elements */}
                <div className="absolute top-6 left-6 w-12 h-12 border-2 border-amber-400 rounded-full opacity-50"></div>
                <div className="absolute top-6 right-6 w-12 h-12 border-2 border-amber-400 rounded-full opacity-50"></div>
                <div className="absolute bottom-6 left-6 w-12 h-12 border-2 border-amber-400 rounded-full opacity-50"></div>
                <div className="absolute bottom-6 right-6 w-12 h-12 border-2 border-amber-400 rounded-full opacity-50"></div>

                {/* Content */}
                <div className="relative text-center space-y-6">
                  <div className="text-6xl">🏆</div>

                  <div className="space-y-2">
                    <p className="text-amber-700 text-sm font-bold tracking-widest uppercase">Certificate of Completion</p>
                    <p className="text-amber-700 text-xs italic">This is to certify that</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-amber-900 text-3xl font-black">You</p>
                    <div className="border-b-2 border-amber-700 mx-12"></div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-amber-700 text-sm">has successfully completed the course</p>
                    <p className="text-amber-900 text-2xl font-bold">
                      {certificates.find((c) => c.id === selectedCertificate)?.courseName}
                    </p>
                  </div>

                  <div className="space-y-4 pt-6 border-t-2 border-amber-700">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-amber-700 text-xs font-semibold">Instructor</p>
                        <p className="text-amber-900 font-bold">
                          {certificates.find((c) => c.id === selectedCertificate)?.instructor}
                        </p>
                      </div>
                      <div>
                        <p className="text-amber-700 text-xs font-semibold">Date Issued</p>
                        <p className="text-amber-900 font-bold">
                          {new Date(
                            certificates.find((c) => c.id === selectedCertificate)?.issueDate || ''
                          ).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-amber-700 text-xs font-semibold">Certificate No.</p>
                        <p className="text-amber-900 font-bold text-xs">
                          {certificates.find((c) => c.id === selectedCertificate)?.certificateNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-center gap-16">
                      <div className="text-center">
                        <div className="border-t border-amber-700 w-24 mb-2"></div>
                        <p className="text-amber-700 text-xs font-semibold">Signature</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => selectedCert && handleDownload(selectedCert.id)}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download as PDF
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => selectedCert && handleShare(selectedCert.id, 'linkedin')}
                    className="px-6 py-3 bg-dark-500 text-white rounded-lg font-bold hover:bg-dark-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 size={18} />
                    Share to LinkedIn
                  </button>
                  <button
                    onClick={() => selectedCert && handleShare(selectedCert.id, 'twitter')}
                    className="px-6 py-3 bg-dark-500 text-white rounded-lg font-bold hover:bg-dark-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 size={18} />
                    Share to Twitter
                  </button>
                </div>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="w-full px-6 py-3 bg-dark-500 text-white rounded-lg font-bold hover:bg-dark-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
