import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/Navbar/AdminSidebar';
import api from '../../config/server';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CourseDetailsModal from '../../components/CouseDetail/CourseDetailsModal';
import Modal, { ModalHeader } from '../../components/UI/Modal';
import { TableSkeleton } from '../../components/UI/Feedback';
import { useUI } from '../../context/UIContext';
import { courseThumb, formatPrice, initialOf } from '../../utils/format';

// Brand-aligned categorical palette (blue, navy, emerald, amber, violet, rose)
const COLORS = ['#2563EB', '#0F172A', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E'];
const PAGE_SIZE = 10;

const TITLES = {
    dashboard: 'Admin Dashboard',
    courses: 'Manage Courses',
    users: 'Manage Users',
    categories: 'Course Categories',
    enrollments: 'Platform Enrollments',
    messages: 'Contact Messages',
    instructors: 'Instructor Requests',
};

const INSTRUCTOR_STATUS = {
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
};
const statusOf = (u) => u.instructorStatus || 'pending';

const Badge = ({ className, children }) => (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold capitalize ${className}`}>{children}</span>
);

const InfoTile = ({ label, children }) => (
    <div className="bg-gray-50 p-4 rounded-xl">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        {children}
    </div>
);

/** Search box + table card + pagination, shared by every list section. */
const DataCard = ({ search, onSearch, placeholder, extra, page, setPage, total, children }) => {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                    <input
                        type="search"
                        aria-label={placeholder}
                        placeholder={placeholder}
                        value={search}
                        onChange={(e) => { onSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    {extra}
                    <span className="text-sm text-gray-500 whitespace-nowrap">{total} result{total === 1 ? '' : 's'}</span>
                </div>
            </div>
            <div className="overflow-x-auto">{children}</div>
            {pages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition">
                        <i className="fas fa-chevron-left mr-2" aria-hidden="true"></i>Prev
                    </button>
                    <span className="text-gray-500">Page {page} of {pages}</span>
                    <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition">
                        Next<i className="fas fa-chevron-right ml-2" aria-hidden="true"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

const EmptyRow = ({ cols, children }) => (
    <tr><td colSpan={cols} className="p-10 text-center text-gray-400">{children}</td></tr>
);

const IconButton = ({ icon, label, onClick, className = 'text-red-500 hover:bg-red-50' }) => (
    <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        aria-label={label}
        title={label}
        className={`w-9 h-9 rounded-lg transition ${className}`}
    >
        <i className={`fas ${icon}`} aria-hidden="true"></i>
    </button>
);

const StatCard = ({ label, value, icon, tone, loading }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            {loading
                ? <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mt-1"></div>
                : <h3 className="text-2xl font-bold text-navy-900">{value}</h3>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${tone}`}>
            <i className={`fas ${icon}`} aria-hidden="true"></i>
        </div>
    </div>
);

const ChartEmpty = ({ message }) => (
    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
        <i className="fas fa-chart-pie text-3xl mb-2" aria-hidden="true"></i>
        <p className="text-sm">{message}</p>
    </div>
);

const matches = (q, ...fields) => !q || fields.some(f => (f || '').toString().toLowerCase().includes(q.toLowerCase()));

const AdminDashboard = () => {
    const { toast, confirm } = useUI();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [stats, setStats] = useState({ users: 0, courses: 0, revenue: 0, enrollments: 0, enrollmentTrend: [], categoryDistribution: [] });
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [replyModal, setReplyModal] = useState({ show: false, messageId: null, replySubject: '', replyBody: '' });
    const [sendingReply, setSendingReply] = useState(false);
    const [viewMessage, setViewMessage] = useState(null);
    const [viewEnrollment, setViewEnrollment] = useState(null);
    const [viewInstructor, setViewInstructor] = useState(null);
    const [viewCourseDetails, setViewCourseDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Per-section search, filter and page
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setSearch('');
        setFilter('all');
        setPage(1);
    }, [activeSection]);

    const fetchData = async () => {
        try {
            const [usersRes, coursesRes, statsRes, categoriesRes, enrollmentsRes, messagesRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/courses'),
                api.get('/admin/stats'),
                api.get('/admin/categories'),
                api.get('/admin/enrollments'),
                api.get('/admin/messages')
            ]);
            setUsers(usersRes.data.data || []);
            setCourses(coursesRes.data.data || []);
            setCategories(categoriesRes.data.data || []);
            setStats({ enrollmentTrend: [], categoryDistribution: [], ...(statsRes.data.data || {}) });
            setEnrollments(enrollmentsRes.data.data || []);
            setMessages(messagesRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
            toast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const instructors = useMemo(() => {
        const order = { pending: 0, rejected: 1, approved: 2 };
        return users.filter(u => u.role === 'instructor').sort((a, b) => order[statusOf(a)] - order[statusOf(b)]);
    }, [users]);
    const pendingCount = instructors.filter(u => statusOf(u) === 'pending').length;
    const unreadCount = messages.filter(m => m.status !== 'Replied').length;

    // --- Actions ---
    const handleToggleStatus = async (course) => {
        const newStatus = course.status === 'Published' ? 'Draft' : 'Published';
        try {
            await api.patch(`/admin/courses/${course._id}/status`, { status: newStatus });
            toast(`"${course.title}" is now ${newStatus.toLowerCase()}`);
            fetchData();
        } catch {
            toast('Failed to update status', 'error');
        }
    };

    const handleDeleteCourse = async (course) => {
        if (!await confirm({ title: 'Delete this course?', message: `"${course.title}" will be permanently removed for all students.`, confirmText: 'Delete', danger: true })) return;
        try {
            await api.delete(`/admin/courses/${course._id}`);
            toast('Course deleted successfully');
            fetchData();
        } catch {
            toast('Failed to delete course', 'error');
        }
    };

    const handleDeleteUser = async (user) => {
        if (!await confirm({ title: 'Delete this user?', message: `${user.name} (${user.email}) will be permanently removed.`, confirmText: 'Delete', danger: true })) return;
        try {
            await api.delete(`/admin/users/${user._id}`);
            toast('User deleted successfully');
            fetchData();
        } catch {
            toast('Failed to delete user', 'error');
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return;
        try {
            await api.post('/admin/categories', newCategory);
            toast('Category added successfully');
            setNewCategory({ name: '', description: '' });
            fetchData();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to add category', 'error');
        }
    };

    const handleDeleteCategory = async (cat) => {
        if (!await confirm({ title: 'Delete this category?', message: `"${cat.name}" will be removed. Existing courses keep their category label.`, confirmText: 'Delete', danger: true })) return;
        try {
            await api.delete(`/admin/categories/${cat._id}`);
            toast('Category deleted');
            fetchData();
        } catch {
            toast('Failed to delete category', 'error');
        }
    };

    const setInstructorStatus = async (user, status) => {
        const copy = {
            approved: { done: statusOf(user) === 'rejected' ? 'Instructor unblocked' : 'Instructor approved' },
            rejected: statusOf(user) === 'pending'
                ? { title: 'Reject this application?', message: `${user.name} will not be able to publish courses.`, confirmText: 'Reject', done: 'Application rejected' }
                : { title: 'Block this instructor?', message: `${user.name} will no longer be able to manage courses.`, confirmText: 'Block', done: 'Instructor blocked' },
        }[status];
        if (copy.title && !await confirm({ ...copy, danger: true })) return;
        try {
            await api.patch(`/admin/users/${user._id}/instructor-status`, { status });
            toast(copy.done);
            setViewInstructor(null);
            fetchData();
        } catch {
            toast('Failed to update instructor status', 'error');
        }
    };

    const openReplyModal = (msg) => {
        setReplyModal({
            show: true,
            messageId: msg._id,
            replySubject: `Re: ${msg.subject}`,
            replyBody: `Dear ${msg.name},\n\nThank you for contacting us.\n\n`
        });
    };

    const closeReplyModal = () => setReplyModal({ show: false, messageId: null, replySubject: '', replyBody: '' });

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyModal.replyBody.trim()) return;
        setSendingReply(true);
        try {
            await api.post('/admin/messages/reply', {
                messageId: replyModal.messageId,
                replySubject: replyModal.replySubject,
                replyBody: replyModal.replyBody
            });
            toast('Reply sent successfully');
            closeReplyModal();
            fetchData();
        } catch {
            toast('Failed to send reply', 'error');
        } finally {
            setSendingReply(false);
        }
    };

    // --- Filtered + paginated rows for the active section ---
    const paginate = (rows) => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const filteredCourses = courses.filter(c =>
        matches(search, c.title, c.category, c.instructor?.name) && (filter === 'all' || (c.status || 'Draft') === filter));
    const filteredUsers = users.filter(u => matches(search, u.name, u.email) && (filter === 'all' || u.role === filter));
    const filteredCategories = categories.filter(c => matches(search, c.name, c.description));
    const filteredEnrollments = enrollments.filter(e => matches(search, e.studentName, e.studentEmail, e.courseTitle));
    const filteredMessages = messages.filter(m =>
        matches(search, m.name, m.email, m.subject) && (filter === 'all' || (filter === 'unread' ? m.status !== 'Replied' : m.status === 'Replied')));
    const filteredInstructors = instructors.filter(u => matches(search, u.name, u.email) && (filter === 'all' || statusOf(u) === filter));

    const filterSelect = (options) => (
        <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            aria-label="Filter"
            className="p-2 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
            {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
    );

    const thClass = 'p-4 sm:p-5';
    const tdClass = 'p-4 sm:p-5';

    return (
        <AdminLayout
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            badges={{ messages: unreadCount, instructors: pendingCount }}
        >
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">{TITLES[activeSection]}</h1>
            </header>

            {/* Dashboard */}
            {activeSection === 'dashboard' && (
                <div className="space-y-8 animate-fade-in">
                    {pendingCount > 0 && (
                        <button
                            onClick={() => setActiveSection('instructors')}
                            className="w-full text-left p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3 hover:bg-yellow-100 transition"
                        >
                            <i className="fas fa-user-clock text-yellow-600 text-xl" aria-hidden="true"></i>
                            <span className="flex-1 text-yellow-800 font-medium">
                                {pendingCount} instructor application{pendingCount === 1 ? '' : 's'} waiting for review
                            </span>
                            <i className="fas fa-arrow-right text-yellow-600" aria-hidden="true"></i>
                        </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total Users" value={Number(stats.users || 0).toLocaleString('en-IN')} icon="fa-users" tone="bg-blue-100 text-blue-600" loading={loading} />
                        <StatCard label="Total Courses" value={Number(stats.courses || 0).toLocaleString('en-IN')} icon="fa-book-open" tone="bg-purple-100 text-purple-600" loading={loading} />
                        <StatCard label="Active Enrollments" value={Number(stats.enrollments || 0).toLocaleString('en-IN')} icon="fa-graduation-cap" tone="bg-amber-100 text-amber-600" loading={loading} />
                        <StatCard label="Total Revenue" value={`₹${Number(stats.revenue || 0).toLocaleString('en-IN')}`} icon="fa-indian-rupee-sign" tone="bg-green-100 text-green-600" loading={loading} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-navy-900 mb-6">Enrollment Trends (Last 6 Months)</h3>
                            <div className="h-[300px] w-full">
                                {!loading && !stats.enrollmentTrend.some(d => d.enrollments > 0) ? (
                                    <ChartEmpty message="No enrollments in the last 6 months." />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.enrollmentTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#6B7280' }} />
                                            <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#6B7280' }} allowDecimals={false} />
                                            <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                            <Bar dataKey="enrollments" name="Enrollments" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-navy-900 mb-6">Course Distribution by Category</h3>
                            <div className="h-[300px] w-full">
                                {!loading && !stats.categoryDistribution.length ? (
                                    <ChartEmpty message="No courses to categorise yet." />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={stats.categoryDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" stroke="#fff" strokeWidth={2}>
                                                {stats.categoryDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Courses */}
            {activeSection === 'courses' && (
                <DataCard search={search} onSearch={setSearch} placeholder="Search title, category or instructor" page={page} setPage={setPage} total={filteredCourses.length}
                    extra={filterSelect([['all', 'All statuses'], ['Published', 'Published'], ['Draft', 'Draft'], ['Archived', 'Archived']])}>
                    <table className="w-full min-w-[760px]">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                <th className={thClass}>Course</th>
                                <th className={thClass}>Instructor</th>
                                <th className={thClass}>Price</th>
                                <th className={thClass}>Status</th>
                                <th className={`${thClass} text-right`}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? <TableSkeleton cols={5} /> : paginate(filteredCourses).map(course => (
                                <tr key={course._id} className="hover:bg-gray-50 cursor-pointer transition" onClick={() => setViewCourseDetails(course)}>
                                    <td className={tdClass}>
                                        <div className="flex items-center gap-3">
                                            <img src={courseThumb(course.thumbnail)} className="w-10 h-10 rounded object-cover bg-gray-200 shrink-0" alt="" />
                                            <div className="min-w-0">
                                                <p className="font-bold text-navy-900 line-clamp-1">{course.title}</p>
                                                <span className="text-xs text-gray-500">{course.category}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`${tdClass} text-sm`}>
                                        {course.instructor?.name || 'Unknown'}
                                        <span className="block text-xs text-gray-400">{course.instructor?.email}</span>
                                    </td>
                                    <td className={`${tdClass} font-bold`}>{formatPrice(course.price)}</td>
                                    <td className={tdClass}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(course); }}
                                            title={course.status === 'Published' ? 'Click to unpublish' : 'Click to publish'}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition ${course.status === 'Published'
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                                        >
                                            {course.status || 'Draft'} <i className="fas fa-sync-alt ml-1 text-[10px]" aria-hidden="true"></i>
                                        </button>
                                    </td>
                                    <td className={`${tdClass} text-right`}>
                                        <IconButton icon="fa-trash" label={`Delete ${course.title}`} onClick={() => handleDeleteCourse(course)} />
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredCourses.length === 0 && <EmptyRow cols={5}>{search || filter !== 'all' ? 'No courses match your search.' : 'No courses yet.'}</EmptyRow>}
                        </tbody>
                    </table>
                </DataCard>
            )}

            {/* Users */}
            {activeSection === 'users' && (
                <DataCard search={search} onSearch={setSearch} placeholder="Search name or email" page={page} setPage={setPage} total={filteredUsers.length}
                    extra={filterSelect([['all', 'All roles'], ['user', 'Students'], ['instructor', 'Instructors'], ['admin', 'Admins']])}>
                    <table className="w-full min-w-[480px]">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                <th className={thClass}>User</th>
                                <th className={thClass}>Role</th>
                                <th className={`${thClass} text-right`}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? <TableSkeleton cols={3} /> : paginate(filteredUsers).map(user => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className={tdClass}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-bold text-sm shrink-0">{initialOf(user.name)}</div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-navy-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={tdClass}>
                                        <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'instructor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}>
                                            {user.role === 'user' ? 'student' : user.role}
                                        </Badge>
                                    </td>
                                    <td className={`${tdClass} text-right`}>
                                        {user.role !== 'admin' && <IconButton icon="fa-trash" label={`Delete ${user.name}`} onClick={() => handleDeleteUser(user)} />}
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredUsers.length === 0 && <EmptyRow cols={3}>No users match your search.</EmptyRow>}
                        </tbody>
                    </table>
                </DataCard>
            )}

            {/* Categories */}
            {activeSection === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-navy-900 mb-6">Add New Category</h3>
                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <div>
                                    <label htmlFor="cat-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        id="cat-name"
                                        type="text"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        placeholder="e.g. Web Development"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cat-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        id="cat-desc"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[100px]"
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                        placeholder="Short description..."
                                    />
                                </div>
                                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                                    Create Category
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <DataCard search={search} onSearch={setSearch} placeholder="Search categories" page={page} setPage={setPage} total={filteredCategories.length}>
                            <table className="w-full min-w-[480px]">
                                <thead className="bg-gray-50">
                                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                        <th className={thClass}>Category Name</th>
                                        <th className={thClass}>Slug</th>
                                        <th className={`${thClass} text-right`}>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? <TableSkeleton cols={3} /> : paginate(filteredCategories).map(cat => (
                                        <tr key={cat._id} className="hover:bg-gray-50">
                                            <td className={tdClass}>
                                                <p className="font-bold text-navy-900">{cat.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                                            </td>
                                            <td className={`${tdClass} text-sm font-mono text-gray-400`}>{cat.slug}</td>
                                            <td className={`${tdClass} text-right`}>
                                                <IconButton icon="fa-trash" label={`Delete ${cat.name}`} onClick={() => handleDeleteCategory(cat)} />
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && filteredCategories.length === 0 && <EmptyRow cols={3}>{search ? 'No categories match your search.' : 'No categories added yet.'}</EmptyRow>}
                                </tbody>
                            </table>
                        </DataCard>
                    </div>
                </div>
            )}

            {/* Enrollments */}
            {activeSection === 'enrollments' && (
                <DataCard search={search} onSearch={setSearch} placeholder="Search student or course" page={page} setPage={setPage} total={filteredEnrollments.length}>
                    <table className="w-full min-w-[560px]">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                <th className={thClass}>Student</th>
                                <th className={thClass}>Course</th>
                                <th className={thClass}>Date</th>
                                <th className={`${thClass} text-right`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? <TableSkeleton cols={4} /> : paginate(filteredEnrollments).map((enrollment, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className={tdClass}>
                                        <p className="font-bold text-navy-900">{enrollment.studentName}</p>
                                        <p className="text-xs text-gray-500">{enrollment.studentEmail}</p>
                                    </td>
                                    <td className={`${tdClass} font-medium text-navy-900`}>{enrollment.courseTitle}</td>
                                    <td className={`${tdClass} text-sm text-gray-500`}>{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : '—'}</td>
                                    <td className={`${tdClass} text-right`}>
                                        <button onClick={() => setViewEnrollment(enrollment)} className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-1 rounded transition">
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredEnrollments.length === 0 && <EmptyRow cols={4}>{search ? 'No enrollments match your search.' : 'No enrollments yet.'}</EmptyRow>}
                        </tbody>
                    </table>
                </DataCard>
            )}

            {/* Messages */}
            {activeSection === 'messages' && (
                <DataCard search={search} onSearch={setSearch} placeholder="Search name, email or subject" page={page} setPage={setPage} total={filteredMessages.length}
                    extra={filterSelect([['all', 'All messages'], ['unread', 'Awaiting reply'], ['replied', 'Replied']])}>
                    <table className="w-full min-w-[760px]">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                <th className={thClass}>From</th>
                                <th className={thClass}>Subject</th>
                                <th className={thClass}>Status</th>
                                <th className={thClass}>Date</th>
                                <th className={`${thClass} text-right`}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? <TableSkeleton cols={5} /> : paginate(filteredMessages).map((msg) => (
                                <tr key={msg._id} className={`hover:bg-gray-50 cursor-pointer ${msg.status !== 'Replied' ? 'bg-blue-50/30' : ''}`} onClick={() => setViewMessage(msg)}>
                                    <td className={tdClass}>
                                        <p className={`text-navy-900 ${msg.status !== 'Replied' ? 'font-extrabold' : 'font-bold'}`}>{msg.name}</p>
                                        <p className="text-xs text-gray-500">{msg.email}</p>
                                    </td>
                                    <td className={tdClass}>
                                        <p className="font-medium text-navy-900">{msg.subject}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{msg.message}</p>
                                    </td>
                                    <td className={tdClass}>
                                        <Badge className={msg.status === 'Replied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{msg.status || 'New'}</Badge>
                                    </td>
                                    <td className={`${tdClass} text-sm text-gray-500`}>{new Date(msg.createdAt).toLocaleDateString()}</td>
                                    <td className={`${tdClass} text-right whitespace-nowrap`}>
                                        <IconButton icon="fa-eye" label="View message" className="text-gray-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => setViewMessage(msg)} />
                                        {msg.status !== 'Replied' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openReplyModal(msg); }}
                                                className="ml-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                                            >
                                                Reply
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredMessages.length === 0 && <EmptyRow cols={5}>{search || filter !== 'all' ? 'No messages match your search.' : 'No messages yet.'}</EmptyRow>}
                        </tbody>
                    </table>
                </DataCard>
            )}

            {/* Instructor requests: pending first, approve/reject as primary actions */}
            {activeSection === 'instructors' && (
                <DataCard search={search} onSearch={setSearch} placeholder="Search name or email" page={page} setPage={setPage} total={filteredInstructors.length}
                    extra={filterSelect([['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']])}>
                    <table className="w-full min-w-[720px]">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                                <th className={thClass}>Instructor</th>
                                <th className={thClass}>Status</th>
                                <th className={thClass}>Details</th>
                                <th className={`${thClass} text-right`}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? <TableSkeleton cols={4} /> : paginate(filteredInstructors).map(user => {
                                const status = statusOf(user);
                                return (
                                    <tr key={user._id} className={`hover:bg-gray-50 ${status === 'pending' ? 'bg-yellow-50/40' : ''}`}>
                                        <td className={tdClass}>
                                            <p className="font-bold text-navy-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </td>
                                        <td className={tdClass}><Badge className={INSTRUCTOR_STATUS[status]}>{status}</Badge></td>
                                        <td className={tdClass}>
                                            <button onClick={() => setViewInstructor(user)} className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-1 rounded transition">
                                                View Profile
                                            </button>
                                        </td>
                                        <td className={`${tdClass} text-right whitespace-nowrap space-x-2`}>
                                            {status === 'pending' && (
                                                <>
                                                    <button onClick={() => setInstructorStatus(user, 'rejected')} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition">Reject</button>
                                                    <button onClick={() => setInstructorStatus(user, 'approved')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition">Approve</button>
                                                </>
                                            )}
                                            {status === 'approved' && (
                                                <button onClick={() => setInstructorStatus(user, 'rejected')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition">Block</button>
                                            )}
                                            {status === 'rejected' && (
                                                <button onClick={() => setInstructorStatus(user, 'approved')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 transition">Unblock</button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loading && filteredInstructors.length === 0 && <EmptyRow cols={4}>No instructor requests found.</EmptyRow>}
                        </tbody>
                    </table>
                </DataCard>
            )}

            {/* Instructor Details Modal */}
            {viewInstructor && (
                <Modal onClose={() => setViewInstructor(null)} label="Instructor profile">
                    <div className="p-5 sm:p-6">
                        <ModalHeader title="Instructor Profile" subtitle="Review details before approval" onClose={() => setViewInstructor(null)} />
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold shrink-0">
                                    {initialOf(viewInstructor.name)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl font-bold text-navy-900">{viewInstructor.name}</h3>
                                    <p className="text-gray-500 truncate">{viewInstructor.email}</p>
                                    <div className="mt-1"><Badge className={INSTRUCTOR_STATUS[statusOf(viewInstructor)]}>{statusOf(viewInstructor)}</Badge></div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Headline</h4>
                                <p className="text-navy-900 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">{viewInstructor.headline || 'No headline provided'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Bio</h4>
                                <p className="text-navy-900 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{viewInstructor.bio || 'No bio provided'}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[['Website', 'website', 'fas fa-globe'], ['LinkedIn', 'linkedin', 'fab fa-linkedin']].map(([label, key, icon]) => (
                                    <div key={key} className="min-w-0">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</h4>
                                        {viewInstructor[key] ? (
                                            <a href={viewInstructor[key]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2 break-all">
                                                <i className={icon} aria-hidden="true"></i> {viewInstructor[key]}
                                            </a>
                                        ) : <span className="text-gray-400 italic">Not provided</span>}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                                {statusOf(viewInstructor) === 'approved' && (
                                    <button onClick={() => setInstructorStatus(viewInstructor, 'rejected')} className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition">Block Instructor</button>
                                )}
                                {statusOf(viewInstructor) === 'pending' && (
                                    <>
                                        <button onClick={() => setInstructorStatus(viewInstructor, 'rejected')} className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition">Reject</button>
                                        <button onClick={() => setInstructorStatus(viewInstructor, 'approved')} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200">Approve Instructor</button>
                                    </>
                                )}
                                {statusOf(viewInstructor) === 'rejected' && (
                                    <button onClick={() => setInstructorStatus(viewInstructor, 'approved')} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200">Unblock Instructor</button>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Reply Modal */}
            {replyModal.show && (
                <Modal onClose={closeReplyModal} maxWidth="max-w-lg" label="Reply to message">
                    <form onSubmit={handleSendReply} className="p-5 sm:p-6">
                        <ModalHeader title="Reply to Message" onClose={closeReplyModal} />
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="reply-subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    id="reply-subject"
                                    type="text"
                                    required
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={replyModal.replySubject}
                                    onChange={(e) => setReplyModal({ ...replyModal, replySubject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="reply-body" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    id="reply-body"
                                    required
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                                    value={replyModal.replyBody}
                                    onChange={(e) => setReplyModal({ ...replyModal, replyBody: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeReplyModal} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition">Cancel</button>
                                <button type="submit" disabled={sendingReply} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2">
                                    {sendingReply && <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>} Send Reply
                                </button>
                            </div>
                        </div>
                    </form>
                </Modal>
            )}

            {/* View Message Modal */}
            {viewMessage && (
                <Modal onClose={() => setViewMessage(null)} label="Message details">
                    <div className="p-5 sm:p-6">
                        <ModalHeader title="Message Details" subtitle="View full message content" onClose={() => setViewMessage(null)} />
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoTile label="From">
                                    <p className="font-bold text-navy-900 text-lg">{viewMessage.name}</p>
                                    <a href={`mailto:${viewMessage.email}`} className="text-sm text-blue-600 hover:underline break-all">{viewMessage.email}</a>
                                </InfoTile>
                                <InfoTile label="Date Sent">
                                    <p className="font-medium text-navy-900">{new Date(viewMessage.createdAt).toLocaleString()}</p>
                                    <div className="mt-2"><Badge className={viewMessage.status === 'Replied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{viewMessage.status || 'New'}</Badge></div>
                                </InfoTile>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</p>
                                <h3 className="text-xl font-bold text-navy-900 border-l-4 border-blue-500 pl-4">{viewMessage.subject}</h3>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</p>
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-gray-700 whitespace-pre-wrap leading-relaxed">{viewMessage.message}</div>
                            </div>
                            {viewMessage.status === 'Replied' && viewMessage.reply && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        <i className="fas fa-reply text-blue-500 mr-2" aria-hidden="true"></i>
                                        Replied on {new Date(viewMessage.reply.repliedAt).toLocaleDateString()}
                                    </p>
                                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-gray-700">
                                        <p className="font-bold text-navy-900 mb-2">Subject: {viewMessage.reply.subject}</p>
                                        <div className="whitespace-pre-wrap leading-relaxed text-sm">{viewMessage.reply.body}</div>
                                    </div>
                                </div>
                            )}
                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <button onClick={() => setViewMessage(null)} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">Close</button>
                                {viewMessage.status !== 'Replied' && (
                                    <button
                                        onClick={() => { openReplyModal(viewMessage); setViewMessage(null); }}
                                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center"
                                    >
                                        <i className="fas fa-reply mr-2" aria-hidden="true"></i> Reply Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* View Enrollment Modal */}
            {viewEnrollment && (
                <Modal onClose={() => setViewEnrollment(null)} maxWidth="max-w-lg" label="Enrollment details">
                    <div className="p-5 sm:p-6">
                        <ModalHeader title="Enrollment Details" subtitle="Full enrollment information" onClose={() => setViewEnrollment(null)} />
                        <div className="space-y-4">
                            <InfoTile label="Student">
                                <p className="font-bold text-navy-900 text-lg">{viewEnrollment.studentName}</p>
                                <p className="text-sm text-gray-500 break-all">{viewEnrollment.studentEmail}</p>
                            </InfoTile>
                            <InfoTile label="Course">
                                <p className="font-bold text-navy-900 text-lg">{viewEnrollment.courseTitle}</p>
                            </InfoTile>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoTile label="Date">
                                    <p className="font-bold text-navy-900">{viewEnrollment.enrolledAt ? new Date(viewEnrollment.enrolledAt).toLocaleDateString() : 'N/A'}</p>
                                </InfoTile>
                                <InfoTile label="Status">
                                    <Badge className="bg-green-100 text-green-700 uppercase">{viewEnrollment.status || 'Active'}</Badge>
                                </InfoTile>
                            </div>
                            <InfoTile label="Payment ID">
                                <p className="font-mono text-sm text-gray-600 break-all">{viewEnrollment.paymentId || 'N/A (free course)'}</p>
                            </InfoTile>
                            <div className="pt-2 flex justify-end">
                                <button onClick={() => setViewEnrollment(null)} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">Close</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            <CourseDetailsModal course={viewCourseDetails} onClose={() => setViewCourseDetails(null)} />
        </AdminLayout>
    );
};

export default AdminDashboard;
