import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { useLang } from '../context/LangContext';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function CategoryPage({ category }) {
  const { t } = useLang();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts?page=${currentPage}&limit=6&category=${category}`);
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
  }, [category, currentPage]);

  const getPageTitle = () => {
    switch (category) {
      case 'Job':
        return t('jobs');
      case 'Result':
        return t('results');
      case 'Admit Card':
        return t('admitCards');
      case 'Exam Date':
        return t('examDates');
      case 'Admission':
        return t('admission');
      case 'Answer Key':
        return t('answerKey');
      default:
        return category;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category header */}
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 font-sans">
          <span>{getPageTitle()}</span>
          <span className="text-sm font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-0.5 rounded-full">
            {total} {total === 1 ? 'Alert' : 'Alerts'}
          </span>
        </h2>
        <p className="text-sm text-gray-500 font-semibold mt-1">
          Explore latest verified government {getPageTitle().toLowerCase()} updates.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-semibold mt-3">{t('loading')}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 px-4 text-center max-w-lg mx-auto shadow-sm">
          <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
          <h4 className="text-lg font-bold text-gray-900">{t('noPostsFound')}</h4>
          <p className="text-gray-500 text-xs mt-1 font-medium">Please check back later or subscribe to get notified immediately.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
}
