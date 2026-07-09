import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { useLang } from '../context/LangContext';
import { ChevronLeft, ChevronRight, AlertCircle, Briefcase, FileText, CheckSquare, Calendar, GraduationCap, Award, MapPin, SlidersHorizontal } from 'lucide-react';

export default function Home() {
  const { t } = useLang();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedQualification, setSelectedQualification] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'All', icon: null },
    { name: 'Job', icon: Briefcase },
    { name: 'Result', icon: Award },
    { name: 'Admit Card', icon: FileText },
    { name: 'Exam Date', icon: Calendar },
    { name: 'Admission', icon: GraduationCap },
    { name: 'Answer Key', icon: CheckSquare },
  ];

  const qualificationsList = ['10th', '12th', 'Graduate', 'B.Ed'];
  const locationsList = ['Central Govt', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Delhi', 'Uttar Pradesh', 'Bihar', 'West Bengal'];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const catQuery = activeCategory !== 'All' ? `&category=${activeCategory}` : '';
        const qualQuery = selectedQualification ? `&qualification=${selectedQualification}` : '';
        const locQuery = selectedLocation ? `&jobLocation=${selectedLocation}` : '';
        const res = await fetch(`/api/posts?page=${currentPage}&limit=6${catQuery}${qualQuery}${locQuery}`);
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
          setTotal(data.total);
          setPages(data.pages);
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeCategory, currentPage, selectedQualification, selectedLocation]);

  const handleCategoryChange = (catName) => {
    setActiveCategory(catName);
    setCurrentPage(1); // Reset to first page
  };

  const getCategoryTranslation = (catName) => {
    if (catName === 'All') return t('All') || 'All';
    return t(catName.charAt(0).toLowerCase() + catName.slice(1).replace(' ', ''));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Visual Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-6 md:p-10 mb-8 shadow-lg relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="bg-accent text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-green-500 shadow-sm inline-block mb-3">
            🇮🇳 Direct Official Alerts
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight">
            Apply Know Exam Alerts & Notifications
          </h2>
          <p className="text-sm md:text-base text-gray-200 mt-2 font-medium">
            Get instant updates on Indian Central and State government job vacancies, admit cards, exams schedule, B.Ed entrances, and declared results in one place.
          </p>
        </div>
      </div>

      {/* Categories Filter Carousel / Grid */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex space-x-2 md:justify-center min-w-max px-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.name)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-sm ${
                  isSelected
                    ? 'bg-primary text-white border-primary ring-2 ring-primary/20'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary/30 hover:bg-gray-50'
                }`}
              >
                {Icon && <Icon size={16} />}
                <span>{getCategoryTranslation(cat.name)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-200 pb-3 font-sans">
        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
        <span>{t('activeAlerts')}</span>
        <span className="text-xs bg-gray-100 border border-gray-200 text-gray-500 font-bold px-2 py-0.5 rounded-full">
          {total}
        </span>
      </h3>

      {/* Main Grid Layout with Filters Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filter Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5">
            <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 font-sans">
              <SlidersHorizontal size={16} className="text-primary" />
              <span>{t('filterTitle')}</span>
            </h4>
            
            {/* Qualification Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 block">{t('qualification')}</label>
              <select
                value={selectedQualification}
                onChange={(e) => { setSelectedQualification(e.target.value); setCurrentPage(1); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              >
                <option value="">{t('allQualifications')}</option>
                {qualificationsList.map(qual => (
                  <option key={qual} value={qual}>{qual}</option>
                ))}
              </select>
            </div>

            {/* Location Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 block">{t('jobLocation')}</label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none"
                >
                  <option value="">{t('allLocations')}</option>
                  {locationsList.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <MapPin className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
              </div>
            </div>

            {/* Reset Button */}
            {(selectedQualification || selectedLocation) && (
              <button
                onClick={() => { setSelectedQualification(''); setSelectedLocation(''); setCurrentPage(1); }}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Posts List Feed */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm font-semibold mt-3">{t('loading')}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl py-16 px-4 text-center max-w-lg mx-auto shadow-sm">
              <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
              <h4 className="text-lg font-bold text-gray-900">{t('noPostsFound')}</h4>
              <p className="text-gray-500 text-xs mt-1 font-medium">Please check back later or try clearing your search filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-12">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 rounded-lg border text-sm font-bold transition-all ${
                        currentPage === p
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === pages}
                    onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
