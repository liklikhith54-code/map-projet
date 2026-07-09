import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Globe, LogOut, Shield, Briefcase, Bell, X, Send, MessageSquare } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { lang, toggleLang, t } = useLang();
  const { isAuthenticated, logout, user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
      setKeyword('');
    }
  };

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
      setStatus({ type: 'error', message: 'Connection failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top bar with flags / govt text (gives official portal vibe but sleek) */}
      <div className="bg-primary-dark text-white text-xs py-1 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-semibold tracking-wider text-[10px] md:text-xs">GOVERNMENT OF INDIA INFOPORTAL</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleLang} 
            className="flex items-center gap-1 hover:text-gray-300 font-semibold px-2 py-0.5 rounded border border-gray-700 bg-gray-900 transition-colors"
          >
            <Globe size={12} />
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded text-white shadow-md">
              <Briefcase size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-primary leading-tight font-sans tracking-tight">
                {t('siteTitle')}
              </h1>
              <p className="text-[10px] text-gray-500 font-semibold hidden md:block">
                {t('siteSubTitle')}
              </p>
            </div>
          </Link>
        </div>

        {/* Search Bar & Links */}
        <div className="flex flex-1 md:max-w-md mx-0 md:mx-6 items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium placeholder-gray-400"
            />
            <button type="submit" className="absolute right-2 top-2 text-gray-400 hover:text-primary" aria-label="Submit search query">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Right side navigation links */}
        <nav className="flex items-center space-x-4 text-sm font-semibold text-gray-700">
          <Link to="/" className="hover:text-primary transition-colors">
            {t('home')}
          </Link>
          <Link to="/jobs" className="hover:text-primary transition-colors">
            {t('jobs')}
          </Link>
          <Link to="/dates" className="hover:text-primary transition-colors">
            {t('importantDates')}
          </Link>
          
          {/* Notification Bell */}
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary relative transition-colors"
            title={t('notificationDrawerTitle')}
          >
            <Bell size={20} className="animate-pulse" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <span className="text-gray-300">|</span>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Link to="/admin" className="text-primary hover:underline flex items-center gap-1">
                <Shield size={14} />
                <span>{t('adminPanel')}</span>
              </Link>
              <button 
                onClick={logout} 
                className="text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                title={t('logout')}
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          ) : (
            <Link to="/admin" className="text-gray-500 hover:text-primary flex items-center gap-1 transition-colors">
              <Shield size={14} />
              <span>{t('adminLogin')}</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Notification Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop Blur */}
            <div 
              className="absolute inset-0 bg-gray-600 bg-opacity-40 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsDrawerOpen(false)}
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out border-l border-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="text-primary" size={20} />
                    <span>{t('notificationDrawerTitle')}</span>
                  </h2>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-1">
                  {/* 1. Telegram Box */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-500 text-white p-2 rounded-xl shadow-md">
                        <Send size={20} className="transform rotate-45 -translate-y-0.5 -translate-x-0.5" />
                      </div>
                      <h3 className="font-extrabold text-blue-900 text-sm">Telegram Alerts</h3>
                    </div>
                    <p className="text-xs text-blue-800 font-medium leading-relaxed mb-4">
                      Join our active Telegram channel to get immediate, real-time push alerts on your phone whenever a new post is added.
                    </p>
                    <a 
                      href="https://t.me/ApplyKnowAlerts" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold py-2.5 rounded-xl text-center text-xs block transition-all shadow-md shadow-blue-500/20"
                    >
                      {t('telegramAlerts')}
                    </a>
                  </div>

                  {/* 2. WhatsApp Updates */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-green-500 text-white p-2 rounded-xl shadow-md">
                        <MessageSquare size={20} />
                      </div>
                      <h3 className="font-extrabold text-green-900 text-sm">WhatsApp Updates</h3>
                    </div>
                    <p className="text-xs text-green-800 font-medium leading-relaxed mb-4">
                      Get updates directly in your WhatsApp Status/Community. Send a request or subscribe to our official Business account.
                    </p>
                    <button 
                      onClick={() => alert('Mock WhatsApp Subscription Active!')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold py-2.5 rounded-xl text-center text-xs block transition-all shadow-md shadow-green-500/20"
                    >
                      {t('whatsappAlerts')}
                    </button>
                  </div>

                  {/* 3. Newsletter Email Alerts */}
                  <div className="border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3 bg-white">
                    <h3 className="font-bold text-gray-900 text-sm">{t('newsletterAlerts')}</h3>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                      Receive daily morning digests of newly published exam applications and result keys.
                    </p>
                    <form onSubmit={handleSubscribe} className="space-y-2">
                      <input
                        type="email"
                        required
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400 font-semibold"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                      >
                        {submitting ? '...' : t('subscribeBtn')}
                      </button>
                    </form>
                    {status.message && (
                      <p className={`text-[10px] font-bold ${
                        status.type === 'success' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {status.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
