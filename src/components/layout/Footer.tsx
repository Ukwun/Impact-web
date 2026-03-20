"use client";

import { Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700 text-gray-300 py-16">
      <div className="container mx-auto px-6">
        {/* Brand & Tagline */}
        <div className="mb-12 pb-12 border-b border-dark-700">
          <div className="max-w-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black text-xl mb-4">
              IE
            </div>
            <p className="text-lg text-gray-200 leading-relaxed max-w-lg mb-6">
              Building Africa's future through financial intelligence, enterprise development, and investment participation.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-700 hover:bg-primary-500 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-700 hover:bg-secondary-500 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-700 hover:bg-primary-500 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-700 hover:bg-secondary-500 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Ecosystem */}
          <div>
            <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide">Ecosystem</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/impactschools" className="hover:text-primary-400 transition-colors">ImpactSchool</Link></li>
              <li><Link href="/impactuni" className="hover:text-primary-400 transition-colors">ImpactUni</Link></li>
              <li><Link href="/impactcircle" className="hover:text-primary-400 transition-colors">ImpactCircle</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</Link></li>
              <li><Link href="/programmes" className="hover:text-primary-400 transition-colors">Our Ecosystem</Link></li>
            </ul>
          </div>

          {/* Programmes & Pathways */}
          <div>
            <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide">Programmes</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/impactschools" className="hover:text-primary-400 transition-colors">For Students</Link></li>
              <li><Link href="/impactuni" className="hover:text-primary-400 transition-colors">For Builders</Link></li>
              <li><Link href="/impactcircle" className="hover:text-primary-400 transition-colors">For Entrepreneurs</Link></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Certifications</a></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Learning Experience</a></li>
            </ul>
          </div>

          {/* Opportunities */}
          <div>
            <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide">Opportunities</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/join-impact-club" className="hover:text-primary-400 transition-colors">Join Impact Club</Link></li>
              <li><Link href="/partnerships" className="hover:text-primary-400 transition-colors">Partnerships</Link></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Become a Facilitator</a></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Startup Support</a></li>
              <li><Link href="/impactcircle" className="hover:text-primary-400 transition-colors">Investment Community</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Mission</a></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Leadership</a></li>
              <li><a href="mailto:careers@impactclub.com" className="hover:text-primary-400 transition-colors">Careers</a></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Blog</a></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Financial Literacy Hub</a></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Entrepreneurship Resources</a></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Investment Education</a></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition-colors">Terms</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition-colors">Code of Conduct</Link></li>
              <li><Link href="#" className="hover:text-primary-400 transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-12 pb-12 border-b border-dark-700">
          <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide">Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">
                hello@impactclub.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <a href="tel:+234800000000" className="hover:text-primary-400 transition-colors">
                +234 (800) 000-0000
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <span>Lagos, Nigeria</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-400">
          <p>© 2026 ImpactClub. All rights reserved. Building Africa's economic future.</p>
        </div>
      </div>
    </footer>
  );
}
