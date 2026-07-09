import React from 'react';
import { ShieldAlert, BookOpen } from 'lucide-react';
import { useLang } from '../context/LangContext';

export default function Disclaimer() {
  const { t } = useLang();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="border-b border-gray-100 pb-4 mb-4 flex items-center gap-3">
          <div className="bg-red-50 p-2.5 rounded-lg text-red-500 border border-red-100">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 font-sans tracking-tight">
              {t('disclaimer')}
            </h2>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Please read this informational notice carefully.</p>
          </div>
        </div>

        {/* Disclaimer Points */}
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
          <p>
            The content provided on <strong>Apply Know</strong> is for general informational and educational purposes only. While we endeavour to keep all job announcements, exam timelines, eligibility standards, and result notices updated and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information displayed.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
            <h4 className="font-extrabold text-gray-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <BookOpen size={14} className="text-primary" />
              <span>Core Policy Outline</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs font-semibold text-gray-600">
              <li>We are a private aggregator site and have no connection with government recruitment offices.</li>
              <li>Official links and PDF files are properties of their respective organizations (UPSC, SSC, NCTE, etc.).</li>
              <li>Candidates are strictly advised to download the official gazette, read guidelines, and verify eligibility before applying.</li>
              <li>We do NOT collect payments or fees for any recruitment. Any payment requests made in our name are fraudulent.</li>
            </ul>
          </div>

          <p>
            Any reliance you place on information found on this portal is strictly at your own risk. In no event will Apply Know be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or funds in connection with the use of this website.
          </p>
          <p>
            Through this website, you are able to link to other websites which are not under the control of Apply Know. We have no control over the nature, content and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
          </p>
        </div>
      </div>
    </div>
  );
}
