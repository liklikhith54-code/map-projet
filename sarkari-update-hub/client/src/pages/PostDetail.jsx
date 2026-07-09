import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { Calendar, FileText, Globe, ArrowLeft, ShieldAlert, Award, Briefcase, GraduationCap, Users, MapPin, IndianRupee } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const { t } = useLang();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (res.ok) {
          setPost(data);
        } else {
          setError(data.error || 'Failed to load details.');
        }
      } catch (err) {
        console.error(err);
        setError('Server connection failed.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-semibold mt-3">{t('loading')}</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ShieldAlert className="text-red-500 mx-auto mb-3" size={48} />
        <h3 className="text-xl font-bold text-gray-900">Error Loading Details</h3>
        <p className="text-gray-500 text-sm mt-1">{error || 'Post not found.'}</p>
        <Link to="/" className="text-primary hover:underline font-bold text-sm mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors mb-6 group">
        <ArrowLeft size={14} className="transform group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Board</span>
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Banner color stripe */}
        <div className="h-2 bg-primary"></div>

        <div className="p-6 md:p-8">
          {/* Header block */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="space-y-1 flex-grow">
              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {post.category}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug mt-2">
                {post.title}
              </h2>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{post.organization}</span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                  post.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {t(post.status === 'Active' ? 'statusActive' : 'statusClosed')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-gray-100">
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 flex items-start gap-3">
              <Users className="text-primary shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('vacancies')}</h4>
                <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                  {post.vacancies > 0 ? post.vacancies.toLocaleString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 flex items-start gap-3">
              <IndianRupee className="text-primary shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('salary')}</h4>
                <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                  {post.salary || 'Not Specified'}
                </p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 flex items-start gap-3">
              <GraduationCap className="text-primary shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('qualification')}</h4>
                <p className="text-xs font-extrabold text-gray-900 mt-0.5 truncate max-w-[120px]" title={post.qualification?.join(', ')}>
                  {post.qualification && post.qualification.length > 0 ? post.qualification.join(', ') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 flex items-start gap-3">
              <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('jobLocation')}</h4>
                <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                  {post.jobLocation || 'All India'}
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="py-6 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line">{post.description}</p>
          </div>

          {/* Important Dates Table */}
          <div className="py-6 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t('importantDates')}</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 text-sm font-semibold">
                <div className="p-4 space-y-3">
                  {post.importantDates?.notificationDate && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-400 text-xs uppercase">{t('notificationDate')}</span>
                      <span className="text-gray-800 text-right">{formatDate(post.importantDates.notificationDate)}</span>
                    </div>
                  )}
                  {post.importantDates?.applicationStartDate && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-400 text-xs uppercase">{t('applicationStart')}</span>
                      <span className="text-gray-800 text-right">{formatDate(post.importantDates.applicationStartDate)}</span>
                    </div>
                  )}
                  {post.importantDates?.applicationLastDate && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-400 text-xs uppercase">{t('lastDateToApply')}</span>
                      <span className="text-red-600 font-bold text-right">{formatDate(post.importantDates.applicationLastDate)}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {post.importantDates?.examDate && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-400 text-xs uppercase">{t('examDate')}</span>
                      <span className="text-primary font-bold text-right">{formatDate(post.importantDates.examDate)}</span>
                    </div>
                  )}
                  {post.importantDates?.resultDate && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-400 text-xs uppercase">{t('resultDate')}</span>
                      <span className="text-green-600 font-bold text-right">{formatDate(post.importantDates.resultDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility & Application Fee details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">{t('eligibility')}</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line">{post.eligibility}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">{t('applicationFee')}</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">{post.applicationFee || 'Nil'}</p>
            </div>
          </div>

          {/* Direct CTA Action Links */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={post.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-primary hover:bg-primary-light text-white font-extrabold text-center py-3.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors text-sm uppercase tracking-wider"
            >
              <Globe size={18} />
              <span>{t('applyNow')} / {t('officialWebsite')}</span>
            </a>
            {post.pdfLink && (
              <a
                href={post.pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-extrabold text-center py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm uppercase tracking-wider"
              >
                <FileText size={18} />
                <span>{t('downloadPdf')}</span>
              </a>
            )}
          </div>

          {/* Verification inline warning disclaimer */}
          <div className="mt-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert size={20} className="shrink-0 mt-0.5" />
            <div className="text-xs font-semibold leading-relaxed">
              <strong>Verification Notice:</strong> {t('disclaimerText')} While we make every effort to display accurate timelines, announcements are subject to modification by officials. Always check the official website of {post.organization} before executing application actions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
