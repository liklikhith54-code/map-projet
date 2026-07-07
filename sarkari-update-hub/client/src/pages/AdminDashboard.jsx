import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, Plus, BarChart2, Briefcase, Award, Calendar, FileText, AlertCircle, PlusCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { isAuthenticated, authenticatedFetch, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

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
        // Remove post locally
        setPosts(posts.filter((p) => p._id !== id));
        // Refresh metrics
        fetchDashboardData();
      } else {
        const data = await res.json();
        setActionError(data.error || 'Failed to delete post.');
      }
    } catch (err) {
      setActionError('Connection error deleting post.');
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm mt-3">Verifying session...</p>
      </div>
    );
  }

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Job': return <Briefcase size={18} className="text-blue-500" />;
      case 'Result': return <Award size={18} className="text-green-500" />;
      default: return <FileText size={18} className="text-purple-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
          className="bg-primary hover:bg-primary-light text-white font-extrabold px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-center"
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
          {/* 1. Analytics Widgets Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Total Posts</span>
              <span className="text-3xl font-extrabold text-gray-900 mt-1 block">{stats?.totalPosts || 0}</span>
            </div>
            {stats?.categoryCounts && Object.entries(stats.categoryCounts).map(([cat, count]) => (
              <div key={cat} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">{cat}</span>
                  <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{count}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {getCategoryIcon(cat)}
                </div>
              </div>
            ))}
          </div>

          {/* 2. Posts management table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider">Manage Announcements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50/55 text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-100 select-none">
                  <tr>
                    <th className="py-3.5 px-5">Title</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Organization</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium text-gray-700">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50/45 transition-colors">
                      <td className="py-4 px-5">
                        <h4 className="font-extrabold text-gray-900 leading-tight">{post.title}</h4>
                        <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                          {post.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 uppercase text-xs font-bold text-gray-500">{post.organization}</td>
                      <td className="py-4 px-5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          post.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {post.status}
                        </span>
                      </td>
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
                      <td colSpan="5" className="py-10 text-center text-gray-400 font-bold">
                        No notifications posted yet. Click "Add New Post" to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
