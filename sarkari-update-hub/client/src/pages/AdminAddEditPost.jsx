import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function AdminAddEditPost() {
  const { id } = useParams();
  const isEditMode = !!id;
  const { isAuthenticated, authenticatedFetch, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    category: 'Job',
    organization: '',
    description: '',
    eligibility: '',
    applicationFee: '',
    officialLink: '',
    pdfLink: '',
    status: 'Active',
    notificationDate: '',
    applicationStartDate: '',
    applicationLastDate: '',
    examDate: '',
    resultDate: '',
    vacancies: 0,
    salary: '',
    qualification: [],
    jobLocation: 'All India',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const qualificationsList = ['10th', '12th', 'Graduate', 'B.Ed'];

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isAuthenticated && isEditMode) {
      const fetchPostDetails = async () => {
        setLoading(true);
        try {
          const res = await authenticatedFetch(`/api/posts/${id}`);
          const data = await res.json();
          if (res.ok) {
            setForm({
              title: data.title || '',
              category: data.category || 'Job',
              organization: data.organization || '',
              description: data.description || '',
              eligibility: data.eligibility || '',
              applicationFee: data.applicationFee || '',
              officialLink: data.officialLink || '',
              pdfLink: data.pdfLink || '',
              status: data.status || 'Active',
              notificationDate: formatDateForInput(data.importantDates?.notificationDate),
              applicationStartDate: formatDateForInput(data.importantDates?.applicationStartDate),
              applicationLastDate: formatDateForInput(data.importantDates?.applicationLastDate),
              examDate: formatDateForInput(data.importantDates?.examDate),
              resultDate: formatDateForInput(data.importantDates?.resultDate),
              vacancies: data.vacancies || 0,
              salary: data.salary || '',
              qualification: data.qualification || [],
              jobLocation: data.jobLocation || 'All India',
            });
          } else {
            setError(data.error || 'Failed to retrieve post details.');
          }
        } catch (err) {
          setError('Failed to connect to server.');
        } finally {
          setLoading(false);
        }
      };

      fetchPostDetails();
    }
  }, [id, isAuthenticated, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (qual) => {
    setForm((prev) => {
      const current = prev.qualification || [];
      if (current.includes(qual)) {
        return { ...prev, qualification: current.filter((q) => q !== qual) };
      } else {
        return { ...prev, qualification: [...current, qual] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.organization.trim() || !form.officialLink.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    // Reconstruct body payload according to model
    const payload = {
      title: form.title.trim(),
      category: form.category,
      organization: form.organization.trim(),
      description: form.description.trim(),
      eligibility: form.eligibility.trim(),
      applicationFee: form.applicationFee.trim(),
      officialLink: form.officialLink.trim(),
      pdfLink: form.pdfLink.trim(),
      status: form.status,
      vacancies: parseInt(form.vacancies) || 0,
      salary: form.salary.trim(),
      qualification: form.qualification,
      jobLocation: form.jobLocation.trim(),
      importantDates: {
        notificationDate: form.notificationDate ? new Date(form.notificationDate) : null,
        applicationStartDate: form.applicationStartDate ? new Date(form.applicationStartDate) : null,
        applicationLastDate: form.applicationLastDate ? new Date(form.applicationLastDate) : null,
        examDate: form.examDate ? new Date(form.examDate) : null,
        resultDate: form.resultDate ? new Date(form.resultDate) : null,
      },
    };

    try {
      const url = isEditMode ? `/api/posts/${id}` : '/api/posts';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        navigate('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save announcement details.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error saving details.');
    } finally {
      setLoading(false);
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

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-medium text-gray-700">
      {/* Back button */}
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors mb-6 group">
        <ArrowLeft size={14} className="transform group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-2 bg-primary"></div>

        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight font-sans mb-1">
            {isEditMode ? 'Edit Announcement' : 'Add New Announcement'}
          </h2>
          <p className="text-xs text-gray-500 font-semibold mb-6">
            Complete the form parameters below to publish on the hub board.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3 flex items-start gap-2 mb-6">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            {/* 1. Title */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                Post Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. UPSC Civil Services Prelims Recruitment 2026"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* 2. Grid for Category, Org, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-bold text-gray-700 cursor-pointer"
                >
                  <option value="Job">Job</option>
                  <option value="Result">Result</option>
                  <option value="Admit Card">Admit Card</option>
                  <option value="Exam Date">Exam Date</option>
                  <option value="Admission">Admission</option>
                  <option value="Answer Key">Answer Key</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                  Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organization"
                  required
                  value={form.organization}
                  onChange={handleChange}
                  placeholder="e.g. UPSC, SSC"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-bold text-gray-700 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Advanced Attributes Grid (Vacancies, Salary, Location) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                  Total Vacancies
                </label>
                <input
                  type="number"
                  name="vacancies"
                  value={form.vacancies}
                  onChange={handleChange}
                  placeholder="e.g. 1250"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                  Salary scale
                </label>
                <input
                  type="text"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="e.g. ₹56,100 - ₹1,77,500"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                  Job Location / State
                </label>
                <input
                  type="text"
                  name="jobLocation"
                  value={form.jobLocation}
                  onChange={handleChange}
                  placeholder="e.g. Central Govt, Uttar Pradesh"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Qualifications Checklist */}
            <div className="border-t border-gray-100 pt-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                Eligible Qualifications
              </label>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-700">
                {qualificationsList.map((qual) => {
                  const isChecked = form.qualification.includes(qual);
                  return (
                    <label key={qual} className="flex items-center gap-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 px-3 py-2 border border-gray-200 rounded-xl select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(qual)}
                        className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                      <span>{qual}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Description & Eligibility */}
            <div className="border-t border-gray-100 pt-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                Description / Details <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe details, selection process, post structures..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                Eligibility Criteria <span className="text-red-500">*</span>
              </label>
              <textarea
                name="eligibility"
                required
                rows={3}
                value={form.eligibility}
                onChange={handleChange}
                placeholder="e.g. Bachelor's Degree in any discipline from a recognized university..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                Application Fee
              </label>
              <input
                type="text"
                name="applicationFee"
                value={form.applicationFee}
                onChange={handleChange}
                placeholder="e.g. General / OBC: ₹100 | SC / ST: Nil"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* 5. Date Pickers Grid */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider mb-4">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Notification Release Date
                  </label>
                  <input
                    type="date"
                    name="notificationDate"
                    value={form.notificationDate}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Application Start Date
                  </label>
                  <input
                    type="date"
                    name="applicationStartDate"
                    value={form.applicationStartDate}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Application Closing (Last Date)
                  </label>
                  <input
                    type="date"
                    name="applicationLastDate"
                    value={form.applicationLastDate}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    name="examDate"
                    value={form.examDate}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 cursor-pointer"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Result Announcement Date
                  </label>
                  <input
                    type="date"
                    name="resultDate"
                    value={form.resultDate}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 6. Link Paths */}
            <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                  Official Apply Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="officialLink"
                  required
                  value={form.officialLink}
                  onChange={handleChange}
                  placeholder="https://example.gov.in/apply"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                  Detailed PDF Brochure Link
                </label>
                <input
                  type="url"
                  name="pdfLink"
                  value={form.pdfLink}
                  onChange={handleChange}
                  placeholder="https://example.gov.in/notification.pdf"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Submit Action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-colors shadow-md uppercase tracking-wider flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Announcement'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
