import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { useLang } from '../context/LangContext';
import { Search as SearchIcon, AlertCircle } from 'lucide-react';

export default function Search() {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/posts?search=${encodeURIComponent(query.trim())}&limit=50`);
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.error('Search request failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search header */}
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 font-sans">
          <SearchIcon className="text-primary stroke-[2.5]" size={30} />
          <span>Search Results</span>
        </h2>
        <p className="text-sm text-gray-500 font-semibold mt-1">
          Showing matching results for: <span className="text-primary font-bold">"{query}"</span>
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
          <h4 className="text-lg font-bold text-gray-900">No matching updates found</h4>
          <p className="text-gray-500 text-xs mt-1 font-medium">Try broadening your search term (e.g. "UPSC", "B.Ed", "Constable").</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
