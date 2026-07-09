import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { Search, ArrowUpDown, ExternalLink, Calendar, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export default function ImportantDates() {
  const { t } = useLang();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Calendar states (Defaults to July 2026 as per our seeded exam dates)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)
  const [selectedDayFilter, setSelectedDayFilter] = useState(null); // { day, month, year }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/posts?limit=100');
        const data = await res.json();
        if (res.ok) {
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
    let filtered = posts.filter(post => {
      const matchSearch = (val) => val && val.toLowerCase().includes(search.toLowerCase());
      return matchSearch(post.title) || matchSearch(post.organization) || matchSearch(post.category);
    });

    if (selectedDayFilter) {
      filtered = filtered.filter(post => {
        const dates = post.importantDates;
        if (!dates) return false;
        
        const checkMatch = (d) => {
          if (!d) return false;
          const compare = new Date(d);
          return compare.getDate() === selectedDayFilter.day &&
                 compare.getMonth() === selectedDayFilter.month &&
                 compare.getFullYear() === selectedDayFilter.year;
        };

        return checkMatch(dates.applicationLastDate) || 
               checkMatch(dates.examDate) || 
               checkMatch(dates.resultDate);
      });
    }

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

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(m => {
      if (m === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
    setSelectedDayFilter(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(m => {
      if (m === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
    setSelectedDayFilter(null);
  };

  const getDayEvents = (day) => {
    const events = [];
    posts.forEach(post => {
      const dates = post.importantDates;
      if (!dates) return;

      const checkMatch = (d) => {
        if (!d) return false;
        const compare = new Date(d);
        return compare.getDate() === day &&
               compare.getMonth() === currentMonth &&
               compare.getFullYear() === currentYear;
      };

      if (checkMatch(dates.applicationLastDate)) {
        events.push({ type: 'deadline', color: 'bg-red-500', label: `Apply Last Date: ${post.organization}` });
      }
      if (checkMatch(dates.examDate)) {
        events.push({ type: 'exam', color: 'bg-blue-500', label: `Exam Date: ${post.organization}` });
      }
      if (checkMatch(dates.resultDate)) {
        events.push({ type: 'result', color: 'bg-green-500', label: `Result Declared: ${post.organization}` });
      }
    });
    return events;
  };

  const sortedAndFiltered = getSortedPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 font-sans">
            <Calendar className="text-primary stroke-[2.5]" size={30} />
            <span>{t('importantDates')}</span>
          </h2>
          <p className="text-sm text-gray-500 font-semibold mt-1">
            Browse and monitor upcoming application deadlines, exam schedules, and results announcements.
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

      {/* Interactive Calendar Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Calendar controls & grid */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-md text-gray-900 font-sans">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handlePrevMonth} 
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNextMonth} 
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {weekDays.map(day => (
                <div key={day} className="py-1 font-bold text-gray-400 uppercase tracking-wider">{day}</div>
              ))}
              
              {/* Offset days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="p-3 bg-gray-50/50 rounded-lg"></div>
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const events = getDayEvents(day);
                const isSelected = selectedDayFilter && selectedDayFilter.day === day && selectedDayFilter.month === currentMonth && selectedDayFilter.year === currentYear;
                
                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => {
                      if (events.length > 0) {
                        setSelectedDayFilter(isSelected ? null : { day, month: currentMonth, year: currentYear });
                      }
                    }}
                    disabled={events.length === 0}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-between min-h-[50px] relative transition-all ${
                      events.length > 0
                        ? isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 cursor-pointer shadow-sm'
                          : 'border-blue-100 bg-blue-50/20 hover:bg-blue-50/40 cursor-pointer hover:scale-[1.03]'
                        : 'border-gray-100 bg-white text-gray-400 cursor-default'
                    }`}
                  >
                    <span className={`font-bold text-xs ${events.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{day}</span>
                    
                    {/* Event indicators */}
                    {events.length > 0 && (
                      <div className="flex gap-0.5 justify-center mt-1">
                        {events.map((ev, eIdx) => (
                          <span key={eIdx} className={`w-1.5 h-1.5 rounded-full ${ev.color}`} title={ev.label}></span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar legends & quick filter description */}
          <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-100 pt-5 md:pt-0 md:pl-6 space-y-4">
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Calendar Key</h4>
            <div className="space-y-2 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span>Application Deadline (Last Date)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Exam Date</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Results Declared</span>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-semibold text-gray-500 leading-relaxed">
              <p>
                Highlighted dates indicate upcoming exam schedule milestones. Click on any date with an event indicator dot to filter the table below to that day.
              </p>
              {selectedDayFilter && (
                <button
                  onClick={() => setSelectedDayFilter(null)}
                  className="mt-3 flex items-center gap-1.5 text-primary hover:text-primary-dark font-extrabold uppercase tracking-wide text-[10px]"
                >
                  <RefreshCw size={10} />
                  <span>Show All Dates</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {sortedAndFiltered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 px-4 text-center max-w-lg mx-auto shadow-sm">
          <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
          <h4 className="text-lg font-bold text-gray-900 font-sans">No dates matches filter</h4>
          <p className="text-gray-500 text-xs mt-1 font-medium">Try clearing the date filter or searching another term.</p>
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
                      <td className="py-4 px-5 whitespace-nowrap text-green-600 font-bold">{formatDate(post.importantDates.resultDate)}</td>
                      <td className="py-4 px-5">
                        <a 
                          href={post.officialLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark inline-flex items-center gap-1 hover:underline font-bold"
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
                    <span className="text-green-600 font-bold">{formatDate(post.importantDates.resultDate)}</span>
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
