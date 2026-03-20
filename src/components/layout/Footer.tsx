"use client";

import { Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-700 text-gray-300 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black text-xl">
              IE
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering Africa's next generation of leaders through accessible, quality education and mentorship.
            </p>
            <div className="flex gap-3 pt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-400 hover:bg-primary-500 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-400 hover:bg-secondary-500 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-400 hover:bg-primary-500 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-400 hover:bg-secondary-500 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/learning" className="hover:text-primary-400 transition-colors">Features</Link></li>
              <li><Link href="/programmes" className="hover:text-primary-400 transition-colors">Programmes</Link></li>
              <li><Link href="/learning" className="hover:text-primary-400 transition-colors">Courses</Link></li>
              <li><Link href="/events" className="hover:text-primary-400 transition-colors">Events</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-black text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><a href="mailto:careers@impactclub.com" className="hover:text-primary-400 transition-colors">Careers</a></li>
              <li><Link href="/learning" className="hover:text-primary-400 transition-colors">Blog</Link></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-black text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Help Center</a></li>
              <li><Link href="/programmes" className="hover:text-primary-400 transition-colors">Documentation</Link></li>
              <li><Link href="/community" className="hover:text-primary-400 transition-colors">Community</Link></li>
              <li><a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-black text-white mb-4">Get In Touch</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400" />
                <a href="mailto:hello@impactclub.com" className="hover:text-primary-400 transition-colors">
                  hello@impactclub.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400" />
                <a href="tel:+234800000000" className="hover:text-primary-400 transition-colors">
                  +234 (800) 000-0000
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-1 flex-shrink-0" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>
              © 2026 ImpactClub. All rights reserved. Empowering Africa, one leader at a time.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/#" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
              <Link href="/#" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
              <Link href="/#" className="hover:text-primary-400 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
