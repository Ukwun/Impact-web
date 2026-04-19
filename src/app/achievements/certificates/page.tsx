'use client';

import Link from 'next/link';
import { ArrowLeft, Download, FileText } from 'lucide-react';

export default function CertificatesPage() {
  const certificates = [
    {
      id: 1,
      course: 'Introduction to Impact',
      issuedDate: '2026-03-15',
      certificateId: 'CERT-2026-001',
    },
    {
      id: 2,
      course: 'Sustainable Development Basics',
      issuedDate: '2026-02-20',
      certificateId: 'CERT-2026-002',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/achievements" className="text-primary-400 hover:text-primary-300">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white">Certificates</h1>
            <p className="text-gray-400 mt-1">Download your course completion certificates</p>
          </div>
        </div>

        <div className="space-y-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-dark-600 border border-dark-500 rounded-2xl p-8 hover:border-primary-500 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
                    <FileText className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{cert.course}</h3>
                    <p className="text-gray-400 text-sm">ID: {cert.certificateId}</p>
                    <p className="text-gray-400 text-sm">Issued: {cert.issuedDate}</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                  <Download size={20} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {certificates.length === 0 && (
          <div className="bg-dark-600 border border-dark-500 rounded-2xl p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
            <p className="text-gray-400">Complete a course to earn your first certificate</p>
          </div>
        )}
      </div>
    </div>
  );
}
