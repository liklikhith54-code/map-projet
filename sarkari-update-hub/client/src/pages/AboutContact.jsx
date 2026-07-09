import React from 'react';
import { Mail, MapPin, Info, Users, ShieldAlert } from 'lucide-react';
import { useLang } from '../context/LangContext';

export default function AboutContact() {
  const { t } = useLang();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* About Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-gray-900 border-b border-gray-100 pb-4 mb-4 flex items-center gap-2 font-sans">
          <Users className="text-primary" size={24} />
          <span>About Us</span>
        </h2>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
          <p>
            Welcome to <strong>Apply Know</strong>, your premier destination for verified and consolidated alerts on Indian government recruitment notices, entrance exams, results, and answer keys.
          </p>
          <p>
            Our mission is simple: to make government opportunity alerts accessible, easy-to-read, and transparent for aspirants across India. We track official gazettes, department websites, and major public releases to extract crucial timelines, fees, eligibility criteria, and direct application paths—saving candidates from crawling through multiple archaic official portals.
          </p>
          <p>
            Whether you are prepping for UPSC Civil Services, state police jobs, banking exams, central B.Ed entrances, or military recruitments, we aim to deliver real-time notifications straight to you.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-gray-900 border-b border-gray-100 pb-4 mb-4 flex items-center gap-2 font-sans">
          <Mail className="text-primary" size={24} />
          <span>Contact Us</span>
        </h2>
        <p className="text-sm text-gray-600 mb-6 font-medium leading-relaxed">
          Have an update tip, correction, or general inquiry? Get in touch with our content management team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-semibold">
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex items-start gap-3">
            <Mail className="text-primary shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-gray-900 font-bold">Email Support</h4>
              <p className="text-gray-500 text-xs mt-0.5">We respond within 24-48 business hours.</p>
              <a href="mailto:support@applyknow.in" className="text-primary hover:underline mt-2 inline-block">
                support@applyknow.in
              </a>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex items-start gap-3">
            <MapPin className="text-primary shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-gray-900 font-bold">Head Office</h4>
              <p className="text-gray-500 text-xs mt-0.5">Apply Know Inc.</p>
              <p className="text-gray-700 text-xs font-semibold mt-2">
                DDA Complex, Sector 9, Dwarka,<br />
                New Delhi, 110075, India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification notice summary */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-6 flex items-start gap-3 shadow-sm">
        <ShieldAlert size={24} className="shrink-0 mt-0.5" />
        <div className="text-xs font-semibold leading-relaxed">
          <h4 className="text-sm font-bold mb-1">Verify Before Applying</h4>
          Apply Know is a private informational resource. We compile notifications from official public sources but do not guarantee 100% accuracy due to potential changes in dates or parameters by exam authorities. Always read the detailed official brochure/PDF before paying application fees.
        </div>
      </div>
    </div>
  );
}
