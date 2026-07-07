import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useLang } from '../context/LangContext';

export default function Footer() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: t('subscribedSuccess') || 'Successfully subscribed for updates!' });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Subscription failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Could not connect to subscription server.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
      {/* 1. Newsletter Subscription Section */}
      <div className="bg-primary/10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center lg:text-left">
            <h3 className="text-lg font-bold text-white mb-1">
              {t('subscribeTitle')}
            </h3>
            <p className="text-sm text-gray-400 font-medium">
              {t('subscribeSub')}
            </p>
          </div>
          <div className="w-full lg:max-w-md">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-500 font-medium"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {submitting ? '...' : (
                  <>
                    <span>{t('subscribeBtn')}</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
            {status.message && (
              <p className={`text-xs mt-2 font-semibold flex items-center gap-1 ${
                status.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                <span>{status.message}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-white font-bold text-md mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide">
            {t('siteTitle')}
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed font-medium">
            Sarkari Update Hub provides fast and accurate information on government jobs, exam dates, admit cards, and results. Verify details via official sources.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-md mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide">
            Quick Navigation
          </h4>
          <ul className="grid grid-cols-2 gap-2 text-sm font-semibold">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-primary transition-colors">Jobs</Link>
            </li>
            <li>
              <Link to="/results" className="hover:text-primary transition-colors">Results</Link>
            </li>
            <li>
              <Link to="/admit-card" className="hover:text-primary transition-colors">Admit Cards</Link>
            </li>
            <li>
              <Link to="/dates" className="hover:text-primary transition-colors">Important Dates</Link>
            </li>
            <li>
              <Link to="/admission" className="hover:text-primary transition-colors">Admissions</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-md mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide">
            Legal & Support
          </h4>
          <ul className="space-y-2 text-sm font-semibold">
            <li>
              <Link to="/about" className="hover:text-primary transition-colors">About & Contact Us</Link>
            </li>
            <li>
              <Link to="/disclaimer" className="hover:text-primary text-red-400 transition-colors flex items-center gap-1">
                <ShieldAlert size={14} />
                <span>{t('disclaimer')}</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Disclaimer & Copyright */}
      <div className="border-t border-gray-800 bg-gray-950 py-6 text-center text-xs text-gray-500 px-4">
        <div className="max-w-3xl mx-auto mb-4 leading-relaxed font-medium">
          <strong>Disclaimer:</strong> {t('disclaimerText')} We are a private information aggregation platform and are not affiliated, associated, authorized, endorsed by, or in any way officially connected with any government body or agency.
        </div>
        <p className="font-semibold">&copy; {new Date().getFullYear()} Sarkari Update Hub. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
