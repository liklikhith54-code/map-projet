import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, ArrowRight, Clock } from 'lucide-react';
import { useLang } from '../context/LangContext';

export default function PostCard({ post }) {
  const { t } = useLang();

  // Check if post was created in the last 3 days
  const isNew = () => {
    const postDate = new Date(post.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Job':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Result':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Admit Card':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Exam Date':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Admission':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Answer Key':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between relative overflow-hidden group">
      
      {/* Glow bar on top of cards on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>

      <div>
        {/* Category Tag & Badges */}
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryStyles(post.category)}`}>
            {t(post.category.charAt(0).toLowerCase() + post.category.slice(1).replace(' ', ''))}
          </span>
          <div className="flex items-center gap-1.5">
            {isNew() && (
              <span className="bg-red-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded animate-pulse">
                {t('newBadge')}
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
              post.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {t(post.status === 'Active' ? 'statusActive' : 'statusClosed')}
            </span>
          </div>
        </div>

        {/* Organization / Authority */}
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          {post.organization}
        </span>

        {/* Post Title */}
        <h3 className="text-md font-extrabold text-gray-900 mt-1 leading-snug group-hover:text-primary transition-colors">
          <Link to={`/post/${post._id}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>

        {/* Important Date Outline */}
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs font-semibold text-gray-600">
          {post.importantDates?.applicationLastDate && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span>{t('lastDateToApply')}:</span>
              <span className="text-red-600 font-bold">{formatDate(post.importantDates.applicationLastDate)}</span>
            </div>
          )}
          {post.importantDates?.examDate && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <span>{t('examDate')}:</span>
              <span className="text-primary font-bold">{formatDate(post.importantDates.examDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action footer */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
        <Link 
          to={`/post/${post._id}`} 
          className="text-xs font-bold text-primary group-hover:text-primary-dark flex items-center gap-1 hover:underline"
        >
          <span>{t('viewDetails')}</span>
          <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
