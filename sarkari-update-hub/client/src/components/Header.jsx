import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Globe, LogOut, Shield, Briefcase } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { lang, toggleLang, t } = useLang();
  const { isAuthenticated, logout, user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
      setKeyword('');
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
          <Link to="/dates" className="hover:text-primary transition-colors text-primary border-b-2 border-primary pb-0.5">
            {t('importantDates')}
          </Link>
          
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
    </header>
  );
}
