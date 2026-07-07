import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { Search, ArrowUpDown, ExternalLink, Calendar, AlertCircle } from 'lucide-react';

export default function ImportantDates() {
  const { t } = useLang();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      try {
        // Fetch posts without pagination for sorting/filtering inside the table list
        const res = await fetch('/api/posts?limit=100');
        const data = await res.json();
        if (res.ok) {
          // Filter only posts containing at least some importantDates defined
          const filtered = data.posts.filter(p => p.importantDates);
          setPosts(filtered);
        }
      } catch (err) {
        console.error('Failed to retrieve important dates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const getSortedPosts = () => {
    // 1. Filter posts matching search keyword
    const filtered = posts.filter(post => {
      const matchSearch = (val) => val && val.toLowerCase().includes(search.toLowerCase());
      return matchSearch(post.title) || matchSearch(post.organization) || matchSearch(post.category);
    });

    // 2. Sort posts
    return filtered.sort((a, b) => {
      let aVal, bVal;

      if (sortField === 'title') {
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
      } else if (sortField === 'notificationDate') {
        aVal = a.importantDates?.notificationDate ? new Date(a.importantDates.notificationDate) : new Date(0);
        bVal = b.importantDates?.notificationDate ? new Date(b.importantDates.notificationDate) : new Date(0);
      } else if (sortField === 'applicationLastDate') {
        aVal = a.importantDates?.applicationLastDate ? new Date(a.importantDates.applicationLastDate) : new Date(0);
        bVal = b.importantDates?.applicationLastDate ? new Date(b.importantDates.applicationLastDate) : new Date(0);
      } else if (sortField === 'examDate') {
        aVal = a.importantDates?.examDate ? new Date(a.importantDates.examDate) : new Date(0);
        bVal = b.importantDates?.examDate ? new Date(b.importantDates.examDate) : new Date(0);
      } else if (sortField === 'resultDate') {
        aVal = a.importantDates?.resultDate ? new Date(a.importantDates.resultDate) : new Date(0);
        bVal = b.importantDates?.resultDate ? new Date(b.importantDates.resultDate) : new Date(0);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const sortedAndFiltered = getSortedPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-5 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 font-sans">
            <Calendar className="text-primary stroke-[2.5]" size={30} />
            <span>{t('importantDates')}</span>
          </h2>
          <p className="text-sm text-gray-500 font-semibold mt-1">
            Browse and monitor upcoming application deadlines, exam schedules, and results announcement dates.
          </p>
        </div>

        {/* Local Search Input */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search dates table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 font-medium"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-semibold mt-3">{t('loading')}</p>
        </div>
      ) : sortedAndFiltered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 px-4 text-center max-w-lg mx-auto shadow-sm">
          <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
          <h4 className="text-lg font-bold text-gray-900">No dates matches search</h4>
          <p className="text-gray-500 text-xs mt-1 font-medium">Try checking your spelling or search using another keyword.</p>
        </div>
      ) : (
        <>
          {/* A. TABLE LAYOUT (MD Screens and Up) */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 select-none">
                  <tr>
                    <th className="py-3.5 px-5 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('title')}>
                      <div className="flex items-center gap-1">
                        <span>Exam / Job Name</span>
                        <ArrowUpDown size={12} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('notificationDate')}>
                      <div className="flex items-center gap-1">
                        <span>{t('notificationDate')}</span>
                        <ArrowUpDown size={12} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('applicationLastDate')}>
                      <div className="flex items-center gap-1">
                        <span>{t('lastDateToApply')}</span>
                        <ArrowUpDown size={12} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('examDate')}>
                      <div className="flex items-center gap-1">
                        <span>{t('examDate')}</span>
                        <ArrowUpDown size={12} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('resultDate')}>
                      <div className="flex items-center gap-1">
                        <span>{t('resultDate')}</span>
                        <ArrowUpDown size={12} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5 text-gray-500 font-bold">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium text-gray-700">
                  {sortedAndFiltered.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-1">{post.organization}</span>
                        <h4 className="font-extrabold text-gray-900 leading-tight mt-0.5">{post.title}</h4>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">{formatDate(post.importantDates.notificationDate)}</td>
                      <td className="py-4 px-5 whitespace-nowrap text-red-600 font-bold">
                        {formatDate(post.importantDates.applicationLastDate)}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap text-primary font-bold">
                        {formatDate(post.importantDates.examDate)}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">{formatDate(post.importantDates.resultDate)}</td>
                      <td className="py-4 px-5">
                        <a 
                          href={post.officialLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark inline-flex items-center gap-1 hover:underline"
                        >
                          <span>Apply</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* B. CARD LAYOUT (Mobile Screens) */}
          <div className="block md:hidden space-y-4">
            {sortedAndFiltered.map((post) => (
              <div key={post._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
                
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{post.organization}</span>
                  <h4 className="font-extrabold text-gray-900 leading-snug mt-0.5">{post.title}</h4>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs font-semibold text-gray-600">
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">{t('notificationDate')}</span>
                    <span className="text-gray-800">{formatDate(post.importantDates.notificationDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">{t('lastDateToApply')}</span>
                    <span className="text-red-600 font-bold">{formatDate(post.importantDates.applicationLastDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">{t('examDate')}</span>
                    <span className="text-primary font-bold">{formatDate(post.importantDates.examDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block uppercase">{t('resultDate')}</span>
                    <span className="text-gray-800">{formatDate(post.importantDates.resultDate)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="bg-primary/5 text-primary text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border border-primary/10">
                    {post.category}
                  </span>
                  <a 
                    href={post.officialLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-primary hover:bg-primary-light text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <span>{t('applyNow')}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
