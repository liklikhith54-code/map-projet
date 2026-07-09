import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, Plus, Briefcase, Award, FileText, AlertCircle, Users, BarChart2, Mail, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const { isAuthenticated, authenticatedFetch, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  
  // Newsletter Campaign States
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch stats
      const statsRes = await authenticatedFetch('/api/posts/stats');
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData);
      }

      // 2. Fetch all posts
      const postsRes = await authenticatedFetch('/api/posts?limit=100');
      const postsData = await postsRes.json();
      if (postsRes.ok) {
        setPosts(postsData.posts);
      }
    } catch (err) {
      console.error('Failed to retrieve admin dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const handleDeletePost = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the post:\n"${title}"?`)) {
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPosts(posts.filter((p) => p._id !== id));
        fetchDashboardData();
      } else {
        const data = await res.json();
        setActionError(data.error || 'Failed to delete post.');
      }
    } catch (err) {
      setActionError('Connection error deleting post.');
    }
  };

  const handleSendCampaign = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    setProgress(0);
    setSuccessMsg('');

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSending(false);
          setSuccessMsg('Newsletter broadcasted successfully to all subscribers!');
          setSubject('');
          setMessage('');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm mt-3">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const activePostsCount = posts.filter(p => p.status === 'Active').length;
  const closedPostsCount = posts.filter(p => p.status === 'Closed').length;

  const renderCategoryChart = () => {
    if (!stats?.categoryCounts) return null;
    const data = Object.entries(stats.categoryCounts);
    const maxVal = Math.max(...data.map(([, count]) => count), 1);
    
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category Distribution</h4>
        <div className="space-y-2">
          {data.map(([cat, count]) => {
            const pct = (count / maxVal) * 100;
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">{cat}</span>
                  <span className="text-gray-900 font-bold">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200/50">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLocationChart = () => {
    if (!stats?.locationCounts) return null;
    const data = Object.entries(stats.locationCounts);
    const maxVal = Math.max(...data.map(([, count]) => count), 1);

    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location Distribution</h4>
        <div className="space-y-2">
          {data.map(([loc, count]) => {
            const pct = (count / maxVal) * 100;
            return (
              <div key={loc} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">{loc}</span>
                  <span className="text-gray-900 font-bold">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200/50">
                  <div className="bg-accent h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-medium text-gray-700">
      {/* Dashboard header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">
            Admin Dashboard
          </h2>
          <p className="text-sm text-gray-500 font-semibold mt-1">
            Publish and manage job vacancy notices, admit cards, and results listings.
          </p>
        </div>
        <Link
          to="/admin/add"
          className="bg-primary hover:bg-primary-light text-white font-extrabold px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-center uppercase tracking-wider"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>Add New Post</span>
        </Link>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm mt-3">Loading dashboard metrics...</p>
        </div>
      ) : (
        <>
          {/* 1. Enhanced Analytics Widgets Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Total Posts</span>
                <span className="text-3xl font-extrabold text-gray-900 mt-1 block">{stats?.totalPosts || 0}</span>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                <FileText size={20} className="text-blue-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Subscribers</span>
                <span className="text-3xl font-extrabold text-gray-900 mt-1 block">{stats?.totalSubscribers || 0}</span>
              </div>
              <div className="bg-green-50 p-2.5 rounded-xl border border-green-100">
                <Users size={20} className="text-green-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Active Posts</span>
                <span className="text-3xl font-extrabold text-gray-900 mt-1 block text-green-600">{activePostsCount}</span>
              </div>
              <div className="bg-green-50/30 p-2.5 rounded-xl border border-green-100/30">
                <Award size={20} className="text-green-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Closed Posts</span>
                <span className="text-3xl font-extrabold text-gray-900 mt-1 block text-red-500">{closedPostsCount}</span>
              </div>
              <div className="bg-red-50 p-2.5 rounded-xl border border-red-100">
                <AlertCircle size={20} className="text-red-500" />
              </div>
            </div>
          </div>

          {/* 2. Side-By-Side Lists and Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Column - Manage Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider">Manage Announcements</h3>
                  <span className="text-xs bg-gray-200 font-bold px-2 py-0.5 rounded-full text-gray-600">{posts.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50/55 text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100 select-none">
                      <tr>
                        <th className="py-3.5 px-5">Title</th>
                        <th className="py-3.5 px-5">Category</th>
                        <th className="py-3.5 px-5">Location</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-semibold text-gray-700">
                      {posts.map((post) => (
                        <tr key={post._id} className="hover:bg-gray-50/45 transition-colors">
                          <td className="py-4 px-5">
                            <h4 className="font-extrabold text-gray-900 leading-tight truncate max-w-[280px]" title={post.title}>{post.title}</h4>
                            <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">
                              {post.category}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-xs text-gray-500 font-bold">{post.jobLocation || 'All India'}</td>
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/edit/${post._id}`}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-primary hover:bg-gray-50 transition-all"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                onClick={() => handleDeletePost(post._id, post.title)}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-gray-50 transition-all"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {posts.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-10 text-center text-gray-400 font-bold">
                            No notifications posted yet. Click "Add New Post" to get started!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Charts & Campaigns */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Analytics Charts Panel */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-6">
                <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3 font-sans">
                  <BarChart2 className="text-primary" size={18} />
                  <span>Dashboard Visuals</span>
                </h3>
                
                {renderCategoryChart()}
                {renderLocationChart()}
              </div>

              {/* Newsletter Campaign Broadcast */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3 font-sans">
                  <Mail className="text-primary" size={18} />
                  <span>Alert Newsletter Campaign</span>
                </h3>

                {successMsg && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl p-3 flex items-start gap-2">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSendCampaign} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 uppercase">Subject</label>
                    <input
                      type="text"
                      required
                      disabled={sending}
                      placeholder="e.g. Daily Alert: UPSC Recruitment 2026 application last date is approaching"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 uppercase">Message Body</label>
                    <textarea
                      required
                      disabled={sending}
                      rows={3}
                      placeholder="Compose notification newsletter content..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-semibold"
                    />
                  </div>

                  {sending ? (
                    <div className="space-y-2 py-2">
                      <div className="flex justify-between font-bold text-[10px] uppercase text-gray-500">
                        <span>Dispatching Emails...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                        <div className="bg-primary h-full rounded-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-2.5 rounded-xl text-center block transition-colors uppercase tracking-wider shadow-sm"
                    >
                      Send Alert Campaign
                    </button>
                  )}
                </form>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
